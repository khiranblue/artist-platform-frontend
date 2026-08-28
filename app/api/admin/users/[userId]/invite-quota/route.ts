import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

// Proxies POST /api/admin/users/:userId/invite-quota — same pattern as
// account/email/route.ts: read the httpOnly session cookie server-side,
// forward as Authorization: Bearer, never expose the token to the client.
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch(`/admin/users/${params.userId}/invite-quota`, {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('grant invite quota proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
