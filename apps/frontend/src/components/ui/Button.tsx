import { forwardRef, type ReactNode } from 'react';
import { m, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/native/capacitorBridge';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  animateInteraction?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#E6321C] text-white hover:bg-[#ff3b20] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[4px_4px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider',
  secondary:
    'bg-white text-[#171717] border-2 border-[#171717] hover:bg-[#F7EEDB] shadow-[3px_3px_0px_#171717] hover:shadow-[4px_4px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider',
  outline:
    'border-2 border-[#171717] text-[#171717] bg-transparent hover:bg-[#171717] hover:text-white shadow-[2px_2px_0px_#171717] hover:shadow-[3px_3px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider',
  ghost:
    'text-[#171717] hover:text-[#E6321C] hover:bg-black/5 uppercase tracking-wider',
  danger:
    'bg-[#C62828] text-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:bg-[#B71C1C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[11px] font-extrabold gap-1.5 rounded-[2px]',
  md: 'h-10 px-4 text-xs font-extrabold gap-2 rounded-[2px]',
  lg: 'h-11 px-5 text-[13px] font-extrabold gap-2 rounded-[2px]',
  xl: 'h-12 sm:h-[52px] px-6 text-sm font-extrabold gap-2.5 rounded-[2px] tracking-wider',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      disabled,
      animateInteraction = true,
      whileHover,
      whileTap,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <m.button
        ref={ref}
        whileHover={
          disabled || loading || !animateInteraction
            ? undefined
            : (whileHover ?? { scale: 1.015 })
        }
        whileTap={
          disabled || loading || !animateInteraction
            ? undefined
            : (whileTap ?? { scale: 0.975 })
        }
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={cn(
          'inline-flex items-center justify-center font-sans font-semibold tracking-wide',
          'transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6321C]',
          'disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        onClick={(e) => {
          if (animateInteraction && !disabled && !loading) {
            triggerHaptic('light');
          }
          props.onClick?.(e);
        }}
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
      </m.button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
