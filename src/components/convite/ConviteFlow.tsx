'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Instagram, Calendar, Send, AlertCircle } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import {
  INTRO_LINHA,
  VIDEO_CHAMADA,
  OPCOES_BUSCA,
  CONVITE_LINKS,
  type OpcaoBusca,
} from '@/data/convite';
import { VIDEO_URL } from '@/data/intensivao';
import { anton } from '@/components/intensivao/fonts';
import { Grain, CrossIcon } from '@/components/intensivao/visuals';

/** Converte link normal do YouTube em link de embed. */
function toEmbedUrl(url: string): string {
  const short = url.match(/youtu\.be\/([\w-]{6,})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([\w-]{6,})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
}

/** Texto "digitando sozinho", caractere a caractere. */
function useTypewriter(text: string, speed = 42, startDelay = 500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c + 1 >= text.length && interval) clearInterval(interval);
          return c + 1;
        });
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return { shown: text.slice(0, count), done: count >= text.length };
}

const Cursor: React.FC<{ hidden?: boolean }> = ({ hidden }) =>
  hidden ? null : (
    <span aria-hidden className="inline-block w-[2px] h-[1.1em] align-[-0.15em] bg-red-500 ml-1 animate-pulse" />
  );

type Etapa = 'intro' | 'pergunta' | 'video' | 'porta';

const API_URL = '/api/submit-convite-response';

/** Sanitiza o parâmetro ?p= do QR (praca, escola, centro...). */
function limparPonto(raw: string | null): string | null {
  if (!raw) return null;
  const p = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 24);
  return p || null;
}

const ConviteFlow: React.FC = () => {
  const searchParams = useSearchParams();
  const ponto = useMemo(() => limparPonto(searchParams.get('p')), [searchParams]);

  const [etapa, setEtapa] = useState<Etapa>('intro');
  const [escolha, setEscolha] = useState<OpcaoBusca | null>(null);

  return (
    <main className="relative min-h-[100dvh] bg-black text-white overflow-hidden flex flex-col">
      <Grain />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-red-600/10 rounded-full blur-3xl" />
      </div>
      <CrossIcon className="absolute top-6 right-6 h-8 w-8 text-red-600/70 blur-[1px]" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-xl mx-auto w-full">
        {etapa === 'intro' && <TelaIntro onNext={() => setEtapa('pergunta')} />}
        {etapa === 'pergunta' && (
          <TelaPergunta
            escolha={escolha}
            onEscolha={setEscolha}
            onNext={() => setEtapa('video')}
          />
        )}
        {etapa === 'video' && <TelaVideo onNext={() => setEtapa('porta')} />}
        {etapa === 'porta' && <TelaPorta escolha={escolha} ponto={ponto} />}
      </div>

      <p className={`${anton.className} relative text-center text-[#EDE6CE]/40 text-xs tracking-[0.4em] uppercase pb-6`}>
        Hope Carmo
      </p>
    </main>
  );
};

/* ============ TELA 1 — o mistério continua ============ */

