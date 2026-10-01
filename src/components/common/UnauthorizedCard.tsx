import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { UserRole } from '../../types';

interface UnauthorizedCardProps {
  currentRole: UserRole | string;
  requiredRole: UserRole | string;
  title?: string;
  description?: string;
  returnPath?: string;
}

export const UnauthorizedCard: React.FC<UnauthorizedCardProps> = ({
  currentRole,
  requiredRole,
  title = 'Access Restricted: Role Authorization Required',
  description,
  returnPath,
}) => {
  const navigate = useNavigate();

  const getDefaultReturnPath = (role: string): string => {
    switch (role) {
      case 'FARMER':
        return '/farmer/products';
      case 'PROCESSOR':
        return '/processor/dashboard';
      case 'LABORATORY':
        return '/lab/dashboard';
      case 'DISTRIBUTOR':
        return '/distributor/dashboard';
      case 'RETAILER':
        return '/retailer/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const destination = returnPath || getDefaultReturnPath(currentRole);

  return (
    <div
      role="alert"
      className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-red-200/80 shadow-xl overflow-hidden"
    >
      <div className="bg-red-50/80 border-b border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          {description ||
            `This workflow modifies cryptographic state on the botanical ledger. Only accounts with the ${requiredRole} role are authorized to initiate this action.`}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Your Current Role
            </span>
            <span className="font-mono text-sm font-bold text-slate-700 px-2.5 py-0.5 bg-slate-200/60 rounded-lg">
              {currentRole || 'UNKNOWN'}
            </span>
          </div>

          <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-200/60">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-400 block mb-1">
              Required Role
            </span>
            <span className="font-mono text-sm font-bold text-red-700 px-2.5 py-0.5 bg-red-100/70 rounded-lg">
              {requiredRole}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Return to Your Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn size={14} />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
