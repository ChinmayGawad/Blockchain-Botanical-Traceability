import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sprout,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
  FlaskConical,
  Truck,
  Store,
  Cog,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  KeyRound,
} from 'lucide-react';

interface RolePersona {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  org: string;
  icon: React.ElementType;
  themeColor: string;
  badgeBg: string;
  textColor: string;
  dashboardPath: string;
  isPending?: boolean;
}

const PERSONAS: RolePersona[] = [
  {
    role: 'ADMIN',
    label: 'Consortium Admin',
    name: 'Dr. Evelyn Vance',
    email: 'admin@florachain.org',
    org: 'Botanical Consortium Governance',
    icon: ShieldCheck,
    themeColor: 'border-slate-800',
    badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
    textColor: 'text-slate-900',
    dashboardPath: '/admin/dashboard',
  },
  {
    role: 'FARMER',
    label: 'Organic Farmer',
    name: 'Rajesh Patel',
    email: 'rajesh@vedicfarms.org',
    org: 'Vedic Agro Organic Cooperative',
    icon: Sprout,
    themeColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    textColor: 'text-emerald-800',
    dashboardPath: '/farmer/dashboard',
  },
  {
    role: 'PROCESSOR',
    label: 'Bio Processor',
    name: 'Marcus Thorne',
    email: 'marcus@phytoextracts.com',
    org: 'PhytoExtracts Bio-Refining Ltd',
    icon: Cog,
    themeColor: 'border-purple-500',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    textColor: 'text-purple-800',
    dashboardPath: '/processor/dashboard',
  },
  {
    role: 'LABORATORY',
    label: 'Quality Testing Lab',
    name: 'Dr. Ananya Sharma',
    email: 'ananya@agrilabs.ch',
    org: 'Eurofins AgriBio Analytics Lab',
    icon: FlaskConical,
    themeColor: 'border-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    textColor: 'text-indigo-800',
    dashboardPath: '/laboratory/dashboard',
  },
  {
    role: 'DISTRIBUTOR',
    label: 'Cold-Chain Logistics',
    name: 'Klaus Lindner',
    email: 'klaus@coldchainlogistics.de',
    org: 'TransGlobal Logistics Hub',
    icon: Truck,
    themeColor: 'border-sky-500',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    textColor: 'text-sky-800',
    dashboardPath: '/distributor/dashboard',
  },
  {
    role: 'RETAILER',
    label: 'Wellness Retailer',
    name: 'Sophia Laurent',
    email: 'sophia@pureapothecary.co.uk',
    org: 'Pure Botanical Apothecary London',
    icon: Store,
    themeColor: 'border-emerald-600',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    textColor: 'text-teal-800',
    dashboardPath: '/retailer/dashboard',
  },
  {
    role: 'FARMER',
    label: 'Pending Approval User',
    name: 'Kavita Sundaram',
    email: 'kavita@nilgiricoop.in',
    org: 'Nilgiri Mountain Herbs (Unverified)',
    icon: Clock,
    themeColor: 'border-rose-400',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    textColor: 'text-rose-800',
    dashboardPath: '/farmer/dashboard',
    isPending: true,
  },
];

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPersona, setSelectedPersona] = useState<RolePersona>(PERSONAS[1]); // Default to Farmer
  const [email, setEmail] = useState('rajesh@vedicfarms.org');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = (location.state as any)?.from?.pathname;

  const selectPersona = (persona: RolePersona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword('password123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const success = await login(email, selectedPersona.role, password);
      if (success) {
        if (fromPath) {
          navigate(fromPath);
        } else {
          navigate(selectedPersona.dashboardPath);
        }
      } else {
        setErrorMessage('Invalid credentials or account is suspended.');
      }
    } catch {
      setErrorMessage('Login failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickLogin = (persona: RolePersona) => {
    switchRole(persona.role);
    if (persona.role === 'CONSUMER') {
      navigate('/verify');
    } else {
      navigate(persona.dashboardPath);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Stakeholder Personas & 1-Click Sandbox */}
        <div className="lg:col-span-6 bg-slate-50/80 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <Sparkles size={13} className="text-emerald-700" />
              <span>Multi-Role Access Control</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Select Stakeholder Role
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click any role to load demo credentials or launch directly into their authorized portal:
            </p>
          </div>

          {/* Persona Card List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPersona.email === p.email;
              return (
                <div
                  key={p.email}
                  onClick={() => selectPersona(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${p.badgeBg}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">{p.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeBg}`}>
                          {p.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{p.org}</p>
                      <p className="text-xs text-emerald-700 font-mono font-medium">{p.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handle1ClickLogin(p);
                    }}
                    title="1-Click Launch into Portal"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Launch</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200">
            <Link
              to="/verify"
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Users size={15} className="text-emerald-700" />
              <span>Public Consumer Verification (No Login Required)</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10">
              <Sprout size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sign In to <span className="text-emerald-700">FloraChain</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Authenticating as <strong className="text-emerald-800">{selectedPersona.label}</strong> ({selectedPersona.role})
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Demo: password123
                </span>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Authenticate as {selectedPersona.label}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              New supply chain participant?{' '}
              <Link to="/register" className="text-emerald-700 font-bold hover:underline">
                Register New Stakeholder Node
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
