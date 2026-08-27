package com.florachain.backend.controller;

import com.florachain.backend.dto.LabDTOs.LabTestRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.service.LaboratoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{id}")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @PostMapping("/lab-test")
    @PreAuthorize("hasAnyRole('LABORATORY', 'ADMIN')")
    public ResponseEntity<ProductResponse> submitLabTest(
            @PathVariable String id,
            @Valid @RequestBody LabTestRequest request) {
        return ResponseEntity.ok(laboratoryService.submitLabReport(id, request));
    }
}
