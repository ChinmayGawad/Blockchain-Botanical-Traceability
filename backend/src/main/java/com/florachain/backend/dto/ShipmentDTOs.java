package com.florachain.backend.dto;

import com.florachain.backend.enums.TransportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class ShipmentDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateShipmentRequest {
        @NotBlank(message = "Product ID is required")
        private String productId;

        @NotBlank(message = "Distributor ID is required")
        private String distributorId;

        @NotBlank(message = "Distributor name is required")
        private String distributorName;

        @NotBlank(message = "Source location is required")
        private String sourceLocation;

        @NotBlank(message = "Destination location is required")
        private String destinationLocation;

        @NotBlank(message = "Vehicle number is required")
        private String vehicleNumber;

        @NotNull(message = "Transport type is required")
        private TransportType transportType;

        @NotBlank(message = "Temperature range is required")
        private String temperatureRange;

        @NotBlank(message = "Dispatch date is required")
        private String dispatchDate;

        @NotBlank(message = "Expected delivery date is required")
        private String expectedDeliveryDate;

        private String trackingNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateShipmentStatusRequest {
        @NotBlank(message = "Status is required (IN_TRANSIT or DELIVERED)")
        private String status;
        private String actualDeliveryDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShipmentResponse {
        private String shipmentId;
        private String distributorId;
        private String distributorName;
        private String sourceLocation;
        private String destinationLocation;
        private String vehicleNumber;
        private TransportType transportType;
        private String temperatureRange;
        private String dispatchDate;
        private String expectedDeliveryDate;
        private String actualDeliveryDate;
        private String status;
        private String trackingNumber;
        private String txHash;
    }
}
