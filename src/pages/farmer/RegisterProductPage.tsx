import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CultivationMethod, Certificate } from '../../types';
import { LocalPartnerSelector } from '../../components/map/LocalPartnerSelector';
import {
  Sprout,
  Check,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  MapPin,
  Calendar,
  Layers,
  UploadCloud,
  Blocks,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBotanicalProductImage } from '../../utils/imageUtils';

export const RegisterProductPage: React.FC = () => {
  const { registerProduct } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);

  // Form states
  const [name, setName] = useState('Certified Organic Shatavari Root Flakes');
  const [botanicalName, setBotanicalName] = useState('Asparagus racemosus');
  const [category, setCategory] = useState<'MEDICINAL_HERB' | 'SPICE' | 'AROMATIC' | 'EXTRACT' | 'TEA'>('MEDICINAL_HERB');
  const [batchId, setBatchId] = useState(`SHT-2024-${Math.floor(100 + Math.random() * 900)}`);
  const [quantityKg, setQuantityKg] = useState<number>(320);
  const [description, setDescription] = useState('Hand-harvested mature Shatavari roots sun-dried under hygienic conditions.');
  const [activeCompounds, setActiveCompounds] = useState('Saponins (Shatavarins I-IV) 4.8%, Isoflavones');

  // Origin
  const [farmLocation, setFarmLocation] = useState('Vedic Farms Sector 8, Neemuch, Madhya Pradesh, India');
  const [lat, setLat] = useState<number>(24.4721);
  const [lng, setLng] = useState<number>(74.8812);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [cultivationMethod, setCultivationMethod] = useState<CultivationMethod>('ORGANIC');

  // Certificates
  const [certType, setCertType] = useState('India Organic (NPOP) & FSSAI Jaivik Bharat');
  const [certNumber, setCertNumber] = useState(`NPOP-IND-2024-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ipfsHash, setIpfsHash] = useState('QmShatavariCert' + Math.random().toString(36).substring(2, 12));

  // Supply Chain Partners
  const [selectedPartners, setSelectedPartners] = useState<any>({
    processor: null,
    lab: null,
    distributor: null,
    retailer: null,
  });

  const STEPS = [
    { id: 1, label: 'Crop Specs', shortLabel: 'Specs', icon: Sprout },
    { id: 2, label: 'Farm & GPS', shortLabel: 'Farm', icon: MapPin },
    { id: 3, label: 'Local Partners', shortLabel: 'Partners', icon: Layers },
    { id: 4, label: 'Certificates', shortLabel: 'Certs', icon: FileCheck },
    { id: 5, label: 'Commit On-Chain', shortLabel: 'Commit', icon: Blocks },
  ];

  const isStepComplete = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return Boolean(name.trim() && botanicalName.trim() && batchId.trim() && quantityKg > 0);
      case 2:
        return Boolean(farmLocation.trim() && !isNaN(lat) && !isNaN(lng) && harvestDate);
      case 3:
        // Local supply chain partner selection is optional/configurable
        return true;
      case 4:
        return Boolean(certType.trim() && certNumber.trim() && ipfsHash.trim());
      case 5:
        return Boolean(createdProduct);
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
    if (!name.trim() || !botanicalName.trim() || !batchId.trim() || !quantityKg || quantityKg <= 0) {
      return {
        isValid: false,
        targetStep: 1,
        message: 'Please complete all required fields in Step 1 (Botanical Information) before submitting.',
      };
    }
    if (!farmLocation.trim() || !lat || !lng || !harvestDate) {
      return {
        isValid: false,
        targetStep: 2,
        message: 'Please complete farm location, GPS coordinates, and harvest date in Step 2.',
      };
    }
    if (!certType.trim() || !certNumber.trim() || !ipfsHash.trim()) {
      return {
        isValid: false,
        targetStep: 4,
        message: 'Please complete certificate details and IPFS CID in Step 4.',
      };
    }
    return { isValid: true };
  };

  const handleFinalSubmit = async () => {
    const validation = validateBeforeSubmit();
    if (!validation.isValid) {
      setValidationError(validation.message || 'Please complete required fields.');
      if (validation.targetStep) {
        setVisitedSteps(prev => new Set([...prev, validation.targetStep!]));
        setStep(validation.targetStep!);
      }
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const cert: Certificate = {
      id: `CERT-${Date.now()}`,
      type: certType,
      certificateNumber: certNumber,
      issuingAuthority: 'APEDA / OneCert International India',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-14',
      ipfsCid: ipfsHash,
      status: 'VALID',
    };

    try {
      const newProd = await registerProduct({
        batchId,
        name,
        botanicalName,
        category,
        cultivationMethod,
        quantityKg,
        harvestDate,
        farmLocation,
        gpsCoordinates: { lat, lng },
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        farmerOrg: currentUser.organization || 'Vedic Agro Organic Cooperative',
        description,
        activeCompounds: activeCompounds.split(',').map(s => s.trim()).filter(Boolean),
        certificates: [cert],
        imageUrl: getBotanicalProductImage({ name, botanicalName, category }),
      });

      setIsSubmitting(false);
      setCreatedProduct(newProd);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('Registration failed:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Register Botanical Harvest"
      subtitle="5-step verification wizard to commit crop origin, GPS coordinates, and organic certificates to Hyperledger Fabric."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Interactive Progress Tab Stepper */}
        {!createdProduct && (
          <nav aria-label="Registration Steps" className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
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
                    id={`step-tab-${s.id}`}
                    aria-selected={isActive}
                    aria-current={isActive ? 'step' : undefined}
                    aria-disabled={!isAccessible}
                    onClick={() => handleTabClick(s.id)}
                    title={!isAccessible ? navCheck.reason : undefined}
                    className={`relative flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl transition-all duration-200 group text-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/40 font-bold cursor-default'
                        : isComplete
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100/80 hover:border-emerald-300 font-semibold cursor-pointer'
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
                            ? 'text-emerald-700 group-hover:scale-110'
                            : isAccessible
                            ? 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110'
                            : 'text-slate-300'
                        }`}
                      />
                      {/* Step Number / Check Badge / Lock */}
                      <span
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-emerald-800/90 text-emerald-100'
                            : isComplete
                            ? 'bg-emerald-200 text-emerald-900'
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

                    {/* Step Title: Full label on sm+, short label on mobile */}
                    <span className="text-[11px] sm:text-xs leading-tight tracking-tight hidden sm:inline truncate max-w-full">
                      {s.label}
                    </span>
                    <span className="text-[10px] leading-tight tracking-tight sm:hidden font-medium truncate max-w-full">
                      {s.shortLabel}
                    </span>

                    {/* Active Indicator Pip */}
                    {isActive && (
                      <span className="absolute -bottom-1 w-6 sm:w-8 h-1 bg-emerald-400 rounded-full shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Direct Tab Navigation Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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

        {/* Step 1: Botanical Details */}
        {step === 1 && !createdProduct && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Sprout size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 1: Botanical Information</h3>
                  <p className="text-xs text-slate-500">Provide official botanical taxonomy and harvest batch ID</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Common Commercial Name: *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Pure Organic Ashwagandha Root"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scientific Botanical Latin Name: *</label>
                  <input
                    type="text"
                    required
                    value={botanicalName}
                    onChange={e => setBotanicalName(e.target.value)}
                    placeholder="e.g. Withania somnifera"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category: *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="MEDICINAL_HERB">Medicinal Herb</option>
                    <option value="SPICE">Spice</option>
                    <option value="EXTRACT">Botanical Extract</option>
                    <option value="AROMATIC">Aromatic Plant</option>
                    <option value="TEA">Herbal Tea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Batch Number: *</label>
                  <input
                    type="text"
                    required
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Harvest Weight (kg): *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantityKg}
                    onChange={e => setQuantityKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Active Compounds:</label>
                  <input
                    type="text"
                    value={activeCompounds}
                    onChange={e => setActiveCompounds(e.target.value)}
                    placeholder="e.g. Withanolides 5%, Curcumin 8%"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Harvest Notes:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to Farm Origin</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 2: Farm Location & GPS */}
        {step === 2 && !createdProduct && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 2: Farm Location & Soil Telemetry</h3>
                  <p className="text-xs text-slate-500">Specify physical farm plot and exact GPS telemetry</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Farm Address / Plot Details: *</label>
                  <input
                    type="text"
                    required
                    value={farmLocation}
                    onChange={e => setFarmLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GPS Latitude (°N): *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={lat}
                      onChange={e => setLat(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GPS Longitude (°E): *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={lng}
                      onChange={e => setLng(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harvest Date: *</label>
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={e => setHarvestDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cultivation Protocol: *</label>
                    <select
                      value={cultivationMethod}
                      onChange={e => setCultivationMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="ORGANIC">Certified Organic</option>
                      <option value="BIODYNAMIC">Demeter Biodynamic</option>
                      <option value="WILD_CRAFTED">Wild-Crafted Sustainable</option>
                      <option value="HYDROPONIC">Controlled Hydroponic</option>
                      <option value="CONVENTIONAL">Conventional GAP</option>
                    </select>
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to Supply Partners</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Local Area Partners */}
        {step === 3 && !createdProduct && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 3: Supply Chain Partners (Local Selection)</h3>
                  <p className="text-xs text-slate-500">Discover and designate verified nearby processors, laboratories, and logistics providers</p>
                </div>
              </div>

              <LocalPartnerSelector
                farmerLat={lat}
                farmerLng={lng}
                onSelectionComplete={(selections) => setSelectedPartners(selections)}
              />
              <div className="flex justify-between pt-3 border-t border-slate-100">
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
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Continue to Certificates</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Certificates & IPFS */}
        {step === 4 && !createdProduct && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4: Certificates & IPFS Storage</h3>
                  <p className="text-xs text-slate-500">Upload accredited organic certificates and pin to IPFS</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Authority & Type: *</label>
                  <input
                    type="text"
                    required
                    value={certType}
                    onChange={e => setCertType(e.target.value)}
                    placeholder="e.g. India Organic (NPOP) / FSSAI Jaivik Bharat / AYUSH Premium"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate License Number: *</label>
                  <input
                    type="text"
                    required
                    value={certNumber}
                    onChange={e => setCertNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Simulated IPFS Drop Area */}
                <div className="p-6 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <UploadCloud size={20} />
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Organic Certificate PDF Attached
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    IPFS CID: {ipfsHash}
                  </div>
                  <span className="inline-block text-[10px] text-emerald-800 font-bold bg-emerald-200/80 px-2 py-0.5 rounded">
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Review & Commit On-Chain</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 5: Review and Commit to Blockchain */}
        {step === 5 && !createdProduct && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Blocks size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 5: Cryptographic Review & Commit</h3>
                  <p className="text-xs text-slate-500">Sign payload with Farmer node identity and commit to Hyperledger Fabric</p>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Botanical Product:</span>
                  <span className="font-bold text-slate-900">{name} ({botanicalName})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Batch ID:</span>
                  <span className="font-mono font-bold text-emerald-700">{batchId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Quantity & Cultivation:</span>
                  <span className="font-bold text-slate-800">{quantityKg} kg • {cultivationMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Farm GPS:</span>
                  <span className="font-mono text-slate-700">{lat}° N, {lng}° E</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-slate-500">Submitting Node:</span>
                  <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.organization})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IPFS Certificate Hash:</span>
                  <span className="font-mono text-indigo-700">{ipfsHash}</span>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBack}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: !isSubmitting ? 1.03 : 1, y: !isSubmitting ? -1 : 0 }}
                  whileTap={{ scale: !isSubmitting ? 0.96 : 1 }}
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Broadcasting to Hyperledger Fabric Channel...</span>
                    </>
                  ) : (
                    <>
                      <Blocks size={16} />
                      <span>Sign & Commit Crop on Blockchain</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Screen after Registration */}
        {createdProduct && (
          <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Block Committed Successfully
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Crop Registered on Blockchain
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Product ID: <span className="font-mono font-bold text-slate-800">{createdProduct.id}</span> • Batch #{createdProduct.batchId}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-5 text-left font-mono text-xs space-y-2">
              <div className="text-slate-500 text-xs uppercase font-extrabold tracking-wider">
                Blockchain Transaction Receipt:
              </div>
              <div className="text-emerald-800 font-bold break-all text-xs">
                TxID: {createdProduct?.blockchainTransactions?.[0]?.txId || createdProduct?.id || '0x' + Math.random().toString(16).substring(2, 66)}
              </div>
              <div className="text-slate-600 text-xs">
                Endorsing Peers: peer0.farmer.florachain.org, peer0.admin.florachain.org
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate(`/verify/${createdProduct.id}`)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Full Verification View</span>
                <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => navigate('/farmer/dashboard')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-xs"
              >
                Return to Farmer Dashboard
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
