'use client';

import React, { useState, useRef } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface SermonModalProps {
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const API_URL = '/api/submit-sermon-response';

const SermonModal: React.FC<SermonModalProps> = ({ onClose }) => {
  const [form, setForm]         = useState({ q1: '', q2: '', q3: '' });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus]     = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.q1 && !form.q2 && !form.q3) {
      setErrorMsg('Responda pelo menos uma das perguntas.');
      return;
    }
    if (!turnstileToken) {
      setErrorMsg('Complete a verificação de segurança.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          turnstileToken,
          question_1: form.q1 || null,
          question_2: form.q2 || null,
          question_3: form.q3 || null,
        }),
      });

      let data: { success?: boolean; error?: string } = {};
      const text = await res.text();
      try { data = JSON.parse(text); } catch { /* não é JSON */ }

      if (!res.ok || data.error) {
        throw new Error(data.error || `Erro ${res.status}. Tente novamente.`);
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleChange = (field: 'q1' | 'q2' | 'q3') =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errorMsg) setErrorMsg('');
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-orange-500/30 rounded-2xl shadow-2xl shadow-orange-500/10 animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950 border-b border-orange-500/20 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-1">
              Convictos — Série atual
            </p>
            <h2 className="text-white font-black text-lg leading-tight">
              Fé que Passa pelo Fogo
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-6">
          {status === 'success' ? (
            <SuccessState onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-white/60 text-sm leading-relaxed border-l-2 border-orange-500 pl-4">
                Suas respostas são anônimas. Responda o que sentir vontade — uma, duas ou todas as perguntas.
              </p>

              <Question number={1} label="Qual dúvida sobre a fé você nunca teve coragem de fazer em voz alta?" value={form.q1} onChange={handleChange('q1')} />
              <Question number={2} label="Já teve um momento em que quis desistir de crer? O que aconteceu?"    value={form.q2} onChange={handleChange('q2')} />
              <Question number={3} label="O que mais te ajudou a continuar crendo — ou o que você ainda está procurando?" value={form.q3} onChange={handleChange('q3')} />

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

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <AlertCircle size={16} className="shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-black text-sm tracking-wider rounded-xl hover:from-orange-400 hover:to-yellow-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
              >
                {status === 'loading' ? (
                  <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Enviando...</>
                ) : (
                  <><Send size={16} /> Enviar resposta</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Question: React.FC<{
  number: number;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ number, label, value, onChange }) => (
  <div className="space-y-2">
    <label className="flex gap-3 text-white/80 text-sm font-medium leading-relaxed">
      <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      rows={3}
      placeholder="Escreva aqui... (opcional)"
      className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 resize-none outline-none transition-all duration-200"
    />
  </div>
);

const SuccessState: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="py-10 flex flex-col items-center text-center gap-6 animate-fade-in">
    <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center animate-scale-in">
      <CheckCircle size={40} className="text-orange-400" />
    </div>
    <div>
      <h3 className="text-white font-black text-2xl mb-2">Obrigado por compartilhar!</h3>
      <p className="text-white/50 text-sm max-w-sm">
        Sua resposta foi recebida com cuidado. Que a fé que passa pelo fogo seja cada vez mais sua.
      </p>
    </div>
    <p className="text-orange-400/70 text-xs font-medium italic">
      {'"Eu sei em quem tenho crido." — 2 Timóteo 1.12'}
    </p>
    <button
      onClick={onClose}
      className="px-8 py-3 border border-orange-500/30 text-orange-400 text-sm font-bold rounded-xl hover:bg-orange-500/10 transition-colors"
    >
      Fechar
    </button>
  </div>
);

export default SermonModal;
