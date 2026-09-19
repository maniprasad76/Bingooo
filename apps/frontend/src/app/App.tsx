import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/ui/Toast';
import { initAuth } from '../lib/auth/supabase';
import { router } from './router';
import { setPreloaderQueryClient } from '../lib/utils/preloader';
import { registerServiceWorker } from '../lib/sw/registerServiceWorker';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { GlobalErrorBoundary } from '../components/common/GlobalErrorBoundary';
import { BrandIntroScreen } from '../components/brand';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute stale time for snappy cached navigation
      gcTime: 30 * 60 * 1000, // 30 minutes in-memory retention
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Prevents unnecessary re-render flashing
    },
  },
});

setPreloaderQueryClient(queryClient);

export function App() {
  useEffect(() => {
    initAuth();
    registerServiceWorker();
  }, []);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <OfflineBanner />
          <BrandIntroScreen />
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
