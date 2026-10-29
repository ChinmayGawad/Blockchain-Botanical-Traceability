package com.florachain.backend.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Populates the logging {@link MDC} with request scoped metadata so that every
 * log statement emitted while handling a request can be correlated with it.
 *
 * <p>The correlation id is taken from the inbound {@code X-Request-Id} header
 * when present (so that calls across services can be traced) and generated
 * otherwise. It is echoed back to the caller in the response headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestCorrelationFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String requestId = resolveRequestId(request);
        long start = System.currentTimeMillis();

        MDC.put(MdcKeys.REQUEST_ID, requestId);
        MDC.put(MdcKeys.METHOD, request.getMethod());
        MDC.put(MdcKeys.PATH, request.getRequestURI());
        MDC.put(MdcKeys.CLIENT_IP, clientIp(request));
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.put(MdcKeys.STATUS, String.valueOf(response.getStatus()));
            long durationMs = System.currentTimeMillis() - start;
            org.slf4j.LoggerFactory.getLogger(RequestCorrelationFilter.class)
                    .debug("request completed method={} path={} status={} durationMs={}",
                            request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
            MDC.clear();
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        if (incoming != null && !incoming.isBlank() && incoming.length() <= 128) {
            return incoming.trim();
        }
        return UUID.randomUUID().toString();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
