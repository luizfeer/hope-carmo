'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LayoutDashboard, LogOut, MessageSquare, Newspaper, Video } from 'lucide-react';
import { signOutAction } from '@/app/admin/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

/** Tema zinco + âmbar herdado pelo painel (sidebar, sheet mobile, tokens bg-sidebar). */
const adminShellStyle = {
  '--sidebar-width': '18rem',
  '--sidebar': 'oklch(0.13 0.012 265)',
  '--sidebar-foreground': 'oklch(0.96 0.006 265)',
  '--sidebar-primary': 'oklch(0.78 0.16 76)',
  '--sidebar-primary-foreground': 'oklch(0.15 0.02 76)',
  '--sidebar-accent': 'oklch(0.24 0.04 76)',
  '--sidebar-accent-foreground': 'oklch(0.98 0.02 80)',
  '--sidebar-border': 'oklch(0.38 0.02 265)',
  '--sidebar-ring': 'oklch(0.72 0.15 76)',
} as CSSProperties;

function buildAdminBreadcrumb(pathname: string): { label: string; href: string }[] {
  const base: { label: string; href: string }[] = [{ label: 'Painel', href: '/admin' }];
  if (pathname === '/admin') return base;

  const rest = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (rest[0] === 'news') {
    const out = [...base, { label: 'Notícias', href: '/admin/news' }];
    if (rest[1] === 'new') out.push({ label: 'Nova', href: pathname });
    else if (rest[1]) out.push({ label: 'Editar', href: pathname });
    return out;
  }
  if (rest[0] === 'videos') {
    const out = [...base, { label: 'Vídeos', href: '/admin/videos' }];
    if (rest[1] === 'new') out.push({ label: 'Novo', href: pathname });
    else if (rest[1]) out.push({ label: 'Editar', href: pathname });
    return out;
  }
  if (rest[0] === 'responses') {
    return [...base, { label: 'Formulário', href: '/admin/responses' }];
  }
  return base;
}

function AdminBreadcrumbs() {
  const pathname = usePathname();
  const items = buildAdminBreadcrumb(pathname);
  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-wrap text-zinc-300 [&_a]:text-zinc-400 [&_a]:hover:text-zinc-100 [&_[data-slot=breadcrumb-page]]:text-zinc-100">
        {items.map((item, i) => (
          <span key={`${item.href}-${item.label}-${i}`} className="contents">
            {i > 0 && <BreadcrumbSeparator className="text-zinc-600" />}
            <BreadcrumbItem>
              {i === items.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/news', label: 'Notícias', icon: Newspaper, exact: false },
  { href: '/admin/videos', label: 'Vídeos', icon: Video, exact: false },
  { href: '/admin/responses', label: 'Formulário', icon: MessageSquare, exact: true },
] as const;

const navButtonBaseClass =
  'h-11 min-h-11 rounded-lg border-l-4 px-3.5 text-[15px] leading-tight [&_svg]:size-5';
const navButtonInactiveClass =
  'border-transparent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground';
const navButtonActiveClass =
  'border-amber-400 bg-amber-500/22 font-semibold text-white shadow-[inset_0_0_0_1px_oklch(0.78_0.14_76/0.55)] ring-1 ring-amber-400/30';

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider
      defaultOpen
      style={adminShellStyle}
      className="flex min-h-svh w-full min-w-0 max-w-[100vw] overflow-x-hidden"
    >
      <Sidebar
        collapsible="offcanvas"
        className="[&_[data-slot=sidebar-container]]:border-r-0 [&_[data-slot=sidebar-inner]]:border-r border-sidebar-border [&_[data-slot=sidebar-inner]]:shadow-xl [&_[data-slot=sidebar-inner]]:shadow-black/50"
      >
        <SidebarHeader className="gap-1.5 border-b border-sidebar-border px-5 py-6">
          <Link
            href="/admin"
            className="text-lg font-bold tracking-tight text-sidebar-foreground transition hover:text-amber-200/95"
          >
            Hope Carmo
          </Link>
          <p className="text-sm leading-snug text-sidebar-foreground/65">Painel administrativo</p>
        </SidebarHeader>
        <SidebarContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-5 [scrollbar-width:thin]">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/45">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        size="lg"
                        className={cn(
                          navButtonBaseClass,
                          active ? navButtonActiveClass : navButtonInactiveClass
                        )}
                      >
                        <Icon className="shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-3 border-t border-sidebar-border p-4">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'h-11 w-full justify-start gap-2 border-zinc-600/90 bg-zinc-950/50 text-zinc-100 hover:bg-zinc-800/80 hover:text-white'
            )}
          >
            <ExternalLink className="size-4 shrink-0" />
            Ver site
          </Link>
          <form action={signOutAction} className="w-full">
            <Button
              type="submit"
              variant="secondary"
              size="default"
              className="h-11 w-full justify-start gap-2 border border-zinc-700/80 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            >
              <LogOut className="size-4 shrink-0" />
              Sair
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="relative isolate z-0 min-h-svh min-w-0 flex-1 overflow-x-hidden bg-zinc-950 text-zinc-100 [color-scheme:dark] md:min-w-0">
        <header className="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-zinc-700/90 bg-zinc-900/95 px-3 py-3 shadow-md backdrop-blur-md sm:px-5">
          <SidebarTrigger
            className="size-10 shrink-0 text-zinc-200 hover:bg-zinc-800 hover:text-white md:size-9"
            aria-label="Abrir ou fechar menu"
          />
          <AdminBreadcrumbs />
        </header>
        <div className="mx-auto w-full max-w-[1600px] flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 md:px-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
