'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const MAX_LEN = 2000;

function authorFromUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): { name: string; avatar: string | null } {
  const m = user.user_metadata ?? {};
  const full =
    (typeof m.full_name === 'string' && m.full_name) ||
    (typeof m.name === 'string' && m.name) ||
    '';
  const emailLocal = user.email?.split('@')[0] ?? '';
  const name = (full || emailLocal || 'Usuário').trim().slice(0, 120);
  const avatarRaw =
    (typeof m.avatar_url === 'string' && m.avatar_url) ||
    (typeof m.picture === 'string' && m.picture) ||
    null;
  return { name, avatar: avatarRaw };
}

export type PostCommentResult =
  | { ok: true }
  | { ok: false; error: string };

export async function postNewsCommentAction(
  _prev: PostCommentResult | undefined,
  formData: FormData
): Promise<PostCommentResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Faça login para comentar.' };
  }

  const newsId = (formData.get('news_id') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const raw = (formData.get('body') as string) ?? '';
  const body = raw.trim();

  if (!newsId || !slug) {
    return { ok: false, error: 'Dados inválidos.' };
  }
  if (!body) {
    return { ok: false, error: 'Escreva uma mensagem.' };
  }
  if (body.length > MAX_LEN) {
    return { ok: false, error: `Máximo de ${MAX_LEN} caracteres.` };
  }

  const { name, avatar } = authorFromUser(user);

  const { error } = await supabase.from('news_comments').insert({
    news_id: newsId,
    user_id: user.id,
    body,
    author_name: name,
    author_avatar_url: avatar,
  });

  if (error) {
    console.error('postNewsCommentAction', error);
    return { ok: false, error: 'Não foi possível enviar o comentário.' };
  }

  revalidatePath(`/news/${slug}`);
  return { ok: true };
}

export async function deleteNewsCommentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: 'Faça login.' };
  }

  const id = (formData.get('comment_id') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  if (!id || !slug) {
    return { ok: false as const, error: 'Dados inválidos.' };
  }

  const { error } = await supabase.from('news_comments').delete().eq('id', id);

  if (error) {
    console.error('deleteNewsCommentAction', error);
    return { ok: false as const, error: 'Não foi possível remover.' };
  }

  revalidatePath(`/news/${slug}`);
  return { ok: true as const };
}
