import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sprout,
  ShieldCheck,
  Cog,
  FlaskConical,
  Truck,
  Store,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Verhoeff algorithm logic for Aadhaar Validation (keep as-is)
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateAadhaar(aadhaar: string) {
  if (aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) return false;
  let c = 0;
  let invertedArray = aadhaar.split('').reverse().map(Number);
  for (let i = 0; i < invertedArray.length; i++) {
    c = d[c][p[i % 8][invertedArray[i]]];
  }
  return c === 0;
}

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
  
  // Aadhaar specific state
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions: { role: UserRole; label: string; icon: React.ElementType; color: string; placeholder: string; extraLabel: string }[] = [
    { role: 'FARMER', label: 'Organic Farmer', icon: Sprout, color: 'text-emerald-800 bg-emerald-50 border-emerald-300', placeholder: 'e.g. Vedic Agro Farm Cluster', extraLabel: 'Farm Coordinates / Land Parcel ID' },
    { role: 'PROCESSOR', label: 'Bio Processor', icon: Cog, color: 'text-purple-800 bg-purple-50 border-purple-300', placeholder: 'e.g. PhytoExtracts Bio-Refining Ltd', extraLabel: 'Extraction Facility Equipment (e.g. SFE-CO2)' },
    { role: 'LABORATORY', label: 'Testing Lab', icon: FlaskConical, color: 'text-indigo-800 bg-indigo-50 border-indigo-300', placeholder: 'e.g. Eurofins AgriBio Analytics Lab', extraLabel: 'Accreditation ID (e.g. ISO/IEC 17025)' },
    { role: 'DISTRIBUTOR', label: 'Distributor', icon: Truck, color: 'text-sky-800 bg-sky-50 border-sky-300', placeholder: 'e.g. TransGlobal Cold-Chain Logistics', extraLabel: 'Refrigerated Vehicle Fleet Numbers' },
    { role: 'RETAILER', label: 'Retailer', icon: Store, color: 'text-teal-800 bg-teal-50 border-teal-300', placeholder: 'e.g. Arogya Ayurvedic Wellness Stores, Bengaluru', extraLabel: 'Physical Storefront Address & Bay ID' },
  ];

  const currentRoleOpt = roleOptions.find(r => r.role === role) || roleOptions[0];

  const initiateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !organization) return;
    
    if (aadhaar) {
      if (!validateAadhaar(aadhaar)) {
        setAadhaarError('Invalid Aadhaar Number. Please check the 12 digits.');
        return;
      }
      setAadhaarError('');
      setShowOtpScreen(true);
    } else {
      completeRegistration();
    }
  };

  const handleOtpVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setOtpError('Invalid OTP. For sandbox testing, use 123456.');
      return;
    }
    setOtpError('');
    completeRegistration();
  };

  const completeRegistration = async () => {
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
        aadhaarNumber: aadhaar || undefined
      }, password);
      setIsSuccess(true);
      setShowOtpScreen(false);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4]/60 via-[#F0FDF4]/40 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <Card className="max-w-2xl w-full bg-white border-slate-200/90 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F766E] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sprout size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Register Stakeholder Node
              </h2>
              <p className="text-[11px] text-emerald-200">Apply for cryptographic membership</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-2">
              <Badge variant="botanical">Verified Network</Badge>
              <Badge variant="outline">Cryptographic Membership</Badge>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
              Join the FloraChain Network
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              Apply for cryptographic membership on the FloraChain Botanical Traceability Network
            </CardDescription>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 space-y-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Application Submitted Successfully</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Your <strong>{role}</strong> node profile has been queued for verification. {aadhaar ? "Your Aadhaar identity has been e-verified." : ""}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <Button
                  onClick={() => {
                    switchRole(role);
                    navigate(`/${role.toLowerCase()}/dashboard`);
                  }}
                  variant="botanical"
                >
                  Open Demo Dashboard ({role})
                </Button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold rounded-xl text-xs transition-colors min-h-[44px]"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : showOtpScreen ? (
            <form onSubmit={handleOtpVerification} className="space-y-4 max-w-sm mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="text-center space-y-2 mb-4">
                <Fingerprint className="mx-auto text-[#0F766E] size={32}" />
                <CardTitle className="text-lg font-bold">Aadhaar e-KYC Verification</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  An OTP has been sent to the mobile number registered with Aadhaar ending in {aadhaar.slice(-4)}.
                </CardDescription>
                <Alert variant="warning" className="text-left">
                  <AlertDescription className="text-[10px]">Sandbox Mode: Use OTP 123456</AlertDescription>
                </Alert>
              </div>
              
              <div className="space-y-1">
                <Input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full text-center tracking-widest bg-white border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-lg font-medium"
                />
                {otpError && <p className="text-xs text-red-500 font-bold text-center mt-1">{otpError}</p>}
              </div>

              <Button type="submit" disabled={isLoading} variant="botanical" className="w-full">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Verify OTP & Register</span>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowOtpScreen(false)}
                variant="ghost"
                className="w-full text-slate-500"
              >
                Cancel
              </Button>
            </form>
          ) : (
            <form onSubmit={initiateRegistration} className="space-y-4">
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
                            ? 'bg-emerald-50 border-[#0F766E] ring-2 ring-[#0F766E]/20 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon size={16} className={isSelected ? 'text-[#0F766E]' : 'text-slate-500'} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>}
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
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Official Email</label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. rajesh@vedicfarms.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Organization and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Organization / Cluster Entity</label>
                  <Input
                    type="text"
                    required
                    placeholder={currentRoleOpt.placeholder}
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Physical Region / Location</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Madhya Pradesh, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Aadhaar Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Fingerprint size={14} className="text-slate-500" />
                  Aadhaar Number (Optional / e-KYC Verification)
                </label>
                <Input
                  type="text"
                  maxLength={12}
                  placeholder="12-digit Aadhaar Number"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                />
                {aadhaarError && <p className="text-xs text-red-500 font-bold mt-1">{aadhaarError}</p>}
              </div>

              {/* Certifications and Role-Specific Detail */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Certifications / Standards Held (Comma separated)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. India Organic (NPOP), FSSAI Jaivik Bharat"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{currentRoleOpt.extraLabel}</label>
                <Input
                  type="text"
                  placeholder="Enter node specific verification details..."
                  value={extraDetail}
                  onChange={(e) => setExtraDetail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Password</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

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
                    <ShieldCheck size={16} />
                    <span>{aadhaar ? 'Verify via OTP & Submit' : 'Submit Node Accreditation Application'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

              <div className="text-center pt-2 space-y-2">
                <div>
                  <Link to="/login" className="text-xs text-slate-600 hover:text-[#0F766E] font-bold">
                    Already registered? <span className="text-[#0F766E] underline">Sign In instead</span>
                  </Link>
                </div>
                <div>
                  <Link to="/home" className="text-xs text-slate-500 hover:text-[#0F766E] font-medium">
                    ← Back to Overview
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
