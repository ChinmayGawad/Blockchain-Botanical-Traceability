import React, { useState } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BlockchainTransaction } from '../../types';
import { TransactionViewerModal } from '../../components/blockchain/TransactionViewerModal';
import { BlockchainTxBadge } from '../../components/common/BlockchainTxBadge';
import {
  Blocks,
  Activity,
  Cpu,
  Layers,
  Network,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const BlockchainExplorerPage: React.FC = () => {
  const { transactions, networkStats } = useBlockchain();
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [searchTx, setSearchTx] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.txId.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.actor.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.action.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.blockNumber.toString().includes(searchTx);

    const matchesFilter = stageFilter === 'ALL' || t.stage === stageFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout
      title="Hyperledger Fabric Ledger Explorer"
      subtitle="Public audit explorer for immutable channel transactions, endorsing peer consensus, and chaincode state read/write sets."
    >
      <div className="space-y-6">
        {/* Network Metrics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Blocks size={14} />
              <span>Current Block Height</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              #{networkStats.blockHeight}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Consensus: Raft Ordering Service</div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Network size={14} />
              <span>Active Channel</span>
            </div>
            <div className="text-sm font-bold font-mono text-indigo-200 truncate">
              {networkStats.channelName}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">6 Endorsing Peer Organizations</div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <div className="text-xs text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Cpu size={14} />
              <span>Chaincode Contract</span>
            </div>
            <div className="text-sm font-bold font-mono text-teal-200">
              {networkStats.chaincodeVersion}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Java / Spring Boot Fabric Client</div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Activity size={14} />
              <span>Total Transactions</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {transactions.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">100% Valid Consensus</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by TxID hash, block #, or actor..."
              value={searchTx}
              onChange={e => setSearchTx(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-slate-400" />
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="PRODUCT_CREATION">Product Creation</option>
              <option value="PROCESSING_LOG">Processing Log</option>
              <option value="LAB_APPROVAL">Lab Approval</option>
              <option value="LAB_REJECTION">Lab Rejection</option>
              <option value="SHIPMENT_CREATION">Shipment Creation</option>
              <option value="RETAIL_RECEIPT">Retail Receipt</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Block #</th>
                  <th className="px-5 py-3">Transaction ID (Hash)</th>
                  <th className="px-5 py-3">Smart Contract Action</th>
                  <th className="px-5 py-3">Submitting Identity</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredTransactions.map(tx => (
                  <tr key={tx.txId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-emerald-700">
                      #{tx.blockNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{tx.txId.substring(0, 10)}...{tx.txId.substring(tx.txId.length - 8)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                        {tx.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-sans text-slate-700 font-medium">
                      {tx.actor}
                    </td>

                    <td className="px-5 py-4 font-sans text-slate-500 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold font-sans transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span>Inspect Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <TransactionViewerModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transaction={selectedTx}
        />
      )}
    </DashboardLayout>
  );
};
