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
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Fingerprint,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { QRScannerModal } from '../../components/verification/QRScannerModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Footer } from '../../components/layout/Footer';

export const HomePage: React.FC = () => {
  const { products, networkStats } = useBlockchain();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        {/* Subtle grid background & glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Hyperledger Fabric • Botanical Provenance</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Trust Every Harvest. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                Verify From Soil to Shelf.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              An enterprise blockchain traceability network connecting Farmers, Processors, Quality Laboratories, Distributors, and Retailers for verified botanical authenticity.
            </p>

            {/* Hero Quick Search & Scan Box */}
            <div className="pt-4 max-w-xl mx-auto">
              <form
                onSubmit={handleSearch}
                className="bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 relative flex items-center">
                  <Search size={18} className="absolute left-3.5 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Enter Batch ID (e.g. ASH-2024-089) or Product ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Verify Batch</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center"
                    title="Scan QR Code via Camera"
                  >
                    <QrCode size={20} />
                  </button>
                </div>
              </form>

              {/* Sample Quick Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span>Try Demo Batches:</span>
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-8901')}
                  className="underline hover:text-emerald-300 transition-colors font-mono"
                >
                  ASH-2024-089 (Ashwagandha)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-4412')}
                  className="underline hover:text-emerald-300 transition-colors font-mono"
                >
                  TUR-2024-102 (Turmeric)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/verify/BOT-2024-9981')}
                  className="underline hover:text-rose-300 transition-colors font-mono text-rose-300/80"
                >
                  NEM-2024-012 (Failed QA)
                </button>
              </div>
            </div>
          </div>

          {/* Metric Stats Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {products.length}
              </div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
                Batches Tracked
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">
                100%
              </div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
                Tamper-Resistant Proof
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
                #{networkStats.blockHeight}
              </div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
                Ledger Blocks
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                5 Stages
              </div>
              <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
                End-to-End Consensus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How the 5-Stage Supply Chain Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Cryptographic Consensus Pipeline
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How Botanical Provenance Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every step is signed by authorized stakeholder keys and permanently committed to the Hyperledger Fabric channel with IPFS certificate hashes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1: Farmer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Sprout size={16} className="text-emerald-600" />
              <span>Farmer Registration</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Harvest geo-coordinates, soil analytics, harvest date, and USDA Organic certificate linked to IPFS CID.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              chaincode:CreateProduct()
            </div>
          </div>

          {/* Step 2: Processor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>Processing Details</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drying method, cryogenic milling, output yield changes, and GMP facility certificates recorded on-chain.
            </p>
            <div className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded">
              chaincode:AddProcessing()
            </div>
          </div>

          {/* Step 3: Laboratory */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>Laboratory Testing</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              HPLC active compound purity, moisture, heavy metals ICP-MS, and microbial screens. Approve or lock batch.
            </p>
            <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
              chaincode:ApproveProduct()
            </div>
          </div>

          {/* Step 4: Distributor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>Cold-Chain Logistics</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Refrigerated vehicle tracking, dispatch route, temperature logs, and delivery receipt confirmation.
            </p>
            <div className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-1 rounded">
              chaincode:CreateShipment()
            </div>
          </div>

          {/* Step 5: Retailer & Consumer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              05
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>Retail & QR Verify</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Shelf placement, unique tamper-proof QR label print, and instant mobile verification for consumers.
            </p>
            <div className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-1 rounded">
              chaincode:ConfirmReceipt()
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Botanical Batches */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Active Supply Chain Ledger
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Featured Botanical Batches
              </h2>
            </div>

            <Link
              to="/verify"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore All Tracked Batches</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.slice(0, 3).map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
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
                    <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-xs">
                      Batch #{product.batchId}
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

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-600" />
                        {product.farmLocation.split(',')[0]}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {product.quantityKg} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/verify/${product.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm group-hover:bg-emerald-600"
                  >
                    <span>View Provenance & Lab Certificate</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholder CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-900/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Consortium Membership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you a Botanical Farmer, Processor, or Testing Lab?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join the FloraChain decentralized network. Guarantee buyer trust, meet global export purity regulations, and generate cryptographic QR certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/farmer/register"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors text-center shadow-lg"
            >
              Register Botanical Batch
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors text-center border border-white/20"
            >
              Admin Governance Portal
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
