import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewsEditorForm } from '@/app/admin/(dash)/news/_components/NewsEditorForm';
import type { NewsItem } from '@/types/cms';

type Props = { params: Promise<{ id: string }> };

export default async function AdminNewsEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar notícia</h1>
      <NewsEditorForm initial={data as NewsItem} />
    </div>
  );
}
