import { Node, mergeAttributes } from '@tiptap/core';

/** Bloco atómico para round-trip com `[video]…[/video]` no Markdown gravado. */
export const NewsVideoExtension = Node.create({
  name: 'newsVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-news-video]',
        getAttrs: (el: HTMLElement | string) => {
          if (typeof el === 'string') return false;
          const node = el;
          const url =
            node.getAttribute('data-url')?.trim() ||
            node.textContent
              ?.replace(/^Vídeo \(YouTube\):\s*/i, '')
              .trim() ||
            '';
          return url ? { src: url } : false;
        },
      },
    ];
  },

  renderHTML({ node }: { node: { attrs: Record<string, unknown> } }) {
    const src = node.attrs.src as string;
    return [
      'div',
      mergeAttributes({
        class:
          'my-4 rounded-lg border border-amber-600/40 bg-zinc-900/80 px-3 py-2 text-sm text-amber-100/90',
        'data-news-video': 'true',
        'data-url': src,
      }),
      `Vídeo (YouTube): ${src}`,
    ];
  },
});
