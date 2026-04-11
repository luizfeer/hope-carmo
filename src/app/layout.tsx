import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import { SupabaseImplicitHashHandler } from '@/components/auth/SupabaseImplicitHashHandler';
import { TooltipProvider } from '@/components/ui/tooltip';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="pt-BR" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased">
        <TooltipProvider delay={0}>
          <SupabaseImplicitHashHandler />
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
