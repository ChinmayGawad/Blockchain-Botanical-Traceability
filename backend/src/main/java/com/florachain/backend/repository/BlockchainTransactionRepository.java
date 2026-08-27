package com.florachain.backend.repository;

import com.florachain.backend.entity.BlockchainTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockchainTransactionRepository extends JpaRepository<BlockchainTransactionEntity, String> {
    List<BlockchainTransactionEntity> findByProductIdOrderByTimestampDesc(String productId);
    List<BlockchainTransactionEntity> findAllByOrderByTimestampDesc();
}
