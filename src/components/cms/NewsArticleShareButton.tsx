'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Props = {
  /** Título exibido na notícia (ou meta, se preferires passar já resolvido). */
  title: string;
  /** URL absoluta HTTPS da página da notícia. */
  url: string;
};

/**
 * Partilha a notícia com título e mensagem amigáveis (Web Share ou área de transferência).
 */
export function NewsArticleShareButton({ title, url }: Props) {
  const shareTitle = `${title} | Hope Carmo`;
  const shareText = `Confira esta notícia no Hope Carmo:\n\n«${title}»`;

  async function handleShare() {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }

    try {
      const forClipboard = `${shareText}\n\n${url}`;
      await navigator.clipboard.writeText(forClipboard);
      toast.success('Texto e link copiados! É só colar no WhatsApp ou noutro app.');
    } catch {
      toast.error('Não foi possível partilhar. Copia o endereço da barra do navegador.');
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-11 w-full shrink-0 gap-2 border-pink-500/40 bg-pink-500/10 text-pink-100 hover:bg-pink-500/20 hover:text-white sm:h-9 sm:w-auto"
      onClick={() => void handleShare()}
    >
      <Share2 className="h-4 w-4" aria-hidden />
      Compartilhar
    </Button>
  );
}
