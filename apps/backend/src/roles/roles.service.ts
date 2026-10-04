import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { db, saveDb } from '../common/database/store';
import {
  BUILT_IN_ROLES,
  PERMISSION_CATALOG,
  PERMISSION_KEYS,
  ROLE_PERMISSIONS_VERSION,
} from '../common/auth/permissions';

/** Roles may only grant codes that some route actually enforces. */
function assertKnownPermissions(permissions: string[]) {
  const unknown = permissions.filter((p) => !PERMISSION_KEYS.includes(p));
  if (unknown.length) {
    throw new BadRequestException({
      code: 'UNKNOWN_PERMISSION',
      message: `Unknown permission code(s): ${unknown.join(', ')}`,
    });
  }
}

/**
 * Bring stored roles up to the current vocabulary. Runs on every boot after
 * the durable store has been loaded; idempotent. Returns true if anything changed.
 */
export function upgradeBuiltInRoles(): boolean {
  let changed = false;
  if (JSON.stringify(db.permissions) !== JSON.stringify(PERMISSION_CATALOG)) {
    db.permissions = PERMISSION_CATALOG.map((p) => ({ ...p }));
    changed = true;
  }
  for (const def of BUILT_IN_ROLES) {
    const stored = db.roles.find((r) => r.code === def.code);
    if (!stored) {
      db.roles.push({ ...def, permissions: [...def.permissions], permissions_version: ROLE_PERMISSIONS_VERSION });
      changed = true;
    } else if (stored.permissions_version !== ROLE_PERMISSIONS_VERSION) {
      stored.permissions = [...def.permissions];
      stored.permissions_version = ROLE_PERMISSIONS_VERSION;
      changed = true;
    }
  }
  return changed;
}

@Injectable()
export class RolesService implements OnModuleInit {
  onModuleInit() {
    if (upgradeBuiltInRoles()) saveDb();
  }

  /** List all role definitions with associated user counts */
  getRoles() {
    return db.roles.map((role) => {
      const userCount = db.users.filter(
        (u) =>
          u.role === role.code ||
          u.role?.toUpperCase() === role.name.toUpperCase().replace(/\s+/g, '_'),
      ).length;

      return {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        userCount,
        isSystem: Boolean(role.is_system),
        permissions: role.permissions || [],
      };
    });
  }

  /** List all granular permission keys */
  getPermissions() {
    return db.permissions;
  }

  /** Create custom staff role */
  createRole(data: { name: string; description: string; permissions: string[] }) {
    assertKnownPermissions(data.permissions || []);
    const roleCode = data.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const existing = db.roles.find((r) => r.code === roleCode);
    if (existing) {
      throw new BadRequestException({ code: 'ROLE_EXISTS', message: 'A role with this name already exists.' });
    }

    const newRole = {
      id: `role-${Date.now()}`,
      name: data.name.trim(),
      code: roleCode,
      description: data.description,
      is_system: false,
      permissions: data.permissions || [],
      permissions_version: ROLE_PERMISSIONS_VERSION,
    };

    db.roles.push(newRole);
    saveDb();

    return {
      ...newRole,
      userCount: 0,
      isSystem: false,
    };
  }

  /** Update role permissions */
  updateRole(id: string, data: Partial<{ name: string; description: string; permissions: string[] }>) {
    const role = db.roles.find((r) => r.id === id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found.' });
    }

    if (role.is_system && data.permissions && role.code === 'SUPER_ADMIN') {
      throw new BadRequestException({ code: 'CANNOT_MODIFY_SUPER_ADMIN', message: 'Super Admin permissions cannot be restricted.' });
    }

    if (data.permissions) assertKnownPermissions(data.permissions);
    if (data.name && !role.is_system) role.name = data.name.trim();
    if (data.description) role.description = data.description;
    if (data.permissions) role.permissions = data.permissions;
    saveDb();

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      userCount: db.users.filter((u) => u.role === role.code).length,
      isSystem: Boolean(role.is_system),
      permissions: role.permissions,
    };
  }

  /** Delete custom role */
  deleteRole(id: string) {
    const role = db.roles.find((r) => r.id === id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found.' });
    }
    if (role.is_system) {
      throw new BadRequestException({ code: 'SYSTEM_ROLE', message: 'System defined roles cannot be deleted.' });
    }

    db.roles = db.roles.filter((r) => r.id !== id);
    saveDb();
    return { success: true, message: 'Role removed successfully.' };
  }
}
