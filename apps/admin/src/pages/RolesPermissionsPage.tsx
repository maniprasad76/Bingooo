import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Trash2,
  LoaderCircle,
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api/client';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: string[];
}

export interface PermissionKey {
  key: string;
  label: string;
  group: string;
}

export function RolesPermissionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => api.get<RoleDefinition[]>('/roles'),
  });

  const { data: allPermissionKeys = [] } = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => api.get<PermissionKey[]>('/roles/permissions'),
  });

  const selectedRole =
    roles.find((r) => r.id === selectedRoleId) || roles[0] || null;

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      api.put(`/roles/${id}`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast({
        title: 'Permissions matrix synchronized',
        description: 'Updated capability grants for this role.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update role permissions.',
        variant: 'danger',
      });
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: { name: string; description: string; permissions: string[] }) =>
      api.post('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast({
        title: 'New role established',
        description: `Custom role ${newRoleName} created.`,
        variant: 'success',
      });
      setNewRoleName('');
      setNewRoleDesc('');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Creation failed',
        description: err.message || 'Could not create role.',
        variant: 'danger',
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      toast({ title: 'Role deleted', variant: 'success' });
    },
    onError: (err: any) => {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete role.',
        variant: 'danger',
      });
    },
  });

  const handleTogglePermission = (key: string) => {
    if (!selectedRole || selectedRole.isSystem) {
      if (selectedRole?.name === 'Super Admin') {
        toast({
          title: 'Unrestricted Role',
          description: 'Super Admin permissions cannot be restricted.',
          variant: 'default',
        });
      }
      return;
    }

    const current = selectedRole.permissions || [];
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];

    updateRoleMutation.mutate({ id: selectedRole.id, permissions: updated });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDesc,
      permissions: ['products.read', 'orders.read'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-admin p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-bold uppercase text-brand-red">
            <ShieldCheck size={14} /> Security Matrix
          </span>
          <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
            Roles & Granular Permissions
          </h2>
          <p className="text-xs text-muted">
            Configure role-based access control (RBAC), enforce least-privilege policies, and guard operational endpoints.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-xs font-bold text-white hover:bg-brand-red/90 shadow-xs"
        >
          <Plus size={14} /> Add Custom Role
        </button>
      </div>

      {isRolesLoading ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted">
          <LoaderCircle size={22} className="animate-spin text-brand-red" />
          <span className="text-xs font-bold uppercase tracking-wider">Syncing RBAC matrix...</span>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Roles Selector (4 cols) */}
          <div className="space-y-3 lg:col-span-4">
            <h3 className="font-bold text-ink text-sm px-1">Defined Store Roles</h3>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`card-admin p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-red ring-1 ring-brand-red bg-[#FAF8F5]'
                        : 'hover:border-brand-red/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {role.name === 'Super Admin' ? (
                          <Crown size={15} className="text-brand-red" />
                        ) : (
                          <ShieldCheck size={15} className="text-muted" />
                        )}
                        <h4 className="font-bold text-ink text-xs">{role.name}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-[#EDE0CC] px-2 py-0.5 text-[10px] font-bold text-ink">
                          {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                        </span>
                        {!role.isSystem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRoleMutation.mutate(role.id);
                            }}
                            className="p-1 text-muted hover:text-brand-red"
                            title="Delete custom role"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] text-muted line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix (8 cols) */}
          {selectedRole && (
            <div className="lg:col-span-8 card-admin p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink text-lg">{selectedRole.name}</h3>
                    {selectedRole.isSystem && (
                      <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-bold text-muted border border-border">
                        System Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{selectedRole.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-brand-red">
                    {selectedRole.permissions?.length || 0} Permissions Granted
                  </span>
                </div>
              </div>

              {/* Permission Groups */}
              <div className="grid gap-4 sm:grid-cols-2">
                {allPermissionKeys.map((perm) => {
                  const isChecked = (selectedRole.permissions || []).includes(perm.key);
                  const isSuper = selectedRole.name === 'Super Admin';

                  return (
                    <div
                      key={perm.key}
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all select-none ${
                        isChecked
                          ? 'border-brand-red/30 bg-[#FDF0EE]/40'
                          : 'border-border bg-white hover:border-brand-red/20'
                      } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border mt-0.5 ${
                          isChecked
                            ? 'border-brand-red bg-brand-red text-white'
                            : 'border-border bg-white'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-xs">{perm.label}</span>
                          <span className="text-[10px] font-mono text-muted">({perm.group})</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted block">{perm.key}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish Custom Role"
      >
        <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-ink mb-1.5">Role Designation</label>
            <input
              required
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Senior Merchandiser"
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-ink focus:border-brand-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">Role Description & Responsibilities</label>
            <textarea
              required
              rows={3}
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Describe scope of authority..."
              className="w-full rounded-xl border border-border bg-[#FAF8F5] px-3 py-2 text-ink focus:border-brand-red focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2 font-bold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRoleMutation.isPending}
              className="rounded-xl bg-brand-red px-4 py-2 font-bold text-white hover:bg-brand-red/90 disabled:opacity-50"
            >
              {createRoleMutation.isPending ? 'Establishing...' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
