'use client';

import Image from 'next/image';
import { useNewsImageGallery } from '@/components/cms/NewsImageGallery';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  /** Usado no nome do ficheiro ao baixar com marca. */
  downloadSlug: string;
};

export function NewsArticleHeroImage({
  src,
  alt,
  priority,
  downloadSlug,
}: Props) {
  const gallery = useNewsImageGallery();

  return (
    <div
      className={cn(
        'relative mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-white/10',
        gallery && 'cursor-zoom-in',
      )}
      onClick={() => gallery?.open(src, alt, `${downloadSlug}-capa`)}
      onKeyDown={(e) => {
        if (
          gallery &&
          (e.key === 'Enter' || e.key === ' ') &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          gallery.open(src, alt, `${downloadSlug}-capa`);
        }
      }}
      role={gallery ? 'button' : undefined}
      tabIndex={gallery ? 0 : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 42rem"
        priority={priority}
      />
    </div>
  );
}
