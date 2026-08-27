package com.florachain.backend.service;

import com.florachain.backend.dto.LabDTOs.LabTestParameterDto;
import com.florachain.backend.dto.LabDTOs.LabTestRequest;
import com.florachain.backend.dto.ProductDTOs.ProductResponse;
import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.LabReportEntity;
import com.florachain.backend.entity.LabTestParameterEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.TestStatus;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.repository.LabReportRepository;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LaboratoryService {

    private final ProductRepository productRepository;
    private final LabReportRepository labReportRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final BlockchainBridgeService blockchainBridgeService;
    private final IpfsStorageService ipfsStorageService;
    private final ProductService productService;

    @Transactional
    public ProductResponse submitLabReport(String productId, LabTestRequest request) {
        ProductEntity product = productService.getProductEntityByIdOrBatch(productId);

        if (product.getStatus() != ProductStatus.PROCESSED && product.getStatus() != ProductStatus.IN_TESTING && product.getStatus() != ProductStatus.REGISTERED) {
            throw new BadRequestException("Product cannot undergo laboratory testing in its current status: " + product.getStatus());
        }

        double purity = request.getPurityPercentage() != null ? request.getPurityPercentage() : 0.0;
        double moisture = request.getMoisturePercentage() != null ? request.getMoisturePercentage() : 0.0;

        boolean isAutoApproved = request.getHeavyMetalsStatus() == TestStatus.PASS
                && request.getMicrobialTestStatus() == TestStatus.PASS
                && request.getPesticideResidueStatus() == TestStatus.PASS
                && purity >= 90.0;

        boolean approved = request.getApprove() != null ? request.getApprove() : isAutoApproved;
        String overallResult = approved ? "APPROVED" : "REJECTED";

        LocalDate testDate;
        if (request.getTestDate() != null && !request.getTestDate().isBlank()) {
            try {
                testDate = LocalDate.parse(request.getTestDate().trim());
            } catch (Exception e) {
                testDate = LocalDate.now();
            }
        } else {
            testDate = LocalDate.now();
        }

        String ipfsCid = request.getCertificateIpfsCid() != null && !request.getCertificateIpfsCid().isBlank() ?
                request.getCertificateIpfsCid().trim() :
                ipfsStorageService.generateCid(product.getId() + "_LAB_REPORT_" + System.currentTimeMillis());

        String labName = request.getLabName() != null && !request.getLabName().isBlank() ? request.getLabName().trim() : "Accredited Analytical Lab";

        // Record on blockchain
        BlockchainTransactionEntity tx = blockchainBridgeService.recordStageTransaction(
                product,
                "LAB_TESTING",
                "Quality Test Result: " + overallResult,
                labName,
                UserRole.LABORATORY,
                "Result: " + overallResult + ", Purity: " + purity + "%, IPFS: " + ipfsCid
        );

        LabReportEntity labReport = LabReportEntity.builder()
                .id("LAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .labId(request.getLabId() != null ? request.getLabId() : "USR-LAB-01")
                .labName(labName)
                .testDate(testDate)
                .testedBy(request.getTestedBy() != null ? request.getTestedBy() : "Senior Quality Analyst")
                .purityPercentage(purity)
                .moisturePercentage(moisture)
                .heavyMetalsStatus(request.getHeavyMetalsStatus() != null ? request.getHeavyMetalsStatus() : TestStatus.PASS)
                .microbialTestStatus(request.getMicrobialTestStatus() != null ? request.getMicrobialTestStatus() : TestStatus.PASS)
                .pesticideResidueStatus(request.getPesticideResidueStatus() != null ? request.getPesticideResidueStatus() : TestStatus.PASS)
                .parameters(new ArrayList<>())
                .certificateIpfsCid(ipfsCid)
                .certificateUrl(ipfsStorageService.getGatewayUrl(ipfsCid))
                .overallResult(overallResult)
                .notes(request.getNotes() != null ? request.getNotes() : "Standard botanical HPLC and ICP-MS testing completed.")
                .txHash(tx.getTxId())
                .product(product)
                .build();

        if (request.getParameters() != null) {
            for (LabTestParameterDto pDto : request.getParameters()) {
                LabTestParameterEntity param = LabTestParameterEntity.builder()
                        .name(pDto.getName() != null ? pDto.getName() : "Parameter")
                        .value(pDto.getValue() != null ? pDto.getValue() : "0")
                        .unit(pDto.getUnit() != null ? pDto.getUnit() : "ppm")
                        .standardLimit(pDto.getStandardLimit() != null ? pDto.getStandardLimit() : "N/A")
                        .passed(pDto.getPassed() != null ? pDto.getPassed() : true)
                        .labReport(labReport)
                        .build();
                labReport.getParameters().add(param);
            }
        }

        labReportRepository.save(labReport);

        product.setLabReport(labReport);
        if (approved) {
            product.setStatus(ProductStatus.APPROVED);
            product.setVerificationState(VerificationState.VERIFIED);
        } else {
            product.setStatus(ProductStatus.REJECTED);
            product.setVerificationState(VerificationState.REJECTED);
        }

        productRepository.save(product);

        // Add timeline event
        TimelineEventEntity event = TimelineEventEntity.builder()
                .id("EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title("Laboratory Quality & Purity Analysis")
                .stage("LAB_TESTING")
                .timestamp(LocalDateTime.now())
                .actorName(labName)
                .actorRole(UserRole.LABORATORY)
                .location("Accredited Analytical Testing Facility")
                .description("Chemical & microbiological verification completed: " + overallResult + " (Purity: " + purity + "%, Moisture: " + moisture + "%).")
                .txHash(tx.getTxId())
                .status(approved ? "COMPLETED" : "FAILED")
                .ipfsHash(ipfsCid)
                .product(product)
                .build();

        timelineEventRepository.save(event);

        return productService.getProductByIdOrBatch(product.getId());
    }
}

