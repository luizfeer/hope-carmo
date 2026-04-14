'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/slug';
import { optimizeImageToWebp } from '@/lib/optimize-upload-image';
import { markdownToPlainTextSnippet } from '@/lib/markdown-plain-text';
import {
  formatYoutubeIsoDuration,
  parseYoutubeVideoId,
} from '@/lib/youtube';

const MAX_NEWS_META_DESCRIPTION = 160;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autorizado');
  const { data: p } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!p?.is_admin) throw new Error('Sem permissão');
  return supabase;
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}

export async function upsertNewsAction(formData: FormData) {
  const supabase = await requireAdmin();

  const id = (formData.get('id') as string)?.trim() || '';
  const title = (formData.get('title') as string)?.trim();
  if (!title) throw new Error('Título é obrigatório');

  let slug = (formData.get('slug') as string)?.trim() || slugify(title);
  if (!slug) slug = `post-${Date.now()}`;

  const excerpt = (formData.get('excerpt') as string)?.trim() || null;
  const body = (formData.get('body') as string)?.trim() || null;
  const external_url = (formData.get('external_url') as string)?.trim() || null;
  const category = (formData.get('category') as string)?.trim() || 'Geral';
  const metaTitleInput = (formData.get('meta_title') as string)?.trim() || '';
  const metaDescInput = (formData.get('meta_description') as string)?.trim() || '';
  /** SEO opcional: se vazio, usa título / resumo / excerto do corpo em texto simples. */
  const meta_title = metaTitleInput || title;
  const meta_description =
    metaDescInput ||
    excerpt ||
    (body ? markdownToPlainTextSnippet(body, MAX_NEWS_META_DESCRIPTION) : null) ||
    null;
  const published_at = (formData.get('published_at') as string)?.trim() || null;
  const sort_order = Number(formData.get('sort_order') || 0) || 0;
  const is_published = formData.has('is_published');

  let thumb_url = (formData.get('thumb_url') as string)?.trim() || null;

  const file = formData.get('thumb') as File | null;
  if (file && typeof file !== 'string' && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)) {
      throw new Error('Capa: use JPEG, PNG, WebP ou HEIC');
    }
    const folder = id || slug;
    const path = `news/${folder}/cover.webp`;
    const raw = Buffer.from(await file.arrayBuffer());
    const webp = await optimizeImageToWebp(raw, 'cover', {
      originalFilename: file.name,
    });
    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, webp, { contentType: 'image/webp', upsert: true });
    if (upErr) throw new Error(upErr.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(path);
    thumb_url = publicUrl;
  }

  const row = {
    slug,
    title,
    excerpt,
    body,
    external_url,
    thumb_url,
    category,
    published_at: published_at || null,
    meta_title,
    meta_description,
    is_published,
    sort_order,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from('news_items')
      .update(row)
      .eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('news_items').insert(row);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath('/admin/news');
}

const MAX_MARKDOWN_IMAGE_BYTES = 5 * 1024 * 1024;

/** Upload de imagem para o bucket `media`, pasta `news/gallery/` (uso no corpo Markdown). */
export async function uploadNewsMarkdownImageAction(
  formData: FormData,
): Promise<{ url: string }> {
  const supabase = await requireAdmin();
  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('Ficheiro inválido');
  }
  if (file.size > MAX_MARKDOWN_IMAGE_BYTES) {
    throw new Error('Imagem demasiado grande (máx. 5 MB)');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'].includes(ext)) {
    throw new Error('Formato não suportado (JPEG, PNG, WebP, GIF ou HEIC)');
  }
  const path = `news/gallery/${randomUUID()}.webp`;
  const raw = Buffer.from(await file.arrayBuffer());
  const webp = await optimizeImageToWebp(raw, 'gallery', {
    originalFilename: file.name,
  });
  const { error: upErr } = await supabase.storage
    .from('media')
    .upload(path, webp, { contentType: 'image/webp', upsert: false });
  if (upErr) throw new Error(upErr.message);
  const {
    data: { publicUrl },
  } = supabase.storage.from('media').getPublicUrl(path);
  return { url: publicUrl };
}

export type NewsGalleryImage = {
  name: string;
  url: string;
  createdAt: string | null;
};

