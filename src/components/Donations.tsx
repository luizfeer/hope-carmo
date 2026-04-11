'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Heart, CreditCard, QrCode, ArrowUpRight, X, Copy, Check } from 'lucide-react';

const PIX_KEY = 'pix@ipicarmo.com.br';
/** Nome do recebedor (máx. 25 caracteres, sem acentos no QR) */
const PIX_MERCHANT_NAME = 'IPI CARMO DO RIO CLARO';
/** Cidade (máx. 15 caracteres) */
const PIX_CITY = 'CARMO DO RIO CL';

function parseAmount(value: string): number | undefined {
  const n = parseFloat(value.replace(',', '.').trim());
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 100) / 100;
}

const Donations: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState('');
  const [pixLoading, setPixLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const amounts = ['20', '50', '100', '200'];

  const buildPixQr = useCallback(async (amountReais: number | undefined) => {
    setPixLoading(true);
    setQrDataUrl(null);
    setPixPayload('');
    try {
      const { QrCodePix } = await import('qrcode-pix');
      const pix = QrCodePix({
        version: '01',
        key: PIX_KEY,
        name: PIX_MERCHANT_NAME,
        city: PIX_CITY,
        value: amountReais,
      });
      const payload = pix.payload();
      setPixPayload(payload);
      const dataUrl = await pix.base64({ width: 280, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch (e) {
      console.error(e);
      setPixPayload('');
      setQrDataUrl(null);
    } finally {
      setPixLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pixModalOpen) return;
    const amount = parseAmount(selectedAmount);
    void buildPixQr(amount);
  }, [pixModalOpen, selectedAmount, buildPixQr]);

  const openPixModal = (amountStr: string) => {
    setSelectedAmount(amountStr);
    setCopied(false);
    setPixModalOpen(true);
  };

  const openPixModalWithCurrent = () => {
    setCopied(false);
    setPixModalOpen(true);
  };

  const copyPayload = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="py-32 bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-white">
            APOIE O
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              HOPE CARMO
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Sua doação ajuda a manter os encontros, eventos especiais e atividades que levam esperança
            à juventude de Carmo do Rio Claro.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Valores */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-8">Escolha o valor</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {amounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => openPixModal(amount)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 font-semibold ${
                      selectedAmount === amount
                        ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-orange-400/50'
                    }`}
                  >
                    R$ {amount}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">
                  R$
                </span>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="Outro valor"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-white/40 focus:border-orange-400 focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Botão Principal */}
            <button
              type="button"
              onClick={openPixModalWithCurrent}
              className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-black font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-xl shadow-2xl"
            >
              <Heart className="h-6 w-6 mr-3" />
              Doar R$ {selectedAmount || '0'} — PIX com QR Code
              <ArrowUpRight className="h-6 w-6 ml-3" />
            </button>
          </div>

          {/* Informações de Transferência */}
          <div className="bg-white/5 border-t border-white/10 p-8 md:p-12">
            <h3 className="text-xl font-bold text-white mb-6">Transferência Direta</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl">
                <div className="flex items-center mb-3">
                  <QrCode className="h-5 w-5 mr-2 text-orange-400" />
                  <h4 className="font-semibold text-white">PIX</h4>
                </div>
                <p className="text-white/80 font-mono text-sm break-all">{PIX_KEY}</p>
                <p className="text-white/40 text-xs mt-2">
                  Toque em um valor acima para gerar o QR Code com a quantia.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl">
                <div className="flex items-center mb-3">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
                  <h4 className="font-semibold text-white">Transferência</h4>
                </div>
                <div className="text-white/80 text-sm space-y-1">
                  <p>Ag: 1234-5</p>
                  <p>CC: 12345-6</p>
                  <p>IPI Carmo do Rio Claro</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Como sua doação ajuda */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Como sua doação ajuda</h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="text-white/60">
              <div className="text-3xl mb-2">🎵</div>
              <p className="text-sm">Equipamentos para louvor</p>
            </div>
            <div className="text-white/60">
              <div className="text-3xl mb-2">📖</div>
              <p className="text-sm">Materiais bíblicos</p>
            </div>
            <div className="text-white/60">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm">Eventos especiais</p>
            </div>
            <div className="text-white/60">
              <div className="text-3xl mb-2">❤️</div>
              <p className="text-sm">Atividades jovens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal PIX + QR */}
      {pixModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-[max(1rem,var(--radio-player-offset))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pix-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={() => setPixModalOpen(false)}
          />
          <div className="relative max-h-[min(90vh,calc(100dvh-var(--radio-player-offset)-2rem))] w-full max-w-md overflow-y-auto rounded-2xl border border-orange-500/30 bg-zinc-950 p-6 shadow-2xl animate-modal-in">
            <button
              type="button"
              onClick={() => setPixModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="pix-modal-title" className="text-xl font-black text-white pr-10 mb-1">
              PIX para o Hope Carmo
            </h2>
            <p className="text-orange-400/90 text-sm font-semibold mb-4">
              {parseAmount(selectedAmount) != null
                ? `Valor: R$ ${parseAmount(selectedAmount)!.toFixed(2).replace('.', ',')}`
                : 'Valor livre (defina no app do banco)'}
            </p>
            <p className="text-white/50 text-xs mb-4 break-all">
              Chave: <span className="font-mono text-white/70">{PIX_KEY}</span>
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="relative h-[280px] w-[280px] rounded-xl bg-white p-2">
                {pixLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900 text-white/60 text-sm">
                    Gerando QR…
                  </div>
                )}
                {qrDataUrl && !pixLoading && (
                  <Image
                    src={qrDataUrl}
                    alt="QR Code PIX"
                    width={264}
                    height={264}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => void copyPayload()}
                disabled={!pixPayload || pixLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/40 text-orange-300 text-sm font-medium hover:bg-orange-500/10 disabled:opacity-40"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Código copiado!' : 'Copiar código PIX (copia e cola)'}
              </button>

              <p className="text-white/40 text-xs text-center max-w-sm">
                Abra o app do seu banco, escolha PIX por QR Code ou cole o código. O valor já vem no QR
                quando informado acima.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Donations;
