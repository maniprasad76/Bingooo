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
  default: 'bg-ink/10 text-ink',
  accent: 'bg-accent-light text-accent-hover font-semibold',
  success: 'bg-success-light text-success font-semibold',
  danger: 'bg-danger-light text-danger font-semibold',
  outline: 'border border-border text-muted',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm font-bold',
};

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
