/**
 * URL canónica do site (OG, Twitter, sitemap, partilhas).
 * Em produção use `NEXT_PUBLIC_SITE_URL` (ex.: https://hope.ipicarmo.com.br) sem barra final.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://hope.ipicarmo.com.br';

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
