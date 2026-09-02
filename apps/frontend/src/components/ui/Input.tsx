import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-caption font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded border bg-white px-3 text-body text-ink',
            'placeholder:text-muted',
            'transition-colors duration-hover',
            'focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none',
            'disabled:bg-paper disabled:opacity-60 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
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
