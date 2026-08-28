import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sprout,
  ShieldCheck,
  Building,
  Mail,
  User,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cog,
  FlaskConical,
  Truck,
  Store,
  Award,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [extraDetail, setExtraDetail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions: { role: UserRole; label: string; icon: React.ElementType; color: string; placeholder: string; extraLabel: string }[] = [
    { role: 'FARMER', label: 'Organic Farmer', icon: Sprout, color: 'text-emerald-800 bg-emerald-50 border-emerald-300', placeholder: 'e.g. Vedic Agro Farm Cluster', extraLabel: 'Farm Coordinates / Land Parcel ID' },
    { role: 'PROCESSOR', label: 'Bio Processor', icon: Cog, color: 'text-purple-800 bg-purple-50 border-purple-300', placeholder: 'e.g. PhytoExtracts Bio-Refining Ltd', extraLabel: 'Extraction Facility Equipment (e.g. SFE-CO2)' },
    { role: 'LABORATORY', label: 'Testing Lab', icon: FlaskConical, color: 'text-indigo-800 bg-indigo-50 border-indigo-300', placeholder: 'e.g. Eurofins AgriBio Analytics Lab', extraLabel: 'Accreditation ID (e.g. ISO/IEC 17025)' },
    { role: 'DISTRIBUTOR', label: 'Distributor', icon: Truck, color: 'text-sky-800 bg-sky-50 border-sky-300', placeholder: 'e.g. TransGlobal Cold-Chain Logistics', extraLabel: 'Refrigerated Vehicle Fleet Numbers' },
    { role: 'RETAILER', label: 'Retailer', icon: Store, color: 'text-teal-800 bg-teal-50 border-teal-300', placeholder: 'e.g. Pure Botanical Apothecary London', extraLabel: 'Physical Storefront Address & Bay ID' },
  ];

  const currentRoleOpt = roleOptions.find(r => r.role === role) || roleOptions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !organization) return;
    setIsLoading(true);

    const certList = certifications.split(',').map(s => s.trim()).filter(Boolean);
    if (extraDetail.trim()) {
      certList.push(extraDetail.trim());
    }

    try {
      await registerUser({
        name,
        email,
        role,
        organization,
        location,
        certifications: certList,
      }, password);
      setIsSuccess(true);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-900/10">
            <Sprout size={26} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Register Stakeholder Node
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Apply for cryptographic membership on the FloraChain Botanical Traceability Network
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Your <strong>{role}</strong> node profile has been queued for verification. Consortium Administrators review all botanical accreditation credentials before activating smart contract signing privileges.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <button
                onClick={() => {
                  switchRole(role);
                  navigate(`/${role.toLowerCase()}/dashboard`);
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                Open Demo Dashboard ({role})
              </button>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Radio Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Select Stakeholder Role & Network Tier:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.role;
                  return (
                    <button
                      type="button"
                      key={opt.role}
                      onClick={() => setRole(opt.role)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={16} className={isSelected ? 'text-emerald-700' : 'text-slate-500'} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                      </div>
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name / Lead Official</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@vedicfarms.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Organization and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Organization / Cluster Entity</label>
                <input
                  type="text"
                  required
                  placeholder={currentRoleOpt.placeholder}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Physical Region / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhya Pradesh, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Certifications and Role-Specific Detail */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Certifications / Standards Held (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. NPOP Organic, USDA-NOP, GMP-Certified, ISO/IEC 17025"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{currentRoleOpt.extraLabel}</label>
              <input
                type="text"
                placeholder="Enter node specific verification details..."
                value={extraDetail}
                onChange={(e) => setExtraDetail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Account Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Submit Node Accreditation Application</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-600 hover:text-emerald-800 font-bold">
                Already registered? <span className="text-emerald-700 underline">Sign In instead</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
