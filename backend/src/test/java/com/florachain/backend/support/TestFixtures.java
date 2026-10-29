package com.florachain.backend.support;

import com.florachain.backend.dto.AuthDTOs.LoginRequest;
import com.florachain.backend.dto.ProductDTOs.GpsCoordinatesDto;
import com.florachain.backend.dto.ProductDTOs.ProductRegistrationRequest;
import com.florachain.backend.dto.ShipmentDTOs.CreateShipmentRequest;
import com.florachain.backend.dto.ShipmentDTOs.UpdateShipmentStatusRequest;
import com.florachain.backend.enums.CultivationMethod;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.TransportType;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Reusable fixtures for the backend integration tests.
 *
 * <p>The reference data (users, batches, provenance history) is provided by the
 * Flyway seed migration {@code V3__seed_reference_data.sql} against an isolated
 * H2 database. This helper only builds request payloads and identifiers for the
 * scenarios that need fresh data.
 */
public final class TestFixtures {

    public static final String FARMER_EMAIL = "rajesh@vedicfarms.org";
    public static final String PROCESSOR_EMAIL = "mahesh@phytoextracts.in";
    public static final String LAB_EMAIL = "ananya@agrilabs.in";
    public static final String DISTRIBUTOR_EMAIL = "vikram@transglobalcoldchain.in";
    public static final String RETAILER_EMAIL = "aarav@arogyawellness.in";
    public static final String ADMIN_EMAIL = "admin@florachain.org";
    public static final String SHARED_PASSWORD = "password123";

    /** Batch that is fully traceable and available on the shelf. */
    public static final String RETAIL_READY_BATCH_ID = "BOT-2024-8901";
    /** Batch approved by the laboratory and waiting for dispatch. */
    public static final String APPROVED_BATCH_ID = "BOT-2024-9403";
    /** Freshly registered batch that still has to be processed. */
    public static final String REGISTERED_BATCH_ID = "BOT-2024-9704";

    private TestFixtures() {
    }

    public static String uniqueBatchId(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public static LoginRequest login(String email) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(SHARED_PASSWORD);
        return request;
    }

    public static ProductRegistrationRequest productRegistration(String batchId) {
        ProductRegistrationRequest request = new ProductRegistrationRequest();
        request.setBatchId(batchId);
        request.setName("Organic Brahmi Bacopa Monnieri");
        request.setBotanicalName("Bacopa monnieri");
        request.setCategory(ProductCategory.MEDICINAL_HERB);
        request.setCultivationMethod(CultivationMethod.ORGANIC);
        request.setQuantityKg(250.0);
        request.setHarvestDate(LocalDate.now().toString());
        request.setFarmLocation("Kerala Organic Estate, Wayanad, India");
        request.setGpsCoordinates(new GpsCoordinatesDto(11.6854, 76.1320));
        request.setFarmerId("USR-FRM-01");
        request.setFarmerName("Rajesh Patel");
        request.setFarmerOrg("Vedic Agro Cooperative");
        request.setActiveCompounds(List.of("Bacoside A 22%", "Bacoside B 18%"));
        return request;
    }

    public static CreateShipmentRequest shipment(String productId) {
        CreateShipmentRequest request = new CreateShipmentRequest();
        request.setProductId(productId);
        request.setDistributorId("USR-DST-01");
        request.setDistributorName("Vikramjit Singh");
        request.setSourceLocation("PhytoExtracts Hub, Nelamangala, Bengaluru, India");
        request.setDestinationLocation("Arogya Pure Herbals Dispensary, Indiranagar, Bengaluru, India");
        request.setVehicleNumber("KA-01-TG-8442");
        request.setTransportType(TransportType.REFRIGERATED_TRUCK);
        request.setTemperatureRange("15C - 25C");
        request.setDispatchDate(LocalDate.now().toString());
        request.setExpectedDeliveryDate(LocalDate.now().plusDays(3).toString());
        request.setTrackingNumber(uniqueBatchId("TRK"));
        return request;
    }

    public static UpdateShipmentStatusRequest shipmentStatus(String status) {
        UpdateShipmentStatusRequest request = new UpdateShipmentStatusRequest();
        request.setStatus(status);
        request.setActualDeliveryDate(LocalDate.now().toString());
        return request;
    }
}
