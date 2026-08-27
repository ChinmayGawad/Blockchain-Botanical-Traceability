package com.florachain.backend.entity;

import com.florachain.backend.enums.TransportType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "shipments", indexes = {
    @Index(name = "idx_shipment_product_id", columnList = "product_id"),
    @Index(name = "idx_shipment_tracking", columnList = "tracking_number", unique = true),
    @Index(name = "idx_shipment_distributor", columnList = "distributor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "SHP-2024-8901"

    @Column(name = "distributor_id", length = 64)
    private String distributorId;

    @Column(name = "distributor_name", nullable = false, length = 150)
    private String distributorName;

    @Column(name = "source_location", nullable = false, length = 256)
    private String sourceLocation;

    @Column(name = "destination_location", nullable = false, length = 256)
    private String destinationLocation;

    @Column(name = "vehicle_number", nullable = false, length = 64)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_type", nullable = false, length = 32)
    private TransportType transportType;

    @Column(name = "temperature_range", nullable = false, length = 64)
    private String temperatureRange;

    @Column(name = "dispatch_date", nullable = false)
    private LocalDate dispatchDate;

    @Column(name = "expected_delivery_date", nullable = false)
    private LocalDate expectedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDate actualDeliveryDate;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // "CREATED", "IN_TRANSIT", "DELIVERED"

    @Column(name = "tracking_number", nullable = false, unique = true, length = 128)
    private String trackingNumber;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private ProductEntity product;
}
