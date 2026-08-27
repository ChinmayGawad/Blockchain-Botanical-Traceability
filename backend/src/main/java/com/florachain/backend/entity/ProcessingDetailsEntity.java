package com.florachain.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processing_details", indexes = {
    @Index(name = "idx_proc_product_id", columnList = "product_id"),
    @Index(name = "idx_proc_processor_id", columnList = "processor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessingDetailsEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "PRC-2024-8901"

    @Column(name = "processor_id", length = 64)
    private String processorId;

    @Column(name = "processor_name", nullable = false, length = 150)
    private String processorName;

    @Column(name = "processing_date", nullable = false)
    private LocalDate processingDate;

    @Column(name = "method", nullable = false, length = 256)
    private String method;

    @Column(name = "facility_location", nullable = false, length = 256)
    private String facilityLocation;

    @Column(name = "initial_quantity_kg", nullable = false)
    private Double initialQuantityKg;

    @Column(name = "processed_quantity_kg", nullable = false)
    private Double processedQuantityKg;

    @Column(name = "yield_loss_percentage", nullable = false)
    private Double yieldLossPercentage;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "processing_equipment", joinColumns = @JoinColumn(name = "processing_id"))
    @Column(name = "equipment_name")
    @Builder.Default
    private List<String> equipmentUsed = new ArrayList<>();

    @Column(name = "ipfs_document_cid", length = 128)
    private String ipfsDocumentCid;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private ProductEntity product;
}
