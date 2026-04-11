import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SortOrder, StatusFilter } from '@/lib/admin/list-query';

type SortOption = { value: string; label: string };

type BaseProps = {
  basePath: string;
  q: string;
  sort: string;
  order: SortOrder;
  /** Valores padrão da página (para o botão Limpar) */
  defaultSort: string;
  defaultOrder: SortOrder;
  sortOptions: SortOption[];
};

type StatusProps = BaseProps & {
  variant: 'status';
  status: StatusFilter;
};

type SeriesProps = BaseProps & {
  variant: 'series';
  series: string;
  seriesOptions: string[];
};

export function AdminListToolbar(props: StatusProps | SeriesProps) {
  const hasQuery =
    props.q.trim() !== '' ||
    (props.variant === 'status' && props.status !== 'all') ||
    (props.variant === 'series' && props.series !== 'all') ||
    props.sort !== props.defaultSort ||
    props.order !== props.defaultOrder;

  return (
    <form
      method="get"
      className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 ring-1 ring-white/5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label htmlFor="admin-q" className="text-xs text-zinc-400">
            Buscar
          </Label>
          <Input
            id="admin-q"
            name="q"
            defaultValue={props.q}
            placeholder={
              props.variant === 'series'
                ? 'Série ou texto nas respostas…'
                : 'Título, slug…'
            }
            className="border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>

        {props.variant === 'status' ? (
          <div className="w-full space-y-1.5 sm:w-44">
            <Label htmlFor="admin-status" className="text-xs text-zinc-400">
              Status
            </Label>
            <select
              id="admin-status"
              name="status"
              defaultValue={props.status}
              className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              <option value="all">Todos</option>
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>
        ) : (
          <div className="w-full space-y-1.5 sm:w-52">
            <Label htmlFor="admin-series" className="text-xs text-zinc-400">
              Série
            </Label>
            <select
              id="admin-series"
              name="series"
              defaultValue={props.series}
              className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              <option value="all">Todas</option>
              {props.seriesOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full space-y-1.5 sm:w-48">
          <Label htmlFor="admin-sort" className="text-xs text-zinc-400">
            Ordenar por
          </Label>
          <select
            id="admin-sort"
            name="sort"
            defaultValue={props.sort}
            className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            {props.sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full space-y-1.5 sm:w-36">
          <Label htmlFor="admin-order" className="text-xs text-zinc-400">
            Direção
          </Label>
          <select
            id="admin-order"
            name="order"
            defaultValue={props.order}
            className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            <option value="desc">Mais recente / Z→A</option>
            <option value="asc">Mais antigo / A→Z</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="bg-amber-600 text-white hover:bg-amber-500">
            Aplicar
          </Button>
          {hasQuery ? (
            <Link
              href={props.basePath}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-zinc-600 bg-transparent px-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Limpar
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}
