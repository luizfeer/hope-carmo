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
