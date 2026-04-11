const YT_ID = /^[a-zA-Z0-9_-]{6,}$/;

function normalizeVideoId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const id = raw.split(/[?&/#]/)[0];
  return id && YT_ID.test(id) ? id : null;
}

/** Extrai o ID do vídeo a partir de URLs comuns do YouTube. */
export function parseYoutubeVideoId(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl.trim());
    const fromQuery = u.searchParams.get('v');
    const q = normalizeVideoId(fromQuery);
    if (q) return q;

    const path = u.pathname.replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    if (u.hostname.replace(/^www\./, '') === 'youtu.be' && segments[0]) {
      return normalizeVideoId(segments[0]);
    }

    if (segments[0] === 'embed' && segments[1]) {
      return normalizeVideoId(segments[1]);
    }
    if (segments[0] === 'shorts' && segments[1]) {
      return normalizeVideoId(segments[1]);
    }
    if (segments[0] === 'live' && segments[1]) {
      return normalizeVideoId(segments[1]);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Converte duração ISO 8601 da API do YouTube (ex.: PT1H2M3S) para exibição (1:02:03 ou 12:45). */
export function formatYoutubeIsoDuration(iso: string): string | null {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  if (h > 0) {
    return `${h}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${min}:${String(s).padStart(2, '0')}`;
}

/** Miniatura padrão do YouTube a partir da URL do vídeo. */
export function youtubeThumbnailFromUrl(videoUrl: string): string | null {
  const id = parseYoutubeVideoId(videoUrl);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
