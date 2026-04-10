import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TURNSTILE_SECRET   = process.env.TURNSTILE_SECRET_KEY ?? '';
const SUPABASE_URL       = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Sempre retorna JSON — nunca deixa o Next.js gerar página de erro HTML */
function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  // Guarda de env vars em produção
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[sermon] Env vars do Supabase ausentes');
    return jsonError('Configuração do servidor incompleta.', 500);
  }
  if (!TURNSTILE_SECRET) {
    console.error('[sermon] TURNSTILE_SECRET_KEY ausente');
    return jsonError('Configuração do servidor incompleta.', 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Body inválido.', 400);
  }

  const { turnstileToken, question_1, question_2, question_3 } = body as {
    turnstileToken?: string;
    question_1?: string;
    question_2?: string;
    question_3?: string;
  };

  // ── Verifica Cloudflare Turnstile ────────────────────────────────────────
  if (!turnstileToken) {
    return jsonError('Token de segurança ausente.', 400);
  }

  try {
    const ip   = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
    // String literal — forma mais explícita e compatível com qualquer runtime
    const body = [
      `secret=${encodeURIComponent(TURNSTILE_SECRET)}`,
      `response=${encodeURIComponent(turnstileToken)}`,
      ...(ip ? [`remoteip=${encodeURIComponent(ip)}`] : []),
    ].join('&');

    const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const text = await cfRes.text();
    console.log('[sermon] Turnstile status:', cfRes.status, '| body:', text.slice(0, 300));

    let cfData: { success: boolean; 'error-codes'?: string[] };
    try {
      cfData = JSON.parse(text);
    } catch {
      return jsonError('Resposta inesperada do servidor de segurança.', 500);
    }

    if (!cfData.success) {
      console.error('[sermon] Turnstile rejected:', cfData['error-codes']);
      return jsonError('Verificação de segurança falhou. Atualize a página e tente novamente.', 400);
    }
  } catch (err) {
    console.error('[sermon] Turnstile fetch error:', err);
    return jsonError('Erro ao contactar servidor de segurança. Tente novamente.', 500);
  }

  // ── Salva no Supabase ────────────────────────────────────────────────────
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from('sermon_responses').insert({
      series_slug: 'convictos-2026',
      question_1:  question_1  || null,
      question_2:  question_2  || null,
      question_3:  question_3  || null,
    });

    if (error) {
      console.error('[sermon] Supabase insert error:', error);
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[sermon] Unexpected error:', err);
    return jsonError('Erro interno ao salvar.', 500);
  }
}
