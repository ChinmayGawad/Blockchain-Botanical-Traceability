import { BotanicalProduct, User, SuspiciousReport, BlockchainTransaction } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'USR-ADM-01',
    name: 'Dr. Evelyn Vance',
    email: 'admin@florachain.org',
    role: 'ADMIN',
    organization: 'Botanical Traceability Consortium',
    location: 'Geneva, Switzerland',
    status: 'ACTIVE',
    joinedDate: '2023-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-FRM-01',
    name: 'Rajesh Patel',
    email: 'rajesh@vedicfarms.org',
    role: 'FARMER',
    organization: 'Vedic Agro Organic Cooperative',
    location: 'Neemuch, Madhya Pradesh, India',
    status: 'ACTIVE',
    joinedDate: '2023-03-10',
    certifications: ['USDA Organic', 'India Organic NPOP', 'FairWild Certified'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-PRC-01',
    name: 'Marcus Thorne',
    email: 'marcus@phytoextracts.com',
    role: 'PROCESSOR',
    organization: 'PhytoExtracts Bio-Refining Ltd',
    location: 'Bangalore Biotech Hub, India',
    status: 'ACTIVE',
    joinedDate: '2023-04-18',
    certifications: ['GMP Certified', 'ISO 22000:2018', 'HACCP'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-LAB-01',
    name: 'Dr. Ananya Sharma',
    email: 'ananya@agrilabs.ch',
    role: 'LABORATORY',
    organization: 'Eurofins AgriBio Analytics Lab',
    location: 'Zurich & Hyderabad',
    status: 'ACTIVE',
    joinedDate: '2023-02-22',
    certifications: ['ISO/IEC 17025 Accredited', 'NABL Recognized', 'US FDA Audited'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-DST-01',
    name: 'Klaus Lindner',
    email: 'klaus@coldchainlogistics.de',
    role: 'DISTRIBUTOR',
    organization: 'TransGlobal Cold-Chain Logistics',
    location: 'Frankfurt & Mumbai Hub',
    status: 'ACTIVE',
    joinedDate: '2023-05-11',
    certifications: ['GDP Compliant (Good Distribution Practice)', 'ISO 9001:2015'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-RET-01',
    name: 'Sophia Laurent',
    email: 'sophia@pureapothecary.co.uk',
    role: 'RETAILER',
    organization: 'Pure Botanical Apothecary London',
    location: 'Covent Garden, London, UK',
    status: 'ACTIVE',
    joinedDate: '2023-06-01',
    certifications: ['Organic Retailers Guild Member', 'Soil Association Certified'],
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  // Pending Approval User for demonstration
  {
    id: 'USR-FRM-02',
    name: 'Kavita Sundaram',
    email: 'kavita@nilgiricoop.in',
    role: 'FARMER',
    organization: 'Nilgiri Mountain Herbs Alliance',
    location: 'Ooty, Tamil Nadu, India',
    status: 'PENDING_APPROVAL',
    joinedDate: '2024-08-20',
    certifications: ['Rainforest Alliance (Under Audit)'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_PRODUCTS: BotanicalProduct[] = [
  {
    id: 'BOT-2024-8901',
    batchId: 'ASH-2024-089',
    name: 'Pure Organic Ashwagandha Root Powder',
    botanicalName: 'Withania somnifera',
    category: 'MEDICINAL_HERB',
    cultivationMethod: 'ORGANIC',
    quantityKg: 450,
    harvestDate: '2024-06-14',
    farmLocation: 'Vedic Farms Plot #4, Neemuch, MP, India',
    gpsCoordinates: {
      lat: 24.4649,
      lng: 74.8718
    },
    farmerId: 'USR-FRM-01',
    farmerName: 'Rajesh Patel',
    farmerOrg: 'Vedic Agro Organic Cooperative',
    status: 'RETAIL_READY',
    verificationState: 'VERIFIED',
    qrCodeValue: 'https://florachain.verify/BOT-2024-8901',
    description: 'High-potency, slow-shade dried full-spectrum Withania somnifera root sustainably harvested under certified regenerative organic standards. Standardized to 5.4% Withanolides.',
    activeCompounds: ['Withanolides 5.4%', 'Withaferin A 0.8%', 'Alkaloids 1.2%'],
    createdTimestamp: '2024-06-15T08:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    certificates: [
      {
        id: 'CERT-001',
        type: 'USDA Organic Certificate',
        certificateNumber: 'NOP-ORG-2024-99812',
        issuingAuthority: 'OneCert International',
        issueDate: '2024-01-10',
        expiryDate: '2025-01-09',
        ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        status: 'VALID'
      },
      {
        id: 'CERT-002',
        type: 'FairWild Sustainable Harvest',
        certificateNumber: 'FW-IND-2024-04',
        issuingAuthority: 'FairWild Foundation',
        issueDate: '2024-02-15',
        expiryDate: '2025-02-14',
        ipfsCid: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
        status: 'VALID'
      }
    ],
    processingDetails: {
      processorId: 'USR-PRC-01',
      processorName: 'Marcus Thorne (PhytoExtracts Bio-Refining)',
      processingDate: '2024-06-22T14:15:00Z',
      method: 'Cryogenic Milling & 45°C Solar Vacuum Dehydration',
      facilityLocation: 'Bangalore Bio-Park ISO Cleanroom #3',
      initialQuantityKg: 500,
      processedQuantityKg: 450,
      yieldLossPercentage: 10,
      equipmentUsed: ['Alpine Pin Mill 160Z', 'Ultra-Sonic Air Classifier', 'Nitrogen-Purged Drum Filler'],
      ipfsDocumentCid: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM49BoV7W7VuuiC8BpU55',
      notes: 'Root cleansed with double-filtered deionized water, sterilized via dry-steam autoclave, milled to 80-mesh fine powder.',
      txHash: '0x8f3b9c71a2e4d567890123456789abcdef0123456789abcdef0123456789abcd'
    },
    labReport: {
      labId: 'USR-LAB-01',
      labName: 'Eurofins AgriBio Analytics Lab',
      testDate: '2024-07-02T11:00:00Z',
      testedBy: 'Dr. Ananya Sharma, Lead Biochemist',
      purityPercentage: 99.6,
      moisturePercentage: 5.2,
      heavyMetalsStatus: 'PASS',
      microbialTestStatus: 'PASS',
      pesticideResidueStatus: 'PASS',
      certificateIpfsCid: 'QmRUTgYw6E58uY7kKqS8xP8T7G6oV8n6v4W2K1z7Y6U8mB',
      overallResult: 'APPROVED',
      notes: 'Batch passed all USP <561> botanical monograph criteria. Zero synthetic pesticide residue detected (<0.001 mg/kg limit of quantification).',
      txHash: '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef01',
      parameters: [
        { name: 'Total Withanolide Content (HPLC)', value: '5.42', unit: '%', standardLimit: '≥ 2.50%', passed: true },
        { name: 'Moisture Content (Karl Fischer)', value: '5.20', unit: '%', standardLimit: '≤ 8.00%', passed: true },
        { name: 'Lead (Pb) ICP-MS', value: '0.04', unit: 'ppm', standardLimit: '< 0.50 ppm', passed: true },
        { name: 'Arsenic (As) ICP-MS', value: '0.02', unit: 'ppm', standardLimit: '< 0.20 ppm', passed: true },
        { name: 'Cadmium (Cd) ICP-MS', value: '0.01', unit: 'ppm', standardLimit: '< 0.20 ppm', passed: true },
        { name: 'Total Aerobic Plate Count', value: '450', unit: 'CFU/g', standardLimit: '< 10,000 CFU/g', passed: true },
        { name: 'E. coli & Salmonella', value: 'ABSENT', unit: '/10g', standardLimit: 'Absent/10g', passed: true }
      ]
    },
    shipmentDetails: {
      shipmentId: 'SHP-2024-0988',
      distributorId: 'USR-DST-01',
      distributorName: 'TransGlobal Cold-Chain Logistics',
      sourceLocation: 'Bangalore Central Pharma Hub, India',
      destinationLocation: 'Heathrow Cargo Hub, London, UK',
      vehicleNumber: 'KA-01-MJ-9921 / LH-Cargo-844',
      transportType: 'REFRIGERATED_TRUCK',
      temperatureRange: '18°C - 22°C (Recorded Avg: 20.1°C)',
      dispatchDate: '2024-07-10T06:00:00Z',
      expectedDeliveryDate: '2024-07-16T18:00:00Z',
      actualDeliveryDate: '2024-07-16T14:30:00Z',
      status: 'DELIVERED',
      trackingNumber: 'TG-CC-2024-991204',
      txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0'
    },
    retailDetails: {
      retailerId: 'USR-RET-01',
      retailerName: 'Pure Botanical Apothecary London',
      storeLocation: '42 Floral Street, Covent Garden, London WC2E 9DA',
      receivedDate: '2024-07-18T10:00:00Z',
      shelfBatchId: 'RET-ASH-LON-089',
      unitPrice: 28.50,
      qrCodeGenerated: true,
      notes: 'Inventory inspected, physical seals matched blockchain hash, batch placed on premium verified botanical shelf.',
      txHash: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff'
    },
    timeline: [
      {
        id: 'TL-1',
        title: 'Botanical Product Registered at Origin',
        stage: 'FARMER',
        timestamp: '2024-06-15T08:30:00Z',
        actorName: 'Rajesh Patel',
        actorRole: 'FARMER',
        location: 'Neemuch, Madhya Pradesh, India (24.4649° N, 74.8718° E)',
        description: 'Harvested 500kg certified organic Withania somnifera. Geo-tagged soil telemetry and USDA organic certificate attached.',
        txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456',
        status: 'COMPLETED',
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        metadata: { 'Batch Quantity': '500 kg', 'Cultivation': 'Regenerative Organic' }
      },
      {
        id: 'TL-2',
        title: 'Processing & Cryomilling Completed',
        stage: 'PROCESSOR',
        timestamp: '2024-06-22T14:15:00Z',
        actorName: 'Marcus Thorne',
        actorRole: 'PROCESSOR',
        location: 'PhytoExtracts Bio-Refining Hub, Bangalore',
        description: 'Raw roots washed, sanitized, cryogenic milled to 80-mesh powder (Yield: 450kg, 10% moisture loss). Sample sent for laboratory QA.',
        txHash: '0x8f3b9c71a2e4d567890123456789abcdef0123456789abcdef0123456789abcd',
        status: 'COMPLETED',
        ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM49BoV7W7VuuiC8BpU55',
        metadata: { 'Processed Yield': '450 kg', 'Mesh Size': '80 Mesh' }
      },
      {
        id: 'TL-3',
        title: 'Laboratory Quality Verification Passed',
        stage: 'LABORATORY',
        timestamp: '2024-07-02T11:00:00Z',
        actorName: 'Dr. Ananya Sharma',
        actorRole: 'LABORATORY',
        location: 'Eurofins AgriBio Analytics, Zurich/Hyderabad',
        description: 'Comprehensive HPLC & ICP-MS testing completed. Withanolides confirmed at 5.42%, Heavy metals <0.05ppm, zero pesticides. Certificate issued.',
        txHash: '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef01',
        status: 'COMPLETED',
        ipfsHash: 'QmRUTgYw6E58uY7kKqS8xP8T7G6oV8n6v4W2K1z7Y6U8mB',
        metadata: { 'Purity': '99.6%', 'Result': 'APPROVED' }
      },
      {
        id: 'TL-4',
        title: 'Cold-Chain Shipment Dispatched & Delivered',
        stage: 'DISTRIBUTOR',
        timestamp: '2024-07-16T14:30:00Z',
        actorName: 'Klaus Lindner',
        actorRole: 'DISTRIBUTOR',
        location: 'Bangalore → Frankfurt → London Heathrow',
        description: 'Shipped under strict GDP temperature loggers (18°C-22°C continuous). Delivered and verified at retailer warehouse.',
        txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
        status: 'COMPLETED',
        metadata: { 'Tracking': 'TG-CC-2024-991204', 'Temp Stability': '100% compliant' }
      },
      {
        id: 'TL-5',
        title: 'Retailer Stocked & Consumer QR Live',
        stage: 'RETAILER',
        timestamp: '2024-07-18T10:00:00Z',
        actorName: 'Sophia Laurent',
        actorRole: 'RETAILER',
        location: 'Pure Botanical Apothecary, Covent Garden, London',
        description: 'Received 450 units, retail seals generated. QR codes printed on consumer jars for full provenance scan.',
        txHash: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
        status: 'COMPLETED',
        metadata: { 'Stock Unit': '450 jars', 'Shelf Status': 'Available for Consumer Scan' }
      }
    ],
    blockchainTransactions: [
      {
        txId: '0x7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456',
        blockNumber: 10421,
        timestamp: '2024-06-15T08:30:00Z',
        stage: 'PRODUCT_CREATION',
        action: 'chaincode:CreateProduct()',
        actor: 'Rajesh Patel (Org: FarmerMSP)',
        actorRole: 'FARMER',
        payloadHash: '0xa49df38e0294829103948572019a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a',
        endorsingPeers: ['peer0.farmer.florachain.org', 'peer0.admin.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      },
      {
        txId: '0x8f3b9c71a2e4d567890123456789abcdef0123456789abcdef0123456789abcd',
        blockNumber: 10455,
        timestamp: '2024-06-22T14:15:00Z',
        stage: 'PROCESSING_LOG',
        action: 'chaincode:AddProcessingDetails()',
        actor: 'Marcus Thorne (Org: ProcessorMSP)',
        actorRole: 'PROCESSOR',
        payloadHash: '0xb58de29f1385928192847582918b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
        endorsingPeers: ['peer0.processor.florachain.org', 'peer0.farmer.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      },
      {
        txId: '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef01',
        blockNumber: 10492,
        timestamp: '2024-07-02T11:00:00Z',
        stage: 'LAB_APPROVAL',
        action: 'chaincode:ApproveProduct()',
        actor: 'Dr. Ananya Sharma (Org: LabMSP)',
        actorRole: 'LABORATORY',
        payloadHash: '0xc67ef18a2496839281958693829c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
        endorsingPeers: ['peer0.lab.florachain.org', 'peer0.admin.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      },
      {
        txId: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
        blockNumber: 10530,
        timestamp: '2024-07-16T14:30:00Z',
        stage: 'DISTRIBUTION_DELIVERY',
        action: 'chaincode:UpdateShipmentStatus(DELIVERED)',
        actor: 'Klaus Lindner (Org: DistributorMSP)',
        actorRole: 'DISTRIBUTOR',
        payloadHash: '0xd78fa09b3587948392069784930d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
        endorsingPeers: ['peer0.distributor.florachain.org', 'peer0.retailer.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      },
      {
        txId: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
        blockNumber: 10564,
        timestamp: '2024-07-18T10:00:00Z',
        stage: 'RETAIL_RECEIPT',
        action: 'chaincode:ConfirmRetailReceipt()',
        actor: 'Sophia Laurent (Org: RetailerMSP)',
        actorRole: 'RETAILER',
        payloadHash: '0xe89ab10c4698059483170895041e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e',
        endorsingPeers: ['peer0.retailer.florachain.org', 'peer0.admin.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      }
    ]
  },
  {
    id: 'BOT-2024-4412',
    batchId: 'TUR-2024-102',
    name: 'Lakadong High-Curcumin Turmeric Rhizomes',
    botanicalName: 'Curcuma longa',
    category: 'SPICE',
    cultivationMethod: 'ORGANIC',
    quantityKg: 850,
    harvestDate: '2024-07-20',
    farmLocation: 'Jaintia Hills Organic Cluster, Meghalaya, India',
    gpsCoordinates: {
      lat: 25.4484,
      lng: 92.2132
    },
    farmerId: 'USR-FRM-01',
    farmerName: 'Rajesh Patel (Co-op Partner)',
    farmerOrg: 'Vedic Agro Organic Cooperative',
    status: 'IN_TRANSIT',
    verificationState: 'VERIFIED',
    qrCodeValue: 'https://florachain.verify/BOT-2024-4412',
    description: 'World renowned Lakadong variety with exceptional natural curcumin content (>8.0%). Sun-cured and vacuum packaged in nitrogen atmosphere.',
    activeCompounds: ['Curcumin 8.4%', 'Demethoxycurcumin 1.2%', 'Essential Oils 4.1%'],
    createdTimestamp: '2024-07-22T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
    certificates: [
      {
        id: 'CERT-003',
        type: 'India Organic NPOP',
        certificateNumber: 'NPOP-MEG-2024-77',
        issuingAuthority: 'APEDA India',
        issueDate: '2024-02-01',
        expiryDate: '2025-01-31',
        ipfsCid: 'QmXyZ78991238912389abcdef1238912389123abcdef',
        status: 'VALID'
      }
    ],
    processingDetails: {
      processorId: 'USR-PRC-01',
      processorName: 'Marcus Thorne (PhytoExtracts Bio-Refining)',
      processingDate: '2024-07-28T16:00:00Z',
      method: 'Controlled Sun-Curing & Automated Slicing',
      facilityLocation: 'Guwahati Processing Terminal',
      initialQuantityKg: 1000,
      processedQuantityKg: 850,
      yieldLossPercentage: 15,
      equipmentUsed: ['Rotary Botanical Washer', 'Fluidized Bed Dryer'],
      notes: 'Cleaned, sliced to 3mm chips, low-temperature dehydrated to protect thermolabile curcuminoids.',
      txHash: '0x445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233'
    },
    labReport: {
      labId: 'USR-LAB-01',
      labName: 'Eurofins AgriBio Analytics Lab',
      testDate: '2024-08-04T10:30:00Z',
      testedBy: 'Dr. Ananya Sharma',
      purityPercentage: 99.8,
      moisturePercentage: 6.8,
      heavyMetalsStatus: 'PASS',
      microbialTestStatus: 'PASS',
      pesticideResidueStatus: 'PASS',
      certificateIpfsCid: 'QmAbCdeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef',
      overallResult: 'APPROVED',
      notes: 'Curcumin potency at 8.42% w/w, well exceeding the 7.5% premium standard. Lead test non-detectable.',
      txHash: '0x5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344',
      parameters: [
        { name: 'Curcuminoid Concentration', value: '8.42', unit: '%', standardLimit: '≥ 7.00%', passed: true },
        { name: 'Moisture Content', value: '6.80', unit: '%', standardLimit: '≤ 9.00%', passed: true },
        { name: 'Heavy Metals (Pb, Cd, Hg, As)', value: '< 0.01', unit: 'ppm', standardLimit: '< 1.00 ppm', passed: true }
      ]
    },
    shipmentDetails: {
      shipmentId: 'SHP-2024-1102',
      distributorId: 'USR-DST-01',
      distributorName: 'TransGlobal Cold-Chain Logistics',
      sourceLocation: 'Kolkata Export Hub',
      destinationLocation: 'Rotterdam Port Logistics Terminal',
      vehicleNumber: 'WB-02-TC-8831 / Maersk-Line-771',
      transportType: 'STANDARD_LOGISTICS',
      temperatureRange: '15°C - 25°C',
      dispatchDate: '2024-08-10T12:00:00Z',
      expectedDeliveryDate: '2024-08-26T18:00:00Z',
      status: 'IN_TRANSIT',
      trackingNumber: 'TG-SEA-2024-88419',
      txHash: '0x66778899aabbccddeeff00112233445566778899aabbccddeeff001122334455'
    },
    timeline: [
      {
        id: 'TL-T1',
        title: 'Product Harvest Registered',
        stage: 'FARMER',
        timestamp: '2024-07-22T09:00:00Z',
        actorName: 'Rajesh Patel',
        actorRole: 'FARMER',
        location: 'Jaintia Hills, Meghalaya (25.4484° N, 92.2132° E)',
        description: 'Registered 1000kg fresh raw Lakadong turmeric harvest.',
        txHash: '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
        status: 'COMPLETED'
      },
      {
        id: 'TL-T2',
        title: 'Low-Temp Dehydration Completed',
        stage: 'PROCESSOR',
        timestamp: '2024-07-28T16:00:00Z',
        actorName: 'Marcus Thorne',
        actorRole: 'PROCESSOR',
        location: 'Guwahati Processing Terminal',
        description: 'Cured and dehydrated to 850kg dried turmeric flakes.',
        txHash: '0x445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
        status: 'COMPLETED'
      },
      {
        id: 'TL-T3',
        title: 'Quality & Potency Approved',
        stage: 'LABORATORY',
        timestamp: '2024-08-04T10:30:00Z',
        actorName: 'Dr. Ananya Sharma',
        actorRole: 'LABORATORY',
        location: 'Eurofins Analytics Lab',
        description: 'Curcumin certified at 8.42%. Batch approved for international export.',
        txHash: '0x5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344',
        status: 'COMPLETED'
      },
      {
        id: 'TL-T4',
        title: 'In Transit — Sea Freight to Rotterdam',
        stage: 'DISTRIBUTOR',
        timestamp: '2024-08-10T12:00:00Z',
        actorName: 'Klaus Lindner',
        actorRole: 'DISTRIBUTOR',
        location: 'Kolkata → Rotterdam Port',
        description: 'Container sealed and in transit. Live GPS tracking active.',
        txHash: '0x66778899aabbccddeeff00112233445566778899aabbccddeeff001122334455',
        status: 'IN_PROGRESS'
      }
    ],
    blockchainTransactions: [
      {
        txId: '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
        blockNumber: 10610,
        timestamp: '2024-07-22T09:00:00Z',
        stage: 'PRODUCT_CREATION',
        action: 'chaincode:CreateProduct()',
        actor: 'Rajesh Patel',
        actorRole: 'FARMER',
        payloadHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
        endorsingPeers: ['peer0.farmer.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      }
    ]
  },
  {
    id: 'BOT-2024-1109',
    batchId: 'TLS-2024-045',
    name: 'Krishna Tulsi (Holy Basil) Whole Leaf',
    botanicalName: 'Ocimum tenuiflorum',
    category: 'MEDICINAL_HERB',
    cultivationMethod: 'BIODYNAMIC',
    quantityKg: 300,
    harvestDate: '2024-08-15',
    farmLocation: 'Vrindavan Sacred Forest Project, UP, India',
    gpsCoordinates: {
      lat: 27.5828,
      lng: 77.7020
    },
    farmerId: 'USR-FRM-01',
    farmerName: 'Rajesh Patel',
    farmerOrg: 'Vedic Agro Organic Cooperative',
    status: 'PROCESSING',
    verificationState: 'IN_PROGRESS',
    qrCodeValue: 'https://florachain.verify/BOT-2024-1109',
    description: 'Dark purple Krishna Tulsi leaves rich in Eugenol and Ursolic acid. Grown following Demeter biodynamic lunar planting calendar.',
    activeCompounds: ['Eugenol 68%', 'Ursolic Acid 2.1%', 'Caryophyllene'],
    createdTimestamp: '2024-08-16T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    certificates: [
      {
        id: 'CERT-004',
        type: 'Demeter Biodynamic Certification',
        certificateNumber: 'DEM-IND-2024-12',
        issuingAuthority: 'Biodynamic Federation Demeter Intl',
        issueDate: '2024-01-01',
        expiryDate: '2024-12-31',
        ipfsCid: 'QmTulsiBioDynamicCert123456789abcdefghijklmnop',
        status: 'VALID'
      }
    ],
    timeline: [
      {
        id: 'TL-B1',
        title: 'Biodynamic Harvest Registered',
        stage: 'FARMER',
        timestamp: '2024-08-16T11:00:00Z',
        actorName: 'Rajesh Patel',
        actorRole: 'FARMER',
        location: 'Vrindavan, UP (27.5828° N, 77.7020° E)',
        description: 'Harvested 300kg fresh Krishna Tulsi on full moon cycle.',
        txHash: '0xaa11bb22cc33dd44ee55ff6600778899aa11bb22cc33dd44ee55ff6600778899',
        status: 'COMPLETED'
      },
      {
        id: 'TL-B2',
        title: 'Batch Intake at Processing Facility',
        stage: 'PROCESSOR',
        timestamp: '2024-08-19T08:00:00Z',
        actorName: 'Marcus Thorne',
        actorRole: 'PROCESSOR',
        location: 'PhytoExtracts Bio-Refining Hub',
        description: 'Incoming batch intake confirmed. Scheduled for gentle air classification and steam distillation of essential fraction.',
        txHash: '0xbb22cc33dd44ee55ff6600778899aa11bb22cc33dd44ee55ff6600778899aa',
        status: 'IN_PROGRESS'
      }
    ],
    blockchainTransactions: [
      {
        txId: '0xaa11bb22cc33dd44ee55ff6600778899aa11bb22cc33dd44ee55ff6600778899',
        blockNumber: 10701,
        timestamp: '2024-08-16T11:00:00Z',
        stage: 'PRODUCT_CREATION',
        action: 'chaincode:CreateProduct()',
        actor: 'Rajesh Patel',
        actorRole: 'FARMER',
        payloadHash: '0x222233334444555566667777888899990000aaaabbbbccccddddeeeeffff1111',
        endorsingPeers: ['peer0.farmer.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      }
    ]
  },
  {
    id: 'BOT-2024-9981',
    batchId: 'NEM-2024-012',
    name: 'Wild-Crafted Neem Leaf Extract (Failed QA)',
    botanicalName: 'Azadirachta indica',
    category: 'EXTRACT',
    cultivationMethod: 'WILD_CRAFTED',
    quantityKg: 200,
    harvestDate: '2024-07-05',
    farmLocation: 'Wild Forest Reserve Buffer Zone, Rajasthan',
    gpsCoordinates: {
      lat: 26.9124,
      lng: 75.7873
    },
    farmerId: 'USR-FRM-01',
    farmerName: 'Rajesh Patel',
    farmerOrg: 'Vedic Agro Organic Cooperative',
    status: 'REJECTED',
    verificationState: 'REJECTED',
    qrCodeValue: 'https://florachain.verify/BOT-2024-9981',
    description: 'Raw Neem leaf batch flagged during multi-residue GC-MS laboratory screening due to synthetic organophosphate traces from adjacent non-organic spray drift.',
    createdTimestamp: '2024-07-06T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    certificates: [],
    labReport: {
      labId: 'USR-LAB-01',
      labName: 'Eurofins AgriBio Analytics Lab',
      testDate: '2024-07-15T15:30:00Z',
      testedBy: 'Dr. Ananya Sharma',
      purityPercentage: 81.2,
      moisturePercentage: 11.4,
      heavyMetalsStatus: 'PASS',
      microbialTestStatus: 'PASS',
      pesticideResidueStatus: 'FAIL',
      certificateIpfsCid: 'QmFailedLabReport123456789abcdefghijklmnop',
      overallResult: 'REJECTED',
      notes: 'CRITICAL FAILURE: Chlorpyrifos detected at 0.18 mg/kg (Allowed Organic Threshold: <0.01 mg/kg). Smart contract permanently locked batch from supply chain distribution.',
      txHash: '0xdeadbeef00000000000000000000000000000000000000000000000000000001',
      parameters: [
        { name: 'Organophosphate Pesticides', value: '0.18', unit: 'mg/kg', standardLimit: '< 0.01 mg/kg', passed: false },
        { name: 'Moisture Percentage', value: '11.4', unit: '%', standardLimit: '≤ 9.0%', passed: false },
        { name: 'Heavy Metals Screen', value: 'PASSED', unit: 'ppm', standardLimit: '< 1.0 ppm', passed: true }
      ]
    },
    timeline: [
      {
        id: 'TL-N1',
        title: 'Wild Harvest Registered',
        stage: 'FARMER',
        timestamp: '2024-07-06T10:00:00Z',
        actorName: 'Rajesh Patel',
        actorRole: 'FARMER',
        location: 'Buffer Zone, Rajasthan (26.9124° N, 75.7873° E)',
        description: 'Wild gathered neem leaves.',
        txHash: '0xdead010101010101010101010101010101010101010101010101010101010101',
        status: 'COMPLETED'
      },
      {
        id: 'TL-N2',
        title: 'Laboratory Quality Verification FAILED',
        stage: 'LABORATORY',
        timestamp: '2024-07-15T15:30:00Z',
        actorName: 'Dr. Ananya Sharma',
        actorRole: 'LABORATORY',
        location: 'Eurofins Analytics Lab',
        description: 'Pesticide contamination detected. Batch rejected and immutably flagged on Hyperledger ledger.',
        txHash: '0xdeadbeef00000000000000000000000000000000000000000000000000000001',
        status: 'FAILED'
      }
    ],
    blockchainTransactions: [
      {
        txId: '0xdeadbeef00000000000000000000000000000000000000000000000000000001',
        blockNumber: 10512,
        timestamp: '2024-07-15T15:30:00Z',
        stage: 'LAB_REJECTION',
        action: 'chaincode:RejectProduct()',
        actor: 'Dr. Ananya Sharma',
        actorRole: 'LABORATORY',
        payloadHash: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        endorsingPeers: ['peer0.lab.florachain.org', 'peer0.admin.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      }
    ]
  },
  {
    id: 'BOT-2024-3320',
    batchId: 'TEA-2024-077',
    name: 'Highland Nilgiri Single-Estate Silver Needle Green Tea',
    botanicalName: 'Camellia sinensis var. sinensis',
    category: 'TEA',
    cultivationMethod: 'ORGANIC',
    quantityKg: 150,
    harvestDate: '2024-08-21',
    farmLocation: 'Kotagiri High Altitude Estate (1,900m), Nilgiris, Tamil Nadu, India',
    gpsCoordinates: {
      lat: 11.4239,
      lng: 76.8667
    },
    farmerId: 'USR-FRM-01',
    farmerName: 'Rajesh Patel (Estate Manager)',
    farmerOrg: 'Vedic Agro Organic Cooperative',
    status: 'REGISTERED',
    verificationState: 'IN_PROGRESS',
    qrCodeValue: 'https://florachain.verify/BOT-2024-3320',
    description: 'First flush organic tea buds plucked before sunrise at 1,900 meters elevation in the Nilgiri cloud forest. High L-theanine and EGCG polyphenol profile.',
    activeCompounds: ['EGCG 12.8%', 'L-Theanine 3.4%', 'Caffeine 2.1%'],
    createdTimestamp: '2024-08-22T06:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    certificates: [
      {
        id: 'CERT-005',
        type: 'Rainforest Alliance Certified',
        certificateNumber: 'RA-NIL-2024-08',
        issuingAuthority: 'Rainforest Alliance',
        issueDate: '2024-03-01',
        expiryDate: '2025-02-28',
        ipfsCid: 'QmNilgiriTeaCertIpfs9921200192837465546372819',
        status: 'VALID'
      }
    ],
    timeline: [
      {
        id: 'TL-T1',
        title: 'Single-Estate First Flush Plucked & Registered',
        stage: 'FARMER',
        timestamp: '2024-08-22T06:30:00Z',
        actorName: 'Rajesh Patel',
        actorRole: 'FARMER',
        location: 'Kotagiri, Nilgiris (11.4239° N, 76.8667° E)',
        description: 'Harvested 150kg premium silver tips. Registered to Hyperledger channel.',
        txHash: '0xee99887766554433221100aabbccddeeff99887766554433221100aabbccddee',
        status: 'COMPLETED'
      }
    ],
    blockchainTransactions: [
      {
        txId: '0xee99887766554433221100aabbccddeeff99887766554433221100aabbccddee',
        blockNumber: 10742,
        timestamp: '2024-08-22T06:30:00Z',
        stage: 'PRODUCT_CREATION',
        action: 'chaincode:CreateProduct()',
        actor: 'Rajesh Patel',
        actorRole: 'FARMER',
        payloadHash: '0x33334444555566667777888899990000aaaabbbbccccddddeeeeffff11112222',
        endorsingPeers: ['peer0.farmer.florachain.org'],
        channelName: 'botanical-provenance-channel',
        chaincode: 'botanical-contract-v2.1'
      }
    ]
  }
];

export const INITIAL_SUSPICIOUS_REPORTS: SuspiciousReport[] = [
  {
    id: 'REP-2024-001',
    productId: 'BOT-UNKNOWN-999',
    batchId: 'FAKE-ASH-001',
    reporterName: 'David Miller',
    reporterEmail: 'david.m@gmail.com',
    reason: 'INVALID_QR',
    description: 'QR code on a 100g Ashwagandha tin purchased at unauthorized local flea market failed cryptographic signature verification.',
    reportedAt: '2024-08-18T14:20:00Z',
    status: 'INVESTIGATING',
    adminNotes: 'Assigned to field enforcement team for inspection.'
  },
  {
    id: 'REP-2024-002',
    productId: 'BOT-2024-8901',
    batchId: 'ASH-2024-089',
    reporterName: 'Claire Bennett',
    reporterEmail: 'claire.b@wellness.org',
    reason: 'TAMPERED_PACKAGING',
    description: 'Received jar had a broken outer seal upon home delivery, requested batch integrity confirmation.',
    reportedAt: '2024-08-21T09:15:00Z',
    status: 'RESOLVED_VALID',
    adminNotes: 'Transit courier verified damage during handling. Replacement batch dispatched.'
  }
];
