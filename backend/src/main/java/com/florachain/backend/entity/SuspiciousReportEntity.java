package com.florachain.backend.entity;

import com.florachain.backend.enums.ReportReason;
import com.florachain.backend.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "suspicious_reports", indexes = {
    @Index(name = "idx_report_product_id", columnList = "product_id"),
    @Index(name = "idx_report_status", columnList = "status"),
    @Index(name = "idx_report_created", columnList = "reported_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuspiciousReportEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "REP-001"

    @Column(name = "product_id", nullable = false, length = 64)
    private String productId;

    @Column(name = "batch_id", length = 64)
    private String batchId;

    @Column(name = "reporter_name", nullable = false, length = 150)
    private String reporterName;

    @Column(name = "reporter_email", nullable = false, length = 128)
    private String reporterEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 32)
    private ReportReason reason;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ReportStatus status;

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;
}
