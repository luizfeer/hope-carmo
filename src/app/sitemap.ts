import type { MetadataRoute } from 'next';
import { getPublishedNews } from '@/lib/cms/queries';
import { SITE_URL } from '@/lib/site-url';

/**
 * Gerado em runtime (não no build): assim usa as variáveis do Supabase do
 * ambiente de produção e não quebra o build quando elas não estão presentes.
 */
export const dynamic = 'force-dynamic';

/** Sitemap dinâmico: rotas estáticas + uma entrada por notícia publicada. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * Se o Supabase não estiver configurado (ex.: build/preview sem env),
   * seguimos só com as rotas estáticas em vez de derrubar a geração.
   */
  let news: Awaited<ReturnType<typeof getPublishedNews>> = [];
  try {
    news = (await getPublishedNews()).filter((n) => !n.external_url?.trim());
  } catch (e) {
    console.error('sitemap: falha ao buscar notícias, usando rotas estáticas', e);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/intensivao`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/schedule`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/donations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = news.map((item) => {
    const last =
      item.updated_at ||
      item.published_at ||
      item.created_at;
    return {
      url: `${SITE_URL}/news/${item.slug}`,
      lastModified: last ? new Date(last) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    };
  });

  return [...staticRoutes, ...articleRoutes];
}
