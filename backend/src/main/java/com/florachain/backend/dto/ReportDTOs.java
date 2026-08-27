package com.florachain.backend.dto;

import com.florachain.backend.enums.ReportReason;
import com.florachain.backend.enums.ReportStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class ReportDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateReportRequest {
        @NotBlank(message = "Product ID or Batch ID is required")
        private String productId;

        private String batchId;

        @NotBlank(message = "Reporter name is required")
        private String reporterName;

        @NotBlank(message = "Reporter email is required")
        @Email(message = "Valid email is required")
        private String reporterEmail;

        @NotNull(message = "Reason is required")
        private ReportReason reason;

        @NotBlank(message = "Description of the issue is required")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateReportStatusRequest {
        @NotNull(message = "Status is required")
        private ReportStatus status;
        private String adminNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportResponse {
        private String id;
        private String productId;
        private String batchId;
        private String reporterName;
        private String reporterEmail;
        private ReportReason reason;
        private String description;
        private String reportedAt;
        private ReportStatus status;
        private String adminNotes;
    }
}
