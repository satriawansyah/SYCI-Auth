import { database } from '../../../config/database';
import { PasswordService } from '../../../core/security/password.service';
import { AppError } from '../../../core/errors/app-error';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import { RoleRepository } from '../../roles/repositories/role.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { UserMapper } from '../../user/mappers/user.mapper';
import { AuditAction } from '../../../shared/enums/audit-action.enum';
import { AuditEntity } from '../../../shared/enums/audit-entity.enum';
import type { RegisterRequest } from '../validators/register.validator';
import type { UserResponseDto } from '../../user/dto/user-response.dto';

export class RegisterService {
  private readonly passwordService = new PasswordService();
  private readonly authRepository = new AuthRepository();
  private readonly roleRepository = new RoleRepository();
  private readonly auditRepository = new AuditRepository();

  async execute(
    request: RegisterRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserResponseDto> {
    // Validate duplicate email
    const existingEmail = await this.authRepository.findByEmail(request.email);
    if (existingEmail) {
      throw new AppError(409, 'Email already registered');
    }

    // Validate duplicate username
    if (request.username) {
      const existingUsername = await this.authRepository.findByUsername(
        request.username
      );
      if (existingUsername) {
        throw new AppError(409, 'Username already exists');
      }
    }

    // Hash password using PasswordService
    const passwordHash = await this.passwordService.hash(request.password);

    // Execute Prisma transaction
    const transaction = await database.client.$transaction(
      async (tx) => {
        // Create User
        const user = await tx.user.create({
          data: {
            email: request.email,
            username: request.username || null,
            passwordHash,
            fullName: request.fullName,
            phone: request.phone || null,
            emailVerified: false,
            isActive: true,
          },
        });

        // Assign USER role
        const userRole = await this.roleRepository.findByName('USER');
        if (!userRole) {
          throw new AppError(500, 'Default USER role not found');
        }

        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
          },
        });

        // Create AuditLog
        await this.auditRepository.create({
          userId: user.id,
          action: AuditAction.USER_REGISTERED,
          entity: AuditEntity.USER,
          entityId: user.id,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        });

        return user;
      }
    );

    // Return UserResponseDto using UserMapper
    return UserMapper.toResponse(transaction);
  }
}
