import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';
import {
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UserApprovalsPage: React.FC = () => {
  const { users, approveUser, rejectUser } = useAuth();
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

  const handleApprove = (userId: string) => {
    approveUser(userId);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleConfirmReject = () => {
    if (rejectingUserId) {
      rejectUser(rejectingUserId);
      setRejectingUserId(null);
    }
  };

  const userToReject = users.find(u => u.id === rejectingUserId);

  return (
    <DashboardLayout
      title="Stakeholder Governance & Node Approvals"
      subtitle="Verify credentials of Farmers, Processors, Testing Labs, Distributors, and Retailers before granting Hyperledger Fabric channel membership."
    >
      <div className="space-y-6">
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Stakeholder Membership Applications</span>
            </CardTitle>
            <Badge variant="secondary" className="font-semibold text-xs">
              Total Consortium Nodes: {users.length}
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase font-bold border-b border-border">
                  <tr>
                    <th className="px-5 py-3.5">Stakeholder Identity</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Organization & Hub</th>
                    <th className="px-5 py-3.5">Certifications</th>
                    <th className="px-5 py-3.5">Membership Status</th>
                    <th className="px-5 py-3.5 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-foreground text-sm">{user.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={user.role} size="sm" showIcon={false} />
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        <div className="font-semibold text-foreground">{user.organization}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{user.location}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {user.certifications && user.certifications.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.certifications.map((c, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Standard KYC</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.status === 'ACTIVE' && (
                          <Badge variant="success" className="gap-1 font-bold text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Active Node</span>
                          </Badge>
                        )}
                        {user.status === 'PENDING_APPROVAL' && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 gap-1 font-bold text-xs animate-pulse"
                          >
                            <span>Pending Audit</span>
                          </Badge>
                        )}
                        {user.status === 'REJECTED' && (
                          <Badge variant="destructive" className="gap-1 font-bold text-xs">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Revoked</span>
                          </Badge>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {user.status === 'PENDING_APPROVAL' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="botanical"
                              onClick={() => handleApprove(user.id)}
                              className="font-bold min-h-[36px]"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                              <span>Authorize</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingUserId(user.id)}
                              className="font-bold min-h-[36px]"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Authorized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog for Rejecting a User */}
      <Dialog open={!!rejectingUserId} onOpenChange={open => !open && setRejectingUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Revoke Membership Application</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to reject the node registration request for{' '}
              <strong className="text-foreground">{userToReject?.name}</strong> (
              {userToReject?.organization})? They will not be issued cryptographic certificates to join
              the Hyperledger channel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRejectingUserId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
