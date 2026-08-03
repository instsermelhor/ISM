/**
 * PillarsSection.tsx
 * Interactive 4-pillar section for the ISM institutional site.
 * WCAG 2.1 AA+ compliant: ARIA tablist/tab/tabpanel, keyboard nav, focus management.
 */
import React, { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Leaf, Palette, ArrowRight, TrendingUp, MapPin, Award } from 'lucide-react';
import type { PillarKey } from '../ui/PillarBadge';

export interface PillarsSectionProps {
  pillars?: any[];
}

const PILLAR_ICON_MAP: Record<string, React.ElementType> = {
  'book-open': BookOpen,
  users: Users,
  leaf: Leaf,
  palette: Palette,
};

const DEFAULT_PILLARS = [
  {
    key: 'education',
    order: 1,
    label: 'Educação',
    headline: 'Formando líderes que transformam o amanhã',
    description: 'Acreditamos que a educação de qualidade é a alavanca mais poderosa para romper ciclos de vulnerabilidade.',
    longDescription: 'Nossos programas de educação cobrem desde a literacia digital para jovens em situação de risco até bolsas de formação continuada para educadores de base.',
    iconKey: 'book-open',
    color: '#1E3A8A',
    colorLight: '#dbeafe',
    bgClass: 'pillar-bg-edu',
    kpis: [{ value: '18.400+', label: 'Estudantes atendidos' }, { value: '142', label: 'Escolas parceiras' }],
    programs: ['Bolsas Universitárias', 'Letramento Digital', 'Mentoria de Carreira'],
    ctaHref: '#programs',
  },
  {
    key: 'social',
    order: 2,
    label: 'Social',
    headline: 'Redes de proteção que ninguém deixa para trás',
    description: 'Construímos sistemas de apoio social resilientes, centrados na dignidade e na autonomia das pessoas.',
    longDescription: 'Atuamos na linha de frente da vulnerabilidade social, oferecendo assistência jurídica, apoio psicossocial e geração de renda.',
    iconKey: 'users',
    color: '#C2410C',
    colorLight: '#ffedd5',
    bgClass: 'pillar-bg-soc',
    kpis: [{ value: '32.000+', label: 'Famílias assistidas' }, { value: '78', label: 'Municípios cobertos' }],
    programs: ['Assistência Jurídica Gratuita', 'Apoio Psicossocial', 'Geração de Renda'],
    ctaHref: '#programs',
  },
  {
    key: 'environment',
    order: 3,
    label: 'Meio Ambiente',
    headline: 'Protegendo biomas para as próximas gerações',
    description: 'Nossas ações ambientais integram conservação, restauração ecológica e educação ambiental transformadora.',
    longDescription: 'Desenvolvemos projetos de proteção e restauração de biomas brasileiros, combinando ciência de ponta e participação comunitária.',
    iconKey: 'leaf',
    color: '#15803D',
    colorLight: '#dcfce7',
    bgClass: 'pillar-bg-env',
    kpis: [{ value: '120k', label: 'Hectares recuperados' }, { value: '850k', label: 'Árvores plantadas' }],
    programs: ['Reflorestamento', 'Educação Ambiental', 'Monitoramento por Satélite'],
    ctaHref: '#programs',
  },
  {
    key: 'culture',
    order: 4,
    label: 'Cultura & Arte',
    headline: 'Arte como ferramenta de transformação social',
    description: 'Acreditamos no poder da cultura e da arte para restaurar identidades e fortalecer comunidades.',
    longDescription: 'Nossos programas culturais oferecem acesso democrático à arte, à música, ao teatro e à literatura para comunidades historicamente desatendidas.',
    iconKey: 'palette',
    color: '#7C3AED',
    colorLight: '#ede9fe',
    bgClass: 'pillar-bg-cul',
    kpis: [{ value: '200+', label: 'Projetos culturais' }, { value: '45k+', label: 'Participantes' }],
    programs: ['Arte-Educação', 'Música nas Escolas', 'Teatro Comunitário'],
    ctaHref: '#programs',
  },
];

