import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
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
  const navigate = useNavigate();

  const pendingTests = products.filter(p => p.status === 'IN_TESTING' || p.status === 'PROCESSING');
  const approvedTests = products.filter(p => p.labReport?.overallResult === 'APPROVED' || p.status === 'APPROVED' || p.status === 'IN_TRANSIT' || p.status === 'RETAIL_READY');
  const rejectedTests = products.filter(p => p.labReport?.overallResult === 'REJECTED' || p.status === 'REJECTED');

  return (
    <DashboardLayout
      title="Laboratory QA Testing Station"
      subtitle="Accredited ISO/IEC 17025 testing facility. Verify phytochemical active potency, heavy metals, microbial assays, and sign cryptographic approvals."
      action={
        <Link
          to="/laboratory/test"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <FlaskConical size={16} />
          <span>Conduct QA Inspection</span>
        </Link>
      }
    >
      <div className="space-y-6">
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
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTests.length > 0 ? (
                  pendingTests.map(product => (
                    <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[11px] text-slate-500 italic font-mono">
                          {product.botanicalName}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-indigo-700">
                        {product.batchId}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {product.processingDetails?.processorName || 'PhytoExtracts Bio-Refining'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {product.processingDetails?.method || 'Cryogenic Processing'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} size="sm" />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/laboratory/test?batch=${product.id}`}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <FlaskConical size={14} />
                          <span>Inspect Sample</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No samples currently pending testing. You can test any existing batch from the inspect form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certified Reports Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Recent Laboratory Quality Decisions & Certificates
            </h3>
            <p className="text-xs text-slate-500">
              Smart contract consensus logs for approvals and pesticide contamination rejections
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {products.filter(p => p.labReport).map(product => (
              <div key={product.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{product.name}</span>
                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      #{product.batchId}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.labReport?.overallResult === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.labReport?.overallResult}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Purity:</span> {product.labReport?.purityPercentage}% • <span className="font-semibold">Moisture:</span> {product.labReport?.moisturePercentage}% • <span className="font-semibold">Tested By:</span> {product.labReport?.testedBy}
                  </p>
                  <div className="text-[11px] text-slate-500 italic">
                    Notes: {product.labReport?.notes}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/verify/${product.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Report & Provenance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
