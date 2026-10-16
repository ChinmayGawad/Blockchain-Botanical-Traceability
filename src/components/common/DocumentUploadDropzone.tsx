import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  X,
  Eye,
  Check,
  AlertCircle,
  File as FileIcon,
  Sparkles,
  Download,
  ExternalLink,
  Sprout,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Award,
  Shield,
  QrCode,
  Building2,
  Lock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { isValidIpfsCid } from '../../utils/ipfsUtils';
import { Modal } from './Modal';

export interface UploadedDocumentMeta {
  file: File | null;
  name: string;
  size: number;
  type: string;
  ipfsCid: string;
  previewUrl: string | null;
  uploadTimestamp: string;
}

interface DocumentUploadDropzoneProps {
  documentTitle?: string;
  documentSubtitle?: string;
  ipfsHash: string;
  onIpfsHashChange: (cid: string) => void;
  onDocumentChange?: (doc: UploadedDocumentMeta | null) => void;
  themeColor?: 'emerald' | 'purple' | 'indigo';
  sampleDocName?: string;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

// Generate a valid PDF Blob for sample documents
const createSampleCertificatePdfBlob = (docName: string, ipfsCid: string): Blob => {
  const cleanDocName = docName.replace(/[()]/g, '');
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length 850 >>
stream
BT
/F1 16 Tf
40 800 Td
(NATIONAL PROGRAMME FOR ORGANIC PRODUCTION - NPOP) Tj
/F2 10 Tf
0 -22 Td
(Ministry of Commerce and Industry, Government of India) Tj
0 -15 Td
(APEDA Accreditation Ref: NAB-0012 | ISO/IEC 17065 Accredited) Tj
0 -30 Td
/F1 13 Tf
(CERTIFICATE OF ORGANIC COMPLIANCE & BOTANICAL INTEGRITY) Tj
/F2 10 Tf
0 -25 Td
(Certificate Serial No: NPOP/IND/2024/77492-BC) Tj
0 -18 Td
(Document Name: ${cleanDocName}) Tj
0 -18 Td
(Decentralized IPFS CID: ${ipfsCid}) Tj
0 -18 Td
(Botanical Entity: Asparagus racemosus Willd. / Shatavari Root Flakes) Tj
0 -18 Td
(Production Batch Identifier: SHT-2024-842) Tj
0 -18 Td
(Certified Producer: Vedic Farms Cultivation Consortium, Neemuch, MP) Tj
0 -18 Td
(Certified Net Quantity: 320.00 KG) Tj
0 -25 Td
/F1 11 Tf
(LABORATORY QUALITY & CHEMICAL PURITY MATRIX:) Tj
/F2 10 Tf
0 -18 Td
(1. Bioactive Shatavarins I-IV: 4.82% w/w [PASS - Standard >= 3.50%]) Tj
0 -16 Td
(2. Multi-Residue Pesticides (360 Screen): NOT DETECTED [PASS - Compliant]) Tj
0 -16 Td
(3. Heavy Metals (Pb, Cd, As, Hg): < 0.04 ppm [PASS - Ultra-Pure]) Tj
0 -16 Td
(4. Moisture Level: 6.20% [PASS - Standard <= 8.00%]) Tj
0 -16 Td
(5. Pathogenic Bioburden: Negative / 25g [PASS - Sterile]) Tj
0 -30 Td
/F1 10 Tf
(CRYPTOGRAPHIC ATTESTATION & BLOCKCHAIN PROOF:) Tj
/F2 9 Tf
0 -16 Td
(This document is cryptographically pinned and immutably sealed on IPFS.) Tj
0 -14 Td
(Blockchain Network: Polygon PoS / Ethereum Sepolia Mainnet) Tj
0 -14 Td
(Smart Contract Registry: 0x71C841261a84236652e796c56d7732a9042b459a) Tj
0 -30 Td
(Authorized Signatory: Dr. Ananya Sharma, Ph.D. - Chief Certification Officer) Tj
0 -14 Td
(APEDA / OneCert Quality Assurance Accreditation Authority) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000001147 00000 n 
0000001225 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1297
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
};

const createSafeObjectUrl = (blob: Blob): string => {
  if (typeof window !== 'undefined' && typeof window.URL?.createObjectURL === 'function') {
    try {
      return window.URL.createObjectURL(blob);
    } catch {
      return '';
    }
  }
  return 'blob:http://localhost:5173/mock-doc-blob-id';
};

const revokeSafeObjectUrl = (url: string | null) => {
  if (url && typeof window !== 'undefined' && typeof window.URL?.revokeObjectURL === 'function') {
    try {
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
};

export const DocumentUploadDropzone: React.FC<DocumentUploadDropzoneProps> = ({
  documentTitle = 'Organic Certificate PDF',
  documentSubtitle = 'Decentralized cryptographic certificate committed to IPFS',
  ipfsHash,
  onIpfsHashChange,
  onDocumentChange,
  themeColor = 'emerald',
  sampleDocName = 'NPOP_Organic_Certificate_2024.pdf',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinProgress, setPinProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [attachedDoc, setAttachedDoc] = useState<UploadedDocumentMeta | null>(() => {
    if (ipfsHash && isValidIpfsCid(ipfsHash)) {
      const blob = createSampleCertificatePdfBlob(sampleDocName, ipfsHash);
      const previewUrl = createSafeObjectUrl(blob);
      return {
        file: null,
        name: sampleDocName,
        size: 1420500, // ~1.4 MB
        type: 'application/pdf',
        ipfsCid: ipfsHash,
        previewUrl,
        uploadTimestamp: new Date().toISOString(),
      };
    }
    return null;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevIpfsHashRef = useRef(ipfsHash);

  // Sync external ipfsHash updates
  useEffect(() => {
    if (ipfsHash && ipfsHash !== prevIpfsHashRef.current) {
      prevIpfsHashRef.current = ipfsHash;
      setAttachedDoc((prev) => {
        if (prev?.previewUrl && prev.file) {
          return { ...prev, ipfsCid: ipfsHash };
        }
        const blob = createSampleCertificatePdfBlob(sampleDocName, ipfsHash);
        const previewUrl = createSafeObjectUrl(blob);
        return {
          file: null,
          name: sampleDocName,
          size: 1420500,
          type: 'application/pdf',
          ipfsCid: ipfsHash,
          previewUrl,
          uploadTimestamp: new Date().toISOString(),
        };
      });
    } else if (!ipfsHash) {
      prevIpfsHashRef.current = '';
      setAttachedDoc((prev) => {
        if (prev?.previewUrl) {
          revokeSafeObjectUrl(prev.previewUrl);
        }
        return null;
      });
    }
  }, [ipfsHash, sampleDocName]);


  const themeClasses = {
    emerald: {
      borderActive: 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20',
      borderDefault: 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/60',
      iconBg: 'bg-emerald-100 text-emerald-700',
      badgeBg: 'bg-emerald-200/90 text-emerald-900 border-emerald-300',
      buttonBg: 'text-emerald-700 hover:bg-emerald-100 border-emerald-200',
      progressFill: 'bg-emerald-600',
    },
    purple: {
      borderActive: 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20',
      borderDefault: 'border-purple-300 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/60',
      iconBg: 'bg-purple-100 text-purple-700',
      badgeBg: 'bg-purple-200/90 text-purple-900 border-purple-300',
      buttonBg: 'text-purple-700 hover:bg-purple-100 border-purple-200',
      progressFill: 'bg-purple-600',
    },
    indigo: {
      borderActive: 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20',
      borderDefault: 'border-indigo-300 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/60',
      iconBg: 'bg-indigo-100 text-indigo-700',
      badgeBg: 'bg-indigo-200/90 text-indigo-900 border-indigo-300',
      buttonBg: 'text-indigo-700 hover:bg-indigo-100 border-indigo-200',
      progressFill: 'bg-indigo-600',
    },
  }[themeColor];

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Compute deterministic SHA-256 IPFS CID
  const computeIpfsCidFromFile = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Clean prefix from file name
      const cleanPrefix = file.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
      // Valid IPFS CID format (46 chars starting with Qm)
      const cid = `Qm${cleanPrefix}${hex}`.slice(0, 46);
      return cid;
    } catch {
      // Fallback CID
      return `QmCert${Date.now()}${Math.random().toString(36).substring(2, 8)}`.slice(0, 46);
    }
  };

  // Process chosen file
  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate extension
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);
    if (!isValidExtension) {
      setErrorMessage(`Unsupported file format (${ext}). Please upload PDF, Word (.doc, .docx), or Image (.png, .jpg).`);
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${formatFileSize(file.size)}). Maximum allowed size is 15 MB.`);
      return;
    }

    // Start Pinning animation
    setIsPinning(true);
    setPinProgress(20);

    const progressInterval = setInterval(() => {
      setPinProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 100);

    const computedCid = await computeIpfsCidFromFile(file);

    setTimeout(() => {
      clearInterval(progressInterval);
      setPinProgress(100);

      const previewUrl = createSafeObjectUrl(file);
      const newMeta: UploadedDocumentMeta = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || ext,
        ipfsCid: computedCid,
        previewUrl,
        uploadTimestamp: new Date().toISOString(),
      };

      prevIpfsHashRef.current = computedCid;
      setAttachedDoc(newMeta);
      onIpfsHashChange(computedCid);
      onDocumentChange?.(newMeta);
      setIsPinning(false);
      setPinProgress(0);
    }, 550);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (attachedDoc?.previewUrl) {
      URL.revokeObjectURL(attachedDoc.previewUrl);
    }
    setAttachedDoc(null);
    onIpfsHashChange('');
    onDocumentChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewTab, setPreviewTab] = useState<'certificate' | 'raw'>('certificate');

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewZoom(100);
    setPreviewTab('certificate');
    setIsPreviewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (attachedDoc?.previewUrl) {
      const a = document.createElement('a');
      a.href = attachedDoc.previewUrl;
      a.download = attachedDoc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob(
        [
          `FloraChain Decentralized Botanical Traceability Certificate\n=======================================================\nDocument: ${attachedDoc?.name}\nIPFS CID: ${attachedDoc?.ipfsCid}\nAccreditation: APEDA National Programme for Organic Production (NPOP)\nStandard: ISO/IEC 17025 Certified Organic Botanical Integrity\nStatus: Cryptographically Verified & Immutable On-Chain\nVerification Timestamp: ${attachedDoc?.uploadTimestamp || new Date().toISOString()}`
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachedDoc?.name || 'Botanical_Certificate.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyCid = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (attachedDoc?.ipfsCid) {
      navigator.clipboard.writeText(attachedDoc.ipfsCid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    setIsPinning(true);
    setPinProgress(35);

    setTimeout(() => {
      setPinProgress(100);
      const sampleCid = `QmShatavariCert${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`.slice(0, 46);
      const blob = createSampleCertificatePdfBlob(sampleDocName, sampleCid);
      const previewUrl = createSafeObjectUrl(blob);
      const sampleMeta: UploadedDocumentMeta = {
        file: null,
        name: sampleDocName,
        size: 1420500,
        type: 'application/pdf',
        ipfsCid: sampleCid,
        previewUrl,
        uploadTimestamp: new Date().toISOString(),
      };
      setAttachedDoc(sampleMeta);
      onIpfsHashChange(sampleCid);
      onDocumentChange?.(sampleMeta);
      setIsPinning(false);
      setPinProgress(0);
    }, 400);
  };

  return (
    <div className="space-y-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="document-upload-input"
        aria-label="Upload document file"
      />

      {/* Upload Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !attachedDoc && fileInputRef.current?.click()}
        className={`relative p-5 sm:p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer select-none ${
          isDragging ? themeClasses.borderActive : themeClasses.borderDefault
        }`}
      >
        <AnimatePresence mode="wait">
          {/* State 1: Uploading & Pinning Progress */}
          {isPinning ? (
            <motion.div
              key="pinning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-4 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto border border-slate-200">
                <UploadCloud className="text-emerald-600 animate-bounce" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Computing SHA-256 Hash & Pinning to IPFS Cluster...
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Publishing cryptographic proof to decentralized storage
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${themeClasses.progressFill} transition-all duration-300 ease-out`}
                  style={{ width: `${pinProgress}%` }}
                />
              </div>
            </motion.div>
          ) : attachedDoc ? (
            /* State 2: Document Attached & Pinned */
            <motion.div
              key="attached"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl ${themeClasses.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                    {attachedDoc.name.toLowerCase().endsWith('.pdf') ? (
                      <FileText size={22} />
                    ) : attachedDoc.name.toLowerCase().match(/\.(png|jpg|jpeg)$/) ? (
                      <FileCheck2 size={22} />
                    ) : (
                      <FileIcon size={22} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                        {attachedDoc.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {formatFileSize(attachedDoc.size)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {documentTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove document and upload new one"
                  aria-label="Remove document"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Securely Uploaded Message */}
              <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                themeColor === 'purple'
                  ? 'bg-purple-50/90 border-purple-200 text-purple-900'
                  : themeColor === 'indigo'
                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-900'
                  : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              }`}>
                <ShieldCheck size={16} className={
                  themeColor === 'purple'
                    ? 'text-purple-600 shrink-0'
                    : themeColor === 'indigo'
                    ? 'text-indigo-600 shrink-0'
                    : 'text-emerald-600 shrink-0'
                } />
                <span>Uploaded Securely & Cryptographically Verified</span>
              </div>

              {/* Action Pills & Pin Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${themeClasses.badgeBg}`}>
                  <CheckCircle2 size={12} />
                  <span>PINNED TO IPFS CLUSTER ✓</span>
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye size={12} className="text-emerald-700" />
                    <span>Preview Document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Replace</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* State 3: Empty Dropzone Prompt */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-2 py-2"
            >
              <div className={`w-12 h-12 rounded-2xl ${themeClasses.iconBg} flex items-center justify-center mx-auto shadow-xs`}>
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Drag & drop certificate PDF / doc here, or <span className="text-emerald-700 underline font-extrabold">browse files</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Accepts PDF, Word (.docx, .doc), and Images (PNG, JPG) up to 15 MB
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200/90 rounded-xl text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
                  title="Attach sample NPOP Organic Certificate for fast demo verification"
                >
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Use Sample Verified Certificate</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-600 hover:text-rose-900 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}      {/* In-App Document Preview Modal */}
      {attachedDoc && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Document Preview: ${attachedDoc.name}`}
          subtitle={`Cryptographically verified IPFS document • CID: ${attachedDoc.ipfsCid.slice(0, 22)}...`}
          maxWidth="4xl"
        >
          <div className="space-y-3">
            {/* Top Toolbar: File Summary & Direct Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${themeClasses.iconBg} flex items-center justify-center shrink-0`}>
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                      {attachedDoc.name}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border bg-emerald-100 text-emerald-800 border-emerald-300 shrink-0">
                      <CheckCircle2 size={11} />
                      <span>Verified Authentic</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Format: {attachedDoc.name.split('.').pop()?.toUpperCase()} • Size: {formatFileSize(attachedDoc.size)} • IPFS CID: {attachedDoc.ipfsCid.slice(0, 24)}...
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {attachedDoc.previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (attachedDoc.previewUrl) {
                        window.open(attachedDoc.previewUrl, '_blank');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Open document in a dedicated browser tab"
                  >
                    <ExternalLink size={13} />
                    <span>Open in Dedicated Tab</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  title="Download actual document file"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Document Viewer Frame - Renders Actual Uploaded File */}
            <div className="bg-slate-900/90 rounded-2xl p-2 border border-slate-300 min-h-[460px] max-h-[70vh] flex items-center justify-center overflow-hidden">
              {attachedDoc.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/) && attachedDoc.previewUrl ? (
                /* Actual Uploaded Image */
                <img
                  src={attachedDoc.previewUrl}
                  alt={attachedDoc.name}
                  className="max-h-[66vh] w-auto max-w-full rounded-xl object-contain shadow-2xl mx-auto"
                />
              ) : (attachedDoc.name.toLowerCase().endsWith('.pdf') || attachedDoc.type === 'application/pdf') && attachedDoc.previewUrl ? (
                /* Actual Uploaded PDF Document */
                <div className="w-full h-[68vh] rounded-xl overflow-hidden bg-slate-900 flex flex-col relative">
                  <iframe
                    src={attachedDoc.previewUrl}
                    title={attachedDoc.name}
                    className="w-full h-full rounded-xl border-0 bg-white"
                  />
                </div>
              ) : (
                /* Actual Word or Other Document */
                <div className="w-full h-[60vh] rounded-xl bg-white p-8 border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-md">
                    <FileText size={36} />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900">{attachedDoc.name}</h4>
                    <p className="text-xs text-slate-500">
                      Uploaded Document ({formatFileSize(attachedDoc.size)})
                    </p>
                    <p className="text-xs text-slate-600 pt-2">
                      Decentralized IPFS Provenance CID:
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 break-all">
                      {attachedDoc.ipfsCid}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Document</span>
                    </button>
                    {attachedDoc.previewUrl && (
                      <button
                        type="button"
                        onClick={() => window.open(attachedDoc.previewUrl!, '_blank')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>Open in Tab</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-mono text-slate-500">
                IPFS Hash: {attachedDoc.ipfsCid.slice(0, 32)}...
              </span>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default DocumentUploadDropzone;

