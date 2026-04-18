/**
 * Next.js App Router 서버사이드 프록시
 * 브라우저 → Vercel(서버) → Render 순으로 중계해 CORS 완전 우회
 */
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

async function proxy(request: NextRequest, path: string): Promise<NextResponse> {
  const qs = request.nextUrl.search;
  const target = `${BACKEND}/${path}${qs}`;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
      redirect: 'follow',
      cache: 'no-store',
    });

    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path.join('/'));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxy(request, path.join('/'));
}
