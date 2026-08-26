import { ethers } from 'ethers';
import contractConfig from '../contracts/contractConfig.json';
import { BotanicalProduct, ProcessingDetails, LabReport, ShipmentDetails, RetailDetails, SuspiciousReport } from '../types';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balanceEth: string | null;
  networkName: string | null;
  connectionType: 'METAMASK' | 'LOCAL_HARDHAT' | 'SIMULATED' | null;
  error: string | null;
}

export interface NetworkStats {
  blockHeight: number;
  activePeers: number;
  channelName: string;
  chaincodeVersion: string;
  tps: number;
  verifiedBatches: number;
  networkName: string;
  contractAddress: string;
}

const LOCAL_RPC_URL = 'http://127.0.0.1:8545';

// Hardhat default test private keys for local node connection
export const HARDHAT_DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    label: 'Consortium Admin (Deployer)',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    role: 'FARMER',
    label: 'Organic Farmer Account',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    role: 'PROCESSOR',
    label: 'Bio-Processing Facility',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb2f95402b4e4f67f08a04cc9b4227d8e210e0',
  },
  {
    role: 'LABORATORY',
    label: 'Quality Testing Laboratory',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    role: 'DISTRIBUTOR',
    label: 'Logistics & Cold-Chain',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec346cb2c7325414d168f39cf25730dd2b24e62a06c7d7d6b02bee1b0b',
  },
  {
    role: 'RETAILER',
    label: 'Retail Wellness Store',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    privateKey: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
];

class Web3Service {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  public getContractAddress(): string {
    return contractConfig.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  }

