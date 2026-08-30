const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BotanicalTraceability Smart Contract", function () {
  let botanicalContract;
  let owner, farmer, processor, lab, distributor, retailer, consumer;

  beforeEach(async function () {
    [owner, farmer, processor, lab, distributor, retailer, consumer] = await ethers.getSigners();

    const BotanicalTraceability = await ethers.getContractFactory("BotanicalTraceability");
    botanicalContract = await BotanicalTraceability.deploy();
    await botanicalContract.waitForDeployment();

    // Assign roles
    await botanicalContract.grantRole(farmer.address, 1); // FARMER
    await botanicalContract.grantRole(processor.address, 2); // PROCESSOR
    await botanicalContract.grantRole(lab.address, 3); // LABORATORY
    await botanicalContract.grantRole(distributor.address, 4); // DISTRIBUTOR
    await botanicalContract.grantRole(retailer.address, 5); // RETAILER
  });

  it("Should correctly initialize owner and grant roles", async function () {
    expect(await botanicalContract.owner()).to.equal(owner.address);
    expect(await botanicalContract.isAuthorizedActor(farmer.address)).to.be.true;
    expect(await botanicalContract.userRoles(farmer.address)).to.equal(1);
  });

  it("Should allow farmer to register a new botanical harvest batch", async function () {
    const batchId = "ASH-2026-001";
    const harvestTime = Math.floor(Date.now() / 1000);

    const harvestInput = {
      batchId,
      botanicalName: "Withania somnifera",
      commonName: "Organic Ashwagandha Root",
      category: "Roots & Herbs",
      farmLocation: "Madhya Pradesh Organic Farm #12",
      coordinates: "23.8388° N, 77.4019° E",
      harvestDate: harvestTime,
      quantityKg: 1200,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-01",
      farmerName: "Rajesh Sharma"
    };

    const tx = await botanicalContract.connect(farmer).registerHarvest(harvestInput);

    await expect(tx)
      .to.emit(botanicalContract, "ProductRegistered");

    const product = await botanicalContract.getProduct(batchId);
    expect(product.batchId).to.equal(batchId);
    expect(product.botanicalName).to.equal("Withania somnifera");
    expect(product.commonName).to.equal("Organic Ashwagandha Root");
    expect(product.quantityKg).to.equal(1200n);
    expect(product.status).to.equal(0); // REGISTERED
    expect(product.exists).to.be.true;
  });

  it("Should allow processor to record processing and extraction details", async function () {
    const batchId = "ASH-2026-002";
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Withania somnifera",
      commonName: "Organic Ashwagandha",
      category: "Roots",
      farmLocation: "Neemuch Farm",
      coordinates: "24.47° N, 74.87° E",
      harvestDate: 0,
      quantityKg: 1000,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-02",
      farmerName: "Amit Patel"
    });

    await botanicalContract.connect(processor).recordProcessing({
      batchId,
      processorId: "PROC-88",
      processorName: "AyurVeda Botanicals Extraction Ltd",
      facilityLocation: "Bhopal Industrial Facility",
      method: "Supercritical CO2 Extraction",
      initialQuantityKg: 1000,
      processedQuantityKg: 880,
      yieldLossPercentage: 1200, // 12.00% yield loss
      equipmentUsed: "CO2 Extractor Type-IV, Micro-Grinder",
      ipfsDocumentCid: "QmProcessingReportCidHash123",
      notes: "Extracted at controlled temperature 40°C"
    });

    const product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(2); // PROCESSED
    expect(product.processing.processorName).to.equal("AyurVeda Botanicals Extraction Ltd");
    expect(product.processing.processedQuantityKg).to.equal(880n);
  });

  it("Should allow laboratory to test and approve batch after processing", async function () {
    const batchId = "TURM-2026-003";
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Curcuma longa",
      commonName: "Turmeric Rhizome",
      category: "Rhizomes",
      farmLocation: "Erode Organic Belt",
      coordinates: "11.34° N, 77.72° E",
      harvestDate: 0,
      quantityKg: 500,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-03",
      farmerName: "Suresh Kumar"
    });

    // Attempting lab test before processing must revert
    await expect(
      botanicalContract.connect(lab).submitLabReport({
        batchId,
        labId: "LAB-901",
        labName: "Apex Phytochemical Testing Labs",
        testedBy: "Dr. Vandana Rao",
        purityPercentage: 9870,
        moisturePercentage: 650,
        heavyMetalsPassed: true,
        microbialTestPassed: true,
        pesticideResiduePassed: true,
        certificateIpfsCid: "QmLabCertificateHash999",
        overallApproved: true,
        notes: "Meets all pharmacopoeia standards"
      })
    ).to.be.revertedWith("Invalid state: Product must be PROCESSED before laboratory testing");

    // Process batch
    await botanicalContract.connect(processor).recordProcessing({
      batchId,
      processorId: "PROC-99",
      processorName: "Turmeric Milling Unit",
      facilityLocation: "Erode Processing Plant",
      method: "Solar Vacuum Dehydration",
      initialQuantityKg: 500,
      processedQuantityKg: 450,
      yieldLossPercentage: 1000,
      equipmentUsed: "Milling Line 1",
      ipfsDocumentCid: "QmProcTurm",
      notes: "Fine powder obtained"
    });

    // Now lab test succeeds
    await botanicalContract.connect(lab).submitLabReport({
      batchId,
      labId: "LAB-901",
      labName: "Apex Phytochemical Testing Labs",
      testedBy: "Dr. Vandana Rao",
      purityPercentage: 9870, // 98.70%
      moisturePercentage: 650,  // 6.50%
      heavyMetalsPassed: true,
      microbialTestPassed: true,
      pesticideResiduePassed: true,
      certificateIpfsCid: "QmLabCertificateHash999",
      overallApproved: true,
      notes: "Meets all pharmacopoeia standards"
    });

    const product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(4); // APPROVED
    expect(product.labReport.overallApproved).to.be.true;
    expect(product.labReport.purityPercentage).to.equal(9870n);
    expect(product.labReport.certificateIpfsCid).to.equal("QmLabCertificateHash999");
  });

  it("Should transition product to REJECTED if lab test fails", async function () {
    const batchId = "TULSI-2026-004";
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Ocimum tenuiflorum",
      commonName: "Holy Basil",
      category: "Leaves",
      farmLocation: "Varanasi Fields",
      coordinates: "25.31° N, 82.97° E",
      harvestDate: 0,
      quantityKg: 200,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-04",
      farmerName: "Karan Singh"
    });

    await botanicalContract.connect(processor).recordProcessing({
      batchId,
      processorId: "PROC-99",
      processorName: "Tulsi Extract Unit",
      facilityLocation: "Varanasi Plant",
      method: "Cryogenic Milling",
      initialQuantityKg: 200,
      processedQuantityKg: 180,
      yieldLossPercentage: 1000,
      equipmentUsed: "Cryo Mill",
      ipfsDocumentCid: "QmProcTulsi",
      notes: "Processed"
    });

    await botanicalContract.connect(lab).submitLabReport({
      batchId,
      labId: "LAB-901",
      labName: "Apex Phytochemical Testing Labs",
      testedBy: "Dr. Vandana Rao",
      purityPercentage: 8400,
      moisturePercentage: 1200,
      heavyMetalsPassed: false, // Failed heavy metals
      microbialTestPassed: true,
      pesticideResiduePassed: false,
      certificateIpfsCid: "QmRejectedLabCid000",
      overallApproved: false, // Rejected
      notes: "Heavy metals exceed permissible standard limit"
    });

    const product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(5); // REJECTED
    expect(product.labReport.overallApproved).to.be.false;
  });

  it("Should strictly prevent distributor from skipping processing and lab stages", async function () {
    const batchId = "SKIP-TEST-001";
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Centella asiatica",
      commonName: "Gotu Kola",
      category: "Herbs",
      farmLocation: "Assam Fields",
      coordinates: "26.20° N, 92.93° E",
      harvestDate: 0,
      quantityKg: 300,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-ASSAM",
      farmerName: "Bhaben Das"
    });

    // Attempting distributor dispatch on REGISTERED batch must revert
    await expect(
      botanicalContract.connect(distributor).dispatchShipment({
        batchId,
        shipmentId: "SHIP-SKIP-1",
        distributorId: "DIST-01",
        distributorName: "Illegal Fast Shipper",
        sourceLocation: "Assam",
        destinationLocation: "Delhi",
        vehicleNumber: "DL-01-9999",
        transportType: "REFRIGERATED_TRUCK",
        temperatureRange: "15°C - 20°C",
        trackingNumber: "TRK-SKIP"
      })
    ).to.be.revertedWith("Product must be approved by laboratory before shipment");
  });

  it("Should strictly reject unauthorized callers without the appropriate supply chain role", async function () {
    const batchId = "ROLE-TEST-001";
    
    // Consumer (role = none) cannot register harvest
    await expect(
      botanicalContract.connect(consumer).registerHarvest({
        batchId,
        botanicalName: "Fake Herb",
        commonName: "Fake",
        category: "Fake",
        farmLocation: "Unknown",
        coordinates: "0,0",
        harvestDate: 0,
        quantityKg: 100,
        cultivationMethod: "UNKNOWN",
        farmerId: "HACKER",
        farmerName: "Hacker"
      })
    ).to.be.revertedWith("Unauthorized role for this operation");
  });

  it("Should execute complete supply chain lifecycle from Harvest to Retail Ready", async function () {
    const batchId = "BRAHMI-2026-COMPLETE";

    // 1. Farmer Harvest
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Bacopa monnieri",
      commonName: "Waterhyssop Brahmi",
      category: "Herbs",
      farmLocation: "Kerala Wetland Reserves",
      coordinates: "9.93° N, 76.26° E",
      harvestDate: 0,
      quantityKg: 750,
      cultivationMethod: "WILD_CRAFTED",
      farmerId: "FARM-05",
      farmerName: "Lakshmi Menon"
    });

    // 2. Processing
    await botanicalContract.connect(processor).recordProcessing({
      batchId,
      processorId: "PROC-01",
      processorName: "BioExtract Labs",
      facilityLocation: "Kochi Hub",
      method: "Low-temp vacuum drying",
      initialQuantityKg: 750,
      processedQuantityKg: 680,
      yieldLossPercentage: 933,
      equipmentUsed: "Vacuum Chamber V-200",
      ipfsDocumentCid: "QmDocBrahmi1",
      notes: "Clean yield obtained"
    });

    // 3. Lab Test (Approval)
    await botanicalContract.connect(lab).submitLabReport({
      batchId,
      labId: "LAB-01",
      labName: "Central Herbal Certification Authority",
      testedBy: "Dr. S. Nair",
      purityPercentage: 9910,
      moisturePercentage: 580,
      heavyMetalsPassed: true,
      microbialTestPassed: true,
      pesticideResiduePassed: true,
      certificateIpfsCid: "QmCertBrahmiPass",
      overallApproved: true,
      notes: "Certified Grade-A Bacoside concentration"
    });

    // 4. Distributor Dispatch
    await botanicalContract.connect(distributor).dispatchShipment({
      batchId,
      shipmentId: "SHIP-7788",
      distributorId: "DIST-09",
      distributorName: "SafeChain Pharma Logistics",
      sourceLocation: "Kochi Warehouse",
      destinationLocation: "Bengaluru Distribution Hub",
      vehicleNumber: "KA-01-MJ-9921",
      transportType: "REFRIGERATED_TRUCK",
      temperatureRange: "15°C - 22°C",
      trackingNumber: "TRK-98837190"
    });

    let product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(6); // IN_TRANSIT
    expect(product.shipment.trackingNumber).to.equal("TRK-98837190");

    // 4b. Delivery confirmation
    await botanicalContract.connect(distributor).confirmDelivery(batchId);
    product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(7); // DELIVERED
    expect(product.shipment.isDelivered).to.be.true;

    // 5. Retailer Receipt & Placement
    await botanicalContract.connect(retailer).confirmRetailReceipt({
      batchId,
      retailerId: "RET-44",
      retailerName: "Arogya Wellness Flagship Store",
      storeLocation: "Indiranagar, Bengaluru",
      shelfLocation: "Aisle 4, Shelf B - Herbal Extracts",
      retailPrice: "$24.99"
    });

    product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(8); // RETAIL_READY
    expect(product.retail.retailerName).to.equal("Arogya Wellness Flagship Store");

    // Check batch collection
    const allIds = await botanicalContract.getAllBatchIds();
    expect(allIds).to.include(batchId);
    expect(await botanicalContract.getTotalBatchesCount()).to.be.greaterThan(0);
  });

  it("Should allow submitting suspicious reports and admin recall", async function () {
    const batchId = "NEEM-2026-SUSP";
    await botanicalContract.connect(farmer).registerHarvest({
      batchId,
      botanicalName: "Azadirachta indica",
      commonName: "Organic Neem Leaf",
      category: "Leaves",
      farmLocation: "Rajasthan Plantations",
      coordinates: "26.91° N, 75.78° E",
      harvestDate: 0,
      quantityKg: 400,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-06",
      farmerName: "Manoj Joshi"
    });

    // Consumer reports suspicious packaging
    await botanicalContract.connect(consumer).reportSuspicious(
      "REP-101",
      batchId,
      "Concerned Customer",
      "Tampered seal detected upon retail delivery",
      "QmEvidenceSealBreakCid"
    );

    let product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(9); // SUSPICIOUS

    const reports = await botanicalContract.getReportsForBatch(batchId);
    expect(reports.length).to.equal(1);
    expect(reports[0].reason).to.equal("Tampered seal detected upon retail delivery");

    // Admin issues recall
    await botanicalContract.connect(owner).recallProduct(batchId, "Batch seal tampering confirmed by quality audit");
    product = await botanicalContract.getProduct(batchId);
    expect(product.status).to.equal(10); // RECALLED
  });
});
