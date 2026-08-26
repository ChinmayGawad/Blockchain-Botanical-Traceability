import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Download, Printer, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { BotanicalProduct } from '../../types';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: BotanicalProduct;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${window.location.origin}/verify/${product.id}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('product-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `FloraChain_QR_${product.batchId}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Verification QR Code"
      subtitle={`Batch ${product.batchId} • Consumer Trust Tag`}
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {/* Printable Card Area */}
        <div
          ref={printRef}
          className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center space-y-4"
        >
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" /> FloraChain Authenticity Tag
          </div>

          <div className="p-4 bg-white rounded-xl shadow-md border border-slate-100 inline-block">
            <QRCodeSVG
              id="product-qr-svg"
              value={verificationUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/></svg>",
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base">{product.name}</h4>
            <p className="text-xs text-slate-500 italic font-mono">{product.botanicalName}</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono text-slate-600">
              <span className="bg-slate-100 px-2 py-0.5 rounded">ID: {product.id}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">Batch: {product.batchId}</span>
            </div>
          </div>
        </div>

        {/* Verification Link Input */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Consumer Scan / Direct Verification URL:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono truncate focus:outline-none"
            />
            <button
              onClick={copyUrl}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-2xs"
          >
            <Download size={16} />
            <span>Download SVG</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Printer size={16} />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
