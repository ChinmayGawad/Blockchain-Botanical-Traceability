package com.florachain.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "retail_details", indexes = {
    @Index(name = "idx_retail_product_id", columnList = "product_id"),
    @Index(name = "idx_retail_retailer_id", columnList = "retailer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailDetailsEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "RET-2024-8901"

    @Column(name = "retailer_id", length = 64)
    private String retailerId;

    @Column(name = "retailer_name", nullable = false, length = 150)
    private String retailerName;

    @Column(name = "store_location", nullable = false, length = 256)
    private String storeLocation;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "shelf_batch_id", length = 64)
    private String shelfBatchId;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "qr_code_generated", nullable = false)
    private Boolean qrCodeGenerated;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private ProductEntity product;
}
