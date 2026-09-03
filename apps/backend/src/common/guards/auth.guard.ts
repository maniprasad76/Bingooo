import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * Validates Supabase access tokens and resolves the caller's RBAC grants from
 * the application database.  The development token exists only when it is
 * explicitly enabled so an unconfigured production API never grants access.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Authentication required',
      });
    }

    const token = authorization.slice(7);

    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Invalid token',
      });
    }

    if (process.env.ENABLE_DEV_AUTH === 'true' && token === 'bingooo-dev-admin') {
      (request as any).user = {
        id: 'development-admin',
        email: 'admin@bingooo.local',
        roles: ['SUPER_ADMIN'],
        permissions: ['*'],
      };
      return true;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new ServiceUnavailableException({
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Server authentication is not configured.',
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      throw new UnauthorizedException({ code: 'AUTH_REQUIRED', message: 'Your session is invalid or has expired.' });
    }

    type PermissionRow = { permissions: { code: string } | null };
    type RoleRow = { roles: { code: string; role_permissions: PermissionRow[] | null } | null };
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles(code, role_permissions(permissions(code)))')
      .eq('user_id', authData.user.id);

    if (rolesError) {
      throw new ServiceUnavailableException({ code: 'RBAC_LOOKUP_FAILED', message: 'Unable to verify account permissions.' });
    }

    const rows = (userRoles ?? []) as unknown as RoleRow[];
    const roles = rows
      .map((row) => row.roles?.code?.toUpperCase())
      .filter((role): role is string => Boolean(role));
    const permissions = [...new Set(rows.flatMap((row) =>
      row.roles?.role_permissions?.flatMap((entry) => entry.permissions?.code ? [entry.permissions.code] : []) ?? [],
    ))];

    (request as any).user = {
      id: authData.user.id,
      email: authData.user.email,
      roles,
      permissions,
    };

    return true;
  }
}
