import { TokenType } from '../enums/token-type.enum';

export interface JwtPayload {
  iat: number;
  exp: number;
}

export interface AccessTokenPayload extends JwtPayload {
  sub: string; // User ID
  sid: string; // Session ID
  type: TokenType.ACCESS;
}

export interface RefreshTokenPayload extends JwtPayload {
  sid: string; // Session ID
  rid: string; // Refresh Token ID (for rotation tracking)
  type: TokenType.REFRESH;
}

export type SignablePayload = AccessTokenPayload | RefreshTokenPayload;

export type VerifiablePayload = Omit<AccessTokenPayload, 'iat' | 'exp'> | Omit<RefreshTokenPayload, 'iat' | 'exp'>;
