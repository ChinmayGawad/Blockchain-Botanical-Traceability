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
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [certifications, setCertifications] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !organization) return;

    registerUser({
      name,
      email,
      role,
      organization,
      location,
      certifications: certifications.split(',').map(s => s.trim()).filter(Boolean),
    });

    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sprout size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Register Stakeholder Node
          </h2>
          <p className="text-xs text-slate-400">
            Apply for cryptographic membership on the FloraChain Hyperledger Fabric channel
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Application Submitted</h3>
            <p className="text-xs text-slate-400">
              Your application has been registered with status <strong className="text-amber-400">PENDING_APPROVAL</strong>. Consortium Admin will audit your certificates.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  switchRole(role);
                  navigate(`/${role.toLowerCase()}/dashboard`);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Access Portal (Read-Only Preview)
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kulkarni"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Business Email: *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ramesh@organiccoop.org"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stakeholder Node Role: *
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="FARMER">Organic Botanical Farmer / Cooperative</option>
                <option value="PROCESSOR">Bio-Refining / Extraction Facility</option>
                <option value="LABORATORY">Accredited Quality Laboratory</option>
                <option value="DISTRIBUTOR">Cold-Chain Distribution Network</option>
                <option value="RETAILER">Apothecary / Retailer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization / Company Name: *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="e.g. Malabar Organic Herbs Producer Alliance"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Geographical Location:
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Wayanad, Kerala, India"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Accreditations & Certificates (Comma Separated):
              </label>
              <input
                type="text"
                value={certifications}
                onChange={e => setCertifications(e.target.value)}
                placeholder="e.g. USDA Organic, NPOP, ISO 17025"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>Submit Node Application</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400">
          Already authorized?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In to Console
          </Link>
        </div>
      </div>
    </div>
  );
};
