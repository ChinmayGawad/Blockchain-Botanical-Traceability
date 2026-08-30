import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Cog,
  Blocks,
  CheckCircle2,
  ArrowRight,
  Layers,
  FlaskConical,
  UploadCloud,
  FileCheck,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProcessBatchPage: React.FC = () => {
  const { products, processBatch } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eligibleProducts = products.filter(p => p.status === 'REGISTERED' || p.status === 'PROCESSING');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [method, setMethod] = useState('Cryogenic Milling & Low-Temperature Solar Vacuum Dehydration (45°C)');
  const [facilityLocation, setFacilityLocation] = useState('PhytoExtracts Cleanroom Facility #3, Bangalore Biotech Hub');
  const [initialQty, setInitialQty] = useState<number>(300);
  const [processedQty, setProcessedQty] = useState<number>(270);
  const [equipment, setEquipment] = useState('Alpine Pin Mill 160Z, Ultrasonic Sieve Classifier, Nitrogen-Purged Hopper');
  const [notes, setNotes] = useState('Raw material washed with double-filtered deionized water, sanitized, milled to 80-mesh fine powder. Zero thermal degradation.');
  const [ipfsCid, setIpfsCid] = useState('QmProcLog' + Math.random().toString(36).substring(2, 12));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setInitialQty(selectedProduct.quantityKg);
      setProcessedQty(Math.round(selectedProduct.quantityKg * 0.9));
    }
  }, [selectedProductId, selectedProduct]);

  const yieldLoss = initialQty > 0 ? Math.max(0, Math.round(((initialQty - processedQty) / initialQty) * 100)) : 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsSubmitting(true);
    try {
      await processBatch(selectedProductId, {
        processorId: currentUser.id,
        processorName: `${currentUser.name} (${currentUser.organization || 'PhytoExtracts'})`,
        processingDate: new Date().toISOString(),
        method,
        facilityLocation,
        initialQuantityKg: initialQty,
        processedQuantityKg: processedQty,
        yieldLossPercentage: yieldLoss,
        equipmentUsed: equipment.split(',').map(s => s.trim()).filter(Boolean),
        ipfsDocumentCid: ipfsCid,
        notes,
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
      title="Process Raw Botanical Harvest"
      subtitle="Record bio-refining, extraction parameters, and yield changes with cryptographic proof."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {isSuccess ? (
          <div className="bg-white p-8 rounded-3xl border border-purple-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Processing Step Committed
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Batch Refined & Forwarded to Laboratory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Yield: {processedQty} kg recorded • Status updated to <span className="font-bold text-indigo-600">IN_TESTING</span>
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 text-left font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider">
                Chaincode Invocation Receipt:
              </div>
              <div className="text-purple-300 text-[11px]">
                Method: chaincode:AddProcessingDetails()
              </div>
              <div className="text-slate-300 text-[11px]">
                Endorsing Peers: peer0.processor.florachain.org, peer0.farmer.florachain.org
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>View Updated Provenance Timeline</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/laboratory/dashboard')}
                className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-colors"
              >
                Switch to Quality Lab to QA Test Sample →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Cog size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bio-Refining & Extraction Record</h3>
                <p className="text-xs text-slate-500">Record transformation methods, output mass, and GMP facility certificates</p>
              </div>
            </div>

            {/* Select Product to Process */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Raw Botanical Harvest Batch: *
              </label>
              {eligibleProducts.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                  ⚠️ No batches currently in <strong>REGISTERED</strong> status awaiting processing. Newly registered harvest batches will appear here.
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-mono"
                >
                  {eligibleProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.botanicalName}) • Batch #{p.batchId} [{p.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedProduct && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">Selected Crop Origin:</div>
                <div className="text-slate-600">Farmer: {selectedProduct.farmerName} ({selectedProduct.farmerOrg})</div>
                <div className="text-slate-600">Farm Location: {selectedProduct.farmLocation}</div>
                <div className="text-slate-600">Initial Harvest Mass: <span className="font-bold text-slate-900">{selectedProduct.quantityKg} kg</span></div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extraction / Processing Method: *
                </label>
                <input
                  type="text"
                  required
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Name & Cleanroom Location: *
                </label>
                <input
                  type="text"
                  required
                  value={facilityLocation}
                  onChange={e => setFacilityLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Yield calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Raw Input Mass (kg):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={initialQty}
                    onChange={e => setInitialQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-purple-200 rounded-lg font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Refined Output Mass (kg):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={processedQty}
                    onChange={e => setProcessedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-purple-200 rounded-lg font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Calculated Yield Loss (%):
                  </label>
                  <div className="px-3 py-2 text-xs font-bold text-purple-900 bg-purple-100 rounded-lg border border-purple-200">
                    {yieldLoss}% Moisture / Hull Loss
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Equipment Used (Separated by Commas):
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={e => setEquipment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processing Observations & Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                ></textarea>
              </div>

              {/* IPFS Hash */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <UploadCloud size={14} className="text-purple-600" />
                  <span>IPFS Document Hash (Processing SOP Log):</span>
                </div>
                <div className="font-mono text-xs text-purple-700 bg-white p-2 rounded border border-slate-200">
                  {ipfsCid}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Broadcasting Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <Blocks size={16} />
                    <span>Sign Processing & Dispatch Sample to Lab</span>
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
