import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm as gfmPlugin } from 'turndown-plugin-gfm';

marked.setOptions({ gfm: true, breaks: true });

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndown.use(gfmPlugin);

/** Markdown (BD / estado) → HTML para o TipTap. */
export function markdownToHtmlForEditor(md: string): string {
  if (!md?.trim()) return '<p></p>';
  const html = marked.parse(md.trim(), { async: false });
  if (typeof html !== 'string') {
    throw new Error('marked: resultado assíncrono inesperado');
  }
  return html;
}

/** HTML do TipTap → Markdown para gravar no Supabase (compatível com o site). */
export function htmlToMarkdownForStorage(html: string): string {
  const cleaned = html.replace(/\u00a0/g, ' ').trim();
  if (
    !cleaned ||
    cleaned === '<p></p>' ||
    cleaned === '<p><br></p>' ||
    cleaned === '<p><br class="ProseMirror-trailingBreak"></p>'
  ) {
    return '';
  }
  return turndown.turndown(cleaned).trim();
}
