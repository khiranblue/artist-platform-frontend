import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.inviteCode || !body?.username || !body?.password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  try {
    const result = await apiFetch<{ user: { username: string }; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          inviteCode: body.inviteCode,
          username: body.username,
          password: body.password,
        }),
      }
    );

    setSessionCookie(result.token);
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: 'registration_failed' }, { status: err.status });
    }
    console.error('register proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
