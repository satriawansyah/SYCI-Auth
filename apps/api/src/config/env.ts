import 'dotenv/config';

export class Env {
  static readonly APP_NAME = process.env.APP_NAME!;

  static readonly NODE_ENV = process.env.NODE_ENV!;

  static readonly PORT = Number(process.env.PORT);

  static readonly FRONTEND_URL = process.env.FRONTEND_URL!;

  static readonly DB_HOST = process.env.DATABASE_HOST!;

  static readonly DB_PORT = Number(process.env.DATABASE_PORT);

  static readonly DB_NAME = process.env.DATABASE_NAME!;

  static readonly DB_USER = process.env.DATABASE_USER!;

  static readonly DB_PASSWORD = process.env.DATABASE_PASSWORD!;

  // JWT Configuration
  static readonly JWT_SECRET = process.env.JWT_SECRET!;

  static readonly JWT_ACCESS_EXPIRY = Number(process.env.JWT_ACCESS_EXPIRY || 900); // 15 minutes default

  static readonly JWT_REFRESH_EXPIRY = Number(
    process.env.JWT_REFRESH_EXPIRY || 604800
  ); // 7 days default

  // Cookie Configuration
  static readonly REFRESH_TOKEN_COOKIE_NAME =
    process.env.REFRESH_TOKEN_COOKIE_NAME || 'syci_refresh_token';

  static readonly REFRESH_TOKEN_COOKIE_SECURE =
    process.env.REFRESH_TOKEN_COOKIE_SECURE === 'true' || this.NODE_ENV === 'production';

  static readonly REFRESH_TOKEN_COOKIE_PATH = process.env.REFRESH_TOKEN_COOKIE_PATH || '/api/v1/auth';

  static readonly REFRESH_TOKEN_COOKIE_DOMAIN = process.env.REFRESH_TOKEN_COOKIE_DOMAIN;

  static readonly REFRESH_TOKEN_COOKIE_SAME_SITE = (
    process.env.REFRESH_TOKEN_COOKIE_SAME_SITE || 'strict'
  ) as 'strict' | 'lax' | 'none';
}
