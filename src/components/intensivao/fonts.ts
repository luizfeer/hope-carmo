import { Anton } from 'next/font/google';
import localFont from 'next/font/local';

/** Fonte condensada pesada usada na identidade do Intensivão (estilo do cartaz). */
export const anton = Anton({ subsets: ['latin'], weight: '400' });

/** Marola — fonte da logomarca "Hope" (dafont.com/pt/marola). */
export const marola = localFont({
  src: '../../fonts/marola.ttf',
  display: 'swap',
});
