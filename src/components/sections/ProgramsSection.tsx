import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ExternalLink, Users, BarChart3, ChevronDown, ChevronUp,
  CheckCircle2, Globe, BookOpen, FileText, BarChart2, ClipboardList,
  Target, Lightbulb, Layers
} from 'lucide-react';
import { ProgramData, ProgramGalleryImage } from '../../types';
import { ProgramGallery } from './ProgramGallery';

interface Props {
  programs: ProgramData[];
  servicesPage?: Record<string, any> | null;
  isLoading?: boolean;
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
const ProgramCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-full animate-pulse"
    style={{ animationDelay: `${index * 0.1}s` }}
    aria-hidden="true"
  >
    <div className="h-44 sm:h-48 bg-slate-200" />
    <div className="p-5 md:p-6 flex flex-col flex-grow gap-4">
      <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-100 rounded-lg w-full" />
      <div className="mt-auto flex gap-2">
        <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Link Row helper ──────────────────────────────────────────────────────────
const LinkRow: React.FC<{ href: string; icon: React.ElementType; label: string }> = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${label} (abre em nova aba)`}
    className="flex items-center gap-1.5 text-xs text-brand-700 font-semibold hover:text-brand-900 hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
  >
    <Icon size={12} className="shrink-0" />
    <span className="truncate">{label}</span>
    <ExternalLink size={10} className="shrink-0 opacity-60" />
  </a>
);

// ── Program Card ─────────────────────────────────────────────────────────────
const ProgramCardItem: React.FC<{ program: ProgramData; index: number; isInView: boolean }> = ({
  program: p,
  index,
  isInView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `program-content-${p.id}`;

  // Determina o botão secundário (Projeto AURA ou CTA customizado)
  const auraUrl = p.auraProjectUrl ||
    ((p.ctaLabel?.toLowerCase().includes('aura') || p.linkLabel?.toLowerCase().includes('aura')) ? (p.ctaUrl || p.linkUrl) : undefined);
  const hasAuraButton = Boolean(auraUrl);

  // CTA customizado não-AURA
  const hasCustomCta = Boolean(
    (p.ctaLabel && p.ctaLabel !== 'Saiba Mais' && p.ctaUrl && p.ctaUrl !== '#' && !p.ctaLabel.toLowerCase().includes('aura')) ||
    (p.linkUrl && p.linkLabel && !p.linkLabel.toLowerCase().includes('aura'))
  );
  const customCtaLabel = (p.ctaLabel && p.ctaLabel !== 'Saiba Mais' && !p.ctaLabel.toLowerCase().includes('aura'))
    ? p.ctaLabel
    : (p.linkLabel || 'Acessar Link Oficial');
  const customCtaUrl = (p.ctaUrl && p.ctaUrl !== '#' && !p.ctaLabel?.toLowerCase().includes('aura'))
    ? p.ctaUrl
    : p.linkUrl;

  const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;

  const hasExtraContent = Boolean(
    p.description ||
    p.longDescription ||
    p.objectives ||
    p.methodology ||
    (p.pillars && p.pillars.length > 0) ||
    (p.actionLines && p.actionLines.length > 0) ||
    p.commitment ||
    p.targetAudience ||
    (p.impactMetric && p.impactValue) ||
    p.expectedResults ||
    hasGallery ||
    p.websiteUrl ||
    p.documentsUrl ||
    p.reportsUrl ||
    p.participationFormUrl ||
    p.institutionalPageUrl
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-slate-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* ── Imagem Principal ── */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-200 shrink-0">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.imageAlt || p.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-950 text-white text-5xl">
            {p.iconEmoji || '🎯'}
          </div>
        )}
        {p.imageUrl && p.iconEmoji && (
          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-lg select-none">
            {p.iconEmoji}
          </div>
        )}
        {/* Badge destaque */}
        {p.isFeatured && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-brand-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            Destaque
          </div>
        )}
      </div>

      {/* ── Corpo do Card ── */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        {/* Categoria / Área Temática */}
        {(p.category || p.thematicArea) && (
          <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">
            {p.thematicArea || p.category}
          </div>
        )}

        {/* Título */}
        <h3 className="text-lg font-bold text-secondary-900 mb-4 group-hover:text-brand-600 transition-colors duration-200 leading-snug">
          {p.title}
        </h3>

        {/* Subtítulo — visível no estado compacto */}
        {p.subtitle && !isExpanded && (
          <p className="text-sm text-secondary-500 font-light mb-3 leading-relaxed">
            {p.subtitle}
          </p>
        )}

        {/* ── Conteúdo Expandido ── */}
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

                {/* Objetivos */}
                {p.objectives && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                      <Target size={12} className="text-brand-600" />
                      Objetivos
                    </h4>
                    <p className="text-xs text-secondary-700 font-normal leading-relaxed">{p.objectives}</p>
                  </div>
                )}

                {/* Metodologia */}
                {p.methodology && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb size={12} className="text-brand-600" />
                      Metodologia
                    </h4>
                    <p className="text-xs text-secondary-700 font-normal leading-relaxed">{p.methodology}</p>
                  </div>
                )}

                {/* Pilares */}
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

                {/* Resultados Esperados */}
                {p.expectedResults && (
                  <div className="bg-white/90 rounded-2xl p-4 border border-brand-100 shadow-sm space-y-1.5">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={12} className="text-brand-600" />
                      Resultados Esperados
                    </h4>
                    <p className="text-xs text-secondary-700 font-normal leading-relaxed">{p.expectedResults}</p>
                  </div>
                )}

                {/* Compromisso */}
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

                {/* Galeria */}
                {hasGallery && (
                  <div className="border-t border-gray-200/80 pt-3">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-400" />
                      Galeria
                    </h4>
                    <ProgramGallery
                      gallery={p.gallery as ProgramGalleryImage[]}
                      programTitle={p.title}
                    />
                  </div>
                )}

                {/* Links Externos */}
                {(p.websiteUrl || p.institutionalPageUrl || p.auraProjectUrl || p.documentsUrl || p.reportsUrl || p.participationFormUrl) && (
                  <div className="border-t border-gray-200/80 pt-3 space-y-2">
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider mb-1">Links</h4>
                    {p.websiteUrl && <LinkRow href={p.websiteUrl} icon={Globe} label="Site Oficial" />}
                    {p.institutionalPageUrl && <LinkRow href={p.institutionalPageUrl} icon={BookOpen} label="Página Institucional" />}
                    {p.auraProjectUrl && <LinkRow href={p.auraProjectUrl} icon={ExternalLink} label="Projeto AURA" />}
                    {p.documentsUrl && <LinkRow href={p.documentsUrl} icon={FileText} label="Documentação" />}
                    {p.reportsUrl && <LinkRow href={p.reportsUrl} icon={BarChart2} label="Relatórios de Impacto" />}
                    {p.participationFormUrl && <LinkRow href={p.participationFormUrl} icon={ClipboardList} label="Formulário de Participação" />}
                  </div>
                )}

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

        {/* ── Botões ── */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
          {/* Saiba Mais / Mostrar Menos */}
          {hasExtraContent ? (
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
          ) : (
            <div className="flex-1 py-2.5 px-4 bg-secondary-100 text-secondary-400 text-center rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center">
              Em breve
            </div>
          )}

          {/* Botão AURA — visível no estado compacto */}
          {hasAuraButton && !isExpanded && (
            <a
              href={auraUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Conhecer o Projeto AURA - ${p.title}`}
              className="flex-1 py-2.5 px-4 bg-brand-600 text-white text-center rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Conhecer o AURA</span>
              <ExternalLink size={12} className="opacity-80" />
            </a>
          )}

          {/* CTA customizado não-AURA — visível no estado compacto */}
          {!hasAuraButton && hasCustomCta && !isExpanded && (
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

// ── Section ───────────────────────────────────────────────────────────────────
export const ProgramsSection: React.FC<Props> = ({ programs = [], servicesPage, isLoading }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Configuração da seção — gerenciada pelo Painel Administrativo via services_page/main
  const sectionBadge = servicesPage?.sectionBadge || 'O Que Fazemos';
  const sectionTitle = servicesPage?.sectionTitle || 'Projetos em Campo';
  const sectionSubtitle = servicesPage?.sectionSubtitle || 'Iniciativas de alto impacto social, ambiental e educacional transformando realidades diariamente.';

  const safePrograms = Array.isArray(programs) ? programs : [];
  // O hook useRealtimePrograms já filtra isPublished=true no servidor
  // Mantemos ordenação client-side como garantia
  const publishedPrograms = safePrograms.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Loading skeleton — exibido enquanto Firebase carrega
  if (isLoading) {
    return (
      <section id="programs" className="py-12 md:py-16 bg-white section-pattern" aria-label="Projetos em Campo - carregando">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="h-6 w-40 bg-slate-200 rounded-full mx-auto mb-5 animate-pulse" />
            <div className="h-10 w-72 bg-slate-200 rounded-xl mx-auto mb-4 animate-pulse" />
            <div className="h-5 w-96 bg-slate-100 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[0, 1, 2].map(i => <ProgramCardSkeleton key={i} index={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (publishedPrograms.length === 0) return null;

  return (
    <section id="programs" className="py-12 md:py-16 bg-white section-pattern" aria-labelledby="programs-heading">
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
          <h2 id="programs-heading" className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
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
