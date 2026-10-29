package com.florachain.backend.dto;

import com.florachain.backend.enums.TransportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

public class ShipmentDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateShipmentRequest {
        @NotBlank(message = "Product ID is required")
        @Size(max = 64, message = "Product ID must not exceed 64 characters")
        private String productId;

        @NotBlank(message = "Distributor ID is required")
        @Size(max = 64, message = "Distributor ID must not exceed 64 characters")
        private String distributorId;

        @NotBlank(message = "Distributor name is required")
        @Size(max = 150, message = "Distributor name must not exceed 150 characters")
        private String distributorName;

        @NotBlank(message = "Source location is required")
        @Size(max = 256, message = "Source location must not exceed 256 characters")
        private String sourceLocation;

        @NotBlank(message = "Destination location is required")
        @Size(max = 256, message = "Destination location must not exceed 256 characters")
        private String destinationLocation;

        @NotBlank(message = "Vehicle number is required")
        @Size(max = 64, message = "Vehicle number must not exceed 64 characters")
        private String vehicleNumber;

        @NotNull(message = "Transport type is required")
        private TransportType transportType;

        @NotBlank(message = "Temperature range is required")
        @Size(max = 64, message = "Temperature range must not exceed 64 characters")
        private String temperatureRange;

        @NotBlank(message = "Dispatch date is required")
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Dispatch date must use the YYYY-MM-DD format")
        private String dispatchDate;

        @NotBlank(message = "Expected delivery date is required")
        @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Expected delivery date must use the YYYY-MM-DD format")
        private String expectedDeliveryDate;

        @Size(max = 128, message = "Tracking number must not exceed 128 characters")
        private String trackingNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateShipmentStatusRequest {
        @NotBlank(message = "Status is required (IN_TRANSIT or DELIVERED)")
        @Pattern(regexp = "^(?i)(IN_TRANSIT|DELIVERED)$", message = "Status must be either IN_TRANSIT or DELIVERED")
        @Size(max = 32, message = "Status must not exceed 32 characters")
        private String status;

        @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Actual delivery date must use the YYYY-MM-DD format")
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
