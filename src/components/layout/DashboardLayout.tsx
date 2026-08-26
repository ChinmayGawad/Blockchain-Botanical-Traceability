import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
}) => {
  const { currentUser, role } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden">
        {/* Pending Approval Notice if relevant */}
        {currentUser.status === 'PENDING_APPROVAL' && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Stakeholder Membership Under Review</div>
              <div>
                Your node credential is awaiting cryptographic approval by Consortium Admin Dr. Evelyn Vance. You have read-only access until verified.
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {role}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* Inner Page Content */}
        <div>{children}</div>
      </main>
    </div>
  );
};
