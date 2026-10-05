package com.florachain.backend.controller;

import com.florachain.backend.dto.ConfigDTOs.PublicConfigResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for serving non-sensitive public configuration parameters
 * to the frontend client (e.g. Mapbox public token, network metadata).
 */
@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    @Value("${app.mapbox.access-token:}")
    private String mapboxAccessToken;

    @Value("${app.blockchain.contract-address:0x5FbDB2315678afecb367f032d93F642f64180aa3}")
    private String contractAddress;

    @Value("${app.blockchain.network-name:Hardhat EVM Localhost (Chain ID 31337)}")
    private String networkName;

    @Value("${app.ipfs.gateway-url:https://gateway.pinata.cloud/ipfs/}")
    private String ipfsGatewayUrl;

    @GetMapping("/public")
    public ResponseEntity<PublicConfigResponse> getPublicConfig() {
        return ResponseEntity.ok(PublicConfigResponse.builder()
                .mapboxAccessToken(mapboxAccessToken)
                .contractAddress(contractAddress)
                .networkName(networkName)
                .ipfsGatewayUrl(ipfsGatewayUrl)
                .build());
    }

    @GetMapping("/mapbox")
    public ResponseEntity<Map<String, String>> getMapboxToken() {
        return ResponseEntity.ok(Map.of("token", mapboxAccessToken));
    }
}
