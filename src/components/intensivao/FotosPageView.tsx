'use client';

import { useEffect } from 'react';
import { trackIntensivaoFotosVistas } from '@/lib/himetrica-client';

/** Marca "viu as fotos" ao abrir /intensivao/fotos direto (sem passar pelo slider). */
export default function FotosPageView() {
  useEffect(() => {
    trackIntensivaoFotosVistas('pagina-fotos');
  }, []);
  return null;
}
