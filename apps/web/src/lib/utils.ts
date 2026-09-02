import { type ClassValue, clsx } from 'clsx';

/** Merge class names — thin wrapper over clsx for consistency */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
