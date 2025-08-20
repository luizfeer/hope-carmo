# Hope Carmo - Site Oficial

Site oficial do Hope Carmo com integração de calendário iCal.

## Funcionalidades

### Integração com Calendário iCal
- Busca automática de eventos do Google Calendar
- Suporte a eventos recorrentes (semanais)
- Exibição de eventos futuros apenas
- Interface responsiva com estados de loading e erro
- Botão de atualização manual

## Estrutura do Projeto

```
src/
├── components/
│   ├── Schedule.tsx          # Componente principal de programação
│   ├── LoadingSpinner.tsx    # Componente de loading
│   └── ...                   # Outros componentes
├── hooks/
│   └── useCalendarEvents.ts  # Hook para gerenciar eventos do calendário
├── services/
│   └── calendarService.ts    # Serviço para buscar e processar iCal
├── types/
│   └── calendar.ts          # Tipos TypeScript para eventos
└── ...
```

## Configuração

### Calendário iCal
O projeto está configurado para buscar eventos do calendário:
```
https://calendar.google.com/calendar/ical/53938eddd91473d2c5bcd0f645b0ff4a84190c7b461850eeab5c4ed1df7c0e91%40group.calendar.google.com/public/basic.ics
```

### Proxy CORS
Para contornar problemas de CORS, o projeto usa:
1. Proxy local do Vite (desenvolvimento)
2. Proxy CORS externo (fallback)
3. Tentativa direta (último recurso)

## Como Usar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o projeto: `npm run dev`
4. Acesse a seção "PROGRAMAÇÃO" para ver os eventos do calendário

## Tecnologias

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (ícones)

## Desenvolvimento

### Adicionando Novos Tipos de Evento
Para adicionar novos tipos de evento, atualize o tipo `CalendarEvent` em `src/types/calendar.ts`:

```typescript
type: 'Encontro Regular' | 'Evento Especial' | 'Reunião' | 'Novo Tipo';
```

### Modificando o Processamento de Eventos
O processamento de eventos está em `src/services/calendarService.ts`. Você pode:
- Modificar a lógica de recorrência
- Adicionar novos campos
- Alterar a formatação de datas

### Personalizando a Interface
O componente principal está em `src/components/Schedule.tsx`. Você pode:
- Modificar o layout dos eventos
- Adicionar novos estados visuais
- Personalizar cores e estilos
