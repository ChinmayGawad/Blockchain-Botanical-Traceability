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
  Building,
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
      subtitle={`Authenticated as ${currentUser.name} (${currentUser.organization || 'Cultivator Node'}). Register botanical harvests, track bio-refining & QA verification.`}
      action={
        <Link
          to="/farmer/register"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Register New Harvest</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Farmer Node Identity Banner */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <Sprout size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>{currentUser.organization || 'Organic Farm Cooperative'}</span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Accredited Farmer Node
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Farmer ID: <strong className="font-mono text-emerald-800">{currentUser.id}</strong> • Location: {currentUser.location || 'Certified Agricultural Parcel'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-500 block">Ledger Verification Status</span>
            <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
              <ShieldCheck size={14} /> Smart Contract Active
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="My Harvested Volume"
            value={`${totalKg.toLocaleString()} kg`}
            subtitle="Across your registered crops"
            icon={Scale}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="My Registered Batches"
            value={farmerProducts.length}
            subtitle="Committed to blockchain"
            icon={Sprout}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Lab Certified Batches"
            value={approvedBatches}
            subtitle="QA verified & approved"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="In Processing / Transit"
            value={inProgressBatches}
            subtitle="Downstream supply chain"
            icon={Clock}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Registered Crops Table & Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Registered Botanical Crops
              </h3>
              <p className="text-xs text-slate-500">
                Only crops registered under your farmer account are listed here
              </p>
            </div>

            <Link
              to="/farmer/register"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>+ Register Another Crop</span>
            </Link>
          </div>

          {farmerProducts.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <Sprout size={32} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">No Harvest Batches Registered Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You haven't recorded any botanical crop batches under <strong>{currentUser.email}</strong>. Register your harvest to stamp its GPS origin coordinates onto the immutable blockchain ledger.
                </p>
              </div>
              <Link
                to="/farmer/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <PlusCircle size={15} />
                <span>Register First Botanical Harvest</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Crop Name & Botanical</th>
                    <th className="px-5 py-3">Batch ID</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3">Harvest Origin</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {farmerProducts.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{product.name}</div>
                            <div className="text-[11px] text-slate-500 italic font-mono">
                              {product.botanicalName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                        {product.batchId}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {product.quantityKg} kg
                        <span className="block text-[10px] font-normal text-slate-500">
                          {product.cultivationMethod}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span className="truncate max-w-xs">{product.farmLocation}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {product.gpsCoordinates.lat.toFixed(4)}°N, {product.gpsCoordinates.lng.toFixed(4)}°E
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} />
                      </td>

                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedProductForQR(product)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate QR Tag"
                        >
                          <QrCode size={13} />
                          <span>QR</span>
                        </button>
                        <button
                          onClick={() => navigate(`/verify/${product.id}`)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
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
