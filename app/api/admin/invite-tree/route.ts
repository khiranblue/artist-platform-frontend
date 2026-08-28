import { NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

// Proxies GET /api/admin/invite-tree on the backend — same pattern as every
// other authenticated route here: the raw JWT never reaches client JS,
// only this server-side handler reads it (via apiFetch's auth:true) from
// the httpOnly session cookie.
export async function GET() {
  try {
    const result = await apiFetch('/admin/invite-tree', { auth: true });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('admin invite tree proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
