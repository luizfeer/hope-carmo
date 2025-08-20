import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const News: React.FC = () => {
  const news = [
    {
      title: 'FOTOS: Drive Intensivão Hope Carmo 2025',
      excerpt: 'Uma semana especial de cultos e atividades com o tema "Esperança" que mobilizou toda a juventude.',
      date: '10/08/2025',
      image: '/img/bg.webp',
      category: 'Eventos',
      link: 'https://drive.google.com/drive/folders/1SAyFLzKGYccdXTD-sbOBedC97mfdlwVN'
    },
    {
      title: 'Reprotagem Onda Sul do Intensivão Hope Carmo 2025',
      excerpt: 'Juventude em movimento: HOPE leva esperança e lota auditório em Carmo do Rio Claro',
      date: '03/08/2025',
      image: '/img/thumb1.webp',
      category: 'Programação',
      link: 'https://www.portalondasul.com.br/na-noite-deste-sabado-2-de-agosto-o-auditorio-municipal-de-carmo-do-rio-claro-recebeu-o-encerramento-do-intensivao-do-hope/'
    },
    {
      title: 'Siga @hopecarmo no Instagram',
      excerpt: 'Acompanhe nossa programação, mensagens inspiradoras e registros dos encontros.',
      date: '16/07/2025',
      image: '/img/thumb4.webp',
      category: 'Redes Sociais',
      link: 'https://www.instagram.com/hopecarmo/'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-violet-900 via-violet-950 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            NOTÍCIAS
          </h2>
          <p className="text-xl text-pink-100/80 font-light">
            Fique por dentro de tudo que está acontecendo no Hope Carmo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <article
              key={index}
              className="group cursor-pointer"
              onClick={() => window.open(article.link, '_blank')}
            >
              <div className="relative h-64 overflow-hidden rounded-2xl mb-6">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-pink-600/90 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-pink-300/80 font-medium uppercase tracking-wider">
                  {article.date}
                </div>
                
                <h3 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-pink-100/70 leading-relaxed">
                  {article.excerpt}
                </p>

                <button className="flex items-center text-pink-300 font-medium group-hover:text-pink-400 transition-colors">
                  Ler mais
                  <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;