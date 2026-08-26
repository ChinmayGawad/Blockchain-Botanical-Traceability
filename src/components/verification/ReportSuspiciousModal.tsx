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
      title="Report Suspicious Botanical Product"
      subtitle="Your incident report will be flagged to consortium compliance officers & admin oversight."
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Report Filed Successfully</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Thank you for protecting botanical consumer safety. Compliance administrators have received your report ID.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Consortium Integrity Protocol:</span> Reports are recorded on the compliance database and trigger audit investigations for stakeholder licenses.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product ID / QR Code:
              </label>
              <input
                type="text"
                value={formProduct}
                onChange={e => setFormProduct(e.target.value)}
                placeholder="e.g. BOT-2024-8901"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Number:
              </label>
              <input
                type="text"
                value={formBatch}
                onChange={e => setFormBatch(e.target.value)}
                placeholder="e.g. ASH-2024-089"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Contact Email: *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Reason for Report:
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
            >
              <option value="INVALID_QR">QR Code Does Not Work / Invalid Signature</option>
              <option value="INFO_MISMATCH">Physical Packaging Does Not Match Blockchain Record</option>
              <option value="TAMPERED_PACKAGING">Damaged or Tampered Security Seal</option>
              <option value="PHYSICAL_SUSPICIOUS">Physical Product Color/Aroma/Quality Suspicious</option>
              <option value="FAILED_LAB">Suspected Contamination or Side Effects</option>
              <option value="OTHER">Other Compliance Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description of Issue: *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe where purchased, batch code discrepancies, broken seals, or irregularities..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
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
