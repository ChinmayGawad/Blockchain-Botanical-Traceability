package com.florachain.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Slf4j
@Service
public class IpfsStorageService {

    @Value("${app.ipfs.gateway-url:https://gateway.pinata.cloud/ipfs/}")
    private String gatewayUrl;

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

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
