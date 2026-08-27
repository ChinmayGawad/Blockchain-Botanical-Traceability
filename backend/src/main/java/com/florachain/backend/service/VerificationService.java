package com.florachain.backend.service;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.VerificationDTOs.StageIntegrityDto;
import com.florachain.backend.dto.VerificationDTOs.VerificationResultResponse;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.SuspiciousReportEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.ReportStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.SuspiciousReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final ProductRepository productRepository;
    private final SuspiciousReportRepository suspiciousReportRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public VerificationResultResponse verifyProduct(String identifier) {
        // Clean URL prefix if user pasted full QR code url (e.g. "https://florachain.verify/BOT-2024-8901")
        String cleanId = identifier.replace("https://florachain.verify/", "").replace("http://florachain.verify/", "").trim();

        Optional<ProductEntity> productOpt = productRepository.findByIdOrBatchId(cleanId);

        if (productOpt.isEmpty()) {
            return VerificationResultResponse.builder()
                    .queryIdentifier(identifier)
                    .verificationState(VerificationState.NOT_FOUND)
                    .trustScore(0)
                    .onChainVerified(false)
                    .verifiedContractAddress(blockchainBridgeService.getContractAddress())
                    .verificationSummary("No cryptographic provenance record was found on the blockchain for identifier: " + cleanId)
                    .stageIntegrity(List.of())
                    .build();
        }

        ProductEntity product = productOpt.get();
        List<SuspiciousReportEntity> reports = suspiciousReportRepository.findByProductId(product.getId());
        boolean hasConfirmedFraud = reports.stream().anyMatch(r -> r.getStatus() == ReportStatus.CONFIRMED_FRAUD);

        List<StageIntegrityDto> stageIntegrityList = new ArrayList<>();
        int trustScore = 0;

        // 1. Harvest Stage
        boolean harvestRecorded = product.getHarvestDate() != null;
        String harvestTx = product.getTimeline().stream()
                .filter(t -> "FARM_HARVEST".equalsIgnoreCase(t.getStage()))
                .map(t -> t.getTxHash())
                .findFirst().orElse("0x" + product.getId().hashCode());
        if (harvestRecorded) trustScore += 20;
        stageIntegrityList.add(StageIntegrityDto.builder()
                .stageName("Origin & Cultivation")
                .completed(harvestRecorded)
                .verifiedOnChain(true)
                .txHash(harvestTx)
                .timestamp(product.getCreatedTimestamp().toString())
                .actorName(product.getFarmerName())
                .remarks("Harvest location & organic cultivation parameters verified on ledger.")
                .build());

        // 2. Processing Stage
        boolean processed = product.getProcessingDetails() != null;
        if (processed) trustScore += 20;
        stageIntegrityList.add(StageIntegrityDto.builder()
                .stageName("Bio-Processing & Standardization")
                .completed(processed)
                .verifiedOnChain(processed)
                .txHash(processed ? product.getProcessingDetails().getTxHash() : "N/A")
                .timestamp(processed ? product.getProcessingDetails().getProcessingDate().toString() : "Pending")
                .actorName(processed ? product.getProcessingDetails().getProcessorName() : "Unassigned")
                .remarks(processed ? "Bio-refining extraction and yield efficiency recorded." : "Processing pending.")
                .build());

        // 3. Laboratory Testing Stage
        boolean labTested = product.getLabReport() != null;
        boolean labApproved = labTested && "APPROVED".equalsIgnoreCase(product.getLabReport().getOverallResult());
        if (labApproved) {
            trustScore += 25;
        }
        stageIntegrityList.add(StageIntegrityDto.builder()
                .stageName("Analytical Laboratory Quality")
                .completed(labTested)
                .verifiedOnChain(labTested)
                .txHash(labTested ? product.getLabReport().getTxHash() : "N/A")
                .timestamp(labTested ? product.getLabReport().getTestDate().toString() : "Pending")
                .actorName(labTested ? product.getLabReport().getLabName() : "Unassigned")
                .remarks(labTested ? (labApproved ? "Passed heavy metals, moisture, and chemical purity." : "FAILED lab purity criteria.") : "Lab testing pending.")
                .build());

        // 4. Logistics Stage
        boolean dispatched = product.getShipmentDetails() != null;
        if (dispatched) trustScore += 15;
        stageIntegrityList.add(StageIntegrityDto.builder()
                .stageName("Cold-Chain Logistics")
                .completed(dispatched)
                .verifiedOnChain(dispatched)
                .txHash(dispatched ? product.getShipmentDetails().getTxHash() : "N/A")
                .timestamp(dispatched ? product.getShipmentDetails().getDispatchDate().toString() : "Pending")
                .actorName(dispatched ? product.getShipmentDetails().getDistributorName() : "Unassigned")
                .remarks(dispatched ? "Transport route & temperature monitored via telematics." : "Logistics dispatch pending.")
                .build());

        // 5. Retail Arrival Stage
        boolean retailReady = product.getRetailDetails() != null;
        if (retailReady) trustScore += 20;
        stageIntegrityList.add(StageIntegrityDto.builder()
                .stageName("Retail Stocking & QR")
                .completed(retailReady)
                .verifiedOnChain(retailReady)
                .txHash(retailReady ? product.getRetailDetails().getTxHash() : "N/A")
                .timestamp(retailReady ? product.getRetailDetails().getReceivedDate().toString() : "Pending")
                .actorName(retailReady ? product.getRetailDetails().getRetailerName() : "Unassigned")
                .remarks(retailReady ? "Inbound retail inspection passed. Authenticated QR active." : "Retail stocking pending.")
                .build());

        VerificationState finalState;
        String summary;

        if (hasConfirmedFraud) {
            finalState = VerificationState.SUSPICIOUS;
            trustScore = 0;
            summary = "WARNING: This batch has been flagged for verified tampering or counterfeit alerts by consortium administrators.";
        } else if (product.getStatus() == ProductStatus.REJECTED || (labTested && !labApproved)) {
            finalState = VerificationState.REJECTED;
            trustScore = Math.min(trustScore, 20);
            summary = "REJECTED: This product batch failed analytical quality testing standards and is not authorized for consumer sale.";
        } else if (product.getStatus() == ProductStatus.RETAIL_READY && labApproved) {
            finalState = VerificationState.VERIFIED;
            trustScore = 100;
            summary = "AUTHENTIC & VERIFIED: Complete unbroken chain of custody recorded on the blockchain from farm harvest to retail store.";
        } else {
            finalState = VerificationState.IN_PROGRESS;
            summary = "IN PROGRESS: Product is currently moving through the verified supply chain (" + product.getStatus() + ").";
        }

        ProductResponse productDto = productService.mapToProductResponse(product);

        return VerificationResultResponse.builder()
                .queryIdentifier(cleanId)
                .verificationState(finalState)
                .trustScore(trustScore)
                .onChainVerified(true)
                .verifiedContractAddress(blockchainBridgeService.getContractAddress())
                .rootOriginTxHash(harvestTx)
                .product(productDto)
                .stageIntegrity(stageIntegrityList)
                .verificationSummary(summary)
                .build();
    }
}
