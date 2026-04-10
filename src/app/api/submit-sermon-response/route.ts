import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { request as httpsRequest } from 'node:https';
import { stringify } from 'node:querystring';

const TURNSTILE_SECRET    = process.env.TURNSTILE_SECRET_KEY        ?? '';
const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** Verifica o token do Turnstile usando node:https — bypassa o fetch patchado pelo Next.js */
function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const payload = stringify({
      secret:   TURNSTILE_SECRET,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const req = httpsRequest(
      {
        hostname: 'challenges.cloudflare.com',
        path:     '/turnstile/v1/siteverify',
        method:   'POST',
        headers:  {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
        res.on('end', () => {
          try {
            const json = JSON.parse(raw) as { success: boolean; 'error-codes'?: string[] };
            if (!json.success) {
              console.error('[sermon] Turnstile rejected:', json['error-codes']);
            }
            resolve(json.success === true);
          } catch {
            reject(new Error(`Turnstile resposta inválida: ${raw.slice(0, 120)}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export async function POST(req: NextRequest) {
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

  if (!turnstileToken) {
    return jsonError('Token de segurança ausente.', 400);
  }

  // ── Verifica Turnstile via node:https (sem fetch patchado) ────────────────
  try {
    const ip      = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const success = await verifyTurnstile(turnstileToken, ip);
    if (!success) {
      return jsonError('Verificação de segurança falhou. Atualize a página e tente novamente.', 400);
    }
  } catch (err) {
    console.error('[sermon] Turnstile error:', err);
    return jsonError('Erro ao verificar segurança. Tente novamente.', 500);
  }

  // ── Salva no Supabase ─────────────────────────────────────────────────────
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
