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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4]/60 via-[#F0FDF4]/40 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <Card className="max-w-md w-full bg-white border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header with botanical accent */}
        <div className="bg-[#0F766E] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                FloraChain
              </h1>
              <p className="text-[11px] text-emerald-200">Blockchain Botanical Traceability</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              Enter credentials to access your authorized stakeholder node
            </CardDescription>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant="botanical">Botanical</Badge>
              <Badge variant="outline">Secure</Badge>
              <Badge variant="secondary">Verified</Badge>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle size={18} className="shrink-0" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stakeholder Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Stakeholder Role</span>
                <span className="text-[11px] font-semibold text-[#0F766E]">Select Active Role</span>
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:bg-white focus:ring-2 focus:ring-[#0F766E]/20 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
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

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email address"
                  className="pl-10"
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
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="pl-10 pr-11"
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
            <Button
              type="submit"
              disabled={isLoading}
              variant="botanical"
              className="w-full"
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
            </Button>
          </form>

          {/* Footer Navigation Links */}
          <div className="space-y-3 pt-4 border-t border-slate-200 text-center text-xs">
            <p className="text-slate-600">
              New supply chain participant?{' '}
              <Link to="/register" className="text-[#0F766E] font-bold hover:underline">
                Register Stakeholder Node
              </Link>
            </p>

            <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
              <Link
                to="/home"
                className="hover:text-[#0F766E] font-semibold transition-colors"
              >
                ← Back to Overview
              </Link>
              <span>•</span>
              <Link
                to="/verify"
                className="inline-flex items-center gap-1 hover:text-[#0F766E] font-semibold transition-colors"
              >
                <ShieldCheck size={14} className="text-[#0F766E]" />
                <span>Public Verification</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
