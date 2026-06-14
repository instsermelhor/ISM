import React, { useRef } from 'react';
import { InstitutionalPageAttributes } from '../../types';
import {
  Globe, Building, ArrowRightLeft, Users, Sun, Layers, Quote
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface Props {
  pageData: InstitutionalPageAttributes;
}

const networkCards = [
  {
    Icon: Globe,
    title: 'Parcerias Nível Tier 1',
    description:
      'Trabalhamos com universidades de pesquisa de ponta, think tanks globais e agências multilaterais para co-desenvolver e validar a Metodologia M-IS.',
  },
  {
    Icon: Building,
    title: 'Apoio Corporativo Estratégico',
    description:
      'Alianças baseadas na excelência ESG. Exigimos que nossos parceiros demonstrem liderança na neutralidade de carbono e na inclusão social.',
  },
  {
    Icon: ArrowRightLeft,
    title: 'Intercâmbio de Conhecimento',
    description:
      'Programas de intercâmbio com as melhores ONGs do mundo, garantindo práticas na fronteira do conhecimento e eficácia operacional.',
  },
];

export const IdentityAndNetwork: React.FC<Props> = ({ pageData }) => {
  const networkRef = useRef(null);
  const symbolRef = useRef(null);
  const networkInView = useInView(networkRef, { once: true, margin: '-80px' });
  const symbolInView = useInView(symbolRef, { once: true, margin: '-80px' });

  return (
    <section id="identity" className="bg-white">

      {/* ── 1. Rede de Colaboração ── */}
      <div className="relative bg-secondary-950 text-white py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/15 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-secondary-800/50 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            ref={networkRef}
            initial={{ opacity: 0, y: 24 }}
            animate={networkInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              Ecossistema Estratégico
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              Rede de Colaboração{' '}
              <span className="text-gradient-brand">de Elite</span>
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed max-w-2xl mx-auto">
              {pageData.networkIntro}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {networkCards.map(({ Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                animate={networkInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
                className="glass rounded-2xl p-8 hover:border-brand-500/40 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-600/15 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all duration-250">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-secondary-400 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Símbolo Institucional ── */}
      <div className="py-24 container mx-auto px-4 md:px-6" ref={symbolRef}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={symbolInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Identidade Visual
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
            Símbolo <span className="text-gradient-brand">Institucional</span>
          </h2>
          <p className="text-secondary-500 text-lg leading-relaxed">{pageData.logoExplanation}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-stretch gap-8">

          {/* A. A Logomarca */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={symbolInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-full lg:w-1/2 flex flex-col bg-slate-50 rounded-3xl p-10 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-secondary-900 mb-8 pb-4 border-b border-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-xs font-black flex items-center justify-center">A</span>
              A Logomarca
            </h3>

            {/* Logo display */}
            <div className="flex justify-center items-center py-10 mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-xl scale-150" />
                <img
                  src={pageData.logoImage}
                  alt="Logo Símbolo do Instituto Ser Melhor"
                  className="relative w-36 h-36 object-contain drop-shadow-md"
                />
              </div>
            </div>

            <div className="space-y-5 mt-auto">
              {[
                {
                  Icon: Users,
                  iconBg: 'bg-brand-100 text-brand-600',
                  title: 'As Três Figuras',
                  text: 'Representam a tríade de nosso impacto: Social (Azul), Ambiental (Verde), e Educacional (Branco). Progridem em sequência ascendente, simbolizando a emancipação humana.',
                },
                {
                  Icon: Sun,
                  iconBg: 'bg-yellow-100 text-yellow-600',
                  title: 'O Ciclo Amarelo',
                  text: 'O arco exterior representa o Sol da Sabedoria e o Ciclo da Prosperidade. Sua forma circular indica a natureza sistêmica e regenerativa do nosso trabalho.',
                },
              ].map(({ Icon, iconBg, title, text }) => (
                <div key={title} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 mb-1">{title}</h4>
                    <p className="text-sm text-secondary-500 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* B. O Logotipo */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={symbolInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col bg-secondary-950 rounded-3xl p-10 text-white relative overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-8 pb-4 border-b border-white/10 relative z-10 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-secondary-700 text-white text-xs font-black flex items-center justify-center">B</span>
              O Logotipo
            </h3>

            {/* Logotype display */}
            <div className="flex flex-col items-center justify-center py-10 px-6 mb-8 relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl lg:text-4xl font-serif font-bold" style={{ color: '#009C3B' }}>
                  Instituto
                </span>
                <span className="text-3xl lg:text-4xl font-serif font-bold" style={{ color: '#002776' }}>
                  Ser Melhor
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-brand-600 font-bold">{pageData.motto}</span>
            </div>

            <div className="space-y-6 mt-auto relative z-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/8 text-brand-400 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">O Nome</h4>
                  <p className="text-sm text-secondary-400 leading-relaxed">
                    "Instituto Ser Melhor" encapsula nossa visão central: a busca incessante pela versão mais elevada do indivíduo, da comunidade e do planeta.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/8">
                <div className="flex items-center gap-2 text-brand-400 mb-3">
                  <Quote size={18} />
                  <span className="font-serif italic text-lg font-bold">{pageData.motto}</span>
                </div>
                <p className="text-sm text-secondary-300 italic mb-2">"Ousa Saber" ou "Ousa ser sábio".</p>
                <p className="text-xs text-secondary-400 leading-relaxed">
                  Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora. O lema posiciona o Instituto como promotor da autossuficiência intelectual e moral.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};