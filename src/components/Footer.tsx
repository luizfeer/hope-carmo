import React from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-black text-white mb-4">HOPE CARMO</h3>
            <p className="text-white mb-6 leading-relaxed max-w-md">
              Ministério de jovens da IPI Carmo do Rio Claro. 
              Um farol de esperança para a juventude através da fé em Jesus Cristo.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/hoepcarmo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white p-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hopecarmo@ipicarmo.com.br"
                className="bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white p-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white hover:text-orange-400 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-white hover:text-orange-400 transition-colors">Programação</a></li>
              <li><a href="#" className="text-white hover:text-orange-400 transition-colors">Notícias</a></li>
              <li><a href="#" className="text-white hover:text-orange-400 transition-colors">Apoie</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-white">
                <MapPin className="h-5 w-5 mr-3 mt-0.5 text-orange-400" />
                <span className="text-sm">Carmo do Rio Claro, MG<br />Igreja Presbiteriana Independente</span>
              </li>
              <li className="flex items-center text-white">
                <Mail className="h-5 w-5 mr-3 text-orange-400" />
                <span className="text-sm">hopecarmo@ipicarmo.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-500/20 mt-12 pt-8 text-center">
          <p className="text-orange-200/60 text-sm">
            © 2024 Hope Carmo - Igreja Presbiteriana Independente. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;