package com.florachain.backend.service;

import com.florachain.backend.dto.LabDTOs.LabTestParameterDto;
import com.florachain.backend.dto.LabDTOs.LabTestRequest;
import com.florachain.backend.dto.ProcessingDTOs.ProcessingRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.RetailDTOs.RetailReceiveRequest;
import com.florachain.backend.dto.ShipmentDTOs.CreateShipmentRequest;
import com.florachain.backend.dto.ShipmentDTOs.UpdateShipmentStatusRequest;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.TestStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
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

/**
 * Covers the botanical batch state machine that is spread over the stage
 * services: registration (farmer) -> processing -> laboratory QA -> cold-chain
 * logistics -> retail receipt.
 *
 * <p>Every transition must be guarded: a stage may only be entered from the
 * state that precedes it.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BatchLifecycleServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProcessingService processingService;

    @Autowired
    private LaboratoryService laboratoryService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private RetailerService retailerService;

    @Test
    @DisplayName("Should walk a fresh batch through the complete supply chain lifecycle")
    void testFullBatchLifecycle() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("LIFECYCLE")));
        assertEquals(ProductStatus.REGISTERED, registered.getStatus());

        ProductResponse processed = processingService.addProcessingDetails(registered.getId(), processingRequest());
        assertEquals(ProductStatus.PROCESSED, processed.getStatus());
        assertNotNull(processed.getProcessingDetails());
        assertEquals(12.0, processed.getProcessingDetails().getYieldLossPercentage());

        ProductResponse approved = laboratoryService.submitLabReport(registered.getId(), labRequest(TestStatus.PASS));
        assertEquals(ProductStatus.APPROVED, approved.getStatus());
        assertEquals(VerificationState.VERIFIED, approved.getVerificationState());

        ProductResponse dispatched = shipmentService.createShipment(TestFixtures.shipment(registered.getId()));
        assertEquals(ProductStatus.IN_TRANSIT, dispatched.getStatus());
        assertNotNull(dispatched.getShipmentDetails());
        assertEquals("IN_TRANSIT", dispatched.getShipmentDetails().getStatus());

        ProductResponse delivered = shipmentService.updateShipmentStatus(
                dispatched.getShipmentDetails().getShipmentId(), TestFixtures.shipmentStatus("DELIVERED"));
        assertEquals(ProductStatus.DELIVERED, delivered.getStatus());
        assertEquals("DELIVERED", delivered.getShipmentDetails().getStatus());

        ProductResponse stocked = retailerService.receiveProductAtRetail(registered.getId(), retailRequest());
        assertEquals(ProductStatus.RETAIL_READY, stocked.getStatus());
        assertEquals(VerificationState.VERIFIED, stocked.getVerificationState());
        assertTrue(stocked.getRetailDetails().getQrCodeGenerated());

        // The full provenance chain is auditable.
        assertTrue(stocked.getTimeline().size() >= 5, "Expected a timeline entry for every stage");
        assertTrue(stocked.getBlockchainTransactions().size() >= 5, "Expected a ledger entry for every stage");
    }

    @Test
    @DisplayName("Should reject processing a batch that was never registered for processing")
    void testCannotProcessAnAlreadyProcessedBatch() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("LIFECYCLE-DUP")));
        processingService.addProcessingDetails(registered.getId(), processingRequest());

        assertThrows(BadRequestException.class,
                () -> processingService.addProcessingDetails(registered.getId(), processingRequest()));
    }

    @Test
    @DisplayName("Should reject laboratory testing of a batch that has not been processed")
    void testCannotTestUnprocessedBatch() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("LIFECYCLE-LAB")));

        assertThrows(BadRequestException.class,
                () -> laboratoryService.submitLabReport(registered.getId(), labRequest(TestStatus.PASS)));
    }

    @Test
    @DisplayName("Should reject dispatching a batch that was not approved by the laboratory")
    void testCannotShipUnapprovedBatch() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("LIFECYCLE-SHIP")));
        processingService.addProcessingDetails(registered.getId(), processingRequest());
        laboratoryService.submitLabReport(registered.getId(), labRequest(TestStatus.FAIL));

        CreateShipmentRequest shipment = TestFixtures.shipment(registered.getId());
        assertThrows(BadRequestException.class, () -> shipmentService.createShipment(shipment));
    }

    @Test
    @DisplayName("Should reject a retail receipt for a batch that never reached the store")
    void testCannotReceiveBatchThatIsNotDelivered() {
        ProductResponse registered = productService.registerProduct(
                TestFixtures.productRegistration(TestFixtures.uniqueBatchId("LIFECYCLE-RETAIL")));

        assertThrows(BadRequestException.class,
                () -> retailerService.receiveProductAtRetail(registered.getId(), retailRequest()));
    }

    @Test
    @DisplayName("Should reject a laboratory report for an unknown batch")
    void testLabReportForUnknownBatch() {
        assertThrows(ResourceNotFoundException.class,
                () -> laboratoryService.submitLabReport("BOT-DOES-NOT-EXIST", labRequest(TestStatus.PASS)));
    }

    private ProcessingRequest processingRequest() {
        ProcessingRequest request = new ProcessingRequest();
        request.setProcessorId("USR-PRC-01");
        request.setProcessorName("Mahesh Deshmukh");
        request.setProcessingDate(LocalDate.now().toString());
        request.setMethod("Cryogenic Micronization");
        request.setFacilityLocation("PhytoExtracts Facility B, Bengaluru");
        request.setInitialQuantityKg(100.0);
        request.setProcessedQuantityKg(88.0);
        request.setEquipmentUsed(List.of("CryoMill CM-800"));
        request.setNotes("Standardised and packed.");
        return request;
    }

    private LabTestRequest labRequest(TestStatus status) {
        LabTestRequest request = new LabTestRequest();
        request.setLabId("USR-LAB-01");
        request.setLabName("Dr. Ananya Sharma (Eurofins NABL Lab)");
        request.setTestDate(LocalDate.now().toString());
        request.setTestedBy("Dr. Ananya Sharma");
        request.setPurityPercentage(99.1);
        request.setMoisturePercentage(5.2);
        request.setHeavyMetalsStatus(status);
        request.setMicrobialTestStatus(status);
        request.setPesticideResidueStatus(status);
        request.setApprove(status == TestStatus.PASS);
        request.setParameters(List.of(new LabTestParameterDto("Potency HPLC", "99.1", "%", ">= 95%", true)));
        return request;
    }

    private RetailReceiveRequest retailRequest() {
        RetailReceiveRequest request = new RetailReceiveRequest();
        request.setRetailerId("USR-RET-01");
        request.setRetailerName("Aarav Mehta");
        request.setStoreLocation("Indiranagar Flagship Store, Bengaluru");
        request.setReceivedDate(LocalDate.now().toString());
        request.setUnitPrice(850.0);
        return request;
    }
}
