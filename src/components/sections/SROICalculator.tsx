/**
 * SROICalculator.tsx — C003: Widget Calculadora SROI Interativa (Site Principal)
 * ─────────────────────────────────────────────────────────────────────────────
 * Exibe a razão SROI do ISM com simulador interativo:
 * O visitante digita quanto quer investir e vê o retorno social estimado.
 * Dados consumidos via hook useRealtimeSROI (Firestore: sroi_config/main).
 */
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, BookOpen, Users, Leaf, Palette, Info, ExternalLink } from 'lucide-react';

/* ── Tipos locais (espelham SROIConfig do admin) ── */
interface SROIPilar {
  id: string;
  name: string;
  color: string;
  investimento: number;
  retornoSocial: number;
  ods: string[];
}

interface SROIData {
  ratio: number;
  totalInvestimento: number;
  totalRetorno: number;
  pilares: SROIPilar[];
  anoReferencia: number;
  notaMetodologica?: string;
  organizacaoAuditora: string;
}

/* ── Default data (fallback quando Firestore não está configurado) ── */
const DEFAULT_SROI: SROIData = {
  ratio: 4.83,
  totalInvestimento: 3_000_000,
  totalRetorno: 14_800_000,
  anoReferencia: 2024,
  organizacaoAuditora: 'Auditoria Independente ISM',
  notaMetodologica: 'Metodologia SROI baseada nos princípios do SROI Network (UK). Cada R$ 1,00 investido gera R$ 4,83 em valor social mensurável.',
  pilares: [
    { id: 'educacao',     name: 'Educação',      color: '#1E3A8A', investimento: 1_200_000, retornoSocial: 6_850_000, ods: ['ODS 4', 'ODS 8'] },
    { id: 'social',       name: 'Social',         color: '#D97706', investimento: 850_000,   retornoSocial: 3_920_000, ods: ['ODS 1', 'ODS 3'] },
    { id: 'meio_ambiente',name: 'Meio Ambiente',  color: '#15803D', investimento: 620_000,   retornoSocial: 2_980_000, ods: ['ODS 13', 'ODS 15'] },
    { id: 'cultura',      name: 'Cultura',        color: '#C2410C', investimento: 330_000,   retornoSocial: 1_050_000, ods: ['ODS 11', 'ODS 17'] },
  ],
};

const PILAR_ICONS: Record<string, React.ElementType> = {
  educacao: BookOpen,
  social: Users,
  meio_ambiente: Leaf,
  cultura: Palette,
};

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const fmtRatio = (v: number) => v.toFixed(2).replace('.', ',');

/* ── Animated counter ── */
function useCountUp(target: number, decimals: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const duration = 1600;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return decimals > 0 ? val.toFixed(decimals).replace('.', ',') : Math.floor(val).toLocaleString('pt-BR');
}

/* ── Props ── */
export interface SROICalculatorProps {
  sroiData?: any | null;
}

