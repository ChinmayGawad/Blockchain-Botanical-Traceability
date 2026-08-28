import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { HARDHAT_DEMO_ACCOUNTS } from '../../services/web3Service';
import {
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Sparkles,
  LogOut,
  Shield,
  Sprout,
  Cog,
  FlaskConical,
  Truck,
  Store,
  ShieldCheck,
} from 'lucide-react';

export const WalletConnectButton: React.FC = () => {
  const { walletState, connectMetaMask, connectLocalAccount, disconnectWallet, networkStats } = useBlockchain();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contractCopied, setContractCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyContract = (text: string) => {
    navigator.clipboard.writeText(text);
    setContractCopied(true);
    setTimeout(() => setContractCopied(false), 2000);
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

  const roleIcons: Record<string, React.ElementType> = {
    ADMIN: ShieldCheck,
    FARMER: Sprout,
    PROCESSOR: Cog,
    LABORATORY: FlaskConical,
    DISTRIBUTOR: Truck,
    RETAILER: Store,
  };

  const roleColors: Record<string, { bg: string; text: string; ring: string }> = {
    ADMIN: { bg: 'bg-slate-100', text: 'text-slate-900', ring: 'border-slate-300' },
    FARMER: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'border-emerald-200' },
    PROCESSOR: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'border-purple-200' },
    LABORATORY: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'border-indigo-200' },
    DISTRIBUTOR: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'border-sky-200' },
    RETAILER: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'border-teal-200' },
  };

  const modalJSX = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShowModal(false)}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-900/10">
              <Cpu size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                Web3 Blockchain Node & Wallet
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-mono text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Solidity EVM (Hardhat Localhost)
                </span>
                <span>•</span>
                <span>Block #{networkStats.blockHeight}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
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
              <div className="font-semibold">{statusMessage}</div>
            </div>
          )}

          {/* Active Connection Info */}
          {walletState.isConnected ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Connected Blockchain Node
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-rose-700 hover:text-rose-800 flex items-center gap-1 text-xs font-bold cursor-pointer hover:underline"
                >
                  <LogOut size={13} /> Disconnect
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between font-mono text-xs text-slate-800 shadow-2xs">
                <span className="font-bold truncate">{walletState.address}</span>
                <button
                  onClick={() => handleCopy(walletState.address || '')}
                  className="p-1 text-slate-400 hover:text-emerald-700 ml-2 shrink-0 cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <div className="text-slate-500 font-medium text-[11px]">Available Balance</div>
                  <div className="font-extrabold text-slate-900 font-mono text-xs mt-0.5">
                    {walletState.balanceEth} ETH
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <div className="text-slate-500 font-medium text-[11px]">Connection Engine</div>
                  <div className="font-bold text-emerald-800 text-xs capitalize mt-0.5">
                    {walletState.connectionType?.toLowerCase().replace('_', ' ') || 'Connected'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Connection Option 1: 1-Click Pre-Funded Demo Accounts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-700" />
                <span className="font-bold text-slate-900 text-xs">1-Click Test Stakeholder Wallets (10,000 ETH)</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Instant Sign
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {HARDHAT_DEMO_ACCOUNTS.map((acc, index) => {
                const Icon = roleIcons[acc.role] || Wallet;
                const colors = roleColors[acc.role] || { bg: 'bg-slate-50', text: 'text-slate-700', ring: 'border-slate-200' };
                const isSelected = walletState.address?.toLowerCase() === acc.address.toLowerCase();

                return (
                  <button
                    key={acc.role}
                    onClick={() => handleLocalAccountConnect(index)}
                    disabled={isConnecting}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${colors.bg} ${colors.text} ${colors.ring}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {acc.label.replace(' (Deployer)', '').replace(' Account', '')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          10,000 ETH • {acc.role}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Option 2: MetaMask */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-base shrink-0 border border-amber-200">
                🦊
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">MetaMask Web3 Extension</div>
                <div className="text-[11px] text-slate-500 font-medium">Connect browser extension or hardware wallet</div>
              </div>
            </div>
            <button
              onClick={handleMetaMaskConnect}
              disabled={isConnecting}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
            >
              {walletState.connectionType === 'METAMASK' ? 'Connected' : 'Connect'}
            </button>
          </div>

          {/* Contract Information Pill */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Shield size={14} className="text-emerald-700 shrink-0" />
              <span className="text-slate-500 font-medium">Smart Contract:</span>
              <span className="font-mono font-bold text-slate-800 truncate">{networkStats.contractAddress}</span>
            </div>
            <button
              onClick={() => handleCopyContract(networkStats.contractAddress)}
              className="p-1 text-slate-400 hover:text-emerald-700 ml-2 shrink-0 cursor-pointer"
              title="Copy contract address"
            >
              {contractCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            RPC Node: <span className="font-mono text-slate-700 font-bold">localhost:8545</span>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          title="Click to view connected Web3 Wallet & Smart Contract details"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
          <span className="font-mono font-bold text-emerald-950 whitespace-nowrap">
            {walletState.address?.substring(0, 6)}...{walletState.address?.substring(walletState.address.length - 4)}
          </span>
          {walletState.balanceEth && (
            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap border border-emerald-300">
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
