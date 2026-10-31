import { Navigate, useParams } from 'react-router-dom';

/**
 * Helper redirect component for legacy/sub-policy slugs to resolve cannibalization and redirect chains
 */
export function PolicyRedirect() {
  const { slug } = useParams<{ slug: string }>();
  if (slug === 'size-guide') return <Navigate to="/size-guide" replace />;
  if (slug?.startsWith('shipping')) return <Navigate to="/shipping-policy" replace />;
  if (slug?.startsWith('return')) return <Navigate to="/returns-refunds" replace />;
  if (slug?.startsWith('privacy')) return <Navigate to="/privacy-policy" replace />;
  if (slug?.startsWith('terms')) return <Navigate to="/terms" replace />;
  if (slug?.startsWith('cancellation')) return <Navigate to="/cancellation-policy" replace />;
  return <Navigate to="/policies" replace />;
}

/**
 * Helper redirect component for collection slugs
 */
export function CollectionRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/shop?collection=${slug || ''}`} replace />;
}
