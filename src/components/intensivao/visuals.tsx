import React from 'react';
import { anton } from './fonts';

/** Ruído/granulado por cima das seções, como no cartaz. */
export const Grain: React.FC = () => (
  <div
    aria-hidden
    className="absolute inset-0 pointer-events-none opacity-[0.10] mix-blend-overlay"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />
);

/** Título vermelho com cópia desfocada por trás — o "glow" do cartaz. */
export const BlurTitle: React.FC<{
  lines: string[];
  className?: string;
  colorClassName?: string;
}> = ({ lines, className = '', colorClassName = 'text-red-600' }) => (
  <div className={`relative ${className}`}>
    {/* Glow desfocado apenas como halo atrás — não deixa o texto ilegível */}
    <div
      aria-hidden
      className={`${anton.className} absolute inset-0 ${colorClassName} blur-[18px] md:blur-[26px] opacity-50 scale-[1.03]`}
    >
      {lines.map((l, i) => (
        <span key={i} className="block leading-[0.98] uppercase tracking-[0.01em]">
          {l}
        </span>
      ))}
    </div>
    {/* Camada da frente quase nítida (só um respiro de blur, como no cartaz) */}
    <div className={`${anton.className} relative ${colorClassName} blur-[0.6px]`}>
      {lines.map((l, i) => (
        <span key={i} className="block leading-[0.98] uppercase tracking-[0.01em]">
          {l}
        </span>
      ))}
    </div>
  </div>
);

/** Letreiro "MUITO LOUVOR • COMUNHÃO • PALAVRA..." em loop. */
export const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  const sequence = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-red-600/30 bg-black py-4 md:py-5">
      <div className="flex w-max animate-intensivao-marquee">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
            {sequence.map((item, i) => (
              <span
                key={`${half}-${i}`}
                className={`${anton.className} uppercase text-3xl md:text-5xl italic tracking-tight whitespace-nowrap px-6 ${
                  i % 2 === 0 ? 'text-red-600' : 'text-[#EDE6CE]'
                }`}
                style={{ transform: 'skewX(-6deg)' }}
              >
                {item}
                <span className="text-red-600/50 pl-12">✝</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
