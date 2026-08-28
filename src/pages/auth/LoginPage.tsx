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
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('rajesh@vedicfarms.org');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = (location.state as any)?.from?.pathname;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const matchedUser = users.find(u => u.role === newRole);
    if (matchedUser) {
      setEmail(matchedUser.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const success = await login(email, role, password);
      if (success) {
        if (fromPath) {
          navigate(fromPath);
        } else if (role === 'CONSUMER') {
          navigate('/home');
        } else {
          navigate(`/${role.toLowerCase()}/dashboard`);
        }
      } else {
        setErrorMessage('Invalid credentials or account is pending admin approval.');
      }
    } catch {
      setErrorMessage('Login failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-900/10">
            <Sprout size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to <span className="text-emerald-700">FloraChain</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enter credentials to access your authorized stakeholder node
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
          {/* Stakeholder Role Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Stakeholder Role</span>
              <span className="text-[11px] font-semibold text-emerald-700">Select Active Role</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="FARMER">🌾 Organic Farmer (Rajesh Patel)</option>
                <option value="PROCESSOR">⚙️ Bio Processor (Marcus Thorne)</option>
                <option value="LABORATORY">🧪 Quality Testing Lab (Dr. Ananya)</option>
                <option value="DISTRIBUTOR">🚚 Cold-Chain Logistics (Klaus Lindner)</option>
                <option value="RETAILER">🏪 Wellness Retailer (Sophia Laurent)</option>
                <option value="ADMIN">🛡️ Consortium Admin (Dr. Evelyn Vance)</option>
                <option value="CONSUMER">👤 Public Consumer</option>
              </select>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Demo: password123
              </span>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={16} />
                <span>Sign In as {role}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div className="space-y-3 pt-4 border-t border-slate-200 text-center text-xs">
          <p className="text-slate-600">
            New supply chain participant?{' '}
            <Link to="/register" className="text-emerald-700 font-bold hover:underline">
              Register Stakeholder Node
            </Link>
          </p>

          <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
            <Link
              to="/home"
              className="hover:text-emerald-700 font-semibold transition-colors"
            >
              ← Back to Overview
            </Link>
            <span>•</span>
            <Link
              to="/verify"
              className="inline-flex items-center gap-1 hover:text-emerald-700 font-semibold transition-colors"
            >
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Public Verification</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
