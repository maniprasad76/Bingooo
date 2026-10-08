import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, rightElement, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#171717]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-[#171717]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-[2px] border-2 bg-white px-3.5 text-xs sm:text-sm font-bold text-[#171717]',
              'placeholder:text-[#8C867E] placeholder:font-normal',
              'transition-all duration-150',
              'focus:outline-none focus:ring-0',
              'disabled:bg-[#EDE0CC]/40 disabled:opacity-60 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightElement && 'pr-11',
              error
                ? 'border-[#E6321C] shadow-[2px_2px_0px_#E6321C] focus:border-[#E6321C] focus:shadow-[3px_3px_0px_#E6321C]'
                : 'border-[#171717] shadow-[2px_2px_0px_#171717] focus:border-[#171717] focus:shadow-[4px_4px_0px_#171717]',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E6321C]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="font-mono text-[10px] uppercase tracking-wider text-[#6F6A63]">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
