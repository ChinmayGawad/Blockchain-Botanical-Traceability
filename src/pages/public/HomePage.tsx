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
      color: 'text-emerald-700 bg-emerald-100/80 border-emerald-200',
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
      color: 'text-purple-700 bg-purple-100/80 border-purple-200',
      badge: 'Transformation',
      desc: 'Cryogenic milling, vacuum dehydration, mass yield delta, and GMP facility certificates stamped.',
      techProof: 'Smart Contract: AddProcessingDetails() • Mass Balance Verified',
      metrics: ['Milling Temperature (<45°C)', 'Yield Loss Delta', 'GMP Audit Hash'],
    },
    {
      step: '03',
      role: 'Testing Laboratory',
      title: 'HPLC Potency & Safety',
      icon: FlaskConical,
      color: 'text-indigo-700 bg-indigo-100/80 border-indigo-200',
      badge: 'Consensus Gate',
      desc: 'HPLC active compound potency, heavy metal ICP-MS, microbial counts, and pesticide screens.',
      techProof: 'Smart Contract: ApproveProduct() • ISO/IEC 17025 Accredited',
      metrics: ['Phytochemical Assay %', 'Zero Pesticide Residue', 'Heavy Metals <0.05ppm'],
    },
    {
      step: '04',
      role: 'Cold Distributor',
      title: 'GDP Climate Logistics',
      icon: Truck,
      color: 'text-sky-700 bg-sky-100/80 border-sky-200',
      badge: 'Custody Hand-off',
      desc: 'Refrigerated vehicle tracking, GDP temperature telemetry, and dispatch manifest sign-offs.',
      techProof: 'Smart Contract: CreateShipment() • Multi-Peer Endorsement',
      metrics: ['GDP Temp Log (18-22°C)', 'Carrier Tracking CID', 'Dispatch Checksum'],
    },
    {
      step: '05',
      role: 'Retail Apothecary',
      title: 'Tamper-Proof QR Tags',
      icon: Store,
      color: 'text-teal-700 bg-teal-100/80 border-teal-200',
      badge: 'Consumer Trust',
      desc: 'Physical tamper seal verification, store shelf placement, and instant consumer smartphone audit.',
      techProof: 'Smart Contract: ConfirmReceipt() • Consumer Verified',
      metrics: ['Unique Cryptographic QR', 'Retail Shelf Batch ID', 'Live Public URL'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Content & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles size={13} className="text-emerald-400" />
                <span>Hyperledger Fabric • Botanical Traceability</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Verify Botanical Purity <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  from Soil to Shelf.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Decentralized supply chain provenance connecting organic farmers, processors, quality laboratories, and retailers for verified botanical authenticity.
              </p>

              {/* Quick Search & Scan Box */}
              <div className="pt-2 max-w-xl">
                <form
                  onSubmit={handleSearch}
                  className="bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row gap-2"
                >
                  <div className="flex-1 relative flex items-center">
                    <Search size={18} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Verify Batch</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center cursor-pointer border border-white/10"
                      title="Scan QR Code via Camera"
                    >
                      <QrCode size={19} />
                    </button>
                  </div>
                </form>

                {/* Demo Batch Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Demo Batches:</span>
                  {sampleBatches.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => navigate(`/verify/${b.id}`)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all cursor-pointer border ${
                        b.status === 'VERIFIED'
                          ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <span>{b.batchCode}</span>
                      <span className="text-[10px] opacity-75">({b.name.split(' ')[1]})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Cryptographic Verification Pass Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
                {/* Glow pill */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Digital Provenance Certificate</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Channel: botanical-provenance-channel
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/50 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    100% VALID
                  </span>
                </div>

                {/* Botanical Details Summary */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        Organic Ashwagandha Extract
                      </h3>
                      <p className="text-xs text-emerald-300/80 italic font-mono">
                        Withania somnifera (80-Mesh Root Powder)
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      #ASH-2024-089
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        HPLC Active Purity
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        99.5% Withanolides
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Farm Coordinates
                      </span>
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        24.47°N, 74.88°E
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Node Consensus Checkmarks */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Consortium Quorum Endorsements (5/5):
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono">
                    <div className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg">
                      ✓ Farm
                    </div>
                    <div className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg">
                      ✓ Mill
                    </div>
                    <div className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg">
                      ✓ Lab
                    </div>
                    <div className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg">
                      ✓ Cold
                    </div>
                    <div className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg">
                      ✓ Retail
                    </div>
                  </div>
                </div>

                {/* Quick Link */}
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Inspect Soil-to-Shelf Journey</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {products.length}
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mt-1">
                Batches Tracked
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
                100%
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mt-1">
                Tamper-Resistant Proof
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
                #{networkStats.blockHeight}
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mt-1">
                EVM Ledger Blocks
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                5 Stages
              </div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold mt-1">
                End-to-End Consensus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 5-Stage Supply Chain Blueprint */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Cryptographic Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How Botanical Provenance Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every step is signed by authorized stakeholder keys and permanently committed to the blockchain channel.
          </p>
        </div>

        {/* 5 Stage Tab Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStageTab === idx;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStageTab(idx)}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Stage {stage.step}
                  </span>
                  <div className={`p-1.5 rounded-lg ${stage.color}`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {stage.title}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {stage.role}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        {pipelineStages[activeStageTab] && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Stage {pipelineStages[activeStageTab].step} • {pipelineStages[activeStageTab].role}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {pipelineStages[activeStageTab].badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  {pipelineStages[activeStageTab].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pipelineStages[activeStageTab].desc}
                </p>

                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs flex items-center justify-between">
                  <span className="truncate">{pipelineStages[activeStageTab].techProof}</span>
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 ml-2" />
                </div>
              </div>

              {/* Verified Metrics Checklist */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  On-Chain Telemetry Captured:
                </span>
                {pipelineStages[activeStageTab].metrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Featured Verified Botanical Batches */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Live Ledger Showcase
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Featured Verified Batches
              </h2>
            </div>

            <Link
              to="/verify"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore All {products.length} Tracked Batches</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={product.verificationState} size="sm" />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-xs">
                      #{product.batchId}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 italic font-mono">
                        {product.botanicalName}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-600" />
                        {product.farmLocation.split(',')[0]}
                      </span>
                      <span className="font-bold text-slate-800">
                        {product.quantityKg} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/verify/${product.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs group-hover:bg-emerald-600"
                  >
                    <span>View Full Provenance & Lab Certificate</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholder CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Consortium Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you an Organic Farmer, Processor, or Testing Lab?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join the FloraChain network to guarantee buyer trust, meet export pharmacopeia standards, and print verifiable cryptographic QR labels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/farmer/register"
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors text-center shadow-lg"
            >
              Register Botanical Crop
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors text-center border border-white/20"
            >
              Admin Consortium Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Reusable QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <Footer />
    </div>
  );
};
