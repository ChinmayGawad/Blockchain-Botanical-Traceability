import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Truck,
  PlusCircle,
  ThermometerSnowflake,
  MapPin,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';

export const DistributorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { products, updateShipmentStatus } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Batches certified by lab and ready for cold-chain transit
  const approvedBatches = products.filter(p => p.status === 'APPROVED');

  // Shipments handled by this distributor
  const myShipments = products.filter(
    p =>
      p.shipmentDetails &&
      (p.shipmentDetails.distributorId === currentUser.id ||
        (currentUser.name && p.shipmentDetails.distributorName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        currentUser.role === 'ADMIN')
  );

  const inTransitShipments = myShipments.filter(p => p.status === 'IN_TRANSIT');
  const deliveredShipments = myShipments.filter(p => p.status === 'DELIVERED' || p.status === 'RETAIL_READY');

  const handleMarkDelivered = (productId: string) => {
    updateShipmentStatus(productId, 'DELIVERED');
  };

  return (
    <DashboardLayout
      title={t('dashboard.portal.distributorTitle')}
      subtitle={t('dashboard.portal.distributorSubtitle', { name: currentUser.name, org: currentUser.organization || 'TransGlobal Logistics Hub', id: currentUser.id, location: currentUser.location || 'Frankfurt GDP Hub' })}
      action={
        <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/distributor/create-shipment"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <PlusCircle size={16} />
            <span>Create Shipment</span>
          </Link>
        </motion.div>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Approved for Dispatch"
            value={approvedBatches.length}
            subtitle="QA certified lots"
            icon={PackageCheck}
            iconColor="text-emerald-700 dark:text-emerald-400"
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <MetricCard
            title="In-Transit Consignments"
            value={inTransitShipments.length}
            subtitle="Active transport fleet"
            icon={Truck}
            iconColor="text-sky-700 dark:text-sky-400"
            bgColor="bg-sky-50 dark:bg-sky-900/20"
          />
          <MetricCard
            title="Delivered to Retail"
            value={deliveredShipments.length}
            subtitle="Confirmed hand-offs"
            icon={PackageCheck}
            iconColor="text-teal-700 dark:text-teal-400"
            bgColor="bg-teal-50 dark:bg-teal-900/20"
          />
          <MetricCard
            title="Cold-Chain Integrity"
            value="100%"
            subtitle="Zero thermal excursions"
            icon={ThermometerSnowflake}
            iconColor="text-sky-700 dark:text-sky-400"
            bgColor="bg-sky-50 dark:bg-sky-900/20"
          />
        </div>

        {/* Ready for Transit Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>QA Approved Batches Ready for Transit</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {approvedBatches.length} Available
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Batches with approved lab certificates ready for temperature-monitored dispatch
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Botanical Product</th>
                  <th className="px-5 py-3.5">Batch ID</th>
                  <th className="px-5 py-3.5">Assay Purity</th>
                  <th className="px-5 py-3.5">Origin Facility</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Logistics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {approvedBatches.map(product => (
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
                    <td className="px-5 py-4 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {product.labReport?.purityPercentage}% Purity PASS
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {product.processingDetails?.processorName || product.farmerOrg}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => navigate('/distributor/create-shipment', { state: { selectedProduct: product } })}
                        className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <Truck size={13} />
                        <span>Dispatch Shipment</span>
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Transits Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Active Logistics Consignments
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Shipments handled by {currentUser.name} ({currentUser.organization})
            </p>
          </div>

          {myShipments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No shipments currently registered under this carrier account. Dispatch an approved batch above to track in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Product & Batch</th>
                    <th className="px-5 py-3.5">Vehicle & Tracking</th>
                    <th className="px-5 py-3.5">Cold Chain Temp</th>
                    <th className="px-5 py-3.5">Transit Status</th>
                    <th className="px-5 py-3.5 text-right">Hand-off Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myShipments.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{product.batchId}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-800 dark:text-slate-200">
                        <div className="font-bold">{product.shipmentDetails?.vehicleNumber}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">AWB: {product.shipmentDetails?.trackingNumber}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-sky-900 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-700">
                          <ThermometerSnowflake size={12} className="text-sky-700 dark:text-sky-400" />
                          <span>{product.shipmentDetails?.temperatureRange}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {product.status === 'IN_TRANSIT' ? (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleMarkDelivered(product.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md"
                          >
                            <span>Mark Delivered</span>
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => navigate(`/verify/${product.id}`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-all hover:shadow-xs"
                          >
                            <span>Trace</span>
                            <ArrowRight size={13} />
                          </motion.button>
                        )}
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
