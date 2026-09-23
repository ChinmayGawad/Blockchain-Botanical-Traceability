package com.florachain.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Production Sliding Window Rate Limiting Filter.
 * Protects authentication endpoints from credential brute-forcing
 * and limits abuse across sensitive API routes.
 */
@Slf4j
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT_PER_MINUTE = 15;
    private static final int GENERAL_LIMIT_PER_MINUTE = 180;
    private static final long WINDOW_MS = 60_000L;

    private static class RequestCounter {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long windowStart = System.currentTimeMillis();

        synchronized int incrementAndGet(long now) {
            if (now - windowStart > WINDOW_MS) {
                count.set(0);
                windowStart = now;
            }
            return count.incrementAndGet();
        }

        long getSecondsUntilReset(long now) {
            long elapsed = now - windowStart;
            return Math.max(1, (WINDOW_MS - elapsed) / 1000);
        }
    }

    private final Map<String, RequestCounter> ipCounters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip rate limiting for static assets, h2-console or actuator health checks
        if (path.startsWith("/actuator") || path.startsWith("/h2-console") || path.startsWith("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        boolean isAuthEndpoint = path.startsWith("/api/auth");
        int maxLimit = isAuthEndpoint ? AUTH_LIMIT_PER_MINUTE : GENERAL_LIMIT_PER_MINUTE;
        String cacheKey = clientIp + ":" + (isAuthEndpoint ? "AUTH" : "GEN");

        long now = System.currentTimeMillis();
        RequestCounter counter = ipCounters.computeIfAbsent(cacheKey, k -> new RequestCounter());
        int currentCount = counter.incrementAndGet(now);

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxLimit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxLimit - currentCount)));

        if (currentCount > maxLimit) {
            long retryAfterSeconds = counter.getSecondsUntilReset(now);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please retry after %d seconds.\"}",
                    retryAfterSeconds
            ));
            log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }
}
