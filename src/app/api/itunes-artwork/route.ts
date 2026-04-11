import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy da busca de capa no iTunes — o cliente não chama a Apple diretamente.
 * Evita falhas no Safari iOS (ITP / políticas em fetch cross-origin para itunes.apple.com).
 */
export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get('term')?.trim();
  if (!term) {
    return NextResponse.json({ artworkUrl: null });
  }

  try {
    const q = encodeURIComponent(term);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=10`,
      {
        headers: { 'User-Agent': 'HopeCarmo/1.0' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      return NextResponse.json({ artworkUrl: null });
    }

    const data = (await res.json()) as {
      results?: Array<{ artworkUrl100?: string; kind?: string }>;
    };

    const hit = data.results?.find(
      (r) =>
        r.kind === 'song' &&
        r.artworkUrl100 &&
        (/\.(jpg|jpeg|png|webp)/i.test(r.artworkUrl100) || r.artworkUrl100.includes('mzstatic.com')),
    );

    const raw = hit?.artworkUrl100;
    const artworkUrl = raw ? raw.replace(/\d+x\d+bb/, '600x600bb') : null;

    return NextResponse.json({ artworkUrl });
  } catch {
    return NextResponse.json({ artworkUrl: null });
  }
}
