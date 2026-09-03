import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  const styles: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/25',
    paid: 'bg-success/10 text-success border-success/25',
    delivered: 'bg-success/10 text-success border-success/25',
    approved: 'bg-success/10 text-success border-success/25',
    ready_for_print: 'bg-success/10 text-success border-success/25',

    processing: 'bg-[#FDF0EE] text-[#B91F12] border-[#E6321C]/25',
    needs_review: 'bg-[#FDF0EE] text-[#B91F12] border-[#E6321C]/25',
    packed: 'bg-[#FDF0EE] text-[#B91F12] border-[#E6321C]/25',

    pending: 'bg-warning/10 text-warning border-warning/25',
    pending_payment: 'bg-warning/10 text-warning border-warning/25',
    uploaded: 'bg-warning/10 text-warning border-warning/25',
    under_review: 'bg-warning/10 text-warning border-warning/25',

    shipped: 'bg-info/10 text-info border-info/25',
    out_for_delivery: 'bg-info/10 text-info border-info/25',

    draft: 'bg-[#F7EEDB] text-[#6F6A63] border-[#DDD3C5]',
    archived: 'bg-black/5 text-[#6F6A63] border-black/10',

    cancelled: 'bg-danger/10 text-danger border-danger/25',
    rejected: 'bg-danger/10 text-danger border-danger/25',
    failed: 'bg-danger/10 text-danger border-danger/25',
  };

  const currentStyle = styles[normalized] || 'bg-black/5 text-[#6F6A63] border-[#DDD3C5]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize tracking-wide',
        currentStyle,
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
