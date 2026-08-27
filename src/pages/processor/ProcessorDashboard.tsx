import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
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
  ShieldCheck,
} from 'lucide-react';

export const ProcessorDashboard: React.FC = () => {
  const { products } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Incoming raw crops ready for intake
  const incomingRawCrops = products.filter(p => p.status === 'REGISTERED');

  // Batches processed by this authenticated processor facility
  const myProcessedBatches = products.filter(
    p =>
      p.processingDetails &&
      (p.processingDetails.processorId === currentUser.id ||
        (currentUser.name && p.processingDetails.processorName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        currentUser.role === 'ADMIN')
  );

  const sentToLab = myProcessedBatches.filter(
    p => p.status === 'IN_TESTING' || p.status === 'APPROVED' || p.status === 'IN_TRANSIT' || p.status === 'RETAIL_READY'
  );

  return (
    <DashboardLayout
      title="Processor Bio-Refining Portal"
      subtitle={`Authenticated as ${currentUser.name} (${currentUser.organization || 'Bio-Refining Facility'}). Confirm incoming raw botanical harvests, record extraction methods, and dispatch QA samples.`}
      action={
        <Link
          to="/processor/process"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Cog size={16} />
          <span>Process Raw Batch</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Node Identity Banner */}
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shrink-0">
              <Cog size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{currentUser.organization || 'PhytoExtracts Bio-Refining Ltd'}</span>
                <span className="bg-purple-200 text-purple-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Accredited Extraction Facility
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Facility ID: <strong className="font-mono text-purple-800">{currentUser.id}</strong> • Location: {currentUser.location || 'GMP Extraction Unit'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 block">Ledger Verification Status</span>
            <span className="font-bold text-purple-700 inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Smart Contract Active
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Available Raw Crops"
            value={incomingRawCrops.length}
            subtitle="Awaiting facility intake"
            icon={Package}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="My Processed Batches"
            value={myProcessedBatches.length}
            subtitle="Milled & Extracted"
            icon={Cog}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
          <MetricCard
            title="Dispatched to Lab"
            value={sentToLab.length}
            subtitle="Under QA assay"
            icon={FlaskConical}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Average Extraction Yield"
            value="89.2%"
            subtitle="Low thermal loss"
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
                  <th className="px-5 py-3">Input Weight</th>
                  <th className="px-5 py-3">Farm Origin</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingRawCrops.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-500 italic">{product.botanicalName}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                      {product.batchId}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {product.quantityKg} kg
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="truncate max-w-xs">{product.farmLocation}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">By {product.farmerName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/processor/process', { state: { selectedProduct: product } })}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Process Batch</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Processed Batches Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              My Facility Processing Logs
            </h3>
            <p className="text-xs text-slate-500">
              Batches refined by {currentUser.name} ({currentUser.organization})
            </p>
          </div>

          {myProcessedBatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No batches have been processed under this facility account yet. Select an incoming crop above to log your first extraction.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Product Name</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Input → Output</th>
                    <th className="px-5 py-3">Yield Loss</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myProcessedBatches.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{product.batchId}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {product.processingDetails?.method}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                        {product.processingDetails?.initialQuantityKg}kg → {product.processingDetails?.processedQuantityKg}kg
                      </td>
                      <td className="px-5 py-4 font-bold text-amber-700">
                        {product.processingDetails?.yieldLossPercentage}%
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-purple-50 text-purple-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
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
