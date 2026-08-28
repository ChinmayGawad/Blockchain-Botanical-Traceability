import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconColor?: string;
  bgColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-emerald-700',
  bgColor = 'bg-emerald-50',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border border-slate-100 ${bgColor} ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 font-medium">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={`font-bold ${
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
