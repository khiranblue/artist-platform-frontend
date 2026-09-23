import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';
import { isSameOriginRequest } from '@/lib/csrf';

/**
 * The display name is shown on the home gallery, every artist page and
 * every series page, all cached for 60s. Purging them after a successful
 * save makes a new name appear at once instead of up to a minute later —
 * the same fix as the series proxy (app/api/series/[id]/route.ts).
 */
function revalidateProfileViews() {
  revalidatePath('/');
  revalidatePath('/artists/[username]', 'page');
  revalidatePath('/series/[id]', 'page');
}

export async function PATCH(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch('/account/profile', {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(body),
    });
    revalidateProfileViews();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('update profile proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
