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
  };
  getProductById: (idOrBatch: string) => BotanicalProduct | undefined;
  registerProduct: (product: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>) => BotanicalProduct;
  processBatch: (productId: string, details: Omit<ProcessingDetails, 'txHash'>) => void;
  submitLabResult: (productId: string, labReport: Omit<LabReport, 'txHash'>, approve: boolean) => void;
  createShipment: (productId: string, shipment: Omit<ShipmentDetails, 'txHash' | 'status'>) => void;
  updateShipmentStatus: (productId: string, status: 'IN_TRANSIT' | 'DELIVERED') => void;
  confirmRetailReceipt: (productId: string, retail: Omit<RetailDetails, 'txHash' | 'qrCodeGenerated'>) => void;
  reportSuspicious: (report: Omit<SuspiciousReport, 'id' | 'reportedAt' | 'status'>) => void;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(suspiciousReports));
  }, [suspiciousReports]);

  // Aggregate all transactions across all products
  const transactions: BlockchainTransaction[] = products.flatMap(p => p.blockchainTransactions).sort((a, b) => b.blockNumber - a.blockNumber);

  const blockHeight = 10742 + (transactions.length > 5 ? transactions.length - 5 : 0);

  const networkStats = {
    blockHeight,
    activePeers: 6,
    channelName: 'botanical-provenance-channel',
    chaincodeVersion: 'botanical-contract-v2.1',
    tps: 4.8,
    verifiedBatches: products.filter(p => p.verificationState === 'VERIFIED').length,
  };

  const getProductById = (idOrBatch: string): BotanicalProduct | undefined => {
    if (!idOrBatch) return undefined;
    const cleanQuery = idOrBatch.trim().toLowerCase();
    return products.find(
      p =>
        p.id.toLowerCase() === cleanQuery ||
        p.batchId.toLowerCase() === cleanQuery ||
        p.qrCodeValue.toLowerCase().includes(cleanQuery)
    );
  };

  const registerProduct = (
    productData: Omit<BotanicalProduct, 'id' | 'status' | 'verificationState' | 'qrCodeValue' | 'createdTimestamp' | 'timeline' | 'blockchainTransactions'>
  ): BotanicalProduct => {
    const id = `BOT-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const initialTx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'PRODUCT_CREATION',
      action: 'chaincode:CreateProduct()',
      actor: `${productData.farmerName} (Org: FarmerMSP)`,
      actorRole: 'FARMER',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.farmer.florachain.org', 'peer0.admin.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
    };

    const initialTimeline: TimelineEvent = {
      id: `TL-NEW-${Date.now()}`,
      title: 'Botanical Product Harvest Registered',
      stage: 'FARMER',
      timestamp,
      actorName: productData.farmerName,
      actorRole: 'FARMER',
      location: `${productData.farmLocation} (${productData.gpsCoordinates.lat.toFixed(4)}° N, ${productData.gpsCoordinates.lng.toFixed(4)}° E)`,
      description: `Registered ${productData.quantityKg}kg ${productData.name} (${productData.botanicalName}). Farm origin verified and certificates committed to blockchain ledger.`,
      txHash,
      status: 'COMPLETED',
      ipfsHash: productData.certificates[0]?.ipfsCid || undefined,
      metadata: {
        'Batch Quantity': `${productData.quantityKg} kg`,
        'Cultivation Method': productData.cultivationMethod,
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

  const processBatch = (productId: string, details: Omit<ProcessingDetails, 'txHash'>) => {
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'PROCESSING_LOG',
      action: 'chaincode:AddProcessingDetails()',
      actor: `${details.processorName} (Org: ProcessorMSP)`,
      actorRole: 'PROCESSOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.processor.florachain.org', 'peer0.farmer.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
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

  const submitLabResult = (productId: string, labReportData: Omit<LabReport, 'txHash'>, approve: boolean) => {
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: approve ? 'LAB_APPROVAL' : 'LAB_REJECTION',
      action: approve ? 'chaincode:ApproveProduct()' : 'chaincode:RejectProduct()',
      actor: `${labReportData.labName} (Org: LabMSP)`,
      actorRole: 'LABORATORY',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.lab.florachain.org', 'peer0.admin.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
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
        ? `Passed all monograph requirements. Purity: ${labReportData.purityPercentage}%, Moisture: ${labReportData.moisturePercentage}%. Certificate issued.`
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

  const createShipment = (productId: string, shipmentData: Omit<ShipmentDetails, 'txHash' | 'status'>) => {
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'SHIPMENT_CREATION',
      action: 'chaincode:CreateShipment()',
      actor: `${shipmentData.distributorName} (Org: DistributorMSP)`,
      actorRole: 'DISTRIBUTOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.distributor.florachain.org', 'peer0.retailer.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
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

  const updateShipmentStatus = (productId: string, status: 'IN_TRANSIT' | 'DELIVERED') => {
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'SHIPMENT_UPDATE',
      action: `chaincode:UpdateShipmentStatus(${status})`,
      actor: 'Logistics Gateway',
      actorRole: 'DISTRIBUTOR',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.distributor.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
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

  const confirmRetailReceipt = (productId: string, retailData: Omit<RetailDetails, 'txHash' | 'qrCodeGenerated'>) => {
    const txHash = generateTxHash();
    const timestamp = new Date().toISOString();
    const blockNum = blockHeight + 1;

    const tx: BlockchainTransaction = {
      txId: txHash,
      blockNumber: blockNum,
      timestamp,
      stage: 'RETAIL_RECEIPT',
      action: 'chaincode:ConfirmRetailReceipt()',
      actor: `${retailData.retailerName} (Org: RetailerMSP)`,
      actorRole: 'RETAILER',
      payloadHash: generateTxHash(),
      endorsingPeers: ['peer0.retailer.florachain.org', 'peer0.admin.florachain.org'],
      channelName: 'botanical-provenance-channel',
      chaincode: 'botanical-contract-v2.1',
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

  const reportSuspicious = (reportData: Omit<SuspiciousReport, 'id' | 'reportedAt' | 'status'>) => {
    const newReport: SuspiciousReport = {
      ...reportData,
      id: `REP-2024-${Math.floor(100 + Math.random() * 900)}`,
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
