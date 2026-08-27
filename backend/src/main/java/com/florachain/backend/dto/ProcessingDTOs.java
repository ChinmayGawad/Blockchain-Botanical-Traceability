package com.florachain.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

public class ProcessingDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessingRequest {
        @NotBlank(message = "Processor ID is required")
        private String processorId;

        @NotBlank(message = "Processor name is required")
        private String processorName;

        @NotBlank(message = "Processing date is required")
        private String processingDate;

        @NotBlank(message = "Method is required")
        private String method;

        @NotBlank(message = "Facility location is required")
        private String facilityLocation;

        @NotNull(message = "Initial quantity is required")
        @Positive(message = "Initial quantity must be positive")
        private Double initialQuantityKg;

        @NotNull(message = "Processed quantity is required")
        @Positive(message = "Processed quantity must be positive")
        private Double processedQuantityKg;

        private Double yieldLossPercentage;
        private List<String> equipmentUsed;
        private String ipfsDocumentCid;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessingResponse {
        private String processorId;
        private String processorName;
        private String processingDate;
        private String method;
        private String facilityLocation;
        private Double initialQuantityKg;
        private Double processedQuantityKg;
        private Double yieldLossPercentage;
        private List<String> equipmentUsed;
        private String ipfsDocumentCid;
        private String notes;
        private String txHash;
    }
}
