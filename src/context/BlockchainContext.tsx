import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BotanicalProduct,
  BlockchainTransaction,
  SuspiciousReport,
  ProcessingDetails,
  LabReport,
  ShipmentDetails,
  RetailDetails,
  ProductStatus,
  VerificationState,
  TimelineEvent,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_SUSPICIOUS_REPORTS } from '../data/mockData';
import web3Service, { WalletState } from '../services/web3Service';

interface BlockchainContextType {
  products: BotanicalProduct[];
  transactions: BlockchainTransaction[];
  suspiciousReports: SuspiciousReport[];
  networkStats: {
    blockHeight: number;
    activePeers: number;
    channelName: string;
    chaincodeVersion: string;
    tps: number;
    verifiedBatches: number;
    networkName: string;
    contractAddress: string;
  };
  walletState: WalletState;
  connectWallet: () => Promise<void>;
  connectMetaMask: () => Promise<WalletState>;
  connectLocalAccount: (accountIndex?: number) => Promise<WalletState>;
  disconnectWallet: () => void;
  getProductById: (idOrBatch: string) => BotanicalProduct | undefined;
  registerProduct: (product: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>) => Promise<BotanicalProduct>;
  processBatch: (productId: string, details: Omit<ProcessingDetails, 'txHash'>) => Promise<void>;
  submitLabResult: (productId: string, labReport: Omit<LabReport, 'txHash'>, approve: boolean) => Promise<void>;
  createShipment: (productId: string, shipment: Omit<ShipmentDetails, 'txHash' | 'status'>) => Promise<void>;
  updateShipmentStatus: (productId: string, status: 'IN_TRANSIT' | 'DELIVERED') => Promise<void>;
  confirmRetailReceipt: (productId: string, retail: Omit<RetailDetails, 'txHash' | 'qrCodeGenerated'>) => Promise<void>;
  reportSuspicious: (report: Omit<SuspiciousReport, 'id' | 'reportedAt' | 'status'>) => Promise<void>;
  updateReportStatus: (reportId: string, status: SuspiciousReport['status'], notes?: string) => void;
  resetToDefaultData: () => void;
}

