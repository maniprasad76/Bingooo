import { type ClassValue, clsx } from 'clsx';

/** Merge class names — thin wrapper over clsx for consistency */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Resolve media URLs — rewrites localhost:3000 API urls to production API or relative /api/ for Vite proxy */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  let normalized = url;
  if (normalized.includes('tshirt-step-3-black.png')) {
    normalized = normalized.replace('tshirt-step-3-black.png', 'black-front.png');
  }

  const isProd =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'bingooo.co.in' ||
      window.location.hostname.endsWith('.bingooo.co.in') ||
      window.location.hostname.includes('vercel.app'));

  if (normalized.startsWith('http://localhost:3000/api/')) {
    return isProd
      ? normalized.replace('http://localhost:3000', 'https://api.bingooo.co.in')
      : normalized.replace('http://localhost:3000', '');
  }

  if (normalized.startsWith('https://localhost:3000/api/')) {
    return isProd
      ? normalized.replace('https://localhost:3000', 'https://api.bingooo.co.in')
      : normalized.replace('https://localhost:3000', '');
  }

  if (normalized.startsWith('/api/')) {
    return isProd ? `https://api.bingooo.co.in${normalized}` : normalized;
  }

  return normalized;
}
