import { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../types/calendar';
import { fetchCalendarEvents, clearCache } from '../services/calendarService';

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useCalendarEvents(): UseCalendarEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasRun = useRef(false); // SOLUÇÃO SIMPLES: useRef para controlar execução

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando eventos do calendário...');
      
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
      setLastUpdated(new Date());
      
      console.log(`Eventos carregados com sucesso: ${calendarEvents.length} eventos encontrados`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      setError(errorMessage);
      console.error('Erro no hook useCalendarEvents:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    clearCache(); // Limpar cache antes de buscar novamente
    await fetchEvents();
  };

  useEffect(() => {
    // SOLUÇÃO SIMPLES: Executar apenas uma vez
    if (!hasRun.current) {
      hasRun.current = true;
      fetchEvents();
    }
  }, []); // Array vazio = executa apenas uma vez

  return {
    events,
    loading,
    error,
    refetch,
    lastUpdated
  };
}
