import { CalendarEvent, ICalEvent } from '../types/calendar';

// URLs para buscar o iCal
const ICAL_URL = 'https://calendar.google.com/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const LOCAL_PROXY = '/api/ical/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics';

// Função para fazer parse do iCal
function parseICal(icalData: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalData.split('\n');
  
  let currentEvent: Partial<ICalEvent> = {};
  let inEvent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (inEvent && currentEvent.uid && currentEvent.summary) {
        events.push(currentEvent as ICalEvent);
      }
      inEvent = false;
    } else if (inEvent && line.startsWith('UID:')) {
      currentEvent.uid = line.substring(4);
    } else if (inEvent && line.startsWith('SUMMARY:')) {
      currentEvent.summary = line.substring(8);
    } else if (inEvent && line.startsWith('DTSTART')) {
      let dateStr = '';
      if (line.includes('TZID=')) {
        // Formato: DTSTART;TZID=America/Sao_Paulo:20250822T200000
        dateStr = line.split(':')[1];
      } else if (line.includes('VALUE=DATE:')) {
        // Formato: DTSTART;VALUE=DATE:20251119
        dateStr = line.split(':')[1];
      } else {
        // Formato: DTSTART:20250822T200000Z
        dateStr = line.substring(line.indexOf(':') + 1);
      }
      currentEvent.dtstart = dateStr;
    } else if (inEvent && line.startsWith('DTEND')) {
      let dateStr = '';
      if (line.includes('TZID=')) {
        // Formato: DTEND;TZID=America/Sao_Paulo:20250822T220000
        dateStr = line.split(':')[1];
      } else if (line.includes('VALUE=DATE:')) {
        // Formato: DTEND;VALUE=DATE:20251120
        dateStr = line.split(':')[1];
      } else {
        // Formato: DTEND:20250822T220000Z
        dateStr = line.substring(line.indexOf(':') + 1);
      }
      currentEvent.dtend = dateStr;
    } else if (inEvent && line.startsWith('LOCATION:')) {
      currentEvent.location = line.substring(9);
    } else if (inEvent && line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.substring(12);
    } else if (inEvent && line.startsWith('RRULE:')) {
      currentEvent.rrule = line.substring(6);
    }
  }
  
  console.log('Total de eventos parseados:', events.length);
  return events;
}

// Função para converter data do iCal para Date
function parseICalDate(dateStr: string): Date {
  try {
    // Remover caracteres especiais e espaços
    const cleanDateStr = dateStr.replace(/[^0-9TZ]/g, '');
    
    // Verificar se é uma data UTC (termina com Z)
    if (cleanDateStr.endsWith('Z')) {
      // Formato: 20250822T200000Z
      const year = parseInt(cleanDateStr.substring(0, 4));
      const month = parseInt(cleanDateStr.substring(4, 6)) - 1;
      const day = parseInt(cleanDateStr.substring(6, 8));
      const hour = parseInt(cleanDateStr.substring(9, 11));
      const minute = parseInt(cleanDateStr.substring(11, 13));
      const second = parseInt(cleanDateStr.substring(13, 15));
      
      // Validar se os valores são válidos
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        throw new Error('Valores de data inválidos');
      }
      
      // Criar data usando UTC
      const date = new Date(Date.UTC(year, month, day, hour, minute, second));
      
      if (isNaN(date.getTime())) {
        throw new Error('Data UTC inválida criada');
      }
      
      return date;
    } else if (cleanDateStr.includes('T')) {
      // Formato: 20250822T200000 (com T, sem Z)
      const year = parseInt(cleanDateStr.substring(0, 4));
      const month = parseInt(cleanDateStr.substring(4, 6)) - 1;
      const day = parseInt(cleanDateStr.substring(6, 8));
      const hour = parseInt(cleanDateStr.substring(9, 11));
      const minute = parseInt(cleanDateStr.substring(11, 13));
      const second = parseInt(cleanDateStr.substring(13, 15));
      
      // Validar se os valores são válidos
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        throw new Error('Valores de data inválidos');
      }
      
      // Criar data local
      const date = new Date(year, month, day, hour, minute, second);
      
      if (isNaN(date.getTime())) {
        throw new Error('Data local inválida criada');
      }
      
      return date;
    } else {
      // Formato: 20251119 (apenas data, sem hora)
      const year = parseInt(cleanDateStr.substring(0, 4));
      const month = parseInt(cleanDateStr.substring(4, 6)) - 1;
      const day = parseInt(cleanDateStr.substring(6, 8));
      
      // Validar se os valores são válidos
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error('Valores de data inválidos');
      }
      
      // Criar data local (meia-noite)
      const date = new Date(year, month, day, 0, 0, 0);
      
      if (isNaN(date.getTime())) {
        throw new Error('Data inválida criada');
      }
      
      return date;
    }
  } catch (error) {
    console.error('Erro ao fazer parse da data:', dateStr, error);
    // Retornar data atual como fallback
    return new Date();
  }
}

// Função para gerar eventos recorrentes
function generateRecurringEvents(event: ICalEvent, monthsAhead: number = 3): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const startDate = parseICalDate(event.dtstart);
  const endDate = parseICalDate(event.dtend);
  
  if (!event.rrule) {
    // Evento único
    const calendarEvent = convertToCalendarEvent(event, startDate, endDate);
    if (calendarEvent) {
      events.push(calendarEvent);
    }
    return events;
  }
  
  // Processar regra de recorrência (RRULE)
  const rrule = event.rrule;
  if (rrule.includes('FREQ=WEEKLY')) {
    const byDayMatch = rrule.match(/BYDAY=([A-Z]{2})/);
    if (byDayMatch) {
      const dayOfWeek = byDayMatch[1];
      const dayMap: { [key: string]: number } = {
        'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 0
      };
      
      const targetDay = dayMap[dayOfWeek];
      const currentDate = new Date(startDate);
      const endLimit = new Date();
      endLimit.setMonth(endLimit.getMonth() + monthsAhead);
      
      let eventCount = 0;
      const maxRecurringEvents = 2; // Limitar a 2 eventos recorrentes
      
      while (currentDate <= endLimit && eventCount < maxRecurringEvents) {
        if (currentDate.getDay() === targetDay) {
          const eventEndDate = new Date(currentDate);
          eventEndDate.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());
          
          const calendarEvent = convertToCalendarEvent(event, currentDate, eventEndDate);
          if (calendarEvent) {
            events.push(calendarEvent);
            eventCount++;
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }
  
  return events;
}

// Função para converter ICalEvent para CalendarEvent
function convertToCalendarEvent(icalEvent: ICalEvent, startDate: Date, endDate: Date): CalendarEvent | null {
  try {
    const now = new Date();
    if (startDate < now) {
      return null; // Não mostrar eventos passados
    }
    
    const title = icalEvent.summary || 'Evento Hope';
    const location = icalEvent.location || 'IPI Carmo do Rio Claro';
    const description = icalEvent.description || 'Encontro semanal com louvor, comunhão e reflexões bíblicas';
    
    // Determinar o tipo do evento baseado no título
    let type: 'Encontro Regular' | 'Evento Especial' | 'Reunião' = 'Encontro Regular';
    if (title.toLowerCase().includes('reunião')) {
      type = 'Reunião';
    } else if (title.toLowerCase().includes('intensivão') || title.toLowerCase().includes('especial')) {
      type = 'Evento Especial';
    }
    
    // Validar se as datas são válidas antes de usar toISOString
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Datas inválidas para evento:', icalEvent);
      return null;
    }
    
    const calendarEvent = {
      id: icalEvent.uid,
      title,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      location,
      description,
      type,
      startDate,
      endDate,
      isRecurring: !!icalEvent.rrule,
      recurrenceRule: icalEvent.rrule
    };
    
    return calendarEvent;
  } catch (error) {
    console.error('Erro ao converter evento:', icalEvent, error);
    return null;
  }
}

// Função para tentar buscar dados do iCal usando diferentes métodos
async function fetchICalData(): Promise<string> {
  const methods = [
    // Método 1: Proxy local do Vite
    () => fetch(LOCAL_PROXY),
    // Método 2: Proxy CORS externo
    () => fetch(`${CORS_PROXY}${encodeURIComponent(ICAL_URL)}`),
    // Método 3: Tentativa direta (pode falhar por CORS)
    () => fetch(ICAL_URL)
  ];

  for (const method of methods) {
    try {
      const response = await method();
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.warn('Método de busca falhou, tentando próximo...', error);
      continue;
    }
  }
  
  throw new Error('Todos os métodos de busca falharam');
}

// Função para verificar se o evento tem duração significativa
export function hasSignificantDuration(event: CalendarEvent): boolean {
  const durationMs = event.endDate.getTime() - event.startDate.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  return durationMinutes > 5; // Considera significativo se durar mais de 5 minutos
}

// Função para gerar URL do Google Calendar
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  try {
    // Formatar datas para o formato do Google Calendar (YYYYMMDDTHHMMSSZ)
    const startDate = event.startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = event.endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    // Codificar parâmetros
    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.location.replace(/\\/g, ''));
    const description = encodeURIComponent(event.description);
    
    // Gerar URL do Google Calendar
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}&location=${location}`;
  } catch (error) {
    console.error('Erro ao gerar URL do Google Calendar:', error);
    return '';
  }
}

// Função principal para buscar eventos
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const icalData = await fetchICalData();
    const icalEvents = parseICal(icalData);
    
    const allEvents: CalendarEvent[] = [];
    
    for (const icalEvent of icalEvents) {
      const events = generateRecurringEvents(icalEvent);
      allEvents.push(...events);
    }
    
    // Ordenar por data
    return allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
  } catch (error) {
    console.error('Erro ao buscar eventos do calendário:', error);
    return [];
  }
}
