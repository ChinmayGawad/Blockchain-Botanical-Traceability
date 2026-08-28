import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

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
      {/* Fixed Docked Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 lg:ml-64 min-w-0 bg-slate-50/70 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Pending Approval Notice if relevant */}
        {currentUser.status === 'PENDING_APPROVAL' && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs shadow-xs">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Stakeholder Membership Under Review</div>
              <div>
                Your node credential is awaiting cryptographic approval by Consortium Admin Dr. Evelyn Vance. You have read-only access until verified.
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Title & Action Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {title}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                {role}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>

        {/* Inner Page Content Canvas */}
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
};
