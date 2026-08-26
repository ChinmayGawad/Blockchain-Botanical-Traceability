import React, { useState } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SuspiciousReport } from '../../types';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuspiciousReportsPage: React.FC = () => {
  const { suspiciousReports, updateReportStatus } = useBlockchain();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<SuspiciousReport['status']>('INVESTIGATING');
  const [adminNotes, setAdminNotes] = useState('');

  const handleUpdate = (reportId: string) => {
    updateReportStatus(reportId, newStatus, adminNotes);
    setSelectedReportId(null);
    setAdminNotes('');
  };

  const getStatusPill = (status: SuspiciousReport['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending Review</span>;
      case 'INVESTIGATING':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Investigating</span>;
      case 'RESOLVED_VALID':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Resolved (Genuine)</span>;
      case 'CONFIRMED_FRAUD':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Confirmed Counterfeit</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Dismissed</span>;
    }
  };

  return (
    <DashboardLayout
      title="Fraud & Suspicious Incident Governance"
      subtitle="Review consumer reports, broken QR signatures, unauthorized supply-chain nodes, and packaging tamper alerts."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-600" />
              <span>Incident Incident Log</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {suspiciousReports.length} Incidents Filed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {suspiciousReports.map(report => (
              <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">{report.id}</span>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Product: {report.productId}
                    </span>
                    {getStatusPill(report.status)}
                  </div>
                  <span className="text-xs text-slate-400">
                    Reported: {new Date(report.reportedAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">
                    Reason: <span className="text-rose-700">{report.reason.replace('_', ' ')}</span>
                  </p>
                  <p className="text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    "{report.description}"
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Reporter: <strong>{report.reporterName}</strong> ({report.reporterEmail})
                  </div>
                  {report.adminNotes && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                      <strong>Admin Resolution Note:</strong> {report.adminNotes}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/verify/${report.productId}`}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Target Product Record</span>
                    <ExternalLink size={12} />
                  </Link>

                  {selectedReportId === report.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value as any)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="INVESTIGATING">Mark Investigating</option>
                        <option value="RESOLVED_VALID">Mark Resolved Valid</option>
                        <option value="CONFIRMED_FRAUD">Mark Confirmed Counterfeit</option>
                        <option value="DISMISSED">Dismiss</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Resolution notes..."
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg w-48"
                      />
                      <button
                        onClick={() => handleUpdate(report.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setSelectedReportId(null)}
                        className="px-2 py-1 text-slate-500 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setNewStatus(report.status);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Update Investigation Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
