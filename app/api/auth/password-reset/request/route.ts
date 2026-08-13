import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    // Even a proxy-level failure must not distinguish itself from the
    // backend's own deliberately generic response — same shape either way.
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('password reset request proxy error:', err);
    return NextResponse.json(
      { message: 'If an account with a verified email matches, a reset link has been sent.' },
      { status: 200 }
    );
  }
}
