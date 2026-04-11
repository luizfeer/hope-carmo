import { NewsEditorForm } from '@/app/admin/(dash)/news/_components/NewsEditorForm';

export default function AdminNewsNewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nova notícia</h1>
      <NewsEditorForm />
    </div>
  );
}
