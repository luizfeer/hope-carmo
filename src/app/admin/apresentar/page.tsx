import { createClient } from '@/lib/supabase/server';
import { ApresentarClient } from './ApresentarClient';

const Q_LABELS = [
  { key: 'question_1' as const, label: 'Qual dúvida sobre a fé você nunca teve coragem de fazer em voz alta?' },
  { key: 'question_2' as const, label: 'Já teve um momento em que quis desistir de crer? O que aconteceu?' },
  { key: 'question_3' as const, label: 'O que mais te ajudou a continuar crendo — ou o que você ainda está procurando?' },
];

export default async function ApresentarPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('sermon_responses')
    .select('id, series_slug, question_1, question_2, question_3, created_at')
    .order('created_at', { ascending: false });

  const slides = (rows ?? []).flatMap((row) =>
    Q_LABELS.flatMap(({ key, label }) => {
      const text = row[key];
      if (!text?.trim()) return [];
      return [{ id: `${row.id}-${key}`, question: label, answer: text, series: row.series_slug ?? '' }];
    }),
  );

  return <ApresentarClient slides={slides} />;
}
