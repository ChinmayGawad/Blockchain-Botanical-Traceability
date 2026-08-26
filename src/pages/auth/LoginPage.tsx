import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@florachain.org');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email);
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    if (role === 'CONSUMER') {
      navigate('/');
    } else {
      navigate(`/${role.toLowerCase()}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sprout size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Flora<span className="text-emerald-400">Chain</span> Portal Login
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your authorized Hyperledger Fabric node console
          </p>
        </div>

        {/* Quick 1-Click Role Sandbox Selection */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 justify-center">
            <Sparkles size={12} className="text-amber-400" />
            <span>Instant Demo Role Switch:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Consortium Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('FARMER')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <Sprout size={16} className="text-emerald-400 shrink-0" />
              <span>Organic Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('PROCESSOR')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <Cog size={16} className="text-purple-400 shrink-0" />
              <span>Bio Processor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('LABORATORY')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <FlaskConical size={16} className="text-indigo-400 shrink-0" />
              <span>QA Testing Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('DISTRIBUTOR')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <Truck size={16} className="text-sky-400 shrink-0" />
              <span>Cold Distributor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('RETAILER')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-2 text-left"
            >
              <Store size={16} className="text-teal-400 shrink-0" />
              <span>Retail Apothecary</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-950 px-3 text-[11px] text-slate-500 uppercase">
            or email credentials
          </span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Registered Node Email:
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password:
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>Sign In to Portal</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Want to join the consortium?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register your Node
          </Link>
        </div>
      </div>
    </div>
  );
};
