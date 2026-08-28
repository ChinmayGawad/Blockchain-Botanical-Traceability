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
import { getBotanicalProductImage } from '../utils/imageUtils';
import web3Service, { WalletState } from '../services/web3Service';
import apiClient from '../services/api';

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
        const parsed: BotanicalProduct[] = JSON.parse(saved);
        return parsed.map(p => ({
          ...p,
          imageUrl: getBotanicalProductImage(p),
        }));
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

  // Attempt to sync products and stats from Spring Boot backend on mount
  useEffect(() => {
    const syncFromBackend = async () => {
      try {
        const [prodRes, statsRes, repRes] = await Promise.allSettled([
          apiClient.get('/products'),
          apiClient.get('/blockchain/stats'),
          apiClient.get('/reports')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data && Array.isArray(prodRes.value.data) && prodRes.value.data.length > 0) {
          const sanitized = prodRes.value.data.map((p: any) => ({
            ...p,
            imageUrl: getBotanicalProductImage(p),
          }));
          setProducts(sanitized);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.data) {
          if (statsRes.value.data.blockHeight) setLiveBlockHeight(statsRes.value.data.blockHeight);
          if (statsRes.value.data.networkName) setLiveNetworkName(statsRes.value.data.networkName);
        }
        if (repRes.status === 'fulfilled' && repRes.value.data && Array.isArray(repRes.value.data) && repRes.value.data.length > 0) {
          setSuspiciousReports(repRes.value.data);
        }
      } catch {
        // Run locally with existing state
      }
    };
    syncFromBackend();
  }, []);

  // Sync block height from live Web3 provider / node if reachable
  useEffect(() => {
    const updateStats = async () => {
      try {
        const stats = await web3Service.fetchNetworkStats();
        if (stats.blockHeight) setLiveBlockHeight(stats.blockHeight);
        if (stats.networkName) setLiveNetworkName(stats.networkName);
      } catch {
        // Fallback
      }
    };
    updateStats();
    const interval = setInterval(updateStats, 15000);
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

  const transactions: BlockchainTransaction[] = products.flatMap(p => p.blockchainTransactions || []).sort((a, b) => b.blockNumber - a.blockNumber);
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
    // Try sending to Spring Boot backend
    try {
      const res = await apiClient.post('/products', {
        name: productData.name,
        botanicalName: productData.botanicalName,
        batchId: productData.batchId,
        category: productData.category,
        cultivationMethod: productData.cultivationMethod,
        quantityKg: productData.quantityKg,
        harvestDate: productData.harvestDate,
        farmLocation: productData.farmLocation,
        gpsCoordinates: productData.gpsCoordinates,
        farmerId: productData.farmerId,
        farmerName: productData.farmerName,
        farmerOrg: productData.farmerOrg,
        description: productData.description,
        imageUrl: productData.imageUrl,
        activeCompounds: productData.activeCompounds,
        certificates: productData.certificates,
      });
      if (res.data && res.data.id) {
        setProducts(prev => [res.data, ...prev.filter(p => p.id !== res.data.id)]);
        return res.data;
      }
    } catch {
      console.info('Backend product registration fallback to local state');
    }

    const id = `BOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;

    try {
      const res = await web3Service.registerHarvestOnChain(productData);
      if (res && res.txHash) {
        txHash = res.txHash;
        blockNum = res.blockNumber;
        setLiveBlockHeight(blockNum);
      }
    } catch {
      // Fallback to local
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
    };

    const resolvedImageUrl = getBotanicalProductImage(productData);

    const newProduct: BotanicalProduct = {
      ...productData,
      id,
      imageUrl: resolvedImageUrl,
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
    // Try sending to Spring Boot backend
    try {
      const res = await apiClient.post(`/products/${productId}/processing`, details);
      if (res.data && res.data.id) {
        setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
        return;
      }
    } catch {
      console.info('Backend processing fallback to local state');
    }

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
    } catch {
      // Fallback
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
      description: `Method: ${details.method}. Input: ${details.initialQuantityKg}kg → Output: ${details.processedQuantityKg}kg (Yield loss: ${details.yieldLossPercentage}%).`,
      txHash,
      status: 'COMPLETED',
      ipfsHash: details.ipfsDocumentCid,
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
    // Try sending to Spring Boot backend
    try {
      const res = await apiClient.post(`/products/${productId}/lab-test`, {
        ...labReportData,
        approve,
      });
      if (res.data && res.data.id) {
        setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
        return;
      }
    } catch {
      console.info('Backend lab submission fallback to local state');
    }

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
    } catch {
      // Fallback
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
        ? `Passed all monograph requirements. Purity: ${labReportData.purityPercentage}%, Moisture: ${labReportData.moisturePercentage}%.`
        : `QA FAILED: ${labReportData.notes}. Batch rejected.`,
      txHash,
      status: approve ? 'COMPLETED' : 'FAILED',
      ipfsHash: labReportData.certificateIpfsCid,
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
    try {
      const res = await apiClient.post('/shipments', {
        productId,
        ...shipmentData,
      });
      if (res.data && res.data.id) {
        setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
        return;
      }
    } catch {
      console.info('Backend shipment creation fallback to local state');
    }

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
    } catch {
      // Fallback
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
      description: `Dispatched via ${shipmentData.transportType} (Vehicle: ${shipmentData.vehicleNumber}). Temp: ${shipmentData.temperatureRange}. Tracking: ${shipmentData.trackingNumber}.`,
      txHash,
      status: 'IN_PROGRESS',
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
    try {
      const targetProduct = products.find(p => p.id === productId);
      const shipmentId = targetProduct?.shipmentDetails?.shipmentId || productId;
      const res = await apiClient.put(`/shipments/${shipmentId}/status`, { status });
      if (res.data && res.data.id) {
        setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
        return;
      }
    } catch {
      console.info('Backend shipment status fallback to local state');
    }

    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;
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
    try {
      const res = await apiClient.post(`/products/${productId}/retail-receive`, retailData);
      if (res.data && res.data.id) {
        setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
        return;
      }
    } catch {
      console.info('Backend retail receipt fallback to local state');
    }

    let txHash = generateTxHash();
    let blockNum = blockHeight + 1;
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
      const res = await apiClient.post('/reports', reportData);
      if (res.data && res.data.id) {
        setSuspiciousReports(prev => [res.data, ...prev]);
        return;
      }
    } catch {
      console.info('Backend suspicious report fallback to local state');
    }

    const newReport: SuspiciousReport = {
      ...reportData,
      id: `REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    };
    setSuspiciousReports(prev => [newReport, ...prev]);
  };

  const updateReportStatus = async (reportId: string, status: SuspiciousReport['status'], notes?: string) => {
    try {
      await apiClient.put(`/reports/${reportId}/status`, { status, adminNotes: notes });
    } catch {
      console.info('Backend updateReportStatus fallback to local state');
    }

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
