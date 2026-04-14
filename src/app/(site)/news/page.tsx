import type { Metadata } from 'next';
import { NewsSection } from '@/components/cms/NewsSection';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Notícias | Hope Carmo',
  description:
    'Fique por dentro de eventos, reportagens e novidades do ministério Hope Carmo em Carmo do Rio Claro.',
  openGraph: {
    title: 'Notícias | Hope Carmo',
    description:
      'Fique por dentro de eventos, reportagens e novidades do ministério Hope Carmo.',
    url: `${SITE_URL}/news`,
  },
};

export default function NewsPage() {
  return <NewsSection variant="full" />;
}
