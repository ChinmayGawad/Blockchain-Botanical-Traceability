package com.florachain.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Root Controller responding to health pings and uptime probes at '/'
 * to prevent 401 Unauthorized log spam on cloud providers like Render.
 */
@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "service", "Blockchain Botanical Traceability API",
            "status", "UP",
            "timestamp", Instant.now().toString(),
            "health", "/actuator/health",
            "config", "/api/config/public"
        ));
    }
}
