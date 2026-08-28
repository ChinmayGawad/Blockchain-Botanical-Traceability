import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  ShieldAlert,
  QrCode,
  PackageX,
  FlaskConical,
  Sprout,
  FileQuestion,
  UploadCloud,
  Check,
  Copy,
  Info,
  Clock,
  ShieldCheck,
  Paperclip,
  Trash2,
  Store,
  Calendar,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { BotanicalProduct, SuspiciousReport } from '../../types';
import { getBotanicalProductImage } from '../../utils/imageUtils';
import confetti from 'canvas-confetti';

interface ReportSuspiciousModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  batchId?: string;
  product?: BotanicalProduct;
}

interface IncidentCategory {
  id: SuspiciousReport['reason'];
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  badge: string;
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  {
    id: 'TAMPERED_PACKAGING',
    title: 'Tampered Security Seal',
    desc: 'Broken tear tape, altered hologram, or re-packaged container',
    icon: PackageX,
    color: 'text-rose-700 bg-rose-50 border-rose-200 hover:border-rose-400',
    badge: 'Packaging Breach',
  },
  {
    id: 'INVALID_QR',
    title: 'QR Signature Failure',
    desc: 'QR code does not scan, points to unknown URL, or invalid crypto hash',
    icon: QrCode,
    color: 'text-amber-700 bg-amber-50 border-amber-200 hover:border-amber-400',
    badge: 'Code Fraud',
  },
  {
    id: 'INFO_MISMATCH',
    title: 'Assay / Label Discrepancy',
    desc: 'Physical packaging claims do not match blockchain phytochemical record',
    icon: FlaskConical,
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    badge: 'Data Mismatch',
  },
  {
    id: 'PHYSICAL_SUSPICIOUS',
    title: 'Physical Adulteration',
    desc: 'Abnormal color, synthetic aroma, unexpected texture, or foreign debris',
    icon: Sprout,
    color: 'text-orange-700 bg-orange-50 border-orange-200 hover:border-orange-400',
    badge: 'Quality Alert',
  },
  {
    id: 'FAILED_LAB',
    title: 'Health & Safety Hazard',
    desc: 'Suspected pesticide contamination, toxic adulterant, or adverse reaction',
    icon: ShieldAlert,
    color: 'text-red-800 bg-red-50 border-red-300 hover:border-red-500',
    badge: 'Critical Hazard',
  },
  {
    id: 'OTHER',
    title: 'Other Compliance Concern',
    desc: 'Unauthorized retailer, counterfeit distributor, or expired certification',
    icon: FileQuestion,
    color: 'text-slate-700 bg-slate-50 border-slate-200 hover:border-slate-400',
    badge: 'Governance',
  },
];

