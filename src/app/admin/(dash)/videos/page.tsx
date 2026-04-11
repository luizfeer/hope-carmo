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
import { deleteVideoAction } from '@/app/admin/actions';
import { AdminOutlineLink } from '@/components/admin/AdminOutlineLink';
import { AdminPrimaryLink } from '@/components/admin/AdminPrimaryLink';
import { AdminTableShell } from '@/components/admin/AdminTableShell';
import { AdminListToolbar } from '@/components/admin/AdminListToolbar';
import {
  escapeIlikePattern,
  parseSortOrder,
  parseStatusFilter,
  parseVideoSort,
  type SortOrder,
  type VideoSortField,
} from '@/lib/admin/list-query';

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
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
  status?: string;
  sort?: string;
  order?: string;
};

const DEFAULT_SORT: VideoSortField = 'created_at';
const DEFAULT_ORDER: SortOrder = 'desc';

export default async function AdminVideosListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const status = parseStatusFilter(sp.status);
  const sort = parseVideoSort(sp.sort);
  const order = parseSortOrder(sp.order);

  const supabase = await createClient();
  let query = supabase
    .from('video_items')
    .select('id, title, video_url, is_published, sort_order, duration, created_at');

  if (q) {
    const esc = escapeIlikePattern(q);
    query = query.or(`title.ilike.%${esc}%,video_url.ilike.%${esc}%`);
  }
  if (status === 'published') query = query.eq('is_published', true);
  if (status === 'draft') query = query.eq('is_published', false);

  const ascending = order === 'asc';
  query = query.order(sort, { ascending });
  query = query.order('id', { ascending: true });

  const { data: rows } = await query;
  const list = rows ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Vídeos</h1>
          <p className="mt-1 text-sm text-zinc-400">Vídeos em destaque no site.</p>
        </div>
        <AdminPrimaryLink href="/admin/videos/new">Novo vídeo</AdminPrimaryLink>
      </div>

      <AdminListToolbar
        variant="status"
        basePath="/admin/videos"
        q={q}
        status={status}
        sort={sort}
        order={order}
        defaultSort={DEFAULT_SORT}
        defaultOrder={DEFAULT_ORDER}
        sortOptions={[
          { value: 'created_at', label: 'Data de cadastro' },
          { value: 'title', label: 'Título' },
          { value: 'sort_order', label: 'Ordem manual' },
          { value: 'duration', label: 'Duração (texto)' },
        ]}
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900/70 hover:bg-zinc-900/70">
              <TableHead className="px-4 text-zinc-300">Título</TableHead>
              <TableHead className="px-4 text-zinc-300">Duração</TableHead>
              <TableHead className="px-4 text-zinc-300">Cadastro</TableHead>
              <TableHead className="px-4 text-zinc-300">Status</TableHead>
              <TableHead className="px-4 text-right text-zinc-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                <TableCell colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                  Nenhum vídeo encontrado com estes filtros.
                </TableCell>
              </TableRow>
            ) : (
              list.map((row) => (
                <TableRow key={row.id} className="border-zinc-800/80">
                  <TableCell className="max-w-[280px] truncate px-4 font-medium text-zinc-100">
                    {row.title}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-zinc-400">
                    {row.duration ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 text-sm text-zinc-400">
                    {formatDateTime(row.created_at)}
                  </TableCell>
                  <TableCell className="px-4">
                    {row.is_published ? (
                      <Badge>Publicado</Badge>
                    ) : (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 px-4 text-right">
                    <AdminOutlineLink href={`/admin/videos/${row.id}`}>Editar</AdminOutlineLink>
                    <form action={deleteVideoAction} className="inline">
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
