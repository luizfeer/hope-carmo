import convertHeic from 'heic-convert';
import sharp from 'sharp';

const WEBP_QUALITY = 82;
const WEBP_EFFORT = 4;

const HEIC_EXT = new Set(['heic', 'heif']);

/** ISO BMFF: caixa ftyp com brand HEIF/HEIC (iPhone, etc.). */
function looksLikeHeicBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  if (buf.toString('ascii', 4, 8) !== 'ftyp') return false;
  const brand = buf.toString('ascii', 8, 12);
  return /^(heic|heix|hevc|hevx|mif1|msf1)/i.test(brand);
}

/**
 * HEIC/HEIF não é decodificado pelo Sharp em muitos ambientes (ex.: Linux sem libheif).
 * Converte para JPEG antes do pipeline Sharp.
 */
async function heicToJpegBuffer(input: Buffer): Promise<Buffer> {
  const out = await convertHeic({
    buffer: input,
    format: 'JPEG',
    quality: 0.92,
  });
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}

async function prepareBufferForSharp(
  input: Buffer,
  originalFilename?: string | null,
): Promise<Buffer> {
  const ext =
    originalFilename?.split('.').pop()?.toLowerCase() ?? '';
  const tryHeic = HEIC_EXT.has(ext) || looksLikeHeicBuffer(input);
  if (!tryHeic) return input;

  try {
    return await heicToJpegBuffer(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Não foi possível converter HEIC/HEIF. Tente exportar como JPEG no telefone ou use outra imagem. (${msg})`,
    );
  }
}

/** Largura máxima em px (mantém proporção; não amplia imagens mais pequenas). */
export const UPLOAD_MAX_WIDTH = {
  cover: 1920,
  gallery: 1600,
  thumb: 1280,
} as const;

export type UploadImagePreset = keyof typeof UPLOAD_MAX_WIDTH;

export type OptimizeImageOptions = {
  /** Nome do ficheiro original (para detetar .heic / .heif). */
  originalFilename?: string | null;
};

/**
 * Redimensiona (se necessário), corrige orientação EXIF e exporta WebP compacto.
 * Entrada: JPEG, PNG, WebP, GIF (primeiro frame), HEIC/HEIF (convertido via heic-convert).
 */
export async function optimizeImageToWebp(
  input: Buffer,
  preset: UploadImagePreset,
  opts?: OptimizeImageOptions,
): Promise<Buffer> {
  const maxWidth = UPLOAD_MAX_WIDTH[preset];

  try {
    const decoded = await prepareBufferForSharp(input, opts?.originalFilename);
    return await sharp(decoded, { pages: 1 })
      .rotate()
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
      .toBuffer();
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Não foi possível converter HEIC')) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : 'Erro desconhecido';
    throw new Error(`Não foi possível processar a imagem: ${msg}`);
  }
}
