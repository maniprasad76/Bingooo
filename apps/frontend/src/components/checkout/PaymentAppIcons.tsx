import type { ImgHTMLAttributes } from 'react';
import { Picture } from '../ui/Picture';
import { IMAGES } from '../../lib/images';

export interface PaymentIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
}

export function PhonePeIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.phonepe}
      alt="PhonePe"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...rest}
    />
  );
}

export function GooglePayIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.gpay}
      alt="Google Pay"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...rest}
    />
  );
}

export function PaytmIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.paytm}
      alt="Paytm"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...rest}
    />
  );
}

export function UpiIcon({ className = 'h-5 w-auto', size, style, ...rest }: PaymentIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.upi}
      alt="UPI"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...rest}
    />
  );
}

