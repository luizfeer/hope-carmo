'use client';

import Link from 'next/link';
import { NewsBodyMarkdown } from '@/components/cms/NewsBodyMarkdown';
import { NewsArticleHeroImage } from '@/components/cms/NewsArticleHeroImage';
import { NewsImageGalleryProvider } from '@/components/cms/NewsImageGallery';
import { NewsComments } from '@/components/cms/NewsComments';
import { NEWS_COMMENTS_ENABLED } from '@/lib/feature-flags';
import type { NewsComment } from '@/types/cms';
import type { NewsItem } from '@/types/cms';

type Props = {
  item: NewsItem;
  slug: string;
  thumb: string;
  comments: NewsComment[];
};

export function NewsArticleView({ item, slug, thumb, comments }: Props) {
  return (
    <NewsImageGalleryProvider>
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/news"
          className="mb-8 inline-block text-sm text-pink-300/80 hover:text-pink-200"
        >
          ← Notícias
        </Link>

        <p className="mb-4 text-sm uppercase tracking-wider text-pink-300/70">
          {item.category}
          {item.published_at && (
            <span className="ml-2">
              · {new Date(item.published_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </p>

        <h1 className="mb-8 text-4xl font-black leading-tight text-white md:text-5xl">
          {item.title}
        </h1>

        <NewsArticleHeroImage
          src={thumb}
          alt=""
          priority
          downloadSlug={slug}
        />

        {item.excerpt && (
          <p className="mb-8 border-l-4 border-pink-500 pl-4 text-xl leading-relaxed text-pink-100/80">
            {item.excerpt}
          </p>
        )}

        {item.body?.trim() ? (
          <NewsBodyMarkdown
            content={item.body}
            articleTitle={item.title}
            articleSlug={slug}
          />
        ) : null}

        {NEWS_COMMENTS_ENABLED ? (
          <NewsComments
            newsId={item.id}
            slug={slug}
            initialComments={comments}
          />
        ) : null}
      </div>
    </NewsImageGalleryProvider>
  );
}
