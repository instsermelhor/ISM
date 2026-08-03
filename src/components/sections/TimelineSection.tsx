/**
 * TimelineSection.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Linha do Tempo Institucional — Instituto Ser Melhor
 *
 * Layout: Horizontal interativo com Snap Scroll / Carrossel (mobile),
 * seletores de anos com conectores visuais, cards expansíveis locais
 * (sem modal / popup), suporte total à acessibilidade (WCAG 2.2 AA).
 *
 * Conteúdo: Cronologia canônica do ISM (2007–2025) embutida como
 * constante estática — funciona com e sem dados do Firestore.
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
import { StrapiItem, TimelineMilestoneAttributes } from '../../types';

// ── Tipos internos ────────────────────────────────────────────────────────────

interface MilestoneEntry {
  year: number;
  title: string;
  summary: string;          // Texto curto exibido no estado colapsado
  full: string;             // Texto completo exibido no estado expandido
}

interface Props {
  milestones?: StrapiItem<TimelineMilestoneAttributes>[];
}

// ── Cronologia Canônica do Instituto Ser Melhor (2007–2025) ──────────────────
// Fonte: Documentação oficial do ISM. Revisada conforme norma culta do PB.

const CANONICAL_MILESTONES: MilestoneEntry[] = [
  {
    year: 2007,
    title: 'Fundação Conceitual',
    summary:
      'Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro.',
    full:
      'Surge a Associação de Bairro Vila Margarida, com o objetivo de representar a comunidade junto ao poder público e buscar melhorias essenciais para o bairro, como pavimentação das vias, iluminação pública e infraestrutura urbana.',
  },
  {
    year: 2012,
    title: 'A Associação a Serviço da Sociedade',
    summary:
      'A Associação de Bairro Vila Margarida amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade.',
    full:
      'A Associação de Bairro Vila Margarida amplia sua atuação e passa a desenvolver ações sociais voltadas às famílias em situação de vulnerabilidade, promovendo a distribuição de cestas básicas, leite e oferecendo transporte comunitário para facilitar o acesso da população aos serviços essenciais.',
  },
  {
    year: 2015,
    title: 'Vila Margarida e a Educação',
    summary:
      'É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica.',
    full:
      'É firmada parceria com a Associação de Professores da Educação Infantil, ampliando a atuação institucional para o atendimento de crianças da educação básica por meio de projetos educacionais.',
  },
  {
    year: 2017,
    title: 'A Educação como Foco',
    summary:
      'Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural.',
    full:
      'Uma nova parceria é estabelecida com a Associação Cultural Tiradentes, marcando o início do desenvolvimento de projetos de grande impacto social, educacional e cultural, fortalecendo o compromisso com a transformação das comunidades atendidas.',
  },
  {
    year: 2022,
    title: 'O Surgimento do Instituto Ser Melhor',
    summary:
      'A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano e à inovação social.',
    full:
      'A fusão das três entidades parceiras resulta na criação do Instituto Ser Melhor, consolidando uma nova estrutura institucional voltada ao desenvolvimento humano, à inovação social e à ampliação do impacto das ações realizadas.',
  },
  {
    year: 2023,
    title: 'Consolidação dos Valores Institucionais',
    summary:
      'Os princípios, valores e diretrizes institucionais são revisados e fortalecidos. O Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas.',
    full:
      'Os princípios, valores e diretrizes institucionais são revisados e fortalecidos com a participação de profissionais de diversas áreas. Neste mesmo período, o Instituto Ser Melhor torna-se participante do Pacto Global das Nações Unidas, alinhando suas ações aos 17 Objetivos de Desenvolvimento Sustentável (ODS).',
  },
  {
    year: 2024,
    title: 'Reconhecimento Internacional',
    summary:
      'O Instituto Ser Melhor recebe o Global Excellence Award (GEA) e a Metodologia M-IS passa a ser reconhecida como referência internacional em inovação social.',
    full:
      'O Instituto Ser Melhor recebe o Global Excellence Award (GEA) em reconhecimento às suas boas práticas institucionais.\n\nA Metodologia M-IS passa a ser reconhecida como referência internacional em inovação social.\n\nTambém é implantada a metodologia SROI (Social Return on Investment), alcançando o índice de 1:4,83, demonstrando elevado retorno social sobre os investimentos realizados.',
  },
  {
    year: 2025,
    title: 'Criação do Fundo Perpétuo',
    summary:
      'É criado o Fundo Perpétuo (F-P), assegurando a sustentabilidade financeira da instituição e sua independência operacional.',
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
 * Converte o impactDescription do Firestore para o formato MilestoneEntry.
 * O primeiro parágrafo (até 180 chars) torna-se o summary; o texto completo
 * fica em full.
 */
