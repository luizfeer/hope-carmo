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
} from 'lucide-react';

const STREAM_URL   = process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? '';
const STATION_NAME = 'Rádio Ten';
const POLL_MS      = 15_000;

export default function RadioPlayer() {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing,      setPlaying]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [volume,       setVolume]       = useState(0.8);
  // Começa mutado para autoplay funcionar — usuário desmuta com 1 clique
  const [muted,        setMuted]        = useState(true);
  const [mutedByAuto,  setMutedByAuto]  = useState(false); // true = foi o autoplay que mutou
  const [minimized,    setMinimized]    = useState(false);
  const [dismissed,    setDismissed]    = useState(false);
  const [error,        setError]        = useState(false);
  const [songTitle,    setSongTitle]    = useState<string | null>(null);

  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef      = useRef<HTMLSpanElement | null>(null);
  const [titleScrollPx,   setTitleScrollPx] = useState(0);
  const ignoreNextAudioErrorRef = useRef(false);

  // ── Áudio: cria + autoplay mutado ─────────────────────────────────────────
  useEffect(() => {
    const audio    = new Audio();
    audio.preload  = 'none';
    audio.volume   = volume;
    audio.muted    = true; // muted → browsers permitem autoplay

    audio.addEventListener('playing', () => { setPlaying(true);  setLoading(false); setError(false); });
    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('pause',   () => { setPlaying(false); setLoading(false); });
    audio.addEventListener('stalled', () => setLoading(false));
    audio.addEventListener('error', () => {
      if (ignoreNextAudioErrorRef.current) {
        ignoreNextAudioErrorRef.current = false;
        setLoading(false);
        return;
      }
      setError(true);
      setLoading(false);
      setPlaying(false);
    });

    audioRef.current = audio;

    if (STREAM_URL) {
      setLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      audio.play()
        .then(() => {
          // Autoplay mutado OK → avisa o usuário que precisa ativar o som
          setMutedByAuto(true);
        })
        .catch(() => {
          // Autoplay bloqueado mesmo mutado → aguarda clique manual
          setLoading(false);
          setMuted(false); // reset: o usuário vai clicar play normalmente
          setMutedByAuto(false);
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

  // ── Desmuta com 1 clique (após autoplay mutado) ───────────────────────────
  const unmute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    setMuted(false);
    setMutedByAuto(false);
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
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [playing, fetchMeta]);

  // ── Marquee do título ─────────────────────────────────────────────────────
  const measureTitleScroll = useCallback(() => {
    const c = titleContainerRef.current;
    const t = titleTextRef.current;
    if (!c || !t || !songTitle) { setTitleScrollPx(0); return; }
    const d = t.scrollWidth - c.clientWidth;
    setTitleScrollPx(d > 1 ? d : 0);
  }, [songTitle]);

  useLayoutEffect(() => { measureTitleScroll(); }, [measureTitleScroll, songTitle, minimized]);
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

  // ── Controles ──────────────────────────────────────────────────────────────
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

  return (
    <div className={`
      fixed bottom-4 left-1/2 -translate-x-1/2 z-50
      transition-all duration-500 ease-out
      ${minimized ? 'w-14' : 'w-[340px] sm:w-[400px]'}
    `}>
      <div className="
        relative overflow-hidden rounded-2xl
        bg-white/10 backdrop-blur-2xl
        border border-white/20
        shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
      ">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-orange-400/10 blur-2xl pointer-events-none" />

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
            {/* Banner "ativar som" quando autoplay mutou */}
            {mutedByAuto && playing && (
              <button
                onClick={unmute}
                className="
                  w-full px-4 py-1.5 flex items-center justify-center gap-2
                  bg-orange-400/15 hover:bg-orange-400/25 border-b border-orange-400/20
                  text-orange-300 text-[11px] font-bold tracking-wide
                  transition-colors animate-fade-in
                "
              >
                <Volume2 size={12} />
                Toque para ativar o som
              </button>
            )}

            <div className="flex items-center gap-3 px-4 py-3">
              {/* ícone + dot ao vivo */}
              <div className="relative shrink-0">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-orange-400/30 to-yellow-400/20
                  border border-orange-400/30
                  ${playing ? 'shadow-[0_0_12px_rgba(251,146,60,0.4)]' : ''}
                `}>
                  <Radio size={18} className={playing ? 'text-orange-300 animate-pulse' : 'text-white/50'} />
                </div>
                {playing && !muted && <>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-black/40 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-black/40" />
                </>}
              </div>

              {/* info + título */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">{STATION_NAME}</p>
                {songTitle && !muted ? (
                  <div className="flex items-center gap-1 mt-0.5 min-w-0">
                    <Music size={10} className="text-orange-400 shrink-0" />
                    <div ref={titleContainerRef} className="min-w-0 flex-1 overflow-hidden" title={songTitle}>
                      <span
                        ref={titleTextRef}
                        className={`inline-block text-orange-300/80 text-[11px] leading-snug whitespace-nowrap animate-fade-in ${titleScrollPx > 0 ? 'animate-radio-title-marquee' : ''}`}
                        style={{ '--marquee-distance': `${titleScrollPx}px`, '--marquee-duration': `${marqueeDurationSec}s` } as React.CSSProperties}
                      >
                        {songTitle}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/30 text-[11px]">
                    {playing ? 'Ao vivo · Gospel' : 'Carmo do Rio Claro · Gospel'}
                  </p>
                )}
                {error && <p className="text-red-400 text-[10px] mt-0.5">Erro ao conectar. Tente novamente.</p>}
              </div>

              {/* volume (desktop) */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button onClick={toggleMute} className="text-white/40 hover:text-white/80 transition-colors" aria-label={muted ? 'Ativar som' : 'Silenciar'}>
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.02}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-16 h-1 accent-orange-400 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Volume"
                />
              </div>

              {/* play/pause */}
              <button
                onClick={mutedByAuto ? unmute : togglePlay}
                disabled={loading}
                aria-label={playing ? 'Pausar' : 'Play'}
                className="
                  shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                  bg-orange-400/90 hover:bg-orange-400 active:scale-95 text-black
                  shadow-[0_2px_8px_rgba(251,146,60,0.5)]
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : (playing && !mutedByAuto)
                    ? <Pause size={15} />
                    : <Play size={15} className="translate-x-px" />
                }
              </button>

              <button onClick={() => setMinimized(true)} className="text-white/30 hover:text-white/60 transition-colors -mr-1" aria-label="Minimizar">
                <ChevronDown size={16} />
              </button>
              <button onClick={() => { audioRef.current?.pause(); setDismissed(true); }} className="text-white/20 hover:text-white/50 transition-colors" aria-label="Fechar">
                <X size={14} />
              </button>
            </div>
          </>
        )}

        {playing && !muted && !minimized && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-shimmer" />
          </div>
        )}
      </div>
    </div>
  );
}
