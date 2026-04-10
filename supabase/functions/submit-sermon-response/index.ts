import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { turnstileToken, question_1, question_2, question_3 } = await req.json();

    // Verify Cloudflare Turnstile
    const formData = new FormData();
    formData.append('secret', Deno.env.get('TURNSTILE_SECRET_KEY') ?? '');
    formData.append('response', turnstileToken ?? '');

    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v1/siteverify',
      { method: 'POST', body: formData }
    );
    const turnstileData = await turnstileRes.json();

    if (!turnstileData.success) {
      return new Response(
        JSON.stringify({ error: 'Verificação de segurança falhou. Tente novamente.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabase.from('sermon_responses').insert({
      series_slug: 'convictos-2026',
      question_1: question_1 || null,
      question_2: question_2 || null,
      question_3: question_3 || null,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? 'Erro interno.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
