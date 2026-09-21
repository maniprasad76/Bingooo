import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, AUTHORIZED_SUPER_ADMIN_EMAILS } from '../lib/auth';
import { useAuthStore } from '../store/auth';
import { LoaderCircle, AlertCircle, ShieldCheck } from 'lucide-react';

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
        // 1. Check for tokens in hash (#access_token=...&refresh_token=...)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            if (refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        }

        // 2. Check for code exchange (?code=...) in PKCE flow
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // 3. Fetch active session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session?.user) {
          // Listen once for auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            if (session?.user) {
              validateAndRedirect(session);
            } else {
              setErrorMsg('No active administrator session found.');
              setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
          });

          return () => {
            authListener.subscription.unsubscribe();
          };
        }

        validateAndRedirect(data.session);
      } catch (err: any) {
        if (isMounted) {
          const msg = err.message || 'Authentication failed. Please try logging in again.';
          setErrorMsg(msg);
          setTimeout(() => navigate('/login', { replace: true }), 2500);
        }
      }
    }

    function validateAndRedirect(session: any) {
      const userEmail = session.user.email?.toLowerCase();
      const isAuthorized = userEmail && AUTHORIZED_SUPER_ADMIN_EMAILS.includes(userEmail);

      if (isAuthorized) {
        const AUTH_KEY = 'bingooo_auth_token';
        localStorage.setItem(AUTH_KEY, session.access_token);
        useAuthStore.getState().setAuth({
          id: session.user.id,
          email: session.user.email || userEmail,
          fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Super Admin',
          role: 'SUPER_ADMIN',
        });

        // Clean up URL hash / params cleanly
        window.history.replaceState(null, '', '/dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        // Unauthorized user: clear session and redirect to login
        supabase?.auth.signOut();
        localStorage.removeItem('bingooo_auth_token');
        useAuthStore.getState().logout();
        setErrorMsg(`Access Denied: ${session.user.email} is not authorized for Atelier Admin Console.`);
        setTimeout(() => navigate('/login?error=unauthorized', { replace: true }), 3000);
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-6 font-sans">
      <div className="w-full max-w-md p-8 bg-[#1A1816] border border-[#2B2825] rounded-sm text-center shadow-2xl">
        {errorMsg ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-tight text-red-400">Authentication Failed</h2>
            <p className="text-sm text-[#A09D96] leading-relaxed">{errorMsg}</p>
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#8E8B85] mt-2">
              Redirecting to sign in…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E6321C]/10 border border-[#E6321C]/20 flex items-center justify-center text-[#E6321C]">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-tight text-white font-heading">
              Verifying Atelier Credentials
            </h2>
            <p className="text-sm text-[#A09D96]">
              Authenticating Super Administrator session…
            </p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#E6321C]">
              <LoaderCircle size={16} className="animate-spin text-[#E6321C]" />
              <span>CENTRAL COMMAND SYNC</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AuthCallbackPage;
