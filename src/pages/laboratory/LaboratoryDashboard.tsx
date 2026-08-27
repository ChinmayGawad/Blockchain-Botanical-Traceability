import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  FileCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const LaboratoryDashboard: React.FC = () => {
  const { products } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Pending tests requiring QA inspection
  const pendingTests = products.filter(p => p.status === 'IN_TESTING' || p.status === 'PROCESSING');

  // Reports certified by this lab account
  const myLabReports = products.filter(
    p =>
      p.labReport &&
      (p.labReport.labId === currentUser.id ||
        (currentUser.organization && p.labReport.labName.toLowerCase().includes(currentUser.organization.toLowerCase())) ||
        currentUser.role === 'ADMIN')
  );

  const approvedTests = myLabReports.filter(p => p.labReport?.overallResult === 'APPROVED');
  const rejectedTests = myLabReports.filter(p => p.labReport?.overallResult === 'REJECTED');

  return (
    <DashboardLayout
      title="Laboratory QA Testing Station"
      subtitle={`Authenticated as ${currentUser.name} (${currentUser.organization || 'Eurofins AgriBio Analytics Lab'}). Accredited ISO/IEC 17025 testing facility.`}
      action={
        <Link
          to="/laboratory/test"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <FlaskConical size={16} />
          <span>Conduct QA Inspection</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Node Identity Banner */}
        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shrink-0">
              <FlaskConical size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{currentUser.organization || 'Eurofins AgriBio Analytics Lab'}</span>
                <span className="bg-indigo-200 text-indigo-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Accredited ISO/IEC 17025 Lab
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Lab ID: <strong className="font-mono text-indigo-800">{currentUser.id}</strong> • Lead Chemist: {currentUser.name}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 block">Ledger Verification Status</span>
            <span className="font-bold text-indigo-700 inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Smart Contract Active
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pending QA Samples"
            value={pendingTests.length}
            subtitle="Awaiting laboratory assay"
            icon={Clock}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Approved & Certified"
            value={approvedTests.length}
            subtitle="Passed monograph limits"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Rejected Contaminations"
            value={rejectedTests.length}
            subtitle="Locked by Smart Contract"
            icon={XCircle}
            iconColor="text-rose-600"
            bgColor="bg-rose-50"
          />
          <MetricCard
            title="Average Batch Purity"
            value="99.4%"
            subtitle="HPLC Phytochemical Assay"
            icon={ShieldCheck}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
        </div>

        {/* Pending Samples Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Samples Awaiting Laboratory Analysis</span>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {pendingTests.length} In Queue
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Botanical lots received from processing facilities requiring mandatory QA testing
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Botanical Sample</th>
                  <th className="px-5 py-3">Batch ID</th>
                  <th className="px-5 py-3">Processor Facility</th>
                  <th className="px-5 py-3">Processed Yield</th>
                  <th className="px-5 py-3">Current Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTests.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-500 italic">{product.botanicalName}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                      {product.batchId}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {product.processingDetails?.processorName || 'PhytoExtracts Bio-Refining'}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {product.processingDetails?.processedQuantityKg || product.quantityKg} kg
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/laboratory/test', { state: { selectedProduct: product } })}
                        className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <FlaskConical size={13} />
                        <span>Run QA Inspection</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Lab Certified Reports */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              My Laboratory Certificates Issued
            </h3>
            <p className="text-xs text-slate-500">
              Certificates signed by {currentUser.name} ({currentUser.organization})
            </p>
          </div>

          {myLabReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No quality certificates have been signed under this lab account yet. Select a pending sample above to issue your first test report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Purity Score</th>
                    <th className="px-5 py-3">Moisture</th>
                    <th className="px-5 py-3">Heavy Metals</th>
                    <th className="px-5 py-3">Microbial</th>
                    <th className="px-5 py-3">Overall Decision</th>
                    <th className="px-5 py-3 text-right">Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLabReports.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {product.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{product.batchId}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-700">
                        {product.labReport?.purityPercentage}%
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {product.labReport?.moisturePercentage}%
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {product.labReport?.heavyMetalsStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {product.labReport?.microbialTestStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.labReport?.overallResult === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {product.labReport?.overallResult}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Trace</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
