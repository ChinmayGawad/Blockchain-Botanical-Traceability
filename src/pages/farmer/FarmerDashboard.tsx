import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRModal } from '../../components/common/QRModal';
import { BotanicalProduct } from '../../types';
import {
  Sprout,
  PlusCircle,
  QrCode,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  Scale,
  ShieldCheck,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { products } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedProductForQR, setSelectedProductForQR] = useState<BotanicalProduct | null>(null);

  // Filter crops strictly belonging to this authenticated farmer (or all if admin)
  const farmerProducts = products.filter(
    p =>
      p.farmerId === currentUser.id ||
      (currentUser.organization && p.farmerOrg?.toLowerCase() === currentUser.organization?.toLowerCase()) ||
      (currentUser.name && p.farmerName?.toLowerCase().includes(currentUser.name?.toLowerCase())) ||
      currentUser.role === 'ADMIN'
  );

  const totalKg = farmerProducts.reduce((acc, curr) => acc + curr.quantityKg, 0);
  const approvedBatches = farmerProducts.filter(p => p.verificationState === 'VERIFIED').length;
  const inProgressBatches = farmerProducts.filter(p => p.status === 'PROCESSING' || p.status === 'IN_TESTING' || p.status === 'REGISTERED').length;

  return (
    <DashboardLayout
      title="Farmer Botanical Portal"
      subtitle={`Welcome, ${currentUser.name} (${currentUser.organization || 'Cultivator Node'}). Track your registered harvests, bio-refining stages, and lab testing.`}
      action={
        <Link
          to="/farmer/register"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>Register New Harvest</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Node Identity Banner */}
        <div className="p-4 sm:p-5 bg-white border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-sm shadow-emerald-900/10">
              <Sprout size={24} />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>{currentUser.organization || 'Organic Farm Cooperative'}</span>
                <span className="bg-emerald-100 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  Accredited Farmer
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Farmer ID: <strong className="font-mono text-emerald-800">{currentUser.id}</strong> • Location: {currentUser.location || 'Certified Agricultural Parcel'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-slate-500 font-medium block">Smart Contract Status</span>
            <span className="font-bold text-xs text-emerald-700 inline-flex items-center gap-1">
              <ShieldCheck size={15} /> Active on EVM Ledger
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Harvested Volume"
            value={`${totalKg.toLocaleString()} kg`}
            subtitle="Across your registered crops"
            icon={Scale}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="My Registered Batches"
            value={farmerProducts.length}
            subtitle="Committed to blockchain"
            icon={Sprout}
            iconColor="text-teal-700"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Verified & Approved"
            value={approvedBatches}
            subtitle="Passed QA lab assay"
            icon={CheckCircle2}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="In Pipeline"
            value={inProgressBatches}
            subtitle="Processing / Testing"
            icon={Clock}
            iconColor="text-amber-700"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Crops Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>My Registered Botanical Crops</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {farmerProducts.length} Batches
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Botanical crops registered under your account on the blockchain
              </p>
            </div>

            <Link
              to="/farmer/register"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>+ Add New Harvest</span>
            </Link>
          </div>

          {farmerProducts.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <Sprout size={28} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Harvests Registered Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't registered any botanical batches under this farmer account yet. Register your first crop to mint it onto the blockchain.
              </p>
              <Link
                to="/farmer/register"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={15} />
                <span>Register First Harvest</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Botanical Crop</th>
                    <th className="px-5 py-3.5">Batch Code</th>
                    <th className="px-5 py-3.5">Harvest Date & Origin</th>
                    <th className="px-5 py-3.5">Quantity</th>
                    <th className="px-5 py-3.5">Supply Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farmerProducts.map((product) => (
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
                      <td className="px-5 py-4 text-slate-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{product.harvestDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <MapPin size={13} className="text-emerald-700" />
                          <span>{product.farmLocation}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {product.quantityKg.toLocaleString()} kg
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedProductForQR(product)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                        >
                          <QrCode size={13} />
                          <span>QR Tag</span>
                        </button>
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
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

      {/* QR Modal */}
      {selectedProductForQR && (
        <QRModal
          isOpen={!!selectedProductForQR}
          product={selectedProductForQR}
          onClose={() => setSelectedProductForQR(null)}
        />
      )}
    </DashboardLayout>
  );
};
