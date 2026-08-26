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
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30 ${className}`}
      >
        {/* Background glow and watermark */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-6 opacity-5 pointer-events-none">
          <ShieldCheck size={200} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck size={36} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase mb-1.5">
                <CheckCircle2 size={12} /> Authentic & Verified Origin
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                100% Blockchain Verified
              </h2>
              <p className="text-sm text-emerald-100/80 mt-1 max-w-xl">
                This botanical batch has immutable, multi-party consensus proof across all 5 supply chain stages recorded on Hyperledger Fabric.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-emerald-950/80 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3.5 text-right w-full sm:w-auto">
            <div className="text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">
              Cryptographic Batch ID
            </div>
            <div className="font-mono text-lg font-bold text-white tracking-wide">
              {batchId}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              Consensus Quorum: 100% Valid
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'REJECTED') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900 to-red-950 text-white p-6 sm:p-8 shadow-xl border border-rose-500/40 ${className}`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-inner shrink-0">
              <ShieldX size={36} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30 uppercase mb-1.5">
                QA Rejection Alert
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Quality Verification Failed
              </h2>
              <p className="text-sm text-rose-100/80 mt-1 max-w-xl">
                This batch failed mandatory laboratory purity / pesticide safety standards and has been locked from retail distribution by smart contract.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-rose-950/80 border border-rose-500/30 rounded-xl p-3.5 text-right w-full sm:w-auto">
            <div className="text-[11px] text-rose-300 uppercase tracking-wider font-semibold">
              Flagged Batch ID
            </div>
            <div className="font-mono text-lg font-bold text-rose-200">
              {batchId}
            </div>
            <div className="text-[10px] text-rose-300 mt-0.5">
              Status: LOCKED ON LEDGER
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'SUSPICIOUS') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/40 ${className}`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <ShieldAlert size={36} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider bg-amber-500/30 text-amber-200 border border-amber-400/30 uppercase mb-1.5">
                Provenance Incomplete
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Suspicious / Unverified Batch
              </h2>
              <p className="text-sm text-amber-100/80 mt-1 max-w-xl">
                The cryptographic chain for this batch has missing intermediate records or broken hashes. Proceed with caution.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-amber-950/80 border border-amber-500/30 rounded-xl p-3.5 text-right w-full sm:w-auto">
            <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">
              Investigation Batch
            </div>
            <div className="font-mono text-lg font-bold text-amber-200">
              {batchId}
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">
              Warning: Incomplete Ledger
            </div>
          </div>
        </div>
      </div>
    );
  }

  // IN_PROGRESS
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/30 ${className}`}
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
            <Clock size={36} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase mb-1.5">
              Supply Chain In Progress
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Traceability Journey Active
            </h2>
            <p className="text-sm text-indigo-100/80 mt-1 max-w-xl">
              This botanical product is actively moving through verified processing, testing, or transit stages.
            </p>
          </div>
        </div>

        <div className="shrink-0 bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3.5 text-right w-full sm:w-auto">
          <div className="text-[11px] text-indigo-300 uppercase tracking-wider font-semibold">
            Active Batch ID
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {batchId}
          </div>
          <div className="text-[10px] text-indigo-400 mt-0.5">
            Phase: IN_PIPELINE
          </div>
        </div>
      </div>
    </div>
  );
};
