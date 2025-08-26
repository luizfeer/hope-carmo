# Configuração de APIs - Hope Carmo

Este documento explica como configurar as diferentes opções para acessar o calendário do Google.

## 🎯 Opções Disponíveis

### 1. Proxy Próprio (Recomendado)
✅ **RECOMENDADO para produção** - controle total e máxima confiabilidade.

**URL:** `https://calendario.ipicarmo.com.br`

#### Vantagens:
- ✅ **Controle total** - você gerencia o serviço
- ✅ **Sem rate limiting** - 100k requests/dia gratuitos  
- ✅ **Headers CORS corretos** - sempre funcionará
- ✅ **Cache inteligente** - 5 minutos de cache
- ✅ **Seguro** - sem API keys expostas

### 2. Proxy Local do Vite (Desenvolvimento)
Funciona automaticamente durante o desenvolvimento local.

### 3. Proxies CORS Externos (Fallback)
Múltiplos proxies como fallback quando o proxy principal falha:

- `api.codetabs.com` ✅ Funcionou bem
- `corsproxy.io` ✅ Confiável
- `cors.bridged.cc` ✅ Novo proxy
- `api.allorigins.win` ⚠️ Pode ter issues CORS
- `cors-anywhere.herokuapp.com` ⚠️ Rate limiting
- `thingproxy.freeboard.io` ❌ SSL inválido

## 🚀 Como Funciona

### Ordem de Prioridade:
1. **Primeiro**: `https://calendario.ipicarmo.com.br` (seu proxy)
2. **Desenvolvimento**: Proxy local Vite  
3. **Fallback**: Proxies externos em ordem de confiabilidade

### Configuração Atual:
```typescript
// src/config/api.ts
CORS_PROXIES: [
  'https://calendario.ipicarmo.com.br?url=', // Prioridade máxima
  '/api/calendar/...', // Desenvolvimento
  'https://api.codetabs.com/v1/proxy?quest=', // Fallback
  // ... outros proxies
]
```

## 📊 Comparação

| Opção | Confiabilidade | Controle | Custo | Segurança |
|-------|----------------|----------|-------|-----------|
| **Proxy Próprio** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐⭐ |
| Proxies Externos | ⭐⭐⭐ | ⭐⭐ | Gratuito | ⭐⭐⭐⭐ |
| Proxy Local | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐⭐ |

## 🎉 Resultado

Com essa configuração, o calendário:
- ✅ **Sempre funciona** - múltiplos fallbacks
- ✅ **Performance máxima** - seu proxy é prioridade
- ✅ **Sem dependências** de APIs pagas
- ✅ **Seguro** - sem exposição de chaves
- ✅ **Simples** - menos complexidade

**O sistema está otimizado para máxima confiabilidade!** 🚀