'use client';

import { Images } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  listNewsGalleryImagesAction,
  upsertNewsAction,
  type NewsGalleryImage,
} from '@/app/admin/actions';
import { NewsMarkdownEditor } from '@/components/admin/NewsMarkdownEditor';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { NewsItem } from '@/types/cms';

type Props = { initial?: NewsItem | null };

export function NewsEditorForm({ initial }: Props) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [body, setBody] = useState(initial?.body ?? '');
  const [thumbUrl, setThumbUrl] = useState<string | null>(initial?.thumb_url ?? null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<NewsGalleryImage[]>([]);
  const [localFilePreview, setLocalFilePreview] = useState<string | null>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!galleryOpen) return;
    let cancelled = false;
    setGalleryLoading(true);
    void (async () => {
      try {
        const items = await listNewsGalleryImagesAction();
        if (!cancelled) setGalleryItems(items);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Erro ao carregar galeria');
          setGalleryItems([]);
        }
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [galleryOpen]);

  useEffect(() => {
    return () => {
      if (localFilePreview?.startsWith('blob:')) URL.revokeObjectURL(localFilePreview);
    };
  }, [localFilePreview]);

  async function onSubmit(formData: FormData) {
    try {
      formData.set('body', body);
      await upsertNewsAction(formData);
      toast.success('Notícia salva');
      router.push('/admin/news');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  }

  return (
    <form action={onSubmit} className="max-w-4xl space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="thumb_url" value={thumbUrl ?? ''} />

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="gerado a partir do título se vazio"
          defaultValue={initial?.slug}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Resumo</Label>
        <Textarea id="excerpt" name="excerpt" rows={3} defaultValue={initial?.excerpt ?? ''} />
      </div>

      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <p className="text-xs text-muted-foreground">
          Editor visual (o site continua a usar Markdown por baixo). Imagens da galeria ou envio novo
          em <code className="rounded bg-muted px-1">media/news/gallery/</code>.
        </p>
        <NewsMarkdownEditor key={initial?.id ?? 'new'} value={body} onChange={setBody} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="external_url">Link externo (abre em nova aba em vez da página)</Label>
        <Input
          id="external_url"
          name="external_url"
          type="url"
          placeholder="https://"
          defaultValue={initial?.external_url ?? ''}
        />
      </div>

      <div className="space-y-3">
        <div>
          <Label>Capa</Label>
          <p className="text-xs text-muted-foreground">
            Pré-visualização da imagem usada na listagem e no topo do artigo. Escolha da galeria
            (imagens já enviadas para o corpo) ou envie um ficheiro novo (gravado como capa no
            storage).
          </p>
        </div>

        <div
          className={cn(
            'relative aspect-video w-full max-w-xl overflow-hidden rounded-lg border bg-muted',
            (localFilePreview || thumbUrl) && 'border-primary/30',
          )}
        >
          {localFilePreview || thumbUrl ? (
            <Image
              src={localFilePreview || thumbUrl!}
              alt="Pré-visualização da capa"
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              unoptimized={Boolean(localFilePreview)}
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
              Sem capa — escolha da galeria ou envie uma imagem.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={thumbFileRef}
            id="thumb"
            name="thumb"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-hidden
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              if (!f) return;
              if (localFilePreview?.startsWith('blob:')) URL.revokeObjectURL(localFilePreview);
              setLocalFilePreview(URL.createObjectURL(f));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => thumbFileRef.current?.click()}
          >
            Enviar imagem
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGalleryOpen(true)}
          >
            <Images className="mr-1.5 h-4 w-4" aria-hidden />
            Galeria
          </Button>
          {(thumbUrl || localFilePreview) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                setThumbUrl(null);
                if (localFilePreview?.startsWith('blob:')) URL.revokeObjectURL(localFilePreview);
                setLocalFilePreview(null);
                if (thumbFileRef.current) thumbFileRef.current.value = '';
              }}
            >
              Limpar
            </Button>
          )}
        </div>

        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden p-0 sm:max-w-3xl">
            <DialogHeader className="border-b px-4 py-3 pr-12">
              <DialogTitle>Capa a partir da galeria</DialogTitle>
              <DialogDescription>
                Imagens em <code className="rounded bg-muted px-1">media/news/gallery/</code>. Clique
                numa miniatura para usar como capa (o URL é guardado na notícia).
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[min(60vh,520px)] overflow-y-auto px-4 pb-4">
              {galleryLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">A carregar…</p>
              ) : galleryItems.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma imagem na galeria. Envie imagens pelo editor Markdown (&quot;Inserir
                  imagem&quot;) ou use &quot;Enviar imagem&quot; acima.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {galleryItems.map((item) => (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbUrl(item.url);
                          if (localFilePreview?.startsWith('blob:'))
                            URL.revokeObjectURL(localFilePreview);
                          setLocalFilePreview(null);
                          if (thumbFileRef.current) thumbFileRef.current.value = '';
                          setGalleryOpen(false);
                          toast.success('Capa definida a partir da galeria');
                        }}
                        className="group relative w-full overflow-hidden rounded-lg border bg-muted ring-0 transition hover:border-primary hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="relative block aspect-video w-full">
                          <Image
                            src={item.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </span>
                        <span className="sr-only">Usar {item.name} como capa</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            defaultValue={initial?.category ?? 'Geral'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="published_at">Data (AAAA-MM-DD)</Label>
          <Input
            id="published_at"
            name="published_at"
            type="date"
            defaultValue={initial?.published_at ?? ''}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sort_order">Ordem (maior aparece primeiro)</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_title">SEO — título (opcional)</Label>
        <p className="text-xs text-muted-foreground">
          Pode ser mais curto ou com palavras‑chave para motores de busca. Se deixar vazio, usa o
          título da notícia ao gravar.
        </p>
        <Input id="meta_title" name="meta_title" defaultValue={initial?.meta_title ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">SEO — descrição (opcional)</Label>
        <p className="text-xs text-muted-foreground">
          Resumo para resultados de pesquisa (ideal ~150 caracteres). Se vazio, usa o resumo da
          notícia ou um excerto do texto do corpo.
        </p>
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
