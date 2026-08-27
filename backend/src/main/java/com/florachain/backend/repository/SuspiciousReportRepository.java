package com.florachain.backend.repository;

import com.florachain.backend.entity.SuspiciousReportEntity;
import com.florachain.backend.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuspiciousReportRepository extends JpaRepository<SuspiciousReportEntity, String> {
    List<SuspiciousReportEntity> findByProductId(String productId);
    List<SuspiciousReportEntity> findByStatus(ReportStatus status);
    List<SuspiciousReportEntity> findAllByOrderByReportedAtDesc();
}
