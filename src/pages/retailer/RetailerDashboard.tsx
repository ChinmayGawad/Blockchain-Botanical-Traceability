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
  Store,
  QrCode,
  PackageCheck,
  CheckCircle2,
  ArrowRight,
  Printer,
  DollarSign,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RetailerDashboard: React.FC = () => {
  const { products, confirmRetailReceipt } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedProductForQR, setSelectedProductForQR] = useState<BotanicalProduct | null>(null);
  const [receivingProductId, setReceivingProductId] = useState<string | null>(null);
  const [shelfId, setShelfId] = useState('RET-LON-092');
  const [price, setPrice] = useState<number>(29.99);

  // Incoming shipments ready for check-in
  const incomingShipments = products.filter(p => p.status === 'IN_TRANSIT' || p.status === 'DELIVERED');

  // Shelf inventory verified by this retailer
  const myRetailInventory = products.filter(
    p =>
      p.retailDetails &&
      (p.retailDetails.retailerId === currentUser.id ||
        (currentUser.name && p.retailDetails.retailerName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        currentUser.role === 'ADMIN')
  );

  const handleConfirmReceipt = (productId: string) => {
    confirmRetailReceipt(productId, {
      retailerId: currentUser.id,
      retailerName: `${currentUser.name} (${currentUser.organization || 'Pure Botanical Apothecary'})`,
      storeLocation: currentUser.location || 'Covent Garden, London',
      receivedDate: new Date().toISOString(),
      shelfBatchId: shelfId,
      unitPrice: price,
      notes: 'Tamper seals verified intact. Matched with smart contract hash.',
    });

    setReceivingProductId(null);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <DashboardLayout
      title="Retailer Apothecary Portal"
      subtitle={`${currentUser.name} • ${currentUser.organization || 'Pure Botanical Apothecary London'} (ID: ${currentUser.id}) • Storefront: ${currentUser.location || 'Covent Garden, London'}`}
      action={
        <Link
          to="/retailer/generate-qr"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
          <QrCode size={16} />
          <span>Batch QR Label Studio</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="My Shelf Inventory"
            value={myRetailInventory.length}
            subtitle="Ready for consumer scan"
            icon={Store}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Incoming Logistics Lots"
            value={incomingShipments.length}
            subtitle="Awaiting store check-in"
            icon={PackageCheck}
            iconColor="text-sky-700"
            bgColor="bg-sky-50"
          />
          <MetricCard
            title="QR Authenticity Rate"
            value="100%"
            subtitle="Zero reported counterfeit"
            icon={CheckCircle2}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Avg Retail Unit Price"
            value="$29.99"
            subtitle="Certified Organic Botanical"
            icon={DollarSign}
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Incoming Logistics Batches Awaiting Receipt */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Incoming Transport Deliveries</span>
                <span className="text-xs font-bold bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full border border-sky-200">
                  {incomingShipments.length} Available
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Cold-chain consignments delivered to store ready for retail inventory check-in
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">Batch ID</th>
                  <th className="px-5 py-3.5">Carrier / Tracking</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Store Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingShipments.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {product.name}
                      <span className="block text-xs text-slate-500 font-mono italic mt-0.5">{product.botanicalName}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-xs text-emerald-900">
                      <span className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        {product.batchId}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{product.shipmentDetails?.distributorName || 'Cold-Chain Transport'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">Track: {product.shipmentDetails?.trackingNumber || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {product.status === 'RETAIL_READY' ? (
                        <span className="text-emerald-800 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-emerald-600" /> On Shelf
                        </span>
                      ) : (
                        <button
                          onClick={() => setReceivingProductId(product.id)}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <PackageCheck size={14} />
                          <span>Accept into Inventory</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal / Inline Receive Form */}
        {receivingProductId && (
          <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Tag size={16} className="text-emerald-700" />
                <span>Confirm Retail Intake & Shelf Tag Assignment</span>
              </h4>
              <button
                onClick={() => setReceivingProductId(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Retail Shelf Batch Tag:
                </label>
                <input
                  type="text"
                  value={shelfId}
                  onChange={e => setShelfId(e.target.value)}
                  className="w-full bg-white px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shelf Unit Price (USD):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleConfirmReceipt(receivingProductId)}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Commit & Stock Shelf</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Store Shelf Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                My Verified Retail Stock
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Products stocked by {currentUser.name} ({currentUser.organization})
              </p>
            </div>
          </div>

          {myRetailInventory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No inventory has been received under this retailer account yet. Accept an incoming delivery above to stock your shelf.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Shelf Batch ID</th>
                    <th className="px-5 py-3.5">Unit Price</th>
                    <th className="px-5 py-3.5">Verification State</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRetailInventory.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {product.name}
                        <span className="block text-xs text-slate-500 font-mono mt-0.5">{product.batchId}</span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-800">
                        {product.retailDetails?.shelfBatchId}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        ${product.retailDetails?.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={product.verificationState} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedProductForQR(product)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                        >
                          <Printer size={13} />
                          <span>Print QR</span>
                        </button>
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
