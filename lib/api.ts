import { getSessionToken } from './session';

const BACKEND_API_URL = process.env.BACKEND_API_URL;
if (!BACKEND_API_URL) {
  throw new Error('BACKEND_API_URL is not set.');
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean; // attach the session cookie's token as a Bearer header
}

/**
 * All calls to the backend go through this single function — server
 * components and Route Handlers only, never the browser directly. This
 * is what keeps the JWT out of client-side JavaScript entirely.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getSessionToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
