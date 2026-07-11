import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Users, BarChart3, Globe } from 'lucide-react';
import { ProgramData } from '../../types';

interface Props {
  programs: ProgramData[];
  servicesPage?: Record<string, any> | null;
}

export const ProgramsSection: React.FC<Props> = ({ programs, servicesPage }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const sectionBadge = servicesPage?.sectionBadge || 'O Que Fazemos';
  const sectionTitle = servicesPage?.sectionTitle || 'Projetos em Campo';
  const sectionSubtitle = servicesPage?.sectionSubtitle || 'Iniciativas de alto impacto social, ambiental e educacional transformando realidades diariamente.';

  // Filter only published programs
  const publishedPrograms = programs
    .filter(p => p.isPublished)
    .sort((a, b) => a.order - b.order);

  if (publishedPrograms.length === 0) return null;

  return (
    <section id="programs" className="py-24 bg-white section-pattern">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
            {sectionBadge}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
            <span className="text-gradient-brand">{sectionTitle}</span>
          </h2>
          <p className="text-xl text-secondary-500 font-light leading-relaxed">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {publishedPrograms.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* Image Preview / Icon */}
              <div className="relative h-52 overflow-hidden bg-slate-200">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-950 text-white text-5xl">
                    {p.iconEmoji || '🎯'}
                  </div>
                )}
                {/* Emoji badge */}
                {p.imageUrl && p.iconEmoji && (
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-xl select-none">
                    {p.iconEmoji}
                  </div>
                )}
                {/* Tags overlay */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                  {p.tags && p.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur text-[10px] font-bold text-secondary-800 uppercase tracking-wider shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-secondary-900 mb-3 group-hover:text-brand-600 transition-colors duration-200">
                  {p.title}
                </h3>
                <p className="text-secondary-500 text-sm leading-relaxed mb-6 flex-grow font-light">
                  {p.description}
                </p>

                {/* Info Blocks */}
                <div className="space-y-3.5 mb-6 border-t border-gray-100 pt-5">
                  {p.targetAudience && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-secondary-100 flex items-center justify-center text-secondary-600 shrink-0 mt-0.5">
                        <Users size={12} />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-secondary-700 block">Público-Alvo</span>
                        <span className="text-secondary-500 font-light">{p.targetAudience}</span>
                      </div>
                    </div>
                  )}

                  {p.impactMetric && p.impactValue && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-brand-100 flex items-center justify-center text-brand-700 shrink-0 mt-0.5">
                        <BarChart3 size={12} />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-brand-800 block">Impacto Mensurável</span>
                        <span className="text-brand-600 font-bold text-sm">{p.impactValue}</span>
                        <span className="text-secondary-400 font-light text-[10px] ml-1">({p.impactMetric})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2 mt-auto">
                  {/* Primary CTA */}
                  {p.ctaLabel && (
                    <a
                      href={p.ctaUrl || '#'}
                      className="w-full py-3 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-850 hover:shadow-lg transition-all duration-200"
                    >
                      {p.ctaLabel}
                    </a>
                  )}

                  {/* Domain/Subdomain URL link */}
                  {p.linkUrl && (
                    <a
                      href={p.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-center rounded-xl text-xs font-bold uppercase tracking-wider border border-brand-200/50 flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Globe size={13} />
                      <span>{p.linkLabel || 'Acessar Link Oficial'}</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
