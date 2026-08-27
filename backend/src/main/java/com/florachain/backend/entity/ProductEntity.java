package com.florachain.backend.entity;

import com.florachain.backend.enums.CultivationMethod;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.VerificationState;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_batch_id", columnList = "batch_id", unique = true),
    @Index(name = "idx_product_status", columnList = "status"),
    @Index(name = "idx_product_farmer", columnList = "farmer_id"),
    @Index(name = "idx_product_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "BOT-2024-8901"

    @Column(name = "batch_id", nullable = false, unique = true, length = 64)
    private String batchId; // e.g. "ASH-2024-089"

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "botanical_name", nullable = false, length = 200)
    private String botanicalName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "cultivation_method", nullable = false, length = 32)
    private CultivationMethod cultivationMethod;

    @Column(name = "quantity_kg", nullable = false)
    private Double quantityKg;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(name = "farm_location", nullable = false, length = 256)
    private String farmLocation;

    @Column(name = "gps_lat")
    private Double gpsLat;

    @Column(name = "gps_lng")
    private Double gpsLng;

    @Column(name = "farmer_id", nullable = false, length = 64)
    private String farmerId;

    @Column(name = "farmer_name", nullable = false, length = 150)
    private String farmerName;

    @Column(name = "farmer_org", length = 150)
    private String farmerOrg;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ProductStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_state", nullable = false, length = 32)
    private VerificationState verificationState;

    @Column(name = "qr_code_value", length = 512)
    private String qrCodeValue;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "created_timestamp", nullable = false)
    private LocalDateTime createdTimestamp;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_active_compounds", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "compound_name")
    @Builder.Default
    private List<String> activeCompounds = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CertificateEntity> certificates = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ProcessingDetailsEntity processingDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private LabReportEntity labReport;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ShipmentEntity shipmentDetails;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private RetailDetailsEntity retailDetails;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<TimelineEventEntity> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("timestamp DESC")
    @Builder.Default
    private List<BlockchainTransactionEntity> blockchainTransactions = new ArrayList<>();
}
