import Link from 'next/link';
import { cn } from '@/lib/utils';

/** CTA principal do painel (âmbar) — contraste garantido em cima do body `text-white` da raiz. */
export function AdminPrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-zinc-950 shadow-md shadow-amber-500/25 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
        className
      )}
    >
      {children}
    </Link>
  );
}
