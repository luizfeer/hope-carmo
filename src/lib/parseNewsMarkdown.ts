export type NewsMdBlock =
  | { type: 'markdown'; text: string }
  | { type: 'video'; raw: string };

/**
 * Divide o corpo em trechos Markdown e blocos `[video]url ou id do YouTube[/video]`.
 */
export function parseNewsMarkdown(source: string): NewsMdBlock[] {
  if (!source?.trim()) return [];

  const blocks: NewsMdBlock[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = /\[video\]([\s\S]*?)\[\/video\]/gi;

  while ((m = re.exec(source)) !== null) {
    if (m.index > lastIndex) {
      const text = source.slice(lastIndex, m.index);
      if (text.trim()) blocks.push({ type: 'markdown', text });
    }
    blocks.push({ type: 'video', raw: m[1].trim() });
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < source.length) {
    const text = source.slice(lastIndex);
    if (text.trim()) blocks.push({ type: 'markdown', text });
  }

  return blocks;
}
