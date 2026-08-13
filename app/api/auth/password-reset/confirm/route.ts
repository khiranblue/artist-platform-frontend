import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('password reset confirm proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
