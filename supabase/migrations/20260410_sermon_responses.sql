-- =============================================================================
-- Tabela: sermon_responses
-- Descrição: Respostas anônimas dos jovens para as perguntas da série de sermão.
--            Sem login, sem vinculação de usuário — apenas texto livre + timestamp.
-- Série inicial: CONVICTOS — Fé que Passa pelo Fogo (2026)
-- =============================================================================

-- Se precisar recriar do zero (cuidado: apaga os dados):
-- DROP TABLE IF EXISTS sermon_responses;

-- Cria a tabela apenas se ainda não existir
CREATE TABLE IF NOT EXISTS sermon_responses (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identifica a série (permite reutilizar a tabela em séries futuras)
  series_slug TEXT        NOT NULL DEFAULT 'convictos-2026',

  -- Perguntas — todas opcionais, o usuário responde o que quiser
  question_1  TEXT,   -- "Qual dúvida sobre a fé você nunca teve coragem de fazer em voz alta?"
  question_2  TEXT,   -- "Já teve um momento em que quis desistir de crer? O que aconteceu?"
  question_3  TEXT,   -- "O que mais te ajudou a continuar crendo — ou o que você ainda está procurando?"

  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- -----------------------------------------------------------------------------
-- Segurança: RLS (Row Level Security)
-- Anônimos NÃO podem ler nem inserir diretamente.
-- Somente a API route (service_role key) tem acesso via bypass de RLS.
-- -----------------------------------------------------------------------------
ALTER TABLE sermon_responses ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas se existirem (idempotente)
DROP POLICY IF EXISTS "anon_no_select" ON sermon_responses;
DROP POLICY IF EXISTS "anon_no_insert" ON sermon_responses;

-- Sem policy pública = ninguém acessa via anon/authenticated key
-- (service_role ignora RLS por padrão no Supabase)

-- -----------------------------------------------------------------------------
-- Índice para filtrar por série (útil no painel quando tiver várias séries)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sermon_responses_series
  ON sermon_responses (series_slug, created_at DESC);

-- -----------------------------------------------------------------------------
-- Para consultar as respostas no painel do Supabase:
--
--   SELECT * FROM sermon_responses
--   WHERE series_slug = 'convictos-2026'
--   ORDER BY created_at DESC;
--
-- Para nova série, basta mudar o series_slug no código (src/app/api/submit-sermon-response/route.ts)
-- e criar um novo conjunto de perguntas.
-- -----------------------------------------------------------------------------
