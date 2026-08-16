import { randomUUID } from 'node:crypto';
import { Env } from '../../../config/env';
import { AppError } from '../../../core/errors/app-error';
import { JwtService } from '../../../core/security/jwt.service';
import { PasswordService } from '../../../core/security/password.service';
import { AuditAction } from '../../../shared/enums/audit-action.enum';
import { AuditEntity } from '../../../shared/enums/audit-entity.enum';
import { UserMapper } from '../../user/mappers/user.mapper';
import { AuditRepository } from '../../audit/repositories/audit.repository';
import type { LoginResponseDto } from '../dto/login-response.dto';
import { AuthRepository } from '../repositories/auth.repository';
import type { LoginRequest } from '../validators/login.validator';

export class LoginService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly auditRepository: AuditRepository
  ) {}

  async execute(
    request: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ result: LoginResponseDto; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(request.email);
    const isPasswordValid = user
      ? await this.passwordService.compare(request.password, user.passwordHash)
      : false;

    if (!user || !isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive || user.deletedAt) {
      throw new AppError(403, 'User account is not active');
    }

    const expiresAt = new Date(Date.now() + Env.JWT_REFRESH_EXPIRY * 1000);
    const session = await this.authRepository.createSession({
      userId: user.id,
      refreshToken: '',
      expiresAt,
    });

    const { accessToken, refreshToken } = this.jwtService.generateTokenPair(
      user.id,
      session.id,
      randomUUID()
    );
    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    await this.authRepository.updateSessionRefreshToken(
      session.id,
      refreshTokenHash
    );
    await this.authRepository.recordSuccessfulLogin(user.id);
    await this.auditRepository.create({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      entity: AuditEntity.SESSION,
      entityId: session.id,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    return {
      result: {
        user: UserMapper.toResponse(user),
        accessToken,
      },
      refreshToken,
    };
  }
}
