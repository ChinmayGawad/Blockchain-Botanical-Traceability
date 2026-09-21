const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function getExplorerBaseUrl(networkName) {
  switch (networkName) {
    case "amoy":
      return "https://amoy.polygonscan.com/address/";
    case "polygon":
      return "https://polygonscan.com/address/";
    case "sepolia":
      return "https://sepolia.etherscan.io/address/";
    case "arbitrumSepolia":
      return "https://sepolia.arbiscan.io/address/";
    case "baseSepolia":
      return "https://sepolia.basescan.org/address/";
    default:
      return "";
  }
}

async function main() {
  console.log("==================================================");
  console.log("🌿 FloraChain Botanical Traceability Deployment");
  console.log("==================================================");

  const networkName = hre.network.name;
  const isLocalNetwork = networkName === "localhost" || networkName === "hardhat";
  const chainId = hre.network.config.chainId || 31337;

  console.log(`🌐 Target Network : ${networkName} (Chain ID: ${chainId})`);

  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "❌ No signer found. Please provide PRIVATE_KEY in your .env file or run against a local node."
    );
  }

  const deployer = signers[0];
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`👤 Deployer Account: ${deployer.address}`);
  console.log(`💰 Account Balance : ${hre.ethers.formatEther(balance)} ETH/POL\n`);

  if (!isLocalNetwork && balance === 0n) {
    throw new Error(
      `❌ Insufficient funds on account ${deployer.address}. Please fund this wallet via a faucet or native transfer.`
    );
  }

  console.log("🚀 Deploying BotanicalTraceability smart contract...");
  let deployOptions = {};
  if (!isLocalNetwork) {
    try {
      const feeData = await hre.ethers.provider.getFeeData();
      // Set explicit gasLimit so RPC eth_estimateGas does not trip on artificial client caps
      deployOptions.gasLimit = 6500000n;

      if (networkName === "amoy" || networkName === "polygon") {
        const minPriorityFee = hre.ethers.parseUnits("30", "gwei");
        const priorityFee = feeData.maxPriorityFeePerGas && feeData.maxPriorityFeePerGas > minPriorityFee
          ? feeData.maxPriorityFeePerGas
          : minPriorityFee;
        const maxFee = feeData.maxFeePerGas && feeData.maxFeePerGas > priorityFee
          ? feeData.maxFeePerGas
          : (priorityFee * 13n / 10n);

        deployOptions.maxPriorityFeePerGas = priorityFee;
        deployOptions.maxFeePerGas = maxFee;
        console.log(`⛽ Gas (Polygon) -> PriorityFee: ${hre.ethers.formatUnits(priorityFee, "gwei")} gwei, MaxFee: ${hre.ethers.formatUnits(maxFee, "gwei")} gwei, GasLimit: 6,500,000`);
      } else if (networkName === "sepolia") {
        const priorityFee = feeData.maxPriorityFeePerGas || hre.ethers.parseUnits("1.5", "gwei");
        const maxFee = feeData.maxFeePerGas
          ? (feeData.maxFeePerGas * 12n / 10n)
          : hre.ethers.parseUnits("3", "gwei");

        deployOptions.maxPriorityFeePerGas = priorityFee;
        deployOptions.maxFeePerGas = maxFee;
        console.log(`⛽ Gas (Sepolia) -> PriorityFee: ${hre.ethers.formatUnits(priorityFee, "gwei")} gwei, MaxFee: ${hre.ethers.formatUnits(maxFee, "gwei")} gwei, GasLimit: 6,500,000`);
      }
    } catch (e) {
      console.log("ℹ️ Using default network gas calculation with explicit 6.5M gas limit");
      deployOptions.gasLimit = 6500000n;
    }
  }

  const BotanicalTraceability = await hre.ethers.getContractFactory("BotanicalTraceability");
  const contract = await BotanicalTraceability.deploy(deployOptions);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ BotanicalTraceability deployed successfully at: ${contractAddress}`);

  const explorerBase = getExplorerBaseUrl(networkName);
  const explorerUrl = explorerBase ? `${explorerBase}${contractAddress}` : "";
  if (explorerUrl) {
    console.log(`🔍 View on Block Explorer: ${explorerUrl}`);
  }

  // Wait for additional confirmations on public networks to ensure indexers catch up
  if (!isLocalNetwork) {
    console.log("\n⏳ Waiting for 3 block confirmations before verification...");
    const deployTx = contract.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(3);
    }
  }

  // Handle Role Authorizations
  if (isLocalNetwork && signers.length >= 6) {
    console.log("\n🔑 Setting up local development role authorizations...");
    const [, farmer, processor, lab, distributor, retailer] = signers;
    await contract.grantRole(farmer.address, 1);
    console.log(`  - Farmer      : ${farmer.address}`);
    await contract.grantRole(processor.address, 2);
    console.log(`  - Processor   : ${processor.address}`);
    await contract.grantRole(lab.address, 3);
    console.log(`  - Laboratory  : ${lab.address}`);
    await contract.grantRole(distributor.address, 4);
    console.log(`  - Distributor : ${distributor.address}`);
    await contract.grantRole(retailer.address, 5);
    console.log(`  - Retailer    : ${retailer.address}`);
  } else {
    // Optional environment-configured initial stakeholders on production
    if (process.env.INITIAL_FARMER_ADDRESS) {
      await contract.grantRole(process.env.INITIAL_FARMER_ADDRESS, 1);
      console.log(`  - Granted FARMER role to: ${process.env.INITIAL_FARMER_ADDRESS}`);
    }
    if (process.env.INITIAL_PROCESSOR_ADDRESS) {
      await contract.grantRole(process.env.INITIAL_PROCESSOR_ADDRESS, 2);
      console.log(`  - Granted PROCESSOR role to: ${process.env.INITIAL_PROCESSOR_ADDRESS}`);
    }
    if (process.env.INITIAL_LAB_ADDRESS) {
      await contract.grantRole(process.env.INITIAL_LAB_ADDRESS, 3);
      console.log(`  - Granted LABORATORY role to: ${process.env.INITIAL_LAB_ADDRESS}`);
    }
  }

  // Seed sample initial batch (on local network or if explicitly requested)
  const shouldSeed = isLocalNetwork || process.env.SEED_DEMO_DATA === "true";
  if (shouldSeed) {
    console.log("\n🌱 Seeding initial verifiable botanical batch on-chain...");
    const batchId = "ASH-2026-001";
    const now = Math.floor(Date.now() / 1000);

    const tx1 = await contract.registerHarvest({
      batchId,
      botanicalName: "Withania somnifera",
      commonName: "Organic Ashwagandha Root",
      category: "Roots & Extracts",
      farmLocation: "Madhya Pradesh Organic Farm Cluster #4",
      coordinates: "23.8388° N, 77.4019° E",
      harvestDate: now - 86400 * 30,
      quantityKg: 1500,
      cultivationMethod: "ORGANIC",
      farmerId: "FARM-IN-082",
      farmerName: "Rajesh Sharma",
    });
    await tx1.wait();
    console.log(`  - Registered Harvest: ${batchId}`);

    const tx2 = await contract.recordProcessing({
      batchId,
      processorId: "PROC-MP-11",
      processorName: "AyurVeda Bio-Botanicals Ltd",
      facilityLocation: "Bhopal Industrial Estate, Unit 3",
      method: "Supercritical CO2 Extraction",
      initialQuantityKg: 1500,
      processedQuantityKg: 1320,
      yieldLossPercentage: 1200,
      equipmentUsed: "CO2 Extractor Type-IV, Cryo-Grinder",
      ipfsDocumentCid: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      notes: "Extracted at controlled temperature 40°C",
    });
    await tx2.wait();
    console.log(`  - Recorded Processing: ${batchId}`);

    const tx3 = await contract.submitLabReport({
      batchId,
      labId: "LAB-IN-902",
      labName: "Apex Phytochemical Testing Labs",
      testedBy: "Dr. Vandana Rao",
      purityPercentage: 9880,
      moisturePercentage: 620,
      heavyMetalsPassed: true,
      microbialTestPassed: true,
      pesticideResiduePassed: true,
      certificateIpfsCid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      overallApproved: true,
      notes: "Withanolide concentration certified at 5.2%. Meets USP/AYUSH standards.",
    });
    await tx3.wait();
    console.log(`  - Approved Lab Report: ${batchId}`);

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
      trackingNumber: "TRK-IN-908273",
    });
    await tx4.wait();
    console.log(`  - Dispatched Shipment: ${batchId}`);
  }

  // Optional Contract Verification on Etherscan/Polygonscan
  if (!isLocalNetwork && (process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY)) {
    console.log("\n🔍 Submitting contract source code for verification...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully on block explorer!");
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("ℹ️ Contract is already verified.");
      } else {
        console.warn(`⚠️ Verification note: ${err.message}`);
      }
    }
  }

  // Export Artifacts and Config to Frontend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "BotanicalTraceability.sol",
    "BotanicalTraceability.json"
  );
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const configDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const frontendConfigFile = path.join(configDir, "contractConfig.json");
  const frontendConfig = {
    network: networkName,
    chainId: chainId,
    contractAddress: contractAddress,
    explorerUrl: explorerUrl,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(frontendConfigFile, JSON.stringify(frontendConfig, null, 2));
  console.log(`\n📄 Frontend contract configuration saved to:`);
  console.log(`   ${frontendConfigFile}`);

  console.log("\n==================================================");
  console.log("🎉 Deployment and Setup Complete!");
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
