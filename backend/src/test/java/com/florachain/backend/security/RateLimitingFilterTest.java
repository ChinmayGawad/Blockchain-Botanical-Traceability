package com.florachain.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.florachain.backend.dto.AuthDTOs.LoginRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that the authentication endpoints are protected against credential
 * brute-forcing by the sliding window rate limiter.
 */
@SpringBootTest(properties = {
        "app.security.rate-limit.auth-requests-per-minute=3",
        "app.security.rate-limit.general-requests-per-minute=1000"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RateLimitingFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should block authentication attempts once the per-minute budget is exhausted")
    void testAuthEndpointsAreRateLimited() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rajesh@vedicfarms.org");
        loginRequest.setPassword("wrong-password");
        String body = objectMapper.writeValueAsString(loginRequest);

        for (int attempt = 1; attempt <= 3; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", "198.51.100.7")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "198.51.100.7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("Should report the remaining budget in the rate limit headers")
    void testRateLimitHeaders() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "203.0.113.9")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("X-RateLimit-Limit", "3"))
                .andExpect(header().exists("X-RateLimit-Remaining"));
    }
}
