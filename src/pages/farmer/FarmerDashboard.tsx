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
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { products } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedProductForQR, setSelectedProductForQR] = useState<BotanicalProduct | null>(null);

  // Filter crops registered by farmers
  const farmerProducts = products.filter(
    p => p.farmerId === currentUser.id || p.farmerName.includes('Patel') || true // show all demo products for ease
  );

  const totalKg = farmerProducts.reduce((acc, curr) => acc + curr.quantityKg, 0);
  const approvedBatches = farmerProducts.filter(p => p.verificationState === 'VERIFIED').length;
  const inProgressBatches = farmerProducts.filter(p => p.status === 'PROCESSING' || p.status === 'IN_TESTING' || p.status === 'REGISTERED').length;

  return (
    <DashboardLayout
      title="Farmer Portal"
      subtitle="Register new botanical harvests, track processing stages, and view on-chain verification."
      action={
        <Link
          to="/farmer/register"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Register New Harvest</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Harvested Volume"
            value={`${totalKg.toLocaleString()} kg`}
            subtitle="Across all registered crops"
            icon={Scale}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Active Registered Batches"
            value={farmerProducts.length}
            subtitle="Committed to Hyperledger"
            icon={Sprout}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Lab Verified Batches"
            value={approvedBatches}
            subtitle="QA passed & certified"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="In Processing / Testing"
            value={inProgressBatches}
            subtitle="Moving through supply chain"
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
                Registered Botanical Crops
              </h3>
              <p className="text-xs text-slate-500">
                Live status of raw harvests registered on the blockchain network
              </p>
            </div>

            <Link
              to="/farmer/register"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>+ Register Another Crop</span>
            </Link>
          </div>

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
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-emerald-600" />
                        <span>{product.farmLocation.split(',')[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {product.harvestDate}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProductForQR(product)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View QR Code"
                      >
                        <QrCode size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/verify/${product.id}`)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {selectedProductForQR && (
        <QRModal
          isOpen={!!selectedProductForQR}
          onClose={() => setSelectedProductForQR(null)}
          product={selectedProductForQR}
        />
      )}
    </DashboardLayout>
  );
};
