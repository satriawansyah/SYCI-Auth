import { z } from 'zod';
import { RoleName } from '../../../shared/enums/role-name.enum';

export const userIdParamSchema = z.object({
  userId: z.string().min(1).max(191),
});

export const roleParamSchema = z.object({
  userId: z.string().min(1).max(191),
  roleName: z.enum(RoleName),
});

export const assignRoleSchema = z.object({
  roleName: z.enum(RoleName),
});

export type AssignRoleRequest = z.infer<typeof assignRoleSchema>;
