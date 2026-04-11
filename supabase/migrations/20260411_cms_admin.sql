-- =============================================================================
-- CMS: notícias, vídeos, perfis admin, storage público para thumbs
-- Rode no Supabase SQL ou: supabase db push
-- Após migrar: criar um usuário em Authentication, depois:
--   UPDATE public.profiles SET is_admin = true WHERE id = '<uuid do user>';
-- =============================================================================

-- --- Perfis (1:1 com auth.users) --------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;
CREATE POLICY "profiles_select_self"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Nota: is_admin só deve ser alterado via SQL no painel Supabase (segurança)

-- Trigger: novo usuário → linha em profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- --- Notícias ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  excerpt            TEXT,
  body               TEXT,
  external_url       TEXT,
  thumb_url          TEXT,
  category           TEXT NOT NULL DEFAULT 'Geral',
  published_at       DATE,
  meta_title         TEXT,
  meta_description   TEXT,
  is_published       BOOLEAN NOT NULL DEFAULT false,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_published_sort
  ON public.news_items (is_published, sort_order DESC, published_at DESC);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_anon_read_published" ON public.news_items;
CREATE POLICY "news_anon_read_published"
  ON public.news_items FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "news_admin_all" ON public.news_items;
CREATE POLICY "news_admin_all"
  ON public.news_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- --- Vídeos ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.video_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  video_url          TEXT NOT NULL,
  thumb_url          TEXT,
  duration           TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0,
  meta_title         TEXT,
  meta_description   TEXT,
  is_published       BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_published_sort
  ON public.video_items (is_published, sort_order DESC, created_at DESC);

ALTER TABLE public.video_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_anon_read_published" ON public.video_items;
CREATE POLICY "videos_anon_read_published"
  ON public.video_items FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "videos_admin_all" ON public.video_items;
CREATE POLICY "videos_admin_all"
  ON public.video_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- --- Storage bucket media (thumbs) -----------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
