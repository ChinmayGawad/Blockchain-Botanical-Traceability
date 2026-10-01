import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export interface WizardAlertProps {
  message: string | null;
  type?: 'error' | 'warning' | 'success';
  onDismiss?: () => void;
  className?: string;
}

export const WizardAlert: React.FC<WizardAlertProps> = ({
  message,
  type = 'error',
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const styleConfig = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle size={16} className="text-rose-600 shrink-0" />,
      closeBtn: 'text-rose-500 hover:text-rose-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle size={16} className="text-amber-600 shrink-0" />,
      closeBtn: 'text-amber-500 hover:text-amber-700',
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />,
      closeBtn: 'text-emerald-500 hover:text-emerald-700',
    },
  }[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        role="alert"
        className={`p-3.5 border rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs ${styleConfig.bg} ${className}`}
      >
        <div className="flex items-center gap-2">
          {styleConfig.icon}
          <span className="font-medium">{message}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className={`${styleConfig.closeBtn} text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors`}
          >
            <X size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
