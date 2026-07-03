import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConviteFlow from '@/components/convite/ConviteFlow';

/**
 * Página que o QR code dos cartazes de rua abre.
 * Fica fora do grupo (site) de propósito: sem header, footer ou rádio —
 * a pessoa cai numa conversa, não num site.
 */
export const metadata: Metadata = {
  title: 'você achou.',
  description: 'Uma conversa de 60 segundos.',
  // Fora dos buscadores: quem chega aqui, chega pelo cartaz.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-black" />}>
      <ConviteFlow />
    </Suspense>
  );
}
