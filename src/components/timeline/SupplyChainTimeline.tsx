import React, { useState } from 'react';
import { TimelineEvent, UserRole } from '../../types';
import {
  Sprout,
  Cog,
  FlaskConical,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileCheck,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { BlockchainTxBadge } from '../common/BlockchainTxBadge';

interface SupplyChainTimelineProps {
  timeline: TimelineEvent[];
  interactive?: boolean;
}

export const SupplyChainTimeline: React.FC<SupplyChainTimelineProps> = ({
  timeline,
  interactive = true,
}) => {
  // Expand first item by default, or all if short
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [timeline[0]?.id]: true,
    [timeline[1]?.id]: true,
  });

  const toggleExpand = (id: string) => {
    if (!interactive) return;
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStageConfig = (stage: string, role: UserRole) => {
    switch (role || stage) {
      case 'FARMER':
        return {
          icon: Sprout,
          label: 'Farmer Registration',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-600 ring-emerald-100 text-white',
        };
      case 'PROCESSOR':
        return {
          icon: Cog,
          label: 'Bio-Processing & Milling',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          dot: 'bg-purple-600 ring-purple-100 text-white',
        };
      case 'LABORATORY':
        return {
          icon: FlaskConical,
          label: 'Laboratory QA Testing',
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          dot: 'bg-indigo-600 ring-indigo-100 text-white',
        };
      case 'DISTRIBUTOR':
        return {
          icon: Truck,
          label: 'Cold Logistics Transit',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-600 ring-sky-100 text-white',
        };
      case 'RETAILER':
        return {
          icon: Store,
          label: 'Retail Shelf & QR Label',
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          dot: 'bg-teal-600 ring-teal-100 text-white',
        };
      default:
        return {
          icon: CheckCircle2,
          label: stage,
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          dot: 'bg-slate-700 ring-slate-100 text-white',
        };
    }
  };

  const getStatusBadge = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Verified On-Chain ✓',
        };
      case 'IN_PROGRESS':
        return {
          badge: 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse',
          label: 'Active In Progress',
        };
      case 'FAILED':
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'QA Rejection ✗',
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          label: status,
        };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
      {timeline.map((event, index) => {
        const stageConfig = getStageConfig(event.stage, event.actorRole);
        const Icon = stageConfig.icon;
        const statusConfig = getStatusBadge(event.status);
        const isExpanded = !!expandedIds[event.id];

        return (
          <div key={event.id || index} className="relative group">
            {/* Step Node Icon Circle */}
            <div
              className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border shadow-xs ring-4 transition-all z-10 ${stageConfig.dot}`}
            >
              <Icon size={14} />
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden">
              {/* Card Header (Clickable) */}
              <div
                onClick={() => toggleExpand(event.id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-3 ${
                  interactive ? 'cursor-pointer hover:bg-slate-50/60 transition-colors' : ''
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border font-mono uppercase ${stageConfig.color}`}
                    >
                      Stage 0{index + 1} • {event.stage}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {event.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                    <span className="font-medium text-slate-700">
                      Actor: <strong className="text-slate-900">{event.actorName}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={12} />
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {interactive && (
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              {/* Collapsible Details Content */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed pt-3">
                    {event.description}
                  </p>

                  {/* Geolocation Tag */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-medium text-xs">{event.location}</span>
                    </div>
                  )}

                  {/* Metadata key-values grid */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                      {Object.entries(event.metadata).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                            {k}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ledger Proofs & IPFS Hash Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-medium">Hyperledger Proof:</span>
                      <BlockchainTxBadge txHash={event.txHash} />
                    </div>

                    {event.ipfsHash && (
                      <a
                        href={`https://ipfs.io/ipfs/${event.ipfsHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200 transition-colors"
                      >
                        <FileCheck size={12} className="text-indigo-600" />
                        <span>IPFS: {event.ipfsHash.substring(0, 10)}...</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
