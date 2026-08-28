import React from 'react';
import { VerificationState } from '../../types';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, CheckCircle2 } from 'lucide-react';

interface TrustSealProps {
  state: VerificationState;
  batchId: string;
  className?: string;
}

export const TrustSeal: React.FC<TrustSealProps> = ({ state, batchId, className = '' }) => {
  if (state === 'VERIFIED') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-white border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md ${className}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                <CheckCircle2 size={13} className="text-emerald-700" />
                <span>100% Cryptographically Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Authentic Botanical Origin Verified
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Multi-party consensus proof across all 5 supply chain stages endorsed on the blockchain. Zero tampering detected.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-50 border border-emerald-200 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-extrabold">
              Consensus Batch ID
            </div>
            <div className="font-mono text-lg font-black text-slate-900 tracking-wide">
              {batchId}
            </div>
            <div className="text-xs text-emerald-700 font-bold flex items-center md:justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Quorum: 5/5 Peers Valid
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'REJECTED') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-white border-2 border-rose-500/80 p-6 sm:p-8 shadow-md ${className}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center shadow-inner shrink-0">
              <ShieldX size={36} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 uppercase">
                <ShieldX size={13} className="text-rose-700" />
                <span>QA Rejection Alert • Smart Contract Locked</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Quality Verification Failed
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                This batch failed mandatory laboratory pharmacopeia purity or pesticide safety thresholds. Smart contract locked this lot from distribution.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-rose-800 uppercase tracking-wider font-extrabold">
              Flagged Batch ID
            </div>
            <div className="font-mono text-lg font-black text-rose-900">
              {batchId}
            </div>
            <div className="text-xs text-rose-700 font-bold">
              Ledger State: CONTRACT_LOCKED
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'SUSPICIOUS') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-white border-2 border-amber-500/80 p-6 sm:p-8 shadow-md ${className}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-inner shrink-0">
              <ShieldAlert size={36} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                <ShieldAlert size={13} className="text-amber-700" />
                <span>Provenance Incomplete • Audit Pending</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Suspicious / Unverified Batch
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                The cryptographic chain for this batch has missing intermediate records or broken hashes. Exercise caution before purchasing.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-amber-800 uppercase tracking-wider font-extrabold">
              Investigation Batch
            </div>
            <div className="font-mono text-lg font-black text-amber-900">
              {batchId}
            </div>
            <div className="text-xs text-amber-700 font-bold">
              Warning: Incomplete Proof
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IN_PROGRESS
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white border-2 border-indigo-500/80 p-6 sm:p-8 shadow-md ${className}`}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center justify-center shadow-inner shrink-0">
            <Clock size={36} />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 uppercase">
              <Clock size={13} className="text-indigo-700" />
              <span>Active Supply Chain Journey</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Botanical Batch In Transit / Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              This botanical product is actively moving through verified processing, testing, or logistics stages.
            </p>
          </div>
        </div>

        <div className="shrink-0 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
          <div className="text-[10px] text-indigo-800 uppercase tracking-wider font-extrabold">
            Active Batch ID
          </div>
          <div className="font-mono text-lg font-black text-slate-900">
            {batchId}
          </div>
          <div className="text-xs text-indigo-700 font-bold">
            Stage: IN_PIPELINE
          </div>
        </div>
      </div>
    </div>
  );
};
