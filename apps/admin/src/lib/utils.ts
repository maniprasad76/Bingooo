import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function titleToSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  // If it's a localhost:3000 API URL, rewrite to relative /api/ for Vite proxy reliability
  if (url.startsWith('http://localhost:3000/api/')) {
    return url.replace('http://localhost:3000', '');
  }
  return url;
}
