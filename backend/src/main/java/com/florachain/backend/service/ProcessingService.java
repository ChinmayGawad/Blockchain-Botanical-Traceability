package com.florachain.backend.service;

import com.florachain.backend.dto.ProcessingDTOs.ProcessingRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.ProcessingDetailsEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.repository.ProcessingRepository;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessingService {

    private final ProductRepository productRepository;
    private final ProcessingRepository processingRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final ProductService productService;

    @Transactional
    public ProductResponse addProcessingDetails(String productId, ProcessingRequest request) {
        ProductEntity product = productService.getProductEntityByIdOrBatch(productId);

        if (product.getStatus() != ProductStatus.REGISTERED && product.getStatus() != ProductStatus.PROCESSING) {
            throw new BadRequestException("Product cannot be processed in its current status: " + product.getStatus());
        }

        double initialQty = request.getInitialQuantityKg() != null ? request.getInitialQuantityKg() : (product.getQuantityKg() != null ? product.getQuantityKg() : 0.0);
        double processedQty = request.getProcessedQuantityKg() != null ? request.getProcessedQuantityKg() : initialQty;
        double yieldLoss;
        if (request.getYieldLossPercentage() != null) {
            yieldLoss = request.getYieldLossPercentage();
        } else if (initialQty > 0) {
            yieldLoss = Math.round(((initialQty - processedQty) / initialQty * 100.0) * 100.0) / 100.0;
        } else {
            yieldLoss = 0.0;
        }

        LocalDate procDate;
        if (request.getProcessingDate() != null && !request.getProcessingDate().isBlank()) {
            try {
                procDate = LocalDate.parse(request.getProcessingDate().trim());
            } catch (Exception e) {
                procDate = LocalDate.now();
            }
        } else {
            procDate = LocalDate.now();
        }

        String processorName = request.getProcessorName() != null && !request.getProcessorName().isBlank() ?
                request.getProcessorName().trim() : "Standard Processing Facility";
        String method = request.getMethod() != null && !request.getMethod().isBlank() ? request.getMethod().trim() : "Standard Botanical Processing";
        String facilityLocation = request.getFacilityLocation() != null ? request.getFacilityLocation() : "Certified Extraction Facility";

        // Record on blockchain
        BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                product,
                "PROCESSING",
                "Batch Processed & Standardized",
                processorName,
                UserRole.PROCESSOR,
                "Method: " + method + ", OutQty: " + processedQty + "kg"
        );

        String ipfsCid = request.getIpfsDocumentCid() != null && !request.getIpfsDocumentCid().isBlank() ?
                request.getIpfsDocumentCid().trim() : "Qm" + UUID.randomUUID().toString().replace("-", "");

        ProcessingDetailsEntity processing = ProcessingDetailsEntity.builder()
                .id("PRC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .processorId(request.getProcessorId() != null ? request.getProcessorId() : "USR-PRC-01")
                .processorName(processorName)
                .processingDate(procDate)
                .method(method)
                .facilityLocation(facilityLocation)
                .initialQuantityKg(initialQty)
                .processedQuantityKg(processedQty)
                .yieldLossPercentage(yieldLoss)
                .equipmentUsed(request.getEquipmentUsed() != null ? request.getEquipmentUsed() : List.of("Standard Bio-Extractor"))
                .ipfsDocumentCid(ipfsCid)
                .notes(request.getNotes() != null ? request.getNotes() : "Standard bio-processing and standardization completed.")
                .txHash(tx.getTxId())
                .product(product)
                .build();

        processingRepository.save(processing);

        product.setProcessingDetails(processing);
        product.setStatus(ProductStatus.PROCESSED);
        productRepository.save(product);

        // Add timeline event
        TimelineEventEntity event = TimelineEventEntity.builder()
                .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title("Bio-Processing & Extraction")
                .stage("PROCESSING")
                .timestamp(LocalDateTime.now())
                .actorName(processorName)
                .actorRole(UserRole.PROCESSOR)
                .location(facilityLocation)
                .description("Processed " + initialQty + "kg using " + method + ". Yield: " + processedQty + "kg (" + yieldLoss + "% loss).")
                .txHash(tx.getTxId())
                .status("COMPLETED")
                .ipfsHash(processing.getIpfsDocumentCid())
                .product(product)
                .build();

        timelineEventRepository.save(event);

        return productService.getProductByIdOrBatch(product.getId());
    }
}

