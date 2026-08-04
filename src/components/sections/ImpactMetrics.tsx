/**
 * ImpactMetrics.tsx
 * Animated accessible impact counter section for ISM.
 * Uses Framer Motion's useMotionValue + useInView for accessible
 * counter animations with progressive aria-valuenow updates.
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Users, MapPin, Handshake, Calendar, TrendingUp, FileText } from 'lucide-react';

interface MetricItem {
  id: string;
  value: number;
  suffix: string;
  prefix: string;
  label: string;
  sublabel: string;
  Icon: React.ElementType;
  color: string;
  decimals: number;
}

/* Animated counter hook */
function useCountUp(target: number, decimals: number, inView: boolean, duration = 1.8) {
  const motionVal = useMotionValue(0);
  const [displayVal, setDisplayVal] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayVal(
          decimals > 0
            ? latest.toFixed(decimals)
            : Math.floor(latest).toLocaleString('pt-BR'),
        );
      },
    });
    return () => controls.stop();
  }, [inView, target, decimals, duration, motionVal]);

  return displayVal;
}

/* Single metric card */
const MetricCard: React.FC<{ metric: MetricItem; delay: number }> = ({ metric, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const displayValue = useCountUp(metric.value, metric.decimals, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative flex flex-col items-center text-center p-7 rounded-3xl group"
      style={{
        background: `${metric.color}0D`,
        border: `1px solid ${metric.color}20`,
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${metric.color}20` }}
        aria-hidden="true"
      >
        <metric.Icon size={22} style={{ color: metric.color }} />
      </div>

      {/* Counter */}
      <p
        className="text-4xl font-black leading-none mb-2 tabular-nums"
        style={{ color: metric.color }}
        role="meter"
        aria-label={`${metric.label}: ${metric.prefix}${displayValue}${metric.suffix}`}
        aria-valuenow={metric.value}
        aria-valuemin={0}
        aria-valuemax={metric.value}
      >
        {metric.prefix}{displayValue}{metric.suffix}
      </p>

      <p className="text-white font-bold text-base mb-1">{metric.label}</p>
      <p className="text-secondary-500 text-xs leading-relaxed">{metric.sublabel}</p>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${metric.color}15 0%, transparent 70%)` }}
        aria-hidden="true"
      />
    </motion.div>
  );
};

/* ── Main Section ──────────────────────────────────────────────────── */
export interface ImpactMetricsProps {
  items?: any[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  users: Users,
  'map-pin': MapPin,
  handshake: Handshake,
  calendar: Calendar,
  'trending-up': TrendingUp,
  'file-text': FileText,
};

const DEFAULT_METRICS: MetricItem[] = [
  { id: 'm1', value: 32000, suffix: '+', prefix: '', label: 'Beneficiários Diretos', sublabel: 'Famílias e indivíduos assistidos anualmente', Icon: Users, color: '#1E3A8A', decimals: 0 },
  { id: 'm2', value: 78,    suffix: '',  prefix: '', label: 'Municípios',            sublabel: 'Presença em todo o território nacional',   Icon: MapPin, color: '#D97706', decimals: 0 },
  { id: 'm3', value: 50,    suffix: '+', prefix: '', label: 'Parceiros Globais',     sublabel: 'Organizações, empresas e governos',         Icon: Handshake, color: '#15803D', decimals: 0 },
  { id: 'm4', value: 15,    suffix: '+', prefix: '', label: 'Anos de Impacto',       sublabel: 'Construindo futuro desde 2007',             Icon: Calendar, color: '#C2410C', decimals: 0 },
  { id: 'm5', value: 4.85,  suffix: '',  prefix: 'R$', label: 'SROI por Real Investido', sublabel: 'Retorno social comprovado por metodologia SROI', Icon: TrendingUp, color: '#16a34a', decimals: 2 },
  { id: 'm6', value: 100,   suffix: '%', prefix: '', label: 'Transparência',         sublabel: 'Todas as contas auditadas e publicadas',    Icon: FileText, color: '#6366f1', decimals: 0 },
];

export const ImpactMetrics: React.FC<ImpactMetricsProps> = ({ items }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Nota de rodapé dinâmica — usa prop `footerNote` quando presente
  const footerNote = (items as any)?.[0]?.__sectionMeta?.footerNote ?? null;

  // Mapeia dados do Firestore (any[]) para MetricItem tipado ou usa os padrões canônicos
  const activeMetrics: MetricItem[] = (items && items.length > 0)
    ? items.map(m => ({
        id: m.id || m.label,
        value: parseFloat(m.value) || 0,
        suffix: m.suffix || '',
        prefix: m.prefix || '',
        label: m.label || '',
        sublabel: m.sublabel || '',
        Icon: ICON_MAP[m.iconKey] || Users,
        color: m.color || '#4ade80',
        decimals: m.decimals ?? 0,
      }))
    : DEFAULT_METRICS;

  return (
    <section
      id="impact"
      aria-label="Métricas de Impacto Social do Instituto Ser Melhor"
      className="py-12 md:py-16 bg-secondary-900 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none section-pattern" aria-hidden="true" />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'rgba(22,163,74,0.06)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 mb-5 text-xs font-bold uppercase tracking-widest text-brand-300">
            <TrendingUp size={13} aria-hidden="true" />
            Impacto Mensurável
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Números que{' '}
            <span className="text-gradient-brand">comprovam</span> nossa missão
          </h2>
          <p className="text-secondary-400 max-w-xl mx-auto text-lg leading-relaxed">
            Cada métrica representa uma vida transformada, um ecossistema protegido, uma comunidade fortalecida.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-5"
          aria-label="Indicadores de impacto social"
        >
          {activeMetrics.map((metric, idx) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              delay={idx * 0.08}
            />
          ))}
        </div>

        {/* Nota de rodapé — exibida apenas quando configurada no CMS */}
        {footerNote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-center text-secondary-600 text-xs mt-10"
          >
            {footerNote}
          </motion.p>
        )}
      </div>
    </section>
  );
};
