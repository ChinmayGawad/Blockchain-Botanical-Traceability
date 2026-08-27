package com.florachain.backend.entity;

import com.florachain.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_events", indexes = {
    @Index(name = "idx_timeline_product_id", columnList = "product_id"),
    @Index(name = "idx_timeline_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEventEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id; // e.g. "EVT-001"

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "stage", nullable = false, length = 64)
    private String stage;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "actor_name", nullable = false, length = 150)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_role", nullable = false, length = 32)
    private UserRole actorRole;

    @Column(name = "location", length = 256)
    private String location;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "tx_hash", length = 128)
    private String txHash;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // "COMPLETED", "IN_PROGRESS", "FAILED", "PENDING"

    @Column(name = "ipfs_hash", length = 128)
    private String ipfsHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;
}
