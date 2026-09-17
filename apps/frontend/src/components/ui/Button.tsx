import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
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
    'bg-[#E6321C] text-white hover:bg-[#B91F12] active:bg-[#B91F12]/95 shadow-[0_4px_14px_rgba(230,50,28,0.28)] hover:shadow-[0_6px_20px_rgba(230,50,28,0.38)] active:translate-y-[1px]',
  secondary:
    'bg-white text-[#171717] border border-[#DDD3C5] hover:border-[#171717] hover:bg-[#FAF8F5] active:bg-[#EDE0CC]/40 shadow-2xs',
  outline:
    'border-2 border-[#171717] text-[#171717] bg-transparent hover:bg-[#171717] hover:text-white active:bg-[#171717]/90',
  ghost:
    'text-[#171717] hover:text-[#E6321C] hover:bg-black/5 active:bg-black/10',
  danger:
    'bg-[#C62828] text-white hover:bg-[#B71C1C] active:bg-[#B71C1C]/90 shadow-2xs',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[11px] font-bold gap-1.5 rounded-md',
  md: 'h-10 px-4 text-xs font-bold gap-2 rounded-[8px]',
  lg: 'h-11 px-5 text-[13px] font-bold gap-2 rounded-[10px]',
  xl: 'h-12 sm:h-[52px] px-6 text-sm font-bold gap-2.5 rounded-[10px] tracking-wider',
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
      <motion.button
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
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
