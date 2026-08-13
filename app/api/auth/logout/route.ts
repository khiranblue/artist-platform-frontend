import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  // The JWT itself isn't revocable server-side in the current backend
  // design (no token blocklist) — logout here just discards the client's
  // only copy of it. A stolen token would still work until it expires;
  // that's a backend-level tradeoff already made, not something the
  // frontend can fix by itself.
  clearSessionCookie();
  return NextResponse.json({ status: 'logged_out' }, { status: 200 });
}
