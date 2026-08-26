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
  ShieldX
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
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const getStyle = () => {
    switch (status) {
      // Verification states
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          icon: <ShieldCheck size={iconSizes[size]} className="text-emerald-600 dark:text-emerald-400" />,
          label: 'Blockchain Verified',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          icon: <ShieldAlert size={iconSizes[size]} className="text-amber-600 dark:text-amber-400" />,
          label: 'Flagged / Suspicious',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          icon: <ShieldX size={iconSizes[size]} className="text-rose-600 dark:text-rose-400" />,
          label: 'Rejected (QA Fail)',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
          icon: <Clock size={iconSizes[size]} className="text-blue-600 dark:text-blue-400" />,
          label: 'In Progress',
        };

      // Product lifecycle states
      case 'REGISTERED':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: <Sprout size={iconSizes[size]} className="text-teal-600" />,
          label: 'Harvest Registered',
        };
      case 'PROCESSING':
      case 'PROCESSED':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Cog size={iconSizes[size]} className="text-purple-600 animate-spin" />,
          label: status === 'PROCESSING' ? 'Processing Active' : 'Processed',
        };
      case 'IN_TESTING':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <FlaskConical size={iconSizes[size]} className="text-indigo-600" />,
          label: 'Lab QA Testing',
        };
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />,
          label: 'Lab QA Approved',
        };
      case 'IN_TRANSIT':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: <Truck size={iconSizes[size]} className="text-sky-600" />,
          label: 'In Transit',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <CheckCircle2 size={iconSizes[size]} className="text-blue-600" />,
          label: 'Delivered',
        };
      case 'RETAIL_READY':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
          icon: <Store size={iconSizes[size]} className="text-emerald-700" />,
          label: 'Retail Ready & Verified',
        };
      case 'RECALLED':
        return {
          bg: 'bg-red-100 text-red-900 border-red-300 font-bold',
          icon: <XCircle size={iconSizes[size]} className="text-red-700" />,
          label: 'RECALLED',
        };

      // Roles
      case 'ADMIN':
        return { bg: 'bg-zinc-100 text-zinc-800 border-zinc-300', icon: null, label: 'Admin' };
      case 'FARMER':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: null, label: 'Farmer' };
      case 'PROCESSOR':
        return { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: null, label: 'Processor' };
      case 'LABORATORY':
        return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: null, label: 'Quality Lab' };
      case 'DISTRIBUTOR':
        return { bg: 'bg-sky-50 text-sky-800 border-sky-200', icon: null, label: 'Distributor' };
      case 'RETAILER':
        return { bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: null, label: 'Retailer' };
      case 'CONSUMER':
        return { bg: 'bg-gray-100 text-gray-700 border-gray-200', icon: null, label: 'Consumer' };

      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null,
          label: status,
        };
    }
  };

  const config = getStyle();

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
