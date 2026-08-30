package com.florachain.backend.config;

import com.florachain.backend.entity.BlockchainTransactionEntity;
import com.florachain.backend.entity.CertificateEntity;
import com.florachain.backend.entity.LabReportEntity;
import com.florachain.backend.entity.LabTestParameterEntity;
import com.florachain.backend.entity.ProcessingDetailsEntity;
import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.entity.RetailDetailsEntity;
import com.florachain.backend.entity.ShipmentEntity;
import com.florachain.backend.entity.SuspiciousReportEntity;
import com.florachain.backend.entity.TimelineEventEntity;
import com.florachain.backend.entity.UserEntity;
import com.florachain.backend.enums.CultivationMethod;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import com.florachain.backend.enums.ReportReason;
import com.florachain.backend.enums.ReportStatus;
import com.florachain.backend.enums.TestStatus;
import com.florachain.backend.enums.TransportType;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.UserStatus;
import com.florachain.backend.enums.VerificationState;
import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.SuspiciousReportRepository;
import com.florachain.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SuspiciousReportRepository suspiciousReportRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialization.");
            return;
        }

        log.info("Seeding initial botanical supply chain data...");
        seedUsers();
        seedProducts();
        seedReports();
        log.info("Database seeding completed successfully!");
    }

    private void seedUsers() {
        String encodedPassword = passwordEncoder.encode("password123");

        List<UserEntity> users = Arrays.asList(
                UserEntity.builder()
                        .id("USR-ADM-01")
                        .name("Dr. Rameshwar Varma")
                        .email("admin@florachain.org")
                        .password(encodedPassword)
                        .role(UserRole.ADMIN)
                        .organization("National Botanical Provenance Authority of India")
                        .location("New Delhi, India")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 1, 15))
                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                        .walletAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
                        .build(),

                UserEntity.builder()
                        .id("USR-FRM-01")
                        .name("Rajesh Patel")
                        .email("rajesh@vedicfarms.org")
                        .password(encodedPassword)
                        .role(UserRole.FARMER)
                        .organization("Vedic Agro Organic Cooperative")
                        .location("Neemuch, Madhya Pradesh, India")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 3, 10))
                        .certifications(Arrays.asList("India Organic NPOP", "FSSAI Jaivik Bharat", "AYUSH Premium Mark", "FairWild Certified"))
                        .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                        .walletAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
                        .build(),

                UserEntity.builder()
                        .id("USR-PRC-01")
                        .name("Mahesh Deshmukh")
                        .email("mahesh@phytoextracts.in")
                        .password(encodedPassword)
                        .role(UserRole.PROCESSOR)
                        .organization("PhytoExtracts Bio-Refining India Ltd")
                        .location("Peenya Industrial Complex, Bengaluru, Karnataka")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 4, 18))
                        .certifications(Arrays.asList("GMP Certified (AYUSH)", "ISO 22000:2018", "FSSAI Manufacturing License"))
                        .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                        .walletAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
                        .build(),

                UserEntity.builder()
                        .id("USR-LAB-01")
                        .name("Dr. Ananya Sharma")
                        .email("ananya@agrilabs.in")
                        .password(encodedPassword)
                        .role(UserRole.LABORATORY)
                        .organization("Eurofins NABL Analytical Testing Lab")
                        .location("Hyderabad & Bengaluru Biotech Park, India")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 2, 22))
                        .certifications(Arrays.asList("ISO/IEC 17025 NABL Accredited", "FSSAI Notified Laboratory", "AYUSH Approved Drug Testing Lab"))
                        .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150")
                        .walletAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906")
                        .build(),

                UserEntity.builder()
                        .id("USR-DST-01")
                        .name("Vikramjit Singh")
                        .email("vikram@transglobalcoldchain.in")
                        .password(encodedPassword)
                        .role(UserRole.DISTRIBUTOR)
                        .organization("TransGlobal Cold-Chain Logistics India Pvt Ltd")
                        .location("Nelamangala Logistics Park, Bengaluru & Delhi-NCR Hub")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 5, 11))
                        .certifications(Arrays.asList("GDP Compliant", "ISO 9001:2015", "FSSAI Logistics License"))
                        .avatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150")
                        .walletAddress("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65")
                        .build(),

                UserEntity.builder()
                        .id("USR-RET-01")
                        .name("Aarav Mehta")
                        .email("aarav@arogyawellness.in")
                        .password(encodedPassword)
                        .role(UserRole.RETAILER)
                        .organization("Arogya Pure Herbals & Ayurvedic Dispensary")
                        .location("Indiranagar Flagship Store, Bengaluru, Karnataka")
                        .status(UserStatus.ACTIVE)
                        .joinedDate(LocalDate.of(2023, 6, 1))
                        .certifications(Arrays.asList("FSSAI Retail License", "AYUSH Premium Retailer Guild", "Jaivik Bharat Member"))
                        .avatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150")
                        .walletAddress("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")
                        .build(),

                UserEntity.builder()
                        .id("USR-FRM-02")
                        .name("Kavita Sundaram")
                        .email("kavita@nilgiricoop.in")
                        .password(encodedPassword)
                        .role(UserRole.FARMER)
                        .organization("Nilgiri Mountain Herbs Alliance")
                        .location("Ooty, Tamil Nadu, India")
                        .status(UserStatus.PENDING_APPROVAL)
                        .joinedDate(LocalDate.of(2024, 8, 20))
                        .certifications(Arrays.asList("Rainforest Alliance (Under Audit)"))
                        .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150")
                        .build()
        );

        userRepository.saveAll(users);
    }

    private void seedProducts() {
        // 1. Fully completed Retail-Ready Ashwagandha
        ProductEntity p1 = ProductEntity.builder()
                .id("BOT-2024-8901")
                .batchId("ASH-2024-089")
                .name("Pure Organic Ashwagandha Root Powder")
                .botanicalName("Withania somnifera")
                .category(ProductCategory.MEDICINAL_HERB)
                .cultivationMethod(CultivationMethod.ORGANIC)
                .quantityKg(450.0)
                .harvestDate(LocalDate.of(2024, 6, 14))
                .farmLocation("Vedic Farms Plot #4, Neemuch, MP, India")
                .gpsLat(24.4649)
                .gpsLng(74.8718)
                .farmerId("USR-FRM-01")
                .farmerName("Rajesh Patel")
                .farmerOrg("Vedic Agro Organic Cooperative")
                .status(ProductStatus.RETAIL_READY)
                .verificationState(VerificationState.VERIFIED)
                .qrCodeValue("https://florachain.verify/BOT-2024-8901")
                .description("High-potency, slow-shade dried full-spectrum Withania somnifera root sustainably harvested under certified regenerative organic standards. Standardized to 5.4% Withanolides.")
                .imageUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600")
                .createdTimestamp(LocalDateTime.of(2024, 6, 15, 8, 30))
                .activeCompounds(Arrays.asList("Withanolides 5.4%", "Withaferin A 0.8%", "Alkaloids 1.2%"))
                .certificates(new ArrayList<>())
                .timeline(new ArrayList<>())
                .blockchainTransactions(new ArrayList<>())
                .build();

        p1.getCertificates().add(CertificateEntity.builder()
                .id("CERT-001")
                .type("India Organic (NPOP) Certificate")
                .certificateNumber("NPOP-ORG-2024-99812")
                .issuingAuthority("OneCert International India / APEDA")
                .issueDate(LocalDate.of(2024, 1, 10))
                .expiryDate(LocalDate.of(2025, 1, 9))
                .ipfsCid("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco")
                .status("VALID")
                .product(p1)
                .build());

        p1.setProcessingDetails(ProcessingDetailsEntity.builder()
                .id("PRC-2024-8901")
                .processorId("USR-PRC-01")
                .processorName("Mahesh Deshmukh (PhytoExtracts Bio-Refining)")
                .processingDate(LocalDate.of(2024, 6, 22))
                .method("Cryogenic Micronization & Supercritical CO2 Separation")
                .facilityLocation("PhytoExtracts Facility B, Peenya Biotech Park, Bengaluru, India")
                .initialQuantityKg(450.0)
                .processedQuantityKg(396.0)
                .yieldLossPercentage(12.0)
                .equipmentUsed(Arrays.asList("CryoMill CM-800", "Supercritical Fluid Extractor SFE-500", "Fluidized Bed Dryer"))
                .ipfsDocumentCid("QmZtmD2qt8SrhB8vnvsn8Go25vqRzkvNenGYjppsGo2Za")
                .notes("Cryogenic milling at -40°C preserved thermo-sensitive withanolide glycosides without thermal degradation under AYUSH GMP.")
                .txHash("0x8f23b1c4e5a67890123456789abcdef0123456789abcdef0123456789abcdef0")
                .product(p1)
                .build());

        LabReportEntity lab1 = LabReportEntity.builder()
                .id("LAB-2024-8901")
                .labId("USR-LAB-01")
                .labName("Dr. Ananya Sharma (Eurofins NABL)")
                .testDate(LocalDate.of(2024, 7, 2))
                .testedBy("Dr. Ananya Sharma, Lead Bio-Analytical Chemist")
                .purityPercentage(99.4)
                .moisturePercentage(4.8)
                .heavyMetalsStatus(TestStatus.PASS)
                .microbialTestStatus(TestStatus.PASS)
                .pesticideResidueStatus(TestStatus.PASS)
                .parameters(new ArrayList<>())
                .certificateIpfsCid("Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu")
                .certificateUrl("https://gateway.pinata.cloud/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu")
                .overallResult("APPROVED")
                .notes("Sample fully complies with Ayurvedic Pharmacopoeia of India (API) & FSSAI Standards. No synthetic adulterants detected.")
                .txHash("0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567")
                .product(p1)
                .build();

        lab1.getParameters().addAll(Arrays.asList(
                LabTestParameterEntity.builder().name("Total Withanolides (HPLC-UV)").value("5.42").unit("% w/w").standardLimit("≥ 2.5%").passed(true).labReport(lab1).build(),
                LabTestParameterEntity.builder().name("Lead (Pb) - ICP-MS").value("0.08").unit("ppm (mg/kg)").standardLimit("< 3.0 ppm").passed(true).labReport(lab1).build(),
                LabTestParameterEntity.builder().name("Cadmium (Cd) - ICP-MS").value("0.02").unit("ppm (mg/kg)").standardLimit("< 0.5 ppm").passed(true).labReport(lab1).build(),
                LabTestParameterEntity.builder().name("Aflatoxins (B1+B2+G1+G2)").value("< 0.5").unit("ppb (µg/kg)").standardLimit("< 4.0 ppb").passed(true).labReport(lab1).build()
        ));
        p1.setLabReport(lab1);

        p1.setShipmentDetails(ShipmentEntity.builder()
                .id("SHP-2024-8901")
                .distributorId("USR-DST-01")
                .distributorName("Vikramjit Singh (TransGlobal Logistics)")
                .sourceLocation("PhytoExtracts Hub, Nelamangala, Bengaluru, India")
                .destinationLocation("Arogya Pure Herbals Dispensary, Indiranagar, Bengaluru, India")
                .vehicleNumber("KA-01-TG-8442")
                .transportType(TransportType.REFRIGERATED_TRUCK)
                .temperatureRange("15°C – 22°C (Monitored)")
                .dispatchDate(LocalDate.of(2024, 7, 8))
                .expectedDeliveryDate(LocalDate.of(2024, 7, 12))
                .actualDeliveryDate(LocalDate.of(2024, 7, 12))
                .status("DELIVERED")
                .trackingNumber("TRK-IND-2024-998812")
                .txHash("0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678")
                .product(p1)
                .build());

        p1.setRetailDetails(RetailDetailsEntity.builder()
                .id("RET-2024-8901")
                .retailerId("USR-RET-01")
                .retailerName("Aarav Mehta (Arogya Pure Herbals)")
                .storeLocation("Indiranagar Flagship Store, 100 Feet Road, Bengaluru 560038")
                .receivedDate(LocalDate.of(2024, 7, 14))
                .shelfBatchId("SHELF-BLR-2024-089A")
                .unitPrice(850.00)
                .qrCodeGenerated(true)
                .notes("Inbound inspection verified all anti-tamper seals intact. Assigned shelf location Bay A-3.")
                .txHash("0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456")
                .product(p1)
                .build());

        // Timeline events for Product 1
        p1.getTimeline().addAll(Arrays.asList(
                TimelineEventEntity.builder().id("EVT-001").title("Harvest & On-Farm Batch Registration").stage("FARM_HARVEST").timestamp(LocalDateTime.of(2024, 6, 14, 6, 45)).actorName("Rajesh Patel").actorRole(UserRole.FARMER).location("Neemuch, Madhya Pradesh, India").description("Harvested 450kg organic root crop.").txHash("0x3a1b2c...").status("COMPLETED").product(p1).build(),
                TimelineEventEntity.builder().id("EVT-002").title("Bio-Processing & Cryogenic Milling").stage("PROCESSING").timestamp(LocalDateTime.of(2024, 6, 22, 14, 0)).actorName("Mahesh Deshmukh").actorRole(UserRole.PROCESSOR).location("Peenya, Bengaluru, India").description("Cryogenic milling at -40°C completed.").txHash("0x8f23b1...").status("COMPLETED").product(p1).build(),
                TimelineEventEntity.builder().id("EVT-003").title("Laboratory Purity & Contaminant Analysis").stage("LAB_TESTING").timestamp(LocalDateTime.of(2024, 7, 2, 11, 30)).actorName("Dr. Ananya Sharma").actorRole(UserRole.LABORATORY).location("Eurofins NABL Lab").description("Passed all HPLC & heavy metal assays.").txHash("0x4a7c8e...").status("COMPLETED").product(p1).build(),
                TimelineEventEntity.builder().id("EVT-004").title("Cold-Chain Transit Dispatched & Delivered").stage("LOGISTICS_TRANSIT").timestamp(LocalDateTime.of(2024, 7, 12, 16, 20)).actorName("Vikramjit Singh").actorRole(UserRole.DISTRIBUTOR).location("Nelamangala to Indiranagar, Bengaluru").description("Delivered safely to Bengaluru retail hub.").txHash("0x2c5e8b...").status("COMPLETED").product(p1).build(),
                TimelineEventEntity.builder().id("EVT-005").title("Retail Stocking & Consumer QR Active").stage("RETAIL_ARRIVAL").timestamp(LocalDateTime.of(2024, 7, 14, 9, 30)).actorName("Aarav Mehta").actorRole(UserRole.RETAILER).location("Indiranagar Bengaluru").description("Active on shelf. Authenticity QR live.").txHash("0x1a3d5f...").status("COMPLETED").product(p1).build()
        ));

        p1.getBlockchainTransactions().addAll(Arrays.asList(
                BlockchainTransactionEntity.builder().txId("0x1a3d5f7b90123456789abcdef0123456789abcdef0123456789abcdef0123456").blockNumber(10745L).timestamp(LocalDateTime.of(2024, 7, 14, 9, 30)).stage("RETAIL_ARRIVAL").action("CONFIRM_RETAIL_RECEIPT").actor("Aarav Mehta").actorRole(UserRole.RETAILER).payloadHash("sha256:b8c9d0...").endorsingPeers(Arrays.asList("peer0.consortium", "peer1.retail")).channelName("botanical-supply-channel").chaincode("BotanicalTraceability v1.0").product(p1).build(),
                BlockchainTransactionEntity.builder().txId("0x2c5e8b0d123456789abcdef0123456789abcdef0123456789abcdef012345678").blockNumber(10744L).timestamp(LocalDateTime.of(2024, 7, 8, 9, 0)).stage("LOGISTICS_TRANSIT").action("CREATE_SHIPMENT").actor("Vikramjit Singh").actorRole(UserRole.DISTRIBUTOR).payloadHash("sha256:a7b8c9...").endorsingPeers(Arrays.asList("peer0.consortium", "peer1.logistics")).channelName("botanical-supply-channel").chaincode("BotanicalTraceability v1.0").product(p1).build(),
                BlockchainTransactionEntity.builder().txId("0x4a7c8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234567").blockNumber(10743L).timestamp(LocalDateTime.of(2024, 7, 2, 11, 30)).stage("LAB_TESTING").action("SUBMIT_LAB_RESULT_APPROVED").actor("Dr. Ananya Sharma").actorRole(UserRole.LABORATORY).payloadHash("sha256:f6a7b8...").endorsingPeers(Arrays.asList("peer0.consortium", "peer1.lab")).channelName("botanical-supply-channel").chaincode("BotanicalTraceability v1.0").product(p1).build()
        ));

        productRepository.save(p1);

        // 2. In-Transit Turmeric
        ProductEntity p2 = ProductEntity.builder()
                .id("BOT-2024-9102")
                .batchId("TUR-2024-114")
                .name("Organic Lakadong Turmeric Root (9.2% Curcumin)")
                .botanicalName("Curcuma longa")
                .category(ProductCategory.SPICE)
                .cultivationMethod(CultivationMethod.ORGANIC)
                .quantityKg(800.0)
                .harvestDate(LocalDate.of(2024, 7, 5))
                .farmLocation("Jaintia Hills Organic Cluster, Meghalaya, India")
                .gpsLat(25.4529)
                .gpsLng(92.2037)
                .farmerId("USR-FRM-01")
                .farmerName("Rajesh Patel")
                .farmerOrg("Vedic Agro Organic Cooperative")
                .status(ProductStatus.IN_TRANSIT)
                .verificationState(VerificationState.IN_PROGRESS)
                .qrCodeValue("https://florachain.verify/BOT-2024-9102")
                .description("World-renowned high-curcumin Lakadong turmeric grown in pristine Meghalaya microclimate.")
                .imageUrl("https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600")
                .createdTimestamp(LocalDateTime.of(2024, 7, 6, 10, 15))
                .activeCompounds(Arrays.asList("Curcuminoids 9.2%", "Turmerones 4.1%"))
                .certificates(new ArrayList<>())
                .timeline(new ArrayList<>())
                .blockchainTransactions(new ArrayList<>())
                .build();
        productRepository.save(p2);

        // 3. Approved Holy Basil
        ProductEntity p3 = ProductEntity.builder()
                .id("BOT-2024-9403")
                .batchId("TLS-2024-042")
                .name("Biodynamic Rama & Krishna Tulsi Leaf Blend")
                .botanicalName("Ocimum tenuiflorum")
                .category(ProductCategory.TEA)
                .cultivationMethod(CultivationMethod.BIODYNAMIC)
                .quantityKg(320.0)
                .harvestDate(LocalDate.of(2024, 8, 1))
                .farmLocation("Vrindavan Biodynamic Estate, UP, India")
                .gpsLat(27.5824)
                .gpsLng(77.7006)
                .farmerId("USR-FRM-01")
                .farmerName("Rajesh Patel")
                .farmerOrg("Vedic Agro Organic Cooperative")
                .status(ProductStatus.APPROVED)
                .verificationState(VerificationState.VERIFIED)
                .qrCodeValue("https://florachain.verify/BOT-2024-9403")
                .description("Sacred adaptogenic holy basil carefully hand-picked during lunar crest.")
                .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600")
                .createdTimestamp(LocalDateTime.of(2024, 8, 2, 7, 0))
                .activeCompounds(Arrays.asList("Eugenol 68%", "Rosmarinic Acid", "Caryophyllene"))
                .certificates(new ArrayList<>())
                .timeline(new ArrayList<>())
                .blockchainTransactions(new ArrayList<>())
                .build();
        productRepository.save(p3);

        // 4. Freshly Registered Moringa
        ProductEntity p4 = ProductEntity.builder()
                .id("BOT-2024-9704")
                .batchId("MOR-2024-201")
                .name("Wild-Crafted Moringa Leaf Fine Cut")
                .botanicalName("Moringa oleifera")
                .category(ProductCategory.MEDICINAL_HERB)
                .cultivationMethod(CultivationMethod.WILD_CRAFTED)
                .quantityKg(600.0)
                .harvestDate(LocalDate.of(2024, 8, 18))
                .farmLocation("Deccan Wild Agro-Forestry, Karnataka, India")
                .gpsLat(15.3173)
                .gpsLng(75.7139)
                .farmerId("USR-FRM-01")
                .farmerName("Rajesh Patel")
                .farmerOrg("Vedic Agro Organic Cooperative")
                .status(ProductStatus.REGISTERED)
                .verificationState(VerificationState.IN_PROGRESS)
                .qrCodeValue("https://florachain.verify/BOT-2024-9704")
                .description("Nutrient-dense raw moringa leaves sun-shaded and cold-conditioned immediately post-harvest.")
                .imageUrl("https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600")
                .createdTimestamp(LocalDateTime.of(2024, 8, 19, 11, 0))
                .activeCompounds(Arrays.asList("Chlorogenic Acid", "Quercetin", "Isothiocyanates"))
                .certificates(new ArrayList<>())
                .timeline(new ArrayList<>())
                .blockchainTransactions(new ArrayList<>())
                .build();
        productRepository.save(p4);
    }

    private void seedReports() {
        SuspiciousReportEntity r1 = SuspiciousReportEntity.builder()
                .id("REP-2024-001")
                .productId("BOT-2024-9704")
                .batchId("MOR-2024-201")
                .reporterName("John Davies")
                .reporterEmail("jdavies@consumer-watch.org")
                .reason(ReportReason.TAMPERED_PACKAGING)
                .description("Inbound carton showed evidence of broken secondary tamper seals during inspection.")
                .reportedAt(LocalDateTime.of(2024, 8, 22, 14, 30))
                .status(ReportStatus.PENDING_REVIEW)
                .adminNotes("Assigned to compliance inspector for physical batch audit.")
                .build();

        suspiciousReportRepository.save(r1);
    }
}
