/**
 * Compõe a foto com o logo Hope Carmo e gera ficheiro no browser (download / partilha).
 */

export type WatermarkResult =
  | { ok: true; blob: Blob; filename: string }
  | { ok: false; error: string };

export async function composeWatermarkedImage(
  imageUrl: string,
  filenameBase: string,
): Promise<WatermarkResult> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Apenas no navegador.' };
  }

  const safeName =
    filenameBase.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'hope-carmo';
  const filename = `${safeName}-hope-carmo.png`;
  const logoPath = `${window.location.origin}/img/logo-amarelo.webp`;

  const loadImg = (src: string, crossOrigin: boolean) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('load'));
      img.src = src;
    });

  try {
    const photo = await loadImg(imageUrl, true);
    const logo = await loadImg(logoPath, true);

    const maxW = 2400;
    let w = photo.naturalWidth;
    let h = photo.naturalHeight;
    if (w > maxW) {
      h = (h * maxW) / w;
      w = maxW;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Canvas indisponível.' };

    ctx.drawImage(photo, 0, 0, w, h);

    const logoMaxW = w * 0.2;
    let lw = logo.naturalWidth;
    let lh = logo.naturalHeight;
    const sc = logoMaxW / lw;
    lw *= sc;
    lh *= sc;
    const pad = Math.max(12, w * 0.025);

    ctx.globalAlpha = 0.9;
    ctx.drawImage(logo, w - lw - pad, h - lh - pad, lw, lh);
    ctx.globalAlpha = 1;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) return { ok: false, error: 'Não foi possível gerar o ficheiro.' };

    return { ok: true, blob, filename };
  } catch {
    return {
      ok: false,
      error:
        'Não foi possível preparar a imagem (rede ou formato). Tenta noutro navegador.',
    };
  }
}

export async function downloadImageWithHopeWatermark(
  imageUrl: string,
  filenameBase: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await composeWatermarkedImage(imageUrl, filenameBase);
  if (!r.ok) return r;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(r.blob);
  a.download = r.filename;
  a.click();
  URL.revokeObjectURL(a.href);
  return { ok: true };
}
