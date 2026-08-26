import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BlockchainTxBadge } from '../../components/common/BlockchainTxBadge';
import {
  Blocks,
  Users,
  ShieldCheck,
  AlertTriangle,
  Package,
  Activity,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, transactions, suspiciousReports, networkStats } = useBlockchain();
  const { users } = useAuth();
  const navigate = useNavigate();

  const pendingApprovals = users.filter(u => u.status === 'PENDING_APPROVAL');
  const activeFraudReports = suspiciousReports.filter(r => r.status === 'PENDING_REVIEW' || r.status === 'INVESTIGATING');
  const verifiedBatches = products.filter(p => p.verificationState === 'VERIFIED');
  const rejectedBatches = products.filter(p => p.verificationState === 'REJECTED');

  return (
    <DashboardLayout
      title="Consortium Governance Admin Portal"
      subtitle="Network monitoring, smart contract chaincode verification, stakeholder authorization, and fraud resolution."
      action={
        <div className="flex gap-2">
          <Link
            to="/admin/explorer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Blocks size={16} className="text-emerald-400" />
            <span>Open Ledger Explorer</span>
          </Link>
          <Link
            to="/admin/approvals"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Users size={16} />
            <span>Stakeholder Approvals ({pendingApprovals.length})</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Hyperledger Block Height"
            value={`#${networkStats.blockHeight}`}
            subtitle="Consensus TPS: 4.8 / sec"
            icon={Blocks}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Consortium Batches"
            value={products.length}
            subtitle={`${verifiedBatches.length} Verified • ${rejectedBatches.length} Rejected`}
            icon={Package}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Pending Stakeholder Approvals"
            value={pendingApprovals.length}
            subtitle="Farmer & Lab Node Registration"
            icon={Users}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Active Fraud / Incident Reports"
            value={activeFraudReports.length}
            subtitle="Consumer verification flags"
            icon={AlertTriangle}
            iconColor="text-rose-600"
            bgColor="bg-rose-50"
          />
        </div>

        {/* 2-Column Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Blockchain Transactions Stream */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-600" />
                  <span>Real-Time Hyperledger Fabric Transaction Ledger</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable smart contract calls endorsed by consortium peer nodes
                </p>
              </div>

              <Link
                to="/admin/explorer"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View Explorer</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map(tx => (
                <div
                  key={tx.txId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        Block #{tx.blockNumber}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {tx.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Submitting Node: <span className="font-medium text-slate-800">{tx.actor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BlockchainTxBadge txHash={tx.txId} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Quick Network & Node Health */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu size={16} className="text-indigo-600" />
                <span>Consortium Node Status</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">Orderer Raft Consensus:</span>
                  <span className="font-bold text-emerald-600">3/3 Nodes Active</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">Smart Contract Version:</span>
                  <span className="font-mono font-bold text-slate-800">{networkStats.chaincodeVersion}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">IPFS Pinning Cluster:</span>
                  <span className="font-bold text-emerald-600">Online (Pinata + Local)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">PostgreSQL Mirror DB:</span>
                  <span className="font-bold text-emerald-600">Synchronized</span>
                </div>
              </div>
            </div>

            {/* Quick Pending Approvals Alert */}
            {pendingApprovals.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>{pendingApprovals.length} Stakeholder Awaiting Approval</span>
                </div>
                <p className="text-xs text-amber-800">
                  New farmer and lab registrations need verification before issuing cryptographic signing certificates.
                </p>
                <Link
                  to="/admin/approvals"
                  className="inline-block text-xs font-bold text-amber-900 underline pt-1"
                >
                  Review Stakeholder Applications →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
