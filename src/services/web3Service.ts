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

// ─────────────────────────────────────────────────────────
// Network Definitions
// Priority 1: runtime env-vars injected by Vite (VITE_*)
// Priority 2: contractConfig.json written by deploy script
// Priority 3: Hardhat localhost fallback
// ─────────────────────────────────────────────────────────
export const SUPPORTED_NETWORKS: Record<number, {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
}> = {
  31337: {
    name: 'Hardhat Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: '',
    nativeCurrency: 'ETH',
  },
  80002: {
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: 'POL',
  },
  137: {
    name: 'Polygon PoS Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'POL',
  },
  11155111: {
    name: 'Ethereum Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: 'SepoliaETH',
  },
  421614: {
    name: 'Arbitrum Sepolia Testnet',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nativeCurrency: 'ETH',
  },
  84532: {
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: 'ETH',
  },
};

// Resolved network configuration (env-var > contractConfig.json > localhost fallback)
const ACTIVE_CHAIN_ID: number = (() => {
  const envChainId = import.meta.env.VITE_CHAIN_ID;
  if (envChainId) return Number(envChainId);
  return (contractConfig as any).chainId || 31337;
})();

const ACTIVE_RPC_URL: string = (() => {
  const envRpc = import.meta.env.VITE_RPC_URL;
  if (envRpc) return envRpc;
  const net = SUPPORTED_NETWORKS[ACTIVE_CHAIN_ID];
  return net ? net.rpcUrl : 'http://127.0.0.1:8545';
})();

const ACTIVE_EXPLORER_URL: string = (() => {
  const envExplorer = import.meta.env.VITE_EXPLORER_URL;
  if (envExplorer) return envExplorer;
  const configExplorer = (contractConfig as any).explorerUrl;
  if (configExplorer) return configExplorer;
  const net = SUPPORTED_NETWORKS[ACTIVE_CHAIN_ID];
  return net ? net.explorerUrl : '';
})();

const IS_LOCAL_NETWORK = ACTIVE_CHAIN_ID === 31337;

// ─────────────────────────────────────────────────────────
// Local Hardhat Demo Accounts (for local development only)
// NEVER expose real private keys here; only use well-known
// Hardhat default test accounts that have no real funds.
// ─────────────────────────────────────────────────────────
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

/** Returns a Polygonscan / Etherscan transaction URL for the active network */
export function getTransactionExplorerUrl(txHash: string): string {
  if (!ACTIVE_EXPLORER_URL || !txHash) return '';
  return `${ACTIVE_EXPLORER_URL}/tx/${txHash}`;
}

/** Returns a block explorer address URL for the active network */
export function getAddressExplorerUrl(address: string): string {
  if (!ACTIVE_EXPLORER_URL || !address) return '';
  return `${ACTIVE_EXPLORER_URL}/address/${address}`;
}

class Web3Service {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  public getContractAddress(): string {
    const envAddr = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (envAddr) return envAddr;
    return (contractConfig as any).contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  }

  public getChainId(): number {
    return ACTIVE_CHAIN_ID;
  }

  public getNetworkInfo() {
    return SUPPORTED_NETWORKS[ACTIVE_CHAIN_ID] || SUPPORTED_NETWORKS[31337];
  }

  public isLocalNetwork(): boolean {
    return IS_LOCAL_NETWORK;
  }

