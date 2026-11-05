import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../types';
import { ShieldAlert, ArrowRight, AlertTriangle, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { t } = useTranslation();
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
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={32} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('access.pendingTitle', 'Account Pending Verification')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {t('access.pendingBody', 'Your registered <strong>{{role}}</strong> account (<strong>{{email}}</strong>) is currently awaiting authorization by the Consortium Admin.', { role: currentUser.role, email: currentUser.email })}
            </p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 text-left space-y-1">
            <p className="font-semibold">{t('access.securityNote', 'Security Note:')}</p>
            <p>{t('access.securityNoteBody', 'Cryptographic smart contract operations are restricted until your node credentials are verified.')}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>{t('access.signOutSwitch', 'Sign Out & Switch Account')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Strict Role Access Control: If user's role is not allowed for this route
  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('access.restrictedTitle', 'Access Restricted')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {t('access.loggedInAs', 'You are logged in as <strong>{{role}}</strong> ({{name}}).', { role, name: currentUser.name })}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
              {t('access.onlyPermission', 'You only have permission to access the <strong>{{role}} Portal</strong>.', { role })}
            </p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{t('access.isolationTitle', 'Multi-Tenant Isolation Active')}</p>
            <p>{t('access.isolationBody', 'Each supply chain participant only has access to their authorized operational dashboard.')}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={`/${role.toLowerCase()}/dashboard`}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{t('access.goToDashboard', 'Go to My {{role}} Dashboard', { role })}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} aria-hidden="true" />
              <span>{t('access.signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
