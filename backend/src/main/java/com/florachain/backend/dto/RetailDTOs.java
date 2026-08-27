package com.florachain.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

public class RetailDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RetailReceiveRequest {
        @NotBlank(message = "Retailer ID is required")
        private String retailerId;

        @NotBlank(message = "Retailer name is required")
        private String retailerName;

        @NotBlank(message = "Store location is required")
        private String storeLocation;

        @NotBlank(message = "Received date is required")
        private String receivedDate;

        private String shelfBatchId;

        @NotNull(message = "Unit price is required")
        @Positive(message = "Unit price must be greater than 0")
        private Double unitPrice;

        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RetailResponse {
        private String retailerId;
        private String retailerName;
        private String storeLocation;
        private String receivedDate;
        private String shelfBatchId;
        private Double unitPrice;
        private Boolean qrCodeGenerated;
        private String notes;
        private String txHash;
    }
}