  public isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }

  /**
   * Returns a read-only provider.
   * On public networks, uses the configured public RPC so consumers without MetaMask
   * can still query the blockchain for QR code verification.
   */
  public async getProvider(): Promise<ethers.Provider> {
    if (this.provider) return this.provider;

    if (this.isMetaMaskInstalled()) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      // Public read-only RPC — safe for consumers scanning QR codes without a wallet
      this.provider = new ethers.JsonRpcProvider(ACTIVE_RPC_URL);
    }
    return this.provider;
  }

  /**
   * Prompt MetaMask to switch to the target production network.
   * If the network isn't in MetaMask yet, it adds it automatically.
   */
  private async ensureCorrectNetwork(browserProvider: ethers.BrowserProvider): Promise<void> {
    if (IS_LOCAL_NETWORK) return; // no switching needed for local dev

    const network = await browserProvider.getNetwork();
    if (Number(network.chainId) === ACTIVE_CHAIN_ID) return;

    const chainIdHex = `0x${ACTIVE_CHAIN_ID.toString(16)}`;
    const netInfo = SUPPORTED_NETWORKS[ACTIVE_CHAIN_ID];

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // Error 4902 = the chain hasn't been added to MetaMask yet
      if (switchError.code === 4902) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: netInfo?.name || 'Custom Network',
              rpcUrls: [ACTIVE_RPC_URL],
              nativeCurrency: {
                name: netInfo?.nativeCurrency || 'ETH',
                symbol: netInfo?.nativeCurrency || 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: netInfo?.explorerUrl ? [netInfo.explorerUrl] : [],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Connect with MetaMask Browser Extension.
   * Automatically prompts to switch to the configured production network.
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
        error: IS_LOCAL_NETWORK
          ? 'MetaMask extension not found. You can connect using a Local Hardhat Test Account below.'
          : 'MetaMask extension not found. Please install MetaMask from https://metamask.io to interact with the FloraChain network.',
      };
    }

    try {
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      await browserProvider.send('eth_requestAccounts', []);

      // Ensure MetaMask is on our target network
      await this.ensureCorrectNetwork(browserProvider);

      // Re-instantiate provider after potential network switch
      const finalProvider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await finalProvider.getSigner();
      const address = await signer.getAddress();
      const network = await finalProvider.getNetwork();
      const balance = await finalProvider.getBalance(address);

      this.provider = finalProvider;
      this.signer = signer;
      this.contract = new ethers.Contract(
        this.getContractAddress(),
        contractConfig.abi,
        signer
      );

      const netInfo = SUPPORTED_NETWORKS[Number(network.chainId)];
      return {
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        balanceEth: parseFloat(ethers.formatEther(balance)).toFixed(4),
        networkName: netInfo?.name || network.name || `Chain ${network.chainId}`,
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
   * Connect using a local Hardhat development test wallet.
   * Only enabled when running against a local node (chainId 31337).
   */
  public async connectLocalTestWallet(accountIndex = 0): Promise<WalletState> {
    if (!IS_LOCAL_NETWORK) {
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balanceEth: null,
        networkName: null,
        connectionType: null,
        error: 'Local test wallet accounts are only available when running against a local Hardhat node (Chain ID 31337). On production networks, please connect with MetaMask.',
      };
    }

    const acc = HARDHAT_DEMO_ACCOUNTS[accountIndex] || HARDHAT_DEMO_ACCOUNTS[0];

    try {
      const rpcProvider = new ethers.JsonRpcProvider(ACTIVE_RPC_URL);
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
        balanceEth = parseFloat(ethers.formatEther(bal)).toFixed(4);
      } catch {
        // Node offline — simulate balance
      }

      return {
        isConnected: true,
        address: acc.address,
        chainId: 31337,
        balanceEth,
        networkName: `Hardhat Local Node (${acc.role})`,
        connectionType: 'LOCAL_HARDHAT',
        error: null,
      };
    } catch (err: any) {
      // Fallback simulated state
      return {
        isConnected: true,
        address: acc.address,
        chainId: 31337,
        balanceEth: '10000.0',
        networkName: `Simulated Local Node (${acc.role})`,
        connectionType: 'SIMULATED',
        error: null,
      };
    }
  }

  /** Disconnect active wallet */
  public disconnect(): WalletState {
    this.signer = null;
    this.contract = null;
    this.provider = null;
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

    // Public read-only — uses JsonRpcProvider so consumers without a wallet can verify batches
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
      const netInfo = SUPPORTED_NETWORKS[Number(network.chainId)];
      return {
        blockHeight: blockNumber,
        networkName: netInfo?.name || `Chain ${network.chainId}`,
        contractAddress: this.getContractAddress(),
      };
    } catch {
      const netInfo = this.getNetworkInfo();
      return {
        blockHeight: 0,
        networkName: netInfo?.name || 'Unknown Network',
        contractAddress: this.getContractAddress(),
      };
    }
  }

  public async signAndRelayMetaTransaction(
    functionName: string,
    args: any[]
  ): Promise<{ txHash: string; blockNumber: number }> {
    if (!this.signer) throw new Error("Wallet not connected");

    const contract = await this.getContract(false);
    const forwarderAddress = (contractConfig as any).forwarderAddress;
    if (!forwarderAddress) throw new Error("Forwarder address not configured");

    const from = await this.signer.getAddress();
    const data = contract.interface.encodeFunctionData(functionName, args);
    const provider = await this.getProvider();
    
    // Construct ForwardRequest
    const forwarderAbi = (contractConfig as any).forwarderAbi;
    const forwarder = new ethers.Contract(forwarderAddress, forwarderAbi, provider);
    const nonce = await forwarder.nonces(from);
    
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity

    const request = {
      from,
      to: this.getContractAddress(),
      value: 0n,
      gas: 2000000n, // sufficient gas
      nonce,
      deadline: BigInt(deadline),
      data
    };

    // EIP-712 setup
    const domain = {
      name: "FloraChainForwarder",
      version: "1",
      chainId: ACTIVE_CHAIN_ID,
      verifyingContract: forwarderAddress,
    };

    const types = {
      ForwardRequest: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "gas", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint48" },
        { name: "data", type: "bytes" },
      ],
    };

    // User signs the message (costs no gas)
    const signature = await (this.signer as ethers.JsonRpcSigner).signTypedData(domain, types, request);

    // Relayer steps in: using the Admin account (hardcoded for demo)
    const adminKey = HARDHAT_DEMO_ACCOUNTS[0].privateKey;
    const relayerWallet = new ethers.Wallet(adminKey, provider);
    
    // Relayer submits the transaction and pays the gas
    const forwarderWithRelayer = forwarder.connect(relayerWallet) as ethers.Contract;
    
    // Build ForwardRequestData struct
    const requestData = {
      from: request.from,
      to: request.to,
      value: request.value,
      gas: request.gas,
      deadline: request.deadline,
      data: request.data,
      signature: signature
    };

    const tx = await forwarderWithRelayer.execute(requestData);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  public async registerHarvestOnChain(
    product: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>
  ): Promise<{ txHash: string; blockNumber: number }> {
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

    return await this.signAndRelayMetaTransaction('registerHarvest', [input]);
  }

  public async recordProcessingOnChain(
    batchId: string,
    details: Omit<ProcessingDetails, 'txHash'>
  ): Promise<{ txHash: string; blockNumber: number }> {
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

    return await this.signAndRelayMetaTransaction('recordProcessing', [input]);
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
      retailPrice: `₹${retail.unitPrice.toFixed(2)}`,
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

  /**
   * Public read-only query — works without a connected wallet.
   * Uses the configured public RPC so end consumers can verify batches
   * from a standard browser without any Web3 wallet.
   */
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
