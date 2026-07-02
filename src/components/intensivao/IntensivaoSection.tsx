import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INTENSIVAO, PROGRAMACAO } from '@/data/intensivao';
import { anton } from './fonts';
import { Grain, BlurTitle } from './visuals';

/** Seção de divulgação do Intensivão na home (no lugar da série atual). */
const IntensivaoSection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Glow vermelho ambiente */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-900/20 rounded-full blur-3xl" />
      </div>
      <Grain />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-[2px] bg-red-600" />
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
            Intensivão {INTENSIVAO.ano} · Semana de férias
          </span>
        </div>

        {/* Título estilo cartaz */}
        <Link href="/intensivao" className="block group">
          <BlurTitle
            lines={['Esperança', 'na Cruz']}
            className="text-[17vw] md:text-[9rem] lg:text-[11rem] group-hover:scale-[1.01] transition-transform duration-500 origin-left"
          />
          <p className={`${anton.className} text-red-600 text-3xl md:text-5xl mt-4 blur-[0.5px] tracking-wide`}>
            {INTENSIVAO.datas}
          </p>
        </Link>

        {/* Mini calendário */}
        <div className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-px bg-red-600/20 border border-red-600/20">
          {PROGRAMACAO.map((dia) => (
            <div
              key={dia.data}
              className={`p-4 md:p-5 ${
                dia.destaque ? 'bg-red-600 text-black' : 'bg-black text-white'
              }`}
            >
              <p
                className={`${anton.className} text-lg md:text-xl leading-none ${
                  dia.destaque ? 'text-black' : 'text-red-500'
                }`}
              >
                {dia.diaSemana} {dia.data.slice(0, 2)}
              </p>
              <p className={`text-xs mt-2 font-bold uppercase tracking-wide ${dia.destaque ? 'text-black' : 'text-white/70'}`}>
                {dia.titulo}
              </p>
              <p className={`text-[11px] mt-0.5 ${dia.destaque ? 'text-black font-semibold' : 'text-white/40'}`}>
                {dia.local}
              </p>
              <p className={`text-[11px] mt-1 font-bold ${dia.destaque ? 'text-black' : 'text-red-500/80'}`}>
                {INTENSIVAO.hora}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/intensivao"
            className={`${anton.className} group inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-black text-xl uppercase tracking-wide hover:bg-red-500 transition-colors duration-300`}
          >
            Ver tudo sobre o Intensivão
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-white/40 text-sm max-w-xs">
            Muitos convidados, muito louvor, comunhão e palavra. Uma semana inteira pra viver isso.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntensivaoSection;
