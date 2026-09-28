import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  RefreshCw,
  VideoOff,
  CheckCircle2,
  SwitchCamera
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CameraStatus = 'idle' | 'prompting' | 'streaming' | 'success' | 'denied' | 'unsupported' | 'error';

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { products } = useBlockchain();
  const [manualCode, setManualCode] = useState('');
  
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [detectedId, setDetectedId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Stop media stream tracks and reset camera status
  const stopCameraStream = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  }, []);

  // Parse raw text or URL into target batch/product ID
  const parseScannedData = (rawText: string): string => {
    let clean = rawText.trim();
    if (clean.includes('/verify/')) {
      clean = clean.split('/verify/')[1];
    }
    // Remove query params or trailing slashes if any
    clean = clean.split('?')[0].split('#')[0].replace(/\/+$/, '');
    return clean;
  };

  // Handle successful scan match
  const handleScanSuccess = useCallback((targetId: string) => {
    setCameraStatus('success');
    setDetectedId(targetId);
    setStatusMessage(`QR Tag Detected: ${targetId}`);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(100);
      } catch {
        // ignore vibration permission errors
      }
    }

    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore track stop errors
        }
      });
      streamRef.current = null;
    }

    setTimeout(() => {
      onClose();
      navigate(`/verify/${targetId}`);
    }, 900);
  }, [navigate, onClose]);

  // Start real mobile camera stream with permission prompt
  const requestCameraAccess = async (targetFacingMode: 'environment' | 'user' = facingMode) => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    setCameraStatus('prompting');
    setStatusMessage('Requesting camera permission: Please tap "Allow" when prompted by your browser to scan the QR tag.');

    // Check if mediaDevices API is supported (requires HTTPS or localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setStatusMessage('Camera access is not supported on this browser or connection (HTTPS is required). You can enter the Batch ID manually or run a simulated scan.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: targetFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // auto-play policy handled by muted + playsInline
        }
      }

      setCameraStatus('streaming');
      setStatusMessage('Live Camera Active • Align the botanical QR tag within the square frame');

      // Setup BarcodeDetector if available on modern browsers (Android Chrome / iOS Safari)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'data_matrix', 'code_128', 'ean_13']
          });

          scanIntervalRef.current = window.setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  if (rawValue) {
                    const parsed = parseScannedData(rawValue);
                    if (parsed) {
                      handleScanSuccess(parsed);
                    }
                  }
                }
              } catch {
                // Ignore per-frame detection hiccups
              }
            }
          }, 350);
        } catch {
          // BarcodeDetector initialization fallback
        }
      }
    } catch (err: any) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        streamRef.current = null;
      }
      const errName = err?.name || '';
      
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setStatusMessage('Camera permission was denied. Please allow camera permissions in your browser or phone settings to scan physical QR codes.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraStatus('unsupported');
        setStatusMessage('No camera device was detected on your device. Please enter the Batch ID manually.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraStatus('error');
        setStatusMessage('Camera is currently in use by another application or blocked. Please close other camera apps and retry.');
      } else {
        setCameraStatus('error');
        setStatusMessage(err?.message || 'Unable to access camera. Please enter the Batch ID manually or run a simulated demo scan.');
      }
    }
  };

  // Toggle between front and rear cameras (mobile feature)
  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    requestCameraAccess(nextMode);
  };

  // Simulated scan fallback for desktop or demo presentations
  const startSimulatedScan = () => {
    stopCameraStream();
    setCameraStatus('prompting');
    setStatusMessage('Simulating optical sensor activation...');
    
    setTimeout(() => {
      setCameraStatus('streaming');
      setStatusMessage('Scanning simulated botanical QR matrix pattern...');
    }, 600);

    setTimeout(() => {
      const demoId = products[0]?.id || 'BOT-2024-8901';
      handleScanSuccess(demoId);
    }, 1800);
  };

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCameraStatus('idle');
      setStatusMessage('');
      setDetectedId(null);
      setManualCode('');
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, stopCameraStream]);

  const handleSelectProduct = (productId: string) => {
    stopCameraStream();
    onClose();
    navigate(`/verify/${productId}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const target = parseScannedData(manualCode);
    stopCameraStream();
    onClose();
    navigate(`/verify/${target}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      title="Scan Botanical QR Code"
      subtitle="Verify authenticity, farm GPS origin, lab purity, and Hyperledger Fabric records"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Permission Request Prompt Banner (Mobile-first notice) */}
        {cameraStatus === 'prompting' && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 animate-pulse">
              <Camera size={16} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-emerald-900">Camera Permission Requested</p>
              <p className="text-emerald-800 leading-relaxed">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* Permission Denied Alert Banner */}
        {cameraStatus === 'denied' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
              <AlertCircle size={16} />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-bold text-rose-900">Camera Permission Blocked</p>
                <p className="text-rose-800 mt-0.5 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => requestCameraAccess()}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Retry Camera Permission</span>
                </button>
                <button
                  type="button"
                  onClick={startSimulatedScan}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Use Demo Scan Instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unsupported or Error Alert Banner */}
        {(cameraStatus === 'unsupported' || cameraStatus === 'error') && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1.5 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5">
              <VideoOff size={16} />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <p className="font-bold text-amber-900">
                  {cameraStatus === 'unsupported' ? 'Camera Not Available' : 'Camera Access Error'}
                </p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startSimulatedScan}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Sparkles size={13} />
                  <span>Simulate Quick Scan (Demo)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {cameraStatus === 'success' && (
          <div className="p-3.5 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-2xl flex items-center gap-3 text-xs animate-in zoom-in-95 duration-200 shadow-sm">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="font-bold text-emerald-900">QR Code Verified!</p>
              <p className="text-emerald-800 text-[11px] font-mono">
                Decoded: {detectedId} • Loading provenance record...
              </p>
            </div>
          </div>
        )}

        {/* Camera Viewfinder Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[240px] max-h-[360px] text-white text-center shadow-inner">
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              cameraStatus === 'streaming' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Live camera indicator top badge */}
          {cameraStatus === 'streaming' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-slate-900/90 border border-emerald-500/50 rounded-full flex items-center gap-2 backdrop-blur-md shadow-lg pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-300 tracking-wide">Live Camera Active</span>
            </div>
          )}

          {/* Semi-transparent dark overlay when streaming */}
          {cameraStatus === 'streaming' && (
            <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
          )}

          {/* Target Reticle corners */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 z-20 pointer-events-none rounded-tl-sm"></div>
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 z-20 pointer-events-none rounded-tr-sm"></div>
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 z-20 pointer-events-none rounded-bl-sm"></div>
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 z-20 pointer-events-none rounded-br-sm"></div>

          {/* Center Target Box for QR scanning */}
          <div className="absolute w-44 h-44 sm:w-52 sm:h-52 border border-emerald-400/40 rounded-xl pointer-events-none z-10">
            {/* Animated Laser Beam */}
            {(cameraStatus === 'streaming' || cameraStatus === 'prompting') && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-pulse"></div>
            )}
          </div>

          {/* Viewfinder Content & Buttons */}
          <div className="relative z-30 flex flex-col items-center max-w-sm px-2">
            {cameraStatus !== 'streaming' ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <Camera size={28} className={cameraStatus === 'prompting' ? 'animate-pulse' : ''} />
                </div>

                <p className="text-sm font-bold text-white">
                  {cameraStatus === 'idle' && 'Point mobile camera at product container QR tag'}
                  {cameraStatus === 'prompting' && 'Waiting for camera authorization...'}
                  {(cameraStatus === 'denied' || cameraStatus === 'unsupported' || cameraStatus === 'error') && 'Camera Scanner Inactive'}
                </p>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  Supports FloraChain botanical batch QR tags & GS1 digital link data carriers
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => requestCameraAccess()}
                    disabled={cameraStatus === 'prompting'}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <Camera size={16} />
                    <span>
                      {cameraStatus === 'prompting' ? 'Requesting Access...' : 'Activate Camera Scanner'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={startSimulatedScan}
                    disabled={cameraStatus === 'prompting'}
                    className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Simulate scanning a sample batch without camera"
                  >
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Demo Scan</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between gap-2 mt-40 sm:mt-48">
                <button
                  type="button"
                  onClick={toggleCameraFacingMode}
                  className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors shadow-sm"
                  title="Switch between front and rear cameras"
                >
                  <SwitchCamera size={14} className="text-emerald-400" />
                  <span>Switch Camera</span>
                </button>

                <button
                  type="button"
                  onClick={stopCameraStream}
                  className="px-3 py-1.5 bg-rose-600/85 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors shadow-sm"
                >
                  <VideoOff size={14} />
                  <span>Stop Camera</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manual ID Search */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Or enter Product ID / Batch Code manually:
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. BOT-2024-8901 or ASH-2024-089"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <span>Verify</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Quick Demo Samples */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-700" /> Click to Test Demo Batches:
          </span>

          <div className="space-y-2">
            {products.slice(0, 4).map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectProduct(product.id)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 transition-colors">
                    {product.verificationState === 'VERIFIED' && <ShieldCheck size={18} className="text-emerald-700" />}
                    {product.verificationState === 'REJECTED' && <ShieldX size={18} className="text-rose-700" />}
                    {product.verificationState === 'IN_PROGRESS' && <ShieldAlert size={18} className="text-indigo-700" />}
                    {product.verificationState === 'SUSPICIOUS' && <ShieldAlert size={18} className="text-amber-700" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Batch #{product.batchId} • ID: {product.id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 capitalize">
                    {product.status.replace('_', ' ').toLowerCase()}
                  </span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
