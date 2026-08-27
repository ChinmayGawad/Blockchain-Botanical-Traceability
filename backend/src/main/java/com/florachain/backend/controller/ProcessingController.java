package com.florachain.backend.controller;

import com.florachain.backend.dto.ProcessingDTOs.ProcessingRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.service.ProcessingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{id}/processing")
@RequiredArgsConstructor
public class ProcessingController {

    private final ProcessingService processingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROCESSOR', 'ADMIN')")
    public ResponseEntity<ProductResponse> addProcessing(
            @PathVariable String id,
            @Valid @RequestBody ProcessingRequest request) {
        return ResponseEntity.ok(processingService.addProcessingDetails(id, request));
    }
}
