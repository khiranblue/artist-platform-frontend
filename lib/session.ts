import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session_token';

/**
 * httpOnly means client-side JavaScript can never read this cookie —
 * the whole point of proxying auth through Next.js Route Handlers instead
 * of handing the raw JWT to the browser to store itself.
 */
export function setSessionCookie(token: string) {
  const maxAge = Number(process.env.SESSION_COOKIE_MAX_AGE_SECONDS || 604800);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export function getSessionToken(): string | undefined {
  return cookies().get(SESSION_COOKIE_NAME)?.value;
}
