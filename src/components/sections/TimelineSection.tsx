/**
 * TimelineSection.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Linha do Tempo Institucional — Instituto Ser Melhor
 *
 * Layout: Horizontal interativo com Snap Scroll (mobile), seletores de anos
 * compactos, cards expansíveis por demanda (sem modal / popup), suporte total
 * à acessibilidade (WCAG 2.2 AA).
 *
 * Cards exibem inicialmente apenas: Ano · Título · Botão "Saiba Mais".
 * O conteúdo completo é revelado exclusivamente sob interação do usuário.
 *
 * Escalabilidade: a linha do tempo é renderizada a partir de uma lista
 * dinâmica — novos marcos podem ser adicionados sem alterar o JSX.
 *
 * Conteúdo: Cronologia canônica do ISM (2007–2025) embutida como constante
 * estática — funciona com e sem dados do Firestore/CMS.
 * Quando há dados do Firestore, eles têm prioridade; caso contrário,
 * o histórico oficial abaixo é exibido integralmente.
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  BookOpen,
  Users,
  ShieldCheck,
  Globe,
  TrendingUp,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { TimelineMilestoneAttributes } from '../../types';

// ── Tipos internos ────────────────────────────────────────────────────────────

/**
 * MilestoneEntry — estrutura canônica de cada marco histórico.
 *
 * Preparado para CMS/Painel Administrativo:
 *   • order       → define a sequência de exibição (padrão: year)
 *   • status      → "published" exibe o marco; "draft" oculta
 *   • publishedAt → data de publicação (ISO 8601)
 */
interface MilestoneEntry {
  year: number;
  title: string;
  full: string;           // Texto completo exibido ao expandir
  order?: number;         // CMS: ordem de exibição
  status?: 'published' | 'draft';
  publishedAt?: string;
}

interface Props {
  milestones?: TimelineMilestoneAttributes[];
}

// ── Cronologia Canônica do Instituto Ser Melhor (2007–2025) ──────────────────
// Fonte: Documentação oficial do ISM. Revisada conforme norma culta do PB.
// Para adicionar novos marcos: inserir objetos nesta lista — sem alterar JSX.

const CANONICAL_MILESTONES: MilestoneEntry[] = [
  {
    year: 2007,
    order: 1,
    status: 'published',
    title: 'Fundação Conceitual',
    full:
      'Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro, como pavimentação das vias, iluminação pública e infraestrutura urbana.',
  },
  {
    year: 2012,
    order: 2,
    status: 'published',
    title: 'A Associação a Serviço da Sociedade',
    full:
      'A Associação de Bairro Vila Margarida amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade, promovendo a distribuição de cestas básicas, leite e oferecendo transporte comunitário para facilitar o acesso da população aos serviços essenciais.',
  },
  {
    year: 2015,
    order: 3,
    status: 'published',
    title: 'Vila Margarida e a Educação',
    full:
      'É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica por meio de projetos educacionais.',
  },
  {
    year: 2017,
    order: 4,
    status: 'published',
    title: 'A Educação como Foco',
    full:
      'Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural, fortalecendo o compromisso com a transformação das comunidades atendidas.',
  },
  {
    year: 2022,
    order: 5,
    status: 'published',
    title: 'O Surgimento do Instituto Ser Melhor',
    full:
      'A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano, à inovação social e à ampliação do impacto das ações realizadas.',
  },
  {
    year: 2023,
    order: 6,
    status: 'published',
    title: 'Consolidação dos Valores Institucionais',
    full:
      'Os princípios, valores e diretrizes institucionais são revisados e fortalecidos com a participação de profissionais de diversas áreas. Neste mesmo período, o Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas, alinhando suas ações aos 17 Objetivos de Desenvolvimento Sustentável (ODS).',
  },
  {
    year: 2024,
    order: 7,
    status: 'published',
    title: 'Reconhecimento Internacional',
    full:
      'O Instituto Ser Melhor recebe o Global Excellence Award (GEA) em reconhecimento às suas boas práticas institucionais.\n\nA Metodologia M-IS passa a ser reconhecida como referência internacional em inovação social.\n\nTambém é implantada a metodologia SROI (Social Return on Investment), alcançando o índice de 1:4,83, demonstrando elevado retorno social sobre os investimentos realizados.',
  },
  {
    year: 2025,
    order: 8,
    status: 'published',
    title: 'Criação do Fundo Perpétuo',
    full:
      'É criado o Fundo Perpétuo (F-P), assegurando a sustentabilidade financeira da instituição e sua independência operacional.\n\nCom essa estrutura, 100% das doações recebidas passam a ser destinadas aos programas finalísticos, fortalecendo o compromisso com a transparência, a eficiência e o impacto social.',
  },
];

