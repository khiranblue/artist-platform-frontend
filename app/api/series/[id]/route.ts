import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

/**
 * The public pages that list or show a series are cached for 60s
 * (`revalidate = 60`). Without this, a series switched to Private or
 * deleted stays visible to anonymous visitors for up to a minute —
 * measured live at 67–90s. Purging all three routes here closes that
 * window: the next anonymous request re-renders from the backend.
 * The dynamic-segment form ('page') invalidates every artist and
 * series page, so no username or id is needed in this handler.
 */
function revalidateSeriesViews() {
  revalidatePath('/');
  revalidatePath('/artists/[username]', 'page');
  revalidatePath('/series/[id]', 'page');
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch(`/series/${params.id}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(body),
    });
    revalidateSeriesViews();
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
    revalidateSeriesViews();
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('delete series proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
