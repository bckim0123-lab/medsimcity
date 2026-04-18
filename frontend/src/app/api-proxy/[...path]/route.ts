import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const path = context.params.path.join('/');
  const qs = request.nextUrl.search;
  const target = `${BACKEND}/${path}${qs}`;

  try {
    const res = await fetch(target, { redirect: 'follow', cache: 'no-store' });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  const path = context.params.path.join('/');
  const qs = request.nextUrl.search;
  const target = `${BACKEND}/${path}${qs}`;
  const body = await request.text();

  try {
    const res = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'follow',
      cache: 'no-store',
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
