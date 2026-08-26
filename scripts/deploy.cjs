const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log("Starting Botanical Traceability Smart Contract Deployment...");
  console.log("--------------------------------------------------");

  const [deployer, farmer, processor, lab, distributor, retailer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const BotanicalTraceability = await hre.ethers.getContractFactory("BotanicalTraceability");
  const contract = await BotanicalTraceability.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ BotanicalTraceability deployed successfully at: ${contractAddress}`);

  // Assign demo roles if accounts exist
  if (farmer) {
    console.log("Setting up initial role authorizations for demo accounts...");
    await contract.grantRole(farmer.address, 1); // FARMER
    console.log(`- Farmer: ${farmer.address}`);
  }
  if (processor) {
    await contract.grantRole(processor.address, 2); // PROCESSOR
    console.log(`- Processor: ${processor.address}`);
  }
  if (lab) {
    await contract.grantRole(lab.address, 3); // LABORATORY
    console.log(`- Laboratory: ${lab.address}`);
  }
  if (distributor) {
    await contract.grantRole(distributor.address, 4); // DISTRIBUTOR
    console.log(`- Distributor: ${distributor.address}`);
  }
  if (retailer) {
    await contract.grantRole(retailer.address, 5); // RETAILER
    console.log(`- Retailer: ${retailer.address}`);
  }

  // Seed sample initial batch on-chain for immediate testing
  console.log("\nSeeding initial verifiable botanical batch on-chain...");
  const batchId = "ASH-2026-001";
  const now = Math.floor(Date.now() / 1000);

  const tx1 = await contract.registerHarvest({
    batchId,
    botanicalName: "Withania somnifera",
    commonName: "Organic Ashwagandha Root",
    category: "Roots & Extracts",
    farmLocation: "Madhya Pradesh Organic Farm Cluster #4",
    coordinates: "23.8388° N, 77.4019° E",
    harvestDate: now - 86400 * 30, // 30 days ago
    quantityKg: 1500,
    cultivationMethod: "ORGANIC",
    farmerId: "FARM-IN-082",
    farmerName: "Rajesh Sharma"
  });
  await tx1.wait();
  console.log(`- Seeded Batch: ${batchId}`);

  // Record processing
  const tx2 = await contract.recordProcessing({
    batchId,
    processorId: "PROC-MP-11",
    processorName: "AyurVeda Bio-Botanicals Ltd",
    facilityLocation: "Bhopal Industrial Estate, Unit 3",
    method: "Supercritical CO2 Extraction",
    initialQuantityKg: 1500,
    processedQuantityKg: 1320,
    yieldLossPercentage: 1200, // 12.00% yield loss
    equipmentUsed: "CO2 Extractor Type-IV, Cryo-Grinder",
    ipfsDocumentCid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    notes: "Extracted at controlled temperature 40°C"
  });
  await tx2.wait();
  console.log(`- Seeded Processing for ${batchId}`);

  // Record Lab QC Approval
  const tx3 = await contract.submitLabReport({
    batchId,
    labId: "LAB-IN-902",
    labName: "Apex Phytochemical Testing Labs",
    testedBy: "Dr. Vandana Rao",
    purityPercentage: 9880, // 98.80% purity
    moisturePercentage: 620,  // 6.20% moisture
    heavyMetalsPassed: true,
    microbialTestPassed: true,
    pesticideResiduePassed: true,
    certificateIpfsCid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    overallApproved: true,
    notes: "Withanolide concentration certified at 5.2%. Meets USP/AYUSH standards."
  });
  await tx3.wait();
  console.log(`- Seeded Lab QC Approval for ${batchId}`);

  // Seed Shipment
  const tx4 = await contract.dispatchShipment({
    batchId,
    shipmentId: "SHIP-2026-8801",
    distributorId: "DIST-LOG-04",
    distributorName: "SafeChain Pharma Logistics",
    sourceLocation: "Bhopal Central Warehouse",
    destinationLocation: "Mumbai Port & Distribution Center",
    vehicleNumber: "MH-04-AB-4412",
    transportType: "REFRIGERATED_TRUCK",
    temperatureRange: "15°C - 22°C",
    trackingNumber: "TRK-IN-908273"
  });
  await tx4.wait();
  console.log(`- Seeded Shipment for ${batchId}`);

  // Export Artifacts and Config to Frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "BotanicalTraceability.sol", "BotanicalTraceability.json");
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const configDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const frontendConfigFile = path.join(configDir, "contractConfig.json");
  const frontendConfig = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi
  };

  fs.writeFileSync(frontendConfigFile, JSON.stringify(frontendConfig, null, 2));
  console.log(`\n📄 Frontend contract config updated at: ${frontendConfigFile}`);
  console.log("--------------------------------------------------");
  console.log("Deployment and Seeding complete!");
  console.log("--------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
