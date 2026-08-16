import { database } from '../../../config/database';
import { PasswordService } from '../../../core/security/password.service';
import { AppError } from '../../../core/errors/app-error';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import { RoleRepository } from '../../roles/repositories/role.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { UserMapper } from '../../user/mappers/user.mapper';
import { AuditAction } from '../../../shared/enums/audit-action.enum';
import { AuditEntity } from '../../../shared/enums/audit-entity.enum';
import { RoleName } from '../../../shared/enums/role-name.enum';
import type { RegisterRequest } from '../validators/register.validator';
import type { UserResponseDto } from '../../user/dto/user-response.dto';

export class RegisterService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly authRepository: AuthRepository,
    private readonly roleRepository: RoleRepository,
    private readonly auditRepository: AuditRepository
  ) {}

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

    // Lookup USER role outside transaction (roles are static)
    const userRole = await this.roleRepository.findByName(RoleName.USER);
    if (!userRole) {
      throw new AppError(500, 'Default USER role not found');
    }

    // Execute Prisma transaction
    const user = await database.client.$transaction(async (tx) => {
      // Create User within transaction
      const createdUser = await this.authRepository.create(
        {
          email: request.email,
          username: request.username || null,
          passwordHash,
          fullName: request.fullName,
          phone: request.phone || null,
          emailVerified: false,
          isActive: true,
        },
        tx
      );

      // Assign USER role within transaction
      await this.authRepository.assignRole(
        createdUser.id,
        userRole.id,
        tx
      );

      // Create AuditLog within transaction
      await this.auditRepository.create(
        {
          userId: createdUser.id,
          action: AuditAction.USER_REGISTERED,
          entity: AuditEntity.USER,
          entityId: createdUser.id,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
        tx
      );

      return createdUser;
    });

    // Return UserResponseDto using UserMapper
    return UserMapper.toResponse(user);
  }
}
