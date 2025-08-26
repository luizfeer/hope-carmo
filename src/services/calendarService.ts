import { CalendarEvent, ICalEvent } from '../types/calendar';
import { fetchGoogleCalendarEvents, isGoogleCalendarApiConfigured } from './googleCalendarApi';
import { API_CONFIG, getProxyUrl } from '../config/api';

// Cache simples para evitar múltiplas chamadas
let cacheData: string | null = null;
let cachePromise: Promise<string> | null = null;

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
      // CORREÇÃO: Manter o TZID para parse correto
      if (line.includes('TZID=')) {
        // Formato: DTSTART;TZID=America/Sao_Paulo:20250822T200000
        // Manter a linha completa para parse correto do timezone
        currentEvent.dtstart = line.substring(line.indexOf(';') + 1);
      } else if (line.includes('VALUE=DATE:')) {
        // Formato: DTSTART;VALUE=DATE:20251119
        currentEvent.dtstart = line.split(':')[1];
      } else {
        // Formato: DTSTART:20250822T200000Z
        currentEvent.dtstart = line.substring(line.indexOf(':') + 1);
      }
    } else if (inEvent && line.startsWith('DTEND')) {
      // CORREÇÃO: Manter o TZID para parse correto
      if (line.includes('TZID=')) {
        // Formato: DTEND;TZID=America/Sao_Paulo:20250822T220000
        // Manter a linha completa para parse correto do timezone
        currentEvent.dtend = line.substring(line.indexOf(';') + 1);
      } else if (line.includes('VALUE=DATE:')) {
        // Formato: DTEND;VALUE=DATE:20251120
        currentEvent.dtend = line.split(':')[1];
      } else {
        // Formato: DTEND:20250822T220000Z
        currentEvent.dtend = line.substring(line.indexOf(':') + 1);
      }
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
    // CORREÇÃO: Tratar timezone corretamente
    // Verificar se tem timezone específico (TZID=America/Sao_Paulo)
    if (dateStr.includes('TZID=')) {
      // Formato: DTSTART;TZID=America/Sao_Paulo:20250822T200000
      const timezoneMatch = dateStr.match(/TZID=([^:]+):(.+)/);
      if (timezoneMatch) {
        const timezone = timezoneMatch[1]; // America/Sao_Paulo
        const dateTimeStr = timezoneMatch[2]; // 20250822T200000
        
        // Parse da data/hora
        const year = parseInt(dateTimeStr.substring(0, 4));
        const month = parseInt(dateTimeStr.substring(4, 6)) - 1;
        const day = parseInt(dateTimeStr.substring(6, 8));
        const hour = parseInt(dateTimeStr.substring(9, 11));
        const minute = parseInt(dateTimeStr.substring(11, 13));
        const second = parseInt(dateTimeStr.substring(13, 15));
        
        // Validar valores
        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
          throw new Error('Valores de data inválidos');
        }
        
                 // Para America/Sao_Paulo (GMT-3), criar data local
         // O JavaScript já interpreta como timezone local
         const date = new Date(year, month, day, hour, minute, second);
         
         // CORREÇÃO: Forçar o horário correto para America/Sao_Paulo
         // Como o iCal já está em GMT-3, não precisamos converter
         // Apenas garantir que o horário seja interpretado corretamente
        
        if (isNaN(date.getTime())) {
          throw new Error('Data com timezone inválida criada');
        }
        
                 console.log('DEBUG - Parse com timezone:', {
           original: dateStr,
           timezone,
           parsed: date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
           hour: date.getHours(),
           expectedHour: hour,
           dateString: date.toString(),
           toLocaleTime: date.toLocaleTimeString('pt-BR', { 
             hour: '2-digit', 
             minute: '2-digit',
             hour12: false 
           })
         });
        
        return date;
      }
    }
    
    // Remover caracteres especiais e espaços para outros formatos
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
  
  console.log('DEBUG - Parse das datas do iCal:', {
    dtstart: event.dtstart,
    dtend: event.dtend,
    parsedStart: startDate.toLocaleDateString('pt-BR'),
    parsedEnd: endDate.toLocaleDateString('pt-BR'),
    rrule: event.rrule
  });
  
  
  
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
      
      const targetDay = dayMap[dayOfWeek]; // 5 = Sexta-feira
      const now = new Date();
      
      // CORREÇÃO: Calcular as próximas ocorrências corretamente
      let currentDate: Date;
      
      console.log('DEBUG - Datas originais:', {
        originalStart: startDate.toLocaleDateString('pt-BR'),
        originalEnd: endDate.toLocaleDateString('pt-BR'),
        now: now.toLocaleDateString('pt-BR'),
        targetDay,
        dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      });
      
      if (startDate < now) {
        // Se a data original já passou, calcular a partir de hoje
        currentDate = new Date(now);
        
        // Encontrar a próxima sexta-feira
        const daysUntilFriday = (targetDay - currentDate.getDay() + 7) % 7;
        if (daysUntilFriday === 0) {
          // Hoje já é sexta, ir para a próxima sexta
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          currentDate.setDate(currentDate.getDate() + daysUntilFriday);
        }
        
        console.log('DEBUG - Calculando a partir de hoje:', {
          daysUntilFriday,
          calculatedDate: currentDate.toLocaleDateString('pt-BR'),
          dayOfWeek: currentDate.getDay()
        });
      } else {
        // Se a data original ainda não passou, usar ela
        currentDate = new Date(startDate);
        console.log('DEBUG - Usando data original:', currentDate.toLocaleDateString('pt-BR'));
      }
      
      const endLimit = new Date();
      endLimit.setMonth(endLimit.getMonth() + monthsAhead);
      
      let eventCount = 0;
      const maxRecurringEvents = 2; // Limitar a 2 eventos recorrentes
      
      // CORREÇÃO: Gerar eventos semanais corretamente
      while (currentDate <= endLimit && eventCount < maxRecurringEvents) {
        // IMPORTANTE: Criar uma cópia da data para evitar mutação
        const eventStartDate = new Date(currentDate);
        const eventEndDate = new Date(currentDate);
        
        // CORREÇÃO: Definir o horário correto para ambos
        eventStartDate.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
        eventEndDate.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());
        
        console.log(`DEBUG - Gerando evento recorrente ${eventCount + 1}:`, {
          startDate: eventStartDate.toLocaleDateString('pt-BR'),
          endDate: eventEndDate.toLocaleDateString('pt-BR'),
          dayOfWeek: eventStartDate.getDay(),
          targetDay
        });
        
        const calendarEvent = convertToCalendarEvent(event, eventStartDate, eventEndDate);
        if (calendarEvent) {
          events.push(calendarEvent);
          eventCount++;
        }
        
        // Avançar para a próxima semana (7 dias)
        currentDate.setDate(currentDate.getDate() + 7);
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
    
         // DEBUG: Verificar o que está acontecendo com o horário
         console.log('DEBUG - convertToCalendarEvent:', {
           startDate: startDate.toString(),
           startDateHours: startDate.getHours(),
           startDateMinutes: startDate.getMinutes(),
           toLocaleTime: startDate.toLocaleTimeString('pt-BR', { 
             hour: '2-digit', 
             minute: '2-digit',
             hour12: false,
             timeZone: 'America/Sao_Paulo'
           })
         });
         
         const calendarEvent = {
       id: icalEvent.uid,
       title,
       date: startDate.toLocaleDateString('pt-BR').split('/').reverse().join('-'),
               time: startDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Sao_Paulo'
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
  // Se já há dados em cache, retornar
  if (cacheData) {
    console.log('Usando cache existente');
    return cacheData;
  }
  
  // Se já há uma requisição em andamento, aguardar
  if (cachePromise) {
    console.log('Aguardando requisição em andamento...');
    return await cachePromise;
  }
  
  // Criar nova requisição
  console.log('Iniciando nova requisição...');
  cachePromise = performFetch();
  
  try {
    const data = await cachePromise;
    cacheData = data;
    return data;
  } finally {
    cachePromise = null;
  }
}

