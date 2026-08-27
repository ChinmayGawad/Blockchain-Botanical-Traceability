package com.florachain.backend.controller;

import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.dto.ShipmentDTOs.CreateShipmentRequest;
import com.florachain.backend.dto.ShipmentDTOs.ShipmentResponse;
import com.florachain.backend.dto.ShipmentDTOs.UpdateShipmentStatusRequest;
import com.florachain.backend.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DISTRIBUTOR', 'ADMIN')")
    public ResponseEntity<ProductResponse> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        return new ResponseEntity<>(shipmentService.createShipment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DISTRIBUTOR', 'ADMIN')")
    public ResponseEntity<ProductResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(shipmentService.updateShipmentStatus(id, request));
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }
}
