'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import SermonModal from './SermonModal';

const SermonSeries: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-[2px] bg-orange-500" />
            <span className="text-orange-400 text-xs font-bold tracking-widest uppercase">
              Série atual
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — series card */}
            <div className="relative group">
              {/* Card glow border */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-orange-500/40 via-yellow-400/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-orange-500/20">
                {/* Arte da série — next/image otimiza (WebP/AVIF) e reduz peso em relação ao PNG original */}
                <div className="relative aspect-video w-full bg-black">
                  <Image
                    src="/img/convictos.PNG"
                    alt="Convictos — série atual. Toda sexta 20h. Fé que passa pelo fogo. 2 Timóteo 1.12"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 42rem"
                    quality={80}
                  />
                </div>

                <div className="p-6">
                  <p className="text-orange-400 font-bold text-lg mb-1">
                    Fé que Passa pelo Fogo
                  </p>
                  <p className="text-white/40 text-sm italic leading-relaxed">
                    {
                      '"Eu sei em quem tenho crido e estou convencido de que ele é poderoso para guardar o que me foi confiado."'
                    }
                  </p>
                  <p className="text-orange-500/60 text-xs font-bold mt-2 tracking-wide">
                    2 Timóteo 1.12
                  </p>
                </div>
              </div>
            </div>

            {/* Right — CTA */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                  A fé que resiste{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                    ao fogo
                  </span>{' '}
                  é a fé que vale.
                </h2>
                <p className="text-white/50 text-base leading-relaxed">
                  Durante essa série, vamos falar sobre as dúvidas que não têm coragem de sair em voz alta,
                  os momentos em que quase desistimos e o que ainda nos sustenta. Você não precisa fingir que
                  está tudo bem.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-white/30 text-xs font-bold tracking-widest uppercase">
                  Perguntas da série
                </p>
                {[
                  'Qual dúvida sobre a fé você nunca teve coragem de fazer em voz alta?',
                  'Já teve um momento em que quis desistir de crer?',
                  'O que mais te ajudou a continuar crendo?',
                ].map((q, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-white/60 text-sm leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-black text-sm tracking-wider rounded-xl hover:from-orange-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
              >
                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                Responder anonimamente
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && <SermonModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default SermonSeries;
