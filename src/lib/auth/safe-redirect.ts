/**
 * Evita open redirect: só aceita caminhos relativos na aplicação.
 * Usado em /auth/callback e /auth/confirm.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = '/admin'
): string {
  if (next == null || typeof next !== 'string') return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  return trimmed;
}
