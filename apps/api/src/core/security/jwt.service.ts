import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { JwtConfig } from '../../shared/types/jwt-config.type';
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../../shared/types/jwt-payload.type';
import { TokenType } from '../../shared/enums/token-type.enum';
import { JwtError, JwtErrorReason } from '../../modules/auth/errors/jwt-error';

export class JwtService {
  private readonly config: JwtConfig;

  constructor(config: JwtConfig) {
    if (!config.secret || config.secret.trim().length === 0) {
      throw new Error('JWT_SECRET must be defined and non-empty');
    }
    if (config.accessTokenTtl <= 0) {
      throw new Error('JWT_ACCESS_EXPIRY must be greater than 0');
    }
    if (config.refreshTokenTtl <= 0) {
      throw new Error('JWT_REFRESH_EXPIRY must be greater than 0');
    }
    this.config = config;
  }

  /**
   * Generate access token with minimal payload
   * @param sub - User ID
   * @param sid - Session ID
   * @returns Signed JWT token
   */
  generateAccessToken(sub: string, sid: string): string {
    if (!sub || !sid) {
      throw new Error('sub and sid are required for access token generation');
    }

    const payload: AccessTokenPayload = {
      sub,
      sid,
      type: TokenType.ACCESS,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.accessTokenTtl,
    };

    return jwt.sign(payload, this.config.secret, {
      algorithm: 'HS256',
      noTimestamp: true, // Use explicit iat in payload
    });
  }

  /**
   * Generate refresh token with rotation tracking
   * @param sid - Session ID
   * @param rid - Refresh Token ID (for rotation tracking)
   * @returns Signed JWT token
   */
  generateRefreshToken(sid: string, rid: string): string {
    if (!sid || !rid) {
      throw new Error('sid and rid are required for refresh token generation');
    }

    const payload: RefreshTokenPayload = {
      sid,
      rid,
      type: TokenType.REFRESH,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.config.refreshTokenTtl,
    };

    return jwt.sign(payload, this.config.secret, {
      algorithm: 'HS256',
      noTimestamp: true, // Use explicit iat in payload
    });
  }

  /**
   * Generate token pair (access + refresh)
   * @param sub - User ID
   * @param sid - Session ID
   * @param rid - Refresh Token ID
   * @returns Object with accessToken and refreshToken
   */
  generateTokenPair(
    sub: string,
    sid: string,
    rid: string
  ): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(sub, sid),
      refreshToken: this.generateRefreshToken(sid, rid),
    };
  }

  /**
   * Verify and decode token with type validation
   * @param token - JWT token to verify
   * @param expectedType - Optional expected token type
   * @returns Decoded payload with iat/exp
   * @throws JwtError if verification fails
   */
  verify<T extends { type: TokenType }>(
    token: string,
    expectedType?: TokenType
  ): T & { iat: number; exp: number } {
    if (!token) {
      throw new JwtError(JwtErrorReason.NO_TOKEN);
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new JwtError(JwtErrorReason.INVALID_TOKEN);
    }

    try {
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: ['HS256'],
      }) as T & { iat: number; exp: number };

      // Validate token type matches expected type
      if (expectedType && decoded.type !== expectedType) {
        throw new JwtError(JwtErrorReason.INVALID_TYPE);
      }

      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new JwtError(JwtErrorReason.EXPIRED_TOKEN);
      }

      if (error instanceof JsonWebTokenError) {
        if (error.message.includes('invalid signature')) {
          throw new JwtError(JwtErrorReason.INVALID_SIGNATURE);
        }

        if (
          error.message.includes('malformed') ||
          error.message.includes('jwt')
        ) {
          throw new JwtError(JwtErrorReason.MALFORMED_TOKEN);
        }
      }

      if (error instanceof JwtError) {
        throw error;
      }

      throw new JwtError(JwtErrorReason.INVALID_TOKEN);
    }
  }

  /**
   * Decode token without verification (unsafe, use with caution)
   * @param token - JWT token to decode
   * @returns Decoded payload
   */
  decode(token: string): Record<string, unknown> | null {
    if (!token) {
      return null;
    }

    try {
      return jwt.decode(token) as Record<string, unknown> | null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token payload is expired
   * @param payload - JWT payload with exp
   * @returns true if expired, false otherwise
   */
  isExpired(payload: { exp?: number }): boolean {
    if (!payload.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  /**
   * Get time until token expiry in seconds
   * @param payload - JWT payload with exp
   * @returns Seconds until expiry, or 0 if already expired
   */
  getTimeToExpiry(payload: { exp?: number }): number {
    if (!payload.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }
}
