import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VideoEditorForm } from '@/app/admin/(dash)/videos/_components/VideoEditorForm';
import type { VideoItem } from '@/types/cms';

type Props = { params: Promise<{ id: string }> };

export default async function AdminVideoEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('video_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar vídeo</h1>
      <VideoEditorForm initial={data as VideoItem} />
    </div>
  );
}
