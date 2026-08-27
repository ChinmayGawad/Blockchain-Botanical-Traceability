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
    { role: 'FARMER', label: 'Organic Farmer', icon: Sprout, color: 'text-emerald-400', placeholder: 'e.g. Vedic Agro Farm Cluster', extraLabel: 'Farm Coordinates / Land Parcel ID' },
    { role: 'PROCESSOR', label: 'Bio Processor', icon: Cog, color: 'text-purple-400', placeholder: 'e.g. PhytoExtracts Bio-Refining Ltd', extraLabel: 'Extraction Facility Equipment (e.g. SFE-CO2)' },
    { role: 'LABORATORY', label: 'Testing Lab', icon: FlaskConical, color: 'text-indigo-400', placeholder: 'e.g. Eurofins AgriBio Analytics Lab', extraLabel: 'Accreditation ID (e.g. ISO/IEC 17025)' },
    { role: 'DISTRIBUTOR', label: 'Distributor', icon: Truck, color: 'text-sky-400', placeholder: 'e.g. TransGlobal Cold-Chain Logistics', extraLabel: 'Refrigerated Vehicle Fleet Numbers' },
    { role: 'RETAILER', label: 'Retailer', icon: Store, color: 'text-emerald-300', placeholder: 'e.g. Pure Botanical Apothecary London', extraLabel: 'Physical Storefront Address & Bay ID' },
    { role: 'CONSUMER', label: 'Consumer', icon: User, color: 'text-amber-400', placeholder: 'Personal / Consumer Account', extraLabel: 'City / Region' },
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
    <div className="min-h-[90vh] bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sprout size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Register Stakeholder Node
          </h2>
          <p className="text-xs text-slate-400">
            Apply for cryptographic membership on the FloraChain Botanical Traceability Network
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-8 space-y-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Application Submitted Successfully</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
                Your <strong>{role}</strong> node profile has been queued for verification. Consortium Administrators review all botanical accreditation credentials before activating smart contract signing privileges.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center">
              <button
                onClick={() => {
                  switchRole(role);
                  navigate(`/${role.toLowerCase()}/dashboard`);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Access Portal Preview</span>
                <ArrowRight size={14} />
              </button>
              <Link
                to="/login"
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Stakeholder Role Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Select Your Supply Chain Role: *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => {
                        setRole(opt.role);
                        if (opt.role === 'CONSUMER') {
                          setOrganization('Public Consumer Portal');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={opt.color} />
                      <span className="text-xs font-bold truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name / Contact Person: *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Patel"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Official Email: *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@vedicfarms.org"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Organization / Entity Name: *
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder={currentRoleOpt.placeholder}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Facility / Farm Location: *
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Neemuch, Madhya Pradesh, India"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {currentRoleOpt.extraLabel}
                </label>
                <input
                  type="text"
                  value={extraDetail}
                  onChange={e => setExtraDetail(e.target.value)}
                  placeholder="Additional node verification details"
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Certifications (Comma-separated):
                </label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={certifications}
                    onChange={e => setCertifications(e.target.value)}
                    placeholder="USDA Organic, GMP, ISO 22000"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 text-white text-xs rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit {currentRoleOpt.label} Registration Application</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
              Already registered on the consortium?{' '}
              <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign In to Portal
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
