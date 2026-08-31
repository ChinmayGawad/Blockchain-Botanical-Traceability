package com.florachain.backend.service;

import com.florachain.backend.dto.ProductDTOs.ProductRegistrationRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.enums.CultivationMethod;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Test
    @DisplayName("Should successfully register a new botanical harvest batch on the ledger")
    void testRegisterProductSuccess() {
        String uniqueBatch = "TEST-BATCH-" + UUID.randomUUID().toString().substring(0, 8);

        ProductRegistrationRequest req = new ProductRegistrationRequest();
        req.setBatchId(uniqueBatch);
        req.setName("Organic Brahmi Bacopa Monnieri");
        req.setBotanicalName("Bacopa monnieri");
        req.setCategory(ProductCategory.MEDICINAL_HERB);
        req.setCultivationMethod(CultivationMethod.ORGANIC);
        req.setQuantityKg(250.0);
        req.setHarvestDate(LocalDate.now().toString());
        req.setFarmLocation("Kerala Organic Estate, Wayanad, India");
        req.setGpsCoordinates(new com.florachain.backend.dto.ProductDTOs.GpsCoordinatesDto(11.6854, 76.1320));
        req.setFarmerId("USR-FRM-01");
        req.setFarmerName("Rajesh Patel");
        req.setFarmerOrg("Vedic Agro Cooperative");
        req.setActiveCompounds(Arrays.asList("Bacoside A 22%", "Bacoside B 18%"));

        ProductResponse response = productService.registerProduct(req);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(uniqueBatch, response.getBatchId());
        assertEquals(ProductStatus.REGISTERED, response.getStatus());
        assertEquals(VerificationState.IN_PROGRESS, response.getVerificationState());
        assertNotNull(response.getQrCodeValue());
    }

    @Test
    @DisplayName("Should throw BadRequestException if Batch ID is duplicate or blank")
    void testRegisterProductValidation() {
        ProductRegistrationRequest req = new ProductRegistrationRequest();
        req.setBatchId("");
        assertThrows(BadRequestException.class, () -> productService.registerProduct(req));

        // Duplicate test using pre-seeded batch
        ProductRegistrationRequest dupReq = new ProductRegistrationRequest();
        dupReq.setBatchId("ASH-2024-089");
        assertThrows(BadRequestException.class, () -> productService.registerProduct(dupReq));
    }
}
