import React, { useRef } from 'react';
import { Building2, Handshake, Globe, TrendingUp } from 'lucide-react';
import { PartnerApplicationForm } from '../forms/PartnerApplicationForm';
import { motion, useInView } from 'framer-motion';

const benefits = [
  {
    Icon: Building2,
    title: 'Parcerias Corporativas',
    description: 'Desenvolvimento de projetos customizados e voluntariado executivo com impacto ESG mensurável.',
  },
  {
    Icon: Handshake,
    title: 'Cooperação Técnica',
    description: 'Intercâmbio de expertise com academia e institutos de pesquisa líderes no Brasil e no mundo.',
  },
  {
    Icon: Globe,
    title: 'Alcance Global',
    description: 'Integração à nossa Rede de Colaboração de Elite com parceiros em mais de 20 países.',
  },
  {
    Icon: TrendingUp,
    title: 'Visibilidade ESG',
    description: 'Reconhecimento público em relatórios de impacto e eventos institucionais de alto nível.',
  },
];

export const PartnerSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="partner" className="py-24 bg-white section-pattern overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">

          {/* Left Column: Copy */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:w-1/2 lg:sticky top-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
              Seja Parceiro
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
              Construa o Futuro{' '}
              <span className="text-gradient-brand">Conosco</span>
            </h2>
            <p className="text-lg text-secondary-500 mb-10 leading-relaxed">
              Buscamos alianças estratégicas com organizações e líderes que compartilham nossa visão de excelência. Junte-se à nossa Rede de Colaboração de Elite e amplifique seu impacto ESG.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map(({ Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-secondary-600 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all duration-200 shrink-0 shadow-sm">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 text-sm mb-1">{title}</h4>
                    <p className="text-xs text-secondary-400 leading-relaxed">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              {['ISO 9001', 'ODS ONU', 'LGPD Compliant'].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-full border border-secondary-200 text-secondary-500 text-xs font-bold uppercase tracking-wider"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:w-1/2 w-full"
          >
            <PartnerApplicationForm />
          </motion.div>

        </div>
      </div>
    </section>
  );
};