/**
 * PillarsSection.tsx
 * Interactive 4-pillar section for the ISM institutional site.
 * WCAG 2.1 AA+ compliant: ARIA tablist/tab/tabpanel, keyboard nav, focus management.
 */
import React, { useState, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Leaf, Palette, ArrowRight, TrendingUp, MapPin, Award } from 'lucide-react';
import type { PillarKey } from '../ui/PillarBadge';

/* ── Pillar Data ─────────────────────────────────────────────────── */
interface PillarKPI {
  value: string;
  label: string;
  icon: React.ElementType;
}
interface PillarData {
  key: PillarKey;
  order: number;
  label: string;
  headline: string;
  description: string;
  longDescription: string;
  Icon: React.ElementType;
  color: string;          // accent hex
  colorLight: string;     // tint hex
  gradient: string;       // CSS gradient string
  bgClass: string;        // CSS class from index.css
  kpis: PillarKPI[];
  programs: string[];
  ctaHref: string;
}

const PILLARS: PillarData[] = [
  {
    key: 'education',
    order: 1,
    label: 'Educação',
    headline: 'Formando líderes que transformam o amanhã',
    description: 'Acreditamos que a educação de qualidade é a alavanca mais poderosa para romper ciclos de vulnerabilidade.',
    longDescription:
      'Nossos programas de educação cobrem desde a literacia digital para jovens em situação de risco até bolsas de formação continuada para educadores de base. Utilizamos metodologias ativas, tecnologia e mentoria para garantir que cada aluno desenvolva pensamento crítico, competências digitais e protagonismo social.',
    Icon: BookOpen,
    color: '#1E3A8A',
    colorLight: '#dbeafe',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3b82f6 100%)',
    bgClass: 'pillar-bg-edu',
    kpis: [
      { value: '18.400+', label: 'Estudantes atendidos', icon: Users },
      { value: '142',     label: 'Escolas parceiras',   icon: MapPin },
      { value: '94%',     label: 'Aprovação ensino médio', icon: Award },
    ],
    programs: ['Bolsas Universitárias', 'Letramento Digital', 'Mentoria de Carreira', 'Formação de Professores'],
    ctaHref: '#programs',
  },
  {
    key: 'social',
    order: 2,
    label: 'Social',
    headline: 'Redes de proteção que ninguém deixa para trás',
    description: 'Construímos sistemas de apoio social resilientes, centrados na dignidade e na autonomia das pessoas.',
    longDescription:
      'Atuamos na linha de frente da vulnerabilidade social, oferecendo assistência jurídica, apoio psicossocial, programas de habitação digna e geração de renda para famílias em situação de extrema pobreza. Cada ação é co-desenhada com as próprias comunidades beneficiárias.',
    Icon: Users,
    color: '#D97706',
    colorLight: '#fef3c7',
    gradient: 'linear-gradient(135deg, #D97706 0%, #fbbf24 100%)',
    bgClass: 'pillar-bg-soc',
    kpis: [
      { value: '32.000+', label: 'Famílias assistidas',  icon: Users },
      { value: '78',      label: 'Municípios cobertos',  icon: MapPin },
      { value: 'R$4,85',  label: 'SROI por real investido', icon: TrendingUp },
    ],
    programs: ['Assistência Jurídica Gratuita', 'Apoio Psicossocial', 'Geração de Renda', 'Habitação Digna'],
    ctaHref: '#programs',
  },
  {
    key: 'environment',
    order: 3,
    label: 'Meio Ambiente',
    headline: 'Protegendo os biomas para as próximas gerações',
    description: 'Ciência, tecnologia e comunidade unidas na defesa dos ecossistemas brasileiros.',
    longDescription:
      'Combinamos monitoramento via satélite, educação ambiental comunitária e advocacia de políticas públicas para proteger biomas críticos. Nossos projetos de restauração ecológica já reintegraram milhares de hectares ao sistema hídrico nacional, reduzindo desertificação e preservando biodiversidade.',
    Icon: Leaf,
    color: '#15803D',
    colorLight: '#dcfce7',
    gradient: 'linear-gradient(135deg, #15803D 0%, #22c55e 100%)',
    bgClass: 'pillar-bg-env',
    kpis: [
      { value: '12.800ha', label: 'Áreas restauradas', icon: Leaf },
      { value: '2.4M t',   label: 'CO₂ evitados',      icon: TrendingUp },
      { value: '87',       label: 'Comunidades ribeirinhas', icon: Users },
    ],
    programs: ['Restauração de Biomas', 'Monitoramento Satelital', 'Educação Ambiental', 'Crédito de Carbono Social'],
    ctaHref: '#programs',
  },
  {
    key: 'culture',
    order: 4,
    label: 'Cultura',
    headline: 'Arte e memória como instrumentos de liberdade',
    description: 'A expressão cultural é um direito humano fundamental e um vetor poderoso de transformação social.',
    longDescription:
      'Financiamos e co-produzimos projetos culturais em periferias e territórios historicamente invisibilizados. De bibliotecas comunitárias a festivais de cinema, teatro e música, acreditamos que a arte é a linguagem universal que une comunidades, preserva identidades e alimenta a esperança.',
    Icon: Palette,
    color: '#C2410C',
    colorLight: '#ffedd5',
    gradient: 'linear-gradient(135deg, #C2410C 0%, #f97316 100%)',
    bgClass: 'pillar-bg-cul',
    kpis: [
      { value: '380+',  label: 'Projetos culturais financiados', icon: Award },
      { value: '96',    label: 'Territórios alcançados',         icon: MapPin },
      { value: '1.2M+', label: 'Espectadores / participantes',   icon: Users },
    ],
    programs: ['Bibliotecas Comunitárias', 'Cinema nas Periferias', 'Festivais Culturais', 'Patrimônio Imaterial'],
    ctaHref: '#programs',
  },
];

/* ── Component ───────────────────────────────────────────────────── */
export const PillarsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionId = useId();
  const panelId = `${sectionId}-panel`;

  const activePillar = PILLARS[activeIdx];

  /* Keyboard navigation for ARIA tablist */
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % PILLARS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + PILLARS.length) % PILLARS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = PILLARS.length - 1;
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
          {PILLARS.map((p, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={p.key}
                id={`${sectionId}-tab-${p.key}`}
                ref={(el) => { tabsRef.current[idx] = el; }}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onClick={() => setActiveIdx(idx)}
                className="relative flex items-center gap-2.5 px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-950"
                style={{
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? p.gradient : 'rgba(255,255,255,0.05)',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 4px 24px ${p.color}40` : 'none',
                  // @ts-ignore
                  '--tw-ring-color': p.color,
                }}
              >
                <p.Icon size={15} aria-hidden="true" />
                <span>
                  <span className="text-[10px] block opacity-70 uppercase tracking-wider leading-none">
                    {p.order}º Pilar
                  </span>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Panel */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${sectionId}-tab-${activePillar.key}`}
          tabIndex={0}
          data-testid="pillar-panel"
          className="focus-visible:outline-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Left: Text content */}
              <div>
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{ background: activePillar.gradient, boxShadow: `0 8px 32px ${activePillar.color}50` }}
                  aria-hidden="true"
                >
                  <activePillar.Icon size={26} className="text-white" />
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-snug">
                  {activePillar.headline}
                </h3>
                <p className="text-secondary-300 text-lg leading-relaxed mb-6">
                  {activePillar.longDescription}
                </p>

                {/* Programs list */}
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: activePillar.color }}>
                    Programas em destaque
                  </p>
                  <ul className="grid grid-cols-2 gap-2" aria-label={`Programas do pilar ${activePillar.label}`}>
                    {activePillar.programs.map((prog) => (
                      <li
                        key={prog}
                        className="flex items-center gap-2 text-sm text-secondary-300"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: activePillar.color }}
                          aria-hidden="true"
                        />
                        {prog}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={activePillar.ctaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all duration-200 hover:scale-105"
                  style={{
                    background: activePillar.gradient,
                    boxShadow: `0 4px 20px ${activePillar.color}50`,
                  }}
                >
                  Ver projetos deste pilar
                  <ArrowRight size={15} aria-hidden="true" />
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
                        className="text-2xl font-black leading-none"
                        aria-label={`${kpi.value} — ${kpi.label}`}
                        style={{ color: activePillar.colorLight !== '#fff' ? '#fff' : '#fff' }}
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
          {PILLARS.map((p, idx) => (
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
