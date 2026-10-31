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
  default: 'bg-[#171717] text-white border border-[#171717]',
  accent: 'bg-[#E6321C] text-white border border-[#171717]',
  success: 'bg-[#238636] text-white border border-[#171717]',
  danger: 'bg-[#C62828] text-white border border-[#171717]',
  outline: 'border-2 border-[#171717] text-[#171717] bg-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[9px] tracking-wider uppercase font-mono',
  md: 'px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-mono',
  lg: 'px-3 py-1 text-xs tracking-wider uppercase font-mono font-bold',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[2px] font-mono font-bold select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
