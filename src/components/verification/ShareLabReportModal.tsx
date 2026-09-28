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
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Monograph Top Status Banner */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-lg ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isApproved ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-base">{product.name}</h4>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  isApproved ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {lab?.overallResult || 'APPROVED'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {lab?.labName || 'FloraChain QA Testing Station'} • Tested on {lab?.testDate || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200">
            <div>
              <span className="text-gray-500 block">Purity</span>
              <span className="font-bold text-gray-900">{lab?.purityPercentage ?? '98.5'}%</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 block">Moisture</span>
              <span className="font-bold text-gray-900">{lab?.moisturePercentage ?? '4.2'}%</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-500 block">Heavy Metals</span>
              <span className="font-bold text-emerald-600">{lab?.heavyMetalsStatus ?? 'PASS'}</span>
            </div>
          </div>
        </div>

        {/* Password Protection Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  PDF Password Protection
                  <span className="text-[10px] uppercase tracking-wider bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                    128-Bit Encryption
                  </span>
                </h4>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  The generated PDF Certificate is encrypted. Recipient must enter this password to open the file.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-7 relative">
              <label className="block text-[11px] font-semibold text-amber-900 mb-1 flex items-center justify-between">
                <span>Custom PDF Passcode</span>
                <span className="text-amber-700 font-normal">Recipient Access Code</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-amber-700 pointer-events-none">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password..."
                  className="w-full pl-9 pr-20 py-2 text-sm bg-white border border-amber-300 rounded-lg text-gray-900 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100 transition"
                    title={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100 transition"
                    title="Copy passcode to clipboard"
                  >
                    {isCopiedPassword ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {isCopiedPassword && (
                <span className="absolute -bottom-4 left-1 text-[10px] font-medium text-emerald-700 animate-fade-in">
                  Passcode copied to clipboard!
                </span>
              )}
            </div>

            <div className="sm:col-span-5 flex flex-col justify-end pt-5 sm:pt-0">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Encrypting PDF...' : 'Download Encrypted PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Channels & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Quick Share & Summary Copy */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Direct Sharing Options
            </h5>

            {/* Native Mobile Share Button */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-emerald-500 rounded-xl shadow-xs hover:shadow-sm transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 rounded-lg transition">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block group-hover:text-emerald-700 transition">
                    {hasNativeShare ? 'Mobile Share Sheet' : 'Share Lab Certificate'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {hasNativeShare ? 'WhatsApp, AirDrop, Messages, Email' : 'Quick send report summary'}
                  </span>
                </div>
              </div>
              {shareSuccess ? (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Shared!
                </span>
              ) : (
                <Sparkles className="h-4 w-4 text-emerald-500 opacity-70 group-hover:opacity-100" />
              )}
            </button>

            {/* Copy Verification URL */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-blue-500 rounded-xl shadow-xs hover:shadow-sm transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 group-hover:bg-blue-100 text-blue-700 rounded-lg transition">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block group-hover:text-blue-700 transition">
                    Copy Verification URL
                  </span>
                  <span className="text-xs text-gray-500 font-mono truncate max-w-[200px] block">
                    /verify/{product.id}
                  </span>
                </div>
              </div>
              {isCopiedLink ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Copied!
                </span>
              ) : (
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
              )}
            </button>

            {/* Copy Plaintext Monograph Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-purple-500 rounded-xl shadow-xs hover:shadow-sm transition text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-50 group-hover:bg-purple-100 text-purple-700 rounded-lg transition">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block group-hover:text-purple-700 transition">
                    Copy Monograph Text
                  </span>
                  <span className="text-xs text-gray-500">
                    Includes test specs, hashes & passcode
                  </span>
                </div>
              </div>
              {isCopiedSummary ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Copied!
                </span>
              ) : (
                <Copy className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
              )}
            </button>
          </div>

          {/* Right Column: QR Code for Mobile Verification */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Scan & Verify On Mobile
            </h5>
            
            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-200 inline-block">
              <QRCodeSVG
                value={verificationUrl}
                size={140}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/></svg>",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed">
              Scan with any mobile camera to view real-time cryptographic audit trail and lab proofs.
            </p>
          </div>
        </div>

        {/* Ledger Proofs Footer */}
        <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 text-xs text-gray-600 space-y-1 font-mono">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">IPFS Certificate CID:</span>
            <span className="text-gray-800 font-medium truncate max-w-[260px]">
              {lab?.certificateIpfsCid || 'QmTestCertificateFloraChainQA982'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Smart Contract Tx:</span>
            <span className="text-gray-800 font-medium truncate max-w-[260px]">
              {lab?.txHash || '0x4a7c8e9b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
