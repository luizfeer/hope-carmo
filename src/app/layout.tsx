import type { Metadata, Viewport } from 'next';
import SiteShell from '@/components/SiteShell';
import RadioPlayer from '@/components/RadioPlayer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hopecarmo.com'),
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
    url: 'https://hopecarmo.com/',
    title: 'Hope Carmo - Farol de Esperança para a Juventude',
    description:
      'Hope Carmo é um ministério dedicado a levar esperança e transformação para a juventude através do amor de Cristo.',
    images: ['/img/logo-amarelo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hope Carmo - Farol de Esperança para a Juventude',
    description:
      'Hope Carmo é um ministério dedicado a levar esperança e transformação para a juventude através do amor de Cristo.',
    images: ['/img/logo-amarelo.webp'],
  },
  alternates: { canonical: 'https://hopecarmo.com/' },
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
    <html lang="pt-BR">
      <body className="min-h-screen bg-black text-white antialiased">
        <SiteShell>{children}</SiteShell>
        <RadioPlayer />
      </body>
    </html>
  );
}
