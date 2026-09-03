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

    // No permissions required — allow
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Access denied',
      });
    }

    // Super admin bypasses all permission checks
    if (user.roles?.includes('SUPER_ADMIN')) {
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
