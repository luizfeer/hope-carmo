import { ImageResponse } from 'next/og';
import { getNewsBySlug } from '@/lib/cms/queries';
import { SITE_URL, absoluteAssetUrl } from '@/lib/site-url';

export const alt = 'Notícia Hope Carmo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function truncateTitle(s: string, max = 110): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  const title = truncateTitle(
    item ? item.meta_title?.trim() || item.title : 'Notícia',
  );
  const thumb = item
    ? absoluteAssetUrl(item.thumb_url)
    : `${SITE_URL}/img/bg.webp`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 56,
            paddingRight: 40,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: '#f472b6',
              marginBottom: 20,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
            }}
          >
            Hope Carmo · Notícias
          </div>
          <div
            style={{
              fontSize: title.length > 80 ? 44 : 52,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            width: 460,
            height: '100%',
            display: 'flex',
            position: 'relative',
          }}
        >
          <img
            src={thumb}
            alt=""
            width={460}
            height={630}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
