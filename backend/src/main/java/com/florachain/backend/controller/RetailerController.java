package com.florachain.backend.controller;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.RetailDTOs.RetailReceiveRequest;
import com.florachain.backend.service.RetailerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{id}/retail-receive")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RETAILER', 'ADMIN')")
    public ResponseEntity<ProductResponse> receiveRetail(
            @PathVariable String id,
            @Valid @RequestBody RetailReceiveRequest request) {
        return ResponseEntity.ok(retailerService.receiveProductAtRetail(id, request));
    }
}
