import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, Lock, ArrowRight, UserCheck, AlertTriangle, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. If not authenticated, immediately redirect to login
  if (!isAuthenticated && !allowedRoles.includes('CONSUMER')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If user account is pending admin approval
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
              Your registered <strong>{currentUser.role}</strong> account (<strong>{currentUser.email}</strong>) is currently awaiting authorization by the Consortium Admin.
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 text-left space-y-1">
            <p className="font-semibold">Security Note:</p>
            <p>Cryptographic smart contract operations are restricted until your node credentials are verified.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out & Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Strict Role Access Control: If user's role is not allowed for this route
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600 mt-2">
              You are logged in as <strong>{role}</strong> ({currentUser.name}).
            </p>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              You only have permission to access the <strong>{role} Portal</strong>.
            </p>
          </div>
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
            <p className="font-semibold text-slate-800">Multi-Tenant Isolation Active</p>
            <p>Each supply chain participant only has access to their authorized operational dashboard.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={`/${role.toLowerCase()}/dashboard`}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Go to My {role} Dashboard</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
