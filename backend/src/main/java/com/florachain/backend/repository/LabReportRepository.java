package com.florachain.backend.repository;

import com.florachain.backend.entity.LabReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabReportRepository extends JpaRepository<LabReportEntity, String> {
    Optional<LabReportEntity> findByProductId(String productId);
    Optional<LabReportEntity> findByCertificateIpfsCid(String cid);
}
