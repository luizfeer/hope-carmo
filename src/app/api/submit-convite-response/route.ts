import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { request as httpsRequest } from 'node:https';
import { CONVITE_SERIES_PREFIX } from '@/data/convite';

const TURNSTILE_SECRET     = process.env.TURNSTILE_SECRET_KEY       ?? '';
const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL   ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? '';

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** Verifica o token do Turnstile via node:https (mesmo padrão de submit-sermon-response). */
function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      secret:   TURNSTILE_SECRET,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const req = httpsRequest(
      {
        hostname: 'challenges.cloudflare.com',
        path:     '/turnstile/v0/siteverify',
        method:   'POST',
        headers:  {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
        res.on('end', () => {
          try {
            const json = JSON.parse(raw) as { success: boolean; 'error-codes'?: string[] };
            if (!json.success) console.error('[convite] Turnstile rejected:', json['error-codes']);
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

/** Só letras/números/hífen, minúsculo, curto — mesmo critério do front. */
function limparPonto(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const p = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 24);
  return p || null;
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[convite] Env vars do Supabase ausentes');
    return jsonError('Configuração do servidor incompleta.', 500);
  }
  if (!TURNSTILE_SECRET) {
    console.error('[convite] TURNSTILE_SECRET_KEY ausente');
    return jsonError('Configuração do servidor incompleta.', 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Body inválido.', 400);
  }

  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const escolha  = typeof body.escolha === 'string' ? body.escolha.slice(0, 80) : null;
  const mensagem = typeof body.mensagem === 'string' ? body.mensagem.trim().slice(0, 2000) : '';
  const ponto    = limparPonto(body.ponto);

  if (!turnstileToken) {
    return jsonError('Token de segurança ausente.', 400);
  }
  if (!mensagem) {
    return jsonError('Escreva alguma coisa antes de enviar.', 400);
  }

  try {
    const ip      = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const success = await verifyTurnstile(turnstileToken, ip);
    if (!success) {
      return jsonError('Verificação de segurança falhou. Atualize a página e tente novamente.', 400);
    }
  } catch (err) {
    console.error('[convite] Turnstile error:', err);
    return jsonError('Erro ao verificar segurança. Tente novamente.', 500);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // Reusa a tabela sermon_responses: o slug identifica campanha + ponto do
    // cartaz, então o painel /admin/responses filtra por ponto da cidade.
    const { error } = await supabase.from('sermon_responses').insert({
      series_slug: ponto ? `${CONVITE_SERIES_PREFIX}-${ponto}` : CONVITE_SERIES_PREFIX,
      question_1:  escolha ? `Marcou que procura: ${escolha}` : null,
      question_2:  mensagem,
      question_3:  null,
    });

    if (error) {
      console.error('[convite] Supabase insert error:', error);
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[convite] Unexpected error:', err);
    return jsonError('Erro interno ao salvar.', 500);
  }
}
