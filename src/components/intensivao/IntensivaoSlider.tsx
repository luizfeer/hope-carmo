'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FotoIntensivao } from '@/data/intensivao';
import { anton } from './fonts';

interface Tab {
  label: string;
  fotos: FotoIntensivao[];
}

interface Props {
  tabs: Tab[];
}

const AUTOPLAY_MS = 3500;

/**
 * Slider "acordeão": todas as fotos ficam lado a lado como frestas,
 * a ativa expande ocupando a maior parte e, ao avançar, as posições
 * trocam com uma transição de flex suave.
 */
const IntensivaoSlider: React.FC<Props> = ({ tabs }) => {
  const validTabs = tabs.filter((t) => t.fotos.length > 0);
  const [tabIndex, setTabIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const fotos = validTabs[tabIndex]?.fotos ?? [];

  const advance = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => (a + dir + fotos.length) % fotos.length);
    },
    [fotos.length],
  );

  // Detecta viewport pequeno (< md) para trocar acordeão por faixa com scroll
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || fotos.length < 2) return;
    timer.current = setInterval(() => advance(1), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, advance, fotos.length]);

  // No mobile, traz a foto ativa para o centro da faixa
  useEffect(() => {
    if (!isMobile) return;
    itemRefs.current[active]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [active, isMobile, tabIndex]);

  if (validTabs.length === 0) return null;

  return (
    <div>
      {/* Abas de ano (só aparecem se houver mais de um conjunto de fotos) */}
      <div className="flex items-end justify-between mb-6">
        {validTabs.length > 1 ? (
          <div className="flex gap-2">
            {validTabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setTabIndex(i);
                  setActive(0);
                }}
                className={`${anton.className} px-5 py-2 text-lg tracking-wide border transition-colors duration-300 ${
                  i === tabIndex
                    ? 'bg-red-600 text-black border-red-600'
                    : 'text-red-600 border-red-600/40 hover:border-red-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <span className={`${anton.className} text-red-600 text-lg tracking-wide`}>
            {validTabs[0].label}
          </span>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Foto anterior"
            className="w-10 h-10 flex items-center justify-center border border-red-600/40 text-red-500 hover:bg-red-600 hover:text-black transition-colors duration-300"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Próxima foto"
            className="w-10 h-10 flex items-center justify-center border border-red-600/40 text-red-500 hover:bg-red-600 hover:text-black transition-colors duration-300"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Acordeão (desktop) / faixa com scroll horizontal (mobile) */}
      <div
        className={`flex gap-2 md:gap-2 h-[340px] md:h-[520px] select-none ${
          isMobile
            ? 'overflow-x-auto snap-x snap-mandatory scroll-smooth [scroll-padding-inline:10%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'overflow-hidden'
        }`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {fotos.map((foto, i) => {
          const isActive = i === active;
          /**
           * Desktop: acordeão animando flex-basis.
           * Mobile: largura fixa + transform:scale (GPU, sem reflow → sem flicker),
           * a foto ativa fica em escala cheia e as vizinhas encolhem suave.
           */
          const style: React.CSSProperties = isMobile
            ? {
                flex: '0 0 80%',
                transform: isActive ? 'scale(1)' : 'scale(0.9)',
                transformOrigin: 'center',
                transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
              }
            : {
                flex: isActive ? '10 1 0%' : '1 1 0%',
                transition: 'flex 700ms cubic-bezier(0.22, 1, 0.36, 1)',
              };
          return (
            <button
              key={`${tabIndex}-${foto.src}-${i}`}
              type="button"
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => setActive(i)}
              aria-label={isActive ? foto.alt : `Expandir foto ${i + 1}`}
              className="relative min-w-0 overflow-hidden rounded-sm bg-zinc-950 group snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              style={style}
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="(max-width: 768px) 80vw, 60vw"
                quality={78}
                className={`object-cover transition-all duration-700 ${
                  isActive
                    ? 'grayscale-0 opacity-100 scale-100'
                    : 'grayscale opacity-50 scale-105 group-hover:opacity-80'
                }`}
              />
              {/* Tinta vermelha sobre as inativas */}
              <div
                className={`absolute inset-0 bg-red-900 mix-blend-multiply transition-opacity duration-700 pointer-events-none ${
                  isActive ? 'opacity-0' : 'opacity-60'
                }`}
              />
              {/* Contador na foto ativa */}
              <div
                className={`absolute bottom-3 left-4 transition-opacity duration-500 ${
                  isActive ? 'opacity-100 delay-300' : 'opacity-0'
                }`}
              >
                <span className={`${anton.className} text-red-500 text-sm tracking-widest`}>
                  {String(i + 1).padStart(2, '0')} / {String(fotos.length).padStart(2, '0')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IntensivaoSlider;
