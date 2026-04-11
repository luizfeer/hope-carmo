import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { NewsItem } from '@/types/cms';
import { getPublishedNews } from '@/lib/cms/queries';
import { cn } from '@/lib/utils';

function formatDate(d: string | null) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  return `${day}/${m}/${y}`;
}

function NewsArticleCard({
  article,
  fallback,
}: {
  article: NewsItem;
  fallback: string;
}) {
  const external = Boolean(article.external_url?.trim());
  const href = external ? article.external_url!.trim() : `/news/${article.slug}`;
  const thumb = article.thumb_url?.trim() || fallback;

  const card = (
    <>
      <div className="relative mb-6 h-64 overflow-hidden rounded-2xl">
        <Image
          src={thumb}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-pink-600/90 px-3 py-1 text-sm font-medium text-white shadow-lg">
            {article.category}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium uppercase tracking-wider text-pink-300/80">
          {formatDate(article.published_at)}
        </div>

        <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-pink-400">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="leading-relaxed text-pink-100/70">{article.excerpt}</p>
        )}

        <span className="flex items-center font-medium text-pink-300 transition-colors group-hover:text-pink-400">
          {external ? 'Abrir link' : 'Ler mais'}
          <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </>
  );

  const className = 'group block cursor-pointer';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {card}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {card}
    </Link>
  );
}

export type NewsSectionProps = {
  /** `home`: até 6 no desktop, 3 no telemóvel + link para ver todas. `full`: lista completa. */
  variant?: 'home' | 'full';
};

export async function NewsSection({ variant = 'full' }: NewsSectionProps) {
  const items = await getPublishedNews();
  const isHome = variant === 'home';
  const slice = isHome ? items.slice(0, 6) : items;

  const subtitle =
    variant === 'home'
      ? 'Fique por dentro de tudo que está acontecendo no Hope Carmo'
      : 'Todas as publicações, da mais recente para a mais antiga.';

  return (
    <section
      id="noticias"
      className="scroll-mt-24 bg-gradient-to-br from-violet-900 via-violet-950 to-black py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-8 text-5xl font-black text-white md:text-7xl">NOTÍCIAS</h2>
          <p className="text-xl font-light text-pink-100/80">{subtitle}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-lg text-pink-200/50">Novidades em breve.</p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {slice.map((article, index) => (
                <div
                  key={article.id}
                  className={cn(isHome && index >= 3 && 'hidden md:block')}
                >
                  <NewsArticleCard article={article} fallback="/img/bg.webp" />
                </div>
              ))}
            </div>

            {isHome && items.length > 3 ? (
              <div className="mt-14 flex justify-center">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 rounded-full border border-pink-400/40 bg-pink-950/30 px-8 py-3 text-base font-semibold text-pink-100 transition hover:border-pink-300 hover:bg-pink-900/40 hover:text-white"
                >
                  Ver todas as notícias
                  <ArrowUpRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
