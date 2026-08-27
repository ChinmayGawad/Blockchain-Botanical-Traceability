package com.florachain.backend.controller;

import com.florachain.backend.dto.VerificationDTOs.VerificationResultResponse;
import com.florachain.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/{identifier}")
    public ResponseEntity<VerificationResultResponse> verifyProduct(@PathVariable String identifier) {
        return ResponseEntity.ok(verificationService.verifyProduct(identifier));
    }
}
