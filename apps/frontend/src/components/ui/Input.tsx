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
          <label htmlFor={inputId} className="text-caption font-semibold text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full rounded-lg border bg-white px-3.5 text-body text-ink',
              'placeholder:text-muted/60',
              'transition-all duration-200',
              'focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none',
              'disabled:bg-paper disabled:opacity-60 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightElement && 'pr-11',
              error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-[#DDD3C5]',
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
          <p id={`${inputId}-error`} className="text-caption text-danger" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-caption text-muted">
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
