// Configurações de API
export const API_CONFIG = {
  
  // iCal URL
  ICAL_URL: 'https://calendar.google.com/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics',
  
  // Proxies CORS (fallback)
  CORS_PROXIES: [
    // Proxy próprio (produção) - PRIORIDADE MÁXIMA
    'https://calendario.ipicarmo.com.br?url=',
    
    // Proxy local do Vite (desenvolvimento)
    '/api/calendar/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics',
    
    // Proxies CORS externos (fallback)
    'https://api.codetabs.com/v1/proxy?quest=', // ✅ Funcionou!
    'https://corsproxy.io/?', // ✅ Confiável
    'https://cors.bridged.cc/?', // ✅ Novo proxy confiável
    'https://api.allorigins.win/raw?url=', // ⚠️ CORS issues
    'https://cors-anywhere.herokuapp.com/', // ⚠️ Rate limiting
    'https://thingproxy.freeboard.io/fetch/', // ❌ SSL inválido
  ],
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 segundos
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};



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
