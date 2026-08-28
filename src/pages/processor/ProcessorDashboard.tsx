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
  MapPin,
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
      subtitle={`${currentUser.name} • ${currentUser.organization || 'PhytoExtracts Bio-Refining Ltd'} (ID: ${currentUser.id}) • ${currentUser.location || 'GMP Extraction Unit'}`}
      action={
        <Link
          to="/processor/process"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
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
            title="Available Raw Crops"
            value={incomingRawCrops.length}
            subtitle="Awaiting facility intake"
            icon={Package}
            iconColor="text-teal-700"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="My Processed Batches"
            value={myProcessedBatches.length}
            subtitle="Milled & Extracted"
            icon={Cog}
            iconColor="text-purple-700"
            bgColor="bg-purple-50"
          />
          <MetricCard
            title="Dispatched to Lab"
            value={sentToLab.length}
            subtitle="Under QA assay"
            icon={FlaskConical}
            iconColor="text-indigo-700"
            bgColor="bg-indigo-50"
          />
          <MetricCard
            title="Extraction Yield"
            value="89.2%"
            subtitle="Low thermal loss"
            icon={CheckCircle2}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Incoming Raw Crops Awaiting Processing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Incoming Raw Crops Queue</span>
              <span className="text-xs font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-200">
                {incomingRawCrops.length} Available
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Fresh harvests registered by farmers ready for bio-refining & extraction
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Botanical Crop</th>
                  <th className="px-5 py-3.5">Batch ID</th>
                  <th className="px-5 py-3.5">Input Weight</th>
                  <th className="px-5 py-3.5">Farm Origin</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingRawCrops.map(product => (
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
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {product.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-rose-600 shrink-0" />
                        <span className="truncate max-w-xs">{product.farmLocation}</span>
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">By {product.farmerName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/processor/process', { state: { selectedProduct: product } })}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
            <h3 className="text-base font-extrabold text-slate-900">
              My Facility Processing Logs
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
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
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Product Name</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Input → Output</th>
                    <th className="px-5 py-3.5">Yield Loss</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myProcessedBatches.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-sm text-slate-900">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">{product.batchId}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {product.processingDetails?.method}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {product.processingDetails?.initialQuantityKg}kg → {product.processingDetails?.processedQuantityKg}kg
                      </td>
                      <td className="px-5 py-4 font-bold text-amber-800">
                        {product.processingDetails?.yieldLossPercentage}%
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
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
