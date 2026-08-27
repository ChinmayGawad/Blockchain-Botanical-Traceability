package com.florachain.backend.controller;

import com.florachain.backend.dto.ReportDTOs.CreateReportRequest;
import com.florachain.backend.dto.ReportDTOs.ReportResponse;
import com.florachain.backend.dto.ReportDTOs.UpdateReportStatusRequest;
import com.florachain.backend.enums.ReportStatus;
import com.florachain.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(@Valid @RequestBody CreateReportRequest request) {
        return new ResponseEntity<>(reportService.submitReport(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports(@RequestParam(required = false) @Nullable ReportStatus status) {
        return ResponseEntity.ok(reportService.getAllReports(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable String id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> updateReportStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateReportStatusRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request));
    }
}
