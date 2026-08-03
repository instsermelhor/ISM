import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink, Users, BarChart3, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { ProgramData } from '../../types';

interface Props {
  programs: ProgramData[];
  servicesPage?: Record<string, any> | null;
}

const ProgramCardItem: React.FC<{ program: ProgramData; index: number; isInView: boolean }> = ({
  program: p,
  index,
  isInView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `program-content-${p.id}`;

  const hasCustomCta = Boolean(
    (p.ctaLabel && p.ctaLabel !== 'Saiba Mais' && p.ctaUrl && p.ctaUrl !== '#') || p.linkUrl
  );
  const customCtaLabel = (p.ctaLabel && p.ctaLabel !== 'Saiba Mais') ? p.ctaLabel : (p.linkLabel || 'Acessar Link Oficial');
  const customCtaUrl = (p.ctaUrl && p.ctaUrl !== '#') ? p.ctaUrl : p.linkUrl;

  const hasExtraContent = Boolean(
    p.description ||
      p.longDescription ||
      (p.pillars && p.pillars.length > 0) ||
      (p.actionLines && p.actionLines.length > 0) ||
      p.commitment ||
      p.targetAudience ||
      (p.impactMetric && p.impactValue)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* ── Imagem de Destaque Uniforme ── */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-200 shrink-0">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-950 text-white text-5xl">
            {p.iconEmoji || '🎯'}
          </div>
        )}
        {/* Badge Emoji */}
        {p.imageUrl && p.iconEmoji && (
          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-lg select-none">
            {p.iconEmoji}
          </div>
        )}
      </div>

      {/* ── Corpo do Card Compacto ── */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        {/* Título Padronizado */}
        <h3 className="text-lg font-bold text-secondary-900 mb-4 group-hover:text-brand-600 transition-colors duration-200 leading-snug">
          {p.title}
        </h3>

        {/* ── Conteúdo Expandido Sob Demanda ── */}
        {hasExtraContent && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                id={contentId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden space-y-4 mb-5 pt-1 text-secondary-600 text-sm leading-relaxed"
              >
                {/* Resumo / Descrição Principal */}
                {p.description && (
                  <p className="text-secondary-600 font-normal leading-relaxed">
                    {p.description}
                  </p>
                )}

                {/* Descrição Detalhada */}
                {p.longDescription && (
                  <div className="space-y-3 border-t border-gray-200/80 pt-3">
                    {p.longDescription.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-secondary-600 font-normal">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Pilares do Projeto */}
                {p.pillars && p.pillars.length > 0 && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-2.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {p.pillarsTitle || 'Nossos pilares'}
                    </h4>
                    <ul className="space-y-1.5">
                      {p.pillars.map((pillarItem, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-secondary-700 font-medium leading-snug">
                          <CheckCircle2 size={14} className="text-brand-600 shrink-0 mt-0.5" />
                          <span>{pillarItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Linhas de Atuação */}
                {p.actionLines && p.actionLines.length > 0 && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-2.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                      {p.actionLinesTitle || 'Linhas de atuação'}
                    </h4>
                    {p.actionLinesSub && (
                      <p className="text-xs text-secondary-600 font-medium leading-relaxed">
                        {p.actionLinesSub}
                      </p>
                    )}
                    <ul className="space-y-1.5">
                      {p.actionLines.map((lineItem, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-secondary-700 font-medium leading-snug">
                          <CheckCircle2 size={14} className="text-brand-600 shrink-0 mt-0.5" />
                          <span>{lineItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Compromisso Institucional */}
                {p.commitment && (
                  <div className="bg-brand-50/80 rounded-2xl p-4 border border-brand-200/60 space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      {p.commitmentTitle || 'Nosso compromisso'}
                    </h4>
                    <div className="space-y-2">
                      {p.commitment.split('\n\n').map((commParagraph, cIdx) => (
                        <p key={cIdx} className="text-xs text-brand-950 font-normal leading-relaxed">
                          {commParagraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métricas e Público-Alvo */}
                <div className="space-y-2.5 border-t border-gray-200/80 pt-3">
                  {p.targetAudience && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Users size={14} className="text-secondary-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-secondary-700">Público-Alvo: </span>
                        <span className="text-secondary-500 font-light">{p.targetAudience}</span>
                      </div>
                    </div>
                  )}

                  {p.impactMetric && p.impactValue && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <BarChart3 size={14} className="text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-800">Impacto Mensurável: </span>
                        <span className="text-brand-600 font-bold">{p.impactValue}</span>
                        <span className="text-secondary-400 font-light ml-1">({p.impactMetric})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-secondary-200/70 text-[10px] font-bold text-secondary-700 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Botões no Estado Compacto e Expandido ── */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
          {/* Botão Principal: Saiba Mais / Mostrar Menos */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            aria-label={isExpanded ? `Mostrar menos detalhes de ${p.title}` : `Saiba mais sobre ${p.title}`}
            className="flex-1 py-2.5 px-4 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-800 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>{isExpanded ? 'Mostrar Menos' : 'Saiba Mais'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Botão Customizado (ex: Conhecer o AURA) — visível no estado compacto */}
          {hasCustomCta && !isExpanded && (
            <a
              href={customCtaUrl}
              target={customCtaUrl?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              aria-label={`${customCtaLabel} - ${p.title}`}
              className="flex-1 py-2.5 px-4 bg-brand-600 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>{customCtaLabel}</span>
              <ExternalLink size={12} className="opacity-80" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ProgramsSection: React.FC<Props> = ({ programs = [], servicesPage }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const sectionBadge = servicesPage?.sectionBadge || 'O Que Fazemos';
  const sectionTitle = servicesPage?.sectionTitle || 'Projetos em Campo';
  const sectionSubtitle = servicesPage?.sectionSubtitle || 'Iniciativas de alto impacto social, ambiental e educacional transformando realidades diariamente.';

  const safePrograms = Array.isArray(programs) ? programs : [];

  // Filter only published programs
  const publishedPrograms = safePrograms
    .filter(p => p && p.isPublished)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {publishedPrograms.map((p, index) => (
            <ProgramCardItem key={p.id} program={p} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};
