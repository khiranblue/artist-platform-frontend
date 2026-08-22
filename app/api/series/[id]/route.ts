import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch(`/series/${params.id}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('update series proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await apiFetch(`/series/${params.id}`, { method: 'DELETE', auth: true });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('delete series proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
