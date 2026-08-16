export interface JwtConfig {
  secret: string;
  accessTokenTtl: number; // In seconds
  refreshTokenTtl: number; // In seconds
}
