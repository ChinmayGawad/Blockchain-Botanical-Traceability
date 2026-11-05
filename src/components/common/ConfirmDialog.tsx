import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Danger confirms render a destructive button and warning icon. */
  variant?: 'default' | 'danger';
}

/**
 * Accessible confirmation dialog replacing window.confirm. Focus is trapped
 * by the underlying Modal; Escape/backdrop closes without confirming.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isConfirming ? () => {} : onClose}
      title={title}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {description && (
          <div className="flex items-start gap-3">
            {variant === 'danger' && (
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                aria-hidden="true"
              >
                <AlertTriangle size={18} />
              </span>
            )}
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
            className="min-h-[44px]"
          >
            {cancelLabel ?? t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'destructive' : 'botanical'}
            onClick={handleConfirm}
            disabled={isConfirming}
            className="min-h-[44px]"
          >
            {isConfirming && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}
            {confirmLabel ?? t('common.confirm', 'Confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
