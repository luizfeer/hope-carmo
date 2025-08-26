// Configurações de API
export const API_CONFIG = {
  // Google Calendar API
  GOOGLE_CALENDAR: {
    CALENDAR_ID: '53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91@group.calendar.google.com',
    // Para usar a Google Calendar API, você precisa:
    // 1. Ir para https://console.cloud.google.com/
    // 2. Criar um projeto
    // 3. Habilitar a Google Calendar API
    // 4. Criar uma API Key
    // 5. Substituir a chave abaixo
    API_KEY: 'DISABLED_FOR_PUBLIC_SITE', // Desabilitado para desenvolvimento e produção
  },
  
  // iCal URL
  ICAL_URL: 'https://calendar.google.com/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics',
  
  // Proxies CORS (fallback)
  CORS_PROXIES: [
    // Proxy local do Vite (desenvolvimento)
    '/api/calendar/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics',
    
    // Proxies CORS externos (produção)
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?',
  ],
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 segundos
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

// Função para verificar se a Google Calendar API está configurada
export function isGoogleCalendarApiConfigured(): boolean {
  return API_CONFIG.GOOGLE_CALENDAR.API_KEY !== 'DISABLED_FOR_PUBLIC_SITE' && 
         API_CONFIG.GOOGLE_CALENDAR.API_KEY !== '' &&
         API_CONFIG.GOOGLE_CALENDAR.API_KEY !== undefined;
}

// Função para obter a URL completa do proxy
export function getProxyUrl(proxy: string, targetUrl: string): string {
  if (proxy.startsWith('/')) {
    // Proxy local
    return proxy;
  } else if (proxy.includes('?')) {
    // Proxy com parâmetro
    return `${proxy}${encodeURIComponent(targetUrl)}`;
  } else {
    // Proxy simples
    return `${proxy}${targetUrl}`;
  }
}
