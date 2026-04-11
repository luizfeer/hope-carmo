/** Extrai texto legível a partir de Markdown (snippets para SEO / pré-visualizações). */
export function markdownToPlainTextSnippet(
  md: string | null | undefined,
  maxLen: number,
): string {
  if (!md?.trim()) return '';
  const s = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_]{2}([^*_]+)[*_]{2}/g, '$1')
    .replace(/[*_]([^*_]+)[*_]/g, '$1')
    .replace(/[*_~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) return '';
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed =
    lastSpace > maxLen * 0.55 ? cut.slice(0, lastSpace).trim() : cut.trim();
  return `${trimmed}…`;
}
