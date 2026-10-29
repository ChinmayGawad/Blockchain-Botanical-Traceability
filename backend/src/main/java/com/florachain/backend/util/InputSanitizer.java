package com.florachain.backend.util;

import com.florachain.backend.exception.BadRequestException;
import org.springframework.lang.Nullable;

import java.util.regex.Pattern;

/**
 * Central helpers for normalising and validating user supplied text before it is
 * persisted. Controllers rely on bean validation for structure; this utility adds
 * the second layer of defence against control characters, over-long values and
 * whitespace tricks that would otherwise reach the database and the UI.
 */
public final class InputSanitizer {

    /** Control characters and zero-width characters that must never reach persistence. */
    private static final Pattern ANY_CONTROL = Pattern.compile("[\\p{Cc}\\p{Cf}]");
    private static final Pattern WHITESPACE_RUN = Pattern.compile("\\s+");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private InputSanitizer() {
    }

    /**
     * Trims the value, removes control characters and collapses whitespace runs.
     *
     * @param value      raw input, may be {@code null}
     * @param maxLength  maximum accepted length (values are truncated, never rejected)
     * @return the sanitized value or {@code null} when the input was {@code null}
     */
    @Nullable
    public static String sanitize(@Nullable String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String cleaned = ANY_CONTROL.matcher(value).replaceAll(" ");
        cleaned = WHITESPACE_RUN.matcher(cleaned).replaceAll(" ").trim();
        if (cleaned.length() > maxLength) {
            cleaned = cleaned.substring(0, maxLength).trim();
        }
        return cleaned;
    }

    /**
     * Same as {@link #sanitize(String, int)} but rejects blank input.
     *
     * @throws BadRequestException when the sanitized value is empty
     */
    public static String requireText(@Nullable String value, int maxLength, String fieldLabel) {
        String sanitized = sanitize(value, maxLength);
        if (sanitized == null || sanitized.isEmpty()) {
            throw new BadRequestException(fieldLabel + " is required");
        }
        return sanitized;
    }

    /**
     * Normalizes an email address (trim + lowercase) and validates its shape.
     *
     * @throws BadRequestException when the address is blank or malformed
     */
    public static String requireEmail(@Nullable String email) {
        String sanitized = sanitize(email, 128);
        if (sanitized == null || sanitized.isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        String normalized = sanitized.toLowerCase();
        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new BadRequestException("Invalid email format: " + sanitized);
        }
        return normalized;
    }
}
