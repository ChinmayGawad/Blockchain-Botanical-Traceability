import React from 'react';
import { VerificationState } from '../../types';
import { ShieldCheck, ShieldAlert, ShieldX, Clock, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface TrustSealProps {
  state: VerificationState;
  batchId: string;
  className?: string;
}

export const TrustSeal: React.FC<TrustSealProps> = ({ state, batchId, className = '' }) => {
  if (state === 'VERIFIED') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/40 ${className}`}
      >
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck size={34} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>100% Cryptographically Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Authentic Botanical Origin Verified
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Multi-party consensus proof across all 5 supply chain stages endorsed on Hyperledger Fabric. Zero tampering detected.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
              Consensus Batch ID
            </div>
            <div className="font-mono text-lg font-extrabold text-white tracking-wide">
              {batchId}
            </div>
            <div className="text-[11px] text-emerald-300 font-medium flex items-center md:justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-rose-950 text-white p-6 sm:p-8 shadow-xl border border-rose-500/50 ${className}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400 shadow-inner shrink-0">
              <ShieldX size={34} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30 uppercase">
                <ShieldX size={12} className="text-rose-400" />
                <span>QA Rejection Alert • Smart Contract Locked</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Quality Verification Failed
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                This batch failed mandatory laboratory pharmacopeia purity or pesticide safety thresholds. Smart contract locked this lot from consumer distribution.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-900/90 border border-rose-500/40 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-rose-400 uppercase tracking-wider font-bold">
              Flagged Batch ID
            </div>
            <div className="font-mono text-lg font-bold text-rose-200">
              {batchId}
            </div>
            <div className="text-[11px] text-rose-300 font-medium">
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
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/50 ${className}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <ShieldAlert size={34} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase">
                <ShieldAlert size={12} className="text-amber-400" />
                <span>Provenance Incomplete • Audit Pending</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Suspicious / Unverified Batch
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                The cryptographic chain for this batch has missing intermediate records or broken hashes. Exercise caution before purchasing.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
              Investigation Batch
            </div>
            <div className="font-mono text-lg font-bold text-amber-200">
              {batchId}
            </div>
            <div className="text-[11px] text-amber-300 font-medium">
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
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/40 ${className}`}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
            <Clock size={34} />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
              <Clock size={12} className="text-indigo-300" />
              <span>Active Supply Chain Journey</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Botanical Batch In Transit / Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              This botanical product is actively moving through verified processing, testing, or logistics stages.
            </p>
          </div>
        </div>

        <div className="shrink-0 bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 text-left md:text-right w-full md:w-auto space-y-1">
          <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">
            Active Batch ID
          </div>
          <div className="font-mono text-lg font-bold text-white">
            {batchId}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium">
            Stage: IN_PIPELINE
          </div>
        </div>
      </div>
    </div>
  );
};
