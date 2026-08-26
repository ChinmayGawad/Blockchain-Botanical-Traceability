import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import { QrCode, Camera, Sparkles, ArrowRight, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { products } = useBlockchain();
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/verify/${productId}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Check if entered code matches or clean url
    let target = manualCode.trim();
    if (target.includes('/verify/')) {
      target = target.split('/verify/')[1];
    }

    onClose();
    navigate(`/verify/${target}`);
  };

  const startSimulatedCamera = () => {
    setIsScanning(true);
    setScanMessage('Initializing camera sensor...');
    setTimeout(() => {
      setScanMessage('Scanning optical QR matrix pattern...');
    }, 800);
    setTimeout(() => {
      setScanMessage('QR Decoded: BOT-2024-8901 (Ashwagandha Batch #ASH-2024-089)');
    }, 1800);
    setTimeout(() => {
      setIsScanning(false);
      onClose();
      navigate('/verify/BOT-2024-8901');
    }, 2400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Botanical QR Code"
      subtitle="Verify authenticity, farm GPS origin, lab purity, and Hyperledger Fabric records"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Live Camera Viewfinder Simulation */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 p-6 flex flex-col items-center justify-center min-h-[220px] text-white text-center">
          {/* Target corners */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

          {/* Scanning laser beam */}
          {isScanning && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse"></div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Camera size={32} className={isScanning ? 'animate-bounce' : ''} />
            </div>

            <p className="text-sm font-medium text-slate-200">
              {isScanning ? scanMessage : 'Point camera at product container QR tag'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Supports FloraChain standard QR tags & GS1 digital link data carriers
            </p>

            <button
              onClick={startSimulatedCamera}
              disabled={isScanning}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
            >
              <QrCode size={16} />
              <span>{isScanning ? 'Scanning...' : 'Activate Camera Scanner'}</span>
            </button>
          </div>
        </div>

        {/* Manual ID Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Or enter Product ID / Batch Code manually:
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. BOT-2024-8901 or ASH-2024-089"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Verify</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Quick Demo Samples */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Click to Test Demo Batches:
            </span>
          </div>

          <div className="space-y-2">
            {products.slice(0, 4).map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectProduct(product.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 transition-colors">
                    {product.verificationState === 'VERIFIED' && <ShieldCheck size={18} className="text-emerald-600" />}
                    {product.verificationState === 'REJECTED' && <ShieldX size={18} className="text-rose-600" />}
                    {product.verificationState === 'IN_PROGRESS' && <ShieldAlert size={18} className="text-indigo-600" />}
                    {product.verificationState === 'SUSPICIOUS' && <ShieldAlert size={18} className="text-amber-600" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Batch #{product.batchId} • ID: {product.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 capitalize">
                    {product.status.replace('_', ' ').toLowerCase()}
                  </span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