// ── Ícones temáticos por ano ──────────────────────────────────────────────────

const YEAR_ICONS: Record<number, React.ElementType> = {
  2007: Users,
  2012: ShieldCheck,
  2015: BookOpen,
  2017: Sparkles,
  2022: Landmark,
  2023: Globe,
  2024: Award,
  2025: TrendingUp,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converte dados do Firestore/CMS para o formato MilestoneEntry.
 * Suporta campos CMS: order, status, publishedAt.
 * Apenas marcos com status "published" (ou sem status) são exibidos.
 */
function firestoreToEntry(raw: any): MilestoneEntry | null {
  if (!raw) return null;
  const status = raw.status as 'published' | 'draft' | undefined;
  if (status === 'draft') return null;

  const rawFull = raw.impactDescription || raw.full || '';
  const full: string = typeof rawFull === 'string' ? rawFull : String(rawFull || '');

  return {
    year: Number(raw.year || 2007),
    title: String(raw.title || ''),
    full,
    order: raw.order != null ? Number(raw.order) : undefined,
    status: status || 'published',
    publishedAt: raw.publishedAt ? String(raw.publishedAt) : undefined,
  };
}

// ── Animação de expansão/colapso ──────────────────────────────────────────────

const expandVariants = {
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    marginTop: 12,
    transition: {
      height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.25, delay: 0.05 },
      marginTop: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.15 },
      marginTop: { duration: 0.28 },
    },
  },
};

// ── Subcomponente: Card de marco histórico ────────────────────────────────────

interface CardProps {
  entry: MilestoneEntry;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  cardId: string;
  descId: string;
  tabId: string;
}

