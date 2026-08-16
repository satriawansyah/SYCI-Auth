import { JwtService } from '../../../core/security/jwt.service';
import { TokenType } from '../../../shared/enums/token-type.enum';
import type { RefreshTokenPayload } from '../../../shared/types/jwt-payload.type';
import { AuthRepository } from '../repositories/auth.repository';

export class LogoutService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository
  ) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        TokenType.REFRESH
      );
      const session = await this.authRepository.findSessionById(payload.sid);
      if (session && !session.revokedAt) {
        await this.authRepository.revokeSession(session.id);
      }
    } catch {
      // Logout is idempotent: the cookie is always cleared, even if invalid.
    }
  }
}
