import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, Lock, ArrowRight, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, role, isAuthenticated, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated and trying to access an authorized stakeholder portal
  if (!isAuthenticated && !allowedRoles.includes('CONSUMER')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user account is pending approval
  if (currentUser.status === 'PENDING_APPROVAL' && !allowedRoles.includes('ADMIN')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Account Pending Verification</h2>
            <p className="text-sm text-slate-600 mt-2">
              Your registered <strong>{currentUser.role}</strong> account (<strong>{currentUser.email}</strong>) is awaiting cryptographic accreditation by the Consortium Admin.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 text-left space-y-1">
            <p className="font-semibold">What happens next?</p>
            <p>1. The Consortium Administrator verifies your organization documents & certificates.</p>
            <p>2. Once approved, your node address will be granted on-chain transaction permissions.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/admin/approvals"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>Go to Admin Approvals (Demo Sandbox)</span>
            </Link>
            <button
              onClick={() => {
                switchRole('ADMIN');
                navigate('/admin/dashboard');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors"
            >
              Switch to Admin Persona
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user role is not authorized for this specific portal
  if (!allowedRoles.includes(role)) {
    const requiredRole = allowedRoles[0];
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600 mt-2">
              You are currently authenticated as <strong>{role}</strong> ({currentUser.name}). This portal requires <strong>{allowedRoles.join(' or ')}</strong> privileges.
            </p>
          </div>
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
            <p className="font-semibold text-slate-800">RBAC Enforcement Active</p>
            <p>Cryptographic smart contract functions on this portal require private key signatures from an accredited <strong>{requiredRole}</strong> account.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                switchRole(requiredRole);
                navigate(`/${requiredRole.toLowerCase()}/dashboard`);
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Switch to {requiredRole} Account</span>
            </button>
            <Link
              to={`/${role.toLowerCase()}/dashboard`}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Return to My Dashboard ({role})</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
