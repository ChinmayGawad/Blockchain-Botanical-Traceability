package com.florachain.backend.controller;

import com.florachain.backend.dto.ProductDTOs.ProductRegistrationRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.VerificationDTOs.TimelineEventDto;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.security.UserPrincipal;
import com.florachain.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ProductResponse> registerProduct(@Valid @RequestBody ProductRegistrationRequest request) {
        return new ResponseEntity<>(productService.registerProduct(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) @Nullable ProductStatus status,
            @RequestParam(required = false) @Nullable ProductCategory category,
            @RequestParam(required = false) @Nullable String search,
            @AuthenticationPrincipal @Nullable UserPrincipal currentUser) {
        return ResponseEntity.ok(productService.getAllProducts(status, category, search, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductByIdOrBatch(id));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<TimelineEventDto>> getProductTimeline(@PathVariable String id) {
        ProductResponse product = productService.getProductByIdOrBatch(id);
        return ResponseEntity.ok(product.getTimeline());
    }
}
