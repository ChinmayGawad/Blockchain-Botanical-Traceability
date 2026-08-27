package com.florachain.backend.service;

import com.florachain.backend.dto.ReportDTOs.CreateReportRequest;
import com.florachain.backend.dto.ReportDTOs.ReportResponse;
import com.florachain.backend.dto.ReportDTOs.UpdateReportStatusRequest;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.SuspiciousReportEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.ReportReason;
import com.florachain.backend.enums.ReportStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.SuspiciousReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final SuspiciousReportRepository suspiciousReportRepository;
    private final ProductRepository productRepository;

    @Transactional
    public ReportResponse submitReport(CreateReportRequest request) {
        if (request.getProductId() == null || request.getProductId().isBlank()) {
            throw new BadRequestException("Product ID is required for reporting an anomaly");
        }

        String reportId = "REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        SuspiciousReportEntity report = SuspiciousReportEntity.builder()
                .id(reportId)
                .productId(request.getProductId().trim())
                .batchId(request.getBatchId() != null ? request.getBatchId().trim() : request.getProductId().trim())
                .reporterName(request.getReporterName() != null ? request.getReporterName().trim() : "Anonymous Citizen")
                .reporterEmail(request.getReporterEmail() != null ? request.getReporterEmail().trim().toLowerCase() : "")
                .reason(request.getReason() != null ? request.getReason() : ReportReason.OTHER)
                .description(request.getDescription() != null ? request.getDescription().trim() : "Suspicious activity reported.")
                .reportedAt(LocalDateTime.now())
                .status(ReportStatus.PENDING_REVIEW)
                .build();

        SuspiciousReportEntity saved = suspiciousReportRepository.save(report);
        return mapToReportResponse(saved);
    }

    @Transactional
    public ReportResponse updateReportStatus(String reportId, UpdateReportStatusRequest request) {
        SuspiciousReportEntity report = suspiciousReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        if (request.getStatus() != null) {
            report.setStatus(request.getStatus());
        }
        if (request.getAdminNotes() != null) {
            report.setAdminNotes(request.getAdminNotes());
        }

        // If fraud is confirmed, flag the product entity as suspicious
        if (request.getStatus() == ReportStatus.CONFIRMED_FRAUD) {
            Optional<ProductEntity> productOpt = productRepository.findByIdOrBatchId(report.getProductId());
            productOpt.ifPresent(p -> {
                p.setStatus(ProductStatus.SUSPICIOUS);
                p.setVerificationState(VerificationState.SUSPICIOUS);
                productRepository.save(p);
            });
        }

        SuspiciousReportEntity saved = suspiciousReportRepository.save(report);
        return mapToReportResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports(@Nullable ReportStatus status) {
        List<SuspiciousReportEntity> list = status != null ?
                suspiciousReportRepository.findByStatus(status) :
                suspiciousReportRepository.findAllByOrderByReportedAtDesc();

        return list.stream().map(this::mapToReportResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportById(String reportId) {
        SuspiciousReportEntity report = suspiciousReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
        return mapToReportResponse(report);
    }

    @Nullable
    private ReportResponse mapToReportResponse(@Nullable SuspiciousReportEntity r) {
        if (r == null) {
            return null;
        }
        return ReportResponse.builder()
                .id(r.getId())
                .productId(r.getProductId())
                .batchId(r.getBatchId())
                .reporterName(r.getReporterName())
                .reporterEmail(r.getReporterEmail())
                .reason(r.getReason())
                .description(r.getDescription())
                .reportedAt(r.getReportedAt() != null ? r.getReportedAt().toString() : "")
                .status(r.getStatus())
                .adminNotes(r.getAdminNotes())
                .build();
    }
}

