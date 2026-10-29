package com.florachain.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.florachain.backend.dto.AuthDTOs.LoginRequest;
import com.florachain.backend.dto.AuthDTOs.RegisterRequest;
import com.florachain.backend.enums.UserRole;
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
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    @DisplayName("Should successfully authenticate farmer and return JWT token")
    void testFarmerLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rajesh@vedicfarms.org");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("FARMER"))
                .andExpect(jsonPath("$.user.email").value("rajesh@vedicfarms.org"));
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for invalid password")
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rajesh@vedicfarms.org");
        loginRequest.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject a malformed login payload with 400")
    void testLoginValidationFails() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("not-an-email");
        loginRequest.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").exists());
    }

    @Test
    @DisplayName("Should allow fast role switching in sandbox environment")
    void testSwitchRole() throws Exception {
        mockMvc.perform(post("/api/auth/switch-role")
                        .param("role", "PROCESSOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("PROCESSOR"));
    }

    @Test
    @DisplayName("Should register a new farmer and return a usable token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Grower");
        request.setEmail("test.grower@florachain.org");
        request.setPassword("password123");
        request.setRole(UserRole.FARMER);
        request.setOrganization("Test Cooperative");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("test.grower@florachain.org"))
                .andExpect(jsonPath("$.user.role").value("FARMER"));
    }

    @Test
    @DisplayName("Should reject a duplicate registration with 400")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Grower");
        request.setEmail(TestFixtures.FARMER_EMAIL);
        request.setPassword("password123");
        request.setRole(UserRole.FARMER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reject an invalid registration payload with 400")
    void testRegisterValidationFails() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("A");
        request.setEmail("broken-email");
        request.setPassword("123");
        request.setRole(UserRole.FARMER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should expose the profile of the authenticated user")
    void testGetCurrentUser() throws Exception {
        String token = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro Organic Cooperative");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("USR-FRM-01"))
                .andExpect(jsonPath("$.email").value(TestFixtures.FARMER_EMAIL));
    }

    @Test
    @DisplayName("Should reject the profile endpoint without a token")
    void testGetCurrentUserWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject a malformed JWT with 401")
    void testMalformedJwtIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject a JWT signed with a foreign key")
    void testTamperedJwtIsRejected() throws Exception {
        String token = tokenFor("USR-ADM-01", TestFixtures.ADMIN_EMAIL, "Admin", "ADMIN", "Authority");
        String tampered = token.substring(0, token.length() - 4) + "AAAA";

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tampered))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should protect the user directory from anonymous callers")
    void testUserDirectoryRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should forbid non administrators from listing all users")
    void testUserDirectoryRejectsNonAdminRole() throws Exception {
        String farmerToken = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro Organic Cooperative");

        mockMvc.perform(get("/api/auth/users").header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should allow administrators to list all users")
    void testUserDirectoryAllowsAdminRole() throws Exception {
        String adminToken = tokenFor("USR-ADM-01", TestFixtures.ADMIN_EMAIL, "Dr. Rameshwar Varma", "ADMIN", "National Botanical Provenance Authority of India");

        mockMvc.perform(get("/api/auth/users").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].email").exists());
    }

    @Test
    @DisplayName("Should forbid non administrators from approving accounts")
    void testApproveUserRejectsNonAdminRole() throws Exception {
        String farmerToken = tokenFor("USR-FRM-01", TestFixtures.FARMER_EMAIL, "Rajesh Patel", "FARMER", "Vedic Agro Organic Cooperative");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .put("/api/auth/users/USR-FRM-02/approve")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());
    }

    private String tokenFor(String id, String email, String name, String role, String organization) {
        return tokenProvider.generateTokenFromUser(id, email, name, role, organization);
    }
}
