import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../lib/analytics';

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll instantly to top on page change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    // Track SPA route navigation in Google Analytics 4
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
