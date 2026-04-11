import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/safe-redirect';

/**
 * Confirmação de e-mail (PKCE com token_hash + type).
 * No dashboard: edite o template "Confirm signup" para apontar para:
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/admin
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeNextPath(searchParams.get('next'), '/admin');

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error', origin));
}
