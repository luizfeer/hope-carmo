/**
 * CONVITE DO CARTAZ — página que o QR code de rua abre (/convite)
 *
 * Edite este arquivo para atualizar a conversa:
 *  - OPCOES_BUSCA: as escolhas da tela 2 e a resposta curta de cada uma
 *  - CONVITE_LINKS: portas de entrada da tela final (grupo, Instagram, intensivão)
 *
 * QR por região: gere o QR apontando para /convite?p=praca, /convite?p=escola,
 * /convite?p=centro etc. O ponto aparece no painel /admin/responses no slug
 * da série (cartaz-intensivao-2026-praca), então dá pra medir qual ponto converte.
 */

export const CONVITE_SERIES_PREFIX = 'cartaz-intensivao-2026';

export const CONVITE_LINKS = {
  whatsapp: 'https://chat.whatsapp.com/IZtpxofit3A6nTPCWL7Woz',
  instagram: 'https://instagram.com/hopecarmo',
  intensivao: '/intensivao',
} as const;

export interface OpcaoBusca {
  id: string;
  /** Texto do botão. */
  label: string;
  /** Resposta curta que a página "devolve" — o momento de conversa. */
  resposta: string;
}

export const OPCOES_BUSCA: OpcaoBusca[] = [
  {
    id: 'paz',
    label: 'paz',
    resposta: 'Paz não é silêncio. É ter onde descansar quando tudo faz barulho.',
  },
  {
    id: 'proposito',
    label: 'propósito',
    resposta: 'Acordar, trabalhar, dormir, repetir. Tem que existir mais que isso.',
  },
  {
    id: 'alguem',
    label: 'alguém',
    resposta: 'Ninguém foi feito pra viver sozinho. Você também não.',
  },
  {
    id: 'dinheiro',
    label: 'dinheiro',
    resposta: 'Justo. Mas repara: esse cartaz não tava vendendo nada.',
  },
  {
    id: 'cansei',
    label: 'sei lá, só cansei',
    resposta: 'Essa é a resposta mais honesta. A gente entende.',
  },
];

export const INTRO_LINHA = 'Oi. Você achou a gente por um cartaz na rua.';

export const VIDEO_CHAMADA = 'A gente também já procurou muita coisa. E encontrou. Dá o play:';