export const SROICalculator: React.FC<SROICalculatorProps> = ({ sroiData }) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Mapeia dados do Firestore ou usa default
  const data: SROIData = React.useMemo(() => {
    if (!sroiData?.pilares?.length) return DEFAULT_SROI;
    const totalInvestimento = sroiData.pilares.reduce((a: number, p: any) => a + (p.investimento || 0), 0);
    const totalRetorno = sroiData.pilares.reduce((a: number, p: any) => a + (p.retornoSocial || 0), 0);
    const ratio = totalInvestimento > 0 ? totalRetorno / totalInvestimento : DEFAULT_SROI.ratio;
    return {
      ratio,
      totalInvestimento,
      totalRetorno,
      pilares: sroiData.pilares,
      anoReferencia: sroiData.anoReferencia || 2024,
      organizacaoAuditora: sroiData.organizacaoAuditora || DEFAULT_SROI.organizacaoAuditora,
      notaMetodologica: sroiData.notaMetodologica || DEFAULT_SROI.notaMetodologica,
    };
  }, [sroiData]);

  // Simulador interativo
  const [investInput, setInvestInput] = useState<string>('1000');
  const investValue = Math.max(0, parseFloat(investInput) || 0);
  const retornoEstimado = investValue * data.ratio;
  const ratioDisplay = useCountUp(data.ratio, 2, isInView);

  const totalInvBar = data.pilares.reduce((a, p) => a + p.investimento, 0);

  return (
    <section
      ref={ref}
      id="sroi"
      aria-label="Calculadora SROI — Retorno Social sobre Investimento"
      className="py-12 md:py-16 bg-white relative overflow-hidden"
    >
      {/* subtle background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'rgba(22,163,74,0.04)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(30,58,138,0.03)' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-200 bg-brand-50 mb-5 text-xs font-bold uppercase tracking-widest text-brand-600">
            <TrendingUp size={13} aria-hidden="true" />
            SROI · Social Return on Investment · {data.anoReferencia}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-secondary-900 mb-4 leading-tight">
            Cada real investido gera{' '}
            <span className="text-gradient-brand">R$ {ratioDisplay}</span>
            {' '}em impacto
          </h2>
          <p className="text-secondary-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Metodologia SROI auditada — transformamos investimentos em valor social mensurável para comunidades, ecossistemas e gerações futuras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-6xl mx-auto">

          {/* Left: Pilares breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h3 className="text-lg font-black text-secondary-900 mb-6">Distribuição por Pilar</h3>
            <div className="space-y-4">
              {data.pilares.map((pilar, idx) => {
                const Icon = PILAR_ICONS[pilar.id] || TrendingUp;
                const pct = totalInvBar > 0 ? Math.round((pilar.investimento / totalInvBar) * 100) : 0;
                const pilarRatio = pilar.investimento > 0 ? pilar.retornoSocial / pilar.investimento : 0;
                return (
                  <motion.div
                    key={pilar.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${pilar.color}18` }}
                        >
                          <Icon size={17} style={{ color: pilar.color }} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-secondary-900">{pilar.name}</span>
                          <div className="text-[10px] text-secondary-400">{(pilar.ods || []).join(' · ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold" style={{ color: pilar.color }}>R$ {fmtRatio(pilarRatio)}</div>
                        <div className="text-[10px] text-secondary-400">por R$ investido</div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: pilar.color }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${pct}%` } : { width: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-secondary-400 mt-1.5">
                      <span>{fmtBRL(pilar.investimento)} investidos</span>
                      <span className="text-brand-600 font-bold">{fmtBRL(pilar.retornoSocial)} em retorno</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Simulador + Ratio card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Big ratio card */}
            <div
              className="rounded-3xl p-8 text-white text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(74,222,128,0.08)' }} />
              <div className="relative z-10">
                <div className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-4">
                  Razão SROI Oficial · {data.anoReferencia}
                </div>
                <div
                  className="text-7xl font-black mb-2 tabular-nums"
                  style={{ color: '#4ade80', fontFamily: 'monospace' }}
                  role="meter"
                  aria-label={`SROI: R$ ${fmtRatio(data.ratio)} por real investido`}
                  aria-valuenow={data.ratio}
                  aria-valuemin={0}
                  aria-valuemax={10}
                >
                  {ratioDisplay}
                </div>
                <div className="text-green-200 font-bold text-base mb-6">
                  Reais de retorno social por R$ 1,00 investido
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Investido', value: fmtBRL(data.totalInvestimento) },
                    { label: 'Retorno Social', value: fmtBRL(data.totalRetorno) },
                  ].map(item => (
                    <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-green-300 font-bold uppercase tracking-wide mb-1">{item.label}</div>
                      <div className="text-lg font-black text-white font-mono">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[10px] text-green-400/70">
                  {data.organizacaoAuditora} · Metodologia SROI Network
                </div>
              </div>
            </div>

            {/* Simulador interativo */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-black text-secondary-900 text-base mb-1">Simulador de Impacto</h3>
              <p className="text-xs text-secondary-400 mb-5">Quanto você investe e qual o retorno social estimado?</p>

              <div className="mb-4">
                <label htmlFor="sroi-invest-input" className="block text-xs font-bold text-secondary-500 uppercase tracking-widest mb-2">
                  Valor do Investimento (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-bold text-sm" aria-hidden="true">R$</span>
                  <input
                    id="sroi-invest-input"
                    type="number"
                    min={0}
                    value={investInput}
                    onChange={e => setInvestInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none font-bold text-lg text-secondary-900 bg-white transition-all"
                    aria-describedby="sroi-result"
                  />
                </div>
              </div>

              <div
                id="sroi-result"
                className="bg-white rounded-xl border-2 border-brand-200 p-5 text-center"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Retorno Social Estimado</div>
                <div className="text-4xl font-black text-brand-600 font-mono">
                  {fmtBRL(retornoEstimado)}
                </div>
                <div className="text-xs text-secondary-400 mt-1">
                  {fmtBRL(investValue)} × R$ {fmtRatio(data.ratio)} (SROI)
                </div>
              </div>

              {/* Preset amounts */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[500, 1000, 5000, 10000, 50000].map(v => (
                  <button
                    key={v}
                    onClick={() => setInvestInput(String(v))}
                    aria-pressed={investValue === v}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      investValue === v
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-secondary-500 border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    {fmtBRL(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Nota metodológica */}
            {data.notaMetodologica && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info size={15} className="text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-blue-600 leading-relaxed">{data.notaMetodologica}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
