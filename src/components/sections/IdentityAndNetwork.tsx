import React from 'react';
import { InstitutionalPageAttributes } from '../../types';
import { Globe, Building, ArrowRightLeft, BookOpen, Sun, Users, Layers, Quote } from 'lucide-react';

interface Props {
  pageData: InstitutionalPageAttributes;
}

export const IdentityAndNetwork: React.FC<Props> = ({ pageData }) => {
  return (
    <section id="identity" className="bg-white">
      
      {/* 1. Rede de Colaboração (Darker Background) */}
      <div className="bg-secondary-900 text-white py-24 relative overflow-hidden">
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
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Parcerias Nível Tier 1</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Trabalhamos exclusivamente com universidades de pesquisa de ponta, think tanks globais e agências multilaterais para co-desenvolver e validar a Metodologia M-IS.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Building size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Apoio Corporativo Estratégico</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Alianças baseadas na excelência ESG. Exigimos que nossos parceiros demonstrem liderança na neutralidade de carbono e na inclusão social, garantindo alinhamento moral e ético.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 hover:border-brand-500/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ArrowRightLeft size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Intercâmbio de Conhecimento</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Mantemos programas de intercâmbio com as melhores ONGs do mundo (benchmark de performance), garantindo que nossas práticas estejam sempre na fronteira do conhecimento e da eficácia operacional.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* 2. Simbologia e Logotipo */}
      <div className="py-24 container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center max-w-4xl mx-auto">
             <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                Identidade Visual
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">Símbolo Institucional</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
                {pageData.logoExplanation}
            </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-12">
          
          {/* Coluna A: A Logomarca (Gráfico) */}
          <div className="w-full lg:w-1/2 flex flex-col bg-slate-50 rounded-2xl p-10 border border-slate-100">
             <h3 className="text-2xl font-bold text-secondary-900 mb-8 border-b border-gray-200 pb-4">A. A Logomarca</h3>
             
             <div className="flex flex-col items-center mb-10">
                 <div className="relative w-64 h-64 mb-6">
                    <div className="absolute inset-0 border-[20px] border-transparent border-t-yellow-400 border-r-yellow-400 rounded-full rotate-45 opacity-90"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img src={pageData.logoImage} alt="Logo Símbolo" className="w-40 h-40 object-contain drop-shadow-md" />
                    </div>
                 </div>
             </div>

             <div className="space-y-6 mt-auto">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                        <Users size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary-900">As Três Figuras</h4>
                        <p className="text-sm text-gray-600">
                            Representam a tríade de nosso impacto principal: Social (Azul), Ambiental (Verde), e Educacional (Branco). Elas progridem em uma sequência ascendente, simbolizando a emancipação humana e o crescimento contínuo.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                        <Sun size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-secondary-900">O Ciclo Amarelo</h4>
                        <p className="text-sm text-gray-600">
                            O arco exterior amarelo representa o Sol da Sabedoria e o Ciclo da Prosperidade. Sua forma circular indica a natureza sistêmica e regenerativa de nosso trabalho.
                        </p>
                    </div>
                </div>
             </div>
          </div>

          {/* Coluna B: O Logotipo (Texto) */}
          <div className="w-full lg:w-1/2 flex flex-col bg-secondary-900 rounded-2xl p-10 text-white relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

             <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/20 pb-4 relative z-10">B. O Logotipo</h3>

             <div className="flex flex-col items-center justify-center py-12 mb-8 relative z-10">
                <h3 className="text-4xl lg:text-5xl font-serif text-white italic mb-4 text-center">Instituto Ser Melhor</h3>
                <span className="text-sm uppercase tracking-[0.4em] text-brand-400 font-bold">{pageData.motto}</span>
             </div>

             <div className="space-y-8 mt-auto relative z-10">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 text-brand-400 flex items-center justify-center shrink-0">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">O Nome</h4>
                        <p className="text-sm text-gray-400">
                            "Instituto Ser Melhor" encapsula nossa visão central: a busca incessante pela versão mais elevada do indivíduo, da comunidade e do planeta.
                        </p>
                    </div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-brand-400 mb-3">
                        <Quote size={20} />
                        <span className="font-serif italic text-xl font-bold">{pageData.motto}</span>
                    </div>
                    <p className="text-sm text-gray-300 italic mb-2">
                        "Ousa Saber" ou "Ousa ser sábio".
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora. O lema posiciona o Instituto não apenas como um agente de assistência, mas como um promotor da autossuficiência intelectual e moral.
                    </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};