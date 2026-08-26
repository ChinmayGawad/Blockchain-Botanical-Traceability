import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Cog,
  FlaskConical,
  Package,
  CheckCircle2,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const ProcessorDashboard: React.FC = () => {
  const { products } = useBlockchain();
  const navigate = useNavigate();

  // Incoming raw crops ready to process
  const incomingRawCrops = products.filter(p => p.status === 'REGISTERED');
  const inProcessing = products.filter(p => p.status === 'PROCESSING');
  const sentToLab = products.filter(p => p.status === 'IN_TESTING' || p.status === 'APPROVED' || p.status === 'IN_TRANSIT' || p.status === 'RETAIL_READY');

  return (
    <DashboardLayout
      title="Processor Bio-Refining Portal"
      subtitle="Confirm incoming raw botanical harvests, record extraction and milling methods, and dispatch samples for QA testing."
      action={
        <Link
          to="/processor/process"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Cog size={16} />
          <span>Process Raw Batch</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Incoming Raw Crops"
            value={incomingRawCrops.length}
            subtitle="Awaiting facility intake"
            icon={Package}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Active Refining Queue"
            value={inProcessing.length}
            subtitle="Milling / Extraction"
            icon={Cog}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
          <MetricCard
            title="Samples Sent to Lab"
            value={sentToLab.length}
            subtitle="Under QA testing"
            icon={FlaskConical}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Average Extraction Yield"
            value="88.4%"
            subtitle="Low thermal degradation"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Incoming Raw Crops Awaiting Processing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Incoming Raw Crops Queue</span>
                <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  {incomingRawCrops.length} Available
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Fresh harvests registered by farmers ready for bio-refining & extraction
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Botanical Crop</th>
                  <th className="px-5 py-3">Batch ID</th>
                  <th className="px-5 py-3">Farmer & Origin</th>
                  <th className="px-5 py-3">Raw Weight</th>
                  <th className="px-5 py-3">Harvest Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingRawCrops.length > 0 ? (
                  incomingRawCrops.map(product => (
                    <tr key={product.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[11px] text-slate-500 italic font-mono">
                          {product.botanicalName}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-purple-700">
                        {product.batchId}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">{product.farmerName}</div>
                        <div className="text-[10px] text-slate-400">{product.farmLocation.split(',')[0]}</div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {product.quantityKg} kg
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {product.harvestDate}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/processor/process?batch=${product.id}`}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Cog size={14} />
                          <span>Process Batch</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      All current incoming harvests have been processed. Register a new crop as Farmer to test.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processed Batches History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Refined Batches & Lab Sample Dispatch History
            </h3>
            <p className="text-xs text-slate-500">
              Batches processed and stamped on Hyperledger Fabric
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {products.filter(p => p.processingDetails).map(product => (
              <div key={product.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{product.name}</span>
                    <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      #{product.batchId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Method:</span> {product.processingDetails?.method} • <span className="font-semibold">Yield:</span> {product.processingDetails?.processedQuantityKg} kg (Loss: {product.processingDetails?.yieldLossPercentage}%)
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Facility: {product.processingDetails?.facilityLocation}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={product.status} size="sm" />
                  <Link
                    to={`/verify/${product.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
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
