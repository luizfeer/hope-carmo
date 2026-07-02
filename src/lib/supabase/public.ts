import { createClient } from '@supabase/supabase-js';

/**
 * Cliente anon para SSR público (sem cookies de sessão).
 * Retorna `null` quando as env vars não estão presentes (ex.: build sem
 * Supabase configurado) em vez de lançar — quem chama decide o fallback.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}