export const PillarsSection: React.FC<PillarsSectionProps> = ({ pillars: customPillars }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionId = useId();
  const panelId = `${sectionId}-panel`;

  const rawPillars = customPillars && customPillars.length > 0 ? customPillars : DEFAULT_PILLARS;

  const list = rawPillars.map((p, i) => ({
    key: p.key || `pillar-${i}`,
    order: p.order || i + 1,
    label: p.label || '',
    headline: p.headline || '',
    description: p.description || '',
    longDescription: p.longDescription || '',
    Icon: PILLAR_ICON_MAP[p.iconKey] || BookOpen,
    color: p.color || '#1E3A8A',
    colorLight: p.colorLight || '#dbeafe',
    gradient: `linear-gradient(135deg, ${p.color || '#1E3A8A'} 0%, #3b82f6 100%)`,
    bgClass: p.bgClass || 'pillar-bg-edu',
    kpis: (p.kpis || []).map((k: any) => ({
      value: k.value,
      label: k.label,
      icon: Users,
    })),
    programs: p.programs || [],
    ctaHref: p.ctaHref || '#programs',
  }));

  const activePillar = list[activeIdx] || list[0];

  /* Keyboard navigation for ARIA tablist */
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % list.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    else return;
    e.preventDefault();
    setActiveIdx(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <section
      id="pillars"
      aria-label="Os 4 Pilares do Instituto Ser Melhor"
      className="py-24 bg-secondary-950 relative overflow-hidden"
    >
      {/* Ambient light from active pillar */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 70% 40%, ${activePillar.color}18 0%, transparent 65%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-5 text-xs font-bold uppercase tracking-widest"
            style={{
              color: activePillar.color,
              borderColor: `${activePillar.color}40`,
              background: `${activePillar.color}12`,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: activePillar.color }} aria-hidden="true" />
            Nossos Pilares de Atuação
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            4 Pilares,{' '}
            <span
              style={{
                background: activePillar.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              1 Missão
            </span>
          </h2>
          <p className="text-secondary-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Atuamos em quatro dimensões complementares que, juntas, criam as condições para uma transformação social sistêmica e duradoura.
          </p>
        </motion.div>

        {/* Tab Bar */}
        <div
          role="tablist"
          aria-label="Pilares institucionais"
          aria-orientation="horizontal"
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {list.map((p, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={p.key}
                ref={(el) => { tabsRef.current[idx] = el; }}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIdx(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-secondary-900/80 text-secondary-400 border border-secondary-800 hover:text-white hover:border-secondary-700'
                }`}
                style={
                  isActive
                    ? {
                        background: p.gradient,
                        boxShadow: `0 8px 24px ${p.color}40`,
                      }
                    : {}
                }
              >
                <p.Icon size={18} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`tab-${activePillar.key}`}
          tabIndex={0}
          className="bg-secondary-900/90 border border-secondary-800 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              {/* Left & Middle: Details */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {activePillar.headline}
                </h3>
                <p className="text-secondary-300 text-base leading-relaxed mb-6">
                  {activePillar.longDescription || activePillar.description}
                </p>

                {/* Programs Chips */}
                {activePillar.programs.length > 0 && (
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-400 mb-3">
                      Programas Relacionados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activePillar.programs.map((prog: string) => (
                        <span
                          key={prog}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border"
                          style={{
                            color: activePillar.colorLight,
                            borderColor: `${activePillar.color}40`,
                            background: `${activePillar.color}15`,
                          }}
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={activePillar.ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all shadow-md hover:scale-105"
                  style={{ background: activePillar.gradient }}
                >
                  <span>Conhecer Projetos de {activePillar.label}</span>
                  <ArrowRight size={16} />
                </a>
              </div>

              {/* Right: KPIs */}
              <div className="grid grid-cols-1 gap-4">
                {activePillar.kpis.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center gap-5 p-5 rounded-2xl"
                    style={{
                      background: `${activePillar.color}10`,
                      border: `1px solid ${activePillar.color}25`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: activePillar.gradient }}
                      aria-hidden="true"
                    >
                      <kpi.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-black leading-none text-white"
                        aria-label={`${kpi.value} — ${kpi.label}`}
                      >
                        {kpi.value}
                      </p>
                      <p className="text-secondary-400 text-sm mt-1">{kpi.label}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Pillar number indicator */}
                <div
                  className="text-right text-[80px] font-black leading-none select-none pointer-events-none"
                  style={{ color: `${activePillar.color}15` }}
                  aria-hidden="true"
                >
                  {activePillar.order}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pillar dots progress */}
        <div className="flex justify-center gap-2.5 mt-10" aria-hidden="true">
          {list.map((p, idx) => (
            <button
              key={p.key}
              onClick={() => setActiveIdx(idx)}
              tabIndex={-1}
              className="transition-all duration-300 rounded-full"
              style={{
                width: idx === activeIdx ? 28 : 8,
                height: 8,
                background: idx === activeIdx ? activePillar.color : 'rgba(255,255,255,0.2)',
              }}
              aria-label={`Ir para pilar ${p.label}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
