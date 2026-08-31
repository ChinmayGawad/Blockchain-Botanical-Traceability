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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class VerificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should successfully verify pre-seeded Ashwagandha batch with 100% Trust Seal")
    void testVerifyValidProduct() throws Exception {
        mockMvc.perform(get("/api/verify/BOT-2024-8901"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.product.id").value("BOT-2024-8901"))
                .andExpect(jsonPath("$.product.batchId").value("ASH-2024-089"))
                .andExpect(jsonPath("$.product.name").isNotEmpty())
                .andExpect(jsonPath("$.verificationState").value("VERIFIED"))
                .andExpect(jsonPath("$.trustScore").value(100));
    }

    @Test
    @DisplayName("Should return 200 and NOT_FOUND state for unknown product id")
    void testVerifyNonExistentProduct() throws Exception {
        mockMvc.perform(get("/api/verify/NON-EXISTENT-ID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationState").value("NOT_FOUND"));
    }
}
