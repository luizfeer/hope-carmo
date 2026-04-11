'use client';

import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import type { Editor } from '@tiptap/core';
import { NodeSelection, type EditorState } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/react/menus';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Images,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import NextImage from 'next/image';
import { toast } from 'sonner';
import {
  listNewsGalleryImagesAction,
  uploadNewsMarkdownImageAction,
  type NewsGalleryImage,
} from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  htmlToMarkdownForStorage,
  markdownToHtmlForEditor,
} from '@/lib/news-editor-md';
import { moveSelectedImageBlock } from '@/lib/tiptap-move-image';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

function promptAndSetLink(editor: Editor) {
  const prev = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('URL do link:', prev ?? 'https://');
  if (url === null) return;
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-40',
        active && 'border-amber-500/50 bg-amber-950/50 text-amber-200',
      )}
    >
      {children}
    </button>
  );
}

/** Menu flutuante de link — `shouldShow` tem de ser estável para não re-registar o plugin em loop. */
function NewsLinkBubbleMenu({ editor, uploading }: { editor: Editor; uploading: boolean }) {
  const shouldShow = useCallback(
    ({
      editor: ed,
      state,
    }: {
      editor: Editor;
      state: EditorState;
    }) => {
      if (!ed.isEditable) return false;
      const { selection } = state;
      if (selection instanceof NodeSelection) return false;
      return !selection.empty;
    },
    [],
  );

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow} updateDelay={120}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-zinc-600 bg-zinc-900 px-1 py-1 shadow-lg">
        <ToolbarButton
          title="Negrito"
          active={editor.isActive('bold')}
          disabled={uploading}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Itálico"
          active={editor.isActive('italic')}
          disabled={uploading}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          disabled={uploading}
          onClick={() => promptAndSetLink(editor)}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  );
}

