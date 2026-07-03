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
      const url = await uploadSiteOgImageAction(formData);
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
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
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
