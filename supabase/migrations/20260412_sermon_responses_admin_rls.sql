-- Leitura das respostas do formulário (série de sermão) apenas para admins autenticados.
-- Sem isto, o cliente com anon key + sessão pode ver 0 linhas (RLS bloqueia tudo).
-- Rode no Supabase: SQL Editor (colar este ficheiro) ou `supabase db push`.

GRANT SELECT ON TABLE public.sermon_responses TO authenticated;

DROP POLICY IF EXISTS "sermon_responses_admin_select" ON public.sermon_responses;

CREATE POLICY "sermon_responses_admin_select"
  ON public.sermon_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
