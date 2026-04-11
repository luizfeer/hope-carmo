'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, Instagram, Calendar } from 'lucide-react';

const VIDEO_URL =
  'https://res.cloudinary.com/dwsqvtil1/video/upload/v1755725442/bg-n-hd_t17qjg.mp4';

const Hero: React.FC = () => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const blobUrlRef  = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    // Baixa o vídeo uma única vez como blob → nenhum range-request depois disso
    fetch(VIDEO_URL)
      .then(r => r.blob())
      .then(blob => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        video.src  = url;
        video.load();
        video.play().catch(() => {/* autoplay bloqueado — poster já cobre */});
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback: usa URL original se fetch falhar (ex: offline/CORS)
        video.src = VIDEO_URL;
        video.load();
        video.play().catch(() => {});
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster="/img/bg.webp"
          className="w-full h-full object-cover opacity-40"
          onError={(e) => {
            const v = e.currentTarget;
            v.style.display = 'none';
            const wrap = v.parentElement;
            if (wrap) {
              wrap.style.backgroundImage    = 'url(/img/bg.webp)';
              wrap.style.backgroundSize     = 'cover';
              wrap.style.backgroundPosition = 'center';
            }
          }}
        />
        {/* Poster estático enquanto o vídeo carrega */}
        <Image
          src="/img/bg.webp"
          alt=""
          fill
          aria-hidden
          className="object-cover opacity-40 -z-10"
          sizes="100vw"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mt-8">
            Sextas-feiras às 20h
          </div>
        </div>

        <div className="relative w-full max-w-lg md:max-w-md px-14 md:w-1/2 mb-3 mx-auto aspect-[2/1] md:aspect-[2.2/1]">
          <Image
            src="/img/logo-amarelo.webp"
            alt="Hope Carmo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-light">
          Um farol de esperança para a juventude em Carmo do Rio Claro
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link
            href="/schedule"
            className="group bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-all duration-300 flex items-center"
          >
            Próximo Encontro
            <Calendar className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="https://instagram.com/hopecarmo"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center text-white/80 hover:text-white transition-colors"
          >
            <Instagram className="h-5 w-5 mr-2" />
            @hopecarmo
            <ArrowDown className="ml-2 h-4 w-4 rotate-[-45deg] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
