import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/auth/supabase';
import { useAuthStore } from '../store/auth';
import { Logo } from '../components/ui/Logo';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      if (!supabase) {
        if (isMounted) {
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        // Check for admin intent from cookies, searchParams, or hashParams
        const hasAdminCookie = document.cookie.includes('bingooo_admin_login=1');
        const cookieOriginMatch = document.cookie.match(/bingooo_admin_origin=([^;]+)/);
        const cookieAdminOrigin = cookieOriginMatch ? decodeURIComponent(cookieOriginMatch[1]) : null;

        const isFromAdmin =
          searchParams.get('source') === 'admin' ||
          hashParams.get('source') === 'admin' ||
          hasAdminCookie;

        const adminOrigin =
          searchParams.get('admin_origin') ||
          hashParams.get('admin_origin') ||
          cookieAdminOrigin ||
          (window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://admin.bingooo.co.in');

        const handleUserSession = (session: any) => {
          const authStorageKey = 'bingooo_auth_token';
          localStorage.setItem(authStorageKey, session.access_token);
          useAuthStore.getState().setAuth(session.user.id, {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          });

          const userEmail = session.user.email?.toLowerCase();
          const SUPER_ADMIN_EMAILS = [
            'basaprasaduu@gmail.com',
            'admin@bingooo.in',
            'prasad@bingooo.co.in',
          ];

          // If from admin panel OR authorized Super Admin
          if (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail) && isFromAdmin) {
            // Clean up admin cookies
            document.cookie = 'bingooo_admin_login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            document.cookie = 'bingooo_admin_origin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            sessionStorage.removeItem('bingooo_auth_redirect');

            const targetUrl = `${adminOrigin}/dashboard#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token || '')}`;
            window.location.href = targetUrl;
            return;
          }

          if (isFromAdmin) {
            // User tried to log into admin but their email is not an authorized Super Admin
            document.cookie = 'bingooo_admin_login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            document.cookie = 'bingooo_admin_origin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            window.location.href = `${adminOrigin}/login?error=unauthorized`;
            return;
          }

          const destination = sessionStorage.getItem('bingooo_auth_redirect') || '/account';
          sessionStorage.removeItem('bingooo_auth_redirect');
          if (isMounted) {
            navigate(destination, { replace: true });
          }
        };

        // Exchange code/tokens for session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          handleUserSession(data.session);
          return;
        }

        // Listen for auth state change if session is still settling
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            handleUserSession(session);
          }
        });

        // Fallback safety timeout after 6s
        const timer = setTimeout(() => {
          if (isMounted) {
            navigate('/account', { replace: true });
          }
        }, 6000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Authentication could not be completed.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2500);
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center bg-[#FAF8F5]">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <Logo variant="red" size="md" />

        <div className="relative flex items-center justify-center mt-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#DDD3C5] border-t-[#E6321C] animate-spin" />
        </div>

        <div className="space-y-1 mt-2">
          <h2 className="text-base font-bold text-[#171717] tracking-tight">
            {errorMsg ? 'Authentication Note' : 'Completing Secure Sign-In'}
          </h2>
          <p className="text-xs text-[#6F6A63]">
            {errorMsg || 'Verifying your credentials and setting up your Bingooo session...'}
          </p>
        </div>
      </div>
    </div>
  );
}
export default AuthCallbackPage;
