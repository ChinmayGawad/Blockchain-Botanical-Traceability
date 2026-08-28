import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

interface ReportSuspiciousModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  batchId?: string;
}

export const ReportSuspiciousModal: React.FC<ReportSuspiciousModalProps> = ({
  isOpen,
  onClose,
  productId = '',
  batchId = '',
}) => {
  const { reportSuspicious } = useBlockchain();
  const [formProduct, setFormProduct] = useState(productId);
  const [formBatch, setFormBatch] = useState(batchId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState<'INVALID_QR' | 'INFO_MISMATCH' | 'FAILED_LAB' | 'PHYSICAL_SUSPICIOUS' | 'TAMPERED_PACKAGING' | 'OTHER'>('INFO_MISMATCH');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !name.trim() || !email.trim()) return;

    reportSuspicious({
      productId: formProduct || 'UNSPECIFIED',
      batchId: formBatch || 'UNSPECIFIED',
      reporterName: name,
      reporterEmail: email,
      reason,
      description,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setDescription('');
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Suspicious Botanical Batch"
      subtitle="Flag potential counterfeit packaging, broken seals, or assay mismatches to consortium compliance officers."
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Report Filed Successfully</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Thank you for protecting botanical consumer safety. Compliance administrators have received your report ID.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 text-amber-950 text-xs">
            <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Consortium Integrity Protocol:</span> Reports are recorded on the compliance database and trigger audit investigations for stakeholder licenses.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Product ID / QR Code:
              </label>
              <input
                type="text"
                value={formProduct}
                onChange={e => setFormProduct(e.target.value)}
                placeholder="e.g. BOT-2024-8901"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Batch Number:
              </label>
              <input
                type="text"
                value={formBatch}
                onChange={e => setFormBatch(e.target.value)}
                placeholder="e.g. ASH-2024-089"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Your Full Name: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Your Contact Email: *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Primary Reason for Report:
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="INVALID_QR">QR Code Does Not Work / Invalid Signature</option>
              <option value="INFO_MISMATCH">Physical Packaging Does Not Match Blockchain Record</option>
              <option value="TAMPERED_PACKAGING">Damaged or Tampered Security Seal</option>
              <option value="PHYSICAL_SUSPICIOUS">Physical Product Color/Aroma/Quality Suspicious</option>
              <option value="FAILED_LAB">Suspected Contamination or Side Effects</option>
              <option value="OTHER">Other Compliance Concern</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Detailed Description of Issue: *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe where purchased, batch code discrepancies, broken seals, or irregularities..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Send size={14} />
              <span>Submit Report to Admin</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
