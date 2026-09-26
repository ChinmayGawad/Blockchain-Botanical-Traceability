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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const VerifyProductPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const { getProductById, products } = useBlockchain();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(productId || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
      <section className="bg-gradient-to-r from-[#0F766E] via-teal-50/50 to-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Consumer Provenance Audit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Botanical Authenticity Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Cryptographic soil-to-shelf traceability verified across 5 consortium nodes on the blockchain.
              </p>
            </div>

            {currentProduct ? (
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => navigate('/verify')}
                  variant="outline"
                  size="sm"
                >
                  <Search size={14} className="mr-1.5" />
                  Verify Another Batch
                </Button>
                <Button
                  onClick={() => setIsScannerOpen(true)}
                  variant="botanical"
                  size="icon"
                >
                  <QrCode size={16} />
                </Button>
              </div>
            ) : (
              <div className="w-full md:w-auto md:min-w-[420px]">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" variant="botanical">
                    Verify
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    variant="outline"
                    size="icon"
                  >
                    <QrCode size={16} />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 overflow-x-hidden">
        {currentProduct ? (
          <div className="space-y-8">
            {/* 1. Cryptographic Trust Seal */}
            <TrustSeal
              state={currentProduct.verificationState}
              batchId={currentProduct.batchId}
            />

            {/* 2. Main 2-Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Product UI (Sticky) */}
              <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-8">
                {/* Product Card Summary */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge variant="botanical" className="uppercase tracking-wider">
                        {currentProduct.category.replace('_', ' ')}
                      </Badge>
                      <Button
                        onClick={() => setIsReportModalOpen(true)}
                        variant="destructive"
                        size="sm"
                      >
                        <AlertTriangle size={13} className="mr-1" />
                        Report Batch
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Image & Quick Actions */}
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-56 sm:h-64 lg:h-64 border border-slate-100 shadow-inner">
                        <img
                          src={getBotanicalProductImage(currentProduct)}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <StatusBadge status={currentProduct.status} />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Button
                          onClick={() => setIsQRModalOpen(true)}
                          variant="botanical"
                          className="w-full sm:flex-1 min-h-[48px]"
                        >
                          <QrCode size={15} className="mr-2" />
                          Print QR Tag
                        </Button>
                        <Button
                          onClick={copyShareLink}
                          variant="outline"
                        >
                          {copiedLink ? <Check size={15} className="mr-2" /> : <Share2 size={15} className="mr-2" />}
                          {copiedLink ? 'Copied' : 'Share'}
                        </Button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          {currentProduct.name}
                        </CardTitle>
                        <div className="mt-1.5">
                          <Badge variant="outline" className="font-mono font-medium">
                            {currentProduct.botanicalName}
                          </Badge>
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
                            <Badge key={idx} variant="botanical" className="flex items-center gap-1.5">
                              <CheckCircle2 size={13} />
                              <span>{compound}</span>
                            </Badge>
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
                        <span className="font-mono text-xs font-bold text-[#0F766E]">
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Supply Chain Journey, Lab QA Report & Farm Geo-Origin */}
              <div className="lg:col-span-6 space-y-6">
                {/* Complete Supply Chain Journey Stepper */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#0F766E] text-white">
                        <Sprout size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">Complete Supply Chain Journey</CardTitle>
                        <CardDescription className="text-xs">
                          Click on each stage to inspect GPS origin, processing yield, and blockchain proofs
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <SupplyChainTimeline timeline={currentProduct.timeline} />
                  </CardContent>
                </Card>

                {/* Quality Lab Report */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
                          <FlaskConical size={20} />
                        </div>
                        <div>
                          <CardTitle className="text-base">Laboratory QA Report</CardTitle>
                          <span className="text-xs text-slate-500">ISO/IEC 17025 Accredited</span>
                        </div>
                      </div>
                      {currentProduct.labReport && (
                        <Badge variant={currentProduct.labReport.overallResult === 'APPROVED' ? 'success' : 'destructive'}>
                          {currentProduct.labReport.overallResult}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
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
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Key Assay Parameters:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentProduct.labReport.parameters.map((param, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">{param.name}</span>
                                  <span className="text-[10px] text-slate-400">Limit: {param.standardLimit}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900 font-mono text-xs block">
                                    {param.value} {param.unit}
                                  </span>
                                  <span className={`text-[10px] font-bold ${param.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                            <span className="truncate">{currentProduct.labReport.certificateIpfsCid}</span>
                            <ExternalLink size={14} className="shrink-0 ml-2" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        Laboratory inspection currently in progress for this batch.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Farm Origin & Soil Map Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-[#0F766E] text-white">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base">Farm & Geo-Origin</CardTitle>
                        <CardDescription className="text-xs">GPS Verified Harvest Origin</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Farmer / Cooperative:</span>
                        <span className="font-bold text-slate-900 text-sm">{currentProduct.farmerName} ({currentProduct.farmerOrg})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Farm Location:</span>
                        <span className="font-bold text-slate-900 text-sm">{currentProduct.farmLocation}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <span className="font-mono text-slate-700 text-xs font-semibold">
                          {currentProduct.gpsCoordinates.lat.toFixed(4)}° N, {currentProduct.gpsCoordinates.lng.toFixed(4)}° E
                        </span>
                        <a
                          href={`https://maps.google.com/?q=${currentProduct.gpsCoordinates.lat},${currentProduct.gpsCoordinates.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5"
                        >
                          <span>View Map</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      {currentProduct.certificates.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 space-y-2.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Organic Certificates:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentProduct.certificates.map(cert => (
                              <div
                                key={cert.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <FileCheck size={16} className="text-[#0F766E] shrink-0" />
                                  <div>
                                    <div className="font-bold text-emerald-950">{cert.type}</div>
                                    <div className="text-[10px] text-emerald-700 font-mono">#{cert.certificateNumber}</div>
                                  </div>
                                </div>
                                <Badge variant="botanical" className="text-[10px]">{cert.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* Landing / Empty State */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-[#0F766E] flex items-center justify-center mx-auto shadow-md">
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

            <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 shadow-sm">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="e.g. ASH-2024-089 or BOT-2024-8901"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="min-h-[48px]"
                />
                <Button type="submit" variant="botanical" className="min-h-[48px]">Verify Now</Button>
              </form>
              <Button
                onClick={() => setIsScannerOpen(true)}
                variant="secondary"
                className="w-full mt-3"
              >
                <QrCode size={18} className="mr-2" />
                Launch Camera QR Scanner
              </Button>
            </Card>

            {/* Quick Demo Batches Selection */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or inspect one of our sample batches:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(p => (
                  <Card
                    key={p.id}
                    className="p-4 rounded-2xl border-slate-200 hover:border-[#0F766E] hover:bg-emerald-50/40 transition-all cursor-pointer shadow-sm"
                    onClick={() => navigate(`/verify/${p.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="botanical" className="font-mono">#{p.batchId}</Badge>
                        <StatusBadge status={p.verificationState} size="sm" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-[#0F766E]">{p.name}</div>
                      <div className="text-xs text-slate-500 italic mt-0.5">{p.botanicalName}</div>
                    </CardContent>
                  </Card>
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
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
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
