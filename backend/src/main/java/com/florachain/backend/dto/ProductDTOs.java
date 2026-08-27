package com.florachain.backend.dto;

import com.florachain.backend.enums.CultivationMethod;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.VerificationState;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

public class ProductDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GpsCoordinatesDto {
        private Double lat;
        private Double lng;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateDto {
        private String id;
        private String type;
        private String certificateNumber;
        private String issuingAuthority;
        private String issueDate;
        private String expiryDate;
        private String ipfsCid;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductRegistrationRequest {
        @NotBlank(message = "Product name is required")
        private String name;

        @NotBlank(message = "Botanical name is required")
        private String botanicalName;

        @NotBlank(message = "Batch ID is required")
        private String batchId;

        @NotNull(message = "Category is required")
        private ProductCategory category;

        @NotNull(message = "Cultivation method is required")
        private CultivationMethod cultivationMethod;

        @NotNull(message = "Quantity in kg is required")
        @Positive(message = "Quantity must be greater than 0")
        private Double quantityKg;

        @NotBlank(message = "Harvest date is required")
        private String harvestDate;

        @NotBlank(message = "Farm location is required")
        private String farmLocation;

        private GpsCoordinatesDto gpsCoordinates;
        private String farmerId;
        private String farmerName;
        private String farmerOrg;
        private String description;
        private String imageUrl;
        private List<String> activeCompounds;
        private List<CertificateDto> certificates;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductResponse {
        private String id;
        private String batchId;
        private String name;
        private String botanicalName;
        private ProductCategory category;
        private CultivationMethod cultivationMethod;
        private Double quantityKg;
        private String harvestDate;
        private String farmLocation;
        private GpsCoordinatesDto gpsCoordinates;
        private String farmerId;
        private String farmerName;
        private String farmerOrg;
        private ProductStatus status;
        private VerificationState verificationState;
        private String qrCodeValue;
        private String description;
        private String imageUrl;
        private String createdTimestamp;
        private List<String> activeCompounds;
        private List<CertificateDto> certificates;
        private ProcessingDTOs.ProcessingResponse processingDetails;
        private LabDTOs.LabReportResponse labReport;
        private ShipmentDTOs.ShipmentResponse shipmentDetails;
        private RetailDTOs.RetailResponse retailDetails;
        private List<VerificationDTOs.TimelineEventDto> timeline;
        private List<BlockchainDTOs.TransactionDto> blockchainTransactions;
    }
}
