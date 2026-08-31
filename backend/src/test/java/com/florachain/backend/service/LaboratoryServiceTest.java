package com.florachain.backend.service;

import com.florachain.backend.dto.LabDTOs.LabTestParameterDto;
import com.florachain.backend.dto.LabDTOs.LabTestRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.TestStatus;
import com.florachain.backend.enums.VerificationState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class LaboratoryServiceTest {

    @Autowired
    private LaboratoryService laboratoryService;

    @Autowired
    private ProductService productService;

    @Test
    @DisplayName("Should successfully record passing lab assay and approve batch")
    void testRecordLabTestApproval() {
        LabTestRequest req = new LabTestRequest();
        req.setLabId("USR-LAB-01");
        req.setLabName("Dr. Ananya Sharma (Eurofins NABL Lab)");
        req.setTestDate(LocalDate.now().toString());
        req.setTestedBy("Dr. Ananya Sharma");
        req.setPurityPercentage(99.1);
        req.setMoisturePercentage(5.2);
        req.setHeavyMetalsStatus(TestStatus.PASS);
        req.setMicrobialTestStatus(TestStatus.PASS);
        req.setPesticideResidueStatus(TestStatus.PASS);
        req.setApprove(true);
        req.setNotes("Passed all purity thresholds.");
        req.setParameters(Arrays.asList(
                new LabTestParameterDto("Active Potency HPLC", "99.1", "%", ">= 95%", true)
        ));

        com.florachain.backend.entity.ProductEntity product = productService.getProductEntityByIdOrBatch("BOT-2024-9704");
        product.setStatus(ProductStatus.PROCESSED);
        
        ProductResponse response = laboratoryService.submitLabReport("BOT-2024-9704", req);

        assertNotNull(response);
        assertEquals(ProductStatus.APPROVED, response.getStatus());
        assertEquals(VerificationState.VERIFIED, response.getVerificationState());
        assertNotNull(response.getLabReport());
        assertEquals("APPROVED", response.getLabReport().getOverallResult());
    }

    @Test
    @DisplayName("Should transition product to REJECTED if lab test fails quality threshold")
    void testRecordLabTestRejection() {
        LabTestRequest req = new LabTestRequest();
        req.setLabId("USR-LAB-01");
        req.setLabName("Dr. Ananya Sharma");
        req.setTestDate(LocalDate.now().toString());
        req.setTestedBy("Dr. Ananya Sharma");
        req.setPurityPercentage(82.0); // Below threshold
        req.setMoisturePercentage(14.5); // High moisture
        req.setHeavyMetalsStatus(TestStatus.FAIL);
        req.setMicrobialTestStatus(TestStatus.FAIL);
        req.setPesticideResidueStatus(TestStatus.FAIL);
        req.setApprove(false);
        req.setNotes("Sample failed heavy metal threshold and microbial assay.");

        com.florachain.backend.entity.ProductEntity product = productService.getProductEntityByIdOrBatch("BOT-2024-9704");
        product.setStatus(ProductStatus.PROCESSED);
        
        ProductResponse response = laboratoryService.submitLabReport("BOT-2024-9704", req);

        assertNotNull(response);
        assertEquals(ProductStatus.REJECTED, response.getStatus());
        assertEquals(VerificationState.REJECTED, response.getVerificationState());
        assertNotNull(response.getLabReport());
        assertEquals("REJECTED", response.getLabReport().getOverallResult());
    }
}
