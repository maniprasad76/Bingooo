import { type ClassValue, clsx } from 'clsx';

/** Merge class names — thin wrapper over clsx for consistency */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Resolve media URLs — rewrites localhost:3000 API urls to production API or relative /api/ for Vite proxy */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  const isProd =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'bingooo.co.in' ||
      window.location.hostname.endsWith('.bingooo.co.in') ||
      window.location.hostname.includes('vercel.app'));

  if (url.startsWith('http://localhost:3000/api/')) {
    return isProd
      ? url.replace('http://localhost:3000', 'https://api.bingooo.co.in')
      : url.replace('http://localhost:3000', '');
  }

  if (url.startsWith('https://localhost:3000/api/')) {
    return isProd
      ? url.replace('https://localhost:3000', 'https://api.bingooo.co.in')
      : url.replace('https://localhost:3000', '');
  }

  return url;
}
