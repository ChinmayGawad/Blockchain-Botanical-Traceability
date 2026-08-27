package com.florachain.backend.dto;

import com.florachain.backend.enums.TestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

public class LabDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabTestParameterDto {
        private String name;
        private String value;
        private String unit;
        private String standardLimit;
        private Boolean passed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabTestRequest {
        @NotBlank(message = "Lab ID is required")
        private String labId;

        @NotBlank(message = "Lab name is required")
        private String labName;

        @NotBlank(message = "Test date is required")
        private String testDate;

        private String testedBy;

        @NotNull(message = "Purity percentage is required")
        private Double purityPercentage;

        @NotNull(message = "Moisture percentage is required")
        private Double moisturePercentage;

        @NotNull(message = "Heavy metals status is required")
        private TestStatus heavyMetalsStatus;

        @NotNull(message = "Microbial test status is required")
        private TestStatus microbialTestStatus;

        @NotNull(message = "Pesticide residue status is required")
        private TestStatus pesticideResidueStatus;

        private List<LabTestParameterDto> parameters;
        private String certificateIpfsCid;
        private String certificateUrl;
        private Boolean approve; // true = approve, false = reject
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabReportResponse {
        private String labId;
        private String labName;
        private String testDate;
        private String testedBy;
        private Double purityPercentage;
        private Double moisturePercentage;
        private TestStatus heavyMetalsStatus;
        private TestStatus microbialTestStatus;
        private TestStatus pesticideResidueStatus;
        private List<LabTestParameterDto> parameters;
        private String certificateIpfsCid;
        private String certificateUrl;
        private String overallResult; // "APPROVED" or "REJECTED"
        private String notes;
        private String txHash;
    }
}
