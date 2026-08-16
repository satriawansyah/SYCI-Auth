import type { CorsOptions } from 'cors';
import { Env } from './env';

/**
 * Checks whether a given origin is allowed to call this API with credentials.
 *
 * Two ways an origin is trusted:
 * 1. It matches one of CORS_ALLOWED_ORIGINS exactly (comma separated env var).
 * 2. It is an HTTPS origin that ends with CORS_ALLOWED_DOMAIN, e.g.
 *    CORS_ALLOWED_DOMAIN=".syci.id" trusts https://app1.syci.id, https://app2.syci.id, etc.
 *    This lets you add new subdomain apps without redeploying the auth API.
 *
 * In development (NODE_ENV !== 'production'), http://localhost origins are always allowed
 * so local frontends can be developed without extra config.
 */
export function isOriginAllowed(origin: string): boolean {
  if (Env.CORS_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  if (Env.CORS_ALLOWED_DOMAIN) {
    try {
      const { protocol, hostname } = new URL(origin);
      const isHttps = protocol === 'https:';
      const matchesSuffix =
        hostname === Env.CORS_ALLOWED_DOMAIN.replace(/^\./, '') ||
        hostname.endsWith(Env.CORS_ALLOWED_DOMAIN);
      if (isHttps && matchesSuffix) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (Env.NODE_ENV !== 'production') {
    try {
      const { hostname } = new URL(origin);
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No origin header = same-origin/non-browser request (curl, server-to-server) — allow.
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
};
