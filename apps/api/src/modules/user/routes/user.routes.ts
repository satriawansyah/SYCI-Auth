import { Router } from 'express';
import { PermissionName } from '../../../constants/permissions';
import { authenticate } from '../../../core/middlewares/auth.middleware';
import { requirePermissions } from '../../../core/middlewares/authorization.middleware';
import { asyncHandler } from '../../../core/utils/async-handler';
import { validate } from '../../../core/middlewares/validation.middleware';
import { getRoleManagementController } from '../../../core/container';
import { UserController } from '../controllers/user.controller';
import { UserRepository } from '../repositories/user.repository';
import {
  assignRoleSchema,
  roleParamSchema,
  userIdParamSchema,
} from '../../roles/validators/user-role.validator';

const router = Router();
const userController = new UserController(new UserRepository());

router.get(
  '/',
  asyncHandler(authenticate),
  asyncHandler(requirePermissions(PermissionName.USERS_READ)),
  asyncHandler(userController.list)
);

router.get(
  '/:userId/roles',
  asyncHandler(authenticate),
  asyncHandler(requirePermissions(PermissionName.ROLES_MANAGE)),
  validate({ params: userIdParamSchema }),
  asyncHandler(getRoleManagementController().list)
);

router.post(
  '/:userId/roles',
  asyncHandler(authenticate),
  asyncHandler(requirePermissions(PermissionName.ROLES_MANAGE)),
  validate({ params: userIdParamSchema, body: assignRoleSchema }),
  asyncHandler(getRoleManagementController().assign)
);

router.delete(
  '/:userId/roles/:roleName',
  asyncHandler(authenticate),
  asyncHandler(requirePermissions(PermissionName.ROLES_MANAGE)),
  validate({ params: roleParamSchema }),
  asyncHandler(getRoleManagementController().remove)
);

export default router;
