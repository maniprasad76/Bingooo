import { lazy } from 'react';

/**
 * Lazy-load a page component that is exported as a *named* export.
 * React.lazy() expects a module with a `default` export, so map it.
 */
export function lazyPage<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  name: keyof T & string,
) {
  return lazy(() =>
    loader().then((mod) => ({
      default: mod[name] as unknown as React.ComponentType,
    })),
  );
}