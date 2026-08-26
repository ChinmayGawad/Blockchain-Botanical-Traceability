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

  const incomingShipments = products.filter(p => p.status === 'IN_TRANSIT' || p.status === 'DELIVERED');
  const verifiedShelfProducts = products.filter(p => p.status === 'RETAIL_READY');

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
      subtitle="Confirm verified incoming batches, assign retail shelf IDs, and generate high-trust customer QR stickers."
      action={
        <Link
          to="/retailer/generate-qr"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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
            title="Verified Shelf Inventory"
            value={verifiedShelfProducts.length}
            subtitle="Ready for consumer scan"
            icon={Store}
            iconColor="text-teal-600"
            bgColor="bg-teal-50"
          />
          <MetricCard
            title="Incoming Logistics Lots"
            value={incomingShipments.length}
            subtitle="Awaiting store check-in"
            icon={PackageCheck}
            iconColor="text-sky-600"
            bgColor="bg-sky-50"
          />
          <MetricCard
            title="QR Authenticity Rate"
            value="100%"
            subtitle="Zero reported counterfeit"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            title="Avg Retail Unit Price"
            value="$28.50"
            subtitle="Certified Organic Botanical"
            icon={DollarSign}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Incoming Shipments Needing Store Receipt Confirmation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Incoming Freight Shipments Awaiting Store Intake</span>
                <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                  {incomingShipments.length} Pending Check-In
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Confirm physical seals, assign retail price, and unlock consumer QR code verification
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Botanical Product</th>
                  <th className="px-5 py-3">Batch ID</th>
                  <th className="px-5 py-3">Distributor Carrier</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Store Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomingShipments.length > 0 ? (
                  incomingShipments.map(product => (
                    <tr key={product.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{product.name}</div>
                        <div className="text-[11px] text-slate-500 italic font-mono">
                          {product.botanicalName}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono font-semibold text-emerald-700">
                        {product.batchId}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {product.shipmentDetails?.distributorName || 'TransGlobal Logistics'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Tracking: {product.shipmentDetails?.trackingNumber}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={product.status} size="sm" />
                      </td>

                      <td className="px-5 py-4 text-right">
                        {receivingProductId === product.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              placeholder="Shelf Batch ID"
                              value={shelfId}
                              onChange={e => setShelfId(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded font-mono w-28"
                            />
                            <input
                              type="number"
                              step="0.5"
                              placeholder="Price"
                              value={price}
                              onChange={e => setPrice(Number(e.target.value))}
                              className="px-2 py-1 text-xs border border-slate-300 rounded font-mono w-20"
                            />
                            <button
                              onClick={() => handleConfirmReceipt(product.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setReceivingProductId(null)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReceivingProductId(product.id)}
                            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 size={14} />
                            <span>Confirm Receipt & Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No incoming shipments awaiting intake. Create a shipment in Distributor portal to test.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verified Store Inventory Ready for Customer Purchase */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Verified In-Stock Botanical Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Batches on shelves with active customer QR verification tags
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {verifiedShelfProducts.map(product => (
              <div
                key={product.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{product.name}</span>
                      <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        #{product.batchId}
                      </span>
                      <StatusBadge status={product.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>Shelf ID: <strong className="font-mono text-slate-800">{product.retailDetails?.shelfBatchId || 'RET-LON-089'}</strong></span>
                      <span>Price: <strong className="text-emerald-700">${product.retailDetails?.unitPrice?.toFixed(2) || '28.50'}</strong></span>
                      <span>Stock: {product.quantityKg} kg</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProductForQR(product)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <QrCode size={14} className="text-emerald-400" />
                    <span>Print QR Tag</span>
                  </button>

                  <Link
                    to={`/verify/${product.id}`}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Verify View
                  </Link>
                </div>
              </div>
            ))}
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
