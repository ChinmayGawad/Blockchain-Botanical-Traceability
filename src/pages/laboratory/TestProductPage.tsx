import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShareLabReportModal } from '../../components/verification/ShareLabReportModal';
import {
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Blocks,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck,
  Share2,
  Package,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateMockIpfsCid, isValidIpfsCid } from '../../utils/ipfsUtils';
import { WizardStepper } from '../../components/common/WizardStepper';
import { WizardAlert } from '../../components/common/WizardAlert';
import { UnauthorizedCard } from '../../components/common/UnauthorizedCard';
import { useWizardNavigation, WizardStep } from '../../hooks/useWizardNavigation';

export const TestProductPage: React.FC = () => {
  const { products, submitLabResult, getProductById } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role-Based Access Control (Axis 4: Defense-in-depth security guard)
  if (currentUser?.role !== 'LABORATORY' && currentUser?.role !== 'ADMIN') {
    return (
      <DashboardLayout
        title="Botanical Monograph & Safety Testing"
        subtitle="Perform ISO 17025 accredited laboratory assays, purity validation, and sign cryptographic Certificates of Analysis (COA)."
      >
        <UnauthorizedCard
          currentRole={currentUser?.role || 'UNKNOWN'}
          requiredRole="LABORATORY"
        />
      </DashboardLayout>
    );
  }

  const eligibleProducts = products.filter(p => p.status === 'PROCESSED' || p.status === 'IN_TESTING');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [purity, setPurity] = useState<number>(99.5);
  const [moisture, setMoisture] = useState<number>(5.4);
  const [heavyMetals, setHeavyMetals] = useState<'PASS' | 'FAIL'>('PASS');
  const [microbial, setMicrobial] = useState<'PASS' | 'FAIL'>('PASS');
  const [pesticides, setPesticides] = useState<'PASS' | 'FAIL'>('PASS');
  const [testedBy, setTestedBy] = useState('Dr. Ananya Sharma, Lead Biochemist');
  const [notes, setNotes] = useState('Batch passed all Ayurvedic Pharmacopoeia of India (API) & FSSAI 2023 botanical monograph criteria. Zero synthetic pesticide residue detected (<0.001 mg/kg limit of quantification).');
  const [ipfsCid, setIpfsCid] = useState(() => generateMockIpfsCid('LabReport'));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [decisionResult, setDecisionResult] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const STEPS = [
    { id: 1, label: 'Batch Intake', shortLabel: 'Intake', icon: Package },
    { id: 2, label: 'Assay Specs', shortLabel: 'Assay', icon: FlaskConical },
    { id: 3, label: 'Safety Screen', shortLabel: 'Safety', icon: ShieldCheck },
    { id: 4, label: 'Sign-Off & IPFS', shortLabel: 'COA', icon: FileCheck },
    { id: 5, label: 'Ledger Decision', shortLabel: 'Decision', icon: Blocks },
  ];

  const isStepComplete = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(selectedProductId);
      case 2:
        return Boolean(!isNaN(purity) && purity >= 0 && purity <= 100 && !isNaN(moisture) && moisture >= 0 && moisture <= 100);
      case 3:
        return Boolean(heavyMetals && microbial && pesticides);
      case 4:
        return Boolean(testedBy.trim() && notes.trim() && ipfsCid.trim() && isValidIpfsCid(ipfsCid));
      case 5:
        return Boolean(decisionResult);
      default:
        return false;
    }
  };

  const {
    step,
    setStep,
    validationError,
    setValidationError,
    clearValidationError,
    canNavigateToStep,
    handleTabClick,
    handleNext,
    handleBack,
    markStepVisited,
  } = useWizardNavigation({
    steps: STEPS,
    isStepComplete,
  });

  const validateBeforeDecision = (): { isValid: boolean; targetStep?: number; message?: string } => {
    if (!selectedProductId) {
      return { isValid: false, targetStep: 1, message: 'Please select a botanical sample batch to inspect.' };
    }
    if (isNaN(purity) || purity < 0 || purity > 100 || isNaN(moisture) || moisture < 0 || moisture > 100) {
      return { isValid: false, targetStep: 2, message: 'Please enter valid assay percentages between 0% and 100% for purity and moisture in Step 2.' };
    }
    if (!heavyMetals || !microbial || !pesticides) {
      return { isValid: false, targetStep: 3, message: 'Please specify all safety test statuses in Step 3.' };
    }
    if (!testedBy.trim() || !notes.trim() || !ipfsCid.trim() || !isValidIpfsCid(ipfsCid)) {
      return { isValid: false, targetStep: 4, message: 'Please complete analyst sign-off and provide a valid IPFS certificate CID format in Step 4.' };
    }
    return { isValid: true };
  };

  const handleDecision = async (approve: boolean) => {
    // Double-submit & idempotency guard (Axis 4)
    if (isSubmitting || decisionResult) return;

    const validation = validateBeforeDecision();
    if (!validation.isValid) {
      setValidationError(validation.message || 'Please complete required fields.');
      if (validation.targetStep) {
        markStepVisited(validation.targetStep);
        setStep(validation.targetStep);
      }
      return;
    }

    // Input sanitization & boundary defense (Axis 4)
    const sanitizedTestedBy = testedBy.trim().slice(0, 120);
    const sanitizedNotes = notes.trim().slice(0, 1000);
    const sanitizedIpfsCid = ipfsCid.trim();

    setIsSubmitting(true);
    setValidationError(null);
    setSubmitError(null);

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
          labName: currentUser.organization || 'Eurofins NABL Analytical Testing Lab',
          testDate: new Date().toISOString(),
          testedBy: sanitizedTestedBy,
          purityPercentage: purity,
          moisturePercentage: moisture,
          heavyMetalsStatus: heavyMetals,
          microbialTestStatus: microbial,
          pesticideResidueStatus: pesticides,
          parameters,
          certificateIpfsCid: sanitizedIpfsCid,
          overallResult: approve ? 'APPROVED' : 'REJECTED',
          notes: approve ? sanitizedNotes : 'CRITICAL FAILURE: Pesticide / microbial contamination exceeds allowed Ayurvedic Pharmacopoeia of India (API) & FSSAI limits. Smart contract locked batch.',
        },
        approve
      );

      setDecisionResult(approve ? 'APPROVED' : 'REJECTED');
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || 'Laboratory certification transaction failed. Please verify ledger connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Laboratory QA Inspection & Cryptographic Certification"
      subtitle="5-step verification wizard to conduct HPLC assays, heavy metal ICP-MS screening, and invoke chaincode to Approve or Reject batches on Hyperledger Fabric."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Interactive Progress Tab Stepper */}
        {!decisionResult && (
          <WizardStepper
            steps={STEPS}
            currentStep={step}
            isStepComplete={isStepComplete}
            canNavigateToStep={canNavigateToStep}
            onTabClick={handleTabClick}
            theme="indigo"
            ariaLabel="Testing Steps"
          />
        )}

        {/* Validation Error Alert Banner */}
        <WizardAlert
          message={validationError}
          type="error"
          onDismiss={clearValidationError}
        />

        {/* Success / Rejected Screen */}
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
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                title="Share Password-Protected QA Certificate"
              >
                <Share2 size={14} />
                <span>Share Password-Protected Report</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Public Consumer Verification</span>
                <ArrowRight size={14} />
              </motion.button>
              {decisionResult === 'APPROVED' && (
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => navigate('/distributor/dashboard')}
                  className="px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-xs"
                >
                  Switch to Distributor →
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Batch Intake & Selection */}
            {step === 1 && (
              <motion.div
                key="lab-step-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 1: Botanical Batch Inspection Target</h3>
                      <p className="text-xs text-slate-500">Select processed botanical sample awaiting quality control certification</p>
                    </div>
                  </div>

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

                  {selectedProduct && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Batch Provenance Data:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                        <div>Product: <span className="font-semibold text-slate-800">{selectedProduct.name} ({selectedProduct.botanicalName})</span></div>
                        <div>Status: <span className="font-mono font-bold text-indigo-600">{selectedProduct.status}</span></div>
                        <div>Farmer: <span className="font-medium text-slate-700">{selectedProduct.farmerName}</span></div>
                        <div>Quantity: <span className="font-medium text-slate-700">{selectedProduct.quantityKg} kg</span></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-3">
                    <motion.button
                      whileHover={{ scale: selectedProductId ? 1.03 : 1, y: selectedProductId ? -1 : 0 }}
                      whileTap={{ scale: selectedProductId ? 0.96 : 1 }}
                      type="submit"
                      disabled={!selectedProductId}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Continue to Assay Specs</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: HPLC Potency & Moisture Assay */}
            {step === 2 && (
              <motion.div
                key="lab-step-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 2: Phytochemical Potency & Moisture Assay</h3>
                      <p className="text-xs text-slate-500">Record certified chemical purity and moisture limits</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
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
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">USP Threshold: ≥ 95.0%</span>
                        <span className={`font-bold ${purity >= 95 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {purity >= 95 ? '✓ Compliant' : '⚠ Below Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Moisture Content (Karl Fischer) (%): *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={moisture}
                        onChange={e => setMoisture(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">API Threshold: ≤ 8.0%</span>
                        <span className={`font-bold ${moisture <= 8 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {moisture <= 8 ? '✓ Compliant' : '⚠ Excess Moisture'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Continue to Safety Screen</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Safety Contaminant Screening */}
            {step === 3 && (
              <motion.div
                key="lab-step-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 3: Contaminant & Toxicology Screening</h3>
                      <p className="text-xs text-slate-500">Test for toxic heavy metals, microbial bioburden, and pesticide residues</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Heavy Metals ICP-MS (Lead, Arsenic, Cadmium, Mercury): *
                      </label>
                      <select
                        value={heavyMetals}
                        onChange={e => setHeavyMetals(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                      >
                        <option value="PASS">PASS (Non-Detectable / &lt; 0.05 ppm - 100% Safe)</option>
                        <option value="FAIL">FAIL (Exceeds Maximum Permissible Limits)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Microbial & Salmonella Screen (CFU/g): *
                      </label>
                      <select
                        value={microbial}
                        onChange={e => setMicrobial(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                      >
                        <option value="PASS">PASS (Zero Pathogens Detected - E. Coli / Salmonella Negative)</option>
                        <option value="FAIL">FAIL (Microbial Contamination Detected)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pesticide Residue Screen (GC-MS / LC-MS Multi-Residue): *
                      </label>
                      <select
                        value={pesticides}
                        onChange={e => setPesticides(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                      >
                        <option value="PASS">PASS (100% Pesticide-Free Organic Standard)</option>
                        <option value="FAIL">FAIL (Synthetic Residues Detected above MRL)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Continue to COA & IPFS</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Sign-Off, Notes & IPFS CID */}
            {step === 4 && (
              <motion.div
                key="lab-step-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 4: Analyst Sign-Off & IPFS Certificate</h3>
                      <p className="text-xs text-slate-500">Record certified testing officer identity and pin raw lab data to IPFS</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lead Testing Biochemist / Analyst Name: *
                      </label>
                      <input
                        type="text"
                        required
                        value={testedBy}
                        onChange={e => setTestedBy(e.target.value)}
                        placeholder="e.g. Dr. Ananya Sharma, Lead Biochemist"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monograph Conformance Notes: *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      ></textarea>
                    </div>

                    {/* IPFS Certificate Hash */}
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                        <UploadCloud size={20} />
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        NABL Accredited Certificate of Analysis (COA) Attached
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        IPFS CID: {ipfsCid}
                      </div>
                      <span className="inline-block text-[10px] text-indigo-800 font-bold bg-indigo-200/80 px-2 py-0.5 rounded">
                        PINNED TO IPFS CLUSTER ✓
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Review & Ledger Decision</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 5: Review & Decision Sign-Off */}
            {step === 5 && (
              <motion.div
                key="lab-step-5"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <Blocks size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 5: Cryptographic Decision Sign-Off</h3>
                      <p className="text-xs text-slate-500">Sign ledger endorsement to permanently certify or reject batch</p>
                    </div>
                  </div>

                  {/* Summary Dossier */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Inspected Product:</span>
                      <span className="font-bold text-slate-900">{selectedProduct?.name} ({selectedProduct?.batchId})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">HPLC Purity & Moisture:</span>
                      <span className="font-bold text-indigo-700">{purity}% Purity • {moisture}% Moisture</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Safety Screening:</span>
                      <span className="font-semibold text-slate-800">
                        Metals: {heavyMetals} | Microbial: {microbial} | Pesticides: {pesticides}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Certified By:</span>
                      <span className="font-semibold text-slate-800">{testedBy} ({currentUser.organization || 'Eurofins Lab'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IPFS COA Hash:</span>
                      <span className="font-mono text-indigo-700">{ipfsCid}</span>
                    </div>
                  </div>

                  {submitError && (
                    <WizardAlert
                      message={submitError}
                      type="error"
                      onDismiss={() => setSubmitError(null)}
                    />
                  )}

                  {/* Action Decision Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </motion.button>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: !isSubmitting ? 1.03 : 1, y: !isSubmitting ? -1 : 0 }}
                        whileTap={{ scale: !isSubmitting ? 0.96 : 1 }}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision(false)}
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:shadow-xs"
                      >
                        <ShieldX size={15} />
                        <span>REJECT BATCH (Lock Smart Contract)</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: !isSubmitting ? 1.03 : 1, y: !isSubmitting ? -1 : 0 }}
                        whileTap={{ scale: !isSubmitting ? 0.96 : 1 }}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision(true)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Signing Endorsement...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            <span>APPROVE & ISSUE CERTIFICATE</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {isShareModalOpen && getProductById(selectedProductId) && (
        <ShareLabReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={getProductById(selectedProductId)!}
        />
      )}
    </DashboardLayout>
  );
};
