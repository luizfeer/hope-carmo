# Configuração de APIs - Hope Carmo

Este documento explica como configurar as diferentes opções para acessar o calendário do Google.

## 🎯 Opções Disponíveis

### 1. Google Calendar API (Apenas para Desenvolvimento/Backend)
⚠️ **NÃO RECOMENDADO para sites públicos** - API key fica exposta no frontend.

#### Como configurar:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a **Google Calendar API**
4. Vá para "Credenciais" e crie uma nova **API Key**
5. Copie a chave e configure no arquivo `src/config/api.ts`

```typescript
// Em src/config/api.ts
API_KEY: 'sua_api_key_aqui',
```

### 2. Proxy Local do Vite (Desenvolvimento)
Funciona automaticamente durante o desenvolvimento local.

### 3. Proxies CORS Externos (Recomendado para Produção)
Múltiplos proxies como fallback quando a API principal falha:


- `api.allorigins.win`
- `cors-anywhere.herokuapp.com`
- `thingproxy.freeboard.io`
- `api.codetabs.com`
- `corsproxy.io`

## 🔧 Configuração Rápida

### Para usar apenas proxies (sem API key):
Não é necessário fazer nada. O sistema tentará automaticamente todos os proxies disponíveis.

### Para usar Google Calendar API:
1. Crie um arquivo `.env` na raiz do projeto
2. Adicione sua API key:
```env
VITE_GOOGLE_CALENDAR_API_KEY=sua_api_key_aqui
```

## 🚀 Ordem de Prioridade

O sistema tentará os métodos na seguinte ordem:
1. **Google Calendar API** (apenas desenvolvimento/backend)
2. **Proxy local do Vite** (desenvolvimento)
3. **Proxies CORS externos** (recomendado para produção)
4. **Acesso direto** (último recurso)

## 📊 Vantagens de Cada Método

| Método | Confiabilidade | Velocidade | Configuração | Segurança |
|--------|----------------|------------|--------------|-----------|
| Google Calendar API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Proxy Local | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Proxies Externos | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Acesso Direto | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🔍 Troubleshooting

### Erro: "Não foi possível acessar o calendário"
- Verifique sua conexão com a internet
- Tente atualizar a página
- Se persistir, configure a Google Calendar API

### Erro: "Google Calendar API error: 403"
- Verifique se a API key está correta
- Certifique-se de que a Google Calendar API está habilitada
- Verifique se o calendário é público

### Erro: "CORS error"
- Normal durante desenvolvimento, o proxy local deve resolver
- Em produção, configure a Google Calendar API

## 📝 Notas Importantes

### ⚠️ **Segurança para Sites Públicos:**
- **NÃO use Google Calendar API no frontend** - API key fica exposta
- Use apenas proxies CORS para sites públicos
- Para produção, considere um backend próprio

### 💰 **Custos:**
- Google Calendar API: 10,000 requests/dia gratuitos, depois $5/1,000 requests
- Proxies externos: Gratuitos (mas podem ter instabilidade)

### 🔧 **Recomendações:**
- **Desenvolvimento:** Proxy local do Vite
- **Sites públicos:** Proxies CORS externos
- **Aplicações críticas:** Backend próprio com Google Calendar API
