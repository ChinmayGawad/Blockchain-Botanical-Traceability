package com.florachain.backend.dto;

import com.florachain.backend.enums.UserRole;
import lombok.*;

import java.util.List;

public class BlockchainDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BlockchainStatsResponse {
        private Long blockHeight;
        private Integer activePeers;
        private String channelName;
        private String chaincodeVersion;
        private Double tps;
        private Long verifiedBatches;
        private String networkName;
        private String contractAddress;
        private Boolean isLiveNodeConnected;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionDto {
        private String txId;
        private Long blockNumber;
        private String timestamp;
        private String stage;
        private String action;
        private String actor;
        private UserRole actorRole;
        private String payloadHash;
        private List<String> endorsingPeers;
        private String channelName;
        private String chaincode;
        private String productId;
    }
}
