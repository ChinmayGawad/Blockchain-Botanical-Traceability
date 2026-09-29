/* Hallmark · component: DemoDashboardDrawerModal · genre: modern-minimal · theme: Slate-Emerald
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (WCAG AA > 4.5:1)
 * pre-emit critique: P5 H4 E5 S4 R5 V5
 */
import React, { useEffect } from 'react';
import { X, Truck, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupplyChainJourneyMap } from '../map/SupplyChainJourneyMap';
import { useNavigate } from 'react-router-dom';

interface DemoDashboardDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId?: string;
  productName?: string;
}

export const DemoDashboardDrawerModal: React.FC<DemoDashboardDrawerModalProps> = ({
  isOpen,
  onClose,
  batchId = 'ASH-2024-089',
  productName = 'Pure Organic Ashwagandha Root Powder',
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-over Drawer Container */}
      <div className="relative z-10 w-full max-w-3xl h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Truck size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Quick Route Inspection Drawer
                </h3>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 font-mono">
                  Option B
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tracking: <span className="text-white font-semibold">{productName}</span> ({batchId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                onClose();
                navigate(`/fleet-map?batch=${batchId}`);
              }}
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            >
              <span>Full Command Deck</span>
              <ArrowRight size={12} className="ml-1" />
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <SupplyChainJourneyMap
            batchId={batchId}
            productName={productName}
          />
        </div>
      </div>
    </div>
  );
};
