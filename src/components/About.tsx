import React from 'react';
import { Target, Users, Heart, Book } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'Nossa Missão',
      description: 'Apresentar e cultivar a esperança em Jesus Cristo em meio aos desafios da juventude contemporânea.'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Um ambiente seguro e inspirador onde jovens desenvolvem amizades sólidas e crescem espiritualmente.'
    },
    {
      icon: Heart,
      title: 'Adoração',
      description: 'Encontros marcados por uma atmosfera contagiante com músicas e momentos de oração.'
    },
    {
      icon: Book,
      title: 'Palavra',
      description: 'Reflexões bíblicas voltadas para a realidade dos jovens, toda sexta-feira às 20h.'
    }
  ];

  return (
    <section className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            SOBRE NÓS
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto font-light leading-relaxed">
            Ministério de jovens da IPI Carmo do Rio Claro, dedicado a ser um farol de esperança 
            para a juventude através da fé em Jesus Cristo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-black/20 backdrop-blur-sm rounded-2xl border border-yellow-400/20 hover:border-yellow-400 transition-all duration-500 hover:bg-yellow-400/10 hover:shadow-2xl hover:shadow-yellow-400/20"
            >
              <div className="bg-gradient-to-br from-orange-400 to-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-400/30">
                <feature.icon className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-white leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;