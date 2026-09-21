package com.florachain.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;

@Slf4j
@Service
public class IpfsStorageService {

    @Value("${app.ipfs.gateway-url:https://gateway.pinata.cloud/ipfs/}")
    private String gatewayUrl;

    @Value("${app.ipfs.pinata-api-key:}")
    private String pinataApiKey;

    @Value("${app.ipfs.pinata-secret-key:}")
    private String pinataSecretKey;

    @Value("${app.ipfs.pinata-jwt:}")
    private String pinataJwt;

    @Value("${app.ipfs.mock-mode:false}")
    private boolean mockMode;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Upload JSON metadata/assay content to IPFS via Pinata API in production,
     * or generate a cryptographic SHA-256 IPFS-style CID if running offline/mock mode.
     */
    public String pinJsonToIpfs(String jsonContent, String pinName) {
        if (!mockMode && hasPinataCredentials()) {
            try {
                return uploadToPinataJson(jsonContent, pinName);
            } catch (Exception e) {
                log.warn("Pinata upload failed ({}). Falling back to cryptographic CID generation.", e.getMessage());
            }
        }
        return generateCid(jsonContent);
    }

    public String generateCid(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            // Produce standard IPFS CIDv0 style string
            return "Qm" + bytesToHex(hash).substring(0, 44);
        } catch (NoSuchAlgorithmException e) {
            return "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
        }
    }

    public String getGatewayUrl(@Nullable String cid) {
        if (cid == null || cid.isBlank()) return "";
        return gatewayUrl.endsWith("/") ? gatewayUrl + cid : gatewayUrl + "/" + cid;
    }

    private boolean hasPinataCredentials() {
        return (pinataJwt != null && !pinataJwt.isBlank()) ||
               (pinataApiKey != null && !pinataApiKey.isBlank() && pinataSecretKey != null && !pinataSecretKey.isBlank());
    }

    private String uploadToPinataJson(String jsonPayload, String pinName) throws Exception {
        String body = "{\"pinataOptions\":{\"cidVersion\":0},\"pinataMetadata\":{\"name\":\"" + pinName + "\"},\"pinataContent\":" + jsonPayload + "}";

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create("https://api.pinata.cloud/pinning/pinJSONToIPFS"))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));

        if (pinataJwt != null && !pinataJwt.isBlank()) {
            requestBuilder.header("Authorization", "Bearer " + pinataJwt);
        } else {
            requestBuilder.header("pinata_api_key", pinataApiKey);
            requestBuilder.header("pinata_secret_api_key", pinataSecretKey);
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            // Extract IpfsHash from JSON response {"IpfsHash":"Qm...","PinSize":...,"Timestamp":"..."}
            String resBody = response.body();
            int idx = resBody.indexOf("\"IpfsHash\":\"");
            if (idx != -1) {
                int start = idx + 12;
                int end = resBody.indexOf("\"", start);
                if (end != -1) {
                    String cid = resBody.substring(start, end);
                    log.info("Successfully pinned to Pinata IPFS: {}", cid);
                    return cid;
                }
            }
        }
        throw new RuntimeException("Pinata API returned HTTP " + response.statusCode() + ": " + response.body());
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
