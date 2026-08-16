import { AppError } from '../../../core/errors/app-error';

/**
 * Error reasons for cookie operations
 */
export enum CookieErrorReason {
  COOKIE_NOT_FOUND = 'COOKIE_NOT_FOUND',
  INVALID_COOKIE = 'INVALID_COOKIE',
  COOKIE_PARSE_ERROR = 'COOKIE_PARSE_ERROR',
  MISSING_RESPONSE = 'MISSING_RESPONSE',
}

/**
 * Custom error for cookie-related operations
 * Extends AppError with cookie-specific error reasons
 */
export class CookieError extends AppError {
  readonly reason: CookieErrorReason;

  constructor(reason: CookieErrorReason, message?: string) {
    const defaultMessages: Record<CookieErrorReason, string> = {
      [CookieErrorReason.COOKIE_NOT_FOUND]: 'Cookie not found',
      [CookieErrorReason.INVALID_COOKIE]: 'Cookie is invalid or malformed',
      [CookieErrorReason.COOKIE_PARSE_ERROR]: 'Failed to parse cookie',
      [CookieErrorReason.MISSING_RESPONSE]: 'Response object is missing',
    };

    super(400, message || defaultMessages[reason]);
    this.reason = reason;
  }
}
