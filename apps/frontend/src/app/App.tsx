import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/ui/Toast';
import { initAuth } from '../lib/auth/supabase';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5, // 5 seconds for snappy updates from admin changes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});


export function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
