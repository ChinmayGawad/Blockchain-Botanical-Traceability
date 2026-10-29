package com.florachain.backend.security;

import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String VALID_SECRET = "unit-test-signing-key-0123456789-abcdef";

    @Test
    @DisplayName("Should derive a signing key from a strong secret")
    void testResolveSigningKeyWithStrongSecret() {
        SecretKey key = JwtTokenProvider.resolveSigningKey(VALID_SECRET, "test");

        assertNotNull(key);
        assertEquals("HmacSHA256", key.getAlgorithm());
        assertTrue(key.getEncoded().length >= 32);
    }

    @Test
    @DisplayName("Should accept a base64 encoded secret")
    void testResolveSigningKeyWithBase64Secret() {
        String base64Secret = java.util.Base64.getEncoder()
                .encodeToString("unit-test-signing-key-0123456789-abcdef".getBytes(StandardCharsets.UTF_8));

        SecretKey key = JwtTokenProvider.resolveSigningKey(base64Secret, "test");

        assertTrue(key.getEncoded().length >= 32);
    }

    @Test
    @DisplayName("Should reject a secret that does not provide 256 bit of strength")
    void testRejectWeakSecret() {
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> JwtTokenProvider.resolveSigningKey("too-short-secret", "test"));

        assertTrue(exception.getMessage().contains("256 bit"));
    }

    @Test
    @DisplayName("Should fail fast in production when no secret is configured")
    void testProductionRequiresSecret() {
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> JwtTokenProvider.resolveSigningKey("", "prod"));

        assertTrue(exception.getMessage().contains("JWT_SECRET"));
    }

    @Test
    @DisplayName("Should fail fast in production when the published placeholder secret is used")
    void testProductionRejectsPublishedSecret() {
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> JwtTokenProvider.resolveSigningKey(
                        "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970", "prod"));

        assertTrue(exception.getMessage().contains("published"));
    }

    @Test
    @DisplayName("Should generate an ephemeral key for non production profiles")
    void testDevelopmentFallsBackToEphemeralKey() {
        SecretKey key = JwtTokenProvider.resolveSigningKey("", "dev");

        assertNotNull(key);
        assertTrue(key.getEncoded().length >= 32);
    }

    @Test
    @DisplayName("Should issue a token that validates successfully")
    void testTokenRoundTrip() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, 60000, "test");

        String token = provider.generateTokenFromUser("USR-FRM-01", "rajesh@vedicfarms.org", "Rajesh Patel", "FARMER", "Vedic Agro");

        assertTrue(provider.validateToken(token));
        assertEquals("USR-FRM-01", provider.getUserIdFromJWT(token));
    }

    @Test
    @DisplayName("Should reject a token whose signature was tampered with")
    void testTamperedTokenIsRejected() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, 60000, "test");
        String token = provider.generateTokenFromUser("USR-ADM-01", "admin@florachain.org", "Admin", "ADMIN", "Authority");

        String tampered = token.substring(0, token.length() - 3) + "AAA";

        assertFalse(provider.validateToken(tampered));
    }

    @Test
    @DisplayName("Should reject a token signed with a different key")
    void testForeignSignatureIsRejected() {
        JwtTokenProvider issuer = new JwtTokenProvider(VALID_SECRET, 60000, "test");
        JwtTokenProvider other = new JwtTokenProvider("a-completely-different-signing-key-9876543210", 60000, "test");

        String token = issuer.generateTokenFromUser("USR-ADM-01", "admin@florachain.org", "Admin", "ADMIN", "Authority");

        assertFalse(other.validateToken(token));
    }

    @Test
    @DisplayName("Should reject an expired token")
    void testExpiredTokenIsRejected() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, -1000, "test");

        String token = provider.generateTokenFromUser("USR-FRM-01", "rajesh@vedicfarms.org", "Rajesh Patel", "FARMER", "Vedic Agro");

        assertFalse(provider.validateToken(token));
    }

    @Test
    @DisplayName("Should reject a garbage token without throwing")
    void testGarbageTokenIsRejected() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, 60000, "test");

        assertFalse(provider.validateToken("not-a-token"));
        assertFalse(provider.validateToken(""));
    }

    @Test
    @DisplayName("Should reject an unsigned token")
    void testUnsignedTokenIsRejected() {
        JwtTokenProvider provider = new JwtTokenProvider(VALID_SECRET, 60000, "test");

        String unsignedToken = Jwts.builder()
                .subject("USR-ADM-01")
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .compact();

        assertFalse(provider.validateToken(unsignedToken));
    }
}
