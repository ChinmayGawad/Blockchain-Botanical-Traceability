package com.florachain.backend.repository;

import com.florachain.backend.entity.ProcessingDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProcessingRepository extends JpaRepository<ProcessingDetailsEntity, String> {
    Optional<ProcessingDetailsEntity> findByProductId(String productId);
    Optional<ProcessingDetailsEntity> findByProcessorId(String processorId);
}
