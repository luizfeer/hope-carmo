import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { deleteNewsAction } from '@/app/admin/actions';
import { AdminOutlineLink } from '@/components/admin/AdminOutlineLink';
import { AdminPrimaryLink } from '@/components/admin/AdminPrimaryLink';
import { AdminTableShell } from '@/components/admin/AdminTableShell';
import { AdminListToolbar } from '@/components/admin/AdminListToolbar';
import {
  escapeIlikePattern,
  parseNewsSort,
  parseSortOrder,
  parseStatusFilter,
  type NewsSortField,
  type SortOrder,
} from '@/lib/admin/list-query';

function formatDate(d: string | null) {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(d));
  } catch {
    return d;
  }
}

type SearchParams = {
  q?: string;
  status?: string;
  sort?: string;
  order?: string;
};

const DEFAULT_SORT: NewsSortField = 'published_at';
const DEFAULT_ORDER: SortOrder = 'desc';

export default async function AdminNewsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const status = parseStatusFilter(sp.status);
  const sort = parseNewsSort(sp.sort);
  const order = parseSortOrder(sp.order);

  const supabase = await createClient();
  let query = supabase
    .from('news_items')
    .select('id, title, slug, is_published, category, published_at, sort_order, created_at');

  if (q) {
    const esc = escapeIlikePattern(q);
    query = query.or(`title.ilike.%${esc}%,slug.ilike.%${esc}%,category.ilike.%${esc}%`);
  }
  if (status === 'published') query = query.eq('is_published', true);
  if (status === 'draft') query = query.eq('is_published', false);

  const ascending = order === 'asc';
  query = query.order(sort, {
    ascending,
    nullsFirst: sort === 'published_at' ? false : undefined,
  });
  query = query.order('id', { ascending: true });

  const { data: rows } = await query;
  const list = rows ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Notícias</h1>
          <p className="mt-1 text-sm text-zinc-400">Gerir artigos e estado de publicação.</p>
        </div>
        <AdminPrimaryLink href="/admin/news/new">Nova notícia</AdminPrimaryLink>
      </div>

      <AdminListToolbar
        variant="status"
        basePath="/admin/news"
        q={q}
        status={status}
        sort={sort}
        order={order}
        defaultSort={DEFAULT_SORT}
        defaultOrder={DEFAULT_ORDER}
        sortOptions={[
          { value: 'published_at', label: 'Data de publicação' },
          { value: 'created_at', label: 'Data de criação' },
          { value: 'title', label: 'Título' },
          { value: 'sort_order', label: 'Ordem manual' },
          { value: 'category', label: 'Categoria' },
        ]}
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900/70">
              <TableHead className="px-4 text-zinc-300">Título</TableHead>
              <TableHead className="px-4 text-zinc-300">Slug</TableHead>
              <TableHead className="px-4 text-zinc-300">Categoria</TableHead>
              <TableHead className="px-4 text-zinc-300">Publicação</TableHead>
              <TableHead className="px-4 text-zinc-300">Status</TableHead>
              <TableHead className="px-4 text-right text-zinc-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-zinc-500"
                >
                  Nenhuma notícia encontrada com estes filtros.
                </TableCell>
              </TableRow>
            ) : (
              list.map((row) => (
                <TableRow key={row.id} className="border-zinc-800/80">
                  <TableCell className="max-w-[200px] truncate px-4 font-medium text-zinc-100">
                    {row.title}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-zinc-400">{row.slug}</TableCell>
                  <TableCell className="px-4 text-zinc-200">{row.category}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 text-sm text-zinc-400">
                    {formatDate(row.published_at)}
                  </TableCell>
                  <TableCell className="px-4">
                    {row.is_published ? (
                      <Badge>Publicado</Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 px-4 text-right">
                    <AdminOutlineLink href={`/admin/news/${row.id}`}>Editar</AdminOutlineLink>
                    <form action={deleteNewsAction} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