export const ReportSuspiciousModal: React.FC<ReportSuspiciousModalProps> = ({
  isOpen,
  onClose,
  productId = '',
  batchId = '',
  product,
}) => {
  const { reportSuspicious } = useBlockchain();

  const activeProductId = product?.id || productId || 'BOT-2024-8901';
  const activeBatchId = product?.batchId || batchId || 'ASH-2024-089';

  const [formProduct, setFormProduct] = useState(activeProductId);
  const [formBatch, setFormBatch] = useState(activeBatchId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState<SuspiciousReport['reason']>('TAMPERED_PACKAGING');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'CRITICAL'>('MEDIUM');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const handleAttachSimulatedPhoto = () => {
    setAttachedFile('Packaging_Tamper_Evidence_Photo_IMG_8912.jpg');
  };

  const handleRemoveAttached = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    const generatedId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await reportSuspicious({
        productId: formProduct || activeProductId,
        batchId: formBatch || activeBatchId,
        reporterName: name,
        reporterEmail: email,
        reporterPhone: phone || undefined,
        reason,
        severity,
        purchaseLocation: purchaseLocation || undefined,
        evidenceAttachment: attachedFile || undefined,
        description,
      });

      setSubmittedTicketId(generatedId);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (!submittedTicketId) return;
    navigator.clipboard.writeText(submittedTicketId);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const handleClose = () => {
    setSubmittedTicketId(null);
    setDescription('');
    setAttachedFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Suspicious Botanical Batch"
      subtitle="Cryptographic incident reporting hotline for consumer safety and supply chain integrity"
      maxWidth="2xl"
    >
      {submittedTicketId ? (
        /* Rich Interactive Success State */
        <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-lg shadow-emerald-900/10">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              Audit Incident Filed
            </span>
            <h3 className="text-2xl font-black text-slate-900 pt-2">
              Report Committed to Compliance Node
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for protecting botanical consumer safety. Your incident has been cryptographically signed and queued for immediate Consortium Compliance review.
            </p>
          </div>

          {/* Reference Ticket Card */}
          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Investigation Reference Ticket:
              </span>
              <button
                onClick={handleCopyTicket}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                {copiedTicket ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedTicket ? 'Copied' : 'Copy Ticket'}</span>
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900 flex items-center justify-between">
              <span>{submittedTicketId}</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Under Review
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block">Target Product</span>
                <span className="font-semibold text-slate-800 truncate block">{product?.name || formProduct}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Reported Batch</span>
                <span className="font-mono font-semibold text-slate-800">{formBatch}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 max-w-md mx-auto text-left flex items-start gap-3 text-xs text-emerald-950">
            <Clock size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Next Steps & Governance Protocol:</span>
              <div className="text-slate-600 mt-0.5">
                Consortium Quality Officers will review packaging provenance within <strong>24 business hours</strong>. You will receive updates at <strong>{email}</strong>.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              Done & Return to Product
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Product Identity Context Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white flex items-center gap-4 shadow-md">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
              <img
                src={getBotanicalProductImage(product || { name: formProduct, category: 'MEDICINAL_HERB' })}
                alt="Target Botanical"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {product?.category?.replace('_', ' ') || 'Botanical Batch'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  {formBatch}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white truncate mt-1">
                {product?.name || 'Pure Organic Botanical Harvest'}
              </h4>
              <p className="text-xs text-slate-300 italic font-mono truncate">
                {product?.botanicalName || 'Withania somnifera / Certified Organic'}
              </p>
            </div>
          </div>

          {/* Section 1: Interactive Reason Tiles */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>1. Select Incident Reason *</span>
              <span className="text-[11px] font-medium text-slate-500">Pick the closest issue</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INCIDENT_CATEGORIES.map(cat => {
                const isSelected = reason === cat.id;
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setReason(cat.id)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{cat.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{cat.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Severity & Purchase Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Severity Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Incident Severity Level:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSeverity('LOW')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    severity === 'LOW'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Low (Inquiry)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('MEDIUM')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    severity === 'MEDIUM'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Medium (Tamper)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('CRITICAL')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    severity === 'CRITICAL'
                      ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-2xs font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Critical (Hazard)
                </button>
              </div>
            </div>

            {/* Purchase Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Purchase Store / Online Vendor:
              </label>
              <div className="relative">
                <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={purchaseLocation}
                  onChange={e => setPurchaseLocation(e.target.value)}
                  placeholder="e.g. Covent Garden Organic Market, London"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-3 py-2 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description of Issue */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Detailed Description of Issue *</span>
              <span className="text-[11px] font-normal text-slate-400">Be as specific as possible</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe where purchased, batch code discrepancies, broken seals, abnormal taste/smell, or QR scan errors..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed"
            ></textarea>
          </div>

          {/* Section 4: Evidence Photo Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Attach Photo / Packaging Evidence:
            </label>

            {attachedFile ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 truncate">
                  <Paperclip size={15} className="text-emerald-700 shrink-0" />
                  <span className="truncate">{attachedFile}</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">2.4 MB</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttached}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Remove attached evidence"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <div
                onClick={handleAttachSimulatedPhoto}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 p-3.5 rounded-2xl text-center cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 group-hover:text-emerald-800 font-semibold">
                  <UploadCloud size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span>Click to attach packaging photo, QR snapshot, or invoice proof</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG, or PDF up to 10MB</span>
              </div>
            )}
          </div>

          {/* Section 5: Reporter Contact Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              Reporter Identification & Follow-Up
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@wellness.org"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 px-3 py-2 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Consortium Protocol Assurance Banner */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 text-amber-950 text-xs">
            <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cryptographic Governance Notice:</span> Verified fraud reports trigger smart contract holds on pending distributor batches and activate physical lot quarantine protocols.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-2 transition-all shadow-md shadow-rose-900/10 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  <span>Transmit Incident Report to Admin Node</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
