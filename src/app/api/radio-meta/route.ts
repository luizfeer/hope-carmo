import { NextResponse } from 'next/server';

// Base do servidor a partir da URL do stream
const STREAM_URL = process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? '';

function getBase(url: string) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const base = getBase(STREAM_URL);
  if (!base) {
    return NextResponse.json({ title: null }, { status: 200 });
  }

  // Tenta Icecast JSON → fallback Shoutcast /7.html
  const attempts = [
    { url: `${base}/status-json.xsl`, parser: parseIcecast },
    { url: `${base}/7.html`,          parser: parseShoutcast },
  ];

  for (const { url, parser } of attempts) {
    try {
      const res = await fetch(url, {
        headers: { 'Icy-MetaData': '1', 'User-Agent': 'HopeCarmo/1.0' },
        signal: AbortSignal.timeout(4000),
        cache: 'no-store',
      });
      if (!res.ok) continue;

      const text = await res.text();
      const title = parser(text);
      if (title) return NextResponse.json({ title });
    } catch {
      // tenta o próximo
    }
  }

  return NextResponse.json({ title: null });
}

function parseIcecast(text: string): string | null {
  try {
    const json = JSON.parse(text);
    // Icecast retorna icestats.source (objeto ou array)
    const sources = json?.icestats?.source;
    const source = Array.isArray(sources) ? sources[0] : sources;
    return source?.title ?? source?.song ?? null;
  } catch {
    return null;
  }
}

function parseShoutcast(text: string): string | null {
  // /7.html retorna: currentlisteners,peaklisteners,maxlisteners,unique,streams,bitrate,songtitle
  try {
    const parts = text.replace(/<[^>]+>/g, '').split(',');
    return parts[6]?.trim() || null;
  } catch {
    return null;
  }
}
