import type { NextFunction, Request, Response } from 'express';
import { PermissionName } from '../../constants/permissions';
import { getAuthRepository } from '../container';
import { AppError } from '../errors/app-error';
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request.type';

export function requirePermissions(...requiredPermissions: PermissionName[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      throw new AppError(401, 'Authentication token is missing');
    }

    const access = await getAuthRepository().findAuthorization(auth.userId);
    const grantedPermissions = new Set(access.permissions);
    const hasAllPermissions = requiredPermissions.every((permission) =>
      grantedPermissions.has(permission)
    );

    if (!hasAllPermissions) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    auth.roles = access.roles;
    auth.permissions = access.permissions;
    next();
  };
}
