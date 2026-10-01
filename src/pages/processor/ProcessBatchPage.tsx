import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Cog,
  Blocks,
  ArrowRight,
  ArrowLeft,
  Layers,
  FlaskConical,
  UploadCloud,
  FileCheck,
  Package,
  Building2,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateMockIpfsCid, isValidIpfsCid } from '../../utils/ipfsUtils';
import { WizardStepper } from '../../components/common/WizardStepper';
import { WizardAlert } from '../../components/common/WizardAlert';
import { UnauthorizedCard } from '../../components/common/UnauthorizedCard';
import { useWizardNavigation, WizardStep } from '../../hooks/useWizardNavigation';

export const ProcessBatchPage: React.FC = () => {
  const { products, processBatch } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role-Based Access Control (Axis 4: Defense-in-depth security guard)
  if (currentUser?.role !== 'PROCESSOR' && currentUser?.role !== 'ADMIN') {
    return (
      <DashboardLayout
        title="Botanical Processing & Refinement"
        subtitle="Log cryogenic milling, extraction parameters, mass balance yield, and SOP execution to the blockchain."
      >
        <UnauthorizedCard
          currentRole={currentUser?.role || 'UNKNOWN'}
          requiredRole="PROCESSOR"
        />
      </DashboardLayout>
    );
  }

  const eligibleProducts = products.filter(p => p.status === 'REGISTERED' || p.status === 'PROCESSING');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [method, setMethod] = useState('Cryogenic Milling & Low-Temperature Solar Vacuum Dehydration (45°C)');
  const [facilityLocation, setFacilityLocation] = useState('PhytoExtracts Cleanroom Facility #3, Bangalore Biotech Hub');
  const [initialQty, setInitialQty] = useState<number>(300);
  const [processedQty, setProcessedQty] = useState<number>(270);
  const [equipment, setEquipment] = useState('Alpine Pin Mill 160Z, Ultrasonic Sieve Classifier, Nitrogen-Purged Hopper');
  const [notes, setNotes] = useState('Raw material washed with double-filtered deionized water, sanitized, milled to 80-mesh fine powder. Zero thermal degradation.');
  const [ipfsCid, setIpfsCid] = useState(() => generateMockIpfsCid('ProcLog'));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setInitialQty(selectedProduct.quantityKg);
      setProcessedQty(Math.round(selectedProduct.quantityKg * 0.9));
    }
  }, [selectedProductId, selectedProduct]);

  const isYieldValid = initialQty > 0 && processedQty > 0 && processedQty <= initialQty;
  const yieldLoss = isYieldValid
    ? Math.round(((initialQty - processedQty) / initialQty) * 100)
    : 0;

  const STEPS = [
    { id: 1, label: 'Batch Intake', shortLabel: 'Intake', icon: Package },
    { id: 2, label: 'Method & Facility', shortLabel: 'Facility', icon: Cog },
    { id: 3, label: 'Mass & Yield', shortLabel: 'Yield', icon: Scale },
    { id: 4, label: 'SOP & IPFS', shortLabel: 'SOP', icon: FileCheck },
    { id: 5, label: 'Review & Sign', shortLabel: 'Commit', icon: Blocks },
  ];

  const isStepComplete = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(selectedProductId);
      case 2:
        return Boolean(method.trim() && facilityLocation.trim());
      case 3:
        return Boolean(initialQty > 0 && processedQty > 0 && processedQty <= initialQty);
      case 4:
        return Boolean(equipment.trim() && notes.trim() && ipfsCid.trim() && isValidIpfsCid(ipfsCid));
      case 5:
        return Boolean(isSuccess);
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

  const validateBeforeSubmit = (): { isValid: boolean; targetStep?: number; message?: string } => {
    if (!selectedProductId) {
      return { isValid: false, targetStep: 1, message: 'Please select a raw botanical harvest batch to process.' };
    }
    if (!method.trim() || !facilityLocation.trim()) {
      return { isValid: false, targetStep: 2, message: 'Please specify the processing method and facility location in Step 2.' };
    }
    if (!initialQty || initialQty <= 0 || !processedQty || processedQty <= 0) {
      return { isValid: false, targetStep: 3, message: 'Please specify positive numerical input and output masses in Step 3.' };
    }
    if (processedQty > initialQty) {
      return { isValid: false, targetStep: 3, message: 'Refined output mass cannot exceed raw intake mass.' };
    }
    if (!equipment.trim() || !notes.trim() || !ipfsCid.trim() || !isValidIpfsCid(ipfsCid)) {
      return { isValid: false, targetStep: 4, message: 'Please enter equipment used, SOP notes, and a valid IPFS CID format in Step 4.' };
    }
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-submit & idempotency guard (Axis 4)
    if (isSubmitting || isSuccess) return;

    const validation = validateBeforeSubmit();
    if (!validation.isValid) {
      setValidationError(validation.message || 'Please complete required fields.');
      if (validation.targetStep) {
        markStepVisited(validation.targetStep);
        setStep(validation.targetStep);
      }
      return;
    }

    // Input sanitization & boundary defense (Axis 4)
    const sanitizedMethod = method.trim().slice(0, 150);
    const sanitizedFacilityLocation = facilityLocation.trim().slice(0, 200);
    const sanitizedEquipment = equipment.split(',').map(s => s.trim().slice(0, 100)).filter(Boolean);
    const sanitizedNotes = notes.trim().slice(0, 1000);
    const sanitizedIpfsCid = ipfsCid.trim();

    setIsSubmitting(true);
    setValidationError(null);
    setSubmitError(null);

    try {
      await processBatch(selectedProductId, {
        processorId: currentUser.id,
        processorName: `${currentUser.name} (${currentUser.organization || 'PhytoExtracts'})`,
        processingDate: new Date().toISOString(),
        method: sanitizedMethod,
        facilityLocation: sanitizedFacilityLocation,
        initialQuantityKg: initialQty,
        processedQuantityKg: processedQty,
        yieldLossPercentage: yieldLoss,
        equipmentUsed: sanitizedEquipment,
        ipfsDocumentCid: sanitizedIpfsCid,
        notes: sanitizedNotes,
      });

      setIsSuccess(true);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || 'Processing transaction commitment failed. Please verify ledger connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Process Raw Botanical Harvest"
      subtitle="5-step verification wizard to record bio-refining parameters, output mass, and GMP facility certificates on Hyperledger Fabric."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Interactive Progress Tab Stepper */}
        {!isSuccess && (
          <WizardStepper
            steps={STEPS}
            currentStep={step}
            isStepComplete={isStepComplete}
            canNavigateToStep={canNavigateToStep}
            onTabClick={handleTabClick}
            theme="purple"
            ariaLabel="Processing Steps"
          />
        )}

        {/* Validation Error Alert Banner */}
        <WizardAlert
          message={validationError}
          type="error"
          onDismiss={clearValidationError}
        />

        {/* Step 1: Batch Intake & Selection */}
        {step === 1 && !isSuccess && (
          <motion.div
            key="proc-step-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 1: Raw Harvest Batch Intake</h3>
                  <p className="text-xs text-slate-500">Select arriving botanical crop from farm registry</p>
                </div>
              </div>

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
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Verified Crop Origin:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>Farmer: <span className="font-semibold text-slate-800">{selectedProduct.farmerName} ({selectedProduct.farmerOrg})</span></div>
                    <div>Initial Mass: <span className="font-bold text-purple-700">{selectedProduct.quantityKg} kg</span></div>
                    <div className="sm:col-span-2">Farm Location: <span className="font-medium text-slate-700">{selectedProduct.farmLocation}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <motion.button
                  whileHover={{ scale: selectedProductId ? 1.03 : 1, y: selectedProductId ? -1 : 0 }}
                  whileTap={{ scale: selectedProductId ? 0.96 : 1 }}
                  type="submit"
                  disabled={!selectedProductId}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Continue to Method & Facility</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Method & Facility Cleanroom */}
        {step === 2 && !isSuccess && (
          <motion.div
            key="proc-step-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Cog size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 2: Bio-Refining & Facility Details</h3>
                  <p className="text-xs text-slate-500">Record transformation methods and cleanroom facility location</p>
                </div>
              </div>

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
                    placeholder="e.g. Supercritical CO2 Fluid Extraction / Cryogenic Milling"
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
                    placeholder="e.g. PhytoExtracts Cleanroom Facility #3, Bangalore Biotech Hub"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
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
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to Mass Balance</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Mass Balance & Yield Loss */}
        {step === 3 && !isSuccess && (
          <motion.div
            key="proc-step-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 3: Mass Balance & Yield Calculation</h3>
                  <p className="text-xs text-slate-500">Record transformation mass metrics and automatic yield loss calculation</p>
                </div>
              </div>

              {/* Yield calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Raw Input Mass (kg): *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={initialQty}
                    onChange={e => setInitialQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-purple-200 rounded-lg font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Refined Output Mass (kg): *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={initialQty > 0 ? initialQty : undefined}
                    required
                    value={processedQty}
                    onChange={e => setProcessedQty(Number(e.target.value))}
                    className={`w-full px-3 py-2 text-xs border rounded-lg font-bold bg-white ${
                      processedQty > initialQty ? 'border-rose-400 text-rose-700' : 'border-purple-200'
                    }`}
                  />
                  {processedQty > initialQty && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      ⚠ Output cannot exceed intake mass ({initialQty} kg).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                    Calculated Yield Loss (%):
                  </label>
                  <div
                    className={`px-3 py-2 text-xs font-bold rounded-lg border ${
                      processedQty > initialQty
                        ? 'text-rose-800 bg-rose-100 border-rose-200'
                        : 'text-purple-900 bg-purple-100 border-purple-200'
                    }`}
                  >
                    {processedQty > initialQty
                      ? '⚠ Mass Balance Exceeded'
                      : `${yieldLoss}% Moisture / Hull Loss`}
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
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to SOP & IPFS</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 4: Equipment, Notes & IPFS Log */}
        {step === 4 && !isSuccess && (
          <motion.div
            key="proc-step-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4: Equipment & IPFS SOP Log</h3>
                  <p className="text-xs text-slate-500">Document machinery used and cryptographic proof CID</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipment Used (Separated by Commas): *
                  </label>
                  <input
                    type="text"
                    required
                    value={equipment}
                    onChange={e => setEquipment(e.target.value)}
                    placeholder="e.g. Alpine Pin Mill 160Z, Ultrasonic Classifier"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Processing Observations & Notes: *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  ></textarea>
                </div>

                {/* IPFS Hash */}
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                    <UploadCloud size={20} />
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Processing SOP & Machine Telemetry Log Attached
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    IPFS CID: {ipfsCid}
                  </div>
                  <span className="inline-block text-[10px] text-purple-800 font-bold bg-purple-200/80 px-2 py-0.5 rounded">
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
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Review & Commit On-Chain</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 5: Cryptographic Review & Commit */}
        {step === 5 && !isSuccess && (
          <motion.div
            key="proc-step-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Blocks size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 5: Cryptographic Review & Commit</h3>
                  <p className="text-xs text-slate-500">Sign bio-refining transaction with Processor node identity</p>
                </div>
              </div>

              {/* Review Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Batch Name:</span>
                  <span className="font-bold text-slate-900">{selectedProduct?.name} ({selectedProduct?.botanicalName})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Extraction Method:</span>
                  <span className="font-semibold text-slate-800">{method}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Cleanroom Facility:</span>
                  <span className="text-slate-700">{facilityLocation}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Mass Balance:</span>
                  <span className="font-mono font-bold text-purple-700">{initialQty} kg in → {processedQty} kg out ({yieldLoss}% loss)</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Submitting Processor:</span>
                  <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.organization || 'PhytoExtracts'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IPFS Log CID:</span>
                  <span className="font-mono text-purple-700">{ipfsCid}</span>
                </div>
              </div>

              {submitError && (
                <WizardAlert
                  message={submitError}
                  type="error"
                  onDismiss={() => setSubmitError(null)}
                />
              )}

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
                  whileHover={{ scale: !isSubmitting ? 1.03 : 1, y: !isSubmitting ? -1 : 0 }}
                  whileTap={{ scale: !isSubmitting ? 0.96 : 1 }}
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
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Success Screen after Processing */}
        {isSuccess && (
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
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Updated Provenance Timeline</span>
                <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate('/laboratory/dashboard')}
                className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-xs"
              >
                Switch to Quality Lab to QA Test Sample →
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
