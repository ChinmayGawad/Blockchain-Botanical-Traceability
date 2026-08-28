package com.florachain.backend.service;

import com.florachain.backend.dto.BlockchainDTOs.TransactionDto;
import com.florachain.backend.dto.LabDTOs;
import com.florachain.backend.dto.ProcessingDTOs;
import com.florachain.backend.dto.ProductDTOs.CertificateDto;
import com.florachain.backend.dto.ProductDTOs.GpsCoordinatesDto;
import com.florachain.backend.dto.ProductDTOs.ProductRegistrationRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.RetailDTOs;
import com.florachain.backend.dto.ShipmentDTOs;
import com.florachain.backend.dto.VerificationDTOs.TimelineEventDto;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.CertificateEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final IpfsStorageService ipfsStorageService;

    @Transactional
    public ProductResponse registerProduct(ProductRegistrationRequest request) {
        if (request.getBatchId() == null || request.getBatchId().isBlank()) {
            throw new BadRequestException("Batch ID is required for product registration");
        }
        if (productRepository.findByBatchId(request.getBatchId().trim()).isPresent()) {
            throw new BadRequestException("A product with Batch ID '" + request.getBatchId() + "' already exists");
        }

        String year = String.valueOf(LocalDate.now().getYear());
        int randomNum = 1000 + (int) (Math.random() * 9000);
        String productId = "BOT-" + year + "-" + randomNum;
        String qrCodeValue = "https://florachain.verify/" + productId;

        LocalDate harvestDate;
        if (request.getHarvestDate() != null && !request.getHarvestDate().isBlank()) {
            try {
                harvestDate = LocalDate.parse(request.getHarvestDate().trim());
            } catch (Exception e) {
                harvestDate = LocalDate.now();
            }
        } else {
            harvestDate = LocalDate.now();
        }

        String farmerName = request.getFarmerName() != null && !request.getFarmerName().isBlank() ? request.getFarmerName().trim() : "Organic Farmer";
        String farmLocation = request.getFarmLocation() != null && !request.getFarmLocation().isBlank() ? request.getFarmLocation().trim() : "Certified Botanical Estate";

        ProductEntity product = ProductEntity.builder()
                .id(productId)
                .batchId(request.getBatchId().trim())
                .name(request.getName() != null ? request.getName().trim() : "Botanical Herb")
                .botanicalName(request.getBotanicalName() != null ? request.getBotanicalName().trim() : "Botanical Specimen")
                .category(request.getCategory() != null ? request.getCategory() : ProductCategory.MEDICINAL_HERB)
                .cultivationMethod(request.getCultivationMethod() != null ? request.getCultivationMethod() : com.florachain.backend.enums.CultivationMethod.ORGANIC)
                .quantityKg(request.getQuantityKg() != null ? request.getQuantityKg() : 100.0)
                .harvestDate(harvestDate)
                .farmLocation(farmLocation)
                .gpsLat(request.getGpsCoordinates() != null ? request.getGpsCoordinates().getLat() : 24.4649)
                .gpsLng(request.getGpsCoordinates() != null ? request.getGpsCoordinates().getLng() : 74.8718)
                .farmerId(request.getFarmerId() != null ? request.getFarmerId() : "USR-FRM-01")
                .farmerName(farmerName)
                .farmerOrg(request.getFarmerOrg() != null ? request.getFarmerOrg() : "Certified Farm Co-op")
                .status(ProductStatus.REGISTERED)
                .verificationState(VerificationState.IN_PROGRESS)
                .qrCodeValue(qrCodeValue)
                .description(request.getDescription() != null ? request.getDescription() : "Freshly harvested certified botanical batch.")
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl() : "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600")
                .createdTimestamp(LocalDateTime.now())
                .activeCompounds(request.getActiveCompounds() != null ? request.getActiveCompounds() : List.of("Standard Botanical Extract"))
                .certificates(new ArrayList<>())
                .timeline(new ArrayList<>())
                .blockchainTransactions(new ArrayList<>())
                .build();

        if (request.getCertificates() != null) {
            for (CertificateDto cDto : request.getCertificates()) {
                String certCid = cDto.getIpfsCid() != null ? cDto.getIpfsCid() : ipfsStorageService.generateCid(cDto.getCertificateNumber() != null ? cDto.getCertificateNumber() : "CERT");
                CertificateEntity cert = CertificateEntity.builder()
                        .id(cDto.getId() != null ? cDto.getId() : "CERT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                        .type(cDto.getType() != null ? cDto.getType() : "Standard Quality Certificate")
                        .certificateNumber(cDto.getCertificateNumber() != null ? cDto.getCertificateNumber() : "CERT-REF-001")
                        .issuingAuthority(cDto.getIssuingAuthority() != null ? cDto.getIssuingAuthority() : "Organic Certification Authority")
                        .ipfsCid(certCid)
                        .status("VALID")
                        .product(product)
                        .build();
                product.getCertificates().add(cert);
            }
        }

        ProductEntity savedProduct = productRepository.save(product);

        // Record on blockchain
        BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                savedProduct,
                "FARM_HARVEST",
                "Product Batch Registered",
                savedProduct.getFarmerName(),
                UserRole.FARMER,
                "BatchId: " + savedProduct.getBatchId() + ", Qty: " + savedProduct.getQuantityKg() + "kg"
        );

        // Add timeline event
        TimelineEventEntity event = TimelineEventEntity.builder()
                .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title("Harvest & Batch Registration")
                .stage("FARM_HARVEST")
                .timestamp(LocalDateTime.now())
                .actorName(savedProduct.getFarmerName())
                .actorRole(UserRole.FARMER)
                .location(savedProduct.getFarmLocation())
                .description("Harvested " + savedProduct.getQuantityKg() + "kg of " + savedProduct.getName() + " under " + savedProduct.getCultivationMethod() + " cultivation.")
                .txHash(tx.getTxId())
                .status("COMPLETED")
                .product(savedProduct)
                .build();

        timelineEventRepository.save(event);

        return mapToProductResponse(productRepository.findById(savedProduct.getId()).orElse(savedProduct));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(
            @Nullable ProductStatus status,
            @Nullable ProductCategory category,
            @Nullable String search,
            @Nullable com.florachain.backend.security.UserPrincipal currentUser) {
        List<ProductEntity> products = productRepository.findAll();

        if (currentUser != null && currentUser.getRole() != null) {
            UserRole role = currentUser.getRole();
            if (role == UserRole.FARMER) {
                products = products.stream()
                        .filter(p -> (p.getFarmerId() != null && p.getFarmerId().equalsIgnoreCase(currentUser.getId()))
                                || (p.getFarmerOrg() != null && currentUser.getOrganization() != null && p.getFarmerOrg().equalsIgnoreCase(currentUser.getOrganization()))
                                || (p.getFarmerName() != null && currentUser.getName() != null && p.getFarmerName().toLowerCase().contains(currentUser.getName().toLowerCase())))
                        .collect(Collectors.toList());
            } else if (role == UserRole.PROCESSOR) {
                products = products.stream()
                        .filter(p -> p.getStatus() == ProductStatus.REGISTERED
                                || (p.getProcessingDetails() != null && (
                                (p.getProcessingDetails().getProcessorId() != null && p.getProcessingDetails().getProcessorId().equalsIgnoreCase(currentUser.getId()))
                                        || (p.getProcessingDetails().getProcessorName() != null && currentUser.getName() != null && p.getProcessingDetails().getProcessorName().toLowerCase().contains(currentUser.getName().toLowerCase()))
                        )))
                        .collect(Collectors.toList());
            } else if (role == UserRole.LABORATORY) {
                products = products.stream()
                        .filter(p -> p.getStatus() == ProductStatus.IN_TESTING || p.getStatus() == ProductStatus.PROCESSING
                                || (p.getLabReport() != null && (
                                (p.getLabReport().getLabId() != null && p.getLabReport().getLabId().equalsIgnoreCase(currentUser.getId()))
                                        || (p.getLabReport().getLabName() != null && currentUser.getOrganization() != null && p.getLabReport().getLabName().toLowerCase().contains(currentUser.getOrganization().toLowerCase()))
                        )))
                        .collect(Collectors.toList());
            } else if (role == UserRole.DISTRIBUTOR) {
                products = products.stream()
                        .filter(p -> p.getStatus() == ProductStatus.APPROVED
                                || (p.getShipmentDetails() != null && (
                                (p.getShipmentDetails().getDistributorId() != null && p.getShipmentDetails().getDistributorId().equalsIgnoreCase(currentUser.getId()))
                                        || (p.getShipmentDetails().getDistributorName() != null && currentUser.getName() != null && p.getShipmentDetails().getDistributorName().toLowerCase().contains(currentUser.getName().toLowerCase()))
                        )))
                        .collect(Collectors.toList());
            } else if (role == UserRole.RETAILER) {
                products = products.stream()
                        .filter(p -> p.getStatus() == ProductStatus.IN_TRANSIT || p.getStatus() == ProductStatus.DELIVERED
                                || (p.getRetailDetails() != null && (
                                (p.getRetailDetails().getRetailerId() != null && p.getRetailDetails().getRetailerId().equalsIgnoreCase(currentUser.getId()))
                                        || (p.getRetailDetails().getRetailerName() != null && currentUser.getName() != null && p.getRetailDetails().getRetailerName().toLowerCase().contains(currentUser.getName().toLowerCase()))
                        )))
                        .collect(Collectors.toList());
            }
            // ADMIN sees all products
        }

        if (status != null) {
            products = products.stream().filter(p -> p.getStatus() == status).collect(Collectors.toList());
        }
        if (category != null) {
            products = products.stream().filter(p -> p.getCategory() == category).collect(Collectors.toList());
        }
        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            products = products.stream().filter(p ->
                    (p.getName() != null && p.getName().toLowerCase().contains(query)) ||
                    (p.getBatchId() != null && p.getBatchId().toLowerCase().contains(query)) ||
                    (p.getBotanicalName() != null && p.getBotanicalName().toLowerCase().contains(query))
            ).collect(Collectors.toList());
        }

        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByIdOrBatch(String idOrBatch) {
        ProductEntity product = productRepository.findByIdOrBatchId(idOrBatch)
                .orElseThrow(() -> new ResourceNotFoundException("Botanical product not found for identifier: " + idOrBatch));
        return mapToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductEntity getProductEntityByIdOrBatch(String idOrBatch) {
        return productRepository.findByIdOrBatchId(idOrBatch)
                .orElseThrow(() -> new ResourceNotFoundException("Botanical product not found for identifier: " + idOrBatch));
    }

    @Nullable
    public ProductResponse mapToProductResponse(@Nullable ProductEntity p) {
        if (p == null) {
            return null;
        }
        return ProductResponse.builder()
                .id(p.getId())
                .batchId(p.getBatchId())
                .name(p.getName())
                .botanicalName(p.getBotanicalName())
                .category(p.getCategory())
                .cultivationMethod(p.getCultivationMethod())
                .quantityKg(p.getQuantityKg())
                .harvestDate(p.getHarvestDate() != null ? p.getHarvestDate().toString() : "")
                .farmLocation(p.getFarmLocation())
                .gpsCoordinates(new GpsCoordinatesDto(p.getGpsLat() != null ? p.getGpsLat() : 0.0, p.getGpsLng() != null ? p.getGpsLng() : 0.0))
                .farmerId(p.getFarmerId())
                .farmerName(p.getFarmerName())
                .farmerOrg(p.getFarmerOrg())
                .status(p.getStatus())
                .verificationState(p.getVerificationState())
                .qrCodeValue(p.getQrCodeValue())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .createdTimestamp(p.getCreatedTimestamp() != null ? p.getCreatedTimestamp().toString() : "")
                .activeCompounds(p.getActiveCompounds() != null ? p.getActiveCompounds() : List.of())
                .certificates(p.getCertificates() != null ? p.getCertificates().stream().map(c -> CertificateDto.builder()
                        .id(c.getId())
                        .type(c.getType())
                        .certificateNumber(c.getCertificateNumber())
                        .issuingAuthority(c.getIssuingAuthority())
                        .issueDate(c.getIssueDate() != null ? c.getIssueDate().toString() : "")
                        .expiryDate(c.getExpiryDate() != null ? c.getExpiryDate().toString() : "")
                        .ipfsCid(c.getIpfsCid())
                        .status(c.getStatus())
                        .build()).collect(Collectors.toList()) : List.of())
                .processingDetails(p.getProcessingDetails() != null ? ProcessingDTOs.ProcessingResponse.builder()
                        .processorId(p.getProcessingDetails().getProcessorId())
                        .processorName(p.getProcessingDetails().getProcessorName())
                        .processingDate(p.getProcessingDetails().getProcessingDate() != null ? p.getProcessingDetails().getProcessingDate().toString() : "")
                        .method(p.getProcessingDetails().getMethod())
                        .facilityLocation(p.getProcessingDetails().getFacilityLocation())
                        .initialQuantityKg(p.getProcessingDetails().getInitialQuantityKg())
                        .processedQuantityKg(p.getProcessingDetails().getProcessedQuantityKg())
                        .yieldLossPercentage(p.getProcessingDetails().getYieldLossPercentage())
                        .equipmentUsed(p.getProcessingDetails().getEquipmentUsed())
                        .ipfsDocumentCid(p.getProcessingDetails().getIpfsDocumentCid())
                        .notes(p.getProcessingDetails().getNotes())
                        .txHash(p.getProcessingDetails().getTxHash())
                        .build() : null)
                .labReport(p.getLabReport() != null ? LabDTOs.LabReportResponse.builder()
                        .labId(p.getLabReport().getLabId())
                        .labName(p.getLabReport().getLabName())
                        .testDate(p.getLabReport().getTestDate() != null ? p.getLabReport().getTestDate().toString() : "")
                        .testedBy(p.getLabReport().getTestedBy())
                        .purityPercentage(p.getLabReport().getPurityPercentage())
                        .moisturePercentage(p.getLabReport().getMoisturePercentage())
                        .heavyMetalsStatus(p.getLabReport().getHeavyMetalsStatus())
                        .microbialTestStatus(p.getLabReport().getMicrobialTestStatus())
                        .pesticideResidueStatus(p.getLabReport().getPesticideResidueStatus())
                        .parameters(p.getLabReport().getParameters() != null ? p.getLabReport().getParameters().stream().map(param -> LabDTOs.LabTestParameterDto.builder()
                                .name(param.getName())
                                .value(param.getValue())
                                .unit(param.getUnit())
                                .standardLimit(param.getStandardLimit())
                                .passed(param.getPassed())
                                .build()).collect(Collectors.toList()) : List.of())
                        .certificateIpfsCid(p.getLabReport().getCertificateIpfsCid())
                        .certificateUrl(p.getLabReport().getCertificateUrl())
                        .overallResult(p.getLabReport().getOverallResult())
                        .notes(p.getLabReport().getNotes())
                        .txHash(p.getLabReport().getTxHash())
                        .build() : null)
                .shipmentDetails(p.getShipmentDetails() != null ? ShipmentDTOs.ShipmentResponse.builder()
                        .shipmentId(p.getShipmentDetails().getId())
                        .distributorId(p.getShipmentDetails().getDistributorId())
                        .distributorName(p.getShipmentDetails().getDistributorName())
                        .sourceLocation(p.getShipmentDetails().getSourceLocation())
                        .destinationLocation(p.getShipmentDetails().getDestinationLocation())
                        .vehicleNumber(p.getShipmentDetails().getVehicleNumber())
                        .transportType(p.getShipmentDetails().getTransportType())
                        .temperatureRange(p.getShipmentDetails().getTemperatureRange())
                        .dispatchDate(p.getShipmentDetails().getDispatchDate() != null ? p.getShipmentDetails().getDispatchDate().toString() : "")
                        .expectedDeliveryDate(p.getShipmentDetails().getExpectedDeliveryDate() != null ? p.getShipmentDetails().getExpectedDeliveryDate().toString() : "")
                        .actualDeliveryDate(p.getShipmentDetails().getActualDeliveryDate() != null ? p.getShipmentDetails().getActualDeliveryDate().toString() : "")
                        .status(p.getShipmentDetails().getStatus())
                        .trackingNumber(p.getShipmentDetails().getTrackingNumber())
                        .txHash(p.getShipmentDetails().getTxHash())
                        .build() : null)
                .retailDetails(p.getRetailDetails() != null ? RetailDTOs.RetailResponse.builder()
                        .retailerId(p.getRetailDetails().getRetailerId())
                        .retailerName(p.getRetailDetails().getRetailerName())
                        .storeLocation(p.getRetailDetails().getStoreLocation())
                        .receivedDate(p.getRetailDetails().getReceivedDate() != null ? p.getRetailDetails().getReceivedDate().toString() : "")
                        .shelfBatchId(p.getRetailDetails().getShelfBatchId())
                        .unitPrice(p.getRetailDetails().getUnitPrice())
                        .qrCodeGenerated(p.getRetailDetails().getQrCodeGenerated())
                        .notes(p.getRetailDetails().getNotes())
                        .txHash(p.getRetailDetails().getTxHash())
                        .build() : null)
                .timeline(p.getTimeline() != null ? p.getTimeline().stream().map(t -> TimelineEventDto.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .stage(t.getStage())
                        .timestamp(t.getTimestamp() != null ? t.getTimestamp().toString() : "")
                        .actorName(t.getActorName())
                        .actorRole(t.getActorRole())
                        .location(t.getLocation())
                        .description(t.getDescription())
                        .txHash(t.getTxHash())
                        .status(t.getStatus())
                        .ipfsHash(t.getIpfsHash())
                        .build()).collect(Collectors.toList()) : List.of())
                .blockchainTransactions(p.getBlockchainTransactions() != null ? p.getBlockchainTransactions().stream().map(tx -> TransactionDto.builder()
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
                        .productId(p.getId())
                        .build()).collect(Collectors.toList()) : List.of())
                .build();
    }
}

