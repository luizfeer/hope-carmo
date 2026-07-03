import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GALERIA, galeriaAlt, galeriaUrl } from '@/data/intensivao-galeria';
import { anton } from './fonts';
import { Grain } from './visuals';

/** Quantidade de fotos no teaser (4 no celular, 8 do md pra cima). */
const DESTAQUES = GALERIA.slice(0, 8);

/**
 * Widget da home: prévia da galeria do Intensivão em grade masonry
 * compacta, com CTA para a galeria completa.
 */
const GaleriaWidget: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-3xl" />
      </div>
      <Grain />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-[2px] bg-red-600" />
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
            Galeria · Intensivão
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <h2 className={`${anton.className} text-5xl md:text-7xl uppercase text-red-600 blur-[1px]`}>
            Como é o Intensivão
          </h2>
          <Link
            href="/intensivao/fotos"
            className={`${anton.className} group inline-flex items-center gap-3 px-6 py-3 border border-red-600 text-red-500 text-lg uppercase tracking-wide hover:bg-red-600 hover:text-black transition-colors duration-300 shrink-0`}
          >
            Ver todas as fotos
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <Link href="/intensivao/fotos" className="block group" aria-label="Abrir galeria de fotos do Intensivão">
          <div className="columns-2 md:columns-4 gap-2 md:gap-3">
            {DESTAQUES.map((foto, i) => (
              <div
                key={foto.id}
                className={`relative mb-2 md:mb-3 break-inside-avoid overflow-hidden rounded-sm bg-zinc-950 ${
                  i >= 4 ? 'hidden md:block' : ''
                }`}
              >
                <img
                  src={galeriaUrl(foto, 500)}
                  alt={galeriaAlt(foto, i)}
                  width={foto.o === 'p' ? 1600 : 2400}
                  height={foto.o === 'p' ? 2400 : 1600}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-red-900/30 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
};

export default GaleriaWidget;