// Função interna para realizar a busca
async function performFetch(): Promise<string> {
  // Tentar primeiro com proxies
  for (const proxy of API_CONFIG.CORS_PROXIES) {
    try {
      const proxyUrl = getProxyUrl(proxy, API_CONFIG.ICAL_URL);
      console.log(`Tentando proxy: ${proxyUrl.substring(0, 50)}...`);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; HopeCarmo/1.0)',
        },
        signal: AbortSignal.timeout(API_CONFIG.REQUEST_TIMEOUT),
      });
      
      if (response.ok) {
        const data = await response.text();
        // Verificar se os dados parecem ser um iCal válido
        if (data.includes('BEGIN:VCALENDAR') && data.includes('END:VCALENDAR')) {
          console.log('Proxy funcionou:', proxyUrl.substring(0, 50));
          return data;
        } else {
          console.warn('Proxy retornou dados inválidos:', data.substring(0, 100));
        }
      }
    } catch (error) {
      console.warn(`Proxy ${proxy.substring(0, 30)} falhou:`, error);
      continue;
    }
  }
  
  // Se todos os proxies falharem, tentar acesso direto (pode funcionar em alguns casos)
  try {
    console.log('Tentando acesso direto ao Google Calendar...');
    const response = await fetch(API_CONFIG.ICAL_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; HopeCarmo/1.0)',
      },
      signal: AbortSignal.timeout(API_CONFIG.REQUEST_TIMEOUT),
    });
    
    if (response.ok) {
      const data = await response.text();
      if (data.includes('BEGIN:VCALENDAR')) {
        console.log('Acesso direto funcionou!');
        return data;
      }
    }
  } catch (error) {
    console.warn('Acesso direto falhou:', error);
  }
  
  throw new Error('Não foi possível acessar o calendário. Todos os métodos falharam. Verifique sua conexão com a internet.');
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

// Função para limpar cache (usada pelo botão atualizar)
export function clearCache(): void {
  cacheData = null;
  cachePromise = null;
  console.log('Cache limpo - forçando nova busca');
}

// Função principal para buscar eventos
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    // Primeiro, tentar usar a Google Calendar API (mais confiável)
    if (isGoogleCalendarApiConfigured()) {
      console.log('Tentando usar Google Calendar API...');
      try {
        const events = await fetchGoogleCalendarEvents();
        console.log(`Google Calendar API funcionou: ${events.length} eventos encontrados`);
        return events;
      } catch (apiError) {
        console.warn('Google Calendar API falhou, tentando iCal...', apiError);
      }
    }

    // Fallback para iCal com múltiplos proxies
    console.log('Usando método iCal com proxies...');
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