const STORAGE_KEY_PRODUCTS = 'florachain_products_data';
const STORAGE_KEY_REPORTS = 'florachain_reports_data';

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<BotanicalProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products from localStorage', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [suspiciousReports, setSuspiciousReports] = useState<SuspiciousReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reports from localStorage', e);
      }
    }
    return INITIAL_SUSPICIOUS_REPORTS;
  });

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balanceEth: null,
    networkName: null,
    connectionType: null,
    error: null,
  });

  const [liveBlockHeight, setLiveBlockHeight] = useState<number>(10742);
  const [liveNetworkName, setLiveNetworkName] = useState<string>('Hardhat EVM Localhost (31337)');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(suspiciousReports));
  }, [suspiciousReports]);

  // Sync block height from live Web3 provider / node if reachable
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await web3Service.fetchNetworkStats();
        if (stats.blockHeight) setLiveBlockHeight(stats.blockHeight);
        if (stats.networkName) setLiveNetworkName(stats.networkName);
      } catch {
        // Fallback to local count
      }
    };
    updateStats();
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const connectMetaMask = async (): Promise<WalletState> => {
    const res = await web3Service.connectMetaMask();
    setWalletState(res);
    return res;
  };

  const connectLocalAccount = async (accountIndex = 0): Promise<WalletState> => {
    const res = await web3Service.connectLocalTestWallet(accountIndex);
    setWalletState(res);
    return res;
  };

  const disconnectWallet = () => {
    const res = web3Service.disconnect();
    setWalletState(res);
  };

  const connectWallet = async () => {
    if (web3Service.isMetaMaskInstalled()) {
      await connectMetaMask();
    } else {
      await connectLocalAccount(0);
    }
  };

  // Aggregate all transactions across all products
  const transactions: BlockchainTransaction[] = products.flatMap(p => p.blockchainTransactions).sort((a, b) => b.blockNumber - a.blockNumber);

  const blockHeight = Math.max(liveBlockHeight, 10742 + (transactions.length > 5 ? transactions.length - 5 : 0));

  const networkStats = {
    blockHeight,
    activePeers: 6,
    channelName: 'botanical-provenance-channel',
    chaincodeVersion: 'solidity-contract-v1.0.0',
    tps: 8.5,
    verifiedBatches: products.filter(p => p.verificationState === 'VERIFIED').length,
    networkName: liveNetworkName,
    contractAddress: web3Service.getContractAddress(),
  };

  const getProductById = (idOrBatch: string): BotanicalProduct | undefined => {
    if (!idOrBatch) return undefined;
    const cleanQuery = idOrBatch.trim().toLowerCase();
    return products.find(
      p =>
        p.id.toLowerCase() === cleanQuery ||
        p.batchId.toLowerCase() === cleanQuery ||
        p.name.toLowerCase().includes(cleanQuery) ||
        p.qrCodeValue.toLowerCase().includes(cleanQuery)
    );
  };

  const registerProduct = async (
    productData: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>
  ): Promise<BotanicalProduct> => {
    const id = `BOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    // Try executing on-chain if connected
    try {
      const res = await web3Service.registerHarvestOnChain(productData);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const initialTx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'PRODUCT_CREATION',
      action: 'BotanicalTraceability.registerHarvest()',
      actor: `${productData.farmerName} (${productData.farmerId})`,
      actorRole: 'FARMER',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.farmer.florachain.eth', 'node1.consortium.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    const initialTimeline: TimelineEvent = {
      id: `TL-NEW-${Date.now()}`,
      title: 'Botanical Product Harvest Registered On-Chain',
      stage: 'FARMER',
      timestamp,
      actorName: productData.farmerName,
      actorRole: 'FARMER',
      location: `${productData.farmLocation} (${productData.gpsCoordinates.lat.toFixed(4)}° N, ${productData.gpsCoordinates.lng.toFixed(4)}° E)`,
      description: `Registered ${productData.quantityKg}kg ${productData.name} (${productData.botanicalName}). Farm origin verified and committed to immutable blockchain state.`,
      txHash,
      status: 'COMPLETED',
      ipfsHash: productData.certificates[0]?.ipfsCid || undefined,
      metadata: {
        'Batch Quantity': `${productData.quantityKg} kg`,
        'Cultivation Method': productData.cultivationMethod,
        'Contract': web3Service.getContractAddress().slice(0, 10) + '...',
      },
    };

    const newProduct: BotanicalProduct = {
      ...productData,
      id,
      status: 'REGISTERED',
      verificationState: 'IN_PROGRESS',
      qrCodeValue: `https://florachain.verify/${id}`,
      createdTimestamp: timestamp,
      timeline: [initialTimeline],
      blockchainTransactions: [initialTx],
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const processBatch = async (productId: string, details: Omit<ProcessingDetails, 'txHash'>) => {
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      const targetProduct = products.find(p => p.id === productId);
      const batchId = targetProduct?.batchId || productId;
      const res = await web3Service.recordProcessingOnChain(batchId, details);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'PROCESSING_LOG',
      action: 'BotanicalTraceability.recordProcessing()',
      actor: `${details.processorName} (${details.processorId})`,
      actorRole: 'PROCESSOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.processor.florachain.eth', 'node1.farmer.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    const timelineEvent: TimelineEvent = {
      id: `TL-PROC-${Date.now()}`,
      title: 'Processing Completed & Sent to Lab',
      stage: 'PROCESSOR',
      timestamp,
      actorName: details.processorName,
      actorRole: 'PROCESSOR',
      location: details.facilityLocation,
      description: `Method: ${details.method}. Input: ${details.initialQuantityKg}kg → Output: ${details.processedQuantityKg}kg (Yield loss: ${details.yieldLossPercentage}%). Sample dispatched to Quality Lab.`,
      txHash,
      status: 'COMPLETED',
      ipfsHash: details.ipfsDocumentCid,
      metadata: {
        'Processed Yield': `${details.processedQuantityKg} kg`,
        'Loss %': `${details.yieldLossPercentage}%`,
      },
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            status: 'IN_TESTING' as ProductStatus,
            processingDetails: { ...details, txHash },
            timeline: [...p.timeline, timelineEvent],
            blockchainTransactions: [tx, ...p.blockchainTransactions],
          };
        }
        return p;
      })
    );
  };

  const submitLabResult = async (productId: string, labReportData: Omit<LabReport, 'txHash'>, approve: boolean) => {
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      const targetProduct = products.find(p => p.id === productId);
      const batchId = targetProduct?.batchId || productId;
      const res = await web3Service.submitLabReportOnChain(batchId, labReportData, approve);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: approve ? 'LAB_APPROVAL' : 'LAB_REJECTION',
      action: approve ? 'BotanicalTraceability.submitLabReport(APPROVED)' : 'BotanicalTraceability.submitLabReport(REJECTED)',
      actor: `${labReportData.labName} (${labReportData.labId})`,
      actorRole: 'LABORATORY',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.lab.florachain.eth', 'node1.admin.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    const timelineEvent: TimelineEvent = {
      id: `TL-LAB-${Date.now()}`,
      title: approve ? 'Laboratory Quality Verification PASSED' : 'Laboratory Quality Verification FAILED',
      stage: 'LABORATORY',
      timestamp,
      actorName: labReportData.testedBy,
      actorRole: 'LABORATORY',
      location: labReportData.labName,
      description: approve
        ? `Passed all monograph requirements. Purity: ${labReportData.purityPercentage}%, Moisture: ${labReportData.moisturePercentage}%. Certificate issued on IPFS.`
        : `QA FAILED: ${labReportData.notes}. Batch locked by smart contract.`,
      txHash,
      status: approve ? 'COMPLETED' : 'FAILED',
      ipfsHash: labReportData.certificateIpfsCid,
      metadata: {
        'Purity Score': `${labReportData.purityPercentage}%`,
        'Heavy Metals': labReportData.heavyMetalsStatus,
        'Microbial Status': labReportData.microbialTestStatus,
        'Result': approve ? 'APPROVED' : 'REJECTED',
      },
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStatus: ProductStatus = approve ? 'APPROVED' : 'REJECTED';
          const newVerificationState: VerificationState = approve ? 'VERIFIED' : 'REJECTED';
          return {
            ...p,
            status: newStatus,
            verificationState: newVerificationState,
            labReport: { ...labReportData, txHash, overallResult: approve ? 'APPROVED' : 'REJECTED' },
            timeline: [...p.timeline, timelineEvent],
            blockchainTransactions: [tx, ...p.blockchainTransactions],
          };
        }
        return p;
      })
    );
  };

  const createShipment = async (productId: string, shipmentData: Omit<ShipmentDetails, 'txHash' | 'status'>) => {
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      const targetProduct = products.find(p => p.id === productId);
      const batchId = targetProduct?.batchId || productId;
      const res = await web3Service.dispatchShipmentOnChain(batchId, shipmentData);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'SHIPMENT_CREATION',
      action: 'BotanicalTraceability.dispatchShipment()',
      actor: `${shipmentData.distributorName} (${shipmentData.distributorId})`,
      actorRole: 'DISTRIBUTOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.distributor.florachain.eth', 'node1.retailer.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    const timelineEvent: TimelineEvent = {
      id: `TL-SHP-${Date.now()}`,
      title: 'Shipment Dispatched (In Transit)',
      stage: 'DISTRIBUTOR',
      timestamp,
      actorName: shipmentData.distributorName,
      actorRole: 'DISTRIBUTOR',
      location: `${shipmentData.sourceLocation} → ${shipmentData.destinationLocation}`,
      description: `Dispatched via ${shipmentData.transportType} (Vehicle: ${shipmentData.vehicleNumber}). Temp specs: ${shipmentData.temperatureRange}. Tracking: ${shipmentData.trackingNumber}.`,
      txHash,
      status: 'IN_PROGRESS',
      metadata: {
        'Tracking ID': shipmentData.trackingNumber,
        'Transport': shipmentData.transportType,
      },
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            status: 'IN_TRANSIT' as ProductStatus,
            shipmentDetails: { ...shipmentData, txHash, status: 'IN_TRANSIT' },
            timeline: [...p.timeline, timelineEvent],
            blockchainTransactions: [tx, ...p.blockchainTransactions],
          };
        }
        return p;
      })
    );
  };

  const updateShipmentStatus = async (productId: string, status: 'IN_TRANSIT' | 'DELIVERED') => {
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      if (status === 'DELIVERED') {
        const targetProduct = products.find(p => p.id === productId);
        const batchId = targetProduct?.batchId || productId;
        const res = await web3Service.confirmDeliveryOnChain(batchId);
        if (res && res.txHash) {
          txHash = res.txHash;
          blockNum = res.blockNumber;
          setLiveBlockHeight(blockNum);
        }
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'SHIPMENT_UPDATE',
      action: `BotanicalTraceability.confirmDelivery(${status})`,
      actor: 'Logistics Gateway',
      actorRole: 'DISTRIBUTOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.distributor.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId && p.shipmentDetails) {
          const updatedShipment: ShipmentDetails = {
            ...p.shipmentDetails,
            status,
            actualDeliveryDate: status === 'DELIVERED' ? timestamp : undefined,
          };
          return {
            ...p,
            status: status === 'DELIVERED' ? ('DELIVERED' as ProductStatus) : ('IN_TRANSIT' as ProductStatus),
            shipmentDetails: updatedShipment,
            blockchainTransactions: [tx, ...p.blockchainTransactions],
          };
        }
        return p;
      })
    );
  };

  const confirmRetailReceipt = async (productId: string, retailData: Omit<RetailDetails, 'txHash' | 'qrCodeGenerated'>) => {
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      const targetProduct = products.find(p => p.id === productId);
      const batchId = targetProduct?.batchId || productId;
      const res = await web3Service.confirmRetailReceiptOnChain(batchId, retailData);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch (e) {
      console.warn('Live on-chain execution note: Using simulated cryptographic ledger block.', e);
    }

    const timestamp = new Date().toISOString();

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'RETAIL_RECEIPT',
      action: 'BotanicalTraceability.confirmRetailReceipt()',
      actor: `${retailData.retailerName} (${retailData.retailerId})`,
      actorRole: 'RETAILER',
      payloadHash: generateTxHash(),
      endorsingPeers: ['node0.retailer.florachain.eth', 'node1.admin.florachain.eth'],
      channelName: 'botanical-provenance-evm',
      chaincode: 'BotanicalTraceability.sol',
    };

    const timelineEvent: TimelineEvent = {
      id: `TL-RET-${Date.now()}`,
      title: 'Received by Retailer & Ready for Consumer Scan',
      stage: 'RETAILER',
      timestamp,
      actorName: retailData.retailerName,
      actorRole: 'RETAILER',
      location: retailData.storeLocation,
      description: `Batch verified, shelf QR codes printed. Available for customer scan and authenticity check.`,
      txHash,
      status: 'COMPLETED',
      metadata: {
        'Shelf Batch ID': retailData.shelfBatchId,
        'Retail Price': `$${retailData.unitPrice.toFixed(2)}`,
      },
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            status: 'RETAIL_READY' as ProductStatus,
            verificationState: 'VERIFIED' as VerificationState,
            retailDetails: { ...retailData, txHash, qrCodeGenerated: true },
            timeline: [...p.timeline, timelineEvent],
            blockchainTransactions: [tx, ...p.blockchainTransactions],
          };
        }
        return p;
      })
    );
  };

  const reportSuspicious = async (reportData: Omit<SuspiciousReport, 'id' | 'reportedAt' | 'status'>) => {
    try {
      await web3Service.reportSuspiciousOnChain(reportData);
    } catch (e) {
      console.warn('Live on-chain reporting note: Using simulated ledger block.', e);
    }

    const newReport: SuspiciousReport = {
      ...reportData,
      id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    };
    setSuspiciousReports(prev => [newReport, ...prev]);
  };

  const updateReportStatus = (reportId: string, status: SuspiciousReport['status'], notes?: string) => {
    setSuspiciousReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status, adminNotes: notes || r.adminNotes } : r))
    );
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSuspiciousReports(INITIAL_SUSPICIOUS_REPORTS);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
  };

  return (
    <BlockchainContext.Provider
      value={{
        products,
        transactions,
        suspiciousReports,
        networkStats,
        walletState,
        connectWallet,
        connectMetaMask,
        connectLocalAccount,
        disconnectWallet,
        getProductById,
        registerProduct,
        processBatch,
        submitLabResult,
        createShipment,
        updateShipmentStatus,
        confirmRetailReceipt,
        reportSuspicious,
        updateReportStatus,
        resetToDefaultData,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
