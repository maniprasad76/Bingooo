import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../common/database/store';

@Injectable()
export class RolesService {
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
    };

    db.roles.push(newRole);

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

    if (data.name && !role.is_system) role.name = data.name.trim();
    if (data.description) role.description = data.description;
    if (data.permissions) role.permissions = data.permissions;

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
    return { success: true, message: 'Role removed successfully.' };
  }
}
