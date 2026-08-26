import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UserApprovalsPage: React.FC = () => {
  const { users, approveUser, rejectUser } = useAuth();

  const handleApprove = (userId: string) => {
    approveUser(userId);
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleReject = (userId: string) => {
    rejectUser(userId);
  };

  return (
    <DashboardLayout
      title="Stakeholder Governance & Node Approvals"
      subtitle="Verify credentials of Farmers, Processors, Testing Labs, Distributors, and Retailers before granting Hyperledger Fabric channel membership."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <span>Stakeholder Membership Applications</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Consortium Nodes: {users.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Stakeholder Identity</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Organization & Hub</th>
                  <th className="px-5 py-3">Certifications</th>
                  <th className="px-5 py-3">Membership Status</th>
                  <th className="px-5 py-3 text-right">Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={user.role} size="sm" showIcon={false} />
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{user.organization}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} />
                        <span>{user.location}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {user.certifications && user.certifications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.certifications.map((c, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard KYC</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {user.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Active Node
                        </span>
                      )}
                      {user.status === 'PENDING_APPROVAL' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                          Pending Audit
                        </span>
                      )}
                      {user.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                          Revoked
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {user.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <ShieldCheck size={14} />
                            <span>Authorize</span>
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Authorized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
