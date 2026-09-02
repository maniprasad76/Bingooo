import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#E6321C] text-white hover:bg-[#B91F12] active:bg-[#B91F12]/90 shadow-sm',
  secondary:
    'bg-[#EDE0CC] text-[#171717] hover:bg-[#DDD3C5] active:bg-[#DDD3C5]/90',
  outline:
    'border border-[#DDD3C5] text-[#171717] hover:border-[#E6321C] hover:text-[#E6321C] hover:bg-white',
  ghost:
    'text-[#171717] hover:text-[#E6321C] hover:bg-black/5 active:bg-black/10',
  danger:
    'bg-[#C62828] text-white hover:bg-[#B71C1C] active:bg-[#B71C1C]/90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-[11px] font-bold uppercase tracking-wider gap-1.5 rounded-[6px]',
  md: 'h-10 px-5 text-xs sm:text-[13px] font-bold uppercase tracking-wider gap-2 rounded-[8px]',
  lg: 'h-12 px-7 text-sm font-bold uppercase tracking-wider gap-2.5 rounded-[10px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans font-bold uppercase tracking-[0.06em]',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6321C]',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
