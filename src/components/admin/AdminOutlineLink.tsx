import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AdminOutlineLink({
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
        'inline-flex h-8 items-center justify-center rounded-md border border-zinc-600 bg-zinc-900/80 px-3 text-xs font-medium text-zinc-100 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800',
        className
      )}
    >
      {children}
    </Link>
  );
}
