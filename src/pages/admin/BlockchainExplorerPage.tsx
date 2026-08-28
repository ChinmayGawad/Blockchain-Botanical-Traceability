import React, { useState } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BlockchainTransaction } from '../../types';
import { TransactionViewerModal } from '../../components/blockchain/TransactionViewerModal';
import {
  Blocks,
  Activity,
  Cpu,
  Network,
  Search,
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
      title="Blockchain Ledger Explorer"
      subtitle="Public audit explorer for immutable on-chain smart contract transactions, cryptographic event logs, and state proofs."
    >
      <div className="space-y-6">
        {/* Network Metrics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs text-emerald-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Blocks size={15} className="text-emerald-700" />
              <span>Current Block Height</span>
            </div>
            <div className="text-3xl font-black font-mono text-slate-900">
              #{networkStats.blockHeight}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">EVM Consensus Active</div>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs text-indigo-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Network size={15} className="text-indigo-700" />
              <span>Network Protocol</span>
            </div>
            <div className="text-sm font-bold font-mono text-indigo-900 truncate">
              {networkStats.networkName || 'Hardhat Localhost (31337)'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">RPC: http://127.0.0.1:8545</div>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs text-teal-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Cpu size={15} className="text-teal-700" />
              <span>Smart Contract</span>
            </div>
            <div className="text-sm font-bold font-mono text-teal-900 truncate">
              {networkStats.contractAddress ? `${networkStats.contractAddress.substring(0, 8)}...${networkStats.contractAddress.substring(networkStats.contractAddress.length - 6)}` : '0x5FbDB2...'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Solidity v0.8.24 (IR Optimizer)</div>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs text-amber-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Activity size={15} className="text-amber-700" />
              <span>Total Transactions</span>
            </div>
            <div className="text-3xl font-black font-mono text-slate-900">
              {transactions.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">100% Cryptographic Verification</div>
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
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none font-mono font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400" />
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-700 focus:outline-none"
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
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Block #</th>
                  <th className="px-5 py-3.5">Transaction ID (Hash)</th>
                  <th className="px-5 py-3.5">Smart Contract Action</th>
                  <th className="px-5 py-3.5">Submitting Identity</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredTransactions.map(tx => (
                  <tr key={tx.txId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-emerald-800">
                      #{tx.blockNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{tx.txId.substring(0, 10)}...{tx.txId.substring(tx.txId.length - 8)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono inline-block">
                        {tx.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-sans text-slate-800 font-bold">
                      {tx.actor}
                    </td>

                    <td className="px-5 py-4 font-sans text-slate-500 text-xs">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <ShieldCheck size={13} />
                        <span>Inspect</span>
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
