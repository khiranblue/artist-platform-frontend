import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await apiFetch(`/upload-reservations/${params.id}/status`, { auth: true });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('reservation status proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
