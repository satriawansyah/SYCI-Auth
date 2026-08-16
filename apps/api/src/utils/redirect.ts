import { Env } from '../config/env';

/**
 * Validates that a redirect target belongs to one of your own apps, to prevent
 * open-redirect attacks (e.g. someone tricking a user into
 * https://auth.syci.id/login?redirect=https://evil.com).
 *
 * A URL is considered safe if:
 * - it is absolute and uses https (http allowed only outside production, for localhost)
 * - its hostname is exactly SSO_BASE_DOMAIN or a subdomain of it
 */
export function isSafeRedirectTarget(url: string): boolean {
  if (!url) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (Env.NODE_ENV !== 'production') {
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return true;
    }
  }

  if (parsed.protocol !== 'https:') {
    return false;
  }

  if (!Env.SSO_BASE_DOMAIN) {
    return false;
  }

  return (
    parsed.hostname === Env.SSO_BASE_DOMAIN ||
    parsed.hostname.endsWith(`.${Env.SSO_BASE_DOMAIN}`)
  );
}
