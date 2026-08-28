import { NextRequest } from 'next/server';

/**
 * Explicit CSRF defense for state-changing admin proxy routes, on top of
 * the implicit protection already in place (SameSite=Lax session cookie +
 * the browser's CORS preflight blocking a cross-origin fetch that sends
 * Content-Type: application/json without an Access-Control-Allow-Origin
 * response). Neither of those is written down anywhere as an intentional
 * control, so a reviewer has no way to tell "protected by accident" from
 * "protected on purpose" without this check existing explicitly.
 *
 * A genuine same-origin browser request always carries an Origin header
 * on state-changing fetches, and that Origin's host always matches this
 * request's own Host header. A forged cross-site request either omits
 * Origin or carries the attacker's own origin — never ours.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
