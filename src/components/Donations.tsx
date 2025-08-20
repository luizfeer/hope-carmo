import React, { useState } from 'react';
import { Heart, CreditCard, Smartphone, QrCode, ArrowUpRight } from 'lucide-react';

const Donations: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState('50');

  const amounts = ['20', '50', '100', '200'];

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
                    onClick={() => setSelectedAmount(amount)}
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
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">R$</span>
                <input
                  type="number"
                  placeholder="Outro valor"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-white/40 focus:border-orange-400 focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Botão Principal */}
            <button className="w-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-black font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-xl shadow-2xl">
              <Heart className="h-6 w-6 mr-3" />
              Doar R$ {selectedAmount || '0'}
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
                <p className="text-white/80 font-mono text-sm">hopecarmo@ipicarmo.com.br</p>
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
    </section>
  );
};

export default Donations;