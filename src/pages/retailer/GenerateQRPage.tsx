import React, { useState } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Tag,
  Copy,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GenerateQRPage: React.FC = () => {
  const { products } = useBlockchain();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [labelSize, setLabelSize] = useState<'jar' | 'carton' | 'pallet'>('jar');
  const [copied, setCopied] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const verificationUrl = `${window.location.origin}/verify/${selectedProduct?.id}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('qr-label-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `FloraChain_${selectedProduct?.batchId}_Label.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <DashboardLayout
      title="Batch QR Code Label Studio"
      subtitle="Generate high-resolution SVG/PNG cryptographic QR labels for retail jars, packaging cartons, and shelf displays."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag size={16} className="text-teal-600" />
              <span>Label Configuration</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Botanical Batch:
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-mono"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} • Batch #{p.batchId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Packaging Format:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLabelSize('jar')}
                  className={`p-2 rounded-xl border text-center transition-colors ${
                    labelSize === 'jar'
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Retail Jar (50mm)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('carton')}
                  className={`p-2 rounded-xl border text-center transition-colors ${
                    labelSize === 'carton'
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Box Carton (80mm)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('pallet')}
                  className={`p-2 rounded-xl border text-center transition-colors ${
                    labelSize === 'pallet'
                      ? 'bg-teal-50 text-teal-800 border-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pallet Tag (120mm)
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer size={16} />
                <span>Print Shelf Sticker Label</span>
              </button>

              <button
                onClick={handleDownloadSVG}
                className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span>Export Vector SVG</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Verification Route:</span>
            <div className="font-mono text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-lg border border-slate-200">
              {verificationUrl}
            </div>
            <button
              onClick={copyUrl}
              className="text-teal-700 font-bold text-xs flex items-center gap-1 hover:underline"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* Label Preview Column */}
        <div className="lg:col-span-2">
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center min-h-[480px]">
            {/* Printable Label Card Preview */}
            <div className="bg-white border-2 border-dashed border-teal-400 rounded-3xl p-8 shadow-xl max-w-sm w-full text-center space-y-5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit mx-auto">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>FloraChain Blockchain Verified</span>
              </div>

              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 inline-block">
                <QRCodeSVG
                  id="qr-label-svg"
                  value={verificationUrl}
                  size={labelSize === 'jar' ? 180 : labelSize === 'carton' ? 220 : 260}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'><path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/></svg>",
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base">
                  {selectedProduct?.name}
                </h4>
                <p className="text-xs text-slate-500 italic font-mono">
                  {selectedProduct?.botanicalName}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="block text-[10px] text-slate-400 uppercase">Batch</span>
                  <strong>{selectedProduct?.batchId}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="block text-[10px] text-slate-400 uppercase">Origin</span>
                  <strong>{selectedProduct?.farmLocation.split(',')[0]}</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Scan with smartphone camera for Soil-to-Shelf Provenance
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
