import type { ImgHTMLAttributes } from 'react';

export interface PaymentIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
}

export function PhonePeIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/phonepe.png"
      alt="PhonePe"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function GooglePayIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/gpay.png"
      alt="Google Pay"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function PaytmIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/paytm.png"
      alt="Paytm"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function UpiIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/upi.png"
      alt="UPI"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

