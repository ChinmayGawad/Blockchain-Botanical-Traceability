import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { HARDHAT_DEMO_ACCOUNTS } from '../../services/web3Service';
import { Wallet, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Cpu, Sparkles, LogOut, Shield } from 'lucide-react';

export const WalletConnectButton: React.FC = () => {
  const { walletState, connectMetaMask, connectLocalAccount, disconnectWallet, networkStats } = useBlockchain();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const res = await connectMetaMask();
      if (res.error) {
        setStatusMessage(res.error);
      } else {
        setStatusMessage('Successfully connected to MetaMask!');
      }
    } catch (e: any) {
      setStatusMessage(e.message || 'MetaMask connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLocalAccountConnect = async (index: number) => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      await connectLocalAccount(index);
      setStatusMessage(`Connected as ${HARDHAT_DEMO_ACCOUNTS[index].label}!`);
    } catch (e: any) {
      setStatusMessage('Local account connected in simulation mode.');
    } finally {
      setIsConnecting(false);
    }
  };

  const modalJSX = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowModal(false)}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Cpu size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Web3 Blockchain Node & Wallet
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Solidity EVM (Hardhat / Localhost)
                </span>
                <span>•</span>
                <span>Block #{networkStats.blockHeight}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* Status Alert if any */}
          {statusMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{statusMessage}</div>
            </div>
          )}

          {/* Active Connection Info */}
          {walletState.isConnected ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-emerald-800 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Connected Wallet
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                >
                  <LogOut size={12} /> Disconnect
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between font-mono text-xs text-slate-800 select-all break-all">
                <span>{walletState.address}</span>
                <button
                  onClick={() => handleCopy(walletState.address || '')}
                  className="p-1 text-slate-400 hover:text-emerald-600 ml-2 shrink-0 cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white border border-emerald-100">
                  <div className="text-slate-400 font-medium">Balance</div>
                  <div className="font-bold text-slate-900 font-mono text-xs">
                    {walletState.balanceEth} ETH
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-emerald-100">
                  <div className="text-slate-400 font-medium">Connection Mode</div>
                  <div className="font-bold text-emerald-700 text-xs capitalize">
                    {walletState.connectionType?.toLowerCase().replace('_', ' ') || 'Connected'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>Choose a connection method below to sign transactions on-chain:</span>
            </div>
          )}

          {/* Connection Option 1: MetaMask */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                  🦊
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">MetaMask Web3 Extension</div>
                  <div className="text-[11px] text-slate-500">Connect your browser wallet or hardware key</div>
                </div>
              </div>
              <button
                onClick={handleMetaMaskConnect}
                disabled={isConnecting}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {walletState.connectionType === 'METAMASK' ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>

          {/* Connection Option 2: 1-Click Pre-Funded Demo Accounts */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-600" />
                <span className="font-bold text-slate-900 text-xs">1-Click Demo Hardhat Accounts (10,000 ETH)</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Instant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any role below to connect as that actor with standard test keys (no extension needed):
            </p>

            <div className="grid grid-cols-2 gap-2">
              {HARDHAT_DEMO_ACCOUNTS.map((acc, index) => (
                <button
                  key={acc.role}
                  onClick={() => handleLocalAccountConnect(index)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    walletState.address?.toLowerCase() === acc.address.toLowerCase()
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900 text-[11px]">{acc.label}</span>
                    {walletState.address?.toLowerCase() === acc.address.toLowerCase() && (
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">{acc.address}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Contract Information */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-indigo-600" /> Deployed Smart Contract
              </span>
              <span className="font-mono text-[10px] text-slate-500">Solidity v0.8.24</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all">
              <span className="truncate">{networkStats.contractAddress}</span>
              <button
                onClick={() => handleCopy(networkStats.contractAddress)}
                className="p-1 text-slate-400 hover:text-indigo-600 ml-2 shrink-0 cursor-pointer"
                title="Copy contract address"
              >
                {copied ? <Check size={13} className="text-indigo-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Network: <span className="font-mono text-slate-600 font-semibold">localhost:8545 (31337)</span>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {walletState.isConnected ? (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
          title="Click to view connected Web3 Wallet & Smart Contract details"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-mono text-emerald-800 whitespace-nowrap font-bold">
            {walletState.address?.substring(0, 6)}...{walletState.address?.substring(walletState.address.length - 4)}
          </span>
          {walletState.balanceEth && (
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap">
              {walletState.balanceEth} ETH
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer border border-slate-800 group shrink-0 whitespace-nowrap"
          title="Click to open Web3 Wallet & Blockchain connection dialog"
        >
          <Wallet size={14} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="whitespace-nowrap">Connect Wallet</span>
        </button>
      )}

      {showModal && createPortal(modalJSX, document.body)}
    </>
  );
};
export default WalletConnectButton;
