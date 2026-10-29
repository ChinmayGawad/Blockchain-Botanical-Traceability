package com.florachain.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Issues and validates the HS256 JSON Web Tokens used by the API.
 *
 * <p>Security contract:
 * <ul>
 *   <li>The signing key is always at least 256 bits (32 bytes) long.</li>
 *   <li>Secrets come from the environment only - there is no hard-coded default.</li>
 *   <li>The {@code prod} profile refuses to boot without a strong {@code JWT_SECRET}
 *       (fail fast at startup instead of silently signing with a weak key).</li>
 *   <li>Non-production profiles fall back to a random, per-boot key so that no
 *       usable secret is ever committed to the repository.</li>
 * </ul>
 */
@Slf4j
@Component
public class JwtTokenProvider {

    /** Minimum key length in bytes (256 bit) required by HS256. */
    public static final int MIN_SECRET_BYTES = 32;

    /**
     * Secrets that were published in earlier revisions of this repository. They are
     * rejected everywhere so a leaked deployment key cannot silently keep working.
     */
    private static final List<String> COMPROMISED_SECRETS = List.of(
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
            "changeme",
            "change-me",
            "secret",
            "password",
            "florachain",
            "florachain-secret",
            "your-secret-key-here"
    );

    private final SecretKey key;
    private final long jwtExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs,
            @Value("${spring.profiles.active:dev}") String activeProfile) {
        this.key = resolveSigningKey(secret, activeProfile);
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Resolves the signing key from configuration and validates its strength.
     *
     * @throws IllegalStateException when the configured secret is missing or too weak
     *                               in the production profile.
     */
    static SecretKey resolveSigningKey(String configuredSecret, String activeProfile) {
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile);
        String secret = configuredSecret == null ? "" : configuredSecret.trim();

        if (secret.isEmpty()) {
            if (isProduction) {
                throw new IllegalStateException(
                        "CRITICAL SECURITY ERROR: JWT_SECRET is not configured. The production profile requires a "
                                + "high-entropy secret of at least " + MIN_SECRET_BYTES + " bytes (256 bit).");
            }
            byte[] randomKey = new byte[MIN_SECRET_BYTES];
            new SecureRandom().nextBytes(randomKey);
            log.warn("JWT_SECRET is not configured - generated an ephemeral {} bit signing key for the '{}' profile. "
                    + "All issued tokens become invalid on restart.", MIN_SECRET_BYTES * 8, activeProfile);
            return Keys.hmacShaKeyFor(randomKey);
        }

        byte[] keyBytes = decodeSecret(secret);
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "CRITICAL SECURITY ERROR: JWT_SECRET must provide at least " + MIN_SECRET_BYTES
                            + " bytes (256 bit) of signing strength, but only " + keyBytes.length + " bytes were supplied.");
        }
        if (isCompromisedSecret(secret)) {
            throw new IllegalStateException(
                    "CRITICAL SECURITY ERROR: the configured JWT_SECRET is a well-known placeholder that was previously "
                            + "published in this repository. Generate a unique secret before starting the application.");
        }
        if (isLowEntropySecret(secret)) {
            throw new IllegalStateException(
                    "CRITICAL SECURITY ERROR: JWT_SECRET does not contain enough entropy (repeated or trivial characters).");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Accepts either a base64 encoded secret or a raw passphrase and always returns
     * the raw key material used for HMAC signing.
     */
    private static byte[] decodeSecret(String secret) {
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            if (decoded.length >= MIN_SECRET_BYTES) {
                return decoded;
            }
        } catch (RuntimeException ignored) {
            // Not base64 - fall through to raw UTF-8 handling.
        }
        return secret.getBytes(StandardCharsets.UTF_8);
    }

    private static boolean isCompromisedSecret(String secret) {
        String normalized = secret.trim().toLowerCase(Locale.ROOT);
        return COMPROMISED_SECRETS.stream()
                .map(entry -> entry.toLowerCase(Locale.ROOT))
                .anyMatch(entry -> normalized.equals(entry) || (entry.length() >= 32 && normalized.contains(entry)));
    }

    private static boolean isLowEntropySecret(String secret) {
        String trimmed = secret.trim();
        if (trimmed.length() < MIN_SECRET_BYTES) {
            return true;
        }
        boolean allSame = trimmed.chars().distinct().count() <= 2;
        boolean sequential = trimmed.chars().allMatch(c -> c == 'a' || c == '0' || c == '1');
        return allSame || sequential;
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return buildToken(userPrincipal.getId(), userPrincipal.getEmail(), userPrincipal.getName(),
                userPrincipal.getRole().name(), userPrincipal.getOrganization());
    }

    public String generateTokenFromUser(String userId, String email, String name, String role, String organization) {
        return buildToken(userId, email, name, role, organization);
    }

    private String buildToken(String userId, String email, String name, String role, String organization) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("name", name)
                .claim("role", role)
                .claim("organization", organization)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token: {}", ex.getMessage());
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Rejected JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
