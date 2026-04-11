'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchYoutubeMetadataAction,
  upsertVideoAction,
} from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VideoItem } from '@/types/cms';

type Props = { initial?: VideoItem | null };

export function VideoEditorForm({ initial }: Props) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? '');
  const [duration, setDuration] = useState(initial?.duration ?? '');
  const [thumbUrl, setThumbUrl] = useState(initial?.thumb_url ?? '');
  const [fetching, setFetching] = useState(false);

  async function onSubmit(formData: FormData) {
    try {
      await upsertVideoAction(formData);
      toast.success('Vídeo salvo');
      router.push('/admin/videos');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  }

  async function pullFromYoutube() {
    setFetching(true);
    try {
      const meta = await fetchYoutubeMetadataAction(videoUrl);
      setTitle(meta.title);
      setThumbUrl(meta.thumbnail_url);
      if (meta.duration) setDuration(meta.duration);
      else if (!duration) {
        toast.message('Duração não obtida', {
          description:
            'Defina YOUTUBE_API_KEY no servidor para preencher a duração automaticamente.',
        });
      }
      toast.success('Dados do vídeo carregados');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao buscar dados');
    } finally {
      setFetching(false);
    }
  }

  return (
    <form action={onSubmit} className="max-w-2xl space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {thumbUrl ? <input type="hidden" name="thumb_url" value={thumbUrl} /> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_url">URL do YouTube *</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="video_url"
            name="video_url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={fetching || !videoUrl.trim()}
            onClick={pullFromYoutube}
            className="inline-flex shrink-0 items-center gap-2"
          >
            {fetching ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {fetching ? 'Buscando…' : 'Buscar dados'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Preenche título e miniatura pelo YouTube. Para duração automática, configure{' '}
          <code className="rounded bg-muted px-1">YOUTUBE_API_KEY</code> no ambiente.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duração (ex.: 12:45)</Label>
        <Input
          id="duration"
          name="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumb">Thumbnail (opcional — senão usa o YouTube)</Label>
        <Input id="thumb" name="thumb" type="file" accept="image/jpeg,image/png,image/webp" />
        {thumbUrl ? (
          <div className="flex items-start gap-3">
            <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md border bg-muted">
              <Image
                src={thumbUrl}
                alt=""
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
            <p className="text-xs text-muted-foreground break-all pt-1">{thumbUrl}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Ordem</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={initial?.sort_order ?? 0}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_title">SEO — título</Label>
        <Input id="meta_title" name="meta_title" defaultValue={initial?.meta_title ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">SEO — descrição</Label>
        <Textarea
          id="meta_description"
          name="meta_description"
          rows={2}
          defaultValue={initial?.meta_description ?? ''}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          name="is_published"
          defaultChecked={initial?.is_published ?? true}
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="is_published">Publicado no site</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit">{editing ? 'Atualizar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
