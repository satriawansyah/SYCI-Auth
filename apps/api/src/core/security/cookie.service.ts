import type { Request, Response } from 'express';
import { CookieConfig } from '../../shared/types/cookie-config.type';
import { CookieError, CookieErrorReason } from '../../modules/auth/errors/cookie-error';

/**
 * CookieService handles HTTP cookie operations
 * Primarily used for storing refresh tokens in HttpOnly cookies
 *
 * Security Features:
 * - HttpOnly flag prevents XSS attacks (JavaScript cannot access)
 * - Secure flag ensures HTTPS-only transmission
 * - SameSite=Strict prevents CSRF attacks
 * - Path restriction limits cookie scope
 */
export class CookieService {
  private readonly config: CookieConfig;

  constructor(config: CookieConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  /**
   * Validates cookie configuration on initialization
   * Throws error if config is invalid
   *
   * @param config - Cookie configuration to validate
   * @throws Error if validation fails
   */
  private validateConfig(config: CookieConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new Error('Cookie name must be defined and non-empty');
    }

    if (config.maxAge <= 0) {
      throw new Error('Cookie maxAge must be greater than 0');
    }

    if (!['strict', 'lax', 'none'].includes(config.sameSite)) {
      throw new Error('SameSite must be one of: strict, lax, none');
    }

    if (!config.path || config.path.trim().length === 0) {
      throw new Error('Cookie path must be defined and non-empty');
    }
  }

  /**
   * Sets refresh token cookie on response
   * Cookie is HttpOnly, Secure, and SameSite=Strict
   *
   * Usage:
   * ```
   * const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
   * cookieService.setRefreshTokenCookie(response, refreshToken, expiresAt);
   * ```
   *
   * @param response - Express response object
   * @param token - Refresh token to store in cookie
   * @param expiresAt - Cookie expiration date/time
   * @throws CookieError if response is invalid
   */
  setRefreshTokenCookie(response: Response, token: string, expiresAt: Date): void {
    if (!response || typeof response.cookie !== 'function') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    if (!token || typeof token !== 'string') {
      throw new CookieError(
        CookieErrorReason.INVALID_COOKIE,
        'Token must be a non-empty string'
      );
    }

    response.cookie(this.config.name, token, {
      httpOnly: this.config.httpOnly,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: this.config.path,
      domain: this.config.domain,
      expires: expiresAt,
    });
  }

  /**
   * Retrieves refresh token from request cookies
   * Cookies are parsed by cookie-parser middleware before reaching here
   *
   * Usage:
   * ```
   * const token = cookieService.getRefreshTokenCookie(request);
   * if (!token) {
   *   // No cookie found
   * }
   * ```
   *
   * @param request - Express request object (must have cookies from cookie-parser)
   * @returns Refresh token if cookie exists, null otherwise
   * @throws CookieError if request is invalid
   */
  getRefreshTokenCookie(request: Request): string | null {
    if (!request || typeof request.cookies !== 'object') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    const token = request.cookies[this.config.name];

    if (!token) {
      return null; // Cookie not present (normal case for first request)
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new CookieError(
        CookieErrorReason.INVALID_COOKIE,
        `Cookie '${this.config.name}' is invalid`
      );
    }

    return token;
  }

  /**
   * Clears refresh token cookie from response
   * Sets cookie with maxAge=0 to remove it
   *
   * Usage:
   * ```
   * cookieService.clearRefreshTokenCookie(response);
   * ```
   *
   * @param response - Express response object
   * @throws CookieError if response is invalid
   */
  clearRefreshTokenCookie(response: Response): void {
    if (!response || typeof response.cookie !== 'function') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    response.cookie(this.config.name, '', {
      httpOnly: this.config.httpOnly,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: this.config.path,
      domain: this.config.domain,
      maxAge: 0, // Tells browser to delete cookie
    });
  }

  /**
   * Generic cookie setter
   * Use for non-refresh-token cookies
   *
   * @param response - Express response object
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options (maxAge, domain, path, etc.)
   * @throws CookieError if response is invalid
   */
  setCookie(
    response: Response,
    name: string,
    value: string,
    options: Partial<CookieConfig>
  ): void {
    if (!response || typeof response.cookie !== 'function') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Cookie name must be a non-empty string');
    }

    response.cookie(name, value, {
      httpOnly: options.httpOnly ?? true,
      secure: options.secure ?? this.config.secure,
      sameSite: options.sameSite ?? this.config.sameSite,
      path: options.path ?? this.config.path,
      domain: options.domain,
      maxAge: options.maxAge ?? this.config.maxAge,
    });
  }

  /**
   * Generic cookie getter
   * Use for non-refresh-token cookies
   *
   * @param request - Express request object
   * @param name - Cookie name
   * @returns Cookie value if exists, null otherwise
   * @throws CookieError if request is invalid
   */
  getCookie(request: Request, name: string): string | null {
    if (!request || typeof request.cookies !== 'object') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Cookie name must be a non-empty string');
    }

    const value = request.cookies[name];
    return typeof value === 'string' ? value : null;
  }

  /**
   * Generic cookie clearer
   * Use for non-refresh-token cookies
   *
   * @param response - Express response object
   * @param name - Cookie name
   * @throws CookieError if response is invalid
   */
  clearCookie(response: Response, name: string): void {
    if (!response || typeof response.cookie !== 'function') {
      throw new CookieError(CookieErrorReason.MISSING_RESPONSE);
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Cookie name must be a non-empty string');
    }

    response.clearCookie(name, {
      httpOnly: this.config.httpOnly,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
      path: this.config.path,
      domain: this.config.domain,
    });
  }
}
