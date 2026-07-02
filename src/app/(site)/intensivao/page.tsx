import type { Metadata } from 'next';
import IntensivaoPage from '@/components/intensivao/IntensivaoPage';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Esperança na Cruz — Intensivão | Hope Carmo',
  description:
    'Intensivão Hope Carmo: Esperança na Cruz. De 27/07 a 01/08 — nos lares, sala de oração, Hope na igreja e encerramento no Auditório Municipal. Muitos convidados, muito louvor, comunhão e palavra.',
  openGraph: {
    title: 'Esperança na Cruz — Intensivão | Hope Carmo',
    description:
      'Uma semana inteira de férias vivendo esperança: 27/07 a 01/08. Encerramento no Auditório Municipal.',
    url: `${SITE_URL}/intensivao`,
  },
  alternates: { canonical: `${SITE_URL}/intensivao` },
};

export default function Page() {
  return <IntensivaoPage />;
}
