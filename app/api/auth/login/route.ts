import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  try {
    const result = await apiFetch<{ user: { username: string }; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: body.username, password: body.password }),
    });

    setSessionCookie(result.token);
    // The token itself never reaches the response body sent to the
    // browser — only the non-sensitive user summary does.
    return NextResponse.json({ user: result.user }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: 'login_failed' }, { status: err.status });
    }
    console.error('login proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
