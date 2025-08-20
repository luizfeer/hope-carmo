import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types/calendar';
import { fetchCalendarEvents } from '../services/calendarService';

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCalendarEvents(): UseCalendarEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      console.error('Erro no hook useCalendarEvents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  };
}
