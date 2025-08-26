import { CalendarEvent } from '../types/calendar';
import { API_CONFIG } from '../config/api';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  recurrence?: string[];
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

// Função para buscar eventos usando Google Calendar API
export async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const timeMin = now.toISOString();
    const timeMax = threeMonthsFromNow.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(API_CONFIG.GOOGLE_CALENDAR.CALENDAR_ID)}/events?` +
      `key=${API_CONFIG.GOOGLE_CALENDAR.API_KEY}&` +
      `timeMin=${encodeURIComponent(timeMin)}&` +
      `timeMax=${encodeURIComponent(timeMax)}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data: GoogleCalendarResponse = await response.json();
    
    return data.items.map(event => convertGoogleEventToCalendarEvent(event));
  } catch (error) {
    console.error('Erro ao buscar eventos via Google Calendar API:', error);
    throw error;
  }
}

// Função para converter evento do Google para nosso formato
function convertGoogleEventToCalendarEvent(event: GoogleCalendarEvent): CalendarEvent {
  const startDate = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date!);
  const endDate = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date!);
  
  // Determinar o tipo do evento baseado no título
  let type: 'Encontro Regular' | 'Evento Especial' | 'Reunião' = 'Encontro Regular';
  if (event.summary.toLowerCase().includes('reunião')) {
    type = 'Reunião';
  } else if (event.summary.toLowerCase().includes('intensivão') || event.summary.toLowerCase().includes('especial')) {
    type = 'Evento Especial';
  }

  return {
    id: event.id,
    title: event.summary || 'Evento Hope',
    date: startDate.toLocaleDateString('pt-BR').split('/').reverse().join('-'),
    time: startDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    location: event.location || 'IPI Carmo do Rio Claro',
    description: event.description || 'Encontro semanal com louvor, comunhão e reflexões bíblicas',
    type,
    startDate,
    endDate,
    isRecurring: !!event.recurrence && event.recurrence.length > 0,
    recurrenceRule: event.recurrence ? event.recurrence[0] : undefined
  };
}

// Função para verificar se a API key está configurada
export function isGoogleCalendarApiConfigured(): boolean {
  return API_CONFIG.GOOGLE_CALENDAR.API_KEY !== 'YOUR_API_KEY_HERE' && 
         API_CONFIG.GOOGLE_CALENDAR.API_KEY !== '';
}
