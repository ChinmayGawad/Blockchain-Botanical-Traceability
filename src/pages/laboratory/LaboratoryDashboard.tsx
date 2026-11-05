import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ShareLabReportModal } from '../../components/verification/ShareLabReportModal';
import { BotanicalProduct } from '../../types';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Share2,
} from 'lucide-react';

export const LaboratoryDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { products } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedShareProduct, setSelectedShareProduct] = useState<BotanicalProduct | null>(null);

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
      title={t('dashboard.portal.laboratoryTitle')}
      subtitle={t('dashboard.portal.laboratorySubtitle', { name: currentUser.name, org: currentUser.organization || 'Eurofins AgriBio Analytics Lab', id: currentUser.id })}
      action={
        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/laboratory/test"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <FlaskConical size={16} />
            <span>Conduct QA Inspection</span>
          </Link>
        </motion.div>
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
            iconColor="text-indigo-700 dark:text-indigo-400"
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          />
          <MetricCard
            title="Approved & Certified"
            value={approvedTests.length}
            subtitle="Passed monograph limits"
            icon={CheckCircle2}
            iconColor="text-emerald-700 dark:text-emerald-400"
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <MetricCard
            title="Rejected Contaminations"
            value={rejectedTests.length}
            subtitle="Smart contract locked"
            icon={XCircle}
            iconColor="text-rose-700 dark:text-rose-400"
            bgColor="bg-rose-50 dark:bg-rose-900/20"
          />
          <MetricCard
            title="Lab Test Compliance"
            value="100%"
            subtitle="ISO 17025 Audit Standard"
            icon={FlaskConical}
            iconColor="text-indigo-700 dark:text-indigo-400"
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          />
        </div>

        {/* Pending QA Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pending QA Testing Queue</span>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {pendingTests.length} Samples
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Botanical batches requiring mandatory HPLC purity, pesticide, and heavy metal assays
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Sample Name</th>
                  <th className="px-5 py-3.5">Batch Code</th>
                  <th className="px-5 py-3.5">Submitting Facility</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Stage</th>
                  <th className="px-5 py-3.5 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingTests.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{product.name}</div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 italic mt-0.5">{product.botanicalName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-xs text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700 inline-block">
                        {product.batchId}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {product.processingDetails?.processorName || product.farmerOrg}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {product.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => navigate('/laboratory/test', { state: { selectedProduct: product } })}
                        className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <FlaskConical size={13} />
                        <span>Perform QA Assay</span>
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issued Lab Certificates */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Issued Chemical Assay Certificates
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Assays validated and endorsed by {currentUser.name} on the blockchain
            </p>
          </div>

          {myLabReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No lab certificates have been published under this lab account yet. Select an incoming sample above to perform your first QA inspection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Botanical Batch</th>
                    <th className="px-5 py-3.5">HPLC Purity Marker</th>
                    <th className="px-5 py-3.5">Safety Screens</th>
                    <th className="px-5 py-3.5">Assay Verdict</th>
                    <th className="px-5 py-3.5 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myLabReports.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{product.batchId}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-indigo-900 dark:text-indigo-300">
                        {product.labReport?.purityPercentage}% Purity Assay
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        ICP-MS: {product.labReport?.heavyMetalsStatus} • Micro: {product.labReport?.microbialTestStatus}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.verificationState} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setSelectedShareProduct(product)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                            title="Share Password-Protected QA Certificate"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => navigate(`/verify/${product.id}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-all hover:shadow-xs"
                          >
                            <span>View Proof</span>
                            <ArrowRight size={13} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedShareProduct && (
        <ShareLabReportModal
          isOpen={!!selectedShareProduct}
          onClose={() => setSelectedShareProduct(null)}
          product={selectedShareProduct}
        />
      )}
    </DashboardLayout>
  );
};
