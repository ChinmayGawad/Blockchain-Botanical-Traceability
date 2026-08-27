package com.florachain.backend.controller;

import com.florachain.backend.dto.BlockchainDTOs.BlockchainStatsResponse;
import com.florachain.backend.dto.BlockchainDTOs.TransactionDto;
import com.florachain.backend.service.BlockchainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blockchain")
@RequiredArgsConstructor
public class BlockchainController {

    private final BlockchainService blockchainService;

    @GetMapping("/stats")
    public ResponseEntity<BlockchainStatsResponse> getNetworkStats() {
        return ResponseEntity.ok(blockchainService.getNetworkStats());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getAllTransactions() {
        return ResponseEntity.ok(blockchainService.getAllTransactions());
    }

    @GetMapping("/transactions/product/{productId}")
    public ResponseEntity<List<TransactionDto>> getTransactionsByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(blockchainService.getTransactionsByProductId(productId));
    }
}
