package com.florachain.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "certificates", indexes = {
    @Index(name = "idx_cert_product_id", columnList = "product_id"),
    @Index(name = "idx_cert_ipfs_cid", columnList = "ipfs_cid")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "CERT-001"

    @Column(name = "type", nullable = false, length = 128)
    private String type; // e.g. "USDA Organic Certificate"

    @Column(name = "certificate_number", nullable = false, length = 128)
    private String certificateNumber;

    @Column(name = "issuing_authority", nullable = false, length = 150)
    private String issuingAuthority;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "ipfs_cid", length = 128)
    private String ipfsCid;

    @Column(name = "status", length = 32)
    private String status; // "VALID", "EXPIRED", "REVOKED"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;
}
