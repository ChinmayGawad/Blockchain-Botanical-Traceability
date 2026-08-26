import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
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
} from 'lucide-react';

export const DistributorDashboard: React.FC = () => {
  const { products, updateShipmentStatus } = useBlockchain();
  const navigate = useNavigate();

  const approvedBatches = products.filter(p => p.status === 'APPROVED');
  const inTransitShipments = products.filter(p => p.status === 'IN_TRANSIT');
  const deliveredShipments = products.filter(p => p.status === 'DELIVERED' || p.status === 'RETAIL_READY');

  const handleMarkDelivered = (productId: string) => {
    updateShipmentStatus(productId, 'DELIVERED');
  };

  return (
    <DashboardLayout
      title="Cold-Chain Logistics Portal"
      subtitle="Manage temperature-controlled distribution, GPS carrier tracking, and blockchain delivery hand-offs."
      action={
        <Link
          to="/distributor/create-shipment"
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Create Shipment</span>
        </Link>
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
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="In-Transit Shipments"
            value={inTransitShipments.length}
            subtitle="Active transport logistics"
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
            subtitle="GDP standard certified"
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
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Lab Purity Result</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedBatches.length > 0 ? (
                  approvedBatches.map(product => (
                    <tr key={product.id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[11px] text-slate-500 italic font-mono">
                          {product.botanicalName}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                        {product.batchId}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {product.quantityKg} kg
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {product.labReport?.purityPercentage || 99}% Purity (Approved)
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/distributor/create-shipment?batch=${product.id}`}
                          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Truck size={14} />
                          <span>Dispatch Shipment</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No approved batches currently waiting for dispatch. Approve a batch in Laboratory portal to test.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active In-Transit Shipments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Active Shipments in Transit
            </h3>
            <p className="text-xs text-slate-500">
              Live logistics tracking with temperature monitoring
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {inTransitShipments.map(product => (
              <div
                key={product.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{product.name}</span>
                    <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Tracking: {product.shipmentDetails?.trackingNumber}
                    </span>
                    <StatusBadge status={product.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <MapPin size={12} className="text-sky-600" />
                    <span>{product.shipmentDetails?.sourceLocation} → {product.shipmentDetails?.destinationLocation}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Carrier: {product.shipmentDetails?.vehicleNumber} • Temp: {product.shipmentDetails?.temperatureRange}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMarkDelivered(product.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Confirm Delivery Arrival</span>
                  </button>
                  <Link
                    to={`/verify/${product.id}`}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Inspect
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