  public isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }

  public async getProvider(): Promise<ethers.Provider> {
    if (this.provider) return this.provider;

    if (this.isMetaMaskInstalled()) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      this.provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
    }
    return this.provider;
  }

  /**
   * Connect with MetaMask Browser Extension
   */
  public async connectMetaMask(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balanceEth: null,
        networkName: null,
        connectionType: null,
        error: 'MetaMask extension not found in this browser. You can connect using a Local Hardhat Test Account below.',
      };
    }

    try {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      const network = await browserProvider.getNetwork();
      const balance = await browserProvider.getBalance(address);

      this.provider = browserProvider;
      this.signer = signer;
      this.contract = new ethers.Contract(
        this.getContractAddress(),
        contractConfig.abi,
        signer
      );

      return {
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        balanceEth: ethers.formatEther(balance).substring(0, 6),
        networkName: network.name === 'unknown' ? 'EVM Local / Hardhat' : network.name,
        connectionType: 'METAMASK',
        error: null,
      };
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balanceEth: null,
        networkName: null,
        connectionType: null,
        error: err.message || 'Failed to connect MetaMask wallet',
      };
    }
  }

  /**
   * Connect using Local Hardhat Test Wallet
   */
  public async connectLocalTestWallet(accountIndex = 0): Promise<WalletState> {
    const acc = HARDHAT_DEMO_ACCOUNTS[accountIndex] || HARDHAT_DEMO_ACCOUNTS[0];

    try {
      const rpcProvider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
      const wallet = new ethers.Wallet(acc.privateKey, rpcProvider);

      this.provider = rpcProvider;
      this.signer = wallet;
      this.contract = new ethers.Contract(
        this.getContractAddress(),
        contractConfig.abi,
        wallet
      );

      let balanceEth = '10000.0';
      try {
        const bal = await rpcProvider.getBalance(acc.address);
        balanceEth = ethers.formatEther(bal).substring(0, 7);
      } catch {
        // If node offline, simulated balance
      }

      return {
        isConnected: true,
        address: acc.address,
        chainId: 31337,
        balanceEth: balanceEth,
        networkName: `Hardhat Local Node (${acc.role})`,
        connectionType: 'LOCAL_HARDHAT',
        error: null,
      };
    } catch (err: any) {
      // Fallback simulated connected state
      return {
        isConnected: true,
        address: acc.address,
        chainId: 31337,
        balanceEth: '10000.0',
        networkName: `Simulated Node (${acc.role})`,
        connectionType: 'SIMULATED',
        error: null,
      };
    }
  }

  /**
   * Disconnect active wallet
   */
  public disconnect(): WalletState {
    this.signer = null;
    this.contract = null;
    return {
      isConnected: false,
      address: null,
      chainId: null,
      balanceEth: null,
      networkName: null,
      connectionType: null,
      error: null,
    };
  }

  public async getContract(requireSigner = false): Promise<ethers.Contract> {
    if (requireSigner && this.signer) {
      if (!this.contract) {
        this.contract = new ethers.Contract(
          this.getContractAddress(),
          contractConfig.abi,
          this.signer
        );
      }
      return this.contract;
    }

    const provider = await this.getProvider();
    return new ethers.Contract(
      this.getContractAddress(),
      contractConfig.abi,
      this.signer || provider
    );
  }

  public async fetchNetworkStats(): Promise<Partial<NetworkStats>> {
    try {
      const provider = await this.getProvider();
      const blockNumber = await provider.getBlockNumber();
      const network = await provider.getNetwork();
      return {
        blockHeight: blockNumber,
        networkName: network.name === 'unknown' ? 'Hardhat Localhost (31337)' : network.name,
        contractAddress: this.getContractAddress(),
      };
    } catch (e) {
      return {
        blockHeight: 12085,
        networkName: 'EVM Localhost (31337)',
        contractAddress: this.getContractAddress(),
      };
    }
  }

  public async registerHarvestOnChain(
    product: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);
    const harvestTimestamp = Math.floor(new Date(product.harvestDate).getTime() / 1000) || Math.floor(Date.now() / 1000);

    const input = {
      batchId: product.batchId,
      botanicalName: product.botanicalName,
      commonName: product.name,
      category: product.category,
      farmLocation: product.farmLocation,
      coordinates: `${product.gpsCoordinates.lat.toFixed(4)}, ${product.gpsCoordinates.lng.toFixed(4)}`,
      harvestDate: harvestTimestamp,
      quantityKg: BigInt(product.quantityKg),
      cultivationMethod: product.cultivationMethod,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
    };

    const tx = await contract.registerHarvest(input);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async recordProcessingOnChain(
    batchId: string,
    details: Omit<ProcessingDetails, 'txHash'>
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);
    const yieldLossInt = Math.round((details.yieldLossPercentage || 0) * 100);

    const input = {
      batchId,
      processorId: details.processorId,
      processorName: details.processorName,
      facilityLocation: details.facilityLocation,
      method: details.method,
      initialQuantityKg: BigInt(details.initialQuantityKg),
      processedQuantityKg: BigInt(details.processedQuantityKg),
      yieldLossPercentage: BigInt(yieldLossInt),
      equipmentUsed: details.equipmentUsed.join(', '),
      ipfsDocumentCid: details.ipfsDocumentCid || '',
      notes: details.notes || '',
    };

    const tx = await contract.recordProcessing(input);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async submitLabReportOnChain(
    batchId: string,
    report: Omit<LabReport, 'txHash'>,
    approve: boolean
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);
    const purityInt = Math.round((report.purityPercentage || 0) * 100);
    const moistureInt = Math.round((report.moisturePercentage || 0) * 100);

    const input = {
      batchId,
      labId: report.labId,
      labName: report.labName,
      testedBy: report.testedBy,
      purityPercentage: BigInt(purityInt),
      moisturePercentage: BigInt(moistureInt),
      heavyMetalsPassed: report.heavyMetalsStatus === 'PASS',
      microbialTestPassed: report.microbialTestStatus === 'PASS',
      pesticideResiduePassed: report.pesticideResidueStatus === 'PASS',
      certificateIpfsCid: report.certificateIpfsCid || '',
      overallApproved: approve,
      notes: report.notes || '',
    };

    const tx = await contract.submitLabReport(input);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async dispatchShipmentOnChain(
    batchId: string,
    shipment: Omit<ShipmentDetails, 'txHash' | 'status'>
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);

    const input = {
      batchId,
      shipmentId: shipment.shipmentId,
      distributorId: shipment.distributorId,
      distributorName: shipment.distributorName,
      sourceLocation: shipment.sourceLocation,
      destinationLocation: shipment.destinationLocation,
      vehicleNumber: shipment.vehicleNumber,
      transportType: shipment.transportType,
      temperatureRange: shipment.temperatureRange,
      trackingNumber: shipment.trackingNumber,
    };

    const tx = await contract.dispatchShipment(input);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async confirmDeliveryOnChain(batchId: string): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);
    const tx = await contract.confirmDelivery(batchId);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async confirmRetailReceiptOnChain(
    batchId: string,
    retail: Omit<RetailDetails, 'txHash' | 'qrCodeGenerated'>
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);

    const input = {
      batchId,
      retailerId: retail.retailerId,
      retailerName: retail.retailerName,
      storeLocation: retail.storeLocation,
      shelfLocation: retail.shelfBatchId || 'Aisle 1',
      retailPrice: `$${retail.unitPrice.toFixed(2)}`,
    };

    const tx = await contract.confirmRetailReceipt(input);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async reportSuspiciousOnChain(
    report: Omit<SuspiciousReport, 'id' | 'reportedAt' | 'status'>
  ): Promise<{ txHash: string; blockNumber: number }> {
    const contract = await this.getContract(true);
    const reportId = `REP-${Date.now().toString().slice(-6)}`;

    const tx = await contract.reportSuspicious(
      reportId,
      report.productId,
      report.reporterName,
      report.description,
      ''
    );

    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async getProductFromChain(batchId: string): Promise<any | null> {
    try {
      const contract = await this.getContract(false);
      const onChainData = await contract.getProduct(batchId);
      if (!onChainData || !onChainData.exists) return null;
      return onChainData;
    } catch (e) {
      console.warn(`Batch ${batchId} not found on-chain or node unreachable:`, e);
      return null;
    }
  }
}

export const web3Service = new Web3Service();
export default web3Service;
