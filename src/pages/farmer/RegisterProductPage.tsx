import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CultivationMethod, Certificate } from '../../types';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBotanicalProductImage } from '../../utils/imageUtils';

export const RegisterProductPage: React.FC = () => {
  const { registerProduct } = useBlockchain();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
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
  const [certType, setCertType] = useState('USDA Organic & NPOP India');
  const [certNumber, setCertNumber] = useState(`ORG-IND-2024-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ipfsHash, setIpfsHash] = useState('QmShatavariCert' + Math.random().toString(36).substring(2, 12));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    const cert: Certificate = {
      id: `CERT-${Date.now()}`,
      type: certType,
      certificateNumber: certNumber,
      issuingAuthority: 'OneCert International / APEDA',
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
      subtitle="4-step verification wizard to commit crop origin, GPS coordinates, and organic certificates to Hyperledger Fabric."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Stepper Bar */}
        {!createdProduct && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div
                className={`p-2 rounded-xl transition-colors ${
                  step >= 1 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-400'
                }`}
              >
                1. Crop Specs
              </div>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  step >= 2 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-400'
                }`}
              >
                2. Farm & GPS
              </div>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  step >= 3 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-400'
                }`}
              >
                3. Certificates
              </div>
              <div
                className={`p-2 rounded-xl transition-colors ${
                  step >= 4 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-400'
                }`}
              >
                4. Commit On-Chain
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Botanical Details */}
        {step === 1 && !createdProduct && (
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
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Continue to Farm Origin</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Farm Location & GPS */}
        {step === 2 && !createdProduct && (
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
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Continue to Certificates</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Certificates & IPFS */}
        {step === 3 && !createdProduct && (
          <form onSubmit={handleNext} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <FileCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 3: Certificates & IPFS Storage</h3>
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
                  placeholder="e.g. USDA Organic / NPOP / FairWild"
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
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Review & Commit On-Chain</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Review and Commit to Blockchain */}
        {step === 4 && !createdProduct && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Blocks size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 4: Cryptographic Review & Commit</h3>
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
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBack}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-lg"
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
              </button>
            </div>
          </div>
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
                TxID: {createdProduct.blockchainTransactions[0]?.txId}
              </div>
              <div className="text-slate-600 text-xs">
                Endorsing Peers: peer0.farmer.florachain.org, peer0.admin.florachain.org
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/verify/${createdProduct.id}`)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>View Full Verification View</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/farmer/dashboard')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Return to Farmer Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
