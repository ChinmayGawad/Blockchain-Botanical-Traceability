import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Truck,
  CheckCircle2,
  Clock,
  PlusCircle,
  ThermometerSnowflake,
  MapPin,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';

export const DistributorDashboard: React.FC = () => {
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
      title="Cold-Chain Logistics Portal"
      subtitle={`Authenticated as ${currentUser.name} (${currentUser.organization || 'TransGlobal Logistics Hub'}). Manage temperature-controlled distribution and GPS carrier hand-offs.`}
      action={
        <Link
          to="/distributor/create-shipment"
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Create Shipment</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Node Identity Banner */}
        <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{currentUser.organization || 'TransGlobal Cold-Chain Logistics Hub'}</span>
                <span className="bg-sky-200 text-sky-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Accredited GDP Carrier
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Distributor ID: <strong className="font-mono text-sky-800">{currentUser.id}</strong> • Dispatch Hub: {currentUser.location || 'Frankfurt GDP Hub'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 block">Ledger Verification Status</span>
            <span className="font-bold text-sky-700 inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Smart Contract Active
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Approved for Dispatch"
            value={approvedBatches.length}
            subtitle="QA certified lots"
            icon={PackageCheck}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="My In-Transit Consignments"
            value={inTransitShipments.length}
            subtitle="Active transport fleet"
            icon={Truck}
            iconColor="text-sky-600"
            bgColor="bg-sky-50"
          />
          <MetricCard
            title="Completed Deliveries"
            value={deliveredShipments.length}
            subtitle="Verified by Retailers"
            icon={CheckCircle2}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Temperature Compliance"
            value="100%"
            subtitle="GDP standard sensor certified"
            icon={ThermometerSnowflake}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>

        {/* Ready for Dispatch */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>QA Approved Batches Ready for Dispatch</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {approvedBatches.length} Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Products that have completed laboratory verification and are cleared for distribution
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Batch ID</th>
                  <th className="px-5 py-3">Available Quantity</th>
                  <th className="px-5 py-3">Lab Quality Result</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedBatches.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {product.name}
                      <span className="block text-[11px] text-slate-500 italic">{product.botanicalName}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                      {product.batchId}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {product.processingDetails?.processedQuantityKg || product.quantityKg} kg
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {product.labReport?.overallResult || 'PASSED QA'} (Purity {product.labReport?.purityPercentage}%)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/distributor/create-shipment', { state: { selectedProduct: product } })}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Truck size={13} />
                        <span>Dispatch Shipment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Shipments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              My Fleet Active & Delivered Shipments
            </h3>
            <p className="text-xs text-slate-500">
              Shipments handled by {currentUser.name} ({currentUser.organization})
            </p>
          </div>

          {myShipments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No shipments have been dispatched under this logistics account yet. Select an approved batch above to initiate transport.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Tracking ID</th>
                    <th className="px-5 py-3">Product & Batch</th>
                    <th className="px-5 py-3">Route (Origin → Dest)</th>
                    <th className="px-5 py-3">Vehicle & Temp</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myShipments.map(product => {
                    const shipment = product.shipmentDetails;
                    if (!shipment) return null;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sky-700">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{product.batchId}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <div className="font-semibold text-slate-900">{shipment.sourceLocation}</div>
                          <div className="text-[11px] text-slate-500">→ {shipment.destinationLocation}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">{shipment.vehicleNumber}</div>
                          <div className="text-[10px] text-blue-700 font-mono flex items-center gap-1">
                            <ThermometerSnowflake size={11} />
                            <span>{shipment.temperatureRange}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={product.status} />
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          {shipment.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleMarkDelivered(product.id)}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/verify/${product.id}`)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-sky-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Trace</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
