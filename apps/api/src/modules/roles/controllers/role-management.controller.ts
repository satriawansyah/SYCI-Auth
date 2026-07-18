import type { Request, Response } from 'express';
import { ApiResponse } from '../../../core/response/api-response';
import type { AuthenticatedRequest } from '../../../shared/types/authenticated-request.type';
import { RoleManagementService } from '../services/role-management.service';
import type { AssignRoleRequest } from '../validators/user-role.validator';

export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  list = async (req: Request, res: Response) => {
    const result = await this.roleManagementService.list(
      req.params.userId as string
    );
    return ApiResponse.success(res, result);
  };

  assign = async (req: Request, res: Response) => {
    const auth = (req as AuthenticatedRequest).auth;
    const body = req.body as AssignRoleRequest;
    const result = await this.roleManagementService.assign(
      req.params.userId as string,
      body.roleName,
      auth.userId,
      req.ip,
      req.get('user-agent')
    );
    return ApiResponse.success(res, result, 'Role assigned successfully');
  };

  remove = async (req: Request, res: Response) => {
    const auth = (req as AuthenticatedRequest).auth;
    const result = await this.roleManagementService.remove(
      req.params.userId as string,
      req.params.roleName as AssignRoleRequest['roleName'],
      auth.userId,
      req.ip,
      req.get('user-agent')
    );
    return ApiResponse.success(res, result, 'Role removed successfully');
  };
}
