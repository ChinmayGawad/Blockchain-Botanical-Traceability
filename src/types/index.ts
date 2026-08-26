export type UserRole =
  | 'ADMIN'
  | 'FARMER'
  | 'PROCESSOR'
  | 'LABORATORY'
  | 'DISTRIBUTOR'
  | 'RETAILER'
  | 'CONSUMER';

export type ProductStatus =
  | 'REGISTERED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'IN_TESTING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETAIL_READY'
  | 'SUSPICIOUS'
  | 'RECALLED';

export type VerificationState = 'VERIFIED' | 'SUSPICIOUS' | 'REJECTED' | 'NOT_FOUND' | 'IN_PROGRESS';

export type CultivationMethod = 'ORGANIC' | 'WILD_CRAFTED' | 'HYDROPONIC' | 'CONVENTIONAL' | 'BIODYNAMIC';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  location: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED';
  joinedDate: string;
  certifications?: string[];
  avatarUrl?: string;
}

export interface LabTestParameter {
  name: string;
  value: string;
  unit: string;
  standardLimit: string;
  passed: boolean;
}

export interface LabReport {
  labId: string;
  labName: string;
  testDate: string;
  testedBy: string;
  purityPercentage: number;
  moisturePercentage: number;
  heavyMetalsStatus: 'PASS' | 'FAIL';
  microbialTestStatus: 'PASS' | 'FAIL';
  pesticideResidueStatus: 'PASS' | 'FAIL';
  parameters: LabTestParameter[];
  certificateIpfsCid: string;
  certificateUrl?: string;
  overallResult: 'APPROVED' | 'REJECTED';
  notes: string;
  txHash: string;
}

export interface ProcessingDetails {
  processorId: string;
  processorName: string;
  processingDate: string;
  method: string;
  facilityLocation: string;
  initialQuantityKg: number;
  processedQuantityKg: number;
  yieldLossPercentage: number;
  equipmentUsed: string[];
  ipfsDocumentCid?: string;
  notes: string;
  txHash: string;
}

export interface ShipmentDetails {
  shipmentId: string;
  distributorId: string;
  distributorName: string;
  sourceLocation: string;
  destinationLocation: string;
  vehicleNumber: string;
  transportType: 'REFRIGERATED_TRUCK' | 'STANDARD_LOGISTICS' | 'AIR_FREIGHT';
  temperatureRange: string;
  dispatchDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'DELIVERED';
  trackingNumber: string;
  txHash: string;
}

export interface RetailDetails {
  retailerId: string;
  retailerName: string;
  storeLocation: string;
  receivedDate: string;
  shelfBatchId: string;
  unitPrice: number;
  qrCodeGenerated: boolean;
  notes?: string;
  txHash: string;
}

export interface Certificate {
  id: string;
  type: string; // e.g., 'USDA Organic', 'GMP Certified', 'ISO 22000', 'FairWild'
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  ipfsCid: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
}

export interface BlockchainTransaction {
  txId: string;
  blockNumber: number;
  timestamp: string;
  stage: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  payloadHash: string;
  endorsingPeers: string[];
  channelName: string;
  chaincode: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  stage: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  location: string;
  description: string;
  txHash: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
  ipfsHash?: string;
  metadata?: Record<string, string | number>;
}

export interface BotanicalProduct {
  id: string; // e.g. "BOT-2024-8901"
  batchId: string; // e.g. "ASH-2024-089"
  name: string; // e.g. "Organic Ashwagandha Root"
  botanicalName: string; // e.g. "Withania somnifera"
  category: 'MEDICINAL_HERB' | 'SPICE' | 'AROMATIC' | 'EXTRACT' | 'TEA';
  cultivationMethod: CultivationMethod;
  quantityKg: number;
  harvestDate: string;
  farmLocation: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  farmerId: string;
  farmerName: string;
  farmerOrg: string;
  status: ProductStatus;
  verificationState: VerificationState;
  qrCodeValue: string;
  certificates: Certificate[];
  processingDetails?: ProcessingDetails;
  labReport?: LabReport;
  shipmentDetails?: ShipmentDetails;
  retailDetails?: RetailDetails;
  timeline: TimelineEvent[];
  blockchainTransactions: BlockchainTransaction[];
  createdTimestamp: string;
  imageUrl?: string;
  description: string;
  activeCompounds?: string[]; // e.g. ["Withanolides 5.2%", "Alkaloids", "Withaferin A"]
}

export interface SuspiciousReport {
  id: string;
  productId: string;
  batchId?: string;
  reporterName: string;
  reporterEmail: string;
  reason: 'INVALID_QR' | 'INFO_MISMATCH' | 'FAILED_LAB' | 'PHYSICAL_SUSPICIOUS' | 'TAMPERED_PACKAGING' | 'OTHER';
  description: string;
  reportedAt: string;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'RESOLVED_VALID' | 'CONFIRMED_FRAUD' | 'DISMISSED';
  adminNotes?: string;
}
