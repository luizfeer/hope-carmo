/**
 * Himetrica — só invocar a partir do browser (componentes `'use client'`, handlers, `useEffect`).
 * Não usar em Server Components, server actions nem API routes.
 */

export function trackHimetricaPurchaseCompleted(): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('purchase_completed', {
    product_id: 'pro_plan',
    price: 9.99,
  });
}

/* ---------- /convite (QR dos cartazes de rua) ---------- */

/**
 * Dispara quando alguém abre /convite vindo de um QR de cartaz (tem `?p=`).
 * Usa o mesmo evento "purchase_completed" que o resto do site usa como sinal
 * de conversão — o `ponto` (praça, escola, centro...) vai na propriedade
 * para dar pra comparar qual cartaz converteu mais.
 */
export function trackConviteChegouPeloTag(ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('purchase_completed', {
    product_id: 'convite_qr',
    price: 0,
    ponto: ponto ?? 'sem-tag',
  });
}

/** Página /convite abriu (com ou sem tag de QR). */
export function trackConviteAberto(ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_aberto', { ponto: ponto ?? 'sem-tag' });
}

/** A pessoa escolheu uma opção na tela "o que você anda procurando?". */
export function trackConviteEscolha(escolha: string, ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_escolha', { escolha, ponto: ponto ?? 'sem-tag' });
}

/** Chegou na tela do vídeo-manifesto. */
export function trackConviteVideoVisto(ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_video_visto', { ponto: ponto ?? 'sem-tag' });
}

/** Abriu o formulário anônimo (textarea) na tela final. */
export function trackConviteFormularioAberto(ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_formulario_aberto', { ponto: ponto ?? 'sem-tag' });
}

/** Enviou o recado anônimo com sucesso. */
export function trackConviteFormularioEnviado(ponto: string | null): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_formulario_enviado', { ponto: ponto ?? 'sem-tag' });
}

/** Clicou numa das portas: whatsapp, instagram ou intensivao. */
export function trackConvitePortaClicada(
  porta: 'whatsapp' | 'instagram' | 'intensivao',
  ponto: string | null,
): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('convite_porta_clicada', { porta, ponto: ponto ?? 'sem-tag' });
}

/* ---------- /intensivao (página principal do evento) ---------- */

/** Clicou em "Ver todas as fotos" ou está na galeria em /intensivao/fotos. */
export function trackIntensivaoFotosVistas(origem: 'slider' | 'pagina-fotos'): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('intensivao_fotos_vistas', { origem });
}

/** Abriu o player do vídeo do Intensivão na página principal. */
export function trackIntensivaoVideoVisto(): void {
  if (typeof window === 'undefined') return;
  window.himetrica?.track('intensivao_video_visto', {});
}
