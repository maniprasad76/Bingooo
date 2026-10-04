import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * RBAC guard that checks the user has the required permissions.
 * Used together with @Permissions('products.write') decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    }

    // Deny by default: a route guarded by RolesGuard but missing @Permissions
    // would otherwise be open to every authenticated customer. Only wildcard
    // holders may reach such a route until it declares what it needs.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) {
        return true;
      }
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    }

    // Only SUPER_ADMIN ('*') bypasses checks. ADMIN is granted every code
    // explicitly (see common/auth/permissions.ts), so new codes are opt-in.
    if (user.roles?.includes('SUPER_ADMIN') || user.permissions?.includes('*')) {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];
    const hasPermission = requiredPermissions.every((perm: string) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      });
    }

    return true;
  }
}
