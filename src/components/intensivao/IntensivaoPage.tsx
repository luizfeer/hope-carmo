import React from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Images,
  ExternalLink,
  Home,
  Church,
  Flame,
  Mic2,
  Newspaper,
  Instagram,
  Clock,
  MapPin,
  CalendarPlus,
} from 'lucide-react';
import {
  INTENSIVAO,
  PROGRAMACAO,
  FOTOS_2025,
  FOTOS_2026,
  VIDEO_URL,
  IMPRENSA,
  icsDataUri,
} from '@/data/intensivao';
import { anton, marola } from './fonts';
import { Grain, BlurTitle, CrossIcon, Marquee } from './visuals';
import IntensivaoSlider from './IntensivaoSlider';

/** Converte link normal do YouTube em link de embed. */
function toEmbedUrl(url: string): string {
  const short = url.match(/youtu\.be\/([\w-]{6,})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([\w-]{6,})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
}

const diaIcone = (titulo: string) => {
  if (titulo === 'Nos Lares') return Home;
  if (titulo === 'Sala de Oração') return Flame;
  if (titulo === 'Hope') return Church;
  return Mic2;
};

const IntensivaoPage: React.FC = () => {
  const sliderTabs = [
    { label: `${INTENSIVAO.ano}`, fotos: FOTOS_2026 },
    { label: `${INTENSIVAO.ano - 1}`, fotos: FOTOS_2025 },
  ];

  return (
    <main className="bg-black text-white">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-900/25 rounded-full blur-3xl" />
        </div>
        <Grain />

        {/* Cruz no canto, como no cartaz */}
        <CrossIcon className="absolute top-24 right-8 h-12 w-12 text-red-600 opacity-80 blur-[1px] md:right-20 md:h-16 md:w-16" />

        <div className="relative text-center">
          <p className={`${anton.className} text-red-500/80 text-sm md:text-base tracking-[0.5em] uppercase mb-8 blur-[0.5px]`}>
            Intensivão · Semana de férias
          </p>

          <BlurTitle
            lines={['Esperança', 'na Cruz']}
            className="text-[18vw] md:text-[10rem] lg:text-[13rem] mx-auto"
          />

          <p className={`${anton.className} text-red-600 text-4xl md:text-6xl mt-8 blur-[1px] tracking-wider`}>
            {INTENSIVAO.datas}
          </p>

          <p className={`${anton.className} text-[#EDE6CE] text-lg md:text-xl tracking-[0.4em] uppercase mt-12`}>
            Hope Carmo
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-red-600/60 animate-bounce">
          <ArrowDown size={22} />
        </div>
      </section>

      {/* ============ LETREIRO ============ */}
      <Marquee items={['Muito Louvor', 'Muitos Convidados', 'Comunhão', 'Palavra']} />

      {/* ============ CALENDÁRIO ============ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Grain />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-600" />
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              A semana
            </span>
          </div>
          <h2 className={`${anton.className} text-5xl md:text-7xl uppercase text-red-600 blur-[1px] mb-14`}>
            Calendário
          </h2>

          <div className="space-y-px bg-red-600/15">
            {PROGRAMACAO.map((dia) => {
              const Icone = diaIcone(dia.titulo);
              return (
                <div
                  key={dia.data}
                  className={`flex items-center gap-5 md:gap-10 px-5 md:px-10 py-6 md:py-8 transition-colors ${
                    dia.destaque ? 'bg-red-600 text-black' : 'bg-black hover:bg-red-950/30'
                  }`}
                >
                  <div className="w-20 md:w-32 shrink-0">
                    <p className={`${anton.className} text-2xl md:text-4xl leading-none ${dia.destaque ? 'text-black' : 'text-red-600'}`}>
                      {dia.diaSemana}
                    </p>
                    <p className={`text-xs md:text-sm font-bold mt-1 ${dia.destaque ? 'text-black' : 'text-white/40'}`}>
                      {dia.data}
                    </p>
                  </div>
                  <Icone
                    size={26}
                    className={`shrink-0 ${dia.destaque ? 'text-black' : 'text-red-600'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`${anton.className} text-xl md:text-3xl uppercase leading-tight ${dia.destaque ? 'text-black' : 'text-white'}`}>
                      {dia.titulo}
                    </p>
                    {/* Hora + local (com mapa) */}
                    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm md:text-base ${dia.destaque ? 'text-black' : 'text-white/50'}`}>
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Clock size={14} className="shrink-0" />
                        {INTENSIVAO.hora}
                      </span>
                      {dia.mapsUrl ? (
                        <a
                          href={dia.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 font-semibold underline decoration-1 underline-offset-2 transition-opacity hover:opacity-70 ${
                            dia.destaque ? 'text-black' : 'text-red-400'
                          }`}
                        >
                          <MapPin size={14} className="shrink-0" />
                          {dia.local}
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="shrink-0 opacity-50" />
                          {dia.local}
                        </span>
                      )}
                    </div>
                  </div>
                  {dia.destaque && (
                    <span className={`${anton.className} ml-auto self-start hidden lg:block text-black text-lg uppercase tracking-wide text-right`}>
                      Muitos convidados
                      <br />
                      Muito louvor
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
            <a
              href={icsDataUri(PROGRAMACAO)}
              download="intensivao-hope-semana.ics"
              className={`${anton.className} inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-black text-lg uppercase tracking-wide hover:bg-red-500 transition-colors`}
            >
              <CalendarPlus size={18} />
              Adicionar a semana toda
            </a>
            <p className="text-white/40 text-sm">
              Todos os encontros começam às {INTENSIVAO.hora}. O arquivo funciona no Google Agenda,
              Apple e Outlook.
            </p>
          </div>

          <p className="text-white/40 text-sm mt-6">
            Segunda a quarta nos lares · Quinta sala de oração na igreja · Sexta Hope na igreja ·
            Sábado encerramento no Auditório Municipal com muitos convidados, muito louvor,
            comunhão e palavra.
          </p>
        </div>
      </section>

      {/* ============ FOTOS (SLIDER) ============ */}
      <section className="relative py-24 md:py-32 overflow-hidden border-t border-red-600/15">
        <Grain />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-600" />
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Galeria
            </span>
          </div>
          <h2 className={`${anton.className} text-5xl md:text-7xl uppercase text-red-600 blur-[1px] mb-14`}>
            Como foi / Como vai ser
          </h2>

          <IntensivaoSlider tabs={sliderTabs} />

          <div className="mt-10">
            <Link
              href="/intensivao/fotos"
              className={`${anton.className} group inline-flex items-center gap-3 px-8 py-4 border border-red-600 text-red-500 text-xl uppercase tracking-wide hover:bg-red-600 hover:text-black transition-colors duration-300`}
            >
              <Images size={20} />
              Ver todas as fotos
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VÍDEO ============ */}
      <section className="relative py-24 md:py-32 overflow-hidden border-t border-red-600/15">
        <Grain />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-600" />
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Assista
            </span>
          </div>
          <h2 className={`${anton.className} text-5xl md:text-7xl uppercase text-red-600 blur-[1px] mb-14`}>
            O vídeo
          </h2>

          {VIDEO_URL ? (
            <div className="relative aspect-video w-full bg-zinc-950 border border-red-600/20">
              <iframe
                src={toEmbedUrl(VIDEO_URL)}
                title={`Intensivão ${INTENSIVAO.titulo} — vídeo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-zinc-950 border border-red-600/20 flex flex-col items-center justify-center gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-red-600/5 blur-2xl" />
              <span className={`${anton.className} relative text-red-600 text-4xl md:text-6xl uppercase blur-[2px]`}>
                Em breve
              </span>
              <p className="relative text-white/40 text-sm uppercase tracking-widest">
                O vídeo do Intensivão sai aqui
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============ IMPRENSA ============ */}
      <section className="relative py-24 md:py-32 overflow-hidden border-t border-red-600/15">
        <Grain />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-red-600" />
            <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
              Saiu na imprensa
            </span>
          </div>
          <h2 className={`${anton.className} text-5xl md:text-7xl uppercase text-red-600 blur-[1px] mb-14`}>
            Na mídia da cidade
          </h2>

          {IMPRENSA.length > 0 ? (
            <div
              className={`grid gap-px bg-red-600/15 ${
                IMPRENSA.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {IMPRENSA.map((materia) => (
                <a
                  key={materia.url}
                  href={materia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-black hover:bg-red-950/30 p-8 transition-colors border border-red-600/15"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper size={16} className="text-red-600" />
                    <span className={`${anton.className} text-red-500 text-sm uppercase tracking-widest`}>
                      {materia.veiculo}
                    </span>
                    <span className="text-white/30 text-xs ml-auto">{materia.data}</span>
                  </div>
                  <p className="text-white text-lg font-bold leading-snug group-hover:text-red-400 transition-colors">
                    {materia.titulo}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-wide mt-4">
                    Ler matéria <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-red-600/20 bg-zinc-950 p-10 text-center">
              <p className={`${anton.className} text-red-600 text-2xl md:text-3xl uppercase blur-[1px]`}>
                Em breve
              </p>
              <p className="text-white/40 text-sm mt-2">
                As matérias da imprensa sobre o Intensivão aparecem aqui.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative py-28 md:py-40 overflow-hidden border-t border-red-600/15 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl" />
        </div>
        <Grain />
        <div className="relative max-w-3xl mx-auto px-6">
          {/* Logomarca "Hope" (fonte Marola) escalonada, como na identidade.
              Ajuste fino por linha: marginLeft (desloca pra direita) e
              marginTop negativo (aproxima/sobrepõe verticalmente). */}
          {(() => {
            const hopeLines = [
              { ml: '0rem', mt: '0rem' },
              { ml: '1.4rem', mt: '-1.6rem' },
              { ml: '2.8rem', mt: '-1.6rem' },
            ];
            const lineCls = 'block text-7xl md:text-9xl leading-none w-max';
            return (
              <div className="relative inline-block mb-12 -rotate-3">
                {/* Glow atrás */}
                <div
                  aria-hidden
                  className={`${marola.className} absolute inset-0 text-[#EDE6CE] blur-[14px] opacity-40 scale-[1.04]`}
                >
                  {hopeLines.map((o, i) => (
                    <span key={i} className={lineCls} style={{ marginLeft: o.ml, marginTop: o.mt }}>
                      Hope
                    </span>
                  ))}
                </div>
                {/* Texto na frente */}
                <div className={`${marola.className} relative text-[#EDE6CE]`}>
                  {hopeLines.map((o, i) => (
                    <span key={i} className={lineCls} style={{ marginLeft: o.ml, marginTop: o.mt }}>
                      Hope
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
          <p className="text-white/50 text-lg mb-10">
            Chama os amigos e vem viver essa semana com a gente.
          </p>
          <a
            href="https://instagram.com/hopecarmo"
            target="_blank"
            rel="noopener noreferrer"
            className={`${anton.className} inline-flex items-center gap-3 px-10 py-5 bg-red-600 text-black text-xl uppercase tracking-wide hover:bg-red-500 transition-colors duration-300`}
          >
            <Instagram size={22} />
            @hopecarmo
          </a>
        </div>
      </section>
    </main>
  );
};

export default IntensivaoPage;
