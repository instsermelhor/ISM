import React from 'react';
import { InstitutionalPageAttributes } from '../../types';
import { ArrowDown, PlayCircle } from 'lucide-react';

interface Props {
  data: InstitutionalPageAttributes;
}

export const HeroInstitutional: React.FC<Props> = ({ data }) => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-secondary-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.heroImage}
          alt="Hero background"
          className="w-full h-full object-cover opacity-60 animate-slow-zoom" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 via-transparent to-secondary-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/80 via-transparent to-secondary-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white max-w-5xl pt-20">
        <div className="inline-block px-4 py-1.5 mb-6 border border-white/20 bg-white/5 backdrop-blur-md rounded-full">
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-brand-400">Instituto Ser Melhor</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter drop-shadow-2xl">
          {data.title}
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          {data.introduction}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button className="group relative px-8 py-4 bg-brand-600 text-white font-bold text-sm uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)]">
            <span className="relative z-10 flex items-center gap-2">
                Nossos Projetos
            </span>
          </button>
          
          <button className="group px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-widest rounded-full backdrop-blur-sm transition-all flex items-center justify-center gap-3">
            <PlayCircle size={20} className="group-hover:text-brand-400 transition-colors" />
            <span>Assista ao Manifesto</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest">Explore</span>
        <ArrowDown size={20} />
      </div>
    </section>
  );
};