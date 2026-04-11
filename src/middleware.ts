import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
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

  const isLogin = request.nextUrl.pathname === '/admin/login';

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
  matcher: ['/admin', '/admin/:path*', '/admin/login'],
};
