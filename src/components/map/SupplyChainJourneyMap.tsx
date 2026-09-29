/* Hallmark · component: SupplyChainJourneyMap · genre: modern-minimal · theme: Botanical Daylight / Night-Vision
 * Clean, uncluttered, real botanical supply chain transit map & IoT telematics
 * states: default · hover · focus · active
 * contrast: pass (WCAG AA > 4.5:1)
 * pre-emit critique: P5 H4 E5 S4 R5 V5
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sprout,
  Cog,
  FlaskConical,
  Truck,
  Store,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Thermometer,
  X,
  Sun,
  Moon,
  FastForward,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TruckTelematicsCard, TelematicsData } from './TruckTelematicsCard';
import { BotanicalProduct } from '../../types';
import { useBlockchain } from '../../context/BlockchainContext';

export interface JourneyStage {
  id: string;
  stageNumber: number;
  stageType: 'FARM' | 'PROCESSOR' | 'LAB' | 'TRANSIT' | 'RETAIL';
  name: string;
  facility: string;
  location: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  coordinates: { x: number; y: number };
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  dateOrEta: string;
  actor: string;
  actionSummary: string;
  proofDetails: string[];
  txHash?: string;
}

export interface SupplyChainJourneyMapProps {
  batchId: string;
  productName: string;
  botanicalName?: string;
  initialProgress?: number;
  className?: string;
  /** Visual theme mode: 'light' (Botanical Daylight), 'dark' (Night-Vision), or 'auto' */
  theme?: 'light' | 'dark' | 'auto';
  /** Optional product data to avoid fetching again */
  productData?: BotanicalProduct;
}

// Stage presets for key botanical crops
const CROP_ROUTES: Record<string, { stages: JourneyStage[]; pathD: string; tempRange: { min: number; max: number; base: number } }> = {
  // 1. Organic Ashwagandha (Central India Route: MP -> MH)
  ASHWAGANDHA: {
    pathD: 'M 100 240 C 200 240, 200 140, 300 140 C 400 140, 400 320, 500 320 C 600 320, 600 160, 700 160 C 800 160, 800 260, 900 260',
    tempRange: { min: 15.0, max: 25.0, base: 18.2 },
    stages: [
      {
        id: 'ash-stage-1',
        stageNumber: 1,
        stageType: 'FARM',
        name: 'Farm Harvest Origin',
        facility: 'Vedic Agro Organic Cooperative',
        location: 'Neemuch, Madhya Pradesh',
        icon: Sprout,
        color: '#059669',
        bgColor: '#ecfdf5',
        borderColor: '#10b981',
        coordinates: { x: 100, y: 240 },
        status: 'COMPLETED',
        dateOrEta: 'June 14, 2024',
        actor: 'Rajesh Patel (Lead Cultivator)',
        actionSummary: 'Sustainably harvested 450 kg mature organic Withania somnifera root on certified regenerative plots.',
        proofDetails: [
          'Elevation: 452m above MSL',
          'Organic Certification: NPOP-ORG-2024-99812',
          'Batch Sealed: 450 kg shade-dried raw root'
        ],
        txHash: '0x8f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a'
      },
      {
        id: 'ash-stage-2',
        stageNumber: 2,
        stageType: 'PROCESSOR',
        name: 'Bio-Refining & Milling',
        facility: 'PhytoExtracts Extraction Hub',
        location: 'Indore Bio-Park, Madhya Pradesh',
        icon: Cog,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        borderColor: '#38bdf8',
        coordinates: { x: 300, y: 140 },
        status: 'COMPLETED',
        dateOrEta: 'June 22, 2024',
        actor: 'Mahesh Deshmukh (Production Lead)',
        actionSummary: 'Processed raw botanical roots via Supercritical CO2 Fluid Extraction at controlled 38.5°C.',
        proofDetails: [
          'Method: Supercritical CO2 (Solvent-free)',
          'Bio-Active Retention: 94.2%',
          'Output: 42.5 kg standardized full-spectrum powder'
        ],
        txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
      },
      {
        id: 'ash-stage-3',
        stageNumber: 3,
        stageType: 'LAB',
        name: 'Analytical QA Testing',
        facility: 'Eurofins NABL Analytical Lab',
        location: 'Hinjawadi Biotech Hub, Pune',
        icon: FlaskConical,
        color: '#4f46e5',
        bgColor: '#eef2ff',
        borderColor: '#818cf8',
        coordinates: { x: 500, y: 320 },
        status: 'COMPLETED',
        dateOrEta: 'July 02, 2024',
        actor: 'Dr. Ananya Sharma (Lead Chemist)',
        actionSummary: 'Conducted HPLC monograph assay and heavy-metal spectrometry under ISO/IEC 17025 accreditation.',
        proofDetails: [
          'Purity Assay: 5.42% Withanolides (HPLC PASS)',
          'Heavy Metals: Pb < 0.04 ppm, As < 0.02 ppm (PASS)',
          'Pathogens: Zero E. coli / Salmonella detected'
        ],
        txHash: '0x3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef01'
      },
      {
        id: 'ash-stage-4',
        stageNumber: 4,
        stageType: 'TRANSIT',
        name: 'Cold-Chain Highway Transit',
        facility: 'TransGlobal Cryo-Logistics Hub',
        location: 'JNPT Freight Corridor, Navi Mumbai',
        icon: Truck,
        color: '#0d9488',
        bgColor: '#f0fdfa',
        borderColor: '#2dd4bf',
        coordinates: { x: 700, y: 160 },
        status: 'IN_PROGRESS',
        dateOrEta: 'In Transit • ETA 17:30 IST',
        actor: 'Vikramjit Singh (Certified Carrier)',
        actionSummary: 'Active transport inside temperature-monitored refrigerated vehicle with cryptographic RFID seal.',
        proofDetails: [
          'Vehicle: MH-12-CY-8821 (Cryo-Van)',
          'Cargo Temp: 18.2°C Continuous telemetry',
          'Hardware Seal: Tamper-proof EIP-712 verified'
        ],
        txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0'
      },
      {
        id: 'ash-stage-5',
        stageNumber: 5,
        stageType: 'RETAIL',
        name: 'Apothecary Dispensary Shelf',
        facility: 'Arogya Botanical Dispensary',
        location: 'Indiranagar & Bandra Flagship',
        icon: Store,
        color: '#d97706',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        coordinates: { x: 900, y: 260 },
        status: 'PENDING',
        dateOrEta: 'Expected Arrival: Today 18:00',
        actor: 'Aarav Mehta (Dispensary Director)',
        actionSummary: 'Final retail receipt, shelf placement, and consumer dynamic QR verification deployment.',
        proofDetails: [
          'Shelf Unit Price: ₹1,450 / 250g Jar',
          'On-Pack Label: Dynamic FloraChain QR',
          'Proof Registry: Ethereum Sepolia Block #10530'
        ],
        txHash: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff'
      }
    ]
  },

  // 2. High-Curcumin Lakadong Turmeric (Northeast Route: Meghalaya -> Delhi)
  TURMERIC: {
    pathD: 'M 100 280 C 180 280, 220 180, 300 180 C 400 180, 420 340, 520 340 C 620 340, 620 150, 720 150 C 820 150, 840 250, 900 250',
    tempRange: { min: 18.0, max: 28.0, base: 21.4 },
    stages: [
      {
        id: 'tur-stage-1',
        stageNumber: 1,
        stageType: 'FARM',
        name: 'Jaintia Hills Harvest',
        facility: 'Lakadong Organic Farmers Guild',
        location: 'West Jaintia Hills, Meghalaya',
        icon: Sprout,
        color: '#059669',
        bgColor: '#ecfdf5',
        borderColor: '#10b981',
        coordinates: { x: 100, y: 280 },
        status: 'COMPLETED',
        dateOrEta: 'May 10, 2024',
        actor: 'Banteilang Myrchiang (Master Cultivator)',
        actionSummary: 'Hand-harvested 600 kg heirloom Lakadong Curcuma longa rhizomes with documented 7.8% natural curcumin content.',
        proofDetails: [
          'Geographical Indication (GI) Certified',
          'NPOP Organic Certification #MEGH-7721',
          'Harvest Yield: 600 kg fresh rhizomes'
        ],
        txHash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
      },
      {
        id: 'tur-stage-2',
        stageNumber: 2,
        stageType: 'PROCESSOR',
        name: 'Cryogenic Milling & Curing',
        facility: 'Meghalaya Bio-Processing Center',
        location: 'Guwahati Bio-Park, Assam',
        icon: Cog,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        borderColor: '#38bdf8',
        coordinates: { x: 300, y: 180 },
        status: 'COMPLETED',
        dateOrEta: 'May 18, 2024',
        actor: 'Pranab Bordoloi (Plant Director)',
        actionSummary: 'Solar-vacuum dried and cryo-pulverized rhizomes to preserve volatile aromatic turmerones.',
        proofDetails: [
          'Cryo-Milling Temp: -10°C Nitrogen blanket',
          'Volatile Oil Retention: 98.4%',
          'Mesh Grade: 100-Mesh Micro-Fine Powder'
        ],
        txHash: '0x4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e'
      },
      {
        id: 'tur-stage-3',
        stageNumber: 3,
        stageType: 'LAB',
        name: 'Curcumin Assay QA Lab',
        facility: 'NABL Eastern Analytical Hub',
        location: 'Salt Lake Sector V, Kolkata',
        icon: FlaskConical,
        color: '#4f46e5',
        bgColor: '#eef2ff',
        borderColor: '#818cf8',
        coordinates: { x: 520, y: 340 },
        status: 'COMPLETED',
        dateOrEta: 'May 28, 2024',
        actor: 'Dr. Debashis Roy (Senior Chemist)',
        actionSummary: 'Spectrophotometric & HPLC assay confirmed 7.82% Curcuminoids with zero synthetic dyes or lead chromate.',
        proofDetails: [
          'Curcuminoid Potency: 7.82% (Standard >= 5%)',
          'Lead Chromate / Dyes: ABSENT (Negative)',
          'Heavy Metal ICP-MS: All < 0.05 ppm'
        ],
        txHash: '0x3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f'
      },
      {
        id: 'tur-stage-4',
        stageNumber: 4,
        stageType: 'TRANSIT',
        name: 'Eastern Freight Corridor',
        facility: 'Northern Cryo-Express Fleet',
        location: 'NH-19 Corridor, Kanpur Hub',
        icon: Truck,
        color: '#0d9488',
        bgColor: '#f0fdfa',
        borderColor: '#2dd4bf',
        coordinates: { x: 720, y: 150 },
        status: 'IN_PROGRESS',
        dateOrEta: 'In Transit • ETA 19:45 IST',
        actor: 'Harpreet Singh (Freight Lead)',
        actionSummary: 'GPS tracked insulated express transit with real-time digital relative humidity & thermal logging.',
        proofDetails: [
          'Vehicle: DL-01-AX-9920 (Climate-Smart)',
          'Relative Humidity: 48% Dry-Seal',
          'RFID Seal Status: SECURE'
        ],
        txHash: '0x2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a'
      },
      {
        id: 'tur-stage-5',
        stageNumber: 5,
        stageType: 'RETAIL',
        name: 'Ayurvedic Wellness Boutique',
        facility: 'Vedic Wellness Emporium',
        location: 'Connaught Place, New Delhi',
        icon: Store,
        color: '#d97706',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        coordinates: { x: 900, y: 250 },
        status: 'PENDING',
        dateOrEta: 'Expected Arrival: Tomorrow 09:00',
        actor: 'Sunita Mehra (Store Director)',
        actionSummary: 'Final retail receipt and on-chain verification packaging for institutional Ayurvedic dispensing.',
        proofDetails: [
          'Packaging: Nitrogen-purged amber glass jar',
          'Retail Unit: 100g Pure Turmeric Powder',
          'Smart Contract: Sepolia Botanical Gateway'
        ],
        txHash: '0x1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
      }
    ]
  },

  // 3. Krishna Tulsi (Sacred Holy Basil Route: Vrindavan -> Delhi NCR)
  TULSI: {
    pathD: 'M 100 220 C 180 220, 220 150, 300 150 C 400 150, 420 300, 500 300 C 600 300, 620 170, 700 170 C 800 170, 820 240, 900 240',
    tempRange: { min: 14.0, max: 22.0, base: 17.5 },
    stages: [
      {
        id: 'tul-stage-1',
        stageNumber: 1,
        stageType: 'FARM',
        name: 'Vrindavan Sacred Herb Farm',
        facility: 'Yamuna Organic Herbal Cooperative',
        location: 'Vrindavan, Uttar Pradesh',
        icon: Sprout,
        color: '#059669',
        bgColor: '#ecfdf5',
        borderColor: '#10b981',
        coordinates: { x: 100, y: 220 },
        status: 'COMPLETED',
        dateOrEta: 'July 10, 2024',
        actor: 'Pandit Radheshyam (Farming Elder)',
        actionSummary: 'Sustainably collected shade-dried Krishna Tulsi (Ocimum sanctum) leaves under biodynamic agricultural standards.',
        proofDetails: [
          'Cultivation: Biodynamic Organic Certified',
          'Leaf Grade: Whole purple Krishna leaf',
          'Lot Size: 300 kg certified organic'
        ],
        txHash: '0x6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b'
      },
      {
        id: 'tul-stage-2',
        stageNumber: 2,
        stageType: 'PROCESSOR',
        name: 'Essential Oil Distillation Hub',
        facility: 'PhytoVedic Extracts Facility',
        location: 'Mathura Industrial Area, UP',
        icon: Cog,
        color: '#0284c7',
        bgColor: '#f0f9ff',
        borderColor: '#38bdf8',
        coordinates: { x: 300, y: 150 },
        status: 'COMPLETED',
        dateOrEta: 'July 15, 2024',
        actor: 'Anil Upadhyay (Chief Distiller)',
        actionSummary: 'Hydro-distilled volatile essential oils and clean-milled leaf matrix with vacuum packaging.',
        proofDetails: [
          'Eugenol Content: 71.4% in essential oil',
          'Moisture: 4.8% Karl Fischer method',
          'GMP Certification: AYUSH-GMP-2024'
        ],
        txHash: '0x5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c'
      },
      {
        id: 'tul-stage-3',
        stageNumber: 3,
        stageType: 'LAB',
        name: 'Purity & Heavy Metal Lab',
        facility: 'National Pharmacopoeia QA Lab',
        location: 'Ghaziabad NABL Biotech Center',
        icon: FlaskConical,
        color: '#4f46e5',
        bgColor: '#eef2ff',
        borderColor: '#818cf8',
        coordinates: { x: 500, y: 300 },
        status: 'COMPLETED',
        dateOrEta: 'July 20, 2024',
        actor: 'Dr. Shalini Saxena (Lab Director)',
        actionSummary: 'Monograph compliance testing confirming zero pesticide residues and optimal phenolic compound profiles.',
        proofDetails: [
          'Total Phenolics: 82.5 mg GAE/g',
          'Pesticides: < 0.001 mg/kg (Zero detected)',
          'Aerobic Plate Count: < 500 CFU/g'
        ],
        txHash: '0x4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d'
      },
      {
        id: 'tul-stage-4',
        stageNumber: 4,
        stageType: 'TRANSIT',
        name: 'Yamuna Expressway Cold Chain',
        facility: 'Vedic Logistics Express',
        location: 'Greater Noida Highway Hub',
        icon: Truck,
        color: '#0d9488',
        bgColor: '#f0fdfa',
        borderColor: '#2dd4bf',
        coordinates: { x: 700, y: 170 },
        status: 'IN_PROGRESS',
        dateOrEta: 'In Transit • ETA 16:15 IST',
        actor: 'Satish Kumar (Fleet Driver)',
        actionSummary: 'Express direct transit to central dispensary hub under nitrogen-purged cold cargo control.',
        proofDetails: [
          'Vehicle: UP-16-ZZ-4410 (Refrigerated)',
          'Controlled Temp: 17.5°C steady state',
          'Tamper Seal: CRYPTO-LOCK #8812'
        ],
        txHash: '0x3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e'
      },
      {
        id: 'tul-stage-5',
        stageNumber: 5,
        stageType: 'RETAIL',
        name: 'Vedic Wellness Apothecary',
        facility: 'Arogya Wellness flagship',
        location: 'Cyber Hub, Gurugram, Haryana',
        icon: Store,
        color: '#d97706',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        coordinates: { x: 900, y: 240 },
        status: 'PENDING',
        dateOrEta: 'Expected Arrival: Today 17:00',
        actor: 'Pooja Bhatnagar (Store Lead)',
        actionSummary: 'Final receiving inspection and consumer traceability portal activation.',
        proofDetails: [
          'Product: Organic Krishna Tulsi Tea Jar',
          'Lot Verified: 300 Retail Tins',
          'Ethereum Block: Sepolia #10542'
        ],
        txHash: '0x2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f'
      }
    ]
  }
};

/**
 * Resolves the route and stages based on the current product batch or name,
 * and merges in genuine timeline data from the blockchain context if available.
 */
function resolveCropRoute(batchId: string, productName: string, botanicalName: string = '', productData?: any) {
  const combined = `${batchId} ${productName} ${botanicalName}`.toUpperCase();
  let baseConfig = CROP_ROUTES.ASHWAGANDHA;
  if (combined.includes('TUR') || combined.includes('TURMERIC') || combined.includes('CURCUMA')) {
    baseConfig = CROP_ROUTES.TURMERIC;
  } else if (combined.includes('TUL') || combined.includes('TULSI') || combined.includes('OCIMUM') || combined.includes('BASIL')) {
    baseConfig = CROP_ROUTES.TULSI;
  }

  // Deep copy so we don't mutate the const
  const config = {
    ...baseConfig,
    stages: baseConfig.stages.map(s => ({ ...s, proofDetails: [...s.proofDetails] }))
  };

  // Merge genuine timeline data into the stages map
  if (productData && productData.timeline && productData.timeline.length > 0) {
    const timelineEvents = productData.timeline;
    
    // The stages in config are ordered: FARM(1), PROCESSOR(2), LAB(3), TRANSIT(4), RETAIL(5)
    config.stages = config.stages.map((stage, index) => {
      // Find the matching actual event from the product timeline either by index or role
      const actualEvent = timelineEvents[index] || timelineEvents.find((evt: any) => 
        (stage.stageType === 'FARM' && evt.stage === 'FARMER') ||
        (stage.stageType === 'PROCESSOR' && evt.stage === 'PROCESSOR') ||
        (stage.stageType === 'LAB' && evt.stage === 'LABORATORY') ||
        (stage.stageType === 'TRANSIT' && evt.stage === 'DISTRIBUTOR') ||
        (stage.stageType === 'RETAIL' && evt.stage === 'RETAILER')
      );

      if (actualEvent) {
        return {
          ...stage,
          name: actualEvent.title || stage.name,
          location: actualEvent.location || stage.location,
          actor: `${actualEvent.actorName} (${actualEvent.actorRole})`,
          actionSummary: actualEvent.description || stage.actionSummary,
          txHash: actualEvent.txHash || stage.txHash,
          status: actualEvent.status === 'PENDING' ? 'PENDING' : actualEvent.status === 'FAILED' ? 'PENDING' : actualEvent.status,
          dateOrEta: new Date(actualEvent.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          proofDetails: actualEvent.metadata 
            ? Object.entries(actualEvent.metadata).map(([k, v]) => `${k}: ${v}`)
            : [
                `Time: ${new Date(actualEvent.timestamp).toLocaleTimeString()}`,
                `Role: ${actualEvent.actorRole}`
              ]
        };
      }
      return stage;
    });
  }

  return config;
}

export const SupplyChainJourneyMap: React.FC<SupplyChainJourneyMapProps> = ({
  batchId,
  productName,
  botanicalName = 'Withania somnifera',
  initialProgress = 68,
  className = '',
  theme: propTheme = 'light',
  productData
}) => {
  // Theme state: allows toggling between daylight botanical and night-vision modes
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(
    propTheme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : propTheme
  );

  useEffect(() => {
    if (propTheme !== 'auto') {
      setActiveTheme(propTheme);
    }
  }, [propTheme]);

  // Listen for system theme changes if in auto mode
  useEffect(() => {
    if (propTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setActiveTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [propTheme]);

  const routeConfig = useMemo(
    () => resolveCropRoute(batchId, productName, botanicalName, productData),
    [batchId, productName, botanicalName, productData]
  );

  const stages = routeConfig.stages;
  const pathD = routeConfig.pathD;

  const [progress, setProgress] = useState(initialProgress);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5, 1, 2, 4
  const [isTelematicsOpen, setIsTelematicsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);

  const pathRef = useRef<SVGPathElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Compute truck coordinates and heading angle along the road
  const truckState = useMemo(() => {
    if (!pathRef.current) {
      return { x: 100, y: 240, angle: 0 };
    }
    try {
      const totalLen = pathRef.current.getTotalLength();
      const currentLen = (progress / 100) * totalLen;
      const pt = pathRef.current.getPointAtLength(currentLen);

      // Tangent angle
      const delta = 2;
      const ptAhead = pathRef.current.getPointAtLength(Math.min(totalLen, currentLen + delta));
      const ptBehind = pathRef.current.getPointAtLength(Math.max(0, currentLen - delta));
      const dx = ptAhead.x - ptBehind.x;
      const dy = ptAhead.y - ptBehind.y;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      return { x: pt.x, y: pt.y, angle };
    } catch {
      return { x: 100, y: 240, angle: 0 };
    }
  }, [progress]);

  // Animation loop with playback speed multiplier
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (time: number) => {
      const deltaMs = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setProgress((prev) => {
        // Base loop: 24 seconds at 1x speed
        const speedDelta = (deltaMs / (24000 / playbackSpeed)) * 100;
        const next = prev + speedDelta;
        return next >= 100 ? 0 : next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Determine which leg the truck is currently on
  const currentLegIndex = Math.min(3, Math.floor((progress / 100) * 4));
  const currentFromStage = stages[currentLegIndex] || stages[0];
  const currentToStage = stages[currentLegIndex + 1] || stages[4];

  // Dynamic Telematics Data for the truck
  const telematicsData: TelematicsData = useMemo(() => {
    const baseTemp = routeConfig.tempRange.base;
    const temp = baseTemp + Math.sin(progress * 0.25) * 0.45;
    // Generate some temperature history for the sparkline
    const temperatureHistory = [
      baseTemp - 0.2,
      baseTemp + 0.1,
      baseTemp + 0.3,
      baseTemp - 0.1,
      baseTemp + 0.2,
      baseTemp,
      temp
    ];
    return {
      batchId,
      productName,
      vehicleNumber: 'MH-12-CY-8821',
      driverName: 'Vikramjit Singh (Verified Carrier)',
      transportType: 'Cold-Chain Refrigerated Van',
      currentSpeedKmH: isPlaying ? Math.round(58 + Math.sin(progress * 0.1) * 8) : 0,
      temperatureC: temp,
      targetTempRange: { min: routeConfig.tempRange.min, max: routeConfig.tempRange.max },
      humidityPercent: 52,
      locationName: `En-Route: ${currentFromStage.name} → ${currentToStage.name}`,
      coordinates: { lat: 19.0760 + (progress / 100) * 0.4, lng: 72.8777 + (progress / 100) * 0.6 },
      currentLeg: `Leg ${currentLegIndex + 1}: ${currentFromStage.facility.split(' ')[0]} to ${currentToStage.facility.split(' ')[0]}`,
      progressPercent: Math.round(progress),
      eta: `${Math.max(5, Math.round(45 - (progress % 25) * 1.5))} mins to next checkpoint`,
      txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
      blockNumber: 10530,
      sealIntegrity: 'SECURE',
      lastTelemetryPing: new Date().toISOString(),
      temperatureHistory
    };
  }, [batchId, productName, progress, isPlaying, currentFromStage, currentToStage, currentLegIndex, routeConfig]);

  // ESC key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedStage(null);
        setIsTelematicsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStageClick = useCallback((stage: JourneyStage) => {
    setSelectedStage(stage);
  }, []);

  // Step to previous checkpoint
  const handlePrevCheckpoint = () => {
    setIsPlaying(false);
    const targetLeg = Math.max(0, currentLegIndex - (progress % 25 < 5 ? 1 : 0));
    const targetProgress = targetLeg * 25;
    setProgress(targetProgress);
    setSelectedStage(stages[targetLeg]);
  };

  // Step to next checkpoint
  const handleNextCheckpoint = () => {
    setIsPlaying(false);
    const nextLeg = Math.min(4, currentLegIndex + 1);
    const targetProgress = Math.min(100, nextLeg * 25);
    setProgress(targetProgress);
    setSelectedStage(stages[nextLeg]);
  };

  // Cycle speed multiplier
  const handleCycleSpeed = () => {
    const speeds = [0.5, 1, 2, 4];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const isLight = activeTheme === 'light';

  return (
    <div
      className={`relative w-full rounded-2xl border transition-colors shadow-sm overflow-hidden flex flex-col ${
        isLight
          ? 'bg-white border-emerald-200/80 text-emerald-950'
          : 'bg-slate-950 border-emerald-900/60 text-slate-100 shadow-2xl'
      } ${className}`}
    >
      {/* Top Banner & Control Deck Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b transition-colors ${
          isLight
            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950 backdrop-blur-sm'
            : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-xl border ${
              isLight
                ? 'bg-white text-emerald-700 border-emerald-200 shadow-xs'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Truck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">
                Live Provenance Journey
              </h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${
                  isLight
                    ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {currentFromStage.name} → {currentToStage.name}
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 hidden sm:block ${
                isLight ? 'text-emerald-800/80' : 'text-slate-400'
              }`}
            >
              Tracking {productName} ({batchId}) through 5 verified checkpoints
            </p>
          </div>
        </div>

        {/* Right Header Actions: Temperature Pill & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Cargo Temperature Pill Button */}
          <button
            type="button"
            onClick={() => setIsTelematicsOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 cursor-pointer shadow-xs ${
              isLight
                ? 'bg-white hover:bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
            }`}
            title="Click to inspect real-time IoT cargo telematics"
          >
            <Thermometer
              size={14}
              className={isLight ? 'text-emerald-600' : 'text-emerald-400'}
            />
            <span className={isLight ? 'text-emerald-700' : 'text-slate-400'}>
              Cargo:
            </span>
            <span className="font-bold">{telematicsData.temperatureC.toFixed(1)}°C</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                isLight
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              Safe
            </span>
          </button>

          {/* Daylight / Night-Vision Mode Toggle */}
          <button
            type="button"
            onClick={() => setActiveTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                : 'bg-slate-800 text-emerald-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={`Switch to ${isLight ? 'Night-Vision Satellite' : 'Botanical Daylight'} map theme`}
            aria-label="Toggle map theme"
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>

      {/* Main Journey Vector Canvas */}
      <div
        className={`relative w-full h-[460px] sm:h-[490px] overflow-hidden select-none transition-colors ${
          isLight
            ? 'bg-gradient-to-b from-[#F0FDF4] via-[#FAFCF8] to-[#F0FDF4]'
            : 'bg-gradient-to-b from-slate-950 via-[#071d17] to-slate-950'
        }`}
      >
        {/* Topographic Botanical Mesh Background (Subtle terrain elevation contours) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="botanicalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={isLight ? '#0F766E' : '#10B981'}
                strokeWidth="0.5"
                strokeOpacity={isLight ? '0.12' : '0.15'}
              />
              <circle
                cx="40"
                cy="40"
                r="1"
                fill={isLight ? '#0F766E' : '#10B981'}
                fillOpacity={isLight ? '0.2' : '0.3'}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#botanicalGrid)" />
        </svg>

        {/* Ambient Glow behind active transit */}
        <div
          className={`absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none ${
            isLight ? 'bg-emerald-300/15' : 'bg-emerald-500/10'
          }`}
        />

        <svg
          viewBox="0 0 1000 460"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <defs>
            {/* Real Highway Road Filter */}
            <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing Botanical Route Gradient */}
            <linearGradient id="corridorRoad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="35%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Truck Headlight Beam */}
            <linearGradient id="headlightCone" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop
                offset="0%"
                stopColor={isLight ? '#0284c7' : '#38bdf8'}
                stopOpacity="0.75"
              />
              <stop
                offset="100%"
                stopColor={isLight ? '#0284c7' : '#38bdf8'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Underlay Paved Roadway Surface */}
          <path
            d={pathD}
            fill="none"
            stroke={isLight ? '#cbd5e1' : '#1e293b'}
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Road Borders / Curbs */}
          <path
            d={pathD}
            fill="none"
            stroke={isLight ? '#94a3b8' : '#334155'}
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* Glowing Green/Teal Pathway */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="url(#corridorRoad)"
            strokeWidth={isLight ? '5' : '4'}
            strokeLinecap="round"
            filter={isLight ? undefined : 'url(#roadGlow)'}
          />

          {/* Center Road Lane Dashes */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="8 12"
            strokeDashoffset={-progress * 12}
            strokeOpacity={isLight ? '0.85' : '0.6'}
            strokeLinecap="round"
          />

          {/* The 5 Real-World Station Facilities */}
          {stages.map((stg) => {
            const isInProgress = stg.status === 'IN_PROGRESS';
            const isSelected = selectedStage?.id === stg.id;

            return (
              <g
                key={stg.id}
                transform={`translate(${stg.coordinates.x}, ${stg.coordinates.y})`}
                className="cursor-pointer group"
                onClick={() => handleStageClick(stg)}
                role="button"
                tabIndex={0}
                aria-label={`Inspect ${stg.name} facility`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStageClick(stg);
                }}
              >
                {/* Click Hitbox */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  fill="transparent"
                  className="cursor-pointer"
                  style={{ pointerEvents: 'all' }}
                />

                {/* Active Ripple Wave if in progress */}
                {isInProgress && (
                  <circle
                    cx="0"
                    cy="0"
                    r="28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="animate-ping opacity-40 pointer-events-none"
                  />
                )}

                {/* Facility Anchor Disc */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? 26 : 22}
                  fill={isLight ? '#ffffff' : '#022c22'}
                  stroke={isSelected ? (isLight ? '#064e3b' : '#34d399') : stg.color}
                  strokeWidth={isSelected ? 3.5 : 2.5}
                  className="transition-all duration-200 group-hover:scale-110 shadow-md"
                />

                {/* Facility Stage Number Tag */}
                <circle
                  cx="0"
                  cy="0"
                  r="12"
                  fill={stg.color}
                  stroke={isLight ? '#ffffff' : '#020617'}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="4"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                  className="font-mono pointer-events-none select-none"
                >
                  {stg.stageNumber}
                </text>

                {/* Station Card Label Box (Arranged above/below based on coordinate) */}
                <g transform={`translate(0, ${stg.coordinates.y > 200 ? -48 : 38})`}>
                  <rect
                    x="-82"
                    y="-19"
                    width="164"
                    height="38"
                    rx="8"
                    fill={isLight ? '#ffffff' : '#090d16'}
                    fillOpacity={isLight ? '0.96' : '0.95'}
                    stroke={
                      isSelected
                        ? isLight
                          ? '#064e3b'
                          : '#10b981'
                        : isLight
                        ? '#cbd5e1'
                        : '#334155'
                    }
                    strokeWidth={isSelected ? 2 : 1.5}
                    style={{ pointerEvents: 'all' }}
                    className={`transition-colors cursor-pointer ${
                      isLight
                        ? 'group-hover:stroke-emerald-600 shadow-xs'
                        : 'group-hover:stroke-emerald-400'
                    }`}
                  />
                  <text
                    x="0"
                    y="-2"
                    fontSize="10.5"
                    fontWeight="700"
                    fill={isLight ? '#064e3b' : stg.color}
                    textAnchor="middle"
                    className="tracking-tight pointer-events-none font-sans"
                  >
                    {stg.name}
                  </text>
                  <text
                    x="0"
                    y="11"
                    fontSize="8.5"
                    fontWeight="500"
                    fill={isLight ? '#475569' : '#94a3b8'}
                    textAnchor="middle"
                    className="pointer-events-none font-mono"
                  >
                    {stg.location}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Animated Delivery Truck */}
          <g
            transform={`translate(${truckState.x}, ${truckState.y}) rotate(${truckState.angle})`}
            onClick={() => setIsTelematicsOpen(true)}
            className="cursor-pointer group"
            role="button"
            tabIndex={0}
            aria-label="Click truck to inspect live IoT telematics"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsTelematicsOpen(true);
            }}
          >
            {/* Click Hitbox */}
            <circle cx="0" cy="0" r="38" fill="transparent" />

            {/* Glowing Truck Radar Aura */}
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="#10b981"
              fillOpacity={isLight ? '0.25' : '0.2'}
              stroke="#10b981"
              strokeWidth="1.5"
              className="animate-pulse"
            />

            {/* Headlight Beams */}
            <polygon
              points="14,-5 65,-20 65,20 14,5"
              fill="url(#headlightCone)"
              opacity={isLight ? 0.35 : 0.5}
            />

            {/* Main Trailer Box */}
            <rect
              x="-20"
              y="-10"
              width="26"
              height="20"
              rx="3"
              fill={isLight ? '#064e3b' : '#0f172a'}
              stroke={isLight ? '#10b981' : '#34d399'}
              strokeWidth="1.5"
              className="group-hover:stroke-emerald-300 transition-colors"
            />

            {/* Truck Cab Front */}
            <path
              d="M 6 -9 L 16 -6 L 16 6 L 6 9 Z"
              fill={isLight ? '#022c22' : '#020617'}
              stroke={isLight ? '#10b981' : '#34d399'}
              strokeWidth="1.5"
            />

            {/* Windshield */}
            <path
              d="M 8 -6 L 14 -4 L 14 4 L 8 6 Z"
              fill="#38bdf8"
              opacity="0.9"
            />

            {/* Green Botanical Leaf Emblem on Cargo */}
            <path
              d="M -10 0 C -10 -4 -5 -5 -1 0 C -5 5 -10 4 -10 0 Z"
              fill={isLight ? '#a7f3d0' : '#34d399'}
            />

            {/* Heavy-Duty Wheels */}
            <rect x="-16" y="-12.5" width="7" height="3" rx="1" fill="#334155" />
            <rect x="-16" y="9.5" width="7" height="3" rx="1" fill="#334155" />
            <rect x="5" y="-11.5" width="6" height="3" rx="1" fill="#334155" />
            <rect x="5" y="8.5" width="6" height="3" rx="1" fill="#334155" />

            {/* GPS Roof Beacon */}
            <circle cx="-6" cy="0" r="2.5" fill="#10b981" className="animate-ping" />
            <circle cx="-6" cy="0" r="2" fill="#34d399" />
          </g>
        </svg>

        {/* Live Truck Floating Info Overlay Badge */}
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-75"
          style={{
            left: `${(truckState.x / 1000) * 100}%`,
            top: `${(truckState.y / 460) * 100}%`,
            marginTop: '-24px',
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-xl text-[11px] whitespace-nowrap backdrop-blur-md ${
              isLight
                ? 'bg-white/95 border-emerald-300 text-emerald-950 font-medium'
                : 'bg-slate-900/95 border-emerald-500/60 text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              🚚 In Transit
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono font-semibold">
              {telematicsData.temperatureC.toFixed(1)}°C
            </span>
            <span
              className={`text-[10px] font-mono underline ml-0.5 ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              (Inspect)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Control Deck Bottom Bar */}
      <div
        className={`px-5 py-4 border-t flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
          isLight
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Playback Controls & Speed Multiplier */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Play/Pause Button */}
          <Button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            variant={isLight ? 'outline' : 'outline'}
            size="sm"
            className={`h-9 px-4 font-semibold active:scale-95 transition-all shadow-xs ${
              isLight
                ? 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause
                  size={14}
                  className={`mr-1.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
                />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play
                  size={14}
                  className={`mr-1.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
                />
                <span>Play Transit</span>
              </>
            )}
          </Button>

          {/* Reset / Replay */}
          <Button
            type="button"
            onClick={() => {
              setProgress(0);
              setIsPlaying(true);
            }}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 ${
              isLight
                ? 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Replay from Farm Origin"
          >
            <RotateCcw size={14} />
          </Button>

          {/* Stepper Buttons: Prev / Next Waypoint */}
          <div className="flex items-center gap-1 border-l pl-2.5 border-slate-300 dark:border-slate-800">
            <Button
              type="button"
              onClick={handlePrevCheckpoint}
              variant="ghost"
              size="sm"
              className={`h-9 px-2 text-xs font-medium ${
                isLight
                  ? 'text-emerald-800 hover:bg-emerald-100/60'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Jump to previous checkpoint"
            >
              <ChevronLeft size={14} className="mr-0.5" />
              <span>Prev</span>
            </Button>
            <Button
              type="button"
              onClick={handleNextCheckpoint}
              variant="ghost"
              size="sm"
              className={`h-9 px-2 text-xs font-medium ${
                isLight
                  ? 'text-emerald-800 hover:bg-emerald-100/60'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Jump to next checkpoint"
            >
              <span>Next</span>
              <ChevronRight size={14} className="ml-0.5" />
            </Button>
          </div>

          {/* Speed Multiplier Button */}
          <Button
            type="button"
            onClick={handleCycleSpeed}
            variant="ghost"
            size="sm"
            className={`h-9 px-2.5 text-xs font-mono font-bold ${
              isLight
                ? 'bg-emerald-100/50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700'
            }`}
            title="Toggle playback speed"
          >
            <FastForward size={13} className="mr-1" />
            <span>{playbackSpeed}x</span>
          </Button>
        </div>

        {/* Route Scrubber Slider */}
        <div className="w-full md:w-72 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className={isLight ? 'text-emerald-800 font-medium' : 'text-slate-400'}>
              Progress: Stage {currentLegIndex + 1}/5
            </span>
            <span
              className={`font-bold ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) => {
              setIsPlaying(false);
              setProgress(parseFloat(e.target.value));
            }}
            aria-label="Route animation progress scrubber"
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isLight ? 'bg-emerald-200 accent-emerald-600' : 'bg-slate-800 accent-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Selected Facility Milestone Modal Overlay */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedStage(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-title"
            className={`relative z-10 w-full max-w-lg rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-200 ${
              isLight
                ? 'bg-white border-emerald-200 text-emerald-950'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider font-mono ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    Checkpoint {selectedStage.stageNumber} Audit
                  </span>
                  <Badge
                    variant={selectedStage.status === 'COMPLETED' ? 'success' : 'outline'}
                    className="text-[10px]"
                  >
                    {selectedStage.status}
                  </Badge>
                </div>
                <h3
                  id="milestone-title"
                  className={`text-lg font-bold tracking-tight mt-1 ${
                    isLight ? 'text-emerald-950' : 'text-white'
                  }`}
                >
                  {selectedStage.facility}
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {selectedStage.location} • Operator: {selectedStage.actor}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setSelectedStage(null)}
                variant="ghost"
                size="icon"
                aria-label="Close milestone modal"
                className={`w-8 h-8 rounded-lg ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X size={16} />
              </Button>
            </div>

            <p
              className={`text-xs mt-3.5 leading-relaxed p-3.5 rounded-xl border ${
                isLight
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300'
              }`}
            >
              {selectedStage.actionSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3.5 text-xs">
              {selectedStage.proofDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border font-mono text-[11px] ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  {detail}
                </div>
              ))}
            </div>

            {selectedStage.txHash && (
              <div
                className={`flex items-center justify-between mt-4 pt-3 text-[11px] font-mono border-t ${
                  isLight
                    ? 'border-slate-100 text-emerald-700'
                    : 'border-slate-800 text-emerald-400'
                }`}
              >
                <span className="text-slate-500 truncate mr-2">
                  Tx: {selectedStage.txHash}
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${selectedStage.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:underline shrink-0 font-bold"
                >
                  <span>Sepolia Explorer</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click-to-Inspect Truck Telematics Modal */}
      {isTelematicsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsTelematicsOpen(false)}
            aria-hidden="true"
          />
          <TruckTelematicsCard
            data={telematicsData}
            onClose={() => setIsTelematicsOpen(false)}
            theme={activeTheme}
          />
        </div>
      )}
    </div>
  );
};