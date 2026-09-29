import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import {
  Search,
  QrCode,
  ShieldCheck,
  MapPin,
  FlaskConical,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  Sprout,
  Share2,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { TrustSeal } from '../../components/verification/TrustSeal';
import { SupplyChainTimeline } from '../../components/timeline/SupplyChainTimeline';
import { SupplyChainJourneyMap } from '../../components/map/SupplyChainJourneyMap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRModal } from '../../components/common/QRModal';
import { QRScannerModal } from '../../components/verification/QRScannerModal';
import { ReportSuspiciousModal } from '../../components/verification/ReportSuspiciousModal';
import { ShareLabReportModal } from '../../components/verification/ShareLabReportModal';
import { Footer } from '../../components/layout/Footer';
import { getBotanicalProductImage } from '../../utils/imageUtils';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const VerifyProductPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const { getProductById, products } = useBlockchain();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(productId || '');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareLabReportOpen, setIsShareLabReportOpen] = useState(false);
  const [journeyViewMode, setJourneyViewMode] = useState<'MAP' | 'TIMELINE'>('MAP');

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Search & Audit Header Bar */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-foreground py-8 sm:py-9 px-4 sm:px-6 lg:px-8 border-b border-emerald-200/60 shadow-md">
        {/* Subtle decorative glow orbs */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Consumer Provenance Audit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Botanical Authenticity Verification
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground/85 max-w-2xl leading-relaxed">
                Cryptographic soil-to-shelf traceability verified across 5 consortium nodes on the blockchain.
              </p>
            </div>

            {currentProduct ? (
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => setIsShareLabReportOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40 hover:text-white"
                  title="Share Password-Protected QA Certificate"
                >
                  <Share2 size={14} className="mr-1.5" />
                  Share Report
                </Button>
                <Button
                  onClick={() => navigate('/verify')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white"
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
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Enter Batch ID (e.g. ASH-2024-089)..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white text-muted-foreground placeholder:text-muted-foreground/60 border-emerald-200/40 focus:border-emerald-400 shadow-sm"
                    />
                  </div>
                  <Button type="submit" variant="botanical" className="shadow-sm">
                    Verify
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    variant="outline"
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white"
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
              onShare={() => setIsShareLabReportOpen(true)}
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
                      <div className="relative rounded-2xl overflow-hidden bg-muted-foreground/5 h-56 sm:h-64 lg:h-64 border border-muted-foreground/20 shadow-inner">
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
                          onClick={() => setIsShareLabReportOpen(true)}
                          variant="outline"
                          className="w-full sm:flex-1 min-h-[48px] border-emerald-600/30 hover:bg-emerald-50 text-emerald-800 font-semibold"
                          title="Share Password-Protected QA Monograph"
                        >
                          <Share2 size={15} className="mr-2 text-emerald-700" />
                          Share Report & CoA
                        </Button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2.5 pt-2 border-t border-muted-foreground/20">
                      <div>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                          {currentProduct.name}
                        </CardTitle>
                        <div className="mt-1.5">
                          <Badge variant="outline" className="font-mono font-medium">
                            {currentProduct.botanicalName}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {currentProduct.description}
                      </p>
                    </div>

                    {/* Active Phytochemical Compounds Pills */}
                    {currentProduct.activeCompounds && currentProduct.activeCompounds.length > 0 && (
                      <div className="pt-2 border-t border-muted-foreground/20">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block mb-2">
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
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-muted-foreground/20">
                      <div className="bg-muted-foreground/5 p-3.5 rounded-2xl border border-muted-foreground/20">
                        <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider block mb-1">
                          Product ID
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground break-all">
                          {currentProduct.id}
                        </span>
                      </div>
                      <div className="bg-muted-foreground/5 p-3.5 rounded-2xl border border-muted-foreground/20">
                        <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider block mb-1">
                          Batch Number
                        </span>
                        <span className="font-mono text-xs font-bold text-[#0F766E]">
                          #{currentProduct.batchId}
                        </span>
                      </div>
                      <div className="bg-muted-foreground/5 p-3.5 rounded-2xl border border-muted-foreground/20">
                        <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider block mb-1">
                          Cultivation Method
                        </span>
                        <span className="text-xs font-bold text-muted-foreground/80">
                          {currentProduct.cultivationMethod}
                        </span>
                      </div>
                      <div className="bg-muted-foreground/5 p-3.5 rounded-2xl border border-muted-foreground/20">
                        <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider block mb-1">
                          Harvest Date
                        </span>
                        <span className="text-xs font-bold text-muted-foreground/80">
                          {new Date(currentProduct.harvestDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Supply Chain Journey, Lab QA Report & Farm Geo-Origin */}
              <div className="lg:col-span-6 space-y-6">
                {/* Interactive Supply Chain Journey & Map */}
                <Card className="overflow-hidden border-muted-foreground/20 shadow-sm">
                  <CardHeader className="pb-3 border-b border-muted-foreground/20 bg-muted-foreground/5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-700 text-white shadow-2xs">
                          <Truck size={18} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base sm:text-lg text-foreground leading-snug">
                              Supply Chain Transit Journey
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground/80 border-muted-foreground/40 font-mono">
                              60 FPS LIVE
                            </Badge>
                          </div>
                          <CardDescription className="text-xs text-muted-foreground/60 leading-normal block">
                            {journeyViewMode === 'MAP'
                              ? 'Interactive route map with animated truck. Click truck to inspect IoT telematics.'
                              : 'Complete on-chain cryptographic ledger event audit log.'}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* View Switcher Toggle */}
                        <div className="flex items-center p-0.5 rounded-xl bg-muted-foreground/10 border border-muted-foreground/20 text-xs">
                          <button
                            type="button"
                            onClick={() => setJourneyViewMode('MAP')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              journeyViewMode === 'MAP'
                                ? 'bg-white text-foreground shadow-xs'
                                : 'text-muted-foreground/60 hover:text-foreground'
                            }`}
                          >
                            🗺️ Map
                          </button>
                          <button
                            type="button"
                            onClick={() => setJourneyViewMode('TIMELINE')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                              journeyViewMode === 'TIMELINE'
                                ? 'bg-white text-foreground shadow-xs'
                                : 'text-muted-foreground/60 hover:text-foreground'
                            }`}
                          >
                            📑 Ledger
                          </button>
                        </div>

                        {/* Direct link to Command Deck */}
                        <Button
                          onClick={() => navigate(`/fleet-map?batch=${currentProduct.batchId}`)}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shrink-0"
                          title="Open Full-Screen Fleet & Provenance Command Center"
                        >
                          <span>Command Deck</span>
                          <ExternalLink size={12} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-4">
                    {journeyViewMode === 'MAP' ? (
                      <div className="p-2 sm:p-0">
                        <SupplyChainJourneyMap
                          batchId={currentProduct.batchId}
                          productName={currentProduct.name}
                          botanicalName={currentProduct.botanicalName}
                          theme="light"
                          productData={currentProduct}
                        />
                      </div>
                    ) : (
                      <div className="p-4 sm:p-2">
                        <SupplyChainTimeline timeline={currentProduct.timeline} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quality Lab Report */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-muted-foreground/20">
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
                      <div className="flex items-center gap-2">
                        {currentProduct.labReport && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsShareLabReportOpen(true)}
                            className="h-8 gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold"
                            title="Share Password-Protected QA Certificate"
                          >
                            <Share2 size={13} />
                            <span>Share Report</span>
                          </Button>
                        )}
                        {currentProduct.labReport && (
                          <Badge variant={currentProduct.labReport.overallResult === 'APPROVED' ? 'success' : 'destructive'}>
                            {currentProduct.labReport.overallResult}
                          </Badge>
                        )}
                      </div>
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
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                            Key Assay Parameters:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentProduct.labReport.parameters.map((param, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-2xl border border-muted-foreground/20"
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
                        <div className="pt-2 border-t border-muted-foreground/20">
                          <span className="text-[10px] text-muted-foreground/60 uppercase font-semibold block mb-1.5">
                            IPFS Monograph Certificate Hash:
                          </span>
                          <a
                            href={`https://ipfs.io/ipfs/${currentProduct.labReport.certificateIpfsCid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-muted-foreground/95 text-emerald-400 font-mono text-xs hover:bg-muted-foreground/90 transition-colors"
                          >
                            <span className="truncate">{currentProduct.labReport.certificateIpfsCid}</span>
                            <ExternalLink size={14} className="shrink-0 ml-2" />
                          </a>
                        </div>

                        {/* Consumer Share CoA Callout Banner */}
                        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-600" />
                              Consumer Verification & Export
                            </span>
                            <p className="text-[11px] text-emerald-800">
                              Share this authenticated CoA with doctors, buyers, or family as a password-protected PDF or instant link.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="botanical"
                            onClick={() => setIsShareLabReportOpen(true)}
                            className="shrink-0 h-8 text-xs font-semibold gap-1.5"
                          >
                            <Share2 size={13} />
                            <span>Share Lab CoA</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground/60 text-xs">
                        Laboratory inspection currently in progress for this batch.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Farm Origin & Soil Map Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3 border-b border-muted-foreground/20">
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
                        <span className="text-muted-foreground/60 text-[10px] uppercase font-bold block mb-0.5">Farmer / Cooperative:</span>
                        <span className="font-bold text-foreground text-sm">{currentProduct.farmerName} ({currentProduct.farmerOrg})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/60 text-[10px] uppercase font-bold block mb-0.5">Farm Location:</span>
                        <span className="font-bold text-foreground text-sm">{currentProduct.farmLocation}</span>
                      </div>
                      <div className="bg-muted-foreground/5 p-3 rounded-xl border border-muted-foreground/20 flex items-center justify-between">
                        <span className="font-mono text-muted-foreground/80 text-xs font-semibold">
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
                        <div className="pt-3 border-t border-muted-foreground/20 space-y-2.5">
                          <span className="text-[10px] text-muted-foreground/60 uppercase font-bold block">Verified Organic Certificates:</span>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Enter Batch Code or Scan QR
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground/50 max-w-md mx-auto">
                Scan the QR code printed on your botanical package or type the Batch ID to load full immutable provenance.
              </p>
            </div>

            <Card className="p-6 sm:p-8 rounded-3xl border-muted-foreground/20 shadow-sm">
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
              <h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
                Or inspect one of our sample batches:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(p => (
                  <Card
                    key={p.id}
                    className="p-4 rounded-2xl border-muted-foreground/20 hover:border-[#0F766E] hover:bg-emerald-50/40 transition-all cursor-pointer shadow-sm"
                    onClick={() => navigate(`/verify/${p.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge variant="botanical" className="font-mono">#{p.batchId}</Badge>
                        <StatusBadge status={p.verificationState} size="sm" />
                      </div>
                      <div className="font-bold text-foreground text-sm group-hover:text-[#0F766E]">{p.name}</div>
                      <div className="text-xs text-muted-foreground/50 italic mt-0.5">{p.botanicalName}</div>
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
          onShareReport={() => {
            setIsQRModalOpen(false);
            setIsShareLabReportOpen(true);
          }}
        />
      )}
      {currentProduct && (
        <ShareLabReportModal
          isOpen={isShareLabReportOpen}
          onClose={() => setIsShareLabReportOpen(false)}
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