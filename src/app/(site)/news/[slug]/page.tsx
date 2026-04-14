import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { NewsArticleView } from '@/components/cms/NewsArticleView';
import { getNewsBySlug, getNewsComments } from '@/lib/cms/queries';
import { SITE_URL, absoluteAssetUrl } from '@/lib/site-url';
import { NEWS_COMMENTS_ENABLED } from '@/lib/feature-flags';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) {
    return { title: 'Notícia | Hope Carmo' };
  }
  const title = item.meta_title?.trim() || item.title;
  const description =
    item.meta_description?.trim() || item.excerpt?.trim() || undefined;
  /** URL absoluta HTTPS — exigida por WhatsApp / Telegram para pré-visualização. */
  const ogImageUrl = absoluteAssetUrl(item.thumb_url);
  const pageUrl = `${SITE_URL}/news/${slug}`;
  const publishedTime = item.published_at
    ? new Date(item.published_at).toISOString()
    : undefined;

  return {
    title: `${title} | Hope Carmo`,
    description,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: pageUrl,
      siteName: 'Hope Carmo',
      locale: 'pt_BR',
      publishedTime,
      images: [
        {
          url: ogImageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const ext = item.external_url?.trim();
  if (ext) redirect(ext);

  const thumb = item.thumb_url?.trim() || '/img/bg.webp';
  const comments = NEWS_COMMENTS_ENABLED
    ? await getNewsComments(item.id)
    : [];

  const shareUrl = `${SITE_URL}/news/${slug}`;

  return (
    <article className="min-h-screen bg-gradient-to-b from-violet-950 to-black pt-28 pb-24">
      <NewsArticleView
        item={item}
        slug={slug}
        thumb={thumb}
        comments={comments}
        shareUrl={shareUrl}
      />
    </article>
  );
}
