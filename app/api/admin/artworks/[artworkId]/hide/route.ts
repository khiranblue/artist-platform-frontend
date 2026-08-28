import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';
import { isSameOriginRequest } from '@/lib/csrf';

// Proxies POST /api/admin/artworks/:artworkId/hide — same server-side-only
// token pattern as every other proxy in this folder.
export async function POST(req: NextRequest, { params }: { params: { artworkId: string } }) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: 'csrf_rejected' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch(`/admin/artworks/${params.artworkId}/hide`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('hide artwork proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
