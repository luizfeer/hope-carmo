-- =============================================================================
-- Comentários em notícias (usuários autenticados, ex.: Google OAuth)
-- Rode no Supabase SQL ou: supabase db push
-- No painel: Authentication → Providers → Google (Client ID / Secret)
-- Redirect URLs devem incluir: .../auth/callback
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.news_comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id             UUID NOT NULL REFERENCES public.news_items (id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body                TEXT NOT NULL,
  author_name         TEXT NOT NULL,
  author_avatar_url   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT news_comments_body_len CHECK (char_length(body) BETWEEN 1 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_news_comments_news_created
  ON public.news_comments (news_id, created_at DESC);

ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_comments_select_published" ON public.news_comments;
CREATE POLICY "news_comments_select_published"
  ON public.news_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.news_items n
      WHERE n.id = news_id AND n.is_published = true
    )
  );

DROP POLICY IF EXISTS "news_comments_insert_authenticated" ON public.news_comments;
CREATE POLICY "news_comments_insert_authenticated"
  ON public.news_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.news_items n
      WHERE n.id = news_id AND n.is_published = true
    )
  );

DROP POLICY IF EXISTS "news_comments_delete_own_or_admin" ON public.news_comments;
CREATE POLICY "news_comments_delete_own_or_admin"
  ON public.news_comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
