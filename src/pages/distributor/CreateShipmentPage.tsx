import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  Truck,
  Blocks,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ThermometerSnowflake,
  MapPin,
  Calendar,
  Layers,
  Package,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateShipmentPage: React.FC = () => {
  const { products, createShipment } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eligibleProducts = products.filter(p => p.status === 'APPROVED');
  const initialBatchId = searchParams.get('batch') || eligibleProducts[0]?.id || '';

  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [validationError, setValidationError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState(initialBatchId);
  const [sourceLocation, setSourceLocation] = useState('Bangalore Central Bio-Pharma Logistics Terminal, Nelamangala Hub, Karnataka');
  const [destinationLocation, setDestinationLocation] = useState('Arogya Ayurvedic Wellness Retail Depot, Indiranagar, Bengaluru, Karnataka');
  const [vehicleNumber, setVehicleNumber] = useState(`KA-01-TG-${Math.floor(1000 + Math.random() * 9000)}`);
  const [transportType, setTransportType] = useState<'REFRIGERATED_TRUCK' | 'STANDARD_LOGISTICS' | 'AIR_FREIGHT'>('REFRIGERATED_TRUCK');
  const [tempRange, setTempRange] = useState('18°C - 22°C (Strict GDP Standard)');
  const [trackingNumber, setTrackingNumber] = useState(`TG-IND-2024-${Math.floor(100000 + Math.random() * 900000)}`);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const STEPS = [
    { id: 1, label: 'Batch Intake', shortLabel: 'Batch', icon: Package },
    { id: 2, label: 'Route Hubs', shortLabel: 'Route', icon: MapPin },
    { id: 3, label: 'Fleet & Cold-Chain', shortLabel: 'Fleet', icon: Truck },
    { id: 4, label: 'Schedule & Manifest', shortLabel: 'Manifest', icon: Calendar },
    { id: 5, label: 'Review & Dispatch', shortLabel: 'Dispatch', icon: Blocks },
  ];

  const isStepComplete = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(selectedProductId);
      case 2:
        return Boolean(sourceLocation.trim() && destinationLocation.trim());
      case 3:
        return Boolean(vehicleNumber.trim() && transportType && tempRange.trim());
      case 4:
        return Boolean(
          trackingNumber.trim() &&
          dispatchDate &&
          expectedDate &&
          new Date(expectedDate) >= new Date(dispatchDate)
        );
      case 5:
        return Boolean(isSuccess);
      default:
        return false;
    }
  };

  const canNavigateToStep = (targetStep: number): { allowed: boolean; reason?: string } => {
    if (targetStep <= step) return { allowed: true };

    for (let s = 1; s < targetStep; s++) {
      if (!isStepComplete(s)) {
        const stepInfo = STEPS.find(item => item.id === s);
        const targetInfo = STEPS.find(item => item.id === targetStep);
        return {
          allowed: false,
          reason: `Please complete Step ${s} (${stepInfo?.label || 'Previous Step'}) before advancing to Step ${targetStep} (${targetInfo?.label || 'Target Step'}).`,
        };
      }
    }
    return { allowed: true };
  };

  const handleTabClick = (targetStep: number) => {
    if (targetStep === step) return;
    const check = canNavigateToStep(targetStep);
    if (!check.allowed) {
      setValidationError(check.reason || 'Please fill in the required fields on the current tab first.');
      return;
    }
    setValidationError(null);
    setVisitedSteps(prev => new Set([...prev, targetStep]));
    setStep(targetStep);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepComplete(step)) {
      setValidationError('Please complete the required fields in the current step before proceeding.');
      return;
    }
    setValidationError(null);
    const nextStep = Math.min(5, step + 1);
    setVisitedSteps(prev => new Set([...prev, nextStep]));
    setStep(nextStep);
  };

  const handleBack = () => {
    setValidationError(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const validateBeforeSubmit = (): { isValid: boolean; targetStep?: number; message?: string } => {
    if (!selectedProductId) {
      return { isValid: false, targetStep: 1, message: 'Please select an approved botanical batch.' };
    }
    if (!sourceLocation.trim() || !destinationLocation.trim()) {
      return { isValid: false, targetStep: 2, message: 'Please specify route origin and destination hubs in Step 2.' };
    }
    if (!vehicleNumber.trim() || !transportType || !tempRange.trim()) {
      return { isValid: false, targetStep: 3, message: 'Please complete carrier vehicle and temperature parameters in Step 3.' };
    }
    if (!trackingNumber.trim() || !dispatchDate || !expectedDate) {
      return { isValid: false, targetStep: 4, message: 'Please specify tracking number and schedule dates in Step 4.' };
    }
    if (new Date(expectedDate) < new Date(dispatchDate)) {
      return { isValid: false, targetStep: 4, message: 'Estimated delivery date cannot precede the scheduled dispatch date.' };
    }
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBeforeSubmit();
    if (!validation.isValid) {
      setValidationError(validation.message || 'Please complete required fields.');
      if (validation.targetStep) {
        setVisitedSteps(prev => new Set([...prev, validation.targetStep!]));
        setStep(validation.targetStep!);
      }
      return;
    }

    if (selectedProduct && selectedProduct.status !== 'APPROVED') {
      setValidationError('Security Validation: Product must be APPROVED by a certified QA Laboratory before dispatching.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
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
      subtitle="5-step verification wizard to issue tamper-resistant transport log on Hyperledger Fabric with GDP temperature parameters."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Interactive Progress Tab Stepper */}
        {!isSuccess && (
          <nav aria-label="Shipment Steps" className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STEPS.map((s) => {
                const isActive = step === s.id;
                const isComplete = isStepComplete(s.id);
                const IconComponent = s.icon;
                const navCheck = canNavigateToStep(s.id);
                const isAccessible = navCheck.allowed;

                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`ship-step-tab-${s.id}`}
                    aria-selected={isActive}
                    aria-current={isActive ? 'step' : undefined}
                    aria-disabled={!isAccessible}
                    onClick={() => handleTabClick(s.id)}
                    title={!isAccessible ? navCheck.reason : undefined}
                    className={`relative flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl transition-all duration-200 group text-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-700/20 ring-2 ring-sky-500/40 font-bold cursor-default'
                        : isComplete
                        ? 'bg-sky-50 text-sky-800 border border-sky-200/90 hover:bg-sky-100/80 hover:border-sky-300 font-semibold cursor-pointer'
                        : isAccessible
                        ? 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 font-medium cursor-pointer'
                        : 'bg-slate-50/60 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                      <IconComponent
                        size={15}
                        className={`transition-transform duration-200 ${
                          isActive
                            ? 'text-white'
                            : isComplete
                            ? 'text-sky-700 group-hover:scale-110'
                            : isAccessible
                            ? 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110'
                            : 'text-slate-300'
                        }`}
                      />
                      {/* Step Number / Check Badge / Lock */}
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-sky-800/90 text-sky-100'
                            : isComplete
                            ? 'bg-sky-200 text-sky-900'
                            : isAccessible
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isComplete && !isActive ? (
                          <Check size={10} className="stroke-[3]" />
                        ) : !isAccessible ? (
                          <Lock size={9} />
                        ) : (
                          s.id
                        )}
                      </span>
                    </div>

                    {/* Step Title */}
                    <span className="text-[11px] sm:text-xs leading-tight tracking-tight hidden sm:inline truncate max-w-full">
                      {s.label}
                    </span>
                    <span className="text-[10px] leading-tight tracking-tight sm:hidden font-medium truncate max-w-full">
                      {s.shortLabel}
                    </span>

                    {/* Active Indicator Pip */}
                    {isActive && (
                      <span className="absolute -bottom-1 w-6 sm:w-8 h-1 bg-sky-400 rounded-full shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Direct Tab Navigation Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                <span>Click previous tabs to edit • Next tabs unlock when current tab is filled</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                Step {step} of 5
              </span>
            </div>
          </nav>
        )}

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span className="font-medium">{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-amber-700 hover:text-amber-950 font-bold p-1 rounded-lg hover:bg-amber-100"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Screen after Dispatch */}
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
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate(`/verify/${selectedProductId}`)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Live Provenance Route</span>
                <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate('/distributor/dashboard')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-xs"
              >
                Return to Logistics Dashboard
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Select Approved Batch */}
            {step === 1 && (
              <motion.div
                key="ship-step-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 1: Select Approved Botanical Batch</h3>
                      <p className="text-xs text-slate-500">Pick from batches certified by an accredited testing laboratory</p>
                    </div>
                  </div>

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

                  {selectedProduct && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5">Certified Batch Overview:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                        <div>Product: <span className="font-semibold text-slate-800">{selectedProduct.name}</span></div>
                        <div>Quantity: <span className="font-bold text-sky-700">{selectedProduct.quantityKg} kg</span></div>
                        <div>Farmer: <span className="font-medium text-slate-700">{selectedProduct.farmerName}</span></div>
                        <div>QA Status: <span className="font-bold text-emerald-600">✓ QA APPROVED</span></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-3">
                    <motion.button
                      whileHover={{ scale: selectedProductId ? 1.03 : 1, y: selectedProductId ? -1 : 0 }}
                      whileTap={{ scale: selectedProductId ? 0.96 : 1 }}
                      type="submit"
                      disabled={!selectedProductId}
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Continue to Route Hubs</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: Route Origin & Depot */}
            {step === 2 && (
              <motion.div
                key="ship-step-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 2: Logistics Route Origin & Destination</h3>
                      <p className="text-xs text-slate-500">Designate departure terminal and destination retail warehouse depot</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Origin Logistics Terminal Hub: *</label>
                      <input
                        type="text"
                        required
                        value={sourceLocation}
                        onChange={e => setSourceLocation(e.target.value)}
                        placeholder="e.g. Bangalore Central Bio-Pharma Logistics Terminal, Nelamangala Hub"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Retail Depot / Warehouse: *</label>
                      <input
                        type="text"
                        required
                        value={destinationLocation}
                        onChange={e => setDestinationLocation(e.target.value)}
                        placeholder="e.g. Arogya Ayurvedic Wellness Retail Depot, Indiranagar, Bengaluru"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Continue to Fleet Specs</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Fleet Vehicle & Modality */}
            {step === 3 && (
              <motion.div
                key="ship-step-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 3: Carrier Fleet & GDP Temperature Standards</h3>
                      <p className="text-xs text-slate-500">Record vehicle registration, refrigeration parameters, and transport modality</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle / Carrier Registration Details: *</label>
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={e => setVehicleNumber(e.target.value)}
                        placeholder="e.g. KA-01-TG-4821 (Refrigerated Van)"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Transport Freight Modality: *</label>
                        <select
                          value={transportType}
                          onChange={e => setTransportType(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium"
                        >
                          <option value="REFRIGERATED_TRUCK">Refrigerated Truck (Cold Chain)</option>
                          <option value="AIR_FREIGHT">Air Freight (Temperature Monitored)</option>
                          <option value="STANDARD_LOGISTICS">Standard Climate-Controlled Ground</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">GDP Temperature Specs: *</label>
                        <input
                          type="text"
                          required
                          value={tempRange}
                          onChange={e => setTempRange(e.target.value)}
                          placeholder="e.g. 18°C - 22°C (Strict GDP Standard)"
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
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
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Continue to Manifest</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Schedule & Tracking Manifest */}
            {step === 4 && (
              <motion.div
                key="ship-step-4"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 4: Dispatch Schedule & Tracking Number</h3>
                      <p className="text-xs text-slate-500">Assign carrier consignment code and estimated timeline</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Carrier Consignment Tracking Number: *</label>
                      <input
                        type="text"
                        required
                        value={trackingNumber}
                        onChange={e => setTrackingNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Dispatch Date: *</label>
                        <input
                          type="date"
                          required
                          value={dispatchDate}
                          onChange={e => setDispatchDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Delivery Date: *</label>
                        <input
                          type="date"
                          min={dispatchDate || undefined}
                          required
                          value={expectedDate}
                          onChange={e => setExpectedDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                        {expectedDate && dispatchDate && new Date(expectedDate) < new Date(dispatchDate) && (
                          <p className="text-[11px] text-rose-600 font-semibold mt-1">
                            ⚠ Delivery date cannot precede scheduled dispatch date.
                          </p>
                        )}
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
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Review & Commit Dispatch</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 5: Review & Cryptographic Commit */}
            {step === 5 && (
              <motion.div
                key="ship-step-5"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                      <Blocks size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Step 5: Cryptographic Shipment Manifest Review</h3>
                      <p className="text-xs text-slate-500">Sign payload with Logistics Node identity and commit shipment to ledger</p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Batch Dispatched:</span>
                      <span className="font-bold text-slate-900">{selectedProduct?.name} ({selectedProduct?.batchId})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Logistics Carrier:</span>
                      <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.organization || 'TransGlobal Cold-Chain'})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Tracking Code:</span>
                      <span className="font-mono font-bold text-sky-700">{trackingNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Fleet & Temperature:</span>
                      <span className="text-slate-800">{vehicleNumber} • {transportType} ({tempRange})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/70 pb-2">
                      <span className="text-slate-500">Transit Route:</span>
                      <span className="text-slate-700 text-right max-w-xs">{sourceLocation} → {destinationLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Dispatch:</span>
                      <span className="font-medium text-slate-800">{dispatchDate} (Est. Delivery: {expectedDate})</span>
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
                      whileHover={{ scale: !isSubmitting ? 1.03 : 1, y: !isSubmitting ? -1 : 0 }}
                      whileTap={{ scale: !isSubmitting ? 0.96 : 1 }}
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
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
