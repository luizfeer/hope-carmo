import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GaleriaPinterest from '@/components/intensivao/GaleriaPinterest';
import { GALERIA } from '@/data/intensivao-galeria';
import { anton } from '@/components/intensivao/fonts';
import { Grain } from '@/components/intensivao/visuals';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Fotos — Intensivão | Hope Carmo',
  description:
    'Galeria de fotos do Intensivão Hope Carmo: louvor, comunhão e palavra em uma semana inteira de férias.',
  openGraph: {
    title: 'Fotos — Intensivão | Hope Carmo',
    description: 'Galeria completa de fotos do Intensivão Hope Carmo.',
    url: `${SITE_URL}/intensivao/fotos`,
  },
  alternates: { canonical: `${SITE_URL}/intensivao/fotos` },
};

export default function Page() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl" />
        </div>
        <Grain />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <Link
            href="/intensivao"
            className="inline-flex items-center gap-2 text-red-500 text-xs font-bold tracking-widest uppercase hover:text-red-400 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Voltar pro Intensivão
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-600" />
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Galeria · {GALERIA.length} fotos
            </span>
          </div>
          <h1 className={`${anton.className} text-5xl md:text-8xl uppercase text-red-600 blur-[1px] mb-12 md:mb-16`}>
            As fotos
          </h1>

          <GaleriaPinterest />
        </div>
      </section>
    </main>
  );
}
