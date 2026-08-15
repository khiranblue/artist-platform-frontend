import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await apiFetch(`/artworks/${params.id}`, {
      method: 'DELETE',
      auth: true,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('delete artwork proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
