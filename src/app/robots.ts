import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

/**
 * robots.txt — permite indexação do site público, bloqueia áreas privadas
 * e aponta o sitemap para o Google descobrir todas as páginas.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/auth', '/api', '/dashboard-shell-01'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
