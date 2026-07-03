import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import { SupabaseImplicitHashHandler } from '@/components/auth/SupabaseImplicitHashHandler';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SITE_OG_IMAGE_URL, SITE_URL } from '@/lib/site-url';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Hope Carmo - Farol de Esperança para a Juventude',
  description:
    'Hope Carmo é um ministério dedicado a levar esperança e transformação para a juventude através do amor de Cristo. Descubra nossa missão, eventos e como fazer parte desta comunidade.',
  keywords: [
    'Hope Carmo',
    'juventude',
    'igreja',
    'esperança',
    'ministério',
    'eventos',
    'comunidade cristã',
  ],
  authors: [{ name: 'Hope Carmo' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/`,
    title: 'Hope Carmo - Farol de Esperança para a Juventude',
    description:
      'Hope Carmo é um ministério dedicado a levar esperança e transformação para a juventude através do amor de Cristo.',
    images: [
      {
        url: SITE_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Hope Carmo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hope Carmo - Farol de Esperança para a Juventude',
    description:
      'Hope Carmo é um ministério dedicado a levar esperança e transformação para a juventude através do amor de Cristo.',
    images: [SITE_OG_IMAGE_URL],
  },
  alternates: { canonical: `${SITE_URL}/` },
};

export const viewport: Viewport = {
  themeColor: '#FFD700',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased">
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Hope Carmo',
              alternateName: 'Ministério Hope Carmo',
              url: SITE_URL,
              logo: `${SITE_URL}/img/logo-amarelo.webp`,
              description:
                'Ministério de jovens da IPI de Carmo do Rio Claro — um farol de esperança para a juventude.',
              sameAs: ['https://instagram.com/hopecarmo'],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Carmo do Rio Claro',
                addressRegion: 'MG',
                addressCountry: 'BR',
              },
            }),
          }}
        />
        <Script
          src="https://cdn.himetrica.com/tracker.js"
          data-api-key="hm_14ea9f1aea7a341d01c68a3b7ba7065f64097f6c6e1baeb0"
          strategy="afterInteractive"
        />
        <TooltipProvider delay={0}>
          <SupabaseImplicitHashHandler />
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
