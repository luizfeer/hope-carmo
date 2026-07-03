'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Share2, X } from 'lucide-react';
import {
  GALERIA,
  galeriaAlt,
  galeriaDownloadUrl,
  galeriaUrl,
  type FotoGaleria,
} from '@/data/intensivao-galeria';
import { anton } from './fonts';

/**
 * Galeria estilo Pinterest (masonry por colunas CSS) com lightbox.
 * 2 colunas no celular, 3 no tablet e 4 no desktop.
 * Cada foto aparece com fade/slide conforme entra na tela.
 */
const GaleriaPinterest: React.FC<{ fotos?: FotoGaleria[] }> = ({ fotos = GALERIA }) => {
  const [aberta, setAberta] = useState<number | null>(null);
  const [visiveis, setVisiveis] = useState<boolean[]>(() => fotos.map(() => false));
  const [copiado, setCopiado] = useState(false);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const navegar = useCallback(
    (dir: 1 | -1) => {
      setAberta((a) => (a === null ? a : (a + dir + fotos.length) % fotos.length));
    },
    [fotos.length],
  );

  // Abre a foto certa se a página for carregada com ?foto=<id> (link compartilhado)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('foto');
    if (!id) return;
    const idx = fotos.findIndex((f) => String(f.id) === id);
    if (idx >= 0) setAberta(idx);
  }, [fotos]);

  // Mantém a URL sincronizada com a foto aberta, para o link poder ser compartilhado
  useEffect(() => {
    const url = new URL(window.location.href);
    if (aberta === null) {
      url.searchParams.delete('foto');
    } else {
      url.searchParams.set('foto', String(fotos[aberta].id));
    }
    window.history.replaceState(null, '', url);
  }, [aberta, fotos]);

  // Revela cada foto com fade/slide assim que ela entra na viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number((entry.target as HTMLElement).dataset.index);
          setVisiveis((prev) => {
            if (prev[idx]) return prev;
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [fotos]);

  // Teclado + trava o scroll do body enquanto o lightbox está aberto
  useEffect(() => {
    if (aberta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberta(null);
      if (e.key === 'ArrowRight') navegar(1);
      if (e.key === 'ArrowLeft') navegar(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [aberta, navegar]);

  useEffect(() => {
    setCopiado(false);
  }, [aberta]);

  const handleDownload = () => {
    if (aberta === null) return;
    const a = document.createElement('a');
    a.href = galeriaDownloadUrl(fotos[aberta]);
    a.download = `intensivao-hope-${fotos[aberta].id}.jpg`;
    a.click();
  };

  const handleShare = async () => {
    if (aberta === null) return;
    const foto = fotos[aberta];
    // Link do próprio site, que abre essa foto no lightbox (não a imagem crua do Cloudinary)
    const url = new URL(window.location.href);
    url.searchParams.set('foto', String(foto.id));
    const shareUrl = url.toString();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Intensivão Hope Carmo', url: shareUrl });
      } catch {
        /* usuário cancelou o compartilhamento */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3 [column-fill:balance]">
        {fotos.map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            data-index={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => setAberta(i)}
            className={`group relative block w-full mb-2 md:mb-3 break-inside-avoid overflow-hidden rounded-sm bg-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-all duration-700 ease-out ${
              visiveis[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <img
              src={galeriaUrl(foto, 600)}
              alt={galeriaAlt(foto, i)}
              width={foto.o === 'p' ? 1600 : 2400}
              height={foto.o === 'p' ? 2400 : 1600}
              loading={i < 8 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-auto transition-all duration-500 group-hover:scale-105"
            />
            {/* Tinta vermelha que sai no hover */}
            <div className="absolute inset-0 bg-red-900/35 mix-blend-multiply opacity-100 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
            <span
              className={`${anton.className} absolute bottom-2 left-3 text-red-500 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {aberta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={galeriaAlt(fotos[aberta], aberta)}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setAberta(null)}
        >
          <img
            src={galeriaUrl(fotos[aberta], 1600)}
            alt={galeriaAlt(fotos[aberta], aberta)}
            className="max-h-[88vh] max-w-[94vw] md:max-w-[86vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {copiado && (
              <span className={`${anton.className} text-red-500 text-xs tracking-widest bg-black/60 px-3 py-1`}>
                Link copiado
              </span>
            )}
            <button
              type="button"
              aria-label="Baixar foto"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="w-11 h-11 flex items-center justify-center border border-red-600/40 text-red-500 bg-black/60 hover:bg-red-600 hover:text-black transition-colors"
            >
              <Download size={20} />
            </button>
            <button
              type="button"
              aria-label="Compartilhar foto"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="w-11 h-11 flex items-center justify-center border border-red-600/40 text-red-500 bg-black/60 hover:bg-red-600 hover:text-black transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setAberta(null)}
              className="w-11 h-11 flex items-center justify-center border border-red-600/40 text-red-500 bg-black/60 hover:bg-red-600 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.stopPropagation();
              navegar(-1);
            }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-red-600/40 text-red-500 bg-black/60 hover:bg-red-600 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={(e) => {
              e.stopPropagation();
              navegar(1);
            }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-red-600/40 text-red-500 bg-black/60 hover:bg-red-600 hover:text-black transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <span
            className={`${anton.className} absolute bottom-5 left-1/2 -translate-x-1/2 text-red-500 text-sm tracking-widest`}
          >
            {String(aberta + 1).padStart(2, '0')} / {String(fotos.length).padStart(2, '0')}
          </span>
        </div>
      )}
    </>
  );
};

export default GaleriaPinterest;
