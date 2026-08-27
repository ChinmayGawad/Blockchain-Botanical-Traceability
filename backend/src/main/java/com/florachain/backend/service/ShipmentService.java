package com.florachain.backend.service;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.ShipmentDTOs.CreateShipmentRequest;
import com.florachain.backend.dto.ShipmentDTOs.ShipmentResponse;
import com.florachain.backend.dto.ShipmentDTOs.UpdateShipmentStatusRequest;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.ShipmentEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.TransportType;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.ShipmentRepository;
import com.florachain.backend.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ProductRepository productRepository;
    private final ShipmentRepository shipmentRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final ProductService productService;

    @Transactional
    public ProductResponse createShipment(CreateShipmentRequest request) {
        ProductEntity product = productService.getProductEntityByIdOrBatch(request.getProductId());

        if (product.getStatus() != ProductStatus.APPROVED && product.getStatus() != ProductStatus.PROCESSED) {
            throw new BadRequestException("Product must be APPROVED or PROCESSED before dispatching shipment. Current status: " + product.getStatus());
        }

        String trackingNumber = request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank() ?
                request.getTrackingNumber().trim() :
                "TRK-FLC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LocalDate dispatchDate;
        if (request.getDispatchDate() != null && !request.getDispatchDate().isBlank()) {
            try {
                dispatchDate = LocalDate.parse(request.getDispatchDate().trim());
            } catch (Exception e) {
                dispatchDate = LocalDate.now();
            }
        } else {
            dispatchDate = LocalDate.now();
        }

        LocalDate expectedDeliveryDate;
        if (request.getExpectedDeliveryDate() != null && !request.getExpectedDeliveryDate().isBlank()) {
            try {
                expectedDeliveryDate = LocalDate.parse(request.getExpectedDeliveryDate().trim());
            } catch (Exception e) {
                expectedDeliveryDate = dispatchDate.plusDays(3);
            }
        } else {
            expectedDeliveryDate = dispatchDate.plusDays(3);
        }

        String distributorName = request.getDistributorName() != null && !request.getDistributorName().isBlank() ?
                request.getDistributorName().trim() : "TransGlobal Cold-Chain Logistics";
        String sourceLocation = request.getSourceLocation() != null ? request.getSourceLocation() : "Central Processing Depot";
        String destinationLocation = request.getDestinationLocation() != null ? request.getDestinationLocation() : "Regional Retail Hub";
        String vehicleNumber = request.getVehicleNumber() != null ? request.getVehicleNumber() : "FLC-TRK-101";
        TransportType transportType = request.getTransportType() != null ? request.getTransportType() : TransportType.REFRIGERATED_TRUCK;
        String temperatureRange = request.getTemperatureRange() != null ? request.getTemperatureRange() : "15°C – 25°C";

        // Record on blockchain
        BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                product,
                "LOGISTICS_TRANSIT",
                "Shipment Created & Dispatched",
                distributorName,
                UserRole.DISTRIBUTOR,
                "Tracking: " + trackingNumber + ", Route: " + sourceLocation + " -> " + destinationLocation
        );

        ShipmentEntity shipment = ShipmentEntity.builder()
                .id("SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .distributorId(request.getDistributorId() != null ? request.getDistributorId() : "USR-DST-01")
                .distributorName(distributorName)
                .sourceLocation(sourceLocation)
                .destinationLocation(destinationLocation)
                .vehicleNumber(vehicleNumber)
                .transportType(transportType)
                .temperatureRange(temperatureRange)
                .dispatchDate(dispatchDate)
                .expectedDeliveryDate(expectedDeliveryDate)
                .status("IN_TRANSIT")
                .trackingNumber(trackingNumber)
                .txHash(tx.getTxId())
                .product(product)
                .build();

        shipmentRepository.save(shipment);

        product.setShipmentDetails(shipment);
        product.setStatus(ProductStatus.IN_TRANSIT);
        productRepository.save(product);

        // Add timeline event
        TimelineEventEntity event = TimelineEventEntity.builder()
                .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title("Cold-Chain Logistics Dispatch")
                .stage("LOGISTICS_TRANSIT")
                .timestamp(LocalDateTime.now())
                .actorName(distributorName)
                .actorRole(UserRole.DISTRIBUTOR)
                .location(sourceLocation)
                .description("Dispatched via " + transportType + " (" + vehicleNumber + "). Temp maintained: " + temperatureRange + ". Tracking: " + trackingNumber)
                .txHash(tx.getTxId())
                .status("COMPLETED")
                .product(product)
                .build();

        timelineEventRepository.save(event);

        return productService.getProductByIdOrBatch(product.getId());
    }

    @Transactional
    public ProductResponse updateShipmentStatus(String shipmentIdOrProductId, UpdateShipmentStatusRequest request) {
        ShipmentEntity shipment = shipmentRepository.findById(shipmentIdOrProductId)
                .or(() -> shipmentRepository.findByProductId(shipmentIdOrProductId))
                .or(() -> shipmentRepository.findByTrackingNumber(shipmentIdOrProductId))
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for identifier: " + shipmentIdOrProductId));

        ProductEntity product = shipment.getProduct();
        String status = request.getStatus() != null ? request.getStatus().trim() : "IN_TRANSIT";
        shipment.setStatus(status);

        if ("DELIVERED".equalsIgnoreCase(status)) {
            LocalDate deliveryDate;
            if (request.getActualDeliveryDate() != null && !request.getActualDeliveryDate().isBlank()) {
                try {
                    deliveryDate = LocalDate.parse(request.getActualDeliveryDate().trim());
                } catch (Exception e) {
                    deliveryDate = LocalDate.now();
                }
            } else {
                deliveryDate = LocalDate.now();
            }
            shipment.setActualDeliveryDate(deliveryDate);

            if (product != null) {
                product.setStatus(ProductStatus.DELIVERED);

                // Record on blockchain
                BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                        product,
                        "LOGISTICS_DELIVERED",
                        "Shipment Delivered to Destination",
                        shipment.getDistributorName(),
                        UserRole.DISTRIBUTOR,
                        "Delivered tracking: " + shipment.getTrackingNumber()
                );

                // Timeline event
                TimelineEventEntity event = TimelineEventEntity.builder()
                        .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .title("Destination Delivery Confirmed")
                        .stage("LOGISTICS_DELIVERED")
                        .timestamp(LocalDateTime.now())
                        .actorName(shipment.getDistributorName())
                        .actorRole(UserRole.DISTRIBUTOR)
                        .location(shipment.getDestinationLocation())
                        .description("Delivered successfully to destination store/hub. Cold-chain parameters verified.")
                        .txHash(tx.getTxId())
                        .status("COMPLETED")
                        .product(product)
                        .build();

                timelineEventRepository.save(event);
                productRepository.save(product);
            }
        }

        shipmentRepository.save(shipment);

        String productId = product != null ? product.getId() : shipmentIdOrProductId;
        return productService.getProductByIdOrBatch(productId);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .map(s -> ShipmentResponse.builder()
                        .shipmentId(s.getId())
                        .distributorId(s.getDistributorId())
                        .distributorName(s.getDistributorName())
                        .sourceLocation(s.getSourceLocation())
                        .destinationLocation(s.getDestinationLocation())
                        .vehicleNumber(s.getVehicleNumber())
                        .transportType(s.getTransportType())
                        .temperatureRange(s.getTemperatureRange())
                        .dispatchDate(s.getDispatchDate() != null ? s.getDispatchDate().toString() : "")
                        .expectedDeliveryDate(s.getExpectedDeliveryDate() != null ? s.getExpectedDeliveryDate().toString() : "")
                        .actualDeliveryDate(s.getActualDeliveryDate() != null ? s.getActualDeliveryDate().toString() : "")
                        .status(s.getStatus())
                        .trackingNumber(s.getTrackingNumber())
                        .txHash(s.getTxHash())
                        .build())
                .collect(Collectors.toList());
    }
}

