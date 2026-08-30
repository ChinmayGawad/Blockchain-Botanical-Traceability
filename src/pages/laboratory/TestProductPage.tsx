import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Blocks,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TestProductPage: React.FC = () => {
  const { products, submitLabResult } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eligibleProducts = products.filter(p => p.status === 'PROCESSED' || p.status === 'IN_TESTING');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [purity, setPurity] = useState<number>(99.5);
  const [moisture, setMoisture] = useState<number>(5.4);
  const [heavyMetals, setHeavyMetals] = useState<'PASS' | 'FAIL'>('PASS');
  const [microbial, setMicrobial] = useState<'PASS' | 'FAIL'>('PASS');
  const [pesticides, setPesticides] = useState<'PASS' | 'FAIL'>('PASS');
  const [testedBy, setTestedBy] = useState('Dr. Ananya Sharma, Lead Biochemist');
  const [notes, setNotes] = useState('Batch passed all USP <561> botanical monograph criteria. Zero synthetic pesticide residue detected (<0.001 mg/kg limit of quantification).');
  const [ipfsCid, setIpfsCid] = useState('QmLabReport' + Math.random().toString(36).substring(2, 12));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionResult, setDecisionResult] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleDecision = async (approve: boolean) => {
    if (!selectedProductId) return;

    setIsSubmitting(true);
    try {
      const parameters = [
        {
          name: 'Active Phytochemical Potency (HPLC)',
          value: `${purity.toFixed(1)}%`,
          unit: '%',
          standardLimit: '≥ 95.0%',
          passed: purity >= 95.0,
        },
        {
          name: 'Moisture Content (Karl Fischer)',
          value: `${moisture.toFixed(1)}%`,
          unit: '%',
          standardLimit: '≤ 8.0%',
          passed: moisture <= 8.0,
        },
        {
          name: 'Heavy Metals (Pb, As, Cd, Hg) ICP-MS',
          value: heavyMetals === 'PASS' ? '< 0.05' : '1.42',
          unit: 'ppm',
          standardLimit: '< 0.50 ppm',
          passed: heavyMetals === 'PASS',
        },
        {
          name: 'Microbial & Salmonella Bioburden',
          value: microbial === 'PASS' ? 'ABSENT' : 'CONTAMINATED',
          unit: '/10g',
          standardLimit: 'Absent/10g',
          passed: microbial === 'PASS',
        },
        {
          name: 'Multi-Residue Pesticide Screen (GC-MS)',
          value: pesticides === 'PASS' ? '< 0.001' : '0.18',
          unit: 'mg/kg',
          standardLimit: '< 0.01 mg/kg',
          passed: pesticides === 'PASS',
        },
      ];

      await submitLabResult(
        selectedProductId,
        {
          labId: currentUser.id,
          labName: currentUser.organization || 'Eurofins AgriBio Analytics Lab',
          testDate: new Date().toISOString(),
          testedBy,
          purityPercentage: purity,
          moisturePercentage: moisture,
          heavyMetalsStatus: heavyMetals,
          microbialTestStatus: microbial,
          pesticideResidueStatus: pesticides,
          parameters,
          certificateIpfsCid: ipfsCid,
          overallResult: approve ? 'APPROVED' : 'REJECTED',
          notes: approve ? notes : 'CRITICAL FAILURE: Pesticide / microbial contamination exceeds allowed international pharmacopeia limits. Smart contract locked batch.',
        },
        approve
      );

      setIsSubmitting(false);
      setDecisionResult(approve ? 'APPROVED' : 'REJECTED');

      if (approve) {
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Laboratory QA Inspection & Cryptographic Certification"
      subtitle="Conduct HPLC potency assays, heavy metal ICP-MS screening, and invoke chaincode to Approve or Reject batches on Hyperledger Fabric."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {decisionResult ? (
          <div
            className={`bg-white p-8 rounded-3xl border ${
              decisionResult === 'APPROVED' ? 'border-emerald-200' : 'border-rose-200'
            } shadow-xl text-center space-y-6`}
          >
            <div
              className={`w-16 h-16 rounded-full ${
                decisionResult === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-rose-100 text-rose-600'
              } flex items-center justify-center mx-auto shadow-inner`}
            >
              {decisionResult === 'APPROVED' ? <CheckCircle2 size={36} /> : <ShieldX size={36} />}
            </div>

            <div>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  decisionResult === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {decisionResult === 'APPROVED' ? 'QA Approval Committed' : 'Batch Locked on Blockchain'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                {decisionResult === 'APPROVED'
                  ? 'Laboratory Quality Approved ✓'
                  : 'Batch Rejected & Locked by Smart Contract ✗'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {decisionResult === 'APPROVED'
                  ? 'Batch is now cryptographically verified and ready for Distributor dispatch.'
                  : 'Batch has been flagged as failed. Downstream distributors cannot create shipping orders.'}
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 text-left font-mono text-xs space-y-2">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider">
                Chaincode Invocation Receipt:
              </div>
              <div className={decisionResult === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>
                Method: chaincode:{decisionResult === 'APPROVED' ? 'ApproveProduct()' : 'RejectProduct()'}
              </div>
              <div className="text-slate-300 text-[11px]">
                Endorsing Peer: peer0.lab.florachain.org (Signed with Lab Private Key)
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>View Public Consumer Verification</span>
                <ArrowRight size={14} />
              </button>
              {decisionResult === 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => navigate('/distributor/dashboard')}
                  className="px-6 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Switch to Distributor to Create Shipment →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <FlaskConical size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Laboratory Quality Assay Form</h3>
                <p className="text-xs text-slate-500">Record certified chemical purity and safety limits</p>
              </div>
            </div>

            {/* Select Product to Test */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Botanical Sample Batch to Inspect: *
              </label>
              {eligibleProducts.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                  ⚠️ No batches currently in <strong>PROCESSED</strong> or <strong>IN_TESTING</strong> status. Harvested crops must first be processed before quality assurance testing can be conducted.
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
                >
                  {eligibleProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} • Batch #{p.batchId} [{p.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Assay Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  HPLC Active Phytochemical Purity (%): *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={purity}
                  onChange={e => setPurity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">USP Standard Threshold: ≥ 95.0%</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moisture Content (%): *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={moisture}
                  onChange={e => setMoisture(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Pharmacopeia Standard: ≤ 8.0%</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Heavy Metals ICP-MS (Pb, As, Cd, Hg): *
                </label>
                <select
                  value={heavyMetals}
                  onChange={e => setHeavyMetals(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                >
                  <option value="PASS">PASS (Non-Detectable / &lt; 0.05 ppm)</option>
                  <option value="FAIL">FAIL (Exceeds Maximum Limits)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Microbial & Salmonella Screen: *
                </label>
                <select
                  value={microbial}
                  onChange={e => setMicrobial(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                >
                  <option value="PASS">PASS (Zero Pathogens Detected)</option>
                  <option value="FAIL">FAIL (Microbial Contamination)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pesticide Residue (GC-MS Multi-Residue): *
                </label>
                <select
                  value={pesticides}
                  onChange={e => setPesticides(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                >
                  <option value="PASS">PASS (100% Pesticide-Free Organic)</option>
                  <option value="FAIL">FAIL (Synthetic Residues Detected)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Analyst Sign-Off: *
                </label>
                <input
                  type="text"
                  required
                  value={testedBy}
                  onChange={e => setTestedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monograph Conformance Notes:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            {/* IPFS Certificate Hash */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <UploadCloud size={14} className="text-indigo-600" />
                <span>IPFS Laboratory Certificate CID:</span>
              </div>
              <div className="font-mono text-xs text-indigo-700 bg-white p-2 rounded border border-slate-200">
                {ipfsCid}
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision(false)}
                className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <ShieldX size={16} />
                <span>REJECT BATCH (Lock Smart Contract)</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision(true)}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing Blockchain Endorsement...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>APPROVE & ISSUE BLOCKCHAIN CERTIFICATE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
