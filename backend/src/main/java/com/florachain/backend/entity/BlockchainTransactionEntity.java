package com.florachain.backend.entity;

import com.florachain.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blockchain_transactions", indexes = {
    @Index(name = "idx_tx_id", columnList = "tx_id", unique = true),
    @Index(name = "idx_tx_product_id", columnList = "product_id"),
    @Index(name = "idx_tx_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockchainTransactionEntity {

    @Id
    @Column(name = "tx_id", length = 128, nullable = false)
    private String txId; // Hash: 0x...

    @Column(name = "block_number", nullable = false)
    private Long blockNumber;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "stage", nullable = false, length = 64)
    private String stage;

    @Column(name = "action", nullable = false, length = 128)
    private String action;

    @Column(name = "actor", nullable = false, length = 150)
    private String actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_role", nullable = false, length = 32)
    private UserRole actorRole;

    @Column(name = "payload_hash", length = 128)
    private String payloadHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tx_endorsing_peers", joinColumns = @JoinColumn(name = "tx_id"))
    @Column(name = "peer_name")
    @Builder.Default
    private List<String> endorsingPeers = new ArrayList<>();

    @Column(name = "channel_name", length = 64)
    private String channelName;

    @Column(name = "chaincode", length = 64)
    private String chaincode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;
}
