import { VideoEditorForm } from '@/app/admin/(dash)/videos/_components/VideoEditorForm';

export default function AdminVideoNewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Novo vídeo</h1>
      <VideoEditorForm />
    </div>
  );
}
