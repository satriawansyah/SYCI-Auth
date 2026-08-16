import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../response/api-response';

/**
 * Applies to /login and /register.
 * Limits brute-force / credential-stuffing / mass-registration attempts per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many attempts. Please try again later.',
      429
    );
  },
});

/**
 * Applies to /refresh. More lenient since legitimate apps call this often
 * (e.g. on page load to establish an SSO session), but still bounded.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many refresh attempts. Please try again later.',
      429
    );
  },
});
