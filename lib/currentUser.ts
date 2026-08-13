import { apiFetch, ApiError } from './api';
import { getSessionToken } from './session';

export interface CurrentUser {
  username: string;
  account_status: string;
  storage_quota_mb: number;
  storage_used_mb: number;
  email: string | null;
  email_verification_pending: boolean;
  created_at: string;
}

/**
 * Returns null for any auth failure (no cookie, expired token, backend
 * down) rather than throwing — callers decide what "not logged in" means
 * for their page (redirect, show a guest view, etc.).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!getSessionToken()) return null;
  try {
    return await apiFetch<CurrentUser>('/account', { auth: true });
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
}
