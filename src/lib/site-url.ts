/**
 * URL canónica do site (OG, Twitter, JSON-LD).
 * Defina `NEXT_PUBLIC_SITE_URL` no deploy (ex.: https://hopecarmo.com) sem barra final.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://hopecarmo.com';

/** Garante URL absoluta https para meta tags (WhatsApp, Telegram, etc.). */
export function absoluteAssetUrl(
  href: string | null | undefined,
  fallbackPath = '/img/bg.webp',
): string {
  const fb = fallbackPath.startsWith('http')
    ? fallbackPath
    : `${SITE_URL}${fallbackPath.startsWith('/') ? '' : '/'}${fallbackPath}`;
  const u = href?.trim();
  if (!u) return fb;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}
