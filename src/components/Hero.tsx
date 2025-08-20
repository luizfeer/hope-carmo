import React from 'react';
import { ArrowDown, Instagram, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/img/bg.webp"
          className="w-full h-full object-cover opacity-40"
          onError={(e) => {
            // Fallback para imagem se o vídeo falhar
            const videoElement = e.target as HTMLVideoElement;
            videoElement.style.display = 'none';
            const fallbackDiv = videoElement.parentElement;
            if (fallbackDiv) {
              fallbackDiv.style.backgroundImage = 'url(/img/bg.webp)';
              fallbackDiv.style.backgroundSize = 'cover';
              fallbackDiv.style.backgroundPosition = 'center';
              fallbackDiv.style.backgroundRepeat = 'no-repeat';
            }
          }}
        >
          <source
            src="/video/bg-n-hd.mp4"
            type="video/mp4"
          />
          {/* Fallback para navegadores que não suportam vídeo */}
          <img 
            src="/img/bg.webp" 
            alt="Hope Carmo Background" 
            className="w-full h-full object-cover opacity-40"
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mt-8">
            Sextas-feiras às 20h
          </div>
        </div>

        {/* <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
          <span className="block text-white">HOPE</span>
          <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">CARMO</span>
        </h1> */}
        <img src="/img/logo-amarelo.webp" alt="Hope Carmo" className="w-full px-14 md:w-1/2 mb-3 mx-auto"  />

        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-light">
          Um farol de esperança para a juventude em Carmo do Rio Claro
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <button 
            onClick={() => {
              window.location.hash = 'schedule';
            }}
            className="group bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition-all duration-300 flex items-center"
          >
            Próximo Encontro
            <Calendar className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a 
            href="https://instagram.com/hopecarmo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center text-white/80 hover:text-white transition-colors"
          >
            <Instagram className="h-5 w-5 mr-2" />
            @hopecarmo
            <ArrowDown className="ml-2 h-4 w-4 rotate-[-45deg] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">50+</div>
            <div className="text-white/50 text-sm uppercase tracking-wider">Jovens</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">3</div>
            <div className="text-white/50 text-sm uppercase tracking-wider">Anos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">100+</div>
            <div className="text-white/50 text-sm uppercase tracking-wider">Vidas</div>
          </div>
        </div> */}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;