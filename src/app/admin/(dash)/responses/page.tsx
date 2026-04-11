import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminListToolbar } from '@/components/admin/AdminListToolbar';
import {
  escapeIlikePattern,
  parseResponseSort,
  parseSortOrder,
  type ResponseSortField,
  type SortOrder,
} from '@/lib/admin/list-query';

const Q_LABELS = [
  { key: 'question_1' as const, label: 'Dúvida sobre a fé que nunca teve coragem de perguntar' },
  { key: 'question_2' as const, label: 'Momento em que quis desistir de crer' },
  { key: 'question_3' as const, label: 'O que ajudou a continuar crendo (ou o que ainda procura)' },
];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type SearchParams = {
  q?: string;
  series?: string;
  sort?: string;
  order?: string;
};

const DEFAULT_SORT: ResponseSortField = 'created_at';
const DEFAULT_ORDER: SortOrder = 'desc';

export default async function AdminSermonResponsesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const seriesParam = (sp.series ?? 'all').trim();
  const sort = parseResponseSort(sp.sort);
  const order = parseSortOrder(sp.order);

  const supabase = await createClient();

  const { data: slugRows } = await supabase.from('sermon_responses').select('series_slug');
  const seriesOptions = [
    ...new Set(
      (slugRows ?? [])
        .map((r) => r.series_slug)
        .filter((s): s is string => Boolean(s?.trim())),
    ),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const seriesFilter =
    seriesParam !== 'all' && seriesOptions.includes(seriesParam) ? seriesParam : 'all';

  let listQuery = supabase
    .from('sermon_responses')
    .select('id, series_slug, question_1, question_2, question_3, created_at');

  if (q) {
    const esc = escapeIlikePattern(q);
    listQuery = listQuery.or(
      `series_slug.ilike.%${esc}%,question_1.ilike.%${esc}%,question_2.ilike.%${esc}%,question_3.ilike.%${esc}%`,
    );
  }
  if (seriesFilter !== 'all') {
    listQuery = listQuery.eq('series_slug', seriesFilter);
  }

  const ascending = order === 'asc';
  listQuery = listQuery.order(sort, { ascending });
  listQuery = listQuery.order('id', { ascending: true });

  const { data: rows, error } = await listQuery;

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-600 pb-6">
        <h1 className="break-words text-3xl font-bold tracking-tight text-white">
          Respostas do formulário
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Respostas anónimas enviadas pelo modal da série de sermão (site público). Use busca, filtro
          por série e ordenação abaixo.
        </p>
      </div>

      <AdminListToolbar
        variant="series"
        basePath="/admin/responses"
        q={q}
        series={seriesFilter}
        seriesOptions={seriesOptions}
        sort={sort}
        order={order}
        defaultSort={DEFAULT_SORT}
        defaultOrder={DEFAULT_ORDER}
        sortOptions={[
          { value: 'created_at', label: 'Data de envio' },
          { value: 'series_slug', label: 'Série (slug)' },
        ]}
      />

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          Não foi possível carregar as respostas. Confirme que aplicou a migração
          <code className="mx-1 rounded bg-red-950 px-1.5 py-0.5 text-xs">20260412_sermon_responses_admin_rls</code>
          no Supabase e que está autenticado como admin.
        </div>
      ) : (rows ?? []).length === 0 ? (
        <div className="space-y-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-10 text-left text-sm text-zinc-400">
          <p className="text-center font-medium text-zinc-300">
            Nenhuma resposta encontrada com estes filtros.
          </p>
          <p className="text-center text-xs text-zinc-500">
            Se não há dados na base, a lista fica vazia. Ajuste a busca ou{' '}
            <a href="/admin/responses" className="text-amber-400 underline">
              limpe os filtros
            </a>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-10">
          {(rows ?? []).map((row) => (
            <li key={row.id} className="scroll-mt-4">
              <Card className="overflow-hidden border-2 border-zinc-500/90 bg-zinc-950 shadow-2xl shadow-black/50 ring-1 ring-zinc-400/15">
                <CardHeader className="border-b-2 border-zinc-600 bg-zinc-900 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-white">
                      <span className="text-zinc-400">Série</span>{' '}
                      <span className="text-amber-300">{row.series_slug}</span>
                    </CardTitle>
                    <CardDescription className="shrink-0 rounded-md border border-zinc-600 bg-black/50 px-3 py-1 text-sm font-medium tabular-nums text-zinc-200">
                      {formatDate(row.created_at)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 bg-zinc-950/80 px-4 py-6 sm:px-6">
                  {Q_LABELS.map(({ key, label }, index) => {
                    const text = row[key];
                    if (!text?.trim()) return null;
                    return (
                      <div
                        key={key}
                        className="overflow-hidden rounded-xl border border-zinc-500/80 bg-zinc-900/40 shadow-lg shadow-black/30"
                      >
                        <div className="flex gap-0 border-b border-zinc-600 bg-gradient-to-r from-amber-950/60 to-zinc-900">
                          <div
                            className="flex w-11 shrink-0 items-center justify-center border-r border-amber-500/50 bg-amber-500/20 text-base font-bold text-amber-300 sm:w-12"
                            aria-hidden
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1 px-4 py-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
                              Pergunta
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-snug text-amber-50 sm:text-[15px]">
                              {label}
                            </p>
                          </div>
                        </div>
                        <div className="border-t-2 border-zinc-700 bg-black/35 px-4 py-5 sm:px-5">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">
                            Resposta
                          </p>
                          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-white">
                            {text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
