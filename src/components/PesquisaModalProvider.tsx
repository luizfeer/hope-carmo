'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import SermonModal from './SermonModal';

/** Hash na URL ao abrir o formulário (compartilhável) */
export const PESQUISA_HASH = '#pesquisa';

type Ctx = {
  openModal: () => void;
  closeModal: () => void;
};

const PesquisaModalContext = createContext<Ctx | null>(null);

export function usePesquisaModalOptional() {
  return useContext(PesquisaModalContext);
}

/** Link aponta para abrir a pesquisa (query `abrir=pesquisa`) */
export function isPesquisaSurveyLink(href: string | undefined): boolean {
  if (!href?.trim()) return false;
  const h = href.trim();
  try {
    if (h.startsWith('?')) {
      return new URLSearchParams(h.slice(1)).get('abrir') === 'pesquisa';
    }
    if (h.startsWith('/')) {
      const q = h.indexOf('?');
      if (q === -1) return false;
      return new URLSearchParams(h.slice(q + 1)).get('abrir') === 'pesquisa';
    }
    return new URL(h).searchParams.get('abrir') === 'pesquisa';
  } catch {
    return false;
  }
}

/** Abre o modal na mesma página (sem navegar) — relativo, path local ou mesma origem */
export function shouldOpenPesquisaModalSamePage(href: string | undefined): boolean {
  if (!isPesquisaSurveyLink(href)) return false;
  const h = href!.trim();
  if (h.startsWith('?') || h.startsWith('/')) return true;
  if (h.startsWith('http://') || h.startsWith('https://')) {
    try {
      if (typeof window === 'undefined') return false;
      return new URL(h).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return false;
}

export function PesquisaModalProvider({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      setModalOpen(typeof window !== 'undefined' && window.location.hash === PESQUISA_HASH);
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get('abrir') === 'pesquisa') {
      params.delete('abrir');
      const q = params.toString();
      const path = window.location.pathname;
      const search = q ? `?${q}` : '';
      window.history.replaceState(null, '', `${path}${search}${PESQUISA_HASH}`);
      setModalOpen(true);
    } else {
      syncFromHash();
    }

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const openModal = useCallback(() => {
    setModalOpen(true);
    if (typeof window !== 'undefined' && window.location.hash !== PESQUISA_HASH) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}${PESQUISA_HASH}`);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === PESQUISA_HASH) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}`);
    }
  }, []);

  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <PesquisaModalContext.Provider value={value}>
      {children}
      {modalOpen && <SermonModal onClose={closeModal} />}
    </PesquisaModalContext.Provider>
  );
}
