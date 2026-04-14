import type { MetadataRoute } from 'next';
import { getPublishedNews } from '@/lib/cms/queries';
import { SITE_URL } from '@/lib/site-url';

/** Sitemap dinâmico: rotas estáticas + uma entrada por notícia publicada. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = (await getPublishedNews()).filter(
    (n) => !n.external_url?.trim(),
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
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
