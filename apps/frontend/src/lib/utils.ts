import { type ClassValue, clsx } from 'clsx';

/** Merge class names — thin wrapper over clsx for consistency */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Resolve media URLs — rewrites localhost:3000 API urls to relative /api/ for Vite proxy */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://localhost:3000/api/')) {
    return url.replace('http://localhost:3000', '');
  }
  return url;
}
