# 🚀 Setup do Proxy Próprio

## 📋 **Por que criar seu próprio proxy?**

- ✅ **100% confiável** - você controla o serviço
- ✅ **Sem rate limiting** - 100k requests/dia gratuitos
- ✅ **Headers CORS corretos** - sempre funcionará
- ✅ **Cache inteligente** - 5 minutos de cache
- ✅ **Genérico** - funciona com qualquer URL

## 🛠️ **Deploy no Cloudflare Workers**

### **Passo 1: Criar conta**
1. Acesse: https://workers.cloudflare.com/
2. Faça login/crie conta
3. Clique em "Create a Worker"

### **Passo 2: Deployar código**
1. Cole o código do arquivo `calendar-proxy.js`
2. Clique em "Deploy"
3. Anote a URL (ex: `https://hope-calendar-proxy.your-subdomain.workers.dev`)

### **Passo 3: Configurar no projeto**
1. Abra `src/config/api.ts`
2. Substitua a URL do proxy:
```typescript
'https://hope-calendar-proxy.your-subdomain.workers.dev?url=',
```

## 🔧 **Como funciona**

### **URL do proxy:**
```
https://seu-proxy.workers.dev?url=https://calendar.google.com/calendar/ical/...
```

### **Exemplo de uso:**
```javascript
// URL original (não funciona por CORS)
const originalUrl = 'https://calendar.google.com/calendar/ical/...'

// URL com proxy (funciona!)
const proxyUrl = 'https://seu-proxy.workers.dev?url=' + encodeURIComponent(originalUrl)

// Fazer requisição
fetch(proxyUrl)
  .then(response => response.text())
  .then(data => console.log(data))
```

## 📊 **Vantagens vs Proxies Externos**

| Aspecto | Seu Proxy | Proxies Externos |
|---------|-----------|------------------|
| **Confiabilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Controle** | ⭐⭐⭐⭐⭐ | ⭐ |
| **Rate Limiting** | 100k/dia | Variável |
| **CORS** | Sempre correto | Às vezes falha |
| **Custo** | Gratuito | Gratuito |
| **Manutenção** | Você controla | Depende de terceiros |

## 🎯 **Resultado**

Com seu próprio proxy, você terá:
- **Zero dependência** de serviços externos
- **Performance melhor** (edge computing)
- **Logs detalhados** para debug
- **Cache inteligente** para economia
- **Headers CORS** sempre corretos

## 🚀 **Próximos passos**

1. **Deploy no Cloudflare Workers**
2. **Teste a URL** no navegador
3. **Atualize a configuração** no projeto
4. **Deploy do site** com o novo proxy
5. **Monitore os logs** no Cloudflare

**Agora seu calendário funcionará 100% do tempo!** 🎉
