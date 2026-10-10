import type { SVGProps, ImgHTMLAttributes } from 'react';
import { Picture } from './Picture';
import { IMAGES } from '../../lib/images';

export interface SocialIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
}

export const BINGOOO_PHONE_DISPLAY = '+91 79817 87317';
export const BINGOOO_PHONE_RAW = '917981787317';
export const BINGOOO_PHONE_TEL = 'tel:+917981787317';
export const BINGOOO_EMAIL_SUPPORT = 'bingooo.sklm@gmail.com';
export const BINGOOO_EMAIL_HELLO = 'bingooo.sklm@gmail.com';
export const BINGOOO_INSTAGRAM_URL = 'https://www.instagram.com/bingooo.co.in';
export const BINGOOO_INSTAGRAM_HANDLE = '@bingooo.co.in';
export const BINGOOO_YOUTUBE_URL = 'https://www.youtube.com/@bingooo_co';
export const BINGOOO_YOUTUBE_HANDLE = '@bingooo_co';
export const BINGOOO_TWITTER_URL = 'https://twitter.com/bingooo_co';
export const BINGOOO_TWITTER_HANDLE = '@bingooo_co';
export const BINGOOO_COMMUNITY_URL = 'https://chat.whatsapp.com/HRFrD7YPl8f1xdLvPXvDiQ';

export function getWhatsAppUrl(message?: string): string {
  const defaultMsg = 'Hi Bingooo, I would like to inquire about your menswear collection and custom designs.';
  const text = encodeURIComponent(message || defaultMsg);
  return `https://wa.me/${BINGOOO_PHONE_RAW}?text=${text}`;
}

export function getEmailUrl(subject?: string, body?: string): string {
  const s = subject ? encodeURIComponent(subject) : encodeURIComponent('Inquiry from Bingooo Store');
  const b = body ? `&body=${encodeURIComponent(body)}` : '';
  return `mailto:${BINGOOO_EMAIL_SUPPORT}?subject=${s}${b}`;
}

export function WhatsAppIcon({ className = 'w-5 h-5', size, style, ...props }: SocialIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.whatsapp}
      alt="WhatsApp"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...props}
    />
  );
}

export function InstagramIcon({ className = 'w-5 h-5', size, style, ...props }: SocialIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.instagram}
      alt="Instagram"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...props}
    />
  );
}

export function EmailIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'w-5 h-5', size, style, ...props }: SocialIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.youtube}
      alt="YouTube"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...props}
    />
  );
}

export function PinterestIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export function XTwitterIcon({ className = 'w-5 h-5', size, style, ...props }: SocialIconProps) {
  const styleObj = size ? { width: size, height: size, ...style } : style;
  return (
    <Picture
      image={IMAGES.twitter}
      alt="Twitter (X)"
      className={`max-h-full max-w-full object-contain shrink-0 ${className}`}
      style={styleObj}
      {...props}
    />
  );
}

export function GoogleIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#1877F2"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

