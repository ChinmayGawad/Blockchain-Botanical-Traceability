import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { t } = useTranslation();
  const { currentUser, role } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] bg-slate-50 dark:bg-slate-950">
      {/* Fixed Docked Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 lg:ml-64 min-w-0 bg-slate-50/70 dark:bg-slate-950/70 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Pending Approval Notice if relevant */}
        {currentUser.status === 'PENDING_APPROVAL' && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold">{t('dashboard.membershipUnderReview')}</div>
              <div>
                {t('dashboard.membershipUnderReviewDesc')}
              </div>
            </div>
          </div>
        )}

        {/* Unified Dashboard Header Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                {t(`roles.${role}`)}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck size={13} aria-hidden="true" />
                <span>{t('dashboard.activeOnLedger')}</span>
              </span>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>

        {/* Inner Page Content Canvas */}
        <motion.div 
          key={window.location.pathname}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
