import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  /** Auto-dismiss delay in ms. Defaults to 4000 (6000 for errors). */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (variant: ToastVariant, options: ToastOptions) => void;
  success: (options: ToastOptions) => void;
  error: (options: ToastOptions) => void;
  info: (options: ToastOptions) => void;
  warning: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: React.ReactNode; iconClass: string; borderClass: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    iconClass: 'text-emerald-600',
    borderClass: 'border-emerald-200',
  },
  error: {
    icon: <XCircle size={18} />,
    iconClass: 'text-rose-600',
    borderClass: 'border-rose-200',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    iconClass: 'text-amber-600',
    borderClass: 'border-amber-200',
  },
  info: {
    icon: <Info size={18} />,
    iconClass: 'text-teal-600',
    borderClass: 'border-teal-200',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (variant: ToastVariant, options: ToastOptions) => {
      const id = nextId.current++;
      const duration = options.duration ?? (variant === 'error' ? 6000 : 4000);
      setToasts((prev) => [...prev.slice(-4), { id, variant, ...options }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (o) => toast('success', o),
      error: (o) => toast('error', o),
      info: (o) => toast('info', o),
      warning: (o) => toast('warning', o),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 right-4 z-[10000] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-modal dark:bg-slate-900 dark:text-slate-100',
                  meta.borderClass
                )}
              >
                <span className={cn('mt-0.5 shrink-0', meta.iconClass)} aria-hidden="true">
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  {t.title && (
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {t.title}
                    </p>
                  )}
                  {t.description && (
                    <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
