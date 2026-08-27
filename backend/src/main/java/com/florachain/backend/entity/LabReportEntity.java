package com.florachain.backend.entity;

import com.florachain.backend.enums.TestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_reports", indexes = {
    @Index(name = "idx_lab_product_id", columnList = "product_id"),
    @Index(name = "idx_lab_certificate_cid", columnList = "certificate_ipfs_cid")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabReportEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "LAB-2024-8901"

    @Column(name = "lab_id", length = 64)
    private String labId;

    @Column(name = "lab_name", nullable = false, length = 150)
    private String labName;

    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    @Column(name = "tested_by", length = 128)
    private String testedBy;

    @Column(name = "purity_percentage", nullable = false)
    private Double purityPercentage;

    @Column(name = "moisture_percentage", nullable = false)
    private Double moisturePercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "heavy_metals_status", nullable = false, length = 16)
    private TestStatus heavyMetalsStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "microbial_test_status", nullable = false, length = 16)
    private TestStatus microbialTestStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "pesticide_residue_status", nullable = false, length = 16)
    private TestStatus pesticideResidueStatus;

    @OneToMany(mappedBy = "labReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<LabTestParameterEntity> parameters = new ArrayList<>();

    @Column(name = "certificate_ipfs_cid", length = 128)
    private String certificateIpfsCid;

    @Column(name = "certificate_url", length = 512)
    private String certificateUrl;

    @Column(name = "overall_result", nullable = false, length = 32)
    private String overallResult; // "APPROVED" or "REJECTED"

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private ProductEntity product;
}
