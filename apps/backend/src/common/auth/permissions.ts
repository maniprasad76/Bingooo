// ─────────────────────────────────────────────────────────
// Canonical RBAC vocabulary.
// Every code here is enforced by an @Permissions(...) route decorator;
// roles grant these codes and nothing else (SUPER_ADMIN holds '*').
// ─────────────────────────────────────────────────────────

export const PERMISSION_CATALOG = [
  { key: 'products.read', label: 'View Products & Catalog', group: 'Catalog' },
  { key: 'products.create', label: 'Create New Garments', group: 'Catalog' },
  { key: 'products.update', label: 'Update Pricing & Specs', group: 'Catalog' },
  { key: 'products.delete', label: 'Archive / Delete Garments', group: 'Catalog' },
  { key: 'categories.create', label: 'Create Categories', group: 'Catalog' },
  { key: 'categories.update', label: 'Edit Categories', group: 'Catalog' },
  { key: 'categories.delete', label: 'Delete Categories', group: 'Catalog' },
  { key: 'collections.manage', label: 'Manage Collections', group: 'Catalog' },
  { key: 'inventory.read', label: 'View Stock Levels', group: 'Catalog' },
  { key: 'inventory.update', label: 'Adjust Stock', group: 'Catalog' },
  { key: 'media.manage', label: 'Upload & Manage Media', group: 'Content' },
  { key: 'banners.manage', label: 'Manage Storefront Banners', group: 'Content' },
  { key: 'reviews.manage', label: 'Moderate Reviews', group: 'Content' },
  { key: 'orders.read', label: 'View All Customer Orders', group: 'Orders' },
  { key: 'orders.manage', label: 'Update Fulfillment, Status & Delete Orders', group: 'Orders' },
  { key: 'returns.manage', label: 'Process Return Requests', group: 'Orders' },
  { key: 'customizations.manage', label: 'Review Custom Artwork & Studio Config', group: 'Custom Studio' },
  { key: 'payments.read', label: 'View Payment Ledgers', group: 'Finance' },
  { key: 'refunds.manage', label: 'Issue Real Refunds (moves money)', group: 'Finance' },
  { key: 'coupons.manage', label: 'Manage Discount Coupons', group: 'Finance' },
  { key: 'notifications.manage', label: 'Manage Notifications', group: 'Operations' },
  { key: 'analytics.read', label: 'View Dashboard & Analytics', group: 'Operations' },
  { key: 'users.manage', label: 'View Customer Records', group: 'Team' },
  { key: 'staff.manage', label: 'Manage Staff Members', group: 'Team' },
  { key: 'roles.manage', label: 'Modify Permissions Matrix', group: 'Team' },
  { key: 'settings.manage', label: 'Configure Store Parameters', group: 'Settings' },
  { key: 'audit.read', label: 'View Audit Trail', group: 'Settings' },
  { key: 'backups.manage', label: 'Create & Restore Backups', group: 'Settings' },
] as const;

export const PERMISSION_KEYS: string[] = PERMISSION_CATALOG.map((p) => p.key);

/**
 * Bumped whenever the built-in role grants change. Stored roles (which live
 * in the durable store in production) carrying an older version are rewritten
 * to these defaults on boot; a role edited after the upgrade keeps its edits.
 */
export const ROLE_PERMISSIONS_VERSION = 2;

export const BUILT_IN_ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Full unrestricted system and database access.',
    is_system: true,
    permissions: ['*'],
  },
  {
    id: 'role-admin',
    name: 'Admin',
    code: 'ADMIN',
    description: 'Comprehensive store management.',
    is_system: true,
    // Same effective access ADMIN had through the old blanket bypass, now explicit.
    permissions: [...PERMISSION_KEYS],
  },
  {
    id: 'role-order-manager',
    name: 'Order Manager',
    code: 'ORDER_MANAGER',
    description: 'Handle order verification, fulfillment and logistics.',
    is_system: false,
    permissions: ['orders.read', 'orders.manage', 'returns.manage', 'customizations.manage', 'payments.read', 'analytics.read'],
  },
  {
    id: 'role-product-manager',
    name: 'Product Manager',
    code: 'PRODUCT_MANAGER',
    description: 'Manage catalog, garments, inventory and banners.',
    is_system: false,
    permissions: [
      'products.read', 'products.create', 'products.update',
      'categories.create', 'categories.update', 'collections.manage',
      'inventory.read', 'inventory.update', 'media.manage', 'banners.manage',
    ],
  },
  {
    id: 'role-support',
    name: 'Customer Support',
    code: 'SUPPORT',
    description: 'Assist customers with orders, returns and reviews.',
    is_system: false,
    permissions: ['orders.read', 'returns.manage', 'reviews.manage'],
  },
  {
    id: 'role-customer',
    name: 'Customer',
    code: 'CUSTOMER',
    description: 'End customer shopping permissions.',
    is_system: true,
    permissions: ['orders.own', 'profile.own', 'reviews.create', 'customizations.create'],
  },
];

/**
 * Permission test for owner-or-staff checks inside handlers (e.g. "view your
 * own order, or any order with orders.read"). Route-level gates still use
 * @Permissions + RolesGuard.
 */
export function hasPermission(user: { permissions?: string[] } | undefined, permission: string): boolean {
  const granted = user?.permissions || [];
  return granted.includes('*') || granted.includes(permission);
}
