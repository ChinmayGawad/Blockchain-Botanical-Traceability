package com.florachain.backend.service;

import com.florachain.backend.dto.BlockchainDTOs.BlockchainStatsResponse;
import com.florachain.backend.dto.BlockchainDTOs.TransactionDto;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.repository.BlockchainTransactionRepository;
import com.florachain.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final BlockchainTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final BlockchainBridgeService blockchainBridgeService;

    @Transactional(readOnly = true)
    public BlockchainStatsResponse getNetworkStats() {
        Long blockHeight = blockchainBridgeService.getCurrentBlockHeight();
        long verifiedBatches = productRepository.findByStatus(ProductStatus.RETAIL_READY).size() +
                               productRepository.findByStatus(ProductStatus.APPROVED).size();
        boolean isConnected = blockchainBridgeService.isLiveNodeConnected();

        return BlockchainStatsResponse.builder()
                .blockHeight(blockHeight)
                .activePeers(isConnected ? 6 : 4)
                .channelName("botanical-supply-channel")
                .chaincodeVersion("BotanicalTraceability v1.0")
                .tps(isConnected ? 34.8 : 28.5)
                .verifiedBatches(verifiedBatches)
                .networkName(blockchainBridgeService.getNetworkName())
                .contractAddress(blockchainBridgeService.getContractAddress())
                .isLiveNodeConnected(isConnected)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getAllTransactions() {
        return transactionRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionsByProductId(String productId) {
        return transactionRepository.findByProductIdOrderByTimestampDesc(productId).stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    private TransactionDto mapToTransactionDto(BlockchainTransactionEntity tx) {
        return TransactionDto.builder()
                .txId(tx.getTxId())
                .blockNumber(tx.getBlockNumber())
                .timestamp(tx.getTimestamp() != null ? tx.getTimestamp().toString() : "")
                .stage(tx.getStage())
                .action(tx.getAction())
                .actor(tx.getActor())
                .actorRole(tx.getActorRole())
                .payloadHash(tx.getPayloadHash())
                .endorsingPeers(tx.getEndorsingPeers())
                .channelName(tx.getChannelName())
                .chaincode(tx.getChaincode())
                .productId(tx.getProduct() != null ? tx.getProduct().getId() : null)
                .build();
    }
}
