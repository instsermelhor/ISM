/**
 * TransparencyReport.tsx
 * Enhanced with client-side filter: year, category, text search.
 * WCAG 2.1: accessible filter controls, download links with aria-label,
 * live region for result count, paginator.
 */
import React, { useRef, useState, useMemo, useId } from 'react';
import { TransparencyDocument, FinancialEntry } from '../../types';
import {
  ExternalLink, ShieldCheck, Lock, Scale, UserCheck, Megaphone,
  Fingerprint, Search, Filter, Download, ChevronDown,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DocumentCard } from '../ui/DocumentCard';
import { motion, useInView } from 'framer-motion';

/* ── Types ── */
interface IntegrityPillar {
  id?: string;
  icon?: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface Props {
  documents: TransparencyDocument[];
  financials: FinancialEntry[];
  intro: string;
  efficiencyPct?: number;
  integrityPillars?: IntegrityPillar[];
}

/* ── Static fallback pillars ── */
const DEFAULT_INTEGRITY_PILLARS = [
  {
    Icon: UserCheck,
    title: 'Estrutura Remuneratória',
    body: 'Membros da Assembleia e dos Conselhos atuam em caráter estritamente voluntário. A remuneração da Diretoria-Executiva segue critérios de mercado e metas de impacto.',
    cta: null,
  },
  {
    Icon: Megaphone,
    title: 'Canal de Integridade',
    body: 'Canal de Denúncias operado por empresa terceirizada independente. Garantia absoluta de anonimato e imparcialidade na apuração de desvios do Código de Conduta.',
    cta: { label: 'Acessar Ouvidoria', href: '#' },
  },
  {
    Icon: Fingerprint,
    title: 'Privacidade Global',
    body: 'Conformidade rigorosa com a LGPD (Brasil) e GDPR (Europa). Tratamos dados de doadores e beneficiários com criptografia e protocolos de segurança cibernética.',
    cta: null,
  },
];

const DOCUMENT_CATEGORIES = ['Todos', 'Financeiro', 'Impacto', 'Legal', 'Código de Conduta'] as const;
const PAGE_SIZE = 6;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary-900 border border-secondary-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-white font-bold text-sm">{payload[0].name}</p>
        <p className="text-brand-400 font-black text-lg">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

/* ── Component ── */
export const TransparencyReport: React.FC<Props> = ({
  documents,
  financials,
  intro,
  efficiencyPct,
  integrityPillars: dynamicPillars,
}) => {
  const pillarsToRender = dynamicPillars?.length ? dynamicPillars : DEFAULT_INTEGRITY_PILLARS;
  const effPct = efficiencyPct !== undefined ? efficiencyPct : 90;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const filterId = useId();

  /* ── Filter state ── */
  const [searchText, setSearchText]   = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedCat, setSelectedCat] = useState<string>('Todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* Derive available years from documents */
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(documents.map((d) => new Date(d.publicationDate).getFullYear().toString())),
    ).sort((a, b) => Number(b) - Number(a));
    return ['Todos', ...years];
  }, [documents]);

  /* Filtered list */
  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const yearMatch =
        selectedYear === 'Todos' ||
        new Date(doc.publicationDate).getFullYear().toString() === selectedYear;
      const catMatch =
        selectedCat === 'Todos' || doc.documentType === selectedCat;
      const textMatch =
        !searchText ||
        doc.documentName.toLowerCase().includes(searchText.toLowerCase());
      return yearMatch && catMatch && textMatch;
    });
  }, [documents, selectedYear, selectedCat, searchText]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFilterChange = () => setVisibleCount(PAGE_SIZE); // reset page on filter change

  return (
    <section id="transparency" className="py-24 bg-secondary-950 text-white relative overflow-hidden" aria-label="Portal de Transparência">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-900/60 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-brand-400" size={22} aria-hidden="true" />
              <span className="text-brand-400 font-bold tracking-widest uppercase text-xs">Prestação de Contas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              Transparência{' '}
              <span className="text-gradient-brand">Radical</span>
            </h2>
            <p className="text-secondary-300 text-lg leading-relaxed">{intro}</p>
          </div>
          <div className="flex flex-col gap-2.5 shrink-0">
            {[
              { Icon: Lock,  label: 'Auditoria: Tier 1 (Big Four)' },
              { Icon: Scale, label: 'Normas: IFRS / CPC' },
            ].map(({ Icon, label }) => (
              <div key={label} className="glass-dark flex items-center gap-2.5 px-4 py-2.5 rounded-xl">
                <Icon size={14} className="text-brand-400 shrink-0" aria-hidden="true" />
                <span className="text-xs text-secondary-300 font-mono">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart + Documents row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-dark rounded-3xl p-8 border border-secondary-800 flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full shrink-0" aria-hidden="true" />
              Eficiência na Alocação de Recursos
            </h3>
            <div className="h-[280px] w-full" role="img" aria-label={`Gráfico de alocação de recursos: ${effPct}% de eficiência operacional`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financials}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {financials.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-secondary-300 text-xs font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center border-t border-secondary-800 pt-4">
              <p className="text-secondary-300 text-sm">
                <span className="text-brand-400 font-black text-3xl">{effPct}%</span> de Eficiência Operacional
              </p>
              <p className="text-xs text-secondary-500 mt-1">Recursos destinados diretamente à atividade-fim.</p>
            </div>
          </motion.div>

          {/* Document repository */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full shrink-0" aria-hidden="true" />
                Repositório de Governança
              </h3>
            </div>

            {/* ── Filter Bar ── */}
            <fieldset className="mb-4 p-4 rounded-2xl bg-secondary-900/60 border border-secondary-800">
              <legend className="sr-only">Filtros de documentos</legend>
              <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500" aria-hidden="true" />
                  <label htmlFor={`${filterId}-search`} className="sr-only">Buscar documento por nome</label>
                  <input
                    id={`${filterId}-search`}
                    type="search"
                    placeholder="Buscar documento..."
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); handleFilterChange(); }}
                    className="w-full pl-9 pr-4 py-2.5 bg-secondary-800 border border-secondary-700 rounded-xl text-sm text-white placeholder-secondary-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  {/* Year select */}
                  <div className="relative flex-1">
                    <label htmlFor={`${filterId}-year`} className="sr-only">Filtrar por ano</label>
                    <select
                      id={`${filterId}-year`}
                      value={selectedYear}
                      onChange={(e) => { setSelectedYear(e.target.value); handleFilterChange(); }}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 bg-secondary-800 border border-secondary-700 rounded-xl text-sm text-white outline-none focus:border-brand-500 transition-all cursor-pointer"
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>{y === 'Todos' ? 'Todos os anos' : y}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none" aria-hidden="true" />
                  </div>

                  {/* Category select */}
                  <div className="relative flex-1">
                    <label htmlFor={`${filterId}-cat`} className="sr-only">Filtrar por categoria</label>
                    <select
                      id={`${filterId}-cat`}
                      value={selectedCat}
                      onChange={(e) => { setSelectedCat(e.target.value); handleFilterChange(); }}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 bg-secondary-800 border border-secondary-700 rounded-xl text-sm text-white outline-none focus:border-brand-500 transition-all cursor-pointer"
                    >
                      {DOCUMENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Result count (live region) */}
            <p
              aria-live="polite"
              aria-atomic="true"
              className="text-xs text-secondary-500 mb-3"
            >
              {filtered.length === 0
                ? 'Nenhum documento encontrado.'
                : `${filtered.length} documento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
            </p>

            {/* Document list */}
            <div className="space-y-3 flex-grow" role="list" aria-label="Lista de documentos de transparência">
              {visible.length > 0
                ? visible.map((doc) => (
                    <div key={doc.id} role="listitem">
                      <DocumentCard
                        data={doc}
                      />
                    </div>
                  ))
                : (
                  <div className="text-center py-8 text-secondary-500 text-sm">
                    <Filter size={28} className="mx-auto mb-2 opacity-40" aria-hidden="true" />
                    Nenhum documento corresponde aos filtros selecionados.
                  </div>
                )}
            </div>

            {/* Load more */}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="mt-4 w-full py-2.5 text-xs font-bold text-brand-400 border border-brand-500/30 rounded-xl hover:bg-brand-500/10 transition-colors"
              >
                Ver mais ({filtered.length - visibleCount} restantes)
              </button>
            )}
          </motion.div>
        </div>

        {/* Integrity pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(pillarsToRender as any[]).map((pillar: any, i: number) => {
            const Icon = pillar.Icon || ShieldCheck;
            const title = pillar.title;
            const body = pillar.body;
            const cta = pillar.cta || (pillar.ctaLabel ? { label: pillar.ctaLabel, href: pillar.ctaHref || '#' } : null);
            const emoji = pillar.icon;
            return (
              <motion.div
                key={pillar.id || title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="bg-gradient-to-br from-secondary-800/60 to-secondary-900/60 p-7 rounded-3xl border border-secondary-800 hover:border-brand-500/30 transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="w-11 h-11 bg-secondary-700 rounded-xl flex items-center justify-center mb-5 text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-250" aria-hidden="true">
                  {emoji ? <span className="text-xl">{emoji}</span> : <Icon size={22} />}
                </div>
                <h4 className="text-base font-bold text-white mb-3">{title}</h4>
                <p className="text-secondary-400 text-sm leading-relaxed mb-4">{body}</p>
                {cta && (
                  <a
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-white uppercase tracking-wider transition-colors group/link"
                  >
                    {cta.label}
                    <ExternalLink size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" aria-hidden="true" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};