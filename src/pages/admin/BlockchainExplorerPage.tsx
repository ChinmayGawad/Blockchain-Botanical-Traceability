import React, { useState } from 'react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BlockchainTransaction } from '../../types';
import { TransactionViewerModal } from '../../components/blockchain/TransactionViewerModal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
} from '@/components/ui';
import {
  Blocks,
  Activity,
  Cpu,
  Network,
  Search,
  ShieldCheck,
  Filter,
  CheckCircle2,
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
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Blocks className="h-4 w-4 text-emerald-700" />
                <span>Current Block Height</span>
              </div>
              <div className="text-3xl font-black font-mono text-foreground">
                #{networkStats.blockHeight}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                EVM Consensus Active
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="text-xs text-indigo-800 dark:text-indigo-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Network className="h-4 w-4 text-indigo-700" />
                <span>Network Protocol</span>
              </div>
              <div className="text-sm font-bold font-mono text-indigo-900 dark:text-indigo-200 truncate">
                {networkStats.networkName || 'Hardhat Localhost (31337)'}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                RPC: http://127.0.0.1:8545
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="text-xs text-teal-800 dark:text-teal-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Cpu className="h-4 w-4 text-teal-700" />
                <span>Smart Contract</span>
              </div>
              <div className="text-sm font-bold font-mono text-teal-900 dark:text-teal-200 truncate">
                {networkStats.contractAddress
                  ? `${networkStats.contractAddress.substring(0, 8)}...${networkStats.contractAddress.substring(networkStats.contractAddress.length - 6)}`
                  : '0x5FbDB2...'}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Solidity v0.8.24 (IR Optimizer)
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="text-xs text-amber-800 dark:text-amber-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Activity className="h-4 w-4 text-amber-700" />
                <span>Total Transactions</span>
              </div>
              <div className="text-3xl font-black font-mono text-foreground">
                {transactions.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                100% Cryptographic Verification
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by TxID hash, block #, or actor..."
                value={searchTx}
                onChange={e => setSearchTx(e.target.value)}
                className="pl-10 text-xs font-mono font-medium h-11"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="h-11 px-3.5 text-xs border border-input rounded-xl bg-card font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-5 py-3.5">Block #</th>
                  <th className="px-5 py-3.5">Transaction ID (Hash)</th>
                  <th className="px-5 py-3.5">Smart Contract Action</th>
                  <th className="px-5 py-3.5">Submitting Identity</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground font-sans">
                      No blockchain transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => (
                    <tr key={tx.txId} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-emerald-700 dark:text-emerald-400">
                        #{tx.blockNumber}
                      </td>

                      <td className="px-5 py-4 text-foreground">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>
                            {tx.txId.substring(0, 10)}...{tx.txId.substring(tx.txId.length - 8)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="font-mono text-xs font-bold bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                          {tx.action}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 font-sans text-foreground font-bold">
                        {tx.actor}
                      </td>

                      <td className="px-5 py-4 font-sans text-muted-foreground text-xs">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right font-sans">
                        <Button
                          size="sm"
                          variant="botanical"
                          onClick={() => setSelectedTx(tx)}
                          className="font-bold min-h-[36px]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
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
