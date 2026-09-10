import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export type LogoVariant = 'red' | 'white' | 'dark' | 'icon' | 'icon-white';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  imgClassName?: string;
  withLink?: boolean;
  withTagline?: boolean;
  to?: string;
  alt?: string;
}

const iconSizeClasses: Record<LogoSize, string> = {
  xs: 'h-6 w-6 text-xs rounded-md',
  sm: 'h-8 w-8 text-sm rounded-lg',
  md: 'h-10 w-10 text-lg rounded-xl',
  lg: 'h-12 w-12 text-2xl rounded-xl',
  xl: 'h-14 w-14 text-3xl rounded-2xl',
  custom: 'h-10 w-10 text-lg rounded-xl',
};

const typographySizes: Record<
  LogoSize,
  {
    text: string;
    sub: string;
    subMargin: string;
    subTracking: string;
  }
> = {
  xs: {
    text: 'text-xl',
    sub: 'text-[6.5px]',
    subMargin: 'mt-0.5',
    subTracking: 'tracking-[0.15em]',
  },
  sm: {
    text: 'text-2xl',
    sub: 'text-[7.5px]',
    subMargin: 'mt-0.5 sm:mt-1',
    subTracking: 'tracking-[0.15em]',
  },
  md: {
    text: 'text-2xl sm:text-[28px]',
    sub: 'text-[7.5px] sm:text-[9px]',
    subMargin: 'mt-0.5 sm:mt-1',
    subTracking: 'tracking-[0.16em]',
  },
  lg: {
    text: 'text-3xl sm:text-4xl lg:text-[42px]',
    sub: 'text-[9.5px] sm:text-[11.5px] lg:text-[12.5px]',
    subMargin: 'mt-1 sm:mt-1.5',
    subTracking: 'tracking-[0.16em]',
  },
  xl: {
    text: 'text-4xl sm:text-5xl lg:text-6xl',
    sub: 'text-xs sm:text-[14px] lg:text-[16px]',
    subMargin: 'mt-1.5 sm:mt-2',
    subTracking: 'tracking-[0.17em]',
  },
  custom: {
    text: 'text-2xl sm:text-3xl',
    sub: 'text-[8px] sm:text-[9px]',
    subMargin: 'mt-1',
    subTracking: 'tracking-[0.16em]',
  },
};

export function Logo({
  variant = 'red',
  size = 'md',
  className,
  imgClassName,
  withLink = false,
  withTagline = true,
  to = '/',
  alt = 'Bingooo — Premium Menswear',
}: LogoProps) {
  const isIcon = variant === 'icon' || variant === 'icon-white';
  const isWhite = variant === 'white' || variant === 'icon-white';
  const isRed = variant === 'red';
  const config = typographySizes[size];

  const textColor = isRed
    ? 'text-[#E6321C]'
    : isWhite
    ? 'text-white'
    : 'text-[#171717]';

  const dotColor = 'text-[#E6321C]';

  const subtextColor = isWhite
    ? 'text-[#F7EEDB]/85'
    : isRed
    ? 'text-[#6F6A63]'
    : 'text-[#6F6A63]';

  const logoContent = isIcon ? (
    <div
      className={cn(
        'inline-flex items-center justify-center font-heading font-black select-none border transition-colors shrink-0 shadow-xs',
        variant === 'icon-white'
          ? 'bg-white/10 border-white/15'
          : 'bg-[#F7EEDB] border-[#D6C8AE]',
        iconSizeClasses[size],
        imgClassName
      )}
      aria-label={alt}
      role="img"
    >
      <span className="leading-none text-[#E6321C] flex items-baseline">
        B<span className="text-[#171717]">.</span>
      </span>
    </div>
  ) : (
    <div
      className={cn(
        'inline-flex flex-col select-none leading-none transition-transform duration-200',
        imgClassName
      )}
      aria-label={alt}
      role="img"
    >
      <div
        className={cn(
          'font-heading font-black tracking-tighter uppercase leading-none',
          config.text,
          textColor
        )}
      >
        BINGOOO<span className={dotColor}>.</span>
      </div>
      {withTagline && (
        <div
          className={cn(
            'font-sans font-extrabold uppercase select-none leading-none',
            config.sub,
            config.subMargin,
            config.subTracking,
            subtextColor
          )}
        >
          WEAR WHAT DEFINES YOU.
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        to={to}
        className={cn(
          'inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6321C] rounded-sm group',
          className
        )}
        aria-label="Bingooo Home"
      >
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={cn('inline-flex items-center shrink-0', className)}>
      {logoContent}
    </div>
  );
}
