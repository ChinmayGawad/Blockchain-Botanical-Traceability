package com.florachain.backend.service;

import com.florachain.backend.dto.LabDTOs.LabTestRequest;
import com.florachain.backend.dto.ProcessingDTOs.ProcessingRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.RetailDTOs.RetailReceiveRequest;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.TestStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.support.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RetailerServiceTest {

    @Autowired
    private RetailerService retailerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProcessingService processingService;

    @Autowired
    private LaboratoryService laboratoryService;

    @Autowired
    private ShipmentService shipmentService;

    @Test
    @DisplayName("Should stock a delivered batch and activate the consumer QR code")
    void testReceiveProductAtRetailActivatesQrCode() {
        String productId = deliverFreshBatch();

        ProductResponse response = retailerService.receiveProductAtRetail(productId, request());

        assertEquals(ProductStatus.RETAIL_READY, response.getStatus());
        assertEquals(VerificationState.VERIFIED, response.getVerificationState());
        assertNotNull(response.getRetailDetails());
        assertTrue(response.getRetailDetails().getQrCodeGenerated());
        assertEquals(850.0, response.getRetailDetails().getUnitPrice());
        assertNotNull(response.getRetailDetails().getShelfBatchId());
        assertNotNull(response.getQrCodeValue());
    }

    @Test
    @DisplayName("Should reject a second retail receipt for the same batch")
    void testReceiveProductAtRetailRejectsDuplicate() {
        String productId = deliverFreshBatch();
        retailerService.receiveProductAtRetail(productId, request());

        assertThrows(BadRequestException.class,
                () -> retailerService.receiveProductAtRetail(productId, request()));
    }

    @Test
    @DisplayName("Should reject a retail receipt for a batch that never reached the store")
    void testReceiveProductAtRetailRejectsUndeliveredBatch() {
        String productId = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("RETAIL-EARLY"))).getId();

        assertThrows(BadRequestException.class,
                () -> retailerService.receiveProductAtRetail(productId, request()));
    }

    /**
     * Drives a freshly registered batch through processing, laboratory QA and
     * cold-chain delivery so that it is ready for the retail handover.
     */
    private String deliverFreshBatch() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("RETAIL-BATCH")));

        ProcessingRequest processing = new ProcessingRequest();
        processing.setProcessorId("USR-PRC-01");
        processing.setProcessorName("Mahesh Deshmukh");
        processing.setProcessingDate(LocalDate.now().toString());
        processing.setMethod("Cryogenic Micronization");
        processing.setFacilityLocation("PhytoExtracts Facility B, Bengaluru");
        processing.setInitialQuantityKg(100.0);
        processing.setProcessedQuantityKg(90.0);
        processing.setEquipmentUsed(List.of("CryoMill CM-800"));
        processingService.addProcessingDetails(registered.getId(), processing);

        LabTestRequest lab = new LabTestRequest();
        lab.setLabId("USR-LAB-01");
        lab.setLabName("Dr. Ananya Sharma");
        lab.setTestDate(LocalDate.now().toString());
        lab.setPurityPercentage(99.0);
        lab.setMoisturePercentage(5.0);
        lab.setHeavyMetalsStatus(TestStatus.PASS);
        lab.setMicrobialTestStatus(TestStatus.PASS);
        lab.setPesticideResidueStatus(TestStatus.PASS);
        lab.setApprove(true);
        laboratoryService.submitLabReport(registered.getId(), lab);

        ProductResponse dispatched = shipmentService.createShipment(TestFixtures.shipment(registered.getId()));
        shipmentService.updateShipmentStatus(dispatched.getShipmentDetails().getShipmentId(),
                TestFixtures.shipmentStatus("DELIVERED"));

        return registered.getId();
    }

    private RetailReceiveRequest request() {
        RetailReceiveRequest request = new RetailReceiveRequest();
        request.setRetailerId("USR-RET-01");
        request.setRetailerName("Aarav Mehta");
        request.setStoreLocation("Indiranagar Flagship Store, Bengaluru");
        request.setReceivedDate(LocalDate.now().toString());
        request.setUnitPrice(850.0);
        return request;
    }
}
