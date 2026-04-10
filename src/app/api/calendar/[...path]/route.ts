import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathStr = path.join('/');
  const search = request.nextUrl.search;
  const url = `https://calendar.google.com/${pathStr}${search}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'text/calendar, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (compatible; HopeCarmo/1.0)',
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const contentType =
    res.headers.get('Content-Type') || 'text/calendar; charset=utf-8';

  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': contentType },
  });
}
