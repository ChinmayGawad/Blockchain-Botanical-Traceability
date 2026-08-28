import React from 'react';
import { ProductStatus, VerificationState, UserRole } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Truck,
  FlaskConical,
  Sprout,
  Store,
  Cog,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ProductStatus | VerificationState | UserRole | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 15,
  };

  const getStyle = () => {
    switch (status) {
      // Verification states
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          icon: <ShieldCheck size={iconSizes[size]} className="text-emerald-700" />,
          label: 'Blockchain Verified',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <ShieldAlert size={iconSizes[size]} className="text-amber-700" />,
          label: 'Flagged / Suspicious',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
          icon: <ShieldX size={iconSizes[size]} className="text-rose-700" />,
          label: 'Rejected (QA Fail)',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
          icon: <Clock size={iconSizes[size]} className="text-indigo-700" />,
          label: 'In Progress',
        };

      // Product lifecycle states
      case 'REGISTERED':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-300',
          icon: <Sprout size={iconSizes[size]} className="text-teal-700" />,
          label: 'Harvest Registered',
        };
      case 'PROCESSING':
      case 'PROCESSED':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-300',
          icon: <Cog size={iconSizes[size]} className="text-purple-700" />,
          label: status === 'PROCESSING' ? 'Processing Active' : 'Processed',
        };
      case 'IN_TESTING':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
          icon: <FlaskConical size={iconSizes[size]} className="text-indigo-700" />,
          label: 'Lab QA Testing',
        };
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          icon: <CheckCircle2 size={iconSizes[size]} className="text-emerald-700" />,
          label: 'Lab QA Approved',
        };
      case 'IN_TRANSIT':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-300',
          icon: <Truck size={iconSizes[size]} className="text-sky-700" />,
          label: 'In Transit',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-300',
          icon: <CheckCircle2 size={iconSizes[size]} className="text-blue-700" />,
          label: 'Delivered to Store',
        };
      case 'RETAIL_READY':
        return {
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold',
          icon: <Store size={iconSizes[size]} className="text-emerald-800" />,
          label: 'Retail Ready & Verified',
        };
      case 'RECALLED':
        return {
          bg: 'bg-rose-100 text-rose-950 border-rose-400 font-extrabold',
          icon: <XCircle size={iconSizes[size]} className="text-rose-800" />,
          label: 'RECALLED',
        };

      // Roles
      case 'ADMIN':
        return { bg: 'bg-slate-100 text-slate-900 border-slate-300', icon: null, label: 'Admin' };
      case 'FARMER':
        return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-300', icon: null, label: 'Farmer' };
      case 'PROCESSOR':
        return { bg: 'bg-purple-50 text-purple-900 border-purple-300', icon: null, label: 'Processor' };
      case 'LABORATORY':
        return { bg: 'bg-indigo-50 text-indigo-900 border-indigo-300', icon: null, label: 'Quality Lab' };
      case 'DISTRIBUTOR':
        return { bg: 'bg-sky-50 text-sky-900 border-sky-300', icon: null, label: 'Distributor' };
      case 'RETAILER':
        return { bg: 'bg-teal-50 text-teal-900 border-teal-300', icon: null, label: 'Retailer' };
      case 'CONSUMER':
        return { bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: null, label: 'Consumer' };

      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: null,
          label: status,
        };
    }
  };

  const config = getStyle();

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-all ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
