import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  /**
   * PKCE (redefinição de senha, magic link, etc.): se a Site URL no Supabase for só o domínio,
   * o e-mail abre `/?code=…` em vez de `/auth/callback?code=…` e o código nunca é trocado por sessão.
   * Encaminhamos para a rota que faz `exchangeCodeForSession` e redireciona para `next`.
   */
  if (pathname === '/' && searchParams.has('code')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    if (!url.searchParams.has('next')) {
      url.searchParams.set('next', '/auth/update-password');
    }
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * Só o painel `/admin` exige sessão + `is_admin`.
   * O site público (`/`, `/news`, etc.) não passa por aqui com login obrigatório —
   * outras rotas nem sequer estão no `matcher`.
   */
  if (!pathname.startsWith('/admin')) {
    return supabaseResponse;
  }

  const isLogin = pathname === '/admin/login';

  if (!isLogin) {
    if (!user) {
      const u = request.nextUrl.clone();
      u.pathname = '/admin/login';
      u.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(u);
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      const u = request.nextUrl.clone();
      u.pathname = '/admin/login';
      u.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(u);
    }
  } else if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (profile?.is_admin) {
      const u = request.nextUrl.clone();
      u.pathname = '/admin';
      return NextResponse.redirect(u);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/admin', '/admin/:path*', '/admin/login'],
};
