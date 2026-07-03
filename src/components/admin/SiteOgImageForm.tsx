'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadSiteOgImageAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  initialUrl: string | null;
};

async function createOgWebp(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const width = 1200;
  const height = 630;
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (bitmap.width - sourceWidth) / 2;
  const sourceY = (bitmap.height - sourceHeight) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('O navegador não conseguiu processar a imagem');
  }
  context.drawImage(
    bitmap,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82),
  );
  if (!blob || blob.type !== 'image/webp') {
    throw new Error('Este navegador não suporta conversão para WebP');
  }
  return new File([blob], 'og.webp', { type: 'image/webp' });
}

export function SiteOgImageForm({ initialUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function submit(formData: FormData) {
    setPending(true);
    try {
      const source = formData.get('site_og');
      if (!(source instanceof File) || source.size === 0) {
        throw new Error('Selecione uma imagem');
      }
      const optimized = await createOgWebp(source);
      const uploadData = new FormData();
      uploadData.set('site_og', optimized);
      const url = await uploadSiteOgImageAction(uploadData);
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      if (inputRef.current) inputRef.current.value = '';
      toast.success('Imagem OG global atualizada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="site_og">Imagem OG global</Label>
        <p className="text-sm text-zinc-400">
          Prévia padrão do site no WhatsApp, Facebook, Telegram e X. O arquivo é cortado para
          1200 × 630 e convertido para WebP.
        </p>
      </div>

      <div className="relative aspect-[1200/630] w-full max-w-2xl overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Pré-visualização da imagem OG global"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Nenhuma imagem enviada
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          ref={inputRef}
          id="site_og"
          name="site_og"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="max-w-md border-zinc-700 bg-zinc-950"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
          }}
        />
        <Button type="submit" disabled={pending}>
          {pending ? 'Processando…' : 'Salvar imagem OG'}
        </Button>
      </div>
    </form>
  );
}
