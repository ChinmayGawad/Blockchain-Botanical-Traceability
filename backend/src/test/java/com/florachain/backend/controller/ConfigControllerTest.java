package com.florachain.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.mapbox.access-token=pk.mock_test_mapbox_token_for_ci")
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should retrieve public configuration including Mapbox token safely without authentication")
    void testGetPublicConfig() throws Exception {
        mockMvc.perform(get("/api/config/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mapboxAccessToken").isNotEmpty())
                .andExpect(jsonPath("$.mapboxAccessToken").value(org.hamcrest.Matchers.startsWith("pk.")))
                .andExpect(jsonPath("$.contractAddress").isNotEmpty())
                .andExpect(jsonPath("$.networkName").isNotEmpty())
                // Ensure no secrets are leaked in JSON payload
                .andExpect(jsonPath("$.privateKey").doesNotExist())
                .andExpect(jsonPath("$.jwtSecret").doesNotExist())
                .andExpect(jsonPath("$.pinataSecretKey").doesNotExist());
    }

    @Test
    @DisplayName("Should retrieve Mapbox token directly from /api/config/mapbox")
    void testGetMapboxTokenEndpoint() throws Exception {
        mockMvc.perform(get("/api/config/mapbox"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.token").value(org.hamcrest.Matchers.startsWith("pk.")));
    }
}
