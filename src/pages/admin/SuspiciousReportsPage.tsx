import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlockchain } from '../../context/BlockchainContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SuspiciousReport } from '../../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ShieldQuestion,
} from 'lucide-react';

export const SuspiciousReportsPage: React.FC = () => {
  const { suspiciousReports, updateReportStatus } = useBlockchain();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<SuspiciousReport['status']>('INVESTIGATING');
  const [adminNotes, setAdminNotes] = useState('');

  const handleUpdate = (reportId: string) => {
    updateReportStatus(reportId, newStatus, adminNotes);
    setSelectedReportId(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: SuspiciousReport['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
            Pending Review
          </Badge>
        );
      case 'INVESTIGATING':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
            Investigating
          </Badge>
        );
      case 'RESOLVED_VALID':
        return (
          <Badge variant="success" className="text-xs font-bold">
            Resolved (Genuine)
          </Badge>
        );
      case 'CONFIRMED_FRAUD':
        return (
          <Badge variant="destructive" className="text-xs font-bold">
            Confirmed Counterfeit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs font-bold">
            Dismissed
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout
      title="Fraud & Suspicious Incident Governance"
      subtitle="Review consumer reports, broken QR signatures, unauthorized supply-chain nodes, and packaging tamper alerts."
    >
      <div className="space-y-6">
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <span>Incident Incident Log</span>
            </CardTitle>
            <Badge variant="secondary" className="font-semibold text-xs">
              {suspiciousReports.length} Incidents Filed
            </Badge>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border">
            {suspiciousReports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No incident reports on file. The network is clean.
              </div>
            ) : (
              suspiciousReports.map(report => (
                <div
                  key={report.id}
                  className="p-5 hover:bg-muted/30 transition-colors space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground text-sm font-mono">
                        {report.id}
                      </span>
                      <Badge variant="outline" className="font-mono text-xs text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        Product: {report.productId}
                      </Badge>
                      {getStatusBadge(report.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Reported: {new Date(report.reportedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-foreground space-y-1.5">
                    <p className="font-semibold">
                      Reason: <span className="text-rose-700 dark:text-rose-400 font-bold">{report.reason.replace(/_/g, ' ')}</span>
                    </p>
                    <div className="text-muted-foreground italic bg-muted/40 p-3.5 rounded-xl border border-border">
                      "{report.description}"
                    </div>
                    <div className="text-[11px] text-muted-foreground pt-1">
                      Reporter: <strong className="text-foreground">{report.reporterName}</strong> ({report.reporterEmail})
                    </div>
                    {report.adminNotes && (
                      <div className="text-xs text-indigo-800 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-200 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <strong>Admin Resolution Note:</strong> {report.adminNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                    <Link to={`/verify/${report.productId}`} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline transition-colors min-h-[36px]">
                      <span>Inspect Target Product Record</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    {selectedReportId === report.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={newStatus}
                          onChange={e => setNewStatus(e.target.value as any)}
                          className="h-10 px-3 text-xs border border-input rounded-xl bg-card text-foreground font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="INVESTIGATING">Mark Investigating</option>
                          <option value="RESOLVED_VALID">Mark Resolved Valid</option>
                          <option value="CONFIRMED_FRAUD">Mark Confirmed Counterfeit</option>
                          <option value="DISMISSED">Dismiss</option>
                        </select>
                        <Input
                          type="text"
                          placeholder="Resolution notes..."
                          value={adminNotes}
                          onChange={e => setAdminNotes(e.target.value)}
                          className="h-10 text-xs w-48"
                        />
                        <Button
                          size="sm"
                          variant="botanical"
                          onClick={() => handleUpdate(report.id)}
                          className="font-bold min-h-[40px]"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReportId(null)}
                          className="text-xs min-h-[40px]"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedReportId(report.id);
                          setNewStatus(report.status);
                        }}
                        className="font-bold text-xs min-h-[36px]"
                      >
                        Update Investigation Status
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
