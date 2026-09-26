import React from 'react';
import { Link } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BlockchainTxBadge } from '../../components/common/BlockchainTxBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import {
  Blocks,
  Users,
  AlertTriangle,
  Package,
  Activity,
  ArrowRight,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products, transactions, suspiciousReports, networkStats } = useBlockchain();
  const { users } = useAuth();

  const pendingApprovals = users.filter(u => u.status === 'PENDING_APPROVAL');
  const activeFraudReports = suspiciousReports.filter(
    r => r.status === 'PENDING_REVIEW' || r.status === 'INVESTIGATING'
  );
  const verifiedBatches = products.filter(p => p.verificationState === 'VERIFIED');
  const rejectedBatches = products.filter(p => p.verificationState === 'REJECTED');

  return (
    <DashboardLayout
      title="Consortium Governance Admin Portal"
      subtitle="Network monitoring, smart contract chaincode verification, stakeholder authorization, and fraud resolution."
      action={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/explorer" className="inline-flex items-center gap-1.5 h-11 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all min-h-[44px] font-bold text-slate-700">
            <Blocks className="h-4 w-4 text-emerald-600" />
            <span>Open Ledger Explorer</span>
          </Link>
          <Link to="/admin/approvals" className="inline-flex items-center gap-1.5 h-11 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#0F766E] text-white shadow-md hover:bg-[#115E59] transition-all min-h-[44px] font-bold">
            <Users className="h-4 w-4" />
            <span>Stakeholder Approvals ({pendingApprovals.length})</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Hyperledger Block Height
                  </p>
                  <p className="text-2xl font-black font-mono text-foreground mt-1">
                    #{networkStats.blockHeight}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consensus TPS: 4.8 / sec
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Blocks className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Consortium Batches
                  </p>
                  <p className="text-2xl font-black font-mono text-foreground mt-1">
                    {products.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {verifiedBatches.length} Verified • {rejectedBatches.length} Rejected
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-black font-mono text-foreground mt-1">
                    {pendingApprovals.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Farmer & Lab Node Registration
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Active Fraud Reports
                  </p>
                  <p className="text-2xl font-black font-mono text-foreground mt-1">
                    {activeFraudReports.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consumer verification flags
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Blockchain Transactions Stream */}
          <Card className="lg:col-span-2 overflow-hidden shadow-xs">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span>Real-Time Hyperledger Fabric Transaction Ledger</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Immutable smart contract calls endorsed by consortium peer nodes
                </CardDescription>
              </div>

              <Link to="/admin/explorer" className="inline-flex items-center gap-1 h-9 rounded-lg px-3.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-all min-h-[36px]">
                <span>View Explorer</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-border">
              {transactions.slice(0, 5).map(tx => (
                <div
                  key={tx.txId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground font-mono">
                        Block #{tx.blockNumber}
                      </span>
                      <Badge variant="secondary" className="font-mono text-[11px] font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                        {tx.action}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Submitting Node: <span className="font-semibold text-foreground">{tx.actor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <BlockchainTxBadge txHash={tx.txId} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right 1 Col: Quick Network & Node Health */}
          <div className="space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  <span>Consortium Node Status</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Orderer Raft Consensus:</span>
                  <Badge variant="success" className="font-bold">
                    3/3 Nodes Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">Smart Contract Version:</span>
                  <span className="font-mono font-bold text-foreground">
                    {networkStats.chaincodeVersion}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">IPFS Pinning Cluster:</span>
                  <Badge variant="success" className="font-bold">
                    Online (Pinata + Local)
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground">PostgreSQL Mirror DB:</span>
                  <Badge variant="success" className="font-bold">
                    Synchronized
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Pending Approvals Alert */}
            {pendingApprovals.length > 0 && (
              <Alert variant="warning" className="space-y-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-300 font-bold text-xs">
                  {pendingApprovals.length} Stakeholder Awaiting Approval
                </AlertTitle>
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-400">
                  New farmer and lab registrations need verification before issuing cryptographic signing certificates.
                  <div className="mt-2">
                    <Link to="/admin/approvals" className="text-xs font-bold text-amber-900 underline inline-block">
                      Review Stakeholder Applications →
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
