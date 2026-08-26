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
  FileText,
  FileCheck,
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
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [timeline[0]?.id]: true, // first item open by default
  });

  const toggleExpand = (id: string) => {
    if (!interactive) return;
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStageIcon = (stage: string, role: UserRole) => {
    switch (role || stage) {
      case 'FARMER':
        return <Sprout size={18} />;
      case 'PROCESSOR':
        return <Cog size={18} />;
      case 'LABORATORY':
        return <FlaskConical size={18} />;
      case 'DISTRIBUTOR':
        return <Truck size={18} />;
      case 'RETAILER':
        return <Store size={18} />;
      default:
        return <CheckCircle2 size={18} />;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          circle: 'bg-emerald-600 text-white border-emerald-200 ring-4 ring-emerald-50',
          line: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'IN_PROGRESS':
        return {
          circle: 'bg-blue-600 text-white border-blue-200 ring-4 ring-blue-50 animate-pulse',
          line: 'bg-slate-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'FAILED':
        return {
          circle: 'bg-rose-600 text-white border-rose-200 ring-4 ring-rose-50',
          line: 'bg-rose-300',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      default:
        return {
          circle: 'bg-slate-300 text-slate-600 border-slate-200',
          line: 'bg-slate-200',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {timeline.map((event, index) => {
        const colors = getStatusColor(event.status);
        const isExpanded = !!expandedIds[event.id];

        return (
          <div key={event.id || index} className="relative group">
            {/* Step Node Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border shadow-sm transition-all z-10 ${colors.circle}`}
            >
              {getStageIcon(event.stage, event.actorRole)}
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden">
              {/* Header */}
              <div
                onClick={() => toggleExpand(event.id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-3 ${
                  interactive ? 'cursor-pointer hover:bg-slate-50/70 transition-colors' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Stage {index + 1}: {event.stage}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}
                    >
                      {event.status === 'COMPLETED' ? 'Verified' : event.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {event.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                    <span className="font-medium text-slate-700">
                      Actor: {event.actorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
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
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                )}
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 space-y-3.5 text-xs">
                  <p className="text-slate-600 leading-relaxed pt-3">
                    {event.description}
                  </p>

                  {/* Location Pin */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  )}

                  {/* Metadata key-values */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                      {Object.entries(event.metadata).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            {k}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IPFS & Blockchain Tx Hash Proofs */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Ledger Proof:</span>
                      <BlockchainTxBadge txHash={event.txHash} />
                    </div>

                    {event.ipfsHash && (
                      <a
                        href={`https://ipfs.io/ipfs/${event.ipfsHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
                      >
                        <FileCheck size={12} className="text-indigo-600" />
                        <span>IPFS: {event.ipfsHash.substring(0, 8)}...</span>
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
