'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  Monitor,
  Smartphone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export interface Slide {
  id: string;
  question: string;
  answer: string;
  series: string;
}

type ViewMode = 'slide' | 'stories';

// ─── helpers ─────────────────────────────────────────────────────────────────

function slideFontClass(text: string) {
  const n = text.length;
  if (n < 80)  return 'text-6xl leading-tight';
  if (n < 160) return 'text-5xl leading-snug';
  if (n < 280) return 'text-4xl leading-snug';
  if (n < 420) return 'text-3xl leading-relaxed';
  return 'text-2xl leading-relaxed';
}

function storiesFontSize(text: string) {
  const n = text.length;
  if (n < 120) return 20;
  if (n < 220) return 17;
  return 14;
}

// ─── StoriesCard (360×640, capturado com pixelRatio 3 → 1080×1920) ───────────

function StoriesCard({
  slide,
  cardRef,
}: {
  slide: Slide;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={cardRef}
      style={{
        width: 360,
        height: 640,
        flexShrink: 0,
        background: 'linear-gradient(160deg, #0c0c0c 0%, #1a0f00 60%, #0c0c0c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 32px 36px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'system-ui', '-apple-system', 'sans-serif'",
      }}
    >
      {/* glow top-right */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 200, height: 200, background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* glow bottom-left */}
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 180, height: 180, background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* top: logo + série */}
      <div style={{ width: '100%', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 4, height: 20, background: 'linear-gradient(180deg, #f97316, #facc15)', borderRadius: 2 }} />
          <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
            Hope Carmo
          </span>
        </div>
        {slide.series && (
          <span style={{ color: '#f97316', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
            {slide.series}
          </span>
        )}
      </div>

      {/* centro: aspas + resposta */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', padding: '24px 0' }}>
        <div style={{ fontSize: 72, lineHeight: 1, color: 'rgba(249,115,22,0.35)', fontFamily: 'Georgia, serif', marginBottom: 8, marginLeft: -4 }}>
          &ldquo;
        </div>
        <p style={{ color: '#ffffff', fontSize: storiesFontSize(slide.answer), fontWeight: 600, lineHeight: 1.55, margin: 0, wordBreak: 'break-word' as const }}>
          {slide.answer}
        </p>
        <div style={{ fontSize: 72, lineHeight: 1, color: 'rgba(249,115,22,0.35)', fontFamily: 'Georgia, serif', textAlign: 'right' as const, marginTop: 4, marginRight: -4 }}>
          &rdquo;
        </div>
      </div>

      {/* rodapé: pergunta + handle */}
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)', marginBottom: 16 }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.5, margin: '0 0 14px', fontStyle: 'italic' }}>
          {slide.question}
        </p>
        <span style={{ color: 'rgba(249,115,22,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
          @hopecarmo
        </span>
      </div>
    </div>
  );
}

// ─── SlideView (fullscreen projection) ───────────────────────────────────────

function SlideView({ slide, prev, next }: { slide: Slide; prev: () => void; next: () => void }) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black px-20 py-10">
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/25 transition-all hover:bg-white/10 hover:text-white"
        aria-label="Anterior"
      >
        <ChevronLeft size={44} strokeWidth={1.5} />
      </button>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="select-none font-serif text-[7rem] leading-none text-orange-500/15" aria-hidden>
          &ldquo;
        </div>

        <p className={`max-w-4xl break-words font-semibold text-white ${slideFontClass(slide.answer)}`}>
          {slide.answer}
        </p>

        <div className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

        <p className="mt-5 max-w-2xl text-sm font-medium uppercase tracking-widest text-orange-400/60">
          {slide.question}
        </p>

        {slide.series && (
          <p className="mt-3 text-xs uppercase tracking-widest text-zinc-700">
            {slide.series}
          </p>
        )}
      </div>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white/25 transition-all hover:bg-white/10 hover:text-white"
        aria-label="Próxima"
      >
        <ChevronRight size={44} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ─── StoriesView ──────────────────────────────────────────────────────────────

function StoriesView({
  slide,
  cardRef,
  prev,
  next,
  current,
  total,
  onDownload,
  downloading,
}: {
  slide: Slide;
  cardRef: React.RefObject<HTMLDivElement>;
  prev: () => void;
  next: () => void;
  current: number;
  total: number;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-950 px-4 py-8">
      <div className="overflow-hidden rounded-2xl shadow-2xl shadow-orange-500/10 ring-1 ring-white/10">
        <StoriesCard slide={slide} cardRef={cardRef} />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="min-w-[5rem] text-center text-sm tabular-nums text-zinc-400">
          {current + 1} / {total}
        </span>

        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          aria-label="Próxima"
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={onDownload}
          disabled={downloading}
          className="ml-2 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-orange-400 disabled:opacity-60"
        >
          {downloading ? (
            <><Loader2 size={16} className="animate-spin" /> Gerando…</>
          ) : (
            <><Download size={16} /> Baixar PNG (1080×1920)</>
          )}
        </button>
      </div>

      <p className="text-xs text-zinc-600">
        Preview em 360×640 · Exporta em 1080×1920 pronto para Stories
      </p>
    </div>
  );
}

// ─── ApresentarClient (root) ──────────────────────────────────────────────────

export function ApresentarClient({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState<ViewMode>('slide');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const storiesCardRef = useRef<HTMLDivElement>(null);

  const total = slides.length;
  const slide = slides[current];

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')           prev();
      else if (e.key === 'ArrowRight')     next();
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  }

  const downloadPng = async () => {
    const node = storiesCardRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement('a');
      a.download = `stories-resposta-${current + 1}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  if (total === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-zinc-400">
        <p>Nenhuma resposta encontrada.</p>
        <a href="/admin/responses" className="text-sm text-orange-400 underline">
          Voltar
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col bg-black text-white">
      {/* ── header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/90 px-5 py-3">
        <a
          href="/admin/responses"
          className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={15} /> Respostas
        </a>

        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 p-1">
          <button
            onClick={() => setMode('slide')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'slide' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor size={14} /> Slide
          </button>
          <button
            onClick={() => setMode('stories')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'stories' ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} /> Stories
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums text-zinc-500">
            {current + 1} / {total}
          </span>
          {mode === 'slide' && (
            <button
              onClick={toggleFullscreen}
              title="Tela cheia (F)"
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* ── content ── */}
      {mode === 'slide' ? (
        <SlideView slide={slide} prev={prev} next={next} />
      ) : (
        <StoriesView
          slide={slide}
          cardRef={storiesCardRef}
          prev={prev}
          next={next}
          current={current}
          total={total}
          onDownload={downloadPng}
          downloading={downloading}
        />
      )}
    </div>
  );
}
