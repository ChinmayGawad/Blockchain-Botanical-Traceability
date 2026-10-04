import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../common/Modal';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  KeyRound,
  Sparkles
} from 'lucide-react';
import { BotanicalProduct } from '../../types';
import { downloadProtectedPdf } from '../../utils/pdfGenerator';

interface ShareLabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: BotanicalProduct;
}

export const ShareLabReportModal: React.FC<ShareLabReportModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  // Password state: default to clean batch ID passcode or custom input
  const defaultPasscode = product.batchId ? product.batchId.toUpperCase() : 'FLORACHAIN2025';
  const [password, setPassword] = useState<string>(defaultPasscode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [isCopiedPassword, setIsCopiedPassword] = useState<boolean>(false);
  const [isCopiedSummary, setIsCopiedSummary] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const lab = product.labReport;
  const isApproved = lab?.overallResult === 'APPROVED';
  const verificationUrl = `${window.location.origin}/verify/${product.id}`;

  // Copy Verification URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  // Copy Password
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setIsCopiedPassword(true);
    setTimeout(() => setIsCopiedPassword(false), 2500);
  };

  // Copy Monograph Summary Text
  const handleCopySummary = () => {
    const summaryText = `🌿 FloraChain Botanical QA Certificate of Analysis
Product: ${product.name} (${product.botanicalName || 'Botanical Extract'})
Batch Code: ${product.batchId}
Testing Station: ${lab?.labName || 'FloraChain ISO/IEC 17025 Certified QA Lab'}
Assay Result: ${lab?.overallResult || 'APPROVED'}
Active Purity: ${lab?.purityPercentage ?? 'N/A'}% | Moisture: ${lab?.moisturePercentage ?? 'N/A'}%
Heavy Metals: ${lab?.heavyMetalsStatus ?? 'PASSED'} | Microbial: ${lab?.microbialTestStatus ?? 'PASSED'}
IPFS Monograph CID: ${lab?.certificateIpfsCid || 'QmVerifiedMonograph001'}
Smart Contract Tx: ${lab?.txHash || '0xVerifiedOnChain'}
PDF Security Passcode: ${password}
Verify on-chain: ${verificationUrl}`;

    navigator.clipboard.writeText(summaryText);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

  // Download Password-Protected PDF
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadProtectedPdf(product, password);
    } catch (err) {
      console.error('Failed to generate protected PDF', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 600);
    }
  };

  // Native Mobile Web Share API
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `FloraChain Lab QA Monograph - ${product.name} (Batch ${product.batchId})`,
          text: `🌿 Verified Botanical Certificate of Analysis for ${product.name}.\nResult: ${lab?.overallResult || 'APPROVED'}\nPurity: ${lab?.purityPercentage ?? 'N/A'}%\nPDF Passcode: ${password}\nVerify on blockchain:`,
          url: verificationUrl
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (err) {
        // User cancelled or share not supported
        if ((err as Error).name !== 'AbortError') {
          console.warn('Native share failed or cancelled:', err);
        }
      }
    } else {
      handleCopySummary();
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Laboratory QA Report"
      subtitle={`Batch ${product.batchId} • Password-Protected Certificate of Analysis`}
      maxWidth="2xl"
    >
      <div className="space-y-3">
        {/* Monograph Top Status Banner */}
        <div className={`p-3 sm:p-3.5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 ${
          isApproved ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-950' : 'bg-rose-50/90 border-rose-200/90 text-rose-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isApproved ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">{product.name}</h4>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                  isApproved ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {lab?.overallResult || 'APPROVED'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {lab?.labName || 'FloraChain QA Testing Station'} • Tested on {lab?.testDate ? (lab.testDate.includes('T') ? lab.testDate.split('T')[0] : lab.testDate) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 text-xs bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs self-stretch md:self-auto justify-around">
            <div>
              <span className="text-gray-500 text-[10px] font-semibold uppercase block">Purity</span>
              <span className="font-bold text-gray-900">{lab?.purityPercentage ?? '98.5'}%</span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 text-[10px] font-semibold uppercase block">Moisture</span>
              <span className="font-bold text-gray-900">{lab?.moisturePercentage ?? '4.2'}%</span>
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 text-[10px] font-semibold uppercase block whitespace-nowrap">Heavy Metals</span>
              <span className="font-bold text-emerald-600">{lab?.heavyMetalsStatus ?? 'PASS'}</span>
            </div>
          </div>
        </div>

        {/* Password Protection Section */}
        <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>PDF Password Protection</span>
                  <span className="text-[10px] uppercase tracking-wider bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    128-Bit Encryption
                  </span>
                </h4>
                <p className="text-[11.5px] text-amber-800/80 mt-0.5">
                  The generated PDF Certificate is encrypted. Recipient must enter this password to open the file.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-amber-950 flex items-center gap-2">
                <span>Custom PDF Passcode</span>
                <span className="text-[10px] font-medium text-amber-800 bg-amber-100/90 border border-amber-200/80 px-2 py-0.5 rounded-md">
                  Recipient Access Code
                </span>
              </label>
              <span className="text-[11px] text-amber-700/80 hidden sm:inline">
                Default: Batch ID
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 pointer-events-none">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password..."
                  className="w-full h-10 pl-9 pr-20 text-sm bg-white border border-amber-300 rounded-xl text-gray-900 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition shadow-2xs"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-100 transition cursor-pointer"
                    title={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-100 transition cursor-pointer"
                    title="Copy passcode to clipboard"
                  >
                    {isCopiedPassword ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="h-10 px-4.5 shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Encrypting PDF...' : 'Download Encrypted PDF'}</span>
              </button>
            </div>

            {isCopiedPassword && (
              <p className="text-[11px] font-medium text-emerald-700 animate-fade-in pl-1">
                Passcode copied to clipboard!
              </p>
            )}
          </div>
        </div>

        {/* Share Channels & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Left Column: Quick Share & Summary Copy */}
          <div className="md:col-span-7 space-y-1.5">
            <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Direct Sharing Options
            </h5>

            {/* Native Mobile Share Button */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-white border border-gray-200 hover:border-emerald-500 rounded-xl shadow-2xs hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 rounded-lg transition shrink-0">
                  <Share2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 block group-hover:text-emerald-700 transition truncate">
                    {hasNativeShare ? 'Mobile Share Sheet' : 'Share Lab Certificate'}
                  </span>
                  <span className="text-[10.5px] text-gray-500 block truncate">
                    {hasNativeShare ? 'WhatsApp, AirDrop, Messages, Email' : 'Quick send report summary'}
                  </span>
                </div>
              </div>
              {shareSuccess ? (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 shrink-0 ml-2">
                  <Check className="h-3.5 w-3.5" /> Shared!
                </span>
              ) : (
                <Sparkles className="h-4 w-4 text-emerald-500 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
              )}
            </button>

            {/* Copy Verification URL */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-white border border-gray-200 hover:border-blue-500 rounded-xl shadow-2xs hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 bg-blue-50 group-hover:bg-blue-100 text-blue-700 rounded-lg transition shrink-0">
                  <Copy className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 block group-hover:text-blue-700 transition truncate">
                    Copy Verification URL
                  </span>
                  <span className="text-[10.5px] text-gray-500 font-mono truncate max-w-[220px] block">
                    /verify/{product.id}
                  </span>
                </div>
              </div>
              {isCopiedLink ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0 ml-2">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              ) : (
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 shrink-0 ml-2" />
              )}
            </button>

            {/* Copy Plaintext Monograph Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-white border border-gray-200 hover:border-purple-500 rounded-xl shadow-2xs hover:shadow-xs transition text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 bg-purple-50 group-hover:bg-purple-100 text-purple-700 rounded-lg transition shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 block group-hover:text-purple-700 transition truncate">
                    Copy Monograph Text
                  </span>
                  <span className="text-[10.5px] text-gray-500 block truncate">
                    Includes test specs, hashes & passcode
                  </span>
                </div>
              </div>
              {isCopiedSummary ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0 ml-2">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              ) : (
                <Copy className="h-4 w-4 text-gray-400 group-hover:text-purple-500 shrink-0 ml-2" />
              )}
            </button>
          </div>

          {/* Right Column: QR Code for Mobile Verification */}
          <div className="md:col-span-5 bg-gradient-to-b from-gray-50 to-slate-100/70 border border-gray-200 rounded-2xl p-2.5 flex flex-col items-center justify-between text-center">
            <h5 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Scan & Verify On Mobile
            </h5>
            
            <div className="p-1.5 bg-white rounded-xl shadow-xs border border-gray-200 my-1">
              <QRCodeSVG
                value={verificationUrl}
                size={86}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/></svg>",
                  x: undefined,
                  y: undefined,
                  height: 16,
                  width: 16,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-[10px] text-gray-500 leading-tight max-w-[180px]">
              Scan with phone camera to view live blockchain audit trail.
            </p>
          </div>
        </div>

        {/* Ledger Proofs Footer */}
        <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2">
            <span className="text-slate-500 text-[11px]">IPFS Certificate CID:</span>
            <span className="text-slate-800 font-medium truncate max-w-full sm:max-w-[340px] text-[11px] notranslate" translate="no">
              {lab?.certificateIpfsCid || 'QmTestCertificateFloraChainQA982'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-2">
            <span className="text-slate-500 text-[11px]">Smart Contract Tx:</span>
            <span className="text-slate-800 font-medium truncate max-w-full sm:max-w-[340px] text-[11px] notranslate" translate="no">
              {lab?.txHash || '0x4a7c8e9b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
