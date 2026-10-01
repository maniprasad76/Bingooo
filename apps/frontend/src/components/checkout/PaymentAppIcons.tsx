import type { ImgHTMLAttributes } from 'react';

export interface PaymentIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
}

export function PhonePeIcon({ className = 'w-6 h-6', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/phonepe.png"
      alt="PhonePe"
      className={`${className} object-contain shrink-0`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function GooglePayIcon({ className = 'w-6 h-6', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/gpay.png"
      alt="Google Pay"
      className={`${className} object-contain shrink-0`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function PaytmIcon({ className = 'w-6 h-6', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/paytm.png"
      alt="Paytm"
      className={`${className} object-contain shrink-0`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}

export function UpiIcon({ className = 'w-6 h-6', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <img
      src="/custom/upi.png"
      alt="UPI"
      className={`${className} object-contain shrink-0`}
      style={styleObj}
      loading="lazy"
      {...rest}
    />
  );
}
