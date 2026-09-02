import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#171717]/10 text-[#171717]',
  accent: 'bg-[#E6321C]/10 text-[#E6321C] font-bold',
  success: 'bg-[#238636]/10 text-[#238636] font-bold',
  danger: 'bg-[#C62828]/10 text-[#C62828] font-bold',
  outline: 'border border-[#DDD3C5] text-[#6F6A63]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] tracking-wider uppercase',
  md: 'px-2.5 py-0.5 text-[11px] tracking-wider uppercase',
  lg: 'px-3 py-1 text-xs tracking-wider uppercase font-bold',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-sans font-semibold',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
