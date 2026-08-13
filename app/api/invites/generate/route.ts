import { NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function POST() {
  try {
    const result = await apiFetch('/invites/generate', { method: 'POST', auth: true });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('generate invite proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
