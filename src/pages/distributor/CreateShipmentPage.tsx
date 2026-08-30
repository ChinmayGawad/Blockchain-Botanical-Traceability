import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Truck,
  Blocks,
  CheckCircle2,
  ArrowRight,
  ThermometerSnowflake,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateShipmentPage: React.FC = () => {
  const { products, createShipment } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eligibleProducts = products.filter(p => p.status === 'APPROVED');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [sourceLocation, setSourceLocation] = useState('Bangalore Central Bio-Pharma Logistics Terminal, India');
  const [destinationLocation, setDestinationLocation] = useState('Pure Botanical Apothecary London Hub, Heathrow Terminal 4');
  const [vehicleNumber, setVehicleNumber] = useState(`KA-01-TG-${Math.floor(1000 + Math.random() * 9000)} / LH-Cargo-844`);
  const [transportType, setTransportType] = useState<'REFRIGERATED_TRUCK' | 'STANDARD_LOGISTICS' | 'AIR_FREIGHT'>('REFRIGERATED_TRUCK');
  const [tempRange, setTempRange] = useState('18°C - 22°C (Strict GDP Standard)');
  const [trackingNumber, setTrackingNumber] = useState(`TG-CC-2024-${Math.floor(100000 + Math.random() * 900000)}`);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    if (selectedProduct && selectedProduct.status !== 'APPROVED') {
      alert('Security Validation: Product must be APPROVED by a certified QA Laboratory before dispatching.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createShipment(selectedProductId, {
        shipmentId: `SHP-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        distributorId: currentUser.id,
        distributorName: `${currentUser.name} (${currentUser.organization || 'TransGlobal Cold-Chain'})`,
        sourceLocation,
        destinationLocation,
        vehicleNumber,
        transportType,
        temperatureRange: tempRange,
        dispatchDate: new Date(dispatchDate).toISOString(),
        expectedDeliveryDate: new Date(expectedDate).toISOString(),
        trackingNumber,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Create Cold-Chain Dispatch Shipment"
      subtitle="Issue tamper-resistant transport log on Hyperledger Fabric with GDP temperature parameters."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {isSuccess ? (
          <div className="bg-white p-8 rounded-3xl border border-sky-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Shipment Committed On-Chain
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Batch Dispatched & In Transit
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tracking #{trackingNumber} • Status updated to <span className="font-bold text-sky-600">IN_TRANSIT</span>
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 text-left font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider">
                Blockchain Shipment Record:
              </div>
              <div className="text-sky-300 text-[11px]">
                Action: chaincode:CreateShipment()
              </div>
              <div className="text-slate-300 text-[11px]">
                Endorsing Peers: peer0.distributor.florachain.org, peer0.retailer.florachain.org
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>View Live Provenance Route</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/distributor/dashboard')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Return to Logistics Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Shipment Manifest Information</h3>
                <p className="text-xs text-slate-500">Record freight carrier, temperature tolerance, and destination warehouse</p>
              </div>
            </div>

            {/* Select Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select QA Approved Botanical Batch: *
              </label>
              {eligibleProducts.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                  ⚠️ No batches currently in <strong>APPROVED</strong> status. Batches must be processed and verified by an accredited testing laboratory before shipment dispatch can occur.
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-mono"
                >
                  {eligibleProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} • Batch #{p.batchId} [{p.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Origin Logistics Hub: *</label>
                <input
                  type="text"
                  required
                  value={sourceLocation}
                  onChange={e => setSourceLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Retail Depot: *</label>
                <input
                  type="text"
                  required
                  value={destinationLocation}
                  onChange={e => setDestinationLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle / Carrier Details: *</label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transport Freight Type: *</label>
                <select
                  value={transportType}
                  onChange={e => setTransportType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="REFRIGERATED_TRUCK">Refrigerated Truck (Cold Chain)</option>
                  <option value="AIR_FREIGHT">Air Freight (Temperature Monitored)</option>
                  <option value="STANDARD_LOGISTICS">Standard Climate-Controlled Ground</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temperature Specs: *</label>
                <input
                  type="text"
                  required
                  value={tempRange}
                  onChange={e => setTempRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Carrier Tracking Number: *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch Date: *</label>
                <input
                  type="date"
                  required
                  value={dispatchDate}
                  onChange={e => setDispatchDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date: *</label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-900 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Broadcasting Shipment Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    <span>Commit Shipment & Mark IN_TRANSIT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
