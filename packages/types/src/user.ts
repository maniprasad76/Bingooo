// ─────────────────────────────────────────────────────────
// @bingooo/types — User, Profile, Role, Permission types
// ─────────────────────────────────────────────────────────

/** Application role codes */
export type RoleCode = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER';

/** Permission codes from doc 05 */
export type PermissionCode =
  | 'products.read'
  | 'products.write'
  | 'orders.read'
  | 'orders.update'
  | 'customers.read'
  | 'customizations.review'
  | 'payments.refund'
  | 'settings.manage';

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
}

export interface Permission {
  id: string;
  code: PermissionCode;
  name: string;
}

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
  avatarKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRoles extends Profile {
  roles: RoleCode[];
  permissions: PermissionCode[];
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}
