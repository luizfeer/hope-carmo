import React from 'react';
import { Play } from 'lucide-react';

const Videos: React.FC = () => {
  const videos = [
    {
      title: 'Louvor: Noite de Adoração Jovem',
      thumbnail: '/img/thumb4.webp',
      duration: '12:45',
      link: 'https://www.youtube.com/watch?v=hHrDhhPFAvU'
    },

    {
      title: 'Teatro: Cansado - high - Intensivão Hope Carmo 2025',
      thumbnail: 'https://i.ytimg.com/vi/CnKmMfvc_a8/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDKbMv4FMIwEqLWhj_bzESbaUtVGw',
      duration: '04:00',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      title: 'Sala de Oração',
      thumbnail: 'https://i.ytimg.com/vi/TVqEX6oFYbw/hqdefault.jpg?sqp=-oaymwEnCNACELwBSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCNA7mz-bhMIhaMnteJ8zazHi5Q-g',
      duration: '01:33:00',
      link: 'https://www.youtube.com/watch?v=TVqEX6oFYbw'
    }
  ];

  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            VÍDEOS
          </h2>
          <p className="text-xl text-white/60 font-light">
            Reviva os melhores momentos dos encontros do Hope Carmo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => window.open(video.link, '_blank')}
            >
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Play className="h-6 w-6 text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  {video.duration}
                </div>
              </div>

              <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors leading-tight">
                {video.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button onClick={() => window.open('https://www.youtube.com/@HopeCarmo/videos', '_blank')} className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors">
            Ver Todos os Vídeos
          </button>
        </div>
      </div>
    </section>
  );
};

export default Videos;