import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import {
  Sprout,
  ShieldCheck,
  QrCode,
  Blocks,
  Search,
  CheckCircle2,
  Lock,
  FileCheck,
  ArrowRight,
  Sparkles,
  Award,
  Fingerprint,
  MapPin,
  FlaskConical,
  Truck,
  Store,
  Cog,
  Check,
  ExternalLink,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { QRScannerModal } from '../../components/verification/QRScannerModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Footer } from '../../components/layout/Footer';

export const HomePage: React.FC = () => {
  const { products, networkStats } = useBlockchain();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<number>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
  };

  const sampleBatches = [
    {
      id: 'BOT-2024-8901',
      batchCode: 'ASH-2024-089',
      name: 'Organic Ashwagandha Root',
      botanical: 'Withania somnifera',
      status: 'VERIFIED',
      potency: '99.5% Purity',
      origin: 'Madhya Pradesh, India',
      tag: 'Certified Organic',
    },
    {
      id: 'BOT-2024-4412',
      batchCode: 'TUR-2024-102',
      name: 'Lakadong Turmeric Powder',
      botanical: 'Curcuma longa',
      status: 'VERIFIED',
      potency: '8.4% Curcumin',
      origin: 'Meghalaya, India',
      tag: 'High Potency',
    },
    {
      id: 'BOT-2024-9981',
      batchCode: 'NEM-2024-012',
      name: 'Cold-Pressed Neem Seed Oil',
      botanical: 'Azadirachta indica',
      status: 'REJECTED',
      potency: 'QA Failed (Pesticide)',
      origin: 'Rajasthan, India',
      tag: 'Contract Locked',
    },
  ];

  const pipelineStages = [
    {
      step: '01',
      role: 'Organic Farmer',
      title: 'Harvest & GPS Origin',
      icon: Sprout,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
      badge: 'Genesis Block',
      desc: 'GPS farm telemetry, harvest date, soil assay, and USDA Organic certificate CID pinned to IPFS.',
      techProof: 'Smart Contract: CreateProduct() • Signed with Farmer Node Key',
      metrics: ['Precision GPS Geotag', 'USDA Organic CID', 'Harvest Timestamp'],
    },
    {
      step: '02',
      role: 'Bio Processor',
      title: 'Milling & Refining SOP',
      icon: Cog,
      color: 'text-purple-800 bg-purple-50 border-purple-300',
      badge: 'Transformation',
      desc: 'Cryogenic milling, vacuum dehydration, mass yield delta, and GMP facility certificates stamped.',
      techProof: 'Smart Contract: AddProcessingDetails() • Mass Balance Verified',
      metrics: ['Milling Temperature (<45°C)', 'Yield Loss Delta', 'GMP Audit Hash'],
    },
    {
      step: '03',
      role: 'Quality Lab',
      title: 'HPLC Chemical Fingerprint',
      icon: FlaskConical,
      color: 'text-indigo-800 bg-indigo-50 border-indigo-300',
      badge: 'Assay Verdict',
      desc: 'High-performance liquid chromatography potency assay, heavy metal screening, and ISO-17025 lab report.',
      techProof: 'Smart Contract: AddLabReport() • Cryptographic Pass/Fail Gate',
      metrics: ['Active Compound Potency', 'Heavy Metal ICP-MS', 'ISO/IEC 17025 CID'],
    },
    {
      step: '04',
      role: 'Distributor',
      title: 'Cold-Chain IoT Logistics',
      icon: Truck,
      color: 'text-sky-800 bg-sky-50 border-sky-300',
      badge: 'Telemetry',
      desc: 'Continuous temperature logging, humidity sensors, carrier transfer timestamps, and seal tamper checks.',
      techProof: 'Smart Contract: AddShipmentDetails() • IoT Anomaly Check',
      metrics: ['Live Temperature (2-8°C)', 'GPS Route Milestones', 'Tamper Seal ID'],
    },
    {
      step: '05',
      role: 'Retailer',
      title: 'Store Shelf & QR Tag',
      icon: Store,
      color: 'text-teal-800 bg-teal-50 border-teal-300',
      badge: 'Consumer Trust',
      desc: 'Store check-in confirmation, retail batch tagging, and consumer QR code label activation.',
      techProof: 'Smart Contract: ConfirmRetailReceipt() • Complete Soil-to-Shelf Proof',
      metrics: ['Retail Shelf Tag', 'QR Authenticity URL', 'Final Consumer Scan'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-extrabold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Decentralized Botanical Provenance Ledger</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Soil to Shelf.{' '}
                <span className="text-emerald-700 block mt-1">Cryptographically Verified.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-700 max-w-xl leading-relaxed">
                FloraChain unites farmers, bio-processors, testing laboratories, distributors, and apothecaries into an immutable blockchain network to eliminate botanical adulteration and build customer trust.
              </p>

              {/* Instant Search Bar */}
              <div className="pt-2">
                <form
                  onSubmit={handleSearch}
                  className="p-2 bg-white rounded-2xl border border-slate-300 shadow-md flex flex-col sm:flex-row gap-2 max-w-xl"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)..."
                      className="w-full bg-transparent pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      <QrCode size={16} className="text-emerald-700" />
                      <span className="hidden sm:inline">Camera</span>
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Verify Batch</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Sample Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-500 font-semibold">Try sample batches:</span>
                <button
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg font-mono font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  #ASH-2024-089 (Verified)
                </button>
                <button
                  onClick={() => navigate('/verify/BOT-2024-9981')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-800 border border-slate-200 hover:border-rose-300 rounded-lg font-mono font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  #NEM-2024-012 (QA Fail)
                </button>
              </div>
            </div>

            {/* Right Card Column: Featured Live Verified Batch */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                      Live Chain Provenance
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    #ASH-2024-089
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">
                    Organic Ashwagandha Extract
                  </h3>
                  <p className="text-xs font-mono italic text-slate-500">
                    Withania somnifera (80-Mesh Root Powder)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      HPLC Active Purity
                    </span>
                    <span className="text-sm font-bold text-emerald-800 font-mono">
                      99.5% Withanolides
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Farm Coordinates
                    </span>
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      24.47°N, 74.88°E
                    </span>
                  </div>
                </div>

                {/* 5-Node Consensus Checkmarks */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Consortium Consensus Signatures (5/5):
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-xs text-center font-mono font-bold">
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Farm
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Mill
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Lab
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Cold
                    </div>
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 py-1.5 rounded-lg">
                      ✓ Retail
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Inspect Full Soil-to-Shelf Journey</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

          </div>

          {/* Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {products.length}
              </div>
              <div className="text-xs text-slate-600 font-bold uppercase mt-1">
                Batches Tracked
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <div className="text-3xl font-black text-teal-700 font-mono">
                100%
              </div>
              <div className="text-xs text-slate-600 font-bold uppercase mt-1">
                Tamper-Resistant Proof
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <div className="text-3xl font-black text-indigo-700 font-mono">
                #{networkStats.blockHeight}
              </div>
              <div className="text-xs text-slate-600 font-bold uppercase mt-1">
                Ledger Blocks Mined
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <div className="text-3xl font-black text-amber-700 font-mono">
                5 Stages
              </div>
              <div className="text-xs text-slate-600 font-bold uppercase mt-1">
                Consortium Consensus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Supply Chain Blueprint */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Cryptographic Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
            How Botanical Provenance Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Every step is signed by authorized stakeholder keys and committed to the blockchain.
          </p>
        </div>

        {/* 5 Stage Tab Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStageTab === idx;
            return (
              <button
                key={stage.step}
                onClick={() => setActiveStageTab(idx)}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    Stage {stage.step}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${stage.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{stage.role}</div>
                <div className="text-[11px] text-slate-500 truncate">{stage.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detail Showcase */}
        {(() => {
          const stage = pipelineStages[activeStageTab];
          const Icon = stage.icon;
          return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${stage.color}`}>
                    Stage {stage.step} • {stage.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {stage.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  {stage.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {stage.desc}
                </p>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-emerald-800 font-semibold">
                  {stage.techProof}
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Verified Data Points:
                </div>
                <div className="space-y-2">
                  {stage.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200"
                    >
                      <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Footer */}
      <Footer />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};
