'use client';

import type { ComponentPropsWithoutRef } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import {
  shouldOpenPesquisaModalSamePage,
  usePesquisaModalOptional,
} from '@/components/PesquisaModalProvider';
import { parseNewsMarkdown } from '@/lib/parseNewsMarkdown';
import { parseYoutubeVideoId } from '@/lib/youtube';

const linkClass =
  'font-medium text-pink-300 underline decoration-pink-500/50 underline-offset-4 transition-colors hover:text-pink-200';

function NewsMarkdownAnchor({
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<'a'>) {
  const pesquisa = usePesquisaModalOptional();

  if (pesquisa && href && shouldOpenPesquisaModalSamePage(href)) {
    return (
      <a
        href={href}
        className={linkClass}
        {...rest}
        onClick={(e) => {
          e.preventDefault();
          pesquisa.openModal();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={linkClass}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}

function NewsVideoEmbed({ raw, title }: { raw: string; title: string }) {
  const id = parseYoutubeVideoId(raw);
  if (!id) {
    return (
      <p className="rounded-lg border border-pink-500/30 bg-black/40 px-4 py-3 text-sm text-pink-200/80">
        Vídeo inválido: use um link ou ID do YouTube dentro de [video]…[/video].
      </p>
    );
  }
  return (
    <div className="relative my-8 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black last:mb-0">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

const mdClassName = [
  'news-md-content max-w-none text-[1.05rem] leading-relaxed text-pink-50/95',
  'prose prose-invert max-w-none',
  'prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight',
  'prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:mb-4',
  'prose-h2:mt-10 prose-h2:mb-3 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:text-2xl',
  'prose-h3:mt-8 prose-h3:text-xl',
  'prose-p:leading-relaxed',
  'prose-strong:text-white prose-strong:font-semibold',
  'prose-ul:my-4 prose-ol:my-4',
  'prose-li:marker:text-pink-400',
  'prose-blockquote:border-l-4 prose-blockquote:border-pink-500/70 prose-blockquote:bg-white/[0.04] prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-pink-100/90',
  'prose-code:rounded-md prose-code:bg-black/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-amber-200 prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-zinc-950 prose-pre:shadow-inner',
  'prose-hr:border-white/15',
  'prose-table:block prose-table:overflow-x-auto prose-th:border prose-th:border-white/15 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2',
].join(' ');

const components: Components = {
  img: ({ node, ...props }) => {
    void node;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs dinâmicas do Supabase / externos
      <img
        {...props}
        alt={props.alt ?? ''}
        className="my-6 w-full max-w-full rounded-xl border border-white/10 bg-black/20 object-contain shadow-lg"
        loading="lazy"
      />
    );
  },
  a: ({ node, href, children, ...props }) => {
    void node;
    return (
      <NewsMarkdownAnchor href={href} {...props}>
        {children}
      </NewsMarkdownAnchor>
    );
  },
};

type Props = { content: string; articleTitle?: string };

export function NewsBodyMarkdown({ content, articleTitle = 'Vídeo' }: Props) {
  const blocks = parseNewsMarkdown(content);

  return (
    <div className="space-y-6">
      {blocks.map((block, i) =>
        block.type === 'video' ? (
          <NewsVideoEmbed key={`v-${i}`} raw={block.raw} title={articleTitle} />
        ) : (
          <div key={`m-${i}`} className={mdClassName}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={components}
            >
              {block.text}
            </ReactMarkdown>
          </div>
        ),
      )}
    </div>
  );
}
