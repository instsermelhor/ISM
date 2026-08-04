import React, { useRef, useState } from 'react';
import { Building2, Handshake, Globe, TrendingUp, ExternalLink, Award } from 'lucide-react';
import { PartnerApplicationForm } from '../forms/PartnerApplicationForm';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface PublishedPartner {
  id?: string;
  order?: number;
  name: string;
  category?: 'GLOBAL' | 'ESTRATEGICO' | 'INSTITUCIONAL' | 'TECNICO' | string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  isPublished?: boolean;
  tier?: 'TIER_1' | 'TIER_2' | 'TIER_3' | string;
}

export interface PartnerSectionProps {
  servicesPage?: Record<string, any> | null;
  partners?: PublishedPartner[];
}

// ── Benefícios padrão (fallback quando admin não configurou) ─────────────────

const DEFAULT_BENEFITS = [
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
    description: 'Integração ao nosso Ecossistema Colaborativo Estratégico com parceiros em mais de 20 países.',
  },
  {
    Icon: TrendingUp,
    title: 'Visibilidade ESG',
    description: 'Reconhecimento público em relatórios de impacto e eventos institucionais de alto nível.',
  },
];

const DEFAULT_BADGES = ['ISO 9001', 'ODS ONU', 'LGPD Compliant'];

// ── Cores de categoria ─────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  GLOBAL:       '#1E3A8A',
  ESTRATEGICO:  '#15803D',
  INSTITUCIONAL:'#C2410C',
  TECNICO:      '#7C3AED',
};

const CATEGORY_LABEL: Record<string, string> = {
  GLOBAL:       'Global',
  ESTRATEGICO:  'Estratégico',
  INSTITUCIONAL:'Institucional',
  TECNICO:      'Técnico',
};

const TIER_LABEL: Record<string, string> = {
  TIER_1: 'Parceiro Premier',
  TIER_2: 'Parceiro Gold',
  TIER_3: 'Parceiro',
};

// ── Componente de card de parceiro ────────────────────────────────────────────

