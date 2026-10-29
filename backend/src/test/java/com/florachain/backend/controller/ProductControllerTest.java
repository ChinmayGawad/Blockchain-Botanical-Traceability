package com.florachain.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.florachain.backend.dto.ProductDTOs.ProductRegistrationRequest;
import com.florachain.backend.security.JwtTokenProvider;
import com.florachain.backend.support.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    @DisplayName("Should expose the batch catalogue to anonymous consumers")
    void testGetProductsIsPublic() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should return a single batch by identifier")
    void testGetProductById() throws Exception {
        mockMvc.perform(get("/api/products/" + TestFixtures.RETAIL_READY_BATCH_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batchId").value("ASH-2024-089"));
    }

    @Test
    @DisplayName("Should return 404 for an unknown batch")
    void testGetUnknownProduct() throws Exception {
        mockMvc.perform(get("/api/products/BOT-DOES-NOT-EXIST"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should protect the registration endpoint from anonymous callers")
    void testRegisterRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("ANON")))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should forbid processors from registering a harvest batch")
    void testRegisterRejectsProcessorRole() throws Exception {
        String token = tokenFor("USR-PRC-01", TestFixtures.PROCESSOR_EMAIL, "Mahesh Deshmukh", "PROCESSOR", "PhytoExtracts");

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("PROC")))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should let a farmer register a harvest batch")
    void testRegisterAllowsFarmerRole() throws Exception {
        String token = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro");

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("FARM")))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.qrCodeValue").isNotEmpty());
    }

    @Test
    @DisplayName("Should reject an incomplete registration payload with 400")
    void testRegisterValidationFails() throws Exception {
        String token = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro");
        ProductRegistrationRequest request = new ProductRegistrationRequest();
        request.setBatchId("");

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("Should return the provenance timeline of a batch")
    void testGetProductTimeline() throws Exception {
        mockMvc.perform(get("/api/products/" + TestFixtures.RETAIL_READY_BATCH_ID + "/timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].stage").value("FARM_HARVEST"));
    }

    private String tokenFor(String id, String email, String name, String role, String organization) {
        return tokenProvider.generateTokenFromUser(id, email, name, role, organization);
    }
}
