package com.florachain.backend.service;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.RetailDTOs.RetailReceiveRequest;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.RetailDetailsEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.RetailDetailsRepository;
import com.florachain.backend.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetailerService {

    private final ProductRepository productRepository;
    private final RetailDetailsRepository retailDetailsRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final ProductService productService;

    @Transactional
    public ProductResponse receiveProductAtRetail(String productId, RetailReceiveRequest request) {
        ProductEntity product = productService.getProductEntityByIdOrBatch(productId);

        if (product.getStatus() != ProductStatus.DELIVERED && product.getStatus() != ProductStatus.IN_TRANSIT) {
            throw new BadRequestException("Product must be delivered by distributor before retail receipt. Current status: " + product.getStatus());
        }
        if (product.getRetailDetails() != null) {
            throw new BadRequestException("Retail receipt has already been recorded for this product batch.");
        }

        String batch = product.getBatchId() != null ? product.getBatchId() : product.getId();
        String shelfBatchId = request.getShelfBatchId() != null && !request.getShelfBatchId().isBlank() ?
                request.getShelfBatchId().trim() :
                "SHELF-" + (batch.length() > 6 ? batch.substring(0, 6) : batch) + "-01";

        LocalDate receivedDate;
        if (request.getReceivedDate() != null && !request.getReceivedDate().isBlank()) {
            try {
                receivedDate = LocalDate.parse(request.getReceivedDate().trim());
            } catch (Exception e) {
                receivedDate = LocalDate.now();
            }
        } else {
            receivedDate = LocalDate.now();
        }

        String retailerName = request.getRetailerName() != null && !request.getRetailerName().isBlank() ?
                request.getRetailerName().trim() : "Botanical Retail Store";
        String storeLocation = request.getStoreLocation() != null && !request.getStoreLocation().isBlank() ?
                request.getStoreLocation().trim() : "Licensed Retail Outlet";
        double unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : 25.0;

        // Record on blockchain
        BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                product,
                "RETAIL_ARRIVAL",
                "Product Stocked & QR Generated",
                retailerName,
                UserRole.RETAILER,
                "Retailer: " + retailerName + ", Price: ₹" + unitPrice + ", ShelfBatch: " + shelfBatchId
        );

        RetailDetailsEntity retail = RetailDetailsEntity.builder()
                .id("RET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .retailerId(request.getRetailerId() != null ? request.getRetailerId() : "USR-RET-01")
                .retailerName(retailerName)
                .storeLocation(storeLocation)
                .receivedDate(receivedDate)
                .shelfBatchId(shelfBatchId)
                .unitPrice(unitPrice)
                .qrCodeGenerated(true)
                .notes(request.getNotes() != null ? request.getNotes() : "Passed inbound store inspection. Tamper-seal verified.")
                .txHash(tx.getTxId())
                .product(product)
                .build();

        retailDetailsRepository.save(retail);

        product.setRetailDetails(retail);
        product.setStatus(ProductStatus.RETAIL_READY);
        product.setVerificationState(VerificationState.VERIFIED);
        productRepository.save(product);

        // Add timeline event
        TimelineEventEntity event = TimelineEventEntity.builder()
                .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title("Retail Receipt & Consumer QR Activation")
                .stage("RETAIL_ARRIVAL")
                .timestamp(LocalDateTime.now())
                .actorName(retailerName)
                .actorRole(UserRole.RETAILER)
                .location(storeLocation)
                .description("Inbound physical inspection passed. Placed on shelf under Batch " + shelfBatchId + ". Unit Price: ₹" + unitPrice + ". Verification QR activated.")
                .txHash(tx.getTxId())
                .status("COMPLETED")
                .product(product)
                .build();

        timelineEventRepository.save(event);

        return productService.getProductByIdOrBatch(product.getId());
    }
}

