import { cn } from '@/lib/utils';

/** Moldura com borda para tabelas do admin (visível no tema escuro). */
export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950/40 shadow-sm ring-1 ring-white/5',
        className
      )}
    >
      {children}
    </div>
  );
}
