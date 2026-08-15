import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch('/supply-upload-intent', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('supply upload intent proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
