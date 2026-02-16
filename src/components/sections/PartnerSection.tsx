import React from 'react';
import { Building2, Handshake } from 'lucide-react';
import { PartnerApplicationForm } from '../forms/PartnerApplicationForm';

export const PartnerSection: React.FC = () => {
  return (
    <section id="partner" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Left Column: Copy */}
            <div className="lg:w-1/2 sticky top-24">
                <div className="inline-block px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                    Seja Parceiro
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                    Construa o Futuro Conosco
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Buscamos alianças estratégicas com organizações e líderes que compartilham nossa visão de excelência inflexível. Junte-se à nossa Rede de Colaboração de Elite (R-CE) e amplifique seu impacto ESG.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-secondary-700 shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900">Parcerias Corporativas</h4>
                            <p className="text-sm text-gray-500">Desenvolvimento de projetos customizados e voluntariado executivo.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-secondary-700 shrink-0">
                            <Handshake size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-secondary-900">Cooperação Técnica</h4>
                            <p className="text-sm text-gray-500">Intercâmbio de expertise com Universidades, academias e institutos de pesquisa.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:w-1/2 w-full">
                <PartnerApplicationForm />
            </div>

        </div>
      </div>
    </section>
  );
};