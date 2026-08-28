import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import {
  Search,
  QrCode,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  FlaskConical,
  FileCheck,
  Truck,
  Store,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Sprout,
  Share2,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { TrustSeal } from '../../components/verification/TrustSeal';
import { SupplyChainTimeline } from '../../components/timeline/SupplyChainTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BlockchainTxBadge } from '../../components/common/BlockchainTxBadge';
import { QRModal } from '../../components/common/QRModal';
import { QRScannerModal } from '../../components/verification/QRScannerModal';
import { ReportSuspiciousModal } from '../../components/verification/ReportSuspiciousModal';
import { Footer } from '../../components/layout/Footer';
import { getBotanicalProductImage } from '../../utils/imageUtils';
import confetti from 'canvas-confetti';

export const VerifyProductPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const { getProductById, products } = useBlockchain();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(productId || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Look up product by ID or batch ID
  const currentProduct = productId
    ? getProductById(productId) || products.find(p => p.batchId.toLowerCase() === productId.toLowerCase())
    : undefined;

  useEffect(() => {
    if (currentProduct?.verificationState === 'VERIFIED') {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#059669', '#34d399'],
        });
      } catch (e) {}
    }
  }, [productId, currentProduct?.verificationState]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Search & Audit Header Bar */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Consumer Provenance Audit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Botanical Authenticity Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Cryptographic soil-to-shelf traceability verified across 5 consortium nodes on the blockchain.
              </p>
            </div>

            {/* Quick Search and Scan Bar or Return action */}
            {currentProduct ? (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => navigate('/verify')}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Search size={14} className="text-slate-500" />
                  <span>Verify Another Batch</span>
                </button>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Scan QR Code"
                >
                  <QrCode size={16} />
                </button>
              </div>
            ) : (
              <div className="w-full md:w-auto md:min-w-[420px]">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-300 shadow-sm">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs font-mono font-medium pl-10 pr-3 py-2 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-emerald-800 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Scan QR Code"
                  >
                    <QrCode size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {currentProduct ? (
          <div className="space-y-8">
            {/* 1. Cryptographic Trust Seal */}
            <TrustSeal
              state={currentProduct.verificationState}
              batchId={currentProduct.batchId}
            />

            {/* 2. Main 2-Column Section: Product UI (Left) + Supply Chain Journey & Provenance Reports (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Product UI (Sticky) */}
              <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-8">
                {/* 2a. Product Card Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Category Pill & Report Suspicious Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {currentProduct.category.replace('_', ' ')}
                    </span>

                    {/* Report Suspicious Batch Badge */}
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all shadow-2xs cursor-pointer group"
                      title="Report potential counterfeit, broken seal, or quality issue"
                    >
                      <AlertTriangle size={13} className="text-rose-600 group-hover:scale-110 transition-transform" />
                      <span>Report Batch</span>
                    </button>
                  </div>

                  {/* Product Image & Quick Actions */}
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-60 sm:h-64 border border-slate-100 shadow-inner">
                      <img
                        src={getBotanicalProductImage(currentProduct)}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={currentProduct.status} />
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <QrCode size={15} />
                        <span>Print QR Tag</span>
                      </button>
                      <button
                        onClick={copyShareLink}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Share Verification URL"
                      >
                        {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
                        <span>{copiedLink ? 'Copied' : 'Share'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {currentProduct.name}
                      </h2>
                      <div className="mt-1.5">
                        <span className="inline-block text-xs font-mono font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {currentProduct.botanicalName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {currentProduct.description}
                    </p>
                  </div>

                  {/* Active Phytochemical Compounds Pills */}
                  {currentProduct.activeCompounds && currentProduct.activeCompounds.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Phytochemical Assay Markers:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentProduct.activeCompounds.map((compound, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>{compound}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Product ID
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 break-all">
                        {currentProduct.id}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Batch Number
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        #{currentProduct.batchId}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Cultivation Method
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {currentProduct.cultivationMethod}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                        Harvest Date
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {new Date(currentProduct.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Supply Chain Journey, Lab QA Report & Farm Geo-Origin */}
              <div className="lg:col-span-6 space-y-6">
                {/* 2b. Complete Supply Chain Journey Stepper */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Complete Supply Chain Journey
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click on each stage to inspect GPS origin, processing yield, and blockchain proofs
                      </p>
                    </div>
                  </div>

                  <SupplyChainTimeline timeline={currentProduct.timeline} />
                </div>

                {/* 2c. Quality Lab Report */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
                        <FlaskConical size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          Laboratory QA Report
                        </h4>
                        <span className="text-xs text-slate-500">
                          ISO/IEC 17025 Accredited
                        </span>
                      </div>
                    </div>

                    {currentProduct.labReport && (
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          currentProduct.labReport.overallResult === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {currentProduct.labReport.overallResult}
                      </span>
                    )}
                  </div>

                  {currentProduct.labReport ? (
                    <div className="space-y-4 text-xs">
                      <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-1.5">
                        <div className="text-xs font-bold text-indigo-950">
                          {currentProduct.labReport.labName}
                        </div>
                        <div className="text-[11px] text-indigo-700">
                          Tested by: {currentProduct.labReport.testedBy}
                        </div>
                        <div className="text-[11px] text-indigo-600">
                          Date: {new Date(currentProduct.labReport.testDate).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Parameters Table */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Key Assay Parameters:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentProduct.labReport.parameters.map((param, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                            >
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{param.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  Limit: {param.standardLimit}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-900 font-mono text-xs block">
                                  {param.value} {param.unit}
                                </span>
                                <span
                                  className={`text-[10px] font-bold ${
                                    param.passed ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {param.passed ? 'PASS ✓' : 'FAIL ✗'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* IPFS Certificate Hash */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                          IPFS Monograph Certificate Hash:
                        </span>
                        <a
                          href={`https://ipfs.io/ipfs/${currentProduct.labReport.certificateIpfsCid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs hover:bg-slate-900 transition-colors"
                        >
                          <span className="truncate">
                            {currentProduct.labReport.certificateIpfsCid}
                          </span>
                          <ExternalLink size={14} className="shrink-0 ml-2" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Laboratory inspection currently in progress for this batch.
                    </div>
                  )}
                </div>

                {/* 2d. Farm Origin & Soil Map Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Farm & Geo-Origin
                      </h4>
                      <span className="text-xs text-slate-500">
                        GPS Verified Harvest Origin
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                        Farmer / Cooperative:
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {currentProduct.farmerName} ({currentProduct.farmerOrg})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                        Farm Location:
                      </span>
                      <span className="text-slate-700 font-medium">{currentProduct.farmLocation}</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <span className="font-mono text-slate-700 text-xs font-semibold">
                        {currentProduct.gpsCoordinates.lat.toFixed(4)}° N, {currentProduct.gpsCoordinates.lng.toFixed(4)}° E
                      </span>
                      <a
                        href={`https://maps.google.com/?q=${currentProduct.gpsCoordinates.lat},${currentProduct.gpsCoordinates.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                      >
                        <span>View Map</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* Organic & Fair Certificates */}
                    {currentProduct.certificates.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Verified Organic Certificates:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentProduct.certificates.map(cert => (
                            <div
                              key={cert.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <FileCheck size={16} className="text-emerald-600 shrink-0" />
                                <div>
                                  <div className="font-bold text-emerald-950">{cert.type}</div>
                                  <div className="text-[10px] text-emerald-700 font-mono">
                                    #{cert.certificateNumber}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                {cert.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When product is not found or landing on /verify without ID */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <QrCode size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Enter Batch Code or Scan QR
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Scan the QR code printed on your botanical package or type the Batch ID to load full immutable provenance.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ASH-2024-089 or BOT-2024-8901"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Verify Now
                </button>
              </form>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <QrCode size={18} />
                <span>Launch Camera QR Scanner</span>
              </button>
            </div>

            {/* Quick Demo Batches Selection */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or inspect one of our sample batches:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/verify/${p.id}`)}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        #{p.batchId}
                      </span>
                      <StatusBadge status={p.verificationState} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 italic mt-0.5">
                      {p.botanicalName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {currentProduct && (
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          product={currentProduct}
        />
      )}

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <ReportSuspiciousModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        productId={currentProduct?.id}
        batchId={currentProduct?.batchId}
        product={currentProduct}
      />

      <Footer />
    </div>
  );
};
