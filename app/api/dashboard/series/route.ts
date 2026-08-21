import { NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function GET() {
  try {
    const result = await apiFetch('/dashboard/series?limit=60', { auth: true });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('list series proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
