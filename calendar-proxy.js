// Cloudflare Worker para proxy do Google Calendar
// Deploy em: https://workers.cloudflare.com/

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Pegar a URL do calendário via parâmetro
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response(JSON.stringify({
      error: 'Parâmetro "url" é obrigatório',
      example: '?url=https://calendar.google.com/calendar/ical/...'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
  
  try {
    // Fazer requisição para a URL fornecida
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; HopeCarmo/1.0)',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.text()
    
    // Verificar se é um iCal válido
    if (!data.includes('BEGIN:VCALENDAR')) {
      throw new Error('Dados inválidos recebidos do Google Calendar')
    }
    
    // Retornar com headers CORS corretos
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
      },
    })
    
  } catch (error) {
    console.error('Erro no proxy:', error)
    
    return new Response(JSON.stringify({
      error: 'Erro ao acessar calendário',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }
}

// Handler para requisições OPTIONS (CORS preflight)
addEventListener('fetch', event => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }))
  }
})
