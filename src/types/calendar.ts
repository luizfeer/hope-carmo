export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
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
