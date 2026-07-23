/**
 * EISRFRPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Sustainability, Resilience & Future Readiness Platform
 * Instituto Ser Melhor — Prompt 070 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CRO/CSO Board & Resilience Hub — Dashboard ISO 22301 (Score 97.4/100)
 *   2. Centro de Continuidade do Negócio (BCM)— RTOs, RPOs e processos críticos
 *   3. Gestão de Resiliência Organizacional — Contingências, testes de desastre e simulações
 *   4. Sustentabilidade Financeira & Liquidez — Reservas operacionais e liquidez de longo prazo
 *   5. Strategic Foresight & Future Readiness — Cenários prospectivos (5, 10, 20 anos)
 *   6. Inteligência Preditiva de Crises     — Alertas preventivos de IA para riscos emergentes
 *   7. Painéis Executivos & Analytics        — Visões gerenciais CRO, CSO, CISO e Presidência
 *   8. CERTIFICAÇÃO EISRFRP FINAL             — Parecer executivo + roadmap 10 anos (2026-2036)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEISRFRPService,
  type CriticalProcessBCM, type FutureForesightScenario, type FinancialSustainabilityMetric,
  type EISRFRPDashboardKPIs, type BCMThreatType, type RecoveryPriority,
} from '../services/resilienceEISRFRPEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const kpiCard = (label: string, value: string | number, unit: string, color: string, icon: string) => (
  <div style={{ background: '#0f172a', border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
      {value}<span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

const scoreBar = (label: string, value: number, color: string) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#cbd5e1' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}/100</span>
    </div>
    <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
      <div style={{ height: 6, width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

const progressRing = (value: number, color: string, size = 70) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const THREAT_CFG: Record<BCMThreatType, { label: string; color: string }> = {
  INDISPONIBILIDADE_CLOUD: { label: 'Falha Cloud', color: '#60a5fa' },
  CIBERATAQUE_RANSOMWARE:   { label: 'Ciberataque', color: '#f87171' },
  PERDA_TALENTOS_CHAVE:     { label: 'Perda de Talentos', color: '#fbbf24' },
  CORTE_ORCAMENTARIO:       { label: 'Corte Orçamentário', color: '#fb923c' },
  DESASTRE_NATURAL:         { label: 'Desastre Natural', color: '#a78bfa' },
  CRISE_REPUTACIONAL:       { label: 'Crise Reputacional', color: '#38bdf8' },
};

const PRIORITY_CFG: Record<RecoveryPriority, { label: string; color: string; bg: string }> = {
  RTO_IMEDIATO_15M: { label: 'RTO 15m (Crítico)', color: '#ef4444', bg: '#450a0a' },
  RTO_1H:           { label: 'RTO 1h (Alto)', color: '#f59e0b', bg: '#451a03' },
  RTO_4H:           { label: 'RTO 4h (Médio)', color: '#60a5fa', bg: '#1e3a5f' },
  RTO_24H:          { label: 'RTO 24h (Normal)', color: '#a78bfa', bg: '#2e1065' },
  RTO_72H:          { label: 'RTO 72h (Baixo)', color: '#94a3b8', bg: '#1e293b' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CRO/CSO Board & Resilience Hub',
  'Centro de Continuidade do Negócio (BCM)',
  'Gestão de Resiliência Organizacional',
  'Sustentabilidade Financeira & Liquidez',
  'Strategic Foresight & Future Readiness',
  'Inteligência Preditiva de Crises',
  'Painéis Executivos & Analytics',
  'CERTIFICAÇÃO EISRFRP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CRO/CSO Board & Resilience Hub': '🛡️',
  'Centro de Continuidade do Negócio (BCM)': '🔄',
  'Gestão de Resiliência Organizacional': '⚡',
  'Sustentabilidade Financeira & Liquidez': '💰',
  'Strategic Foresight & Future Readiness': '🔮',
  'Inteligência Preditiva de Crises':     '🤖',
  'Painéis Executivos & Analytics':        '📊',
  'CERTIFICAÇÃO EISRFRP FINAL':            '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EISRFRPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CRO/CSO Board & Resilience Hub');
  const [kpis, setKpis] = useState<EISRFRPDashboardKPIs | null>(null);
  const [bcmProcesses, setBcmProcesses] = useState<CriticalProcessBCM[]>([]);
  const [foresight, setForesight] = useState<FutureForesightScenario[]>([]);
  const [financial, setFinancial] = useState<FinancialSustainabilityMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, bcm, fs, fin] = await Promise.all([
        EnterpriseEISRFRPService.getDashboardKPIs(),
        EnterpriseEISRFRPService.getCriticalProcesses(),
        EnterpriseEISRFRPService.getForesightScenarios(),
        EnterpriseEISRFRPService.getFinancialMetrics(),
      ]);
      setKpis(k); setBcmProcesses(bcm); setForesight(fs); setFinancial(fin);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:    { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:   { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:     { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:  { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:     (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:    { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:     { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle:{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    th:      { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:      { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🛡️</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Carregando EISRFRP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0c4a6e 50%, #020617 100%)', border: '1px solid #0284c733', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🛡️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE INSTITUTIONAL SUSTAINABILITY, RESILIENCE & FUTURE READINESS PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EISRFRP — Resiliência & Sustentabilidade Longo Prazo 🛡️
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Assegurando a continuidade operacional ininterrupta, resiliência contra ciberataques ou crises e sustentabilidade financeira por décadas.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ISO 22301 (BCM)', 'ISO 31000 (ERM)', 'ISO 27001', 'ISO 42001', 'Multi-Region GCP', 'Zero Trust', 'Strategic Foresight'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Score de Resiliência Global', kpis.globalResilienceScore.toFixed(1), '/100', '#38bdf8', '🛡️')}
          {kpiCard('Prontidão BCM (ISO 22301)', `${kpis.bcmReadinessPercent.toFixed(1)}%`, '', '#34d399', '🔄')}
          {kpiCard('Reserva Operacional', `${kpis.financialReserveMonths}`, 'meses', '#fbbf24', '💰')}
          {kpiCard('Conformidade RTO/RPO', `${kpis.rtoComplianceRate}%`, '', '#4ade80', '⏱️')}
          {kpiCard('Prontidão Futura (Foresight)', kpis.futureReadinessScore.toFixed(1), '/100', '#a78bfa', '🔮')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Resiliência & Continuidade (ISO 22301 / ISO 31000)</div>
          {[
            { l: 'Sustentabilidade Institucional', v: 98, c: '#38bdf8' },
            { l: 'Resiliência Organizacional', v: 97, c: '#34d399' },
            { l: 'Continuidade do Negócio (BCM)', v: 99, c: '#4ade80' },
            { l: 'Future Readiness & Foresight', v: 95, c: '#a78bfa' },
            { l: 'Recuperação de Desastres (DRP)', v: 99, c: '#fbbf24' },
            { l: 'Sustentabilidade Financeira', v: 96, c: '#fb923c' },
            { l: 'Governança da Continuidade', v: 98, c: '#60a5fa' },
            { l: 'Resiliência Digital & Cloud', v: 99, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Visão Geral de Maturidade</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Resiliência', v: Math.round(kpis.globalResilienceScore), c: '#38bdf8' },
              { label: 'BCM', v: Math.round(kpis.bcmReadinessPercent), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.maturityScore), c: '#a78bfa' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>⚡ Status de Testes BCM (Drills)</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              100% dos testes de desastre (failover multi-region, ransomware vault e indisponibilidade) concluídos com sucesso pleno. RTO médio de 15 minutos cumprido.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Centro de BCM ─────────────────────────────────────────────────

  const renderBCM = () => (
    <div>
      <div style={styles.secTitle}>🔄 Centro de Continuidade do Negócio (BCM - ISO 22301)</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Processo Crítico', 'Departamento', 'RTO', 'RPO', 'Prioridade', 'Ameaça Primária', 'Status Drill', 'Score Resiliência'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bcmProcesses.map(item => {
              const pri = PRIORITY_CFG[item.priority];
              const th = THREAT_CFG[item.primaryRisk];
              return (
                <tr key={item.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{item.processName}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{item.department}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#ef4444' }}>{item.rto}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#38bdf8' }}>{item.rpo}</td>
                  <td style={styles.td}>{badge(pri.label, pri.color, pri.bg)}</td>
                  <td style={{ ...styles.td, color: th.color, fontWeight: 600 }}>{th.label}</td>
                  <td style={styles.td}>{badge(item.drillStatus, '#22c55e', '#14532d')}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 900, color: '#34d399' }}>{item.resilienceScore}/100</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 3: Gestão de Resiliência ─────────────────────────────────────────

  const renderResilience = () => (
    <div>
      <div style={styles.secTitle}>⚡ Planos de Contingência & DRP (Disaster Recovery)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {bcmProcesses.map(item => (
          <div key={item.id} style={{ ...styles.card, borderTop: '4px solid #38bdf8' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{item.processName}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Responsável: <strong>{item.responsible}</strong></div>

            <div style={{ background: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>📋 Plano de Contingência Detalhado</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{item.contingencyPlan}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
              <span>Último Teste: <strong>{item.lastDrillDate}</strong></span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Teste Validado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 4: Sustentabilidade Financeira ───────────────────────────────────

  const renderFinancial = () => (
    <div>
      <div style={styles.secTitle}>💰 Sustentabilidade Financeira & Projeções de Liquidez</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {financial.map(item => (
          <div key={item.id} style={{ ...styles.card, borderLeft: '4px solid #34d399' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{item.metric}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
              <div><span style={{ fontSize: 10, color: '#64748b' }}>Atual</span><div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{item.currentValue}</div></div>
              <div><span style={{ fontSize: 10, color: '#64748b' }}>Meta</span><div style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>{item.targetValue}</div></div>
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', background: '#1e293b', padding: 10, borderRadius: 8 }}>
              <strong>Horizonte:</strong> {item.horizonProjection}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 5: Strategic Foresight ───────────────────────────────────────────

  const renderForesight = () => (
    <div>
      <div style={styles.secTitle}>🔮 Strategic Foresight — Cenários Prospectivos (5, 10, 20 Anos)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {foresight.map(item => (
          <div key={item.id} style={{ ...styles.card, borderTop: '4px solid #a78bfa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              {badge(`Horizonte: ${item.horizon.replace('_', ' ')}`, '#a78bfa', '#2e1065')}
              {badge(item.category, '#60a5fa', '#1e3a5f')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 10 }}>{item.trendDescription}</div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>🛡️ Mitigação Estratégica Antecipada</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.strategicMitigation}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
              <span>Prontidão: <strong style={{ color: '#34d399' }}>{item.readinessLevel}%</strong></span>
              <span>Confiança IA: <strong style={{ color: '#a78bfa' }}>{item.aiForecastConfidence}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 6: Inteligência Preditiva de Crises ──────────────────────────────

  const renderAICrises = () => (
    <div>
      <div style={styles.secTitle}>🤖 Inteligência Preditiva de Crises & Alertas Preventivos</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #38bdf8' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Motor de IA integrado ao Command Center e ao Digital Twin para simulação em tempo real de cenários de estresse e detecção precoce de anomalias.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { t: 'Prevenção de Ransomware', d: 'Varredura contínua de comportamento anômalo em cofres de dados.', c: '#34d399' },
            { t: 'Alertas de Liquidez', d: 'Simulação Monte Carlo projetando caixa para os próximos 36 meses.', c: '#60a5fa' },
            { t: 'Failover Automático Cloud', d: 'Detecção de degradação GCP com comutação transparente de regiões.', c: '#a78bfa' },
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderTop: `3px solid ${item.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel Executivo do Chief Resilience Officer (CRO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #38bdf8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Resiliência Global', v: '97.4/100', c: '#38bdf8', i: '🛡️' },
            { l: 'Drills BCM Aprovados', v: '100%', c: '#34d399', i: '🎯' },
            { l: 'Reserva Financeira', v: '6.4 meses', c: '#fbbf24', i: '💰' },
            { l: 'Prontidão Futura', v: '94.8/100', c: '#a78bfa', i: '🔮' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação Final ────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0c4a6e 50%, #020617 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE RESILIÊNCIA E SUSTENTABILIDADE ENTERPRISE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EISRFRP — Enterprise Institutional Sustainability,<br />Resilience & Future Readiness Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor certifica que seu ecossistema de continuidade operacional, resiliência cibernética, liquidez e preparação para o futuro está 100% certificado sob a norma ISO 22301 e ISO 31000.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EISRFRP Emitido — Prompt 070' : '🛡️ Emitir Certificado EISRFRP Final'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer Executivo do Chief Resilience Officer (CRO)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          O sistema de resiliência e sustentabilidade institucional do Instituto Ser Melhor foi auditado com nota 97.4/100. Todos os serviços essenciais possuem redundância ativa com RTO máximo de 15 minutos e reservas operacionais garantidas por mais de 6 meses. A instituição está plenamente preparada para operar com segurança e excelência nas próximas décadas.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CRO/CSO Board & Resilience Hub': renderDashboard,
    'Centro de Continuidade do Negócio (BCM)': renderBCM,
    'Gestão de Resiliência Organizacional': renderResilience,
    'Sustentabilidade Financeira & Liquidez': renderFinancial,
    'Strategic Foresight & Future Readiness': renderForesight,
    'Inteligência Preditiva de Crises':     renderAICrises,
    'Painéis Executivos & Analytics':        renderExecutive,
    'CERTIFICAÇÃO EISRFRP FINAL':            renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🛡️ EISRFRP — Enterprise Institutional Sustainability, Resilience & Future Readiness Platform</h1>
        <p style={styles.sub}>Prompt 070 · Instituto Ser Melhor v2.0 · ISO 22301 · ISO 31000 · ISO 27001 · Strategic Foresight · Enterprise BCM</p>
      </div>

      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            <span>{TAB_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {tabContent[activeTab]()}
    </div>
  );
}

export default EISRFRPPage;
