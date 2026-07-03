/**
 * INTENSIVÃO — ESPERANÇA NA CRUZ (27/07 – 01/08)
 *
 * Edite este arquivo para atualizar a divulgação:
 *  - fotos: coloque os arquivos em /public/img/intensivao/ e liste aqui
 *  - videoUrl: link do YouTube (embed automático) — deixe null para mostrar "em breve"
 *  - imprensa: matérias publicadas sobre o Intensivão
 */

export const INTENSIVAO = {
  titulo: 'Esperança na Cruz',
  datas: '27/07 — 01/08',
  ano: 2026,
  /** Todos os encontros começam às 20h. */
  hora: '20h',
} as const;

/** Links do Google Maps dos locais fixos. */
export const MAPS = {
  igreja: 'https://maps.app.goo.gl/jP35DENMcRJQFkD29',
  auditorio: 'https://maps.app.goo.gl/XrCatdo5rTm9qf7g6',
} as const;

export interface DiaProgramacao {
  diaSemana: string;
  data: string;
  titulo: string;
  local: string;
  /** Link do mapa (ausente quando é "nos lares", sem endereço fixo). */
  mapsUrl?: string;
  destaque?: boolean;
}

export const PROGRAMACAO: DiaProgramacao[] = [
  { diaSemana: 'SEG', data: '27/07', titulo: 'Nos Lares', local: 'Casas de membros' },
  { diaSemana: 'TER', data: '28/07', titulo: 'Nos Lares', local: 'Casas de membros' },
  { diaSemana: 'QUA', data: '29/07', titulo: 'Nos Lares', local: 'Casas de membros' },
  { diaSemana: 'QUI', data: '30/07', titulo: 'Sala de Oração', local: 'Igreja', mapsUrl: MAPS.igreja },
  { diaSemana: 'SEX', data: '31/07', titulo: 'Hope', local: 'Igreja', mapsUrl: MAPS.igreja },
  {
    diaSemana: 'SÁB',
    data: '01/08',
    titulo: 'Encerramento',
    local: 'Auditório Municipal',
    mapsUrl: MAPS.auditorio,
    destaque: true,
  },
];

/* ---------- Adicionar à agenda (Google Calendar / .ics) ---------- */

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Início 20h no horário de Brasília (UTC−3) → 23:00 UTC. Duração 2h.
 * Retorna as datas no formato UTC compacto usado por Google Calendar e iCal.
 */
function eventRange(data: string): { start: string; end: string } {
  const [dia, mes] = data.split('/').map(Number);
  const startUtc = new Date(Date.UTC(INTENSIVAO.ano, mes - 1, dia, 23, 0, 0));
  const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours(),
    )}${pad(d.getUTCMinutes())}00Z`;
  return { start: fmt(startUtc), end: fmt(endUtc) };
}

/** Link "adicionar ao Google Agenda" para um dia. */
export function googleCalUrl(dia: DiaProgramacao): string {
  const { start, end } = eventRange(dia.data);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Intensivão Hope — ${dia.titulo}`,
    dates: `${start}/${end}`,
    details: `Intensivão "${INTENSIVAO.titulo}" · ${dia.titulo}. Começa às ${INTENSIVAO.hora}.`,
    location: dia.local,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Gera um arquivo .ics (Apple/Outlook/Google) com os dias informados. */
export function buildIcs(dias: DiaProgramacao[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hope Carmo//Intensivao//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const dia of dias) {
    const { start, end } = eventRange(dia.data);
    lines.push(
      'BEGIN:VEVENT',
      `UID:intensivao-${INTENSIVAO.ano}-${dia.data.replace('/', '')}@hopecarmo`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:Intensivão Hope — ${dia.titulo}`,
      `LOCATION:${dia.local}`,
      `DESCRIPTION:Intensivão ${INTENSIVAO.titulo}. Começa às ${INTENSIVAO.hora}.`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** data: URI pronta para um link de download do .ics (sem precisar de JS). */
export function icsDataUri(dias: DiaProgramacao[]): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(dias))}`;
}

export interface FotoIntensivao {
  src: string;
  alt: string;
}

/**
 * Fotos do ano passado (Intensivão 2025).
 * Ficam em /public/img/intensivao/2025/ (já comprimidas).
 * Para adicionar/remover, é só editar esta lista.
 */
export const FOTOS_2025: FotoIntensivao[] = Array.from({ length: 15 }, (_, i) => ({
  src: `/img/intensivao/2025/foto-${String(i + 1).padStart(2, '0')}.webp`,
  alt: `Intensivão 2025 — foto ${i + 1}`,
}));

/**
 * Fotos deste ano — preencha durante/depois da semana.
 * Enquanto estiver vazio, a aba "2026" não aparece no slider.
 */
export const FOTOS_2026: FotoIntensivao[] = [];

/**
 * Vídeo de divulgação / aftermovie.
 * Aceita link normal do YouTube (watch?v=... ou youtu.be/...).
 * null = mostra o placeholder "EM BREVE".
 */
export const VIDEO_URL: string | null =
  'https://www.youtube.com/watch?v=achLvhrC6iA';

export interface MateriaImprensa {
  veiculo: string;
  titulo: string;
  data: string;
  url: string;
}

/**
 * Matérias na imprensa da cidade sobre o Intensivão.
 * EXEMPLOS abaixo — troque pelos links reais. Se deixar o array
 * vazio, a seção mostra um aviso de "em breve".
 */
export const IMPRENSA: MateriaImprensa[] = [
  {
    veiculo: 'Portal Onda Sul',
    titulo: 'Juventude em movimento: HOPE leva esperança e lota auditório em Carmo do Rio Claro',
    data: '03/08/2025',
    url: 'https://www.portalondasul.com.br/na-noite-deste-sabado-2-de-agosto-o-auditorio-municipal-de-carmo-do-rio-claro-recebeu-o-encerramento-do-intensivao-do-hope/',
  },
];
