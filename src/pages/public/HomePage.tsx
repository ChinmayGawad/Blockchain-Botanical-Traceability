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
  Leaf,
  Link as LinkIcon,
  Users,
} from 'lucide-react';
import { QRScannerModal } from '../../components/verification/QRScannerModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Footer } from '../../components/layout/Footer';

/* ── Botanical-Blockchain Pattern Background ── */
const BotanicalPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
      <defs>
        <pattern id="botanical-chain" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Hexagon (Blockchain) */}
          <path d="M60 10 L110 35 L110 85 L60 110 L10 85 L10 35 Z" fill="none" stroke="#0F766E" strokeWidth="0.5" />
          {/* Leaf vein inner structure */}
          <path d="M60 110 C 60 70, 35 60, 10 35" fill="none" stroke="#10B981" strokeWidth="0.8" strokeDasharray="4 2" />
          <path d="M60 110 C 60 70, 85 60, 110 35" fill="none" stroke="#10B981" strokeWidth="0.8" strokeDasharray="4 2" />
          <path d="M60 10 L60 110" fill="none" stroke="#0F766E" strokeWidth="0.5" />
          {/* Nodes */}
          <circle cx="60" cy="10" r="2" fill="#0F766E" />
          <circle cx="110" cy="35" r="2" fill="#064E3B" />
          <circle cx="110" cy="85" r="2" fill="#10B981" />
          <circle cx="60" cy="110" r="2" fill="#0F766E" />
          <circle cx="10" cy="85" r="2" fill="#10B981" />
          <circle cx="10" cy="35" r="2" fill="#064E3B" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#botanical-chain)" />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F0FDF4]/60 to-[#F0FDF4]" />
  </div>
);

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
      color: 'text-teal-800 bg-teal-50 border-teal-300',
      badge: 'Genesis Block',
      desc: 'GPS farm telemetry, harvest date, soil assay, and India Organic (NPOP) certificate CID pinned to IPFS.',
      techProof: 'Smart Contract: CreateProduct() • Signed with Farmer Node Key',
      metrics: ['Precision GPS Geotag', 'NPOP Organic CID', 'Harvest Timestamp'],
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
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
      badge: 'Consumer Trust',
      desc: 'Store check-in confirmation, retail batch tagging, and consumer QR code label activation.',
      techProof: 'Smart Contract: ConfirmRetailReceipt() • Complete Soil-to-Shelf Proof',
      metrics: ['Retail Shelf Tag', 'QR Authenticity URL', 'Final Consumer Scan'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* ════════════════ HERO SECTION ════════════════ */}
      <section className="relative overflow-hidden bg-[#F0FDF4] pt-12 sm:pt-16 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#CCFCDE]">
        <BotanicalPattern />

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* ── Left Content ── */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 text-[13px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                <span>Decentralized Botanical Provenance Ledger</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-[#064E3B] tracking-tight leading-[1.1]">
                Soil to Shelf.
                <br />
                <span className="text-[#0F766E]">Cryptographically Verified.</span>
              </h1>

              {/* Sub-copy */}
              <p className="text-base sm:text-lg text-[#065F46] max-w-2xl leading-relaxed">
                FloraChain unites farmers, bio-processors, testing laboratories,
                distributors, and apothecaries into an immutable blockchain
                network to eliminate botanical adulteration and build genuine
                customer trust.
              </p>

              {/* ── Search Bar ── */}
              <div className="pt-2 w-full max-w-xl">
                <form
                  onSubmit={handleSearch}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#CCFCDE] shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-[#0F766E] focus-within:border-transparent transition-all flex flex-col sm:flex-row gap-2"
                >
                  <label htmlFor="hero-search" className="sr-only">
                    Search by Batch ID
                  </label>
                  <div className="relative flex-1 flex items-center min-h-[52px]">
                    <Search
                      size={20}
                      aria-hidden="true"
                      className="absolute left-4 text-[#5F7A6B] pointer-events-none"
                    />
                    <input
                      id="hero-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)…"
                      className="w-full bg-transparent pl-12 pr-4 py-3 text-sm sm:text-base font-mono font-medium text-[#064E3B] placeholder:text-[#8A9B82] focus:outline-none h-full"
                    />
                  </div>

                  <div className="flex gap-2 shrink-0 w-full sm:w-auto h-[52px]">
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      aria-label="Scan QR Code"
                      className="flex-1 sm:flex-none px-4 bg-[#F0FDF4] hover:bg-[#CCFCDE] text-[#0F766E] rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-[#0F766E]/20 cursor-pointer min-h-[44px]"
                    >
                      <QrCode size={18} aria-hidden="true" />
                      <span className="sm:hidden">Scan</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] sm:flex-none px-6 bg-[#0F766E] hover:bg-[#115E59] active:bg-[#0D5F56] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer min-h-[44px]"
                    >
                      <span>Verify</span>
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Sample Links */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 text-sm">
                <span className="text-[#065F46] font-semibold flex items-center gap-1.5">
                  <FlaskConical size={14} aria-hidden="true" /> Try samples:
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="px-3 py-1.5 bg-white hover:bg-[#F0FDF4] text-[#0F766E] border border-[#CCFCDE] hover:border-[#0F766E]/40 rounded-lg font-mono font-bold transition-all cursor-pointer min-h-[36px]"
                  aria-label="Try verified batch ASH-2024-089"
                >
                  <span aria-hidden="true" className="text-[#10B981] mr-1">
                    ●
                  </span>
                  ASH-2024-089
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-9981')}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg font-mono font-bold transition-all cursor-pointer min-h-[36px]"
                  aria-label="Try failed batch NEM-2024-012"
                >
                  <span aria-hidden="true" className="text-rose-500 mr-1">
                    ●
                  </span>
                  NEM-2024-012
                </button>
              </div>
            </div>

            {/* ── Right Card: Live Verified Batch ── */}
            <div className="lg:col-span-5 relative group">
              {/* Decorative background glow */}
              <div
                className="absolute -inset-1 bg-gradient-to-r from-[#0F766E] to-[#10B981] rounded-3xl blur-md opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                aria-hidden="true"
              />

              <div className="relative bg-white rounded-[24px] border border-[#CCFCDE] shadow-xl p-6 sm:p-8 space-y-6 overflow-hidden">
                {/* Decorative leaf */}
                <div
                  className="absolute -right-12 -top-12 text-[#F0FDF4] rotate-45 pointer-events-none"
                  aria-hidden="true"
                >
                  <Leaf size={140} strokeWidth={1} />
                </div>

                {/* Header row */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-1.5 rounded-full border border-[#CCFCDE]">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"
                      aria-label="Live"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                      Live Provenance
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#064E3B] bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    #ASH-2024-089
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1.5 relative z-10">
                  <h3 className="text-2xl font-black text-[#064E3B] leading-tight">
                    Organic Ashwagandha Extract
                  </h3>
                  <p className="text-sm font-mono italic text-[#5F7A6B] flex items-center gap-1.5">
                    <Leaf size={14} aria-hidden="true" /> Withania somnifera
                    (80-Mesh)
                  </p>
                </div>

                {/* Data tiles */}
                <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#CCFCDE]">
                    <span className="text-[11px] text-[#065F46] uppercase font-bold block mb-1">
                      HPLC Active Purity
                    </span>
                    <span className="text-base font-bold text-[#0F766E] font-mono whitespace-nowrap">
                      99.5% Withanolides
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-100">
                    <span className="text-[11px] text-blue-800 uppercase font-bold block mb-1">
                      Farm Coordinates
                    </span>
                    <span className="text-base font-bold text-blue-900 font-mono whitespace-nowrap flex items-center gap-1">
                      <MapPin size={14} className="shrink-0" aria-hidden="true" />
                      24.47°N, 74.88°E
                    </span>
                  </div>
                </div>

                {/* 5-Node Consensus */}
                <div className="space-y-3 pt-4 border-t border-slate-100 relative z-10">
                  <div className="text-xs font-bold text-[#5F7A6B] uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} aria-hidden="true" />
                    Consensus (5/5 Nodes):
                  </div>
                  <div
                    className="grid grid-cols-5 gap-2 text-xs text-center font-mono font-bold"
                    aria-label="Consensus status: All 5 nodes verified"
                  >
                    {['Farm', 'Mill', 'Lab', 'Cold', 'Retail'].map((node) => (
                      <div
                        key={node}
                        className="bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] py-2 rounded-xl flex flex-col items-center gap-1 hover:bg-[#D1FAE5] transition-colors"
                        title={`${node} Node Verified`}
                      >
                        <CheckCircle2
                          size={14}
                          className="text-[#10B981]"
                          aria-hidden="true"
                        />
                        <span className="text-[10px] sm:text-xs">{node}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="w-full py-4 mt-2 bg-[#064E3B] hover:bg-[#0F766E] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md relative z-10 group cursor-pointer min-h-[48px]"
                  aria-label="Inspect full journey for ASH-2024-089"
                >
                  <Search size={18} aria-hidden="true" />
                  <span>Inspect Full Journey</span>
                  <ArrowRight
                    size={16}
                    className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ── Metrics Strip ── */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-2 relative z-10">
            {[
              {
                icon: Leaf,
                value: products.length,
                label: 'Batches Tracked',
                accent: 'text-[#0F766E]',
              },
              {
                icon: ShieldCheck,
                value: '100%',
                label: 'Tamper-Proof',
                accent: 'text-[#10B981]',
              },
              {
                icon: LinkIcon,
                value: `#${networkStats.blockHeight}`,
                label: 'Ledger Blocks',
                accent: 'text-[#064E3B]',
              },
              {
                icon: Users,
                value: '5',
                label: 'Consensus Nodes',
                accent: 'text-indigo-600',
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white rounded-[20px] border border-[#CCFCDE] p-5 sm:p-6 text-center card-elevation-sm hover:-translate-y-1 transition-transform duration-200"
              >
                <div
                  className={`flex justify-center mb-2 ${m.accent}`}
                  aria-hidden="true"
                >
                  <m.icon size={24} />
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-black ${m.accent} font-mono leading-none tracking-tighter`}
                >
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm text-[#065F46] font-bold uppercase mt-2 opacity-80">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 5-STAGE SUPPLY CHAIN ════════════════ */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider bg-[#F0FDF4] px-4 py-1.5 rounded-full border border-[#CCFCDE] inline-flex items-center gap-2">
            <Lock size={14} className="text-[#10B981]" aria-hidden="true" />
            Cryptographic Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#064E3B] tracking-tight">
            How Botanical Provenance Works
          </h2>
          <p className="text-base sm:text-lg text-[#5F7A6B] max-w-xl mx-auto">
            Every step is signed by authorized stakeholder keys and committed to
            the immutable blockchain ledger.
          </p>
        </div>

        {/* ── Pipeline Stepper ── */}
        <div
          className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 lg:gap-4 mb-8 pb-4 snap-x snap-mandatory hide-scrollbar relative"
          role="tablist"
          aria-label="Supply chain stages"
        >
          {/* Connecting progress line (desktop only) */}
          <div
            className="hidden lg:block absolute top-[44px] left-8 right-8 h-1 bg-slate-200 rounded-full -z-10"
            aria-hidden="true"
          >
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(activeStageTab / (pipelineStages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStageTab === idx;
            const isPast = idx < activeStageTab;

            return (
              <button
                key={stage.step}
                role="tab"
                aria-selected={isActive}
                aria-controls={`stage-panel-${idx}`}
                id={`stage-tab-${idx}`}
                onClick={() => setActiveStageTab(idx)}
                className={`min-w-[180px] lg:min-w-0 flex-shrink-0 snap-center p-4 rounded-[20px] text-left transition-all duration-300 border cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-white border-[#10B981] ring-2 ring-[#0F766E]/20 card-elevation-md lg:scale-105'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`p-4 rounded-2xl border transition-colors ${
                      isActive
                        ? stage.color + ' shadow-sm'
                        : isPast
                          ? 'bg-[#F0FDF4] text-[#10B981] border-[#CCFCDE]'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-mono font-bold mb-1 transition-colors ${
                        isActive ? 'text-[#0F766E]' : 'text-slate-500'
                      }`}
                    >
                      Stage {stage.step}
                    </div>
                    <div
                      className={`text-sm font-bold transition-colors ${
                        isActive ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {stage.role}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile swipe hint */}
        <div
          className="lg:hidden text-center text-xs text-slate-500 font-medium mb-6 flex items-center justify-center gap-2"
          aria-hidden="true"
        >
          <ArrowRight size={12} className="rotate-180" />
          Swipe to explore stages
          <ArrowRight size={12} />
        </div>

        {/* ── Active Stage Detail ── */}
        <div className="bg-white rounded-[32px] border border-slate-200 card-elevation-md p-6 sm:p-10 transition-all">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            if (activeStageTab !== idx) return null;

            return (
              <div
                key={idx}
                role="tabpanel"
                id={`stage-panel-${idx}`}
                aria-labelledby={`stage-tab-${idx}`}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
              >
                <div className="lg:col-span-7 space-y-6">
                  {/* Tag bar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${stage.color} inline-flex items-center gap-1.5`}
                    >
                      <Icon size={14} aria-hidden="true" />
                      Stage {stage.step} • {stage.role}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {stage.title}
                  </h3>

                  <p className="text-base text-slate-600 leading-relaxed">
                    {stage.desc}
                  </p>

                  {/* Tech proof (dark code block) */}
                  <div className="p-4 bg-slate-900 rounded-2xl text-xs sm:text-sm font-mono text-emerald-400 font-medium border border-slate-800 flex items-start gap-3 shadow-inner overflow-x-auto">
                    <Lock
                      size={16}
                      className="text-emerald-500 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-relaxed whitespace-pre-wrap break-words">
                      {stage.techProof}
                    </span>
                  </div>
                </div>

                {/* Right column — verified data points */}
                <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={14} aria-hidden="true" />
                    Verified Data Points:
                  </div>
                  <div className="space-y-3">
                    {stage.metrics.map((metric, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-sm font-semibold text-slate-800 bg-white p-3.5 rounded-2xl border border-slate-200 card-elevation-xs"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