function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled: boolean }) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-zinc-700 bg-zinc-900/95 px-2 py-1.5"
      role="toolbar"
      aria-label="Formatação"
    >
      <ToolbarButton
        title="Negrito"
        active={editor.isActive('bold')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Itálico"
        active={editor.isActive('italic')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Sublinhado"
        active={editor.isActive('underline')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Riscado"
        active={editor.isActive('strike')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-zinc-700" aria-hidden />
      <ToolbarButton
        title="Título 1"
        active={editor.isActive('heading', { level: 1 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Título 2"
        active={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Título 3"
        active={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-zinc-700" aria-hidden />
      <ToolbarButton
        title="Lista"
        active={editor.isActive('bulletList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor.isActive('orderedList')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Citação"
        active={editor.isActive('blockquote')}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Linha horizontal"
        disabled={disabled}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-zinc-700" aria-hidden />
      <ToolbarButton
        title="Link (Ctrl+K)"
        active={editor.isActive('link')}
        disabled={disabled}
        onClick={() => promptAndSetLink(editor)}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Tabela 3×3"
        disabled={disabled}
        onClick={() => {
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        }}
      >
        <Table2 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-zinc-700" aria-hidden />
      <ToolbarButton
        title="Desfazer"
        disabled={disabled || !editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Refazer"
        disabled={disabled || !editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};

type ViewMode = 'visual' | 'raw';

export function NewsMarkdownEditor({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<NewsGalleryImage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const prevViewMode = useRef<ViewMode>('visual');
  const valueRef = useRef(value);
  valueRef.current = value;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-amber-300 underline underline-offset-2' },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-lg border border-zinc-600 my-4 max-w-full' },
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      Placeholder.configure({
        placeholder:
          'Escreva o texto aqui — negrito, títulos e listas na barra acima. As alterações guardam-se em Markdown no site.',
      }),
    ],
    content: markdownToHtmlForEditor(value),
    editorProps: {
      attributes: {
        class: cn(
          'tiptap focus:outline-none min-h-[380px] max-w-none px-4 py-3 text-[15px] leading-relaxed text-zinc-100',
          'prose prose-invert max-w-none',
          'prose-headings:text-white prose-headings:font-bold',
          'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-a:text-amber-300 prose-strong:text-white',
          'prose-li:marker:text-pink-400',
        ),
      },
    },
    onUpdate: ({ editor, transaction }) => {
      if (!transaction.docChanged) return;
      onChange(htmlToMarkdownForStorage(editor.getHTML()));
    },
  });

  useEffect(() => {
    if (prevViewMode.current === 'raw' && viewMode === 'visual' && editor) {
      editor.commands.setContent(markdownToHtmlForEditor(valueRef.current));
    }
    prevViewMode.current = viewMode;
  }, [viewMode, editor]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onKey = (e: KeyboardEvent) => {
      if (viewMode !== 'visual') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        promptAndSetLink(editor);
      }
    };
    dom.addEventListener('keydown', onKey);
    return () => dom.removeEventListener('keydown', onKey);
  }, [editor, viewMode]);

  useEffect(() => {
    if (!galleryOpen) return;
    let cancelled = false;
    setGalleryLoading(true);
    void (async () => {
      try {
        const items = await listNewsGalleryImagesAction();
        if (!cancelled) setGalleryItems(items);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : 'Erro ao carregar galeria');
          setGalleryItems([]);
        }
      } finally {
        if (!cancelled) setGalleryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [galleryOpen]);

  const insertImageFromFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const { url } = await uploadNewsMarkdownImageAction(fd);
        editor.chain().focus().setImage({ src: url }).run();
        toast.success('Imagem enviada para a galeria');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erro ao enviar imagem');
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const insertImageUrl = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
      setGalleryOpen(false);
      toast.success('Imagem inserida a partir da galeria');
    },
    [editor],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          aria-hidden
          id="news-editor-file"
          disabled={uploading || !editor}
          onChange={(ev) => {
            const f = ev.target.files?.[0];
            if (f) void insertImageFromFile(f);
            ev.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-zinc-600 text-zinc-200"
          disabled={uploading || !editor || viewMode === 'raw'}
          onClick={() => document.getElementById('news-editor-file')?.click()}
        >
          <ImagePlus className="mr-1.5 h-4 w-4" aria-hidden />
          Inserir imagem
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-zinc-600 text-zinc-200"
          disabled={uploading || !editor || viewMode === 'raw'}
          onClick={() => setGalleryOpen(true)}
        >
          <Images className="mr-1.5 h-4 w-4" aria-hidden />
          Galeria
        </Button>
        <Button
          type="button"
          variant={viewMode === 'visual' ? 'secondary' : 'outline'}
          size="sm"
          className="border-zinc-600 text-zinc-200"
          disabled={uploading || !editor}
          onClick={() => setViewMode('visual')}
        >
          <LayoutTemplate className="mr-1.5 h-4 w-4" aria-hidden />
          Visual
        </Button>
        <Button
          type="button"
          variant={viewMode === 'raw' ? 'secondary' : 'outline'}
          size="sm"
          className="border-zinc-600 text-zinc-200"
          disabled={uploading}
          onClick={() => {
            if (editor && viewMode === 'visual') {
              onChange(htmlToMarkdownForStorage(editor.getHTML()));
            }
            setViewMode('raw');
          }}
        >
          <FileCode2 className="mr-1.5 h-4 w-4" aria-hidden />
          Markdown
        </Button>
        <span className="text-xs text-zinc-500">
          Links: barra, menu ao selecionar texto ou{' '}
          <kbd className="rounded bg-zinc-800 px-1">Ctrl+K</kbd>. Imagens:{' '}
          <code className="rounded bg-zinc-800/80 px-1">media/news/gallery/</code>
        </span>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent
          showCloseButton
          className="max-h-[85vh] max-w-3xl overflow-hidden border-zinc-700 bg-zinc-950 p-0 text-zinc-100 ring-zinc-600 sm:max-w-3xl"
        >
          <DialogHeader className="border-b border-zinc-800 px-4 py-3 pr-12">
            <DialogTitle className="text-zinc-50">Galeria de imagens</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Clique numa miniatura para inserir no texto.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(60vh,520px)] overflow-y-auto px-4 pb-4">
            {galleryLoading ? (
              <p className="py-12 text-center text-sm text-zinc-500">A carregar…</p>
            ) : galleryItems.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                Nenhuma imagem na galeria. Use &quot;Inserir imagem&quot; primeiro.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {galleryItems.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => insertImageUrl(item.url)}
                      className="group relative w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 transition hover:border-amber-500/80 hover:ring-2 hover:ring-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <span className="relative block aspect-video w-full bg-zinc-900">
                        <NextImage
                          src={item.url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {viewMode === 'raw' ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-h-[min(70vh,560px)] resize-y border-zinc-700 bg-zinc-950 font-mono text-sm text-zinc-100"
          placeholder={'# Título\n\nTexto e ![legenda](url)'}
        />
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 ring-1 ring-white/5">
          {editor ? <NewsLinkBubbleMenu editor={editor} uploading={uploading} /> : null}
          <EditorToolbar editor={editor} disabled={uploading} />
          {editor &&
          editor.state.selection instanceof NodeSelection &&
          editor.state.selection.node.type.name === 'image' ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-2 py-1.5">
              <span className="text-xs text-zinc-500">Imagem:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-zinc-600 text-xs text-zinc-200"
                onClick={() => {
                  if (!editor) return;
                  const ok = moveSelectedImageBlock(editor, 'up');
                  if (!ok) toast.info('Não é possível mover mais para cima');
                }}
              >
                <ArrowUp className="mr-1 h-3.5 w-3.5" aria-hidden />
                Subir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 border-zinc-600 text-xs text-zinc-200"
                onClick={() => {
                  if (!editor) return;
                  const ok = moveSelectedImageBlock(editor, 'down');
                  if (!ok) toast.info('Não é possível mover mais para baixo');
                }}
              >
                <ArrowDown className="mr-1 h-3.5 w-3.5" aria-hidden />
                Descer
              </Button>
              <span className="text-xs text-zinc-600">ou arraste a imagem no texto</span>
            </div>
          ) : null}
          <EditorContent
            editor={editor}
            className="news-tiptap-content max-h-[min(70vh,560px)] overflow-y-auto [&_.ProseMirror_img]:cursor-grab"
          />
        </div>
      )}

      {uploading ? (
        <p className="text-xs text-amber-200/80">A enviar imagem para a galeria…</p>
      ) : null}
    </div>
  );
}
