import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch(`/artworks/${params.id}/visibility`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('set visibility proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
