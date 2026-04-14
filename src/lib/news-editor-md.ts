import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm as gfmPlugin } from 'turndown-plugin-gfm';

marked.setOptions({ gfm: true, breaks: true });

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Blocos `[video]…[/video]` → HTML reconhecido pelo TipTap antes do marked. */
function videoBlocksToPlaceholderHtml(md: string): string {
  return md.replace(/\[video\]([\s\S]*?)\[\/video\]/gi, (_, inner: string) => {
    const src = String(inner).trim();
    const safe = escapeAttr(src);
    return `\n\n<div data-news-video="true" data-url="${safe}"></div>\n\n`;
  });
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndown.use(gfmPlugin);

turndown.addRule('newsVideoEmbed', {
  filter(node: Node): boolean {
    return (
      node.nodeName === 'DIV' &&
      (node as HTMLElement).getAttribute('data-news-video') === 'true'
    );
  },
  replacement(_content: string, node: Node) {
    const el = node as HTMLElement;
    const src =
      el.getAttribute('data-url')?.trim() ||
      el.textContent?.replace(/^Vídeo \(YouTube\):\s*/i, '').trim() ||
      '';
    if (!src) return '';
    return `\n\n[video]${src}[/video]\n\n`;
  },
});

/** Markdown (BD / estado) → HTML para o TipTap. */
export function markdownToHtmlForEditor(md: string): string {
  if (!md?.trim()) return '<p></p>';
  const withVideo = videoBlocksToPlaceholderHtml(md.trim());
  const html = marked.parse(withVideo, { async: false });
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