const MilestoneCard: React.FC<CardProps> = React.memo(
  ({
    entry,
    isSelected,
    isExpanded,
    onSelect,
    onToggleExpand,
    cardId,
    descId,
    tabId,
  }) => {
    const IconComponent = YEAR_ICONS[entry.year] ?? Calendar;
    const safeFull = typeof entry.full === 'string' ? entry.full : '';
    const fullParagraphs = safeFull.split('\n').filter((p) => p.trim() !== '');

    // Suporte a teclado no card (Enter/Space seleciona; não conflita com botão)
    const handleCardKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }
      },
      [onSelect],
    );

    return (
      <div
        id={cardId}
        role="tabpanel"
        aria-labelledby={tabId}
        /**
         * snap-center: um card por vez no mobile.
         * shrink-0: impede encolhimento no flex container.
         * Largura reduzida ~38% em relação ao layout anterior (300–360px → 200–220px).
         */
        className="snap-center shrink-0 w-[200px] sm:w-[210px] lg:w-[220px] flex flex-col"
        onClick={onSelect}
        onKeyDown={handleCardKeyDown}
        tabIndex={-1}
      >
        <div
          className={[
            /**
             * Padding reduzido de p-6 (24px) → p-3.5 (14px) — redução de ~42%.
             * rounded-2xl (vs rounded-3xl anterior).
             * flex-col sem flex-1 para que a altura seja ditada pelo conteúdo.
             */
            'p-3.5 rounded-2xl border flex flex-col transition-all duration-300 cursor-default',
            isSelected
              ? 'bg-slate-800/95 border-brand-500/50 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30'
              : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600/80 hover:bg-slate-800/80',
          ].join(' ')}
        >
          {/* ── Cabeçalho: badge de ano + ícone ── */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                         bg-brand-500/15 border border-brand-500/30
                         text-brand-300 text-[10px] font-black tracking-wider"
            >
              <IconComponent size={11} className="text-brand-400" aria-hidden="true" />
              {entry.year}
            </span>
          </div>

          {/* ── Título ── */}
          <h3 className="text-sm font-bold text-white leading-snug tracking-tight mb-3">
            {entry.title}
          </h3>

          {/* ── Conteúdo expandido (oculto por padrão) ── */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="content"
                id={descId}
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="exit"
                className="overflow-hidden"
                aria-hidden={!isExpanded}
              >
                <div className="text-slate-300 text-xs leading-relaxed space-y-2">
                  {fullParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Botão Saiba Mais / Mostrar Menos ── */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-expanded={isExpanded}
            aria-controls={descId}
            aria-label={
              isExpanded
                ? `Recolher informações sobre ${entry.year}: ${entry.title}`
                : `Saiba mais sobre ${entry.year}: ${entry.title}`
            }
            className={[
              'mt-auto inline-flex items-center justify-center gap-1',
              'w-full py-1.5 px-3 rounded-lg text-[11px] font-bold mt-3',
              'transition-all duration-200 focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-slate-900',
              isExpanded
                ? 'bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300'
                : 'bg-slate-700/60 hover:bg-brand-600 hover:text-white border border-slate-600/50 text-slate-200',
            ].join(' ')}
          >
            <span>{isExpanded ? 'Mostrar Menos' : 'Saiba Mais'}</span>
            {isExpanded ? (
              <ChevronUp size={11} aria-hidden="true" />
            ) : (
              <ChevronDown size={11} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  },
);

MilestoneCard.displayName = 'MilestoneCard';

// ── Componente Principal ───────────────────────────────────────────────────────

export const TimelineSection: React.FC<Props> = ({ milestones }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineBarRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const baseId = useId();

  // ── Resolução dos dados ────────────────────────────────────────────────────
  // Prioridade: dados do Firestore (via prop) › cronologia canônica embutida.
  // Ordenação automática por order ?? year (escalável para CMS).
  const entries: MilestoneEntry[] = React.useMemo(() => {
    const raw = milestones ?? [];
    if (raw.length > 0) {
      const mapped = raw
        .map(firestoreToEntry)
        .filter((e): e is MilestoneEntry => e !== null);
      return mapped.sort((a, b) => (a.order ?? a.year) - (b.order ?? b.year));
    }
    return CANONICAL_MILESTONES.filter((e) => e.status !== 'draft');
  }, [milestones]);

  // ── Estados locais ─────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState<number>(entries[0]?.year ?? 2007);
  // Mapa isolado: apenas o card clicado expande (sem re-render global)
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});

  // Progresso da linha horizontal (percentual até o nó ativo)
  const selectedIndex = entries.findIndex((e) => e.year === selectedYear);
  const progressPct =
    entries.length > 1 ? (selectedIndex / (entries.length - 1)) * 100 : 100;

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const selectYear = useCallback(
    (year: number) => {
      setSelectedYear(year);
      // Scroll do card no carrossel
      const cardEl = document.getElementById(`${baseId}-card-${year}`);
      cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      // Scroll do nó na barra de anos (tablet/desktop compacto)
      const nodeEl = document.getElementById(`${baseId}-node-${year}`);
      nodeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    },
    [baseId],
  );

  const toggleExpand = useCallback((year: number) => {
    setExpandedMap((prev) => ({ ...prev, [year]: !prev[year] }));
  }, []);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Largura do card (220px) + gap (12px)
    el.scrollBy({ left: direction === 'left' ? -232 : 232, behavior: 'smooth' });
  }, []);

  // ── Navegação via teclado na barra de anos (WCAG 2.2 AA) ──────────────────
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % entries.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + entries.length) % entries.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = entries.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      selectYear(entries[nextIndex].year);
      const tabEl = document.getElementById(`${baseId}-tab-${entries[nextIndex].year}`);
      tabEl?.focus();
    },
    [entries, selectYear, baseId],
  );

  if (!entries || entries.length === 0) return null;

  return (
    <section
      id="history"
      ref={sectionRef}
      aria-labelledby={`${baseId}-heading`}
      className="py-16 bg-slate-900 text-white relative overflow-hidden"
    >
      {/* ── Plano de fundo decorativo ── */}
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-brand-500/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">

        {/* ══ CABEÇALHO ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="flex flex-col items-center mb-10 text-center"
        >
          {/* Rótulo-badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       border border-brand-500/30 bg-brand-500/10
                       text-brand-300 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Calendar size={13} className="text-brand-400" aria-hidden="true" />
            <span>Nossa Trajetória</span>
          </div>

          {/* Título principal */}
          <h2
            id={`${baseId}-heading`}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white
                       mb-4 tracking-tight leading-tight"
          >
            Evolução{' '}
            <span className="text-gradient-brand">Histórica</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Uma trajetória de transformação social construída com compromisso,
            inovação e impacto ao longo dos anos.
          </p>
        </motion.div>

        {/* ══ LINHA DO TEMPO HORIZONTAL — BARRA DE ANOS ══════════════════════
             Compacta, com overflow-x-auto para suportar marcos futuros.
             Nós menores (w-8 h-8 vs w-10 h-10 anterior).
        ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="hidden sm:block mb-8"
          aria-hidden="true" /* os botões abaixo têm role="tab" e são acessíveis */
        >
          {/* Wrapper com overflow para suportar muitos marcos sem quebrar layout */}
          <div
            ref={timelineBarRef}
            className="overflow-x-auto scrollbar-none"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div
              className="relative inline-flex items-start min-w-max mx-auto
                         px-4 py-1"
              style={{ display: 'flex' }}
            >
              {/* Trilho horizontal de fundo — posicionado sobre os nós */}
              <div
                className="absolute top-4 left-4 right-4 h-px bg-slate-700/80 rounded-full pointer-events-none"
                style={{ top: '16px' }}
              >
                {/* Preenchimento animado até o nó ativo */}
                <div
                  className="h-full bg-gradient-to-r from-brand-600 via-brand-400
                             to-emerald-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Nós dos anos — role tablist */}
              <div
                role="tablist"
                aria-label="Anos da Trajetória Institucional"
                className="relative z-10 flex items-start"
                style={{ gap: '28px' }}  /* gap fixo e compacto entre nós */
              >
                {entries.map((entry, idx) => {
                  const isSelected = entry.year === selectedYear;
                  const IconComponent = YEAR_ICONS[entry.year] ?? Calendar;

                  return (
                    <button
                      key={entry.year}
                      id={`${baseId}-tab-${entry.year}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`${baseId}-card-${entry.year}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => selectYear(entry.year)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      className={[
                        'group relative flex flex-col items-center gap-1',
                        'focus:outline-none focus-visible:outline-none',
                        'transition-transform duration-300',
                        isSelected ? 'scale-110' : 'hover:scale-105',
                      ].join(' ')}
                    >
                      {/* Identificador para scroll no selectYear */}
                      <span id={`${baseId}-node-${entry.year}`} className="sr-only" />

                      {/* Círculo do nó — menor que o anterior (w-8 h-8 vs w-10 h-10) */}
                      <div
                        className={[
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          'border-2 transition-all duration-300',
                          isSelected
                            ? [
                                'bg-brand-600 border-white text-white',
                                'shadow-md shadow-brand-500/40',
                                'ring-3 ring-brand-500/25',
                              ].join(' ')
                            : [
                                'bg-slate-800 border-slate-600 text-slate-400',
                                'group-hover:border-brand-500/60 group-hover:text-slate-200',
                                'group-focus-visible:ring-2 group-focus-visible:ring-brand-500',
                                'group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-slate-900',
                              ].join(' '),
                        ].join(' ')}
                      >
                        <IconComponent size={13} aria-hidden="true" />
                      </div>

                      {/* Ano — fonte menor (10px vs 11px) */}
                      <span
                        className={[
                          'text-[10px] font-black tracking-wider transition-colors duration-200 whitespace-nowrap',
                          isSelected
                            ? 'text-brand-300'
                            : 'text-slate-500 group-hover:text-slate-200',
                        ].join(' ')}
                      >
                        {entry.year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ CONTROLES DE NAVEGAÇÃO DO CARROSSEL ════════════════════════════ */}
        <div className="flex justify-between items-center max-w-4xl mx-auto mb-3 px-1">
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Selecione um ano ou deslize para navegar pela cronologia
          </p>
          <p className="text-xs text-slate-400 font-medium sm:hidden">
            Deslize para navegar pela cronologia
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Marco histórico anterior"
              className="p-1.5 rounded-full bg-slate-800 border border-slate-700
                         text-slate-300 hover:bg-slate-700 hover:text-white
                         transition-colors focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Próximo marco histórico"
              className="p-1.5 rounded-full bg-slate-800 border border-slate-700
                         text-slate-300 hover:bg-slate-700 hover:text-white
                         transition-colors focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ══ TRILHO HORIZONTAL DE CARDS ══════════════════════════════════════
             Desktop : cards compactos alinhados horizontalmente.
             Tablet  : overflow-x-auto com rolagem suave.
             Mobile  : snap-x snap-mandatory, um card em destaque por vez.

             gap-3 (12px) vs gap-5 (20px) anterior — redução de 40%.
        ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={scrollContainerRef}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory
                     scrollbar-none py-3 px-1 -mx-1
                     cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
          tabIndex={-1}
          aria-label="Cronologia do Instituto Ser Melhor"
        >
          {entries.map((entry) => (
            <MilestoneCard
              key={entry.year}
              entry={entry}
              isSelected={entry.year === selectedYear}
              isExpanded={!!expandedMap[entry.year]}
              onSelect={() => selectYear(entry.year)}
              onToggleExpand={() => toggleExpand(entry.year)}
              cardId={`${baseId}-card-${entry.year}`}
              descId={`${baseId}-desc-${entry.year}`}
              tabId={`${baseId}-tab-${entry.year}`}
            />
          ))}
        </motion.div>

        {/* ══ INDICADOR DE POSIÇÃO — Mobile ══════════════════════════════════ */}
        <div
          className="flex justify-center gap-1.5 mt-4 sm:hidden"
          aria-hidden="true"
          role="presentation"
        >
          {entries.map((entry) => (
            <button
              key={entry.year}
              type="button"
              onClick={() => selectYear(entry.year)}
              aria-hidden="true"
              tabIndex={-1}
              className={[
                'rounded-full transition-all duration-300',
                entry.year === selectedYear
                  ? 'w-5 h-1.5 bg-brand-500'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400',
              ].join(' ')}
            />
          ))}
        </div>

      </div>
    </section>
  );
};