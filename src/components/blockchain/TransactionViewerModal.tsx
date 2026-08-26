import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BlockchainTransaction } from '../../types';
import {
  Blocks,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Network,
  Clock,
  UserCheck,
} from 'lucide-react';

interface TransactionViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: BlockchainTransaction;
}

export const TransactionViewerModal: React.FC<TransactionViewerModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hyperledger Fabric Ledger Receipt"
      subtitle={`Block #${transaction.blockNumber} • Immutable Distributed Ledger Record`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Cryptographically Endorsed & Committed
              </div>
              <div className="text-xs text-emerald-700">
                Channel: <span className="font-mono">{transaction.channelName}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
            Block #{transaction.blockNumber}
          </span>
        </div>

        {/* Transaction ID / Hash */}
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Blocks size={14} className="text-emerald-400" /> Transaction ID (Hash)
            </span>
            <button
              onClick={() => copyToClipboard(transaction.txId, 'txId')}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copiedKey === 'txId' ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-emerald-300 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {transaction.txId}
          </p>
        </div>

        {/* Key Ledger Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Cpu size={14} className="text-slate-400" /> Chaincode Smart Contract
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800 break-all">
              {transaction.chaincode}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Layers size={14} className="text-slate-400" /> Chaincode Method Invoked
            </div>
            <div className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">
              {transaction.action}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserCheck size={14} className="text-slate-400" /> Submitting Identity & Role
            </div>
            <div className="text-xs font-medium text-slate-800">
              {transaction.actor} ({transaction.actorRole})
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" /> Block Timestamp
            </div>
            <div className="text-xs font-medium text-slate-800">
              {new Date(transaction.timestamp).toUTCString()}
            </div>
          </div>
        </div>

        {/* Endorsing Peers */}
        <div className="border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Network size={14} className="text-indigo-600" /> Endorsing Peer Nodes (Consensus Quorum)
          </div>
          <div className="space-y-1.5">
            {transaction.endorsingPeers.map((peer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{peer}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-sans font-medium bg-emerald-100 px-2 py-0.5 rounded">
                  ENDORSED ✓
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payload Hash */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>State Read/Write Set Hash:</span>
            <button
              onClick={() => copyToClipboard(transaction.payloadHash, 'payload')}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
            >
              {copiedKey === 'payload' ? 'Copied!' : 'Copy Hash'}
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
            {transaction.payloadHash}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};
