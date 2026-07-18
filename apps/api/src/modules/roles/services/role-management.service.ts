import { AppError } from '../../../core/errors/app-error';
import { AuditAction } from '../../../shared/enums/audit-action.enum';
import { AuditEntity } from '../../../shared/enums/audit-entity.enum';
import { RoleName } from '../../../shared/enums/role-name.enum';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { RoleRepository } from '../repositories/role.repository';

export class RoleManagementService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly roleRepository: RoleRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  async list(userId: string) {
    await this.requireActiveUser(userId);
    return this.authRepository.findAuthorization(userId);
  }

  async assign(
    userId: string,
    roleName: RoleName,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.requireActiveUser(userId);
    const role = await this.requireRole(roleName);

    await this.authRepository.assignRole(userId, role.id);
    await this.auditRepository.create({
      userId: actorUserId,
      action: AuditAction.ROLE_ASSIGNED,
      entity: AuditEntity.ROLE,
      entityId: role.id,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    return this.authRepository.findAuthorization(userId);
  }

  async remove(
    userId: string,
    roleName: RoleName,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (userId === actorUserId && roleName === RoleName.ADMIN) {
      throw new AppError(400, 'You cannot remove your own ADMIN role');
    }

    await this.requireActiveUser(userId);
    const role = await this.requireRole(roleName);
    const result = await this.authRepository.removeRole(userId, role.id);
    if (result.count === 0) {
      throw new AppError(404, 'Role is not assigned to this user');
    }

    await this.auditRepository.create({
      userId: actorUserId,
      action: AuditAction.ROLE_REMOVED,
      entity: AuditEntity.ROLE,
      entityId: role.id,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    return this.authRepository.findAuthorization(userId);
  }

  private async requireActiveUser(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.deletedAt || !user.isActive) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  private async requireRole(roleName: RoleName) {
    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new AppError(404, 'Role not found');
    }
    return role;
  }
}
