import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Product Manager' | 'Order Manager' | 'Customer Support';
  twoFactorEnabled: boolean;
  status: 'active' | 'inactive';
  lastActive: string;
}

const mockStaff: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Mani P.',
    email: 'admin@bingooo.in',
    role: 'Super Admin',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    name: 'Siddharth Rao',
    email: 'siddharth@bingooo.in',
    role: 'Order Manager',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'staff-3',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@bingooo.in',
    role: 'Product Manager',
    twoFactorEnabled: false,
    status: 'active',
    lastActive: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'staff-4',
    name: 'Rahul K.',
    email: 'rahul.k@bingooo.in',
    role: 'Customer Support',
    twoFactorEnabled: false,
    status: 'active',
    lastActive: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function StaffUsersPage() {
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffUser[]>(mockStaff);
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffUser['role']>('Order Manager');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: StaffUser = {
      id: `staff-${Date.now()}`,
      name,
      email,
      role,
      twoFactorEnabled: false,
      status: 'active',
      lastActive: 'Just invited',
    };
    setStaff((prev) => [newUser, ...prev]);
    toast({
      title: 'Staff invitation dispatched',
      description: `An activation link has been sent to ${email} with ${role} permissions.`,
      variant: 'success',
    });
    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    );
    toast({ title: 'Staff access updated', variant: 'success' });
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <UserCheck size={14} /> Team & Governance
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Staff Users & Operations Administrators
          </h2>
          <p className="text-xs text-muted">
            Manage authorized staff members, role assignments, security sessions, and administrative access.
          </p>
        </div>

        <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary">
          <Plus size={16} /> Invite Staff Member
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-4">
        <div className="relative min-w-0 flex-1 sm:min-w-[260px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, or role..."
            className="input-admin pl-10 text-xs"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#F7EEDB]/70 uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">2FA Security</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#FDF9F4]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-bold text-white text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold text-ink">{user.name}</p>
                        <p className="text-[11px] text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-[#F7EEDB]/50 px-2.5 py-1 text-xs font-bold text-ink">
                      {user.role === 'Super Admin' && <Crown size={13} className="text-brand-red" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-success font-semibold text-[11px]">
                        <KeyRound size={13} /> Active (OTP)
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">Not configured</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        user.status === 'active'
                          ? 'bg-success/15 text-success'
                          : 'bg-muted/15 text-muted'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted">
                    {user.lastActive.includes('Z') ? formatDate(user.lastActive) : user.lastActive}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'Super Admin' && (
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="text-xs font-bold text-brand-red hover:underline"
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Staff Administrator"
        description="Provide staff member email and assign granular operations role."
        maxWidth="md"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted">
              Full Name *
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rishabh Sharma"
                className="input-admin mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Work Email Address *
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rishabh@bingooo.in"
                className="input-admin mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Operational Role *
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="input-admin mt-1 text-xs font-bold"
              >
                <option value="Super Admin">Super Admin (Full System Access)</option>
                <option value="Admin">Admin (All Store Modules)</option>
                <option value="Product Manager">Product Manager (Catalog & Inventory)</option>
                <option value="Order Manager">Order Manager (Orders, Shipping, Custom Queue)</option>
                <option value="Customer Support">Customer Support (Read Only, Reviews, Orders)</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Send Invite Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
