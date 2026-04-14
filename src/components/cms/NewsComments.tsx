'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MessageCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import type { NewsComment } from '@/types/cms';
import {
  deleteNewsCommentAction,
  postNewsCommentAction,
  type PostCommentResult,
} from '@/app/(site)/news/comment-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  newsId: string;
  slug: string;
  initialComments: NewsComment[];
};

export function NewsComments({ newsId, slug, initialComments }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [postState, postAction, postPending] = useFormState<
    PostCommentResult | undefined,
    FormData
  >(postNewsCommentAction, undefined);

  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const prevOk = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setUserId(session?.user.id ?? null);
        setAuthReady(true);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (postState?.ok && !prevOk.current) {
      prevOk.current = true;
      router.refresh();
    }
    if (!postState?.ok) prevOk.current = false;
  }, [postState, router]);

  async function signInWithGoogle() {
    const next = `/news/${slug}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) console.error(error);
  }

  return (
    <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="mb-8 flex items-center gap-2 text-2xl font-bold text-white"
      >
        <MessageCircle className="h-7 w-7 text-pink-400" aria-hidden />
        Comentários
      </h2>

      <ul className="space-y-6">
        {initialComments.map((c) => (
          <li
            key={c.id}
            className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-violet-900/80">
              {c.author_avatar_url ? (
                <Image
                  src={c.author_avatar_url}
                  alt=""
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-pink-200">
                  {c.author_name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-pink-100">{c.author_name}</span>
                <time
                  className="text-xs text-pink-200/50"
                  dateTime={c.created_at}
                >
                  {new Date(c.created_at).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </time>
                {userId === c.user_id ? (
                  <form
                    className="ml-auto"
                    action={async (formData) => {
                      const r = await deleteNewsCommentAction(formData);
                      if (r.ok) router.refresh();
                    }}
                  >
                    <input type="hidden" name="comment_id" value={c.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-pink-300/70 hover:text-red-300"
                      aria-label="Excluir comentário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-pink-50/90">{c.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {initialComments.length === 0 ? (
        <p className="mb-6 text-pink-200/60">Nenhum comentário ainda. Seja o primeiro!</p>
      ) : null}

      <div className="mt-8 rounded-xl border border-pink-500/20 bg-violet-950/40 p-6">
        {!authReady ? (
          <p className="text-pink-200/70">Carregando…</p>
        ) : userId ? (
          <form
            key={initialComments.at(-1)?.id ?? 'none'}
            action={postAction}
            className="space-y-4"
          >
            <input type="hidden" name="news_id" value={newsId} />
            <input type="hidden" name="slug" value={slug} />
            <label htmlFor="comment-body" className="sr-only">
              Seu comentário
            </label>
            <Textarea
              id="comment-body"
              name="body"
              required
              maxLength={2000}
              rows={4}
              placeholder="Escreva um comentário…"
              className="resize-y border-white/15 bg-black/30 text-pink-50 placeholder:text-pink-200/40"
              disabled={postPending}
            />
            {postState && !postState.ok ? (
              <p className="text-sm text-red-300" role="alert">
                {postState.error}
              </p>
            ) : null}
            {postState?.ok ? (
              <p className="text-sm text-emerald-300">Comentário publicado.</p>
            ) : null}
            <Button
              type="submit"
              disabled={postPending}
              className="bg-pink-600 text-white hover:bg-pink-500"
            >
              {postPending ? 'Enviando…' : 'Publicar comentário'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-pink-100/90">
              Entre com sua conta Google para comentar.
            </p>
            <Button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Entrar com Google
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
