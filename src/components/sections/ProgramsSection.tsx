import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ExternalLink, Users, BarChart3, Globe, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { ProgramData } from '../../types';

interface Props {
  programs: ProgramData[];
  servicesPage?: Record<string, any> | null;
  isLoading?: boolean;
}


// ── Skeleton de carregamento ────────────────────────────────────────────────
const ProgramCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-full animate-pulse"
    style={{ animationDelay: `${index * 0.1}s` }}
    aria-hidden="true"
  >
    <div className="h-52 bg-slate-200" />
    <div className="p-6 md:p-8 flex flex-col flex-grow gap-4">
      <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-100 rounded-lg w-full" />
      <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
      <div className="mt-auto flex gap-2">
        <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Card do Programa ────────────────────────────────────────────────────────
const ProgramCardItem: React.FC<{ program: ProgramData; index: number; isInView: boolean }> = ({
  program: p,
  index,
  isInView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `program-content-${p.id}`;

  const hasExtraContent = Boolean(
    p.longDescription ||
      (p.pillars && p.pillars.length > 0) ||
      (p.actionLines && p.actionLines.length > 0) ||
      p.commitment
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Preview / Icon */}
      <div className="relative h-52 overflow-hidden bg-slate-200 shrink-0">
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
            <span
              key={tIdx}
              className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur text-[10px] font-bold text-secondary-800 uppercase tracking-wider shadow-sm"
            >
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

        {/* Description & Collapsible Content */}
        <div className="relative flex-grow">
          {/* Main Description (First Paragraph / Resumo) */}
          <p className="text-secondary-600 text-sm leading-relaxed mb-4 font-normal">
            {p.description}
          </p>

          {/* Expanded Extra Content */}
          {hasExtraContent && (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  id={contentId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden space-y-5 pt-2 text-secondary-600 text-sm leading-relaxed"
                >
                  {/* Long Description Paragraphs */}
                  {p.longDescription && (
                    <div className="space-y-3 border-t border-gray-200/80 pt-4">
                      {p.longDescription.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-secondary-600 font-normal">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Nossos Pilares */}
                  {p.pillars && p.pillars.length > 0 && (
                    <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        {p.pillarsTitle || 'Nossos pilares'}
                      </h4>
                      <ul className="space-y-2">
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
                    <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                        {p.actionLinesTitle || 'Linhas de atuação'}
                      </h4>
                      {p.actionLinesSub && (
                        <p className="text-xs text-secondary-600 font-medium leading-relaxed">
                          {p.actionLinesSub}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {p.actionLines.map((lineItem, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-secondary-700 font-medium leading-snug">
                            <CheckCircle2 size={14} className="text-brand-600 shrink-0 mt-0.5" />
                            <span>{lineItem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nosso Compromisso */}
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
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Gradient fade visual indicator when collapsed */}
          {hasExtraContent && !isExpanded && (
            <div className="h-6 w-full bg-gradient-to-t from-slate-50 to-transparent absolute bottom-0 left-0 pointer-events-none" />
          )}
        </div>

        {/* Info Blocks */}
        <div className="space-y-3.5 mb-6 border-t border-gray-200/80 pt-5 mt-4">
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
          {/* Primary CTA — hierarquia: expand > ctaUrl > auraProjectUrl > websiteUrl > expand fallback */}
          {hasExtraContent ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              className="w-full py-3 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-800 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>{isExpanded ? 'Mostrar Menos' : (p.ctaLabel || 'Saiba Mais')}</span>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          ) : p.ctaLabel && p.ctaUrl ? (
            /* CTA configurado no admin — link direto */
            <a
              href={p.ctaUrl}
              target={p.ctaUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="w-full py-3 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {p.ctaLabel}
              {p.ctaUrl.startsWith('http') && <ExternalLink size={12} className="opacity-70" />}
            </a>
          ) : p.auraProjectUrl ? (
            /* Fallback: URL do Projeto Aura */
            <a
              href={p.auraProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-800 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {p.ctaLabel || 'Saiba Mais'}
              <ExternalLink size={12} className="opacity-70" />
            </a>
          ) : (
            /* Fallback final: botão expand mesmo sem conteúdo extra */
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              className="w-full py-3 bg-secondary-900 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary-800 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isExpanded ? 'Mostrar Menos' : (p.ctaLabel || 'Saiba Mais')}</span>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}

          {/* Link externo secundário (websiteUrl / linkUrl) */}
          {(p.linkUrl || p.websiteUrl) && (
            <a
              href={p.linkUrl || p.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-center rounded-xl text-xs font-bold uppercase tracking-wider border border-brand-200/50 flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <Globe size={13} />
              <span>{p.linkLabel || 'Acessar Link Oficial'}</span>
              <ExternalLink size={11} className="opacity-60" />
            </a>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export const ProgramsSection: React.FC<Props> = ({ programs = [], servicesPage, isLoading = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const sectionBadge = servicesPage?.sectionBadge || 'O Que Fazemos';
  const sectionTitle = servicesPage?.sectionTitle || 'Projetos em Campo';
  const sectionSubtitle = servicesPage?.sectionSubtitle || 'Iniciativas de alto impacto social, ambiental e educacional transformando realidades diariamente.';

  const safePrograms = Array.isArray(programs) ? programs : [];

  // Ordena por campo order — o hook useRealtimePrograms já filtra isPublished server-side
  // Mantemos filtragem client-side apenas como salvaguarda para dados do fallback inicial
  const publishedPrograms = safePrograms
    .filter(p => p && (p.isPublished === true || p.isPublished === undefined))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Enquanto carrega, mostra skeleton; se vazio e já carregou, oculta a seção
  if (!isLoading && publishedPrograms.length === 0) return null;

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

        {/* Programs Grid — Skeleton durante carregamento, cards reais quando prontos */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start"
          aria-label={isLoading ? "Carregando projetos em campo" : undefined}
        >
          {isLoading && publishedPrograms.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <ProgramCardSkeleton key={i} index={i} />)
            : publishedPrograms.map((p, index) => (
                <ProgramCardItem key={p.id} program={p} index={index} isInView={isInView} />
              ))
          }
        </div>
      </div>
    </section>
  );
};


