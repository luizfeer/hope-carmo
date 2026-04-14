'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Download, Minus, Plus, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  composeWatermarkedImage,
  downloadImageWithHopeWatermark,
} from '@/lib/news-image-watermark';
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

  const baseName = downloadBase ?? 'hope-foto';

  async function handleDownload() {
    const r = await downloadImageWithHopeWatermark(src, baseName);
    if (r.ok) {
      toast.success('Download concluído.');
    } else {
      toast.error(r.error);
    }
  }

  async function handleShare() {
    const r = await composeWatermarkedImage(src, baseName);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }

    const file = new File([r.blob], r.filename, { type: 'image/png' });

    try {
      if (typeof navigator.share === 'function') {
        const withFiles =
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] });
        if (withFiles) {
          await navigator.share({
            files: [file],
            title: alt || 'Foto',
            text: alt || undefined,
          });
          return;
        }
        await navigator.share({
          title: alt || 'Foto',
          url: src,
        });
        return;
      }
      toast.message('Compartilhar não está disponível aqui. Use Baixar.');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      toast.error('Não foi possível compartilhar.');
    }
  }

  const zoomBar = (
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
  );

  const desktopActions = (
    <div className="hidden flex-wrap items-center gap-2 md:flex">
      <Button
        type="button"
        size="sm"
        className="gap-2 bg-pink-600 text-white hover:bg-pink-500"
        onClick={() => void handleDownload()}
      >
        <Download className="h-4 w-4 shrink-0" />
        Baixar
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
        onClick={() => void handleShare()}
      >
        <Share2 className="h-4 w-4 shrink-0" />
        Compartilhar
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
  );

  const mobileCloseOnly = (
    <div className="flex md:hidden">
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
  );

  const mobileBottomActions = (
    <div
      className="md:hidden shrink-0 border-t border-white/10 bg-black/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-lg gap-3">
        <Button
          type="button"
          className="h-12 min-h-12 flex-1 gap-2 rounded-xl bg-pink-600 text-base font-semibold text-white hover:bg-pink-500"
          onClick={() => void handleDownload()}
        >
          <Download className="h-5 w-5 shrink-0" />
          Baixar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 min-h-12 flex-1 gap-2 rounded-xl border-white/20 bg-white/15 text-base font-semibold text-white hover:bg-white/25"
          onClick={() => void handleShare()}
        >
          <Share2 className="h-5 w-5 shrink-0" />
          Compartilhar
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal
      aria-label="Galeria de imagem"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        {zoomBar}
        {desktopActions}
        {mobileCloseOnly}
      </div>

      <div
        className="min-h-0 flex-1 cursor-zoom-out overflow-auto p-4 pb-2 md:pb-4"
        onClick={onClose}
        role="presentation"
      >
        <div className="flex min-h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[min(70vh,85vh)] max-w-full object-contain shadow-2xl md:max-h-[85vh]"
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {mobileBottomActions}
    </div>
  );
}
