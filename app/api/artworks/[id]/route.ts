import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

/**
 * Deleting a photo changes the gallery card (count, and the cover when the
 * latest photo goes) and the series page, all cached for 60s. Purge them so
 * a deleted photo is gone for visitors at once — same as the series proxy.
 */
function revalidateSeriesViews() {
  revalidatePath('/');
  revalidatePath('/artists/[username]', 'page');
  revalidatePath('/series/[id]', 'page');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await apiFetch(`/artworks/${params.id}`, {
      method: 'DELETE',
      auth: true,
    });
    revalidateSeriesViews();
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('delete artwork proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
