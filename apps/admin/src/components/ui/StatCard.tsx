import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, detail, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card-admin p-5 shadow-card hover:shadow-card-hover transition-all', className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0EE] text-brand-red">
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
      <div className="mt-2 flex items-center justify-between">
        {detail && <p className="text-xs font-medium text-muted">{detail}</p>}
        {trend && (
          <span
            className={cn(
              'inline-flex text-xs font-bold',
              trend.isPositive ? 'text-success' : 'text-danger',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
