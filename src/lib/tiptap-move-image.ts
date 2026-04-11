import type { Editor } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';

/** Troca a imagem selecionada com o bloco adjacente (só blocos diretos do documento). */
export function moveSelectedImageBlock(editor: Editor, dir: 'up' | 'down'): boolean {
  const { state } = editor;
  const sel = state.selection;
  if (!(sel instanceof NodeSelection) || sel.node.type.name !== 'image') {
    return false;
  }

  const doc = state.doc;
  const $pos = doc.resolve(sel.from);
  /** Só blocos de primeiro nível no documento (evita estruturas aninhadas). */
  if ($pos.depth !== 1) {
    return false;
  }
  const index = $pos.index(0);
  const swapWith = dir === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= doc.childCount) {
    return false;
  }

  const children = Array.from({ length: doc.childCount }, (_, i) => doc.child(i));
  [children[index], children[swapWith]] = [children[swapWith], children[index]];

  const frag = Fragment.from(children);
  const tr = state.tr.replaceWith(0, doc.content.size, frag);

  let posBefore = 0;
  for (let i = 0; i < swapWith; i++) {
    posBefore += tr.doc.child(i).nodeSize;
  }
  tr.setSelection(NodeSelection.create(tr.doc, posBefore));
  editor.view.dispatch(tr);
  return true;
}
