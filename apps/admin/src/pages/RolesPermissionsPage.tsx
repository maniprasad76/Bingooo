import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Check,
  Lock,
  Crown,
  Layers,
  ShoppingBag,
  CreditCard,
  Settings,
  Users,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: string[];
}

const allPermissionKeys = [
  { key: 'products.read', label: 'View Products & Catalog', group: 'Products' },
  { key: 'products.create', label: 'Create New Garments', group: 'Products' },
  { key: 'products.update', label: 'Update Pricing & Specs', group: 'Products' },
  { key: 'products.delete', label: 'Archive / Delete Garments', group: 'Products' },
  { key: 'orders.read', label: 'View Customer Orders', group: 'Orders' },
  { key: 'orders.update', label: 'Update Fulfillment & Status', group: 'Orders' },
  { key: 'customizations.review', label: 'Review Custom Artwork', group: 'Custom Studio' },
  { key: 'payments.read', label: 'View Payment Ledgers', group: 'Finance' },
  { key: 'refunds.manage', label: 'Issue & Authorize Refunds', group: 'Finance' },
  { key: 'users.manage', label: 'Manage Staff Members', group: 'Team' },
  { key: 'roles.manage', label: 'Modify Permissions Matrix', group: 'Team' },
  { key: 'settings.manage', label: 'Configure Store Parameters', group: 'Settings' },
];

const initialRoles: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Unrestricted root administrator access across all systems, database stores, and financial settlements.',
    userCount: 1,
    isSystem: true,
    permissions: allPermissionKeys.map((p) => p.key),
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Comprehensive store management excluding master server environment configurations.',
    userCount: 2,
    isSystem: true,
    permissions: [
      'products.read',
      'products.create',
      'products.update',
      'orders.read',
      'orders.update',
      'customizations.review',
      'payments.read',
      'refunds.manage',
      'users.manage',
      'settings.manage',
    ],
  },
  {
    id: 'role-product-mgr',
    name: 'Product Manager',
    description: 'Full ownership of catalog taxonomy, garment fabric specifications, inventory and pricing.',
    userCount: 3,
    isSystem: false,
    permissions: ['products.read', 'products.create', 'products.update', 'products.delete'],
  },
  {
    id: 'role-order-mgr',
    name: 'Order Manager',
    description: 'Manage warehouse fulfillment, courier dispatch, custom print moderation, and returns inspection.',
    userCount: 4,
    isSystem: false,
    permissions: ['orders.read', 'orders.update', 'customizations.review', 'payments.read'],
  },
  {
    id: 'role-support',
    name: 'Customer Support',
    description: 'Inspect order delivery progress, customer contact dossiers, and review moderation.',
    userCount: 5,
    isSystem: false,
    permissions: ['orders.read', 'products.read'],
  },
];

export function RolesPermissionsPage() {
  const { toast } = useToast();

  const [roles, setRoles] = useState<RoleDefinition[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(initialRoles[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New role form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['products.read', 'orders.read']);

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const newRole: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      description: newRoleDesc,
      userCount: 0,
      isSystem: false,
      permissions: selectedPerms,
    };
    setRoles((prev) => [...prev, newRole]);
    setSelectedRole(newRole);
    toast({ title: 'New operational role configured', variant: 'success' });
    setIsModalOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  const togglePermission = (key: string) => {
    if (selectedRole.isSystem && selectedRole.id === 'role-super-admin') {
      toast({ title: 'Super Admin permissions are locked to full access', variant: 'danger' });
      return;
    }
    const current = selectedRole.permissions;
    const updated = current.includes(key)
      ? current.filter((p) => p !== key)
      : [...current, key];

    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updated } : r))
    );
    setSelectedRole((prev) => ({ ...prev, permissions: updated }));
    toast({ title: 'Role permissions updated', variant: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <ShieldCheck size={14} /> Security & RBAC
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Roles & Granular Access Permissions
          </h2>
          <p className="text-xs text-muted">
            Configure backend-enforced API authorizations, role scopes, and operations staff privileges.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Role
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List (1 col) */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted px-1">
            Configured Roles ({roles.length})
          </p>
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left rounded-2xl p-4 border transition-all ${
                selectedRole.id === role.id
                  ? 'border-brand-red bg-white shadow-md'
                  : 'border-border bg-white/60 hover:bg-white hover:border-brand-red/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {role.id === 'role-super-admin' ? (
                    <Crown size={16} className="text-brand-red" />
                  ) : (
                    <ShieldCheck size={16} className="text-muted" />
                  )}
                  <h3 className="font-bold text-ink text-sm">{role.name}</h3>
                </div>
                <span className="rounded-full bg-[#F7EEDB] px-2 py-0.5 text-[10px] font-bold text-ink">
                  {role.userCount} users
                </span>
              </div>
              <p className="text-xs text-muted mt-1.5 line-clamp-2">{role.description}</p>
              <div className="mt-3 text-[11px] font-mono text-muted">
                {role.permissions.length} active permissions
              </div>
            </button>
          ))}
        </div>

        {/* Permissions Matrix for Selected Role (2 cols) */}
        <div className="lg:col-span-2 card-admin p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-ink text-lg">{selectedRole.name}</h3>
                {selectedRole.isSystem && (
                  <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    System Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-1">{selectedRole.description}</p>
            </div>
          </div>

          {/* Permissions Checklist Grouped by Resource */}
          <div className="space-y-6">
            {['Products', 'Orders', 'Custom Studio', 'Finance', 'Team', 'Settings'].map(
              (group) => {
                const groupPerms = allPermissionKeys.filter((p) => p.group === group);
                return (
                  <div key={group} className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                      {group} Privileges
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {groupPerms.map((p) => {
                        const isChecked = selectedRole.permissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'border-brand-red/30 bg-[#FDF0EE]/30 text-ink'
                                : 'border-border bg-white text-muted hover:border-border/80'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.key)}
                              disabled={selectedRole.id === 'role-super-admin'}
                              className="h-4 w-4 accent-brand-red"
                            />
                            <div>
                              <p className="text-xs font-bold">{p.label}</p>
                              <p className="text-[10px] font-mono text-muted">{p.key}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Operational Role"
        description="Define a new role and establish authorized capability boundaries."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted">
              Role Title *
              <input
                required
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Logistics Specialist"
                className="input-admin mt-1"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted">
              Role Purpose Description *
              <textarea
                rows={3}
                required
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Handles shipping label printing and reverse returns inspection."
                className="input-admin mt-1"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Role
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
