/**
 * Galeria de fotos do Intensivão hospedada no Cloudinary (pasta `intensivao`).
 * As fotos são servidas com transformação na URL (f_auto/q_auto/w_...),
 * então não passam pela otimização de imagem do Worker.
 *
 * Para adicionar fotos: suba na pasta `intensivao` do Cloudinary e inclua
 * o número aqui (o = orientação: 'p' retrato 1600×2400, 'l' paisagem 2400×1600).
 */

const CLOUD_NAME = 'dwsqvtil1';

export interface FotoGaleria {
  /** Número do arquivo IMG_NNNN no Cloudinary. */
  id: number;
  /** Orientação: 'p' retrato (2:3) ou 'l' paisagem (3:2). */
  o: 'p' | 'l';
}

export const GALERIA: FotoGaleria[] = [
  { id: 3508, o: 'p' },
  { id: 3519, o: 'l' },
  { id: 3523, o: 'p' },
  { id: 3525, o: 'p' },
  { id: 3529, o: 'l' },
  { id: 3547, o: 'p' },
  { id: 3549, o: 'p' },
  { id: 3552, o: 'p' },
  { id: 3553, o: 'p' },
  { id: 3556, o: 'p' },
  { id: 3557, o: 'p' },
  { id: 3561, o: 'p' },
  { id: 3564, o: 'p' },
  { id: 3569, o: 'p' },
  { id: 3574, o: 'p' },
  { id: 3582, o: 'l' },
  { id: 3587, o: 'p' },
  { id: 3592, o: 'p' },
  { id: 3600, o: 'l' },
  { id: 3605, o: 'p' },
  { id: 3606, o: 'p' },
  { id: 3614, o: 'p' },
  { id: 3622, o: 'l' },
  { id: 3630, o: 'p' },
  { id: 3633, o: 'l' },
  { id: 3635, o: 'l' },
  { id: 3642, o: 'p' },
  { id: 3649, o: 'p' },
  { id: 3657, o: 'p' },
  { id: 3658, o: 'p' },
  { id: 3665, o: 'p' },
  { id: 3674, o: 'p' },
  { id: 3678, o: 'p' },
  { id: 3679, o: 'p' },
  { id: 3705, o: 'p' },
  { id: 3708, o: 'l' },
  { id: 3725, o: 'p' },
  { id: 3727, o: 'p' },
  { id: 3732, o: 'p' },
  { id: 3733, o: 'l' },
  { id: 3742, o: 'p' },
  { id: 3747, o: 'p' },
  { id: 3754, o: 'p' },
  { id: 3759, o: 'p' },
  { id: 3761, o: 'p' },
  { id: 3782, o: 'p' },
  { id: 3790, o: 'p' },
  { id: 3799, o: 'l' },
];

/** URL da foto com largura limitada (Cloudinary redimensiona e escolhe o formato). */
export function galeriaUrl(foto: FotoGaleria, width: number): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/intensivao/IMG_${foto.id}.webp`;
}

export function galeriaAlt(foto: FotoGaleria, index: number): string {
  return `Intensivão Hope — foto ${index + 1}`;
}

/** URL que força o download (Content-Disposition: attachment) em resolução alta. */
export function galeriaDownloadUrl(foto: FotoGaleria): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_jpg,q_auto,fl_attachment/intensivao/IMG_${foto.id}.webp`;
}
