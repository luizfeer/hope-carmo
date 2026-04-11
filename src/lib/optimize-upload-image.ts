import sharp from 'sharp';

const WEBP_QUALITY = 82;
const WEBP_EFFORT = 4;

/** Largura máxima em px (mantém proporção; não amplia imagens mais pequenas). */
export const UPLOAD_MAX_WIDTH = {
  cover: 1920,
  gallery: 1600,
  thumb: 1280,
} as const;

export type UploadImagePreset = keyof typeof UPLOAD_MAX_WIDTH;

/**
 * Redimensiona (se necessário), corrige orientação EXIF e exporta WebP compacto.
 * Entrada: JPEG, PNG, WebP, GIF (primeiro frame).
 */
export async function optimizeImageToWebp(
  input: Buffer,
  preset: UploadImagePreset,
): Promise<Buffer> {
  const maxWidth = UPLOAD_MAX_WIDTH[preset];

  try {
    return await sharp(input, { pages: 1 })
      .rotate()
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
      .toBuffer();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido';
    throw new Error(`Não foi possível processar a imagem: ${msg}`);
  }
}
