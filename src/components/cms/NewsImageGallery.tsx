'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Download, ExternalLink, Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { downloadImageWithHopeWatermark } from '@/lib/news-image-watermark';
import { Button } from '@/components/ui/button';

type GalleryCtx = {
  open: (src: string, alt?: string, downloadBase?: string) => void;
  close: () => void;
};

const NewsImageGalleryContext = createContext<GalleryCtx | null>(null);

export function useNewsImageGallery(): GalleryCtx | null {
  return useContext(NewsImageGalleryContext);
}

export function NewsImageGalleryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [downloadBase, setDownloadBase] = useState<string | undefined>();
  const [scale, setScale] = useState(1);

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
    setDownloadBase(undefined);
  }, []);

  const openGallery = useCallback(
    (url: string, altText = '', fileBase?: string) => {
      if (!url?.trim()) return;
      setSrc(url);
      setAlt(altText);
      setDownloadBase(fileBase);
      setScale(1);
      setOpen(true);
    },
    [],
  );

  const value = useMemo(
    () => ({ open: openGallery, close }),
    [openGallery, close],
  );

  return (
    <NewsImageGalleryContext.Provider value={value}>
      {children}
      {open && src ? (
        <NewsImageLightbox
          src={src}
          alt={alt}
          downloadBase={downloadBase}
          scale={scale}
          onScaleChange={setScale}
          onClose={close}
        />
      ) : null}
    </NewsImageGalleryContext.Provider>
  );
}

function NewsImageLightbox({
  src,
  alt,
  downloadBase,
  scale,
  onScaleChange,
  onClose,
}: {
  src: string;
  alt: string;
  downloadBase?: string;
  scale: number;
  onScaleChange: (n: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function handleDownload() {
    const r = await downloadImageWithHopeWatermark(
      src,
      downloadBase ?? 'hope-foto',
    );
    if (r.ok) {
      toast.success('Imagem com marca Hope Carmo descarregada.');
    } else {
      toast.error(r.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal
      aria-label="Galeria de imagem"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
            aria-label="Afastar"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
            aria-label="Aproximar"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => onScaleChange(1)}
          >
            100%
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-white/20 px-2.5 text-[0.8rem] text-white hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir original
          </a>
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-pink-600 text-white hover:bg-pink-500"
            onClick={() => void handleDownload()}
          >
            <Download className="h-4 w-4" />
            Baixar com marca Hope Carmo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 cursor-zoom-out overflow-auto p-4"
        onClick={onClose}
        role="presentation"
      >
        <div className="flex min-h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-full object-contain shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