function firestoreToEntry(raw: any): MilestoneEntry {
  const full: string = raw.impactDescription || raw.full || '';
  const paragraphs = full.split('\n').filter((p: string) => p.trim() !== '');
  const firstParagraph = paragraphs[0] || '';
  const summary =
    firstParagraph.length > 180
      ? firstParagraph.slice(0, 180).trimEnd() + '…'
      : firstParagraph;
  return {
    year: Number(raw.year),
    title: raw.title || '',
    summary,
    full,
  };
}

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
    const fullParagraphs = entry.full
      .split('\n')
      .filter((p) => p.trim() !== '');
    const hasMore = entry.full !== entry.summary || fullParagraphs.length > 1;

    return (
      <div
        id={cardId}
        role="tabpanel"
        aria-labelledby={tabId}
        className={[
          'snap-center shrink-0 w-[300px] sm:w-[340px] lg:w-[360px]',
          'flex flex-col transition-all duration-300',
        ].join(' ')}
        onClick={onSelect}
      >
        <div
          className={[
            'h-full p-6 rounded-3xl border flex flex-col transition-all duration-300 cursor-default',
            isSelected
              ? 'bg-slate-800/95 border-brand-500/50 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500/30'
              : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80',
          ].join(' ')}
        >
          {/* ── Cabeçalho ── */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-brand-500/15 border border-brand-500/30
                         text-brand-300 text-xs font-black tracking-wider"
            >
              <IconComponent size={13} className="text-brand-400" aria-hidden="true" />
              {entry.year}
            </span>

            {isSelected && (
              <span
                className="text-[10px] font-bold uppercase tracking-widest
                           text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5
                           rounded-full border border-emerald-500/20"
                aria-hidden="true"
              >
                Selecionado
              </span>
            )}
          </div>

          {/* ── Título ── */}
          <h3 className="text-lg font-bold text-white mb-3 leading-snug tracking-tight">
            {entry.title}
          </h3>

          {/* ── Conteúdo (colapsado / expandido) ── */}
          <div
            id={descId}
            className="text-slate-300 text-sm leading-relaxed mb-4 space-y-2.5 flex-1"
          >
            <AnimatePresence initial={false} mode="wait">
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="space-y-2.5 overflow-hidden"
                >
                  {fullParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p>{entry.summary}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Botão Saiba Mais / Mostrar Menos ── */}
          {hasMore && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-expanded={isExpanded}
              aria-controls={descId}
              className={[
                'mt-auto inline-flex items-center justify-center gap-1.5',
                'w-full py-2.5 px-4 rounded-xl text-xs font-bold',
                'transition-all duration-200 focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                isExpanded
                  ? 'bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300'
                  : 'bg-slate-700/60 hover:bg-brand-600 hover:text-white border border-slate-600/50 text-slate-200',
              ].join(' ')}
            >
              <span>{isExpanded ? 'Mostrar Menos' : 'Saiba Mais'}</span>
              {isExpanded ? (
                <ChevronUp size={13} aria-hidden="true" />
              ) : (
                <ChevronDown size={13} aria-hidden="true" />
              )}
            </button>
          )}
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
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const baseId = useId();

  // ── Resolução dos dados ────────────────────────────────────────────────────
  // Prioridade: dados do Firestore (via prop) › cronologia canônica embutida.
  const entries: MilestoneEntry[] = React.useMemo(() => {
    const raw = (milestones ?? []).map((m) => m.attributes ?? m);
    if (raw.length > 0) {
      return [...raw]
        .map(firestoreToEntry)
        .sort((a, b) => a.year - b.year);
    }
    return CANONICAL_MILESTONES;
  }, [milestones]);

  // ── Estados locais ─────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState<number>(entries[0]?.year ?? 2007);
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});

  // Progresso da linha horizontal (percentual até o nó ativo)
  const selectedIndex = entries.findIndex((e) => e.year === selectedYear);
  const progressPct =
    entries.length > 1
      ? ((selectedIndex) / (entries.length - 1)) * 100
      : 100;

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const selectYear = useCallback(
    (year: number) => {
      setSelectedYear(year);
      const cardEl = document.getElementById(`${baseId}-card-${year}`);
      cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    },
    [baseId],
  );

  const toggleExpand = useCallback((year: number) => {
    setExpandedMap((prev) => ({ ...prev, [year]: !prev[year] }));
  }, []);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
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
      // Move o foco para o novo botão ativo
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
      className="py-20 bg-slate-900 text-white relative overflow-hidden"
    >
      {/* ── Plano de fundo decorativo ── */}
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-brand-500/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/8 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">

        {/* ══ CABEÇALHO ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="flex flex-col items-center mb-12 text-center"
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

          {/* Subtítulo revisado (ETAPA 1) */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Uma trajetória de transformação social construída com compromisso,
            inovação e impacto ao longo dos anos.
          </p>
        </motion.div>

        {/* ══ LINHA DO TEMPO HORIZONTAL — BARRA DE ANOS (Desktop / Tablet) ══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="relative max-w-5xl mx-auto mb-10 hidden sm:block"
          aria-hidden="true"   /* os botões abaixo têm role="tab" e são acessíveis */
        >
          {/* Trilho horizontal de fundo */}
          <div
            className="absolute top-5 left-5 right-5 h-0.5 bg-slate-700/80
                        rounded-full pointer-events-none"
          >
            {/* Preenchimento animado até o nó ativo */}
            <div
              className="h-full bg-gradient-to-r from-brand-600 via-brand-400
                          to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Nós dos anos */}
          <div
            role="tablist"
            aria-label="Anos da Trajetória Institucional"
            className="relative z-10 flex justify-between items-start"
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
                    'group relative flex flex-col items-center gap-1.5',
                    'focus:outline-none focus-visible:outline-none',
                    'transition-transform duration-300',
                    isSelected ? 'scale-110' : 'hover:scale-105',
                  ].join(' ')}
                >
                  {/* Círculo destacado */}
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'border-2 transition-all duration-300',
                      isSelected
                        ? [
                            'bg-brand-600 border-white text-white',
                            'shadow-lg shadow-brand-500/40',
                            'ring-4 ring-brand-500/25',
                          ].join(' ')
                        : [
                            'bg-slate-800 border-slate-600 text-slate-400',
                            'group-hover:border-brand-500/60 group-hover:text-slate-200',
                            'group-focus-visible:ring-2 group-focus-visible:ring-brand-500',
                          ].join(' '),
                    ].join(' ')}
                  >
                    <IconComponent size={15} aria-hidden="true" />
                  </div>

                  {/* Ano */}
                  <span
                    className={[
                      'text-[11px] font-black tracking-wider transition-colors duration-200',
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
        </motion.div>

        {/* ══ CONTROLES DE NAVEGAÇÃO DO CARROSSEL ════════════════════════════ */}
        <div className="flex justify-between items-center max-w-5xl mx-auto mb-4 px-1">
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
              className="p-2 rounded-full bg-slate-800 border border-slate-700
                         text-slate-300 hover:bg-slate-700 hover:text-white
                         transition-colors focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Próximo marco histórico"
              className="p-2 rounded-full bg-slate-800 border border-slate-700
                         text-slate-300 hover:bg-slate-700 hover:text-white
                         transition-colors focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ══ TRILHO HORIZONTAL DE CARDS ══════════════════════════════════════
             Desktop: scroll suave — Tablet: scroll horizontal — Mobile: carrossel snap
        ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={scrollContainerRef}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory
                     scrollbar-none py-4 px-1 -mx-1
                     cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
          /* Permite scroll via teclado com Tab */
          tabIndex={-1}
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
          className="flex justify-center gap-1.5 mt-5 sm:hidden"
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
                  ? 'w-6 h-2 bg-brand-500'
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400',
              ].join(' ')}
            />
          ))}
        </div>

      </div>
    </section>
  );
};