'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

/**
 * Magic link / alguns redirects do Supabase devolvem tokens no fragmento (#access_token=…),
 * que o servidor não recebe. Este componente lê o hash no cliente, grava a sessão nos cookies
 * (via @supabase/ssr) e redireciona.
 *
 * Preferível no dashboard: fluxo PKCE com redirect para /auth/callback?code=… (sem hash).
 */
export function SupabaseImplicitHashHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (typeof window === 'undefined') return;

    /** PKCE na query: link de e-mail pode abrir `/?code=` (Site URL) em vez de `/auth/callback`. */
    const q = new URLSearchParams(window.location.search);
    if (q.has('code') && pathname === '/') {
      if (!q.has('next')) q.set('next', '/auth/update-password');
      ran.current = true;
      router.replace(`/auth/callback?${q.toString()}`);
      return;
    }

    const raw = window.location.hash.replace(/^#/, '');
    if (!raw.includes('access_token')) return;

    const params = new URLSearchParams(raw);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');

    if (!access_token || !refresh_token) return;

    ran.current = true;

    const clean = pathname + (window.location.search || '');
    window.history.replaceState(null, '', clean);

    const supabase = createClient();

    void (async () => {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        router.replace('/auth/auth-code-error');
        return;
      }

      if (type === 'recovery') {
        router.replace('/auth/update-password');
      } else {
        router.replace('/admin');
      }
      router.refresh();
    })();
  }, [router, pathname]);

  return null;
}