const TelaIntro: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { shown, done } = useTypewriter(INTRO_LINHA);
  return (
    <div className="text-center space-y-12">
      <p className="text-xl md:text-2xl leading-relaxed text-white/90 min-h-[6rem]">
        {shown}
        <Cursor hidden={done} />
      </p>
      <div className={`transition-opacity duration-700 ${done ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={onNext}
          className={`${anton.className} text-2xl uppercase tracking-widest border border-red-600/60 text-red-500 px-12 py-4 rounded-full hover:bg-red-600 hover:text-black transition-colors`}
        >
          achei
        </button>
      </div>
    </div>
  );
};

/* ============ TELA 2 — a pergunta interativa ============ */

const TelaPergunta: React.FC<{
  escolha: OpcaoBusca | null;
  onEscolha: (o: OpcaoBusca) => void;
  onNext: () => void;
}> = ({ escolha, onEscolha, onNext }) => {
  const resposta = useTypewriter(escolha ? escolha.resposta : '', 38, 350);

  return (
    <div className="text-center space-y-10 w-full animate-fade-in">
      <h1 className={`${anton.className} text-4xl md:text-5xl uppercase text-red-600 blur-[0.6px]`}>
        O que você anda procurando?
      </h1>

      {!escolha ? (
        <div className="flex flex-wrap justify-center gap-3">
          {OPCOES_BUSCA.map((o) => (
            <button
              key={o.id}
              onClick={() => onEscolha(o)}
              className="border border-white/20 text-white/85 px-6 py-3 rounded-full text-base hover:border-red-500 hover:text-red-400 transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <p className="inline-block border border-red-600/50 text-red-400 px-5 py-2 rounded-full text-sm">
            {escolha.label}
          </p>
          <p className="text-xl md:text-2xl leading-relaxed text-white/90 min-h-[5rem]">
            {resposta.shown}
            <Cursor hidden={resposta.done} />
          </p>
          <div className={`transition-opacity duration-700 ${resposta.done ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={onNext}
              className={`${anton.className} inline-flex items-center gap-3 text-xl uppercase tracking-widest text-[#EDE6CE] hover:text-red-500 transition-colors`}
            >
              continuar <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============ TELA 3 — a revelação ============ */

const TelaVideo: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="w-full space-y-8 animate-fade-in">
    <p className="text-center text-xl md:text-2xl text-white/90 leading-relaxed">
      {VIDEO_CHAMADA}
    </p>

    {VIDEO_URL ? (
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-red-600/30 shadow-2xl shadow-red-950/40">
        <iframe
          src={toEmbedUrl(VIDEO_URL)}
          title="O que é o HOPE"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    ) : (
      <div className={`${anton.className} aspect-video w-full rounded-2xl border border-red-600/30 flex items-center justify-center text-red-600 text-3xl uppercase`}>
        Em breve
      </div>
    )}

    <div className="text-center">
      <button
        onClick={onNext}
        className={`${anton.className} inline-flex items-center gap-3 text-xl uppercase tracking-widest text-[#EDE6CE] hover:text-red-500 transition-colors`}
      >
        e agora? <ArrowRight size={20} />
      </button>
    </div>
  </div>
);

/* ============ TELA 4 — a porta ============ */

type Porta = 'nenhuma' | 'conhecer' | 'anonimo';
type Envio = 'idle' | 'loading' | 'success' | 'error';

const TelaPorta: React.FC<{ escolha: OpcaoBusca | null; ponto: string | null }> = ({
  escolha,
  ponto,
}) => {
  const [porta, setPorta] = useState<Porta>('nenhuma');
  const [mensagem, setMensagem] = useState('');
  const [envio, setEnvio] = useState<Envio>('idle');
  const [erro, setErro] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) {
      setErro('Escreve alguma coisa — pode ser uma palavra só.');
      return;
    }
    if (!turnstileToken) {
      setErro('Espera a verificação de segurança carregar.');
      return;
    }
    setEnvio('loading');
    setErro('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnstileToken,
          escolha: escolha?.label ?? null,
          mensagem: mensagem.trim(),
          ponto,
        }),
      });
      let data: { success?: boolean; error?: string } = {};
      try {
        data = JSON.parse(await res.text());
      } catch {
        /* não é JSON */
      }
      if (!res.ok || data.error) throw new Error(data.error || `Erro ${res.status}. Tente de novo.`);
      setEnvio('success');
    } catch (err) {
      setEnvio('error');
      setErro(err instanceof Error ? err.message : 'Algo deu errado. Tente de novo.');
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  if (envio === 'success') {
    return (
      <div className="text-center space-y-8 animate-fade-in">
        <p className={`${anton.className} text-4xl uppercase text-red-600`}>Recebido.</p>
        <p className="text-white/70 text-lg leading-relaxed">
          De verdade. Alguém vai ler — e ninguém vai saber que foi você.
        </p>
        <p className="text-white/50 text-sm">Se um dia quiser abrir a porta, ela continua aqui:</p>
        <LinksConhecer />
      </div>
    );
  }

  return (
    <div className="w-full text-center space-y-10 animate-fade-in">
      <h1 className={`${anton.className} text-4xl md:text-5xl uppercase text-red-600 blur-[0.6px]`}>
        Tem uma porta.
      </h1>

      {porta === 'nenhuma' && (
        <div className="space-y-6">
          <p className="text-white/70">Você escolhe como entrar:</p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button
              onClick={() => setPorta('conhecer')}
              className={`${anton.className} text-xl uppercase tracking-wider bg-red-600 text-black px-8 py-4 rounded-full hover:bg-red-500 transition-colors`}
            >
              Quero conhecer o HOPE
            </button>
            <button
              onClick={() => setPorta('anonimo')}
              className="text-white/60 border border-white/15 px-8 py-4 rounded-full hover:border-white/40 hover:text-white transition-colors"
            >
              prefiro ficar anônimo
            </button>
          </div>
        </div>
      )}

      {porta === 'conhecer' && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-white/70">Sem catraca, sem cadastro. Escolhe por onde entrar:</p>
          <LinksConhecer />
          <button onClick={() => setPorta('anonimo')} className="text-white/40 text-sm underline underline-offset-4 hover:text-white/70">
            prefiro ficar anônimo
          </button>
        </div>
      )}

      {porta === 'anonimo' && (
        <form onSubmit={enviar} className="space-y-5 max-w-md mx-auto animate-fade-in">
          <label htmlFor="convite-mensagem" className="block text-white/70 text-base leading-relaxed">
            Deixa aqui o que você tá procurando. Ninguém vai saber que foi você.
          </label>
          <textarea
            id="convite-mensagem"
            value={mensagem}
            onChange={(e) => {
              setMensagem(e.target.value);
              if (erro) setErro('');
            }}
            rows={4}
            placeholder="pode ser uma palavra só..."
            className="w-full bg-white/5 border border-white/10 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 rounded-xl px-4 py-3 text-white text-base placeholder:text-white/25 resize-none outline-none transition-all"
          />
          <div className="flex justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''}
              onSuccess={setTurnstileToken}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: 'dark', language: 'pt-BR' }}
            />
          </div>
          {erro && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              {erro}
            </div>
          )}
          <button
            type="submit"
            disabled={envio === 'loading'}
            className={`${anton.className} w-full inline-flex items-center justify-center gap-2 text-lg uppercase tracking-wider bg-red-600 text-black px-8 py-4 rounded-full hover:bg-red-500 transition-colors disabled:opacity-60`}
          >
            {envio === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Send size={18} /> Enviar anônimo
              </>
            )}
          </button>
          <button type="button" onClick={() => setPorta('conhecer')} className="text-white/40 text-sm underline underline-offset-4 hover:text-white/70">
            mudei de ideia, quero conhecer
          </button>
        </form>
      )}
    </div>
  );
};

const LinksConhecer: React.FC = () => (
  <div className="flex flex-col gap-3 max-w-sm mx-auto">
    <a
      href={CONVITE_LINKS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between border border-red-600/40 bg-red-600/10 text-white px-6 py-4 rounded-xl hover:bg-red-600/20 transition-colors"
    >
      <span className="font-semibold">Grupo do HOPE no WhatsApp</span>
      <ArrowRight size={18} className="text-red-500" />
    </a>
    <a
      href={CONVITE_LINKS.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between border border-white/15 text-white/85 px-6 py-4 rounded-xl hover:border-white/40 transition-colors"
    >
      <span className="flex items-center gap-2">
        <Instagram size={18} /> @hopecarmo
      </span>
      <ArrowRight size={18} className="text-white/40" />
    </a>
    <Link
      href={CONVITE_LINKS.intensivao}
      className="flex items-center justify-between border border-white/15 text-white/85 px-6 py-4 rounded-xl hover:border-white/40 transition-colors"
    >
      <span className="flex items-center gap-2">
        <Calendar size={18} /> Intensivão · 27/07 — 01/08
      </span>
      <ArrowRight size={18} className="text-white/40" />
    </Link>
  </div>
);

export default ConviteFlow;
