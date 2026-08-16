import { randomUUID } from 'node:crypto';
import { Env } from '../../../config/env';
import { AppError } from '../../../core/errors/app-error';
import { JwtService } from '../../../core/security/jwt.service';
import { PasswordService } from '../../../core/security/password.service';
import { TokenType } from '../../../shared/enums/token-type.enum';
import type { RefreshTokenPayload } from '../../../shared/types/jwt-payload.type';
import { AuthRepository } from '../repositories/auth.repository';

export class RefreshService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository
  ) {}

  async execute(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.jwtService.verify<RefreshTokenPayload>(
      refreshToken,
      TokenType.REFRESH
    );
    const session = await this.authRepository.findSessionById(payload.sid);

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new AppError(401, 'Authentication session is invalid');
    }

    const isTokenValid = await this.passwordService.compare(
      refreshToken,
      session.refreshToken
    );
    if (!isTokenValid) {
      await this.authRepository.revokeSession(session.id);
      throw new AppError(401, 'Refresh token has been reused');
    }

    const nextRefreshToken = this.jwtService.generateRefreshToken(
      session.id,
      randomUUID()
    );
    const nextRefreshTokenHash = await this.passwordService.hash(nextRefreshToken);

    await this.authRepository.updateSessionRefreshToken(
      session.id,
      nextRefreshTokenHash
    );

    return {
      accessToken: this.jwtService.generateAccessToken(session.userId, session.id),
      refreshToken: nextRefreshToken,
    };
  }
}
