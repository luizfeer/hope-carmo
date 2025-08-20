// Tipos para o sistema de calendário
// 
// MUDANÇAS RECENTES:
// - Removido proxy local que só funcionava em desenvolvimento
// - Agora usa diretamente o link do Google Calendar
// - Proxy CORS externo mantido apenas como fallback
// - Melhor tratamento de erros e feedback ao usuário

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // formato YYYY-MM-DD
  time: string; // formato HH:MM
  location: string;
  description: string;
  type: 'Encontro Regular' | 'Evento Especial' | 'Reunião';
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurrenceRule?: string;
}

export interface ICalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  location?: string;
  description?: string;
  rrule?: string;
}
