import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/safe-redirect';

/**
 * PKCE: troca `code` por sessão (OAuth, magic link, redefinição de senha, etc.).
 * `resetPasswordForEmail` deve usar redirectTo apontando para esta rota com
 * `?next=/auth/update-password`.
 *
 * Authentication → URL Configuration → Redirect URLs:
 * - http://localhost:3000/auth/callback
 * - https://seudominio.com/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), '/admin');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocal = process.env.NODE_ENV === 'development';
      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error', origin));
}
