import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Roda no servidor — as variáveis sem NEXT_PUBLIC_ ficam privadas
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { turnstileToken, question_1, question_2, question_3 } = body;

    // --- Verifica Cloudflare Turnstile (Secret Key) ---
    const form = new FormData();
    form.append('secret', TURNSTILE_SECRET);
    form.append('response', turnstileToken ?? '');
    // Opcional: envia o IP do cliente para validação extra
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
    if (ip) form.append('remoteip', ip);

    const cfRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v1/siteverify',
      { method: 'POST', body: form }
    );
    const cfData = await cfRes.json();

    if (!cfData.success) {
      return NextResponse.json(
        { error: 'Verificação de segurança falhou. Atualize a página e tente novamente.' },
        { status: 400 }
      );
    }

    // --- Salva no Supabase com Service Role (bypass RLS) ---
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error } = await supabase.from('sermon_responses').insert({
      series_slug: 'convictos-2026',
      question_1: question_1 || null,
      question_2: question_2 || null,
      question_3: question_3 || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
