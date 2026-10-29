package com.florachain.backend.observability;

/**
 * Keys used to enrich the SLF4J {@link org.slf4j.MDC} with request scoped
 * context. They are rendered by {@code logback-spring.xml} so every log line can
 * be correlated with the request that produced it.
 */
public final class MdcKeys {

    public static final String REQUEST_ID = "requestId";
    public static final String USER_ID = "userId";
    public static final String ROLE = "role";
    public static final String METHOD = "method";
    public static final String PATH = "path";
    public static final String CLIENT_IP = "clientIp";
    public static final String STATUS = "status";

    private MdcKeys() {
    }
}
