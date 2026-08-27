package com.florachain.backend.repository;

import com.florachain.backend.entity.RetailDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetailDetailsRepository extends JpaRepository<RetailDetailsEntity, String> {
    Optional<RetailDetailsEntity> findByProductId(String productId);
    List<RetailDetailsEntity> findByRetailerId(String retailerId);
}
