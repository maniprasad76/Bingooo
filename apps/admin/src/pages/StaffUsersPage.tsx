import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  KeyRound,
  Trash2,
  Check,
  Crown,
  Mail,
  Clock,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
  status: 'active' | 'inactive';
  lastActive?: string;
  created_at: string;
}

export function StaffUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Order Manager');

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => api.get<StaffUser[]>('/users/staff'),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { name: string; email: string; role: string }) =>
      api.post('/users/staff', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast({
        title: 'Staff member added',
        description: `Account created for ${email} with ${role} permissions.`,
        variant: 'success',
      });
      setName('');
      setEmail('');
      setIsInviteModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to add staff',
        description: err.message || 'Could not create staff account.',
        variant: 'danger',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/users/staff/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast({ title: 'Staff account status updated', variant: 'success' });
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update staff member.',
        variant: 'danger',
      });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ name, email, role });
  };

  const filtered = staff.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <Shield size={14} /> Team & Governance
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Internal Staff & Administrative Access
          </h2>
          <p className="text-xs text-muted">
            Manage administrative personnel, department roles, privilege grants, and operational activity.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-xs font-bold text-white hover:bg-brand-red/90 shadow-sm"
        >
          <Plus size={14} /> Add Staff Member
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 card-admin p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, email, or role title..."
            className="w-full rounded-xl border border-border bg-[#FAF8F5] pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:border-brand-red focus:outline-none"
          />
        </div>

        <span className="text-xs font-bold text-muted">
          {filtered.length} Authorized Team Members
        </span>
      </div>

      {/* Staff Table */}
      <div className="card-admin overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
            <LoaderCircle size={22} className="animate-spin text-brand-red" />
            <span className="text-xs font-bold uppercase tracking-wider">Syncing staff directory...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
            <AlertCircle size={32} className="text-border mb-2" />
            <p className="text-sm font-bold text-ink">No staff accounts found</p>
            <p className="text-xs text-muted">No personnel match your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-[#F5F0EB] text-[11px] font-black uppercase text-ink">
                <tr>
                  <th className="px-6 py-3.5">Staff Name & Email</th>
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5">Last Active / Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDE0CC] font-bold text-ink">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-ink">{user.name}</div>
                          <div className="text-[11px] text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        user.role?.includes('ADMIN')
                          ? 'bg-[#FDF0EE] text-brand-red'
                          : 'bg-[#FAF8F5] text-ink border border-border'
                      }`}>
                        {user.role?.includes('ADMIN') && <Crown size={11} />}
                        {user.role?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        user.status === 'active' ? 'bg-[#EAF7EE] text-success' : 'bg-paper text-muted'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-success' : 'bg-muted'}`} />
                        {user.status || 'active'}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-muted text-[11px]">
                      {user.lastActive ? formatDate(user.lastActive) : formatDate(user.created_at)}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: user.id,
                            status: user.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted hover:text-ink hover:border-brand-red transition-colors"
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-ink mb-1.5">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siddharth Rao"
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-ink focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">Work Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. siddharth@bingooo.in"
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-ink focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">Role Assignment</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-ink focus:border-brand-red focus:outline-none font-bold"
            >
              <option value="Super Admin">Super Admin (All Store Access)</option>
              <option value="Product Manager">Product Manager (Catalog & Variants)</option>
              <option value="Order Manager">Order Manager (Fulfillment & Tracking)</option>
              <option value="Customer Support">Customer Support (Returns & Tickets)</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-[#FAF8F5] p-3 text-[11px] text-muted">
            Password defaults to <code className="font-bold text-ink">Staff@123456</code> until changed on first login.
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2 font-bold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="rounded-xl bg-brand-red px-4 py-2 font-bold text-white hover:bg-brand-red/90 disabled:opacity-50"
            >
              {inviteMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
