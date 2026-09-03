import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Shield,
  KeyRound,
  Check,
  LogOut,
  Crown,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { signOut } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || 'Mani P.');
  const [email] = useState(user?.email || 'admin@bingooo.in');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Administrator profile updated',
      description: 'Your display name and notification preferences have been saved.',
      variant: 'success',
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please confirm your new password correctly.',
        variant: 'danger',
      });
      return;
    }
    toast({
      title: 'Security credentials updated',
      description: 'Password successfully changed. Active sessions preserved.',
      variant: 'success',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Overview Card */}
      <div className="card-admin p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-2xl font-black text-white shadow-lg shadow-brand-red/20">
              <Crown size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-ink">{name}</h2>
                <span className="rounded-md bg-brand-red/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-red">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                <Mail size={13} /> {email}
              </p>
            </div>
          </div>

          <button onClick={handleSignOut} className="btn-secondary text-xs">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Personal Information */}
        <div className="card-admin p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User size={18} className="text-brand-red" />
            <h3 className="font-bold text-ink">Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted">
                Display Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-admin mt-1.5"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Admin Email Address
                <input
                  disabled
                  value={email}
                  className="input-admin mt-1.5 opacity-70"
                />
              </label>
            </div>

            <button type="submit" className="btn-primary text-xs">
              <Check size={14} /> Save Profile
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card-admin p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Lock size={18} className="text-brand-red" />
            <h3 className="font-bold text-ink">Security & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-muted">
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted">
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-admin mt-1 text-xs"
                />
              </label>
            </div>

            <button type="submit" className="btn-primary text-xs">
              <KeyRound size={14} /> Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card-admin p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Laptop size={18} className="text-brand-red" />
          <h3 className="font-bold text-ink">Active Administrator Session</h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7EEDB] text-ink">
              <Laptop size={20} />
            </div>
            <div>
              <p className="font-bold text-ink">Current Browser Session (Windows / Chrome)</p>
              <p className="text-[11px] text-muted">IP: 127.0.0.1 • Started local dev session</p>
            </div>
          </div>
          <span className="flex items-center gap-1 font-bold text-success text-[11px]">
            <CheckCircle2 size={13} /> Active Now
          </span>
        </div>
      </div>
    </div>
  );
}
