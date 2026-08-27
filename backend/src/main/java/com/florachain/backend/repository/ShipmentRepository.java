package com.florachain.backend.repository;

import com.florachain.backend.entity.ShipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<ShipmentEntity, String> {
    Optional<ShipmentEntity> findByProductId(String productId);
    Optional<ShipmentEntity> findByTrackingNumber(String trackingNumber);
    List<ShipmentEntity> findByDistributorId(String distributorId);
    List<ShipmentEntity> findByStatus(String status);
}
