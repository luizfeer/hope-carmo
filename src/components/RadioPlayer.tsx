'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, X, ChevronDown } from 'lucide-react';

// ─── Troque aqui pela URL real do stream da Rádio Ten ──────────────────────
const STREAM_URL = process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? '';
const STATION_NAME = 'Rádio Ten';
const STATION_TAGLINE = 'Carmo do Rio Claro · Gospel';
// ───────────────────────────────────────────────────────────────────────────

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  // Cria o elemento de áudio uma vez
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;

    audio.addEventListener('playing', () => { setPlaying(true); setLoading(false); setError(false); });
    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('pause',   () => { setPlaying(false); setLoading(false); });
    audio.addEventListener('error',   () => { setError(true); setLoading(false); setPlaying(false); });
    audio.addEventListener('stalled', () => setLoading(false));

    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      audio.src = '';
    } else {
      setError(false);
      setLoading(true);
      audio.src = STREAM_URL;
      audio.load();
      audio.play().catch(() => { setLoading(false); setError(true); });
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0 && muted) { audioRef.current!.muted = false; setMuted(false); }
  }, [muted]);

  if (dismissed) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${minimized ? 'w-14' : 'w-[340px] sm:w-[380px]'}
      `}
    >
      {/* ── Liquid Glass Card ── */}
      <div
        className="
          relative overflow-hidden rounded-2xl
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
        "
      >
        {/* Reflexo interno superior */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Brilho de fundo suave */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-orange-400/10 blur-2xl pointer-events-none" />

        {minimized ? (
          /* ─── Estado minimizado: apenas botão play ─── */
          <button
            onClick={() => setMinimized(false)}
            className="w-14 h-14 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Expandir player"
          >
            <Radio size={22} className={playing ? 'text-orange-400' : ''} />
          </button>
        ) : (
          /* ─── Estado expandido ─── */
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Ícone animado */}
            <div className="relative shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-orange-400/30 to-yellow-400/20
                  border border-orange-400/30
                  ${playing ? 'shadow-[0_0_12px_rgba(251,146,60,0.4)]' : ''}
                `}
              >
                <Radio
                  size={18}
                  className={playing ? 'text-orange-300 animate-pulse' : 'text-white/50'}
                />
              </div>
              {/* Indicador ao vivo */}
              {playing && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-black/40 animate-ping" />
              )}
              {playing && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 border border-black/40" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">{STATION_NAME}</p>
              <p className="text-white/40 text-[11px] truncate">{STATION_TAGLINE}</p>
              {error && (
                <p className="text-red-400 text-[10px] mt-0.5">Erro ao conectar. Tente novamente.</p>
              )}
            </div>

            {/* Volume (só desktop) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-white/40 hover:text-white/80 transition-colors"
                aria-label={muted ? 'Ativar som' : 'Silenciar'}
              >
                {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 h-1 accent-orange-400 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Volume"
              />
            </div>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={loading}
              className="
                shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                bg-orange-400/90 hover:bg-orange-400 active:scale-95
                text-black font-bold
                shadow-[0_2px_8px_rgba(251,146,60,0.5)]
                transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              aria-label={playing ? 'Pausar' : 'Play'}
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : playing ? (
                <Pause size={15} />
              ) : (
                <Play size={15} className="translate-x-px" />
              )}
            </button>

            {/* Minimizar */}
            <button
              onClick={() => setMinimized(true)}
              className="text-white/30 hover:text-white/60 transition-colors -mr-1"
              aria-label="Minimizar"
            >
              <ChevronDown size={16} />
            </button>

            {/* Fechar */}
            <button
              onClick={() => { audioRef.current?.pause(); setDismissed(true); }}
              className="text-white/20 hover:text-white/50 transition-colors"
              aria-label="Fechar player"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Barra de ondas (decorativa, quando tocando) */}
        {playing && !minimized && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-shimmer" />
          </div>
        )}
      </div>
    </div>
  );
}
