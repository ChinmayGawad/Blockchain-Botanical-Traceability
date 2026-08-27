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
} from 'lucide-react';

interface RolePersona {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  org: string;
  icon: React.ElementType;
  badgeColor: string;
  dashboardPath: string;
  isPending?: boolean;
}

const PERSONAS: RolePersona[] = [
  {
    role: 'ADMIN',
    label: 'Consortium Admin',
    name: 'Dr. Evelyn Vance',
    email: 'admin@florachain.org',
    org: 'Botanical Traceability Consortium',
    icon: ShieldCheck,
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
    dashboardPath: '/admin/dashboard',
  },
  {
    role: 'FARMER',
    label: 'Organic Farmer',
    name: 'Rajesh Patel',
    email: 'rajesh@vedicfarms.org',
    org: 'Vedic Agro Organic Cooperative',
    icon: Sprout,
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
    dashboardPath: '/farmer/dashboard',
  },
  {
    role: 'PROCESSOR',
    label: 'Bio Processor',
    name: 'Marcus Thorne',
    email: 'marcus@phytoextracts.com',
    org: 'PhytoExtracts Bio-Refining Ltd',
    icon: Cog,
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/80',
    dashboardPath: '/processor/dashboard',
  },
  {
    role: 'LABORATORY',
    label: 'Quality Testing Lab',
    name: 'Dr. Ananya Sharma',
    email: 'ananya@agrilabs.ch',
    org: 'Eurofins AgriBio Analytics Lab',
    icon: FlaskConical,
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/80',
    dashboardPath: '/laboratory/dashboard',
  },
  {
    role: 'DISTRIBUTOR',
    label: 'Cold-Chain Logistics',
    name: 'Klaus Lindner',
    email: 'klaus@coldchainlogistics.de',
    org: 'TransGlobal Logistics Hub',
    icon: Truck,
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/80',
    dashboardPath: '/distributor/dashboard',
  },
  {
    role: 'RETAILER',
    label: 'Wellness Retailer',
    name: 'Sophia Laurent',
    email: 'sophia@pureapothecary.co.uk',
    org: 'Pure Botanical Apothecary London',
    icon: Store,
    badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80',
    dashboardPath: '/retailer/dashboard',
  },
  {
    role: 'FARMER',
    label: 'Pending Approval User',
    name: 'Kavita Sundaram',
    email: 'kavita@nilgiricoop.in',
    org: 'Nilgiri Mountain Herbs (Pending)',
    icon: Clock,
    badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/80',
    dashboardPath: '/farmer/dashboard',
    isPending: true,
  },
];

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPersona, setSelectedPersona] = useState<RolePersona>(PERSONAS[0]);
  const [email, setEmail] = useState('admin@florachain.org');
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
      setErrorMessage('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickLogin = (persona: RolePersona) => {
    switchRole(persona.role);
    if (persona.role === 'CONSUMER') {
      navigate('/');
    } else {
      navigate(persona.dashboardPath);
    }
  };

  return (
    <div className="min-h-[90vh] bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Left Column: Quick Role Persona Selector */}
        <div className="lg:col-span-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
              <Sparkles size={12} />
              <span>Multi-Role Access Control</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Select Stakeholder Persona</h3>
            <p className="text-xs text-slate-400">
              Click any role to load demo credentials or launch direct sandbox session:
            </p>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPersona.email === p.email;
              return (
                <div
                  key={p.email}
                  onClick={() => selectPersona(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/80 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${p.badgeColor}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        {p.isPending && (
                          <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.2 rounded font-mono">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{p.org}</p>
                      <p className="text-[10px] text-emerald-400/90 font-mono">{p.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handle1ClickLogin(p);
                    }}
                    title="1-Click Launch"
                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 transition-colors shrink-0"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/verify"
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Users size={14} className="text-emerald-400" />
              <span>Continue as Public Consumer (No Login Required)</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Active Credentials Login Form */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-lg mx-auto lg:mx-0">
              <Sprout size={22} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sign In to <span className="text-emerald-400">FloraChain</span>
            </h2>
            <p className="text-xs text-slate-400">
              Selected Role: <strong className="text-emerald-400">{selectedPersona.label}</strong> ({selectedPersona.role})
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <span className="text-[11px] text-slate-500 font-mono">Demo: password123</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate as {selectedPersona.label}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              New botanical supply chain participant?{' '}
              <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
                Register On-Chain Node
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
