import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [newsRes, videoRes, responseRes] = await Promise.all([
    supabase.from('news_items').select('*', { count: 'exact', head: true }),
    supabase.from('video_items').select('*', { count: 'exact', head: true }),
    supabase.from('sermon_responses').select('*', { count: 'exact', head: true }),
  ]);
  const newsCount = newsRes.count;
  const videoCount = videoRes.count;
  const responseCount = responseRes.error ? null : responseRes.count;

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Conteúdo do site (SSR) vem destas tabelas no Supabase.
        </p>
      </div>
      <div className="grid max-w-4xl gap-4 md:grid-cols-3">
        <Card className="border-zinc-700/90 bg-zinc-900/35 ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-zinc-100">Notícias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-zinc-50">{newsCount ?? 0}</p>
            <p className="text-sm text-zinc-500">registros (incluindo rascunhos)</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-700/90 bg-zinc-900/35 ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-zinc-100">Vídeos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-zinc-50">{videoCount ?? 0}</p>
            <p className="text-sm text-zinc-500">registros (incluindo rascunhos)</p>
          </CardContent>
        </Card>
        <Link href="/admin/responses" className="block rounded-xl outline-none ring-offset-2 ring-offset-zinc-950 focus-visible:ring-2 focus-visible:ring-amber-500/60">
          <Card className="h-full border-zinc-700/90 bg-zinc-900/35 ring-1 ring-white/5 transition hover:border-zinc-600 hover:bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-100">Formulário (série)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-zinc-50">
                {responseCount === null ? '—' : responseCount}
              </p>
              <p className="text-sm text-zinc-500">
                {responseCount === null
                  ? 'aplique a migração RLS para contar'
                  : 'respostas anónimas · ver detalhes'}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
