import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, LoaderCircle, AlertCircle } from 'lucide-react';
import { adminLogin, loginAsDevAdmin } from '../lib/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = () => {
    loginAsDevAdmin();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-red/10 mb-4">
            <Store size={28} className="text-brand-red" />
          </div>
          <h1 className="text-xl font-extrabold uppercase tracking-widest text-white">
            Bingooo
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">
            Admin Panel
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-elevated space-y-4"
        >
          <div>
            <h2 className="text-base font-bold text-ink">Sign in to Admin</h2>
            <p className="text-xs text-muted mt-0.5">
              Enter your admin credentials to continue.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-light p-3">
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-danger">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="admin-email" className="admin-label">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bingooo.in"
                required
                autoComplete="email"
                className="admin-input"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="admin-label">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="admin-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Dev bypass */}
        <div className="mt-4 text-center">
          <button
            onClick={handleDevLogin}
            className="text-[10px] font-mono font-medium text-white/20 hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Dev Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
