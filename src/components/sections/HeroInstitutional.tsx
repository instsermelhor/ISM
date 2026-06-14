import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Globe, Users, Leaf } from 'lucide-react';
import { InstitutionalPageAttributes } from '../../types';

interface HeroInstitutionalProps {
  data: InstitutionalPageAttributes;
}

const floatingStats = [
  { value: '15+', label: 'Anos de Impacto', Icon: Leaf },
  { value: '1M+', label: 'Vidas Impactadas', Icon: Users },
  { value: '50+', label: 'Parceiros Globais', Icon: Globe },
];

export const HeroInstitutional: React.FC<HeroInstitutionalProps> = ({ data }) => {
  return (
    // FIX: min-h-screen + flex flex-col garante que os stats nunca se
    // sobreponham ao conteúdo — eles empurram o layout para baixo naturalmente.
    <section className="relative min-h-screen w-full overflow-hidden bg-secondary-950 flex flex-col">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.heroImage}
          alt="Hero Background"
          className="h-full w-full object-cover opacity-30 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-950/70 via-secondary-900/60 to-secondary-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-950/40 via-transparent to-secondary-950/20" />
      </div>

      {/* Decorative floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-brand-500/10"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
              animation: `float ${6 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-brand-400/6 rounded-full blur-[100px]" />
      </div>

      {/* ── Conteúdo principal — ocupa espaço disponível e centraliza verticalmente ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-6 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl w-full"
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            <span className="text-brand-300 text-xs font-bold uppercase tracking-[0.2em]">
              Desde 2007 · Transformação Social
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mb-6 text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-white"
          >
            {data.title.split('—')[0].trim()}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-secondary-300 sm:text-xl leading-relaxed"
          >
            {data.introduction}
          </motion.p>

          {/* Motto badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 backdrop-blur-md mb-10 max-w-xl mx-auto"
          >
            <span className="font-serif text-xl italic text-brand-300">"{data.motto}"</span>
            <span className="hidden sm:block w-px h-5 bg-white/20 shrink-0" />
            <span className="text-sm text-secondary-400 max-w-xs text-center sm:text-left">
              {data.mottoExplanation}
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#donate"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 text-white font-bold text-sm uppercase tracking-widest shadow-2xl shadow-brand-600/40 hover:bg-brand-500 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-200"
            >
              Apoie Nossa Missão
            </a>
            <a
              href="#mission"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-bold text-sm uppercase tracking-widest backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              Conheça o Instituto
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Stats bar — parte inferior da section, NUNCA sobrepõe o conteúdo ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="relative z-10 w-full px-4 pb-8 sm:pb-10"
      >
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {floatingStats.map(({ value, label, Icon }, i) => (
              <div
                key={label}
                className="flex-1 glass rounded-2xl px-5 py-4 text-center"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <Icon size={18} className="text-brand-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-xs text-secondary-400 mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator — hidden when stats are visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-4 right-6 hidden sm:flex flex-col items-center gap-1 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-secondary-500">Scroll</span>
        <ChevronDown size={18} className="text-secondary-500 animate-bounce" />
      </motion.div>
    </section>
  );
};
