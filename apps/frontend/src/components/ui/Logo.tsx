import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export type LogoVariant = 'red' | 'white' | 'dark' | 'icon';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  imgClassName?: string;
  withLink?: boolean;
  to?: string;
  alt?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  xs: 'h-5 w-auto',
  sm: 'h-6 sm:h-7 w-auto',
  md: 'h-7 sm:h-8 w-auto',
  lg: 'h-10 sm:h-11 w-auto',
  xl: 'h-12 sm:h-16 w-auto',
  custom: '',
};

const iconSizes: Record<LogoSize, string> = {
  xs: 'h-5 w-5',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
  custom: '',
};

export function Logo({
  variant = 'red',
  size = 'md',
  className,
  imgClassName,
  withLink = false,
  to = '/',
  alt = 'Bingooo — Premium Custom Fashion',
}: LogoProps) {
  let src = '/logo.png';
  if (variant === 'white') {
    src = '/logo-white.png';
  } else if (variant === 'dark') {
    src = '/logo-dark.png';
  } else if (variant === 'icon') {
    src = '/icon-192.png';
  }

  const dimensionClass = variant === 'icon' ? iconSizes[size] : sizeClasses[size];

  const imgElement = (
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="async"
      className={cn(
        'object-contain select-none transition-transform duration-200',
        dimensionClass,
        imgClassName
      )}
    />
  );

  if (withLink) {
    return (
      <Link
        to={to}
        className={cn(
          'inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm group',
          className
        )}
        aria-label="Bingooo Home"
      >
        {imgElement}
      </Link>
    );
  }

  return (
    <div className={cn('inline-flex items-center shrink-0', className)}>
      {imgElement}
    </div>
  );
}
