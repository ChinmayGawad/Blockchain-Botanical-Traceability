package com.florachain.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ConfigDTOs {

    /**
     * Whitelisted public configuration parameters safe for browser consumption.
     * Crucially: NEVER include private keys, database credentials, or secret tokens here.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicConfigResponse {
        private String mapboxAccessToken;
        private String contractAddress;
        private String networkName;
        private String ipfsGatewayUrl;
    }
}
