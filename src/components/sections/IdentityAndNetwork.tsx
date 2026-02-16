import React from 'react';
import { InstitutionalPageAttributes } from '../../types';
import { Globe, Building, ArrowRightLeft, BookOpen } from 'lucide-react';

interface Props {
  pageData: InstitutionalPageAttributes;
}

export const IdentityAndNetwork: React.FC<Props> = ({ pageData }) => {
  return (
    <section id="identity" className="bg-white">
      
      {/* 1. Rede de Colaboração (Darker Background) */}
      <div className="bg-secondary-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/20 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]"></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-brand-900 text-brand-400 border border-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              Ecossistema Estratégico
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Rede de Colaboração de Elite (R-CE)
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {pageData.networkIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Static features based on the prompt description, as these aren't in the collection type anymore */}
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Parcerias Tier 1</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Universidades de ponta e think tanks globais.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Building size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Apoio Corporativo ESG</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Alianças com líderes em neutralidade de carbono.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ArrowRightLeft size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Intercâmbio Global</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Benchmarks com as ONGs mais eficazes do mundo.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* 2. Simbologia e Logotipo */}
      <div className="py-24 container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Logo Visual Construction */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
             <div className="relative w-80 h-80 mb-8">
                <div className="absolute inset-0 border-[20px] border-transparent border-t-yellow-400 border-r-yellow-400 rounded-full rotate-45 opacity-90 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                     {/* Placeholder for the actual uploaded media */}
                    <img src={pageData.logoImage} alt="Logo Símbolo" className="w-48 h-48 object-contain" />
                </div>
             </div>
             
             <div className="text-center">
                <h3 className="text-4xl font-serif text-brand-700 italic mb-1">Instituto Ser Melhor</h3>
                <span className="text-xs uppercase tracking-[0.4em] text-secondary-900 font-bold">{pageData.motto}</span>
             </div>
          </div>

          {/* Textual Explanation */}
          <div className="w-full lg:w-1/2 space-y-8">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">Simbologia Institucional</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {pageData.logoExplanation}
                </p>
             </div>

             <div className="mt-8 border-l-4 border-brand-600 pl-6 py-2">
                <div className="flex items-center gap-2 text-brand-700 mb-2">
                    <BookOpen size={20} />
                    <span className="font-serif italic text-2xl font-bold">{pageData.motto}</span>
                </div>
                <p className="text-gray-500 text-sm italic">
                    {pageData.mottoExplanation}
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};