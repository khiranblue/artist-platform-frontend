import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  try {
    const result = await apiFetch(`/supplies${search}`, { auth: true });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('list supplies proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  try {
    const result = await apiFetch('/supplies', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(body),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    console.error('create supply proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