/** Lista ficheiros de imagem em `media/news/gallery/` (para inserir no Markdown). */
export async function listNewsGalleryImagesAction(): Promise<NewsGalleryImage[]> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.storage.from('media').list('news/gallery', {
    limit: 500,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw new Error(error.message);

  const imageExt = /\.(webp|jpe?g|png|gif)$/i;
  const out: NewsGalleryImage[] = [];

  for (const file of data ?? []) {
    if (!file?.name || !imageExt.test(file.name)) continue;
    const path = `news/gallery/${file.name}`;
    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(path);
    out.push({
      name: file.name,
      url: publicUrl,
      createdAt: file.created_at ?? file.updated_at ?? null,
    });
  }

  return out;
}

export async function deleteNewsAction(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) throw new Error('ID ausente');
  const supabase = await requireAdmin();
  const { error } = await supabase.from('news_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath('/admin/news');
}

export type YoutubeMetadataResult = {
  title: string;
  thumbnail_url: string;
  duration: string | null;
};

/** Busca título e miniatura via oEmbed; duração só se `YOUTUBE_API_KEY` estiver definida. */
export async function fetchYoutubeMetadataAction(
  videoUrl: string,
): Promise<YoutubeMetadataResult> {
  await requireAdmin();
  const trimmed = videoUrl.trim();
  if (!trimmed) throw new Error('Informe a URL do vídeo');
  const id = parseYoutubeVideoId(trimmed);
  if (!id) throw new Error('URL do YouTube inválida ou não suportada');

  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(trimmed)}&format=json`;
  const res = await fetch(oembed, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Não foi possível obter dados do vídeo. Verifique se o link está público.');
  }
  const data = (await res.json()) as {
    title: string;
    thumbnail_url: string;
  };
  if (!data.title?.trim()) throw new Error('Resposta do YouTube sem título');

  let duration: string | null = null;
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (apiKey) {
    const vUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(id)}&key=${encodeURIComponent(apiKey)}`;
    const vRes = await fetch(vUrl, { cache: 'no-store' });
    if (vRes.ok) {
      const vJson = (await vRes.json()) as {
        items?: { contentDetails?: { duration?: string } }[];
      };
      const iso = vJson.items?.[0]?.contentDetails?.duration;
      if (iso) duration = formatYoutubeIsoDuration(iso);
    }
  }

  return {
    title: data.title.trim(),
    thumbnail_url: data.thumbnail_url.trim(),
    duration,
  };
}

export async function upsertVideoAction(formData: FormData) {
  const supabase = await requireAdmin();

  const id = (formData.get('id') as string)?.trim() || '';
  const title = (formData.get('title') as string)?.trim();
  const video_url = (formData.get('video_url') as string)?.trim();
  if (!title || !video_url) throw new Error('Título e URL do vídeo são obrigatórios');

  const duration = (formData.get('duration') as string)?.trim() || null;
  const meta_title = (formData.get('meta_title') as string)?.trim() || null;
  const meta_description = (formData.get('meta_description') as string)?.trim() || null;
  const sort_order = Number(formData.get('sort_order') || 0) || 0;
  const is_published = formData.has('is_published');

  let thumb_url = (formData.get('thumb_url') as string)?.trim() || null;

  const file = formData.get('thumb') as File | null;
  if (file && typeof file !== 'string' && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)) {
      throw new Error('Thumbnail: use JPEG, PNG, WebP ou HEIC');
    }
    const folder = id || `new-${Date.now()}`;
    const path = `videos/${folder}/thumb.webp`;
    const raw = Buffer.from(await file.arrayBuffer());
    const webp = await optimizeImageToWebp(raw, 'thumb', {
      originalFilename: file.name,
    });
    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(path, webp, { contentType: 'image/webp', upsert: true });
    if (upErr) throw new Error(upErr.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(path);
    thumb_url = publicUrl;
  }

  const row = {
    title,
    video_url,
    duration,
    thumb_url,
    meta_title,
    meta_description,
    is_published,
    sort_order,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from('video_items')
      .update(row)
      .eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('video_items').insert(row);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/admin/videos');
}

export async function deleteVideoAction(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) throw new Error('ID ausente');
  const supabase = await requireAdmin();
  const { error } = await supabase.from('video_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/videos');
}
