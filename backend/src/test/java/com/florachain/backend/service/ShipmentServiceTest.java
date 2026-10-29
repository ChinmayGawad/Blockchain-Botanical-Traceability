package com.florachain.backend.service;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.ShipmentDTOs.CreateShipmentRequest;
import com.florachain.backend.dto.ShipmentDTOs.ShipmentResponse;
import com.florachain.backend.dto.ShipmentDTOs.UpdateShipmentStatusRequest;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
import com.florachain.backend.support.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShipmentServiceTest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private ProductService productService;

    @Test
    @DisplayName("Should dispatch an approved batch and move it into transit")
    void testCreateShipment() {
        CreateShipmentRequest request = TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID);

        ProductResponse response = shipmentService.createShipment(request);

        assertEquals(ProductStatus.IN_TRANSIT, response.getStatus());
        assertNotNull(response.getShipmentDetails());
        assertEquals("IN_TRANSIT", response.getShipmentDetails().getStatus());
        assertEquals(request.getTrackingNumber(), response.getShipmentDetails().getTrackingNumber());
        assertEquals(request.getVehicleNumber(), response.getShipmentDetails().getVehicleNumber());
        assertNotNull(response.getShipmentDetails().getTxHash());
    }

    @Test
    @DisplayName("Should record the dispatch on the blockchain mirror and the timeline")
    void testCreateShipmentRecordsProvenance() {
        ProductResponse response = shipmentService.createShipment(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID));

        assertTrue(response.getBlockchainTransactions().stream()
                .anyMatch(tx -> "LOGISTICS_TRANSIT".equals(tx.getStage())));
        assertTrue(response.getTimeline().stream()
                .anyMatch(event -> "LOGISTICS_TRANSIT".equals(event.getStage())));
    }

    @Test
    @DisplayName("Should keep the consumer QR code resolvable throughout the cold chain")
    void testQrCodeSurvivesShipmentLifecycle() {
        ProductResponse before = productService.getProductByIdOrBatch(TestFixtures.APPROVED_BATCH_ID);
        String qrBefore = before.getQrCodeValue();
        assertNotNull(qrBefore);

        ProductResponse dispatched = shipmentService.createShipment(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID));
        assertEquals(qrBefore, dispatched.getQrCodeValue());

        ProductResponse delivered = shipmentService.updateShipmentStatus(
                dispatched.getShipmentDetails().getShipmentId(), TestFixtures.shipmentStatus("DELIVERED"));
        assertEquals(qrBefore, delivered.getQrCodeValue());
    }

    @Test
    @DisplayName("Should reject dispatching a batch that the laboratory has not approved")
    void testCreateShipmentRejectsUnapprovedBatch() {
        CreateShipmentRequest request = TestFixtures.shipment(TestFixtures.REGISTERED_BATCH_ID);

        assertThrows(BadRequestException.class, () -> shipmentService.createShipment(request));
    }

    @Test
    @DisplayName("Should reject a second shipment for a batch that is already in transit")
    void testCreateShipmentRejectsDuplicate() {
        shipmentService.createShipment(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID));

        CreateShipmentRequest second = TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID);
        assertThrows(BadRequestException.class, () -> shipmentService.createShipment(second));
    }

    @Test
    @DisplayName("Should mark the batch as delivered and stamp the actual delivery date")
    void testUpdateShipmentStatusToDelivered() {
        ProductResponse dispatched = shipmentService.createShipment(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID));
        String shipmentId = dispatched.getShipmentDetails().getShipmentId();

        ProductResponse delivered = shipmentService.updateShipmentStatus(shipmentId, TestFixtures.shipmentStatus("DELIVERED"));

        assertEquals(ProductStatus.DELIVERED, delivered.getStatus());
        assertEquals("DELIVERED", delivered.getShipmentDetails().getStatus());
        assertNotNull(delivered.getShipmentDetails().getActualDeliveryDate());
    }

    @Test
    @DisplayName("Should update a shipment by tracking number")
    void testUpdateShipmentStatusByTrackingNumber() {
        CreateShipmentRequest request = TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID);
        ProductResponse dispatched = shipmentService.createShipment(request);

        UpdateShipmentStatusRequest update = new UpdateShipmentStatusRequest();
        update.setStatus("IN_TRANSIT");

        ProductResponse updated = shipmentService.updateShipmentStatus(request.getTrackingNumber(), update);

        assertEquals("IN_TRANSIT", updated.getShipmentDetails().getStatus());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for an unknown shipment")
    void testUpdateShipmentStatusNotFound() {
        assertThrows(ResourceNotFoundException.class,
                () -> shipmentService.updateShipmentStatus("SHP-UNKNOWN", TestFixtures.shipmentStatus("DELIVERED")));
    }

    @Test
    @DisplayName("Should list the shipments that are known to the platform")
    void testGetAllShipments() {
        shipmentService.createShipment(TestFixtures.shipment(TestFixtures.APPROVED_BATCH_ID));

        List<ShipmentResponse> shipments = shipmentService.getAllShipments();

        assertFalse(shipments.isEmpty());
        assertTrue(shipments.stream().anyMatch(s -> "SHP-2024-8901".equals(s.getShipmentId())));
        assertTrue(shipments.stream().allMatch(s -> s.getTrackingNumber() != null));
    }
}
