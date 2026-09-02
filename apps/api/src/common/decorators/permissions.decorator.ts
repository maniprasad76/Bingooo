import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Declares required permission codes on a controller or handler.
 * Used by RolesGuard.
 *
 * Usage: @Permissions('products.write', 'products.read')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
