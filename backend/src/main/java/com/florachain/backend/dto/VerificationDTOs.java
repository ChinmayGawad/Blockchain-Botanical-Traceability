package com.florachain.backend.dto;

import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.VerificationState;
import lombok.*;

import java.util.List;

public class VerificationDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineEventDto {
        private String id;
        private String title;
        private String stage;
        private String timestamp;
        private String actorName;
        private UserRole actorRole;
        private String location;
        private String description;
        private String txHash;
        private String status;
        private String ipfsHash;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StageIntegrityDto {
        private String stageName;
        private boolean completed;
        private boolean verifiedOnChain;
        private String txHash;
        private String timestamp;
        private String actorName;
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerificationResultResponse {
        private String queryIdentifier;
        private VerificationState verificationState;
        private int trustScore; // 0 to 100%
        private boolean onChainVerified;
        private String verifiedContractAddress;
        private String rootOriginTxHash;
        private ProductDTOs.ProductResponse product;
        private List<StageIntegrityDto> stageIntegrity;
        private String verificationSummary;
    }
}
