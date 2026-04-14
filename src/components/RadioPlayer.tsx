'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  X,
  ChevronDown,
  Music,
  ExternalLink,
} from 'lucide-react';

const RADIO_SITE = 'https://tenradioten.com/';

const STREAM_URL   = process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? '';
const STATION_NAME = 'Rádio Ten';
const POLL_MS      = 15_000;

function parseArtistTitle(title: string | null): { artist: string | null; track: string | null } {
  if (!title) return { artist: null, track: null };
  const sep = title.indexOf(' - ');
  if (sep > 0) return { artist: title.substring(0, sep), track: title.substring(sep + 3) };
  return { artist: null, track: title };
}

export default function RadioPlayer() {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const artAbort  = useRef<AbortController | null>(null);

  const [playing,     setPlaying]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [volume,      setVolume]      = useState(0.8);
  const [muted,       setMuted]       = useState(true);
  const [mutedByAuto, setMutedByAuto] = useState(false);
  const [minimized,   setMinimized]   = useState(false);
  const [expanded,    setExpanded]    = useState(false);
  const [dismissed,   setDismissed]   = useState(false);
  const [error,       setError]       = useState(false);
  const [songTitle,   setSongTitle]   = useState<string | null>(null);
  const [artwork,     setArtwork]     = useState<string | null>(null);

  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef      = useRef<HTMLSpanElement | null>(null);
  const [titleScrollPx,   setTitleScrollPx] = useState(0);
  const ignoreNextAudioErrorRef = useRef(false);

  // ── Ticker: alterna título e "Ao vivo na Rádio Ten" na mini bar ──────────
  const [tickerAlt,  setTickerAlt]  = useState(false);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const active = playing && !muted && !!songTitle;
    if (active) {
      tickerRef.current = setInterval(() => setTickerAlt(v => !v), 3500);
    } else {
      if (tickerRef.current) clearInterval(tickerRef.current);
      setTickerAlt(false);
    }
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [playing, muted, songTitle]);

  // ── Persiste última artwork para exibir imediatamente ao dar play ─────────
  const lastArtworkRef = useRef<string | null>(null);
  useEffect(() => { if (artwork) lastArtworkRef.current = artwork; }, [artwork]);
  useEffect(() => {
    if (playing && !artwork && lastArtworkRef.current) {
      setArtwork(lastArtworkRef.current);
    }
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag-to-close do painel expandido ────────────────────────────────────
  const dragStartY  = useRef<number>(0);
  const isDragging  = useRef(false);
  const [dragY,     setDragY]     = useState(0);
  const DRAG_CLOSE  = 60; // px necessários para fechar

  const onDragStart = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = Math.max(0, e.clientY - dragStartY.current);
    setDragY(dy);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragY >= DRAG_CLOSE) setExpanded(false);
    setDragY(0);
  }, [dragY]);

  // ── Áudio: cria + autoplay mutado ────────────────────────────────────────
  useEffect(() => {
    const audio   = new Audio();
    audio.preload = 'none';
    audio.volume  = volume;
    audio.muted   = true;

    audio.addEventListener('playing', () => { setPlaying(true);  setLoading(false); setError(false); });
    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('pause',   () => { setPlaying(false); setLoading(false); });
    audio.addEventListener('stalled', () => setLoading(false));
    audio.addEventListener('error',   () => {
      if (ignoreNextAudioErrorRef.current) { ignoreNextAudioErrorRef.current = false; setLoading(false); return; }
      setError(true); setLoading(false); setPlaying(false);
    });

    audioRef.current = audio;

    if (STREAM_URL) {
      setLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      audio.play()
        .then(() => setMutedByAuto(true))
        .catch(() => {
          setLoading(false); setMuted(false); setMutedByAuto(false);
          ignoreNextAudioErrorRef.current = true;
          audio.removeAttribute('src');
        });
    }

    return () => {
      ignoreNextAudioErrorRef.current = true;
      audio.pause();
      audio.removeAttribute('src');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Desmuta ───────────────────────────────────────────────────────────────
  const unmute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    setMuted(false);
    setMutedByAuto(false);
  }, []);

  // ── Artwork via iTunes ────────────────────────────────────────────────────
  const fetchArtwork = useCallback(async (title: string) => {
    artAbort.current?.abort();
    const ctrl = new AbortController();
    artAbort.current = ctrl;
    try {
      const res = await fetch(`/api/itunes-artwork?term=${encodeURIComponent(title)}`, {
        signal: ctrl.signal,
      });
      if (!res.ok || ctrl.signal.aborted) return;
      const data = (await res.json()) as { artworkUrl?: string | null };
      if (!ctrl.signal.aborted) setArtwork(data.artworkUrl ?? null);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setArtwork(null);
    }
  }, []);

  // ── Polling de metadados ──────────────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch('/api/radio-meta', { cache: 'no-store' });
      if (!res.ok) return;
      const { title } = await res.json() as { title?: string };
      setSongTitle(title ?? null);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    if (playing) {
      fetchMeta();
      pollRef.current = setInterval(fetchMeta, POLL_MS);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      setSongTitle(null);
      setArtwork(null);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [playing, fetchMeta]);

  useEffect(() => {
    if (songTitle) fetchArtwork(songTitle);
    else { artAbort.current?.abort(); setArtwork(null); }
  }, [songTitle, fetchArtwork]);

  // ── Marquee do título (mini bar) ──────────────────────────────────────────
  const measureTitleScroll = useCallback(() => {
    const c = titleContainerRef.current;
    const t = titleTextRef.current;
    if (!c || !t || !songTitle) { setTitleScrollPx(0); return; }
    const d = t.scrollWidth - c.clientWidth;
    setTitleScrollPx(d > 1 ? d : 0);
  }, [songTitle]);

  useLayoutEffect(() => { measureTitleScroll(); }, [measureTitleScroll, songTitle, expanded]);
  useEffect(() => {
    const c = titleContainerRef.current;
    if (!c || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measureTitleScroll());
    ro.observe(c);
    return () => ro.disconnect();
  }, [measureTitleScroll, songTitle]);
  useEffect(() => {
    const fn = () => measureTitleScroll();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [measureTitleScroll]);

  const marqueeDurationSec = titleScrollPx > 0
    ? Math.min(22, Math.max(9, 8 + titleScrollPx / 28)) : 12;

  // ── Controles ─────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      setError(false);
      ignoreNextAudioErrorRef.current = true;
      audio.pause();
      audio.removeAttribute('src');
    } else {
      setError(false);
      setLoading(true);
      audio.muted = muted;
      audio.src   = STREAM_URL;
      audio.load();
      audio.play().catch(() => { setLoading(false); setError(true); });
    }
  }, [playing, muted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
    if (!next) setMutedByAuto(false);
  }, [muted]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0 && muted) { audioRef.current!.muted = false; setMuted(false); setMutedByAuto(false); }
  }, [muted]);

  if (dismissed) return null;

  const { artist, track } = parseArtistTitle(muted ? null : songTitle);
  const showTitle = !muted && !!songTitle;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`
      fixed bottom-4 left-1/2 -translate-x-1/2 z-50
      transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)]
      ${minimized ? 'w-14' : 'w-[340px] sm:w-[400px]'}
    `}>
      <div className={`
        relative overflow-hidden
        ${expanded ? 'rounded-3xl' : 'rounded-2xl'}
        bg-black/60 backdrop-blur-3xl
        border border-white/[0.12]
        shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]
        transition-all duration-500 ease-[cubic-bezier(.32,.72,0,1)]
      `}>

        {/* ── MINIMIZED ─────────────────────────────────────────────────── */}
        {minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="w-14 h-14 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Expandir player"
          >
            <Radio size={22} className={playing ? 'text-orange-400' : ''} />
          </button>

        ) : (
          <>
            {/* ── EXPANDED (Apple Music style) ──────────────────────────── */}
            {expanded && (
              <div
                className="relative"
                style={{
                  transform: dragY > 0 ? `translateY(${dragY * 0.4}px)` : undefined,
                  opacity:   dragY > 0 ? Math.max(0.4, 1 - dragY / 180) : undefined,
                  transition: isDragging.current ? 'none' : 'transform 0.4s ease, opacity 0.4s ease',
                }}
              >
                {/* Backdrop desfocado com a cor da capa */}
                <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
                  {artwork ? (
                    <img
                      src={artwork}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl brightness-[0.3] saturate-150"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-950/60 to-black/80" />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 flex flex-col items-center px-6 pt-5 pb-6 gap-5">

                  {/* Handle — drag para fechar */}
                  <div
                    className="w-full flex justify-center py-1 cursor-grab active:cursor-grabbing touch-none"
                    onPointerDown={onDragStart}
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                    onPointerCancel={onDragEnd}
                  >
                    <div className={`
                      w-9 h-1 rounded-full transition-colors
                      ${dragY > DRAG_CLOSE ? 'bg-white/60' : 'bg-white/20'}
                    `} />
                  </div>

                  {/* Artwork */}
                  <div className={`
                    w-[200px] h-[200px] sm:w-[220px] sm:h-[220px]
                    rounded-2xl overflow-hidden shrink-0
                    shadow-[0_16px_48px_rgba(0,0,0,0.8)]
                    transition-transform duration-300
                    ${playing && !muted ? 'scale-100' : 'scale-95 opacity-80'}
                  `}>
                    {artwork ? (
                      <img src={artwork} alt={songTitle ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400/20 to-yellow-400/10 border border-white/10">
                        <Music size={48} className="text-orange-400/40" />
                      </div>
                    )}
                  </div>

                  {/* Título + artista */}
                  <div className="w-full text-center">
                    {showTitle && track ? (
                      <>
                        <p className="text-white text-[17px] font-bold leading-tight">{track}</p>
                        {artist
                          ? <p className="text-white/50 text-[14px] mt-1">{artist}</p>
                          : <p className="text-white/30 text-[13px] mt-1">{STATION_NAME}</p>
                        }
                      </>
                    ) : (
                      <>
                        <p className="text-white text-[17px] font-bold">{STATION_NAME}</p>
                        <p className="text-white/40 text-[13px] mt-1">
                          {playing ? 'Gospel · Ao vivo' : 'Carmo do Rio Claro'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Badge AO VIVO */}
                  {playing && !muted && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-400/15 border border-orange-400/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-orange-300 text-[11px] font-bold tracking-widest uppercase">Ao vivo</span>
                    </div>
                  )}

                  {/* Banner desmute */}
                  {mutedByAuto && playing && (
                    <button
                      onClick={unmute}
                      className="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-orange-400/15 hover:bg-orange-400/25 border border-orange-400/20 text-orange-300 text-[12px] font-bold tracking-wide transition-colors"
                    >
                      <Volume2 size={13} />
                      Toque para ativar o som
                    </button>
                  )}

                  {/* Botão play grande */}
                  <button
                    onClick={mutedByAuto ? unmute : togglePlay}
                    disabled={loading}
                    aria-label={playing ? 'Pausar' : 'Play'}
                    className="
                      w-16 h-16 rounded-full flex items-center justify-center
                      bg-white hover:bg-white/90 active:scale-95
                      shadow-[0_4px_24px_rgba(0,0,0,0.5)]
                      transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {loading
                      ? <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      : (playing && !mutedByAuto)
                        ? <Pause size={22} className="text-black" />
                        : <Play  size={22} className="text-black translate-x-0.5" />
                    }
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-3 w-full px-1">
                    <button onClick={toggleMute} className="text-white/30 hover:text-white/70 transition-colors shrink-0" aria-label={muted ? 'Ativar som' : 'Silenciar'}>
                      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range" min={0} max={1} step={0.02}
                      value={muted ? 0 : volume}
                      onChange={handleVolume}
                      className="flex-1 h-1 accent-white cursor-pointer opacity-50 hover:opacity-80 transition-opacity"
                      aria-label="Volume"
                    />
                    <Volume2 size={16} className="text-white/50 shrink-0" />
                  </div>

                  {/* Link site da rádio */}
                  <a
                    href={RADIO_SITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex items-center gap-1.5
                      text-white/30 hover:text-white/60
                      text-[11px] font-medium tracking-wide
                      transition-colors
                    "
                  >
                    <ExternalLink size={11} />
                    tenradioten.com
                  </a>

                  {/* Erro */}
                  {error && <p className="text-red-400 text-[11px]">Erro ao conectar. Tente novamente.</p>}
                </div>
              </div>
            )}

            {/* ── MINI BAR (sempre visível quando não minimizado) ────────── */}
            <div
              className={`flex items-center gap-3 px-3 py-2.5 ${expanded ? 'border-t border-white/10' : ''}`}
            >
              {/* Artwork thumb ou ícone de rádio */}
              <button
                onClick={() => setExpanded(e => !e)}
                aria-label={expanded ? 'Recolher player' : 'Expandir player'}
                className="relative shrink-0 active:scale-95 transition-transform"
              >
                <div className={`
                  w-11 h-11 rounded-xl overflow-hidden
                  bg-gradient-to-br from-orange-400/30 to-yellow-400/20
                  border border-orange-400/20
                  ${playing ? 'shadow-[0_0_12px_rgba(251,146,60,0.35)]' : ''}
                  transition-all duration-300
                `}>
                  {artwork ? (
                    <img src={artwork} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Radio size={18} className={playing ? 'text-orange-300' : 'text-white/40'} />
                    </div>
                  )}
                </div>
                {playing && !muted && (
                  <>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-black/60 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-black/60" />
                  </>
                )}
              </button>

              {/* info — clique também expande */}
              <button
                className="flex-1 min-w-0 text-left overflow-hidden"
                onClick={() => setExpanded(e => !e)}
                aria-label={expanded ? 'Recolher player' : 'Expandir player'}
              >
                {/* Linha principal: ticker quando tiver título */}
                <div className="relative h-5 overflow-hidden">
                  {/* Slot A: título da faixa (ou nome da estação) */}
                  <span className={`
                    absolute inset-x-0 text-white font-semibold text-[13px] leading-tight truncate
                    transition-all duration-500
                    ${tickerAlt ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}
                  `}>
                    {showTitle && track ? track : STATION_NAME}
                  </span>
                  {/* Slot B: "Ao vivo · Rádio Ten" */}
                  <span className={`
                    absolute inset-x-0 text-white font-semibold text-[13px] leading-tight truncate
                    transition-all duration-500
                    ${tickerAlt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                  `}>
                    Ao vivo · {STATION_NAME}
                  </span>
                </div>

                {/* Linha secundária — evitar h fixo demais + leading-none (cortava descendentes) */}
                <div className="relative mt-1 min-h-[18px] overflow-hidden">
                  {showTitle && artist ? (
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-white/40 text-[11px] leading-snug truncate">
                      {artist}
                    </span>
                  ) : showTitle && track ? (
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-white/40 text-[11px] leading-snug truncate">
                      {STATION_NAME}
                    </span>
                  ) : (
                    <div
                      ref={titleContainerRef}
                      className="absolute inset-x-0 top-0 bottom-0 flex min-w-0 items-center overflow-hidden"
                    >
                      {songTitle && !muted ? (
                        <span
                          ref={titleTextRef}
                          className={`inline-block text-white/35 text-[11px] leading-snug whitespace-nowrap ${titleScrollPx > 0 ? 'animate-radio-title-marquee' : ''}`}
                          style={{ '--marquee-distance': `${titleScrollPx}px`, '--marquee-duration': `${marqueeDurationSec}s` } as React.CSSProperties}
                        >
                          {songTitle}
                        </span>
                      ) : (
                        <span className="text-white/30 text-[11px] leading-snug">
                          {playing ? 'Ao vivo · Gospel' : 'Carmo do Rio Claro'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Volume (desktop, só na mini bar) */}
              {!expanded && (
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <button onClick={toggleMute} className="text-white/30 hover:text-white/70 transition-colors" aria-label={muted ? 'Ativar som' : 'Silenciar'}>
                    {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                  <input
                    type="range" min={0} max={1} step={0.02}
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    className="w-14 h-1 accent-orange-400 cursor-pointer opacity-50 hover:opacity-90 transition-opacity"
                    aria-label="Volume"
                  />
                </div>
              )}

              {/* Play/pause */}
              <button
                onClick={mutedByAuto ? unmute : togglePlay}
                disabled={loading}
                aria-label={playing ? 'Pausar' : 'Play'}
                className="
                  shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                  bg-white/15 hover:bg-white/25 active:scale-95 text-white
                  border border-white/10
                  transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  : (playing && !mutedByAuto)
                    ? <Pause size={14} />
                    : <Play  size={14} className="translate-x-px" />
                }
              </button>

              <button
                onClick={() => { setMinimized(true); setExpanded(false); }}
                className="text-white/20 hover:text-white/50 transition-colors"
                aria-label="Minimizar"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => { audioRef.current?.pause(); setDismissed(true); }}
                className="text-white/15 hover:text-white/40 transition-colors -mr-1"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>

            {/* Banner desmute na mini bar (quando não expandido) */}
            {mutedByAuto && playing && !expanded && (
              <button
                onClick={unmute}
                className="
                  w-full px-4 py-1.5 flex items-center justify-center gap-2
                  bg-orange-400/10 hover:bg-orange-400/20 border-t border-orange-400/15
                  text-orange-300 text-[11px] font-bold tracking-wide
                  transition-colors animate-fade-in
                "
              >
                <Volume2 size={11} />
                Toque para ativar o som
              </button>
            )}
          </>
        )}

        {/* Shimmer bar */}
        {playing && !muted && !minimized && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
            <div className="h-full bg-gradient-to-r from-transparent via-orange-400/60 to-transparent animate-shimmer" />
          </div>
        )}
      </div>
    </div>
  );
}
