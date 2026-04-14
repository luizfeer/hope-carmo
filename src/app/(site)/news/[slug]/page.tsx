import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { NewsBodyMarkdown } from '@/components/cms/NewsBodyMarkdown';
import { NewsComments } from '@/components/cms/NewsComments';
import { NEWS_COMMENTS_ENABLED } from '@/lib/feature-flags';
import { getNewsBySlug, getNewsComments } from '@/lib/cms/queries';
import { SITE_URL, absoluteAssetUrl } from '@/lib/site-url';

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

  return (
    <article className="min-h-screen bg-gradient-to-b from-violet-950 to-black pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/news"
          className="text-pink-300/80 text-sm hover:text-pink-200 mb-8 inline-block"
        >
          ← Notícias
        </Link>

        <p className="text-pink-300/70 text-sm uppercase tracking-wider mb-4">
          {item.category}
          {item.published_at && (
            <span className="ml-2">
              ·{' '}
              {new Date(item.published_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </p>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
          {item.title}
        </h1>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-10 border border-white/10">
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
        </div>

        {item.excerpt && (
          <p className="text-xl text-pink-100/80 leading-relaxed mb-8 border-l-4 border-pink-500 pl-4">
            {item.excerpt}
          </p>
        )}

        {item.body?.trim() ? (
          <NewsBodyMarkdown content={item.body} articleTitle={item.title} />
        ) : null}

        {NEWS_COMMENTS_ENABLED ? (
          <NewsComments newsId={item.id} slug={slug} initialComments={comments} />
        ) : null}
      </div>
    </article>
  );
}
