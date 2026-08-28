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
  ArrowRight,
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
      subtitle={`${currentUser.name} • ${currentUser.organization || 'Eurofins AgriBio Analytics Lab'} (ID: ${currentUser.id}) • Accredited ISO/IEC 17025 Facility`}
      action={
        <Link
          to="/laboratory/test"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
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
            iconColor="text-indigo-700"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Approved & Certified"
            value={approvedTests.length}
            subtitle="Passed monograph limits"
            icon={CheckCircle2}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Rejected Contaminations"
            value={rejectedTests.length}
            subtitle="Smart contract locked"
            icon={XCircle}
            iconColor="text-rose-700"
            bgColor="bg-rose-50"
          />
          <MetricCard
            title="Lab Test Compliance"
            value="100%"
            subtitle="ISO 17025 Audit Standard"
            icon={FlaskConical}
            iconColor="text-indigo-700"
            bgColor="bg-indigo-50"
          />
        </div>

        {/* Pending QA Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Pending QA Testing Queue</span>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {pendingTests.length} Samples
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Botanical batches requiring mandatory HPLC purity, pesticide, and heavy metal assays
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Sample Name</th>
                  <th className="px-5 py-3.5">Batch Code</th>
                  <th className="px-5 py-3.5">Submitting Facility</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Stage</th>
                  <th className="px-5 py-3.5 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTests.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-slate-900">{product.name}</div>
                      <div className="text-xs font-mono text-slate-500 italic mt-0.5">{product.botanicalName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        {product.batchId}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {product.processingDetails?.processorName || product.farmerOrg}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {product.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/laboratory/test', { state: { selectedProduct: product } })}
                        className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <FlaskConical size={13} />
                        <span>Perform QA Assay</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issued Lab Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Issued Chemical Assay Certificates
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Assays validated and endorsed by {currentUser.name} on the blockchain
            </p>
          </div>

          {myLabReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No lab certificates have been published under this lab account yet. Select an incoming sample above to perform your first QA inspection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Botanical Batch</th>
                    <th className="px-5 py-3.5">HPLC Purity Marker</th>
                    <th className="px-5 py-3.5">Safety Screens</th>
                    <th className="px-5 py-3.5">Assay Verdict</th>
                    <th className="px-5 py-3.5 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLabReports.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-900">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">{product.batchId}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-indigo-900">
                        {product.labReport?.purityPercentage}% Purity Assay
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        ICP-MS: {product.labReport?.heavyMetalsStatus} • Micro: {product.labReport?.microbialTestStatus}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.verificationState} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>View Proof</span>
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
