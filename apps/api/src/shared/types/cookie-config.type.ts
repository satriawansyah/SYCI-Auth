/**
 * Configuration for HTTP cookie settings
 * Used primarily for refresh token storage
 */
export interface CookieConfig {
  /**
   * Cookie name
   * @example "syci_refresh_token"
   */
  name: string;

  /**
   * Expiration time in milliseconds
   * When passed to cookie middleware, this becomes maxAge
   */
  maxAge: number;

  /**
   * Cookie attribute: HttpOnly flag
   * Prevents JavaScript access (XSS protection)
   * Default: true
   */
  httpOnly: boolean;

  /**
   * Cookie attribute: Secure flag
   * Only transmit over HTTPS
   * Default: false (dev) / true (prod)
   */
  secure: boolean;

  /**
   * Cookie attribute: SameSite policy
   * Prevents CSRF attacks
   * 'strict' = not sent with cross-site requests
   */
  sameSite: 'strict' | 'lax' | 'none';

  /**
   * Cookie path: where cookie is valid
   * Restrict to auth endpoints only
   * @example "/api/v1/auth"
   */
  path: string;

  /**
   * Cookie domain (optional)
   * If undefined, defaults to request host
   */
  domain?: string;
}