const PartnerCard: React.FC<{ partner: PublishedPartner; index: number; isInView: boolean }> = ({
  partner,
  index,
  isInView,
}) => {
  const catColor = CATEGORY_COLOR[partner.category ?? ''] ?? '#64748b';
  const tierLabel = TIER_LABEL[partner.tier ?? ''] ?? '';
  const categoryLabel = CATEGORY_LABEL[partner.category ?? ''] ?? partner.category ?? '';

  return (
    <motion.a
      href={partner.websiteUrl || '#'}
      target={partner.websiteUrl && partner.websiteUrl !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05 * index }}
      className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      aria-label={`Parceiro: ${partner.name}${partner.websiteUrl ? ' — visitar site' : ''}`}
    >
      {/* Tier badge */}
      {partner.tier === 'TIER_1' && (
        <span
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: `${catColor}15`, color: catColor }}
        >
          <Award size={10} />
          Premier
        </span>
      )}

      {/* Logo / Placeholder */}
      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-brand-200 transition-colors">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={`Logo ${partner.name}`}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).innerHTML =
                `<span class="text-xs font-bold text-slate-400 text-center px-1">${partner.name.substring(0, 2).toUpperCase()}</span>`;
            }}
          />
        ) : (
          <span className="text-xl font-black text-slate-400">
            {partner.name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-sm font-bold text-secondary-800 group-hover:text-brand-700 transition-colors line-clamp-2">
          {partner.name}
        </p>
        {categoryLabel && (
          <span
            className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${catColor}12`, color: catColor }}
          >
            {categoryLabel}
          </span>
        )}
      </div>

      {/* External link indicator */}
      {partner.websiteUrl && partner.websiteUrl !== '#' && (
        <ExternalLink
          size={12}
          className="absolute bottom-3 right-3 text-slate-300 group-hover:text-brand-400 transition-colors"
        />
      )}
    </motion.a>
  );
};

// ── Componente Principal ───────────────────────────────────────────────────────

export const PartnerSection: React.FC<PartnerSectionProps> = ({
  servicesPage,
  partners = [],
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [showForm, setShowForm] = useState(false);

  // Dados dinâmicos do admin com fallback nos padrões
  const dynamicBenefits = servicesPage?.partnerBenefits?.length
    ? servicesPage.partnerBenefits
    : DEFAULT_BENEFITS;
  const dynamicBadges: string[] = servicesPage?.trustBadges?.length
    ? servicesPage.trustBadges
    : DEFAULT_BADGES;
  const title    = servicesPage?.partnerTitle    || null;
  const subtitle = servicesPage?.partnerSubtitle || null;
  const badge    = servicesPage?.partnerBadge    || 'Seja Parceiro';

  // Separar parceiros por tier para exibição hierárquica
  const tier1 = partners.filter(p => p.tier === 'TIER_1');
  const tier2 = partners.filter(p => p.tier === 'TIER_2');
  const tier3 = partners.filter(p => p.tier === 'TIER_3');
  const noTier = partners.filter(p => !p.tier);

  const hasPartners = partners.length > 0;

  return (
    <>
      {/* ── Seção de Parceiros Publicados ───────────────────────────────── */}
      {hasPartners && (
        <section
          id="partners"
          aria-label="Nossos Parceiros"
          className="py-16 bg-slate-50 border-t border-slate-100"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                <Globe size={12} />
                Rede de Colaboração Estratégica
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-secondary-900 mb-3 leading-tight">
                Nossos <span className="text-gradient-brand">Parceiros</span>
              </h2>
              <p className="text-secondary-500 max-w-lg mx-auto text-base leading-relaxed">
                Organizações globais que compartilham nossa visão de impacto sistêmico e desenvolvimento sustentável.
              </p>
            </motion.div>

            {/* Tier 1 — Premier Partners */}
            {tier1.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-400 mb-4 flex items-center gap-2">
                  <Award size={12} className="text-brand-500" />
                  Parceiros Premier
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tier1.map((p, i) => (
                    <PartnerCard key={p.id || p.name} partner={p} index={i} isInView={isInView} />
                  ))}
                </div>
              </div>
            )}

            {/* Tier 2 — Gold Partners */}
            {tier2.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-400 mb-4">
                  Parceiros Gold
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {tier2.map((p, i) => (
                    <PartnerCard key={p.id || p.name} partner={p} index={i} isInView={isInView} />
                  ))}
                </div>
              </div>
            )}

            {/* Tier 3 + sem tier */}
            {[...tier3, ...noTier].length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {[...tier3, ...noTier].map((p, i) => (
                  <PartnerCard key={p.id || p.name} partner={p} index={i} isInView={isInView} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Seção de Parceria (CTA + formulário) ────────────────────────── */}
      <section id="partner" className="py-12 md:py-16 bg-white section-pattern overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">

            {/* Left Column: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2 lg:sticky top-24"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-700 text-xs font-bold uppercase tracking-widest rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                {badge}
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-5 leading-tight">
                {title
                  ? title
                  : (<>Construa o Futuro{' '}<span className="text-gradient-brand">Conosco</span></>)
                }
              </h2>
              <p className="text-lg text-secondary-500 mb-10 leading-relaxed">
                {subtitle || 'Buscamos alianças estratégicas com organizações e líderes comprometidos com o desenvolvimento sustentável. Junte-se ao nosso Ecossistema Colaborativo e amplifique seu impacto ESG.'}
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {(dynamicBenefits as any[]).map((b: any, i: number) => {
                  const Icon = b.Icon || Building2;
                  const emoji = b.icon;
                  return (
                    <motion.div
                      key={b.id || b.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                      className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-secondary-600 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all duration-200 shrink-0 shadow-sm">
                        {emoji ? <span className="text-xl">{emoji}</span> : <Icon size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary-900 text-sm mb-1">{b.title}</h4>
                        <p className="text-xs text-secondary-400 leading-relaxed">{b.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 flex-wrap">
                {dynamicBadges.map((b: string) => (
                  <span
                    key={b}
                    className="px-3 py-1.5 rounded-full border border-secondary-200 text-secondary-500 text-xs font-bold uppercase tracking-wider"
                  >
                    {b}
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
    </>
  );
};