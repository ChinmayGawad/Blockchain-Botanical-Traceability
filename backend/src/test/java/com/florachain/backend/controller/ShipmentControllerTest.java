package com.florachain.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ShipmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    @DisplayName("Should list the known shipments for an authenticated distributor")
    void testGetAllShipments() throws Exception {
        String token = tokenFor("USR-DST-01", TestFixtures.DISTRIBUTOR_EMAIL, "Vikramjit Singh", "DISTRIBUTOR", "TransGlobal");

        mockMvc.perform(get("/api/shipments").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should protect the shipment list from anonymous callers")
    void testGetAllShipmentsRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/shipments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should protect shipment creation from anonymous callers")
    void testCreateShipmentRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/shipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should forbid laboratory accounts from creating shipments")
    void testCreateShipmentRejectsLaboratoryRole() throws Exception {
        String token = tokenFor("USR-LAB-01", TestFixtures.LAB_EMAIL, "Dr. Ananya Sharma", "LABORATORY", "Eurofins");

        mockMvc.perform(post("/api/shipments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should let a distributor dispatch an approved batch")
    void testCreateShipmentAllowsDistributorRole() throws Exception {
        String token = tokenFor("USR-DST-01", TestFixtures.DISTRIBUTOR_EMAIL, "Vikramjit Singh", "DISTRIBUTOR", "TransGlobal");

        mockMvc.perform(post("/api/shipments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("IN_TRANSIT"))
                .andExpect(jsonPath("$.shipmentDetails.trackingNumber").isNotEmpty());
    }

    @Test
    @DisplayName("Should reject an invalid shipment payload with 400")
    void testCreateShipmentValidationFails() throws Exception {
        String token = tokenFor("USR-DST-01", TestFixtures.DISTRIBUTOR_EMAIL, "Vikramjit Singh", "DISTRIBUTOR", "TransGlobal");

        mockMvc.perform(post("/api/shipments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("Should forbid farmers from updating a shipment status")
    void testUpdateStatusRejectsFarmerRole() throws Exception {
        String token = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro");

        mockMvc.perform(put("/api/shipments/SHP-2024-8901/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipmentStatus("DELIVERED"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should let a distributor confirm the delivery")
    void testUpdateStatusAllowsDistributorRole() throws Exception {
        String token = tokenFor("USR-DST-01", TestFixtures.DISTRIBUTOR_EMAIL, "Vikramjit Singh", "DISTRIBUTOR", "TransGlobal");

        mockMvc.perform(put("/api/shipments/SHP-2024-8901/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipmentStatus("DELIVERED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentDetails.status").value("DELIVERED"));
    }

    @Test
    @DisplayName("Should reject an unsupported shipment status with 400")
    void testUpdateStatusRejectsUnknownStatus() throws Exception {
        String token = tokenFor("USR-DST-01", TestFixtures.DISTRIBUTOR_EMAIL, "Vikramjit Singh", "DISTRIBUTOR", "TransGlobal");

        mockMvc.perform(put("/api/shipments/SHP-2024-8901/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TestFixtures.shipmentStatus("TELEPORTED"))))
                .andExpect(status().isBadRequest());
    }

    private String tokenFor(String id, String email, String name, String role, String organization) {
        return tokenProvider.generateTokenFromUser(id, email, name, role, organization);
    }
}
