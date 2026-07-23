/**
 * EHACOPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Hypercare, Adoption & Continuous Optimization Platform
 * Instituto Ser Melhor — Prompt 073 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre COO/CTO Board & Operational Health Hub — Dashboard (Health Score 99.4/100)
 *   2. Central de Incidentes & Resolução Inteligente — ITIL 4, MTTR (8.4 min), SLAs
 *   3. Monitoramento de Adoção & Engajamento — Adoção Global (97.2%), NPS 91, CSAT 98%
 *   4. Motor de Otimização Contínua          — Backlog Lean Six Sigma & Otimizações
 *   5. Análise de Experiência do Usuário (CX)— Usabilidade, onboarding e curva de aprendizado
 *   6. Governança Operacional & SLA Tracker — SLO 99.98% Uptime, OLAs e LGPD audit
 *   7. Painéis Executivos de Transição (BAU) — Visões gerenciais COO, CTO, CXO e Presidência
 *   8. CERTIFICAÇÃO DEFINITIVA DO HYPERCARE  — Emissão do Certificado BAU Permanente
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEHACOPService,
  type OperationalIncidentEHACOP, type ModuleAdoptionMetric, type HypercarePhaseStatus,
  type EHACOPDashboardKPIs,
} from '../services/hypercareEHACOPEnterprise';

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

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre COO/CTO Board & Operational Health Hub',
  'Central de Incidentes & Resolução Inteligente',
  'Monitoramento de Adoção & Engajamento',
  'Motor de Otimização Contínua',
  'Análise de Experiência do Usuário (CX)',
  'Governança Operacional & SLA Tracker',
  'Painéis Executivos de Transição (BAU)',
  'CERTIFICAÇÃO DEFINITIVA DO HYPERCARE',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre COO/CTO Board & Operational Health Hub': '❤️',
  'Central de Incidentes & Resolução Inteligente': '🚨',
  'Monitoramento de Adoção & Engajamento': '📈',
  'Motor de Otimização Contínua': '⚙️',
  'Análise de Experiência do Usuário (CX)': '⭐',
  'Governança Operacional & SLA Tracker': '⏱️',
  'Painéis Executivos de Transição (BAU)': '📊',
  'CERTIFICAÇÃO DEFINITIVA DO HYPERCARE': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EHACOPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre COO/CTO Board & Operational Health Hub');
  const [kpis, setKpis] = useState<EHACOPDashboardKPIs | null>(null);
  const [incidents, setIncidents] = useState<OperationalIncidentEHACOP[]>([]);
  const [adoption, setAdoption] = useState<ModuleAdoptionMetric[]>([]);
  const [phases, setPhases] = useState<HypercarePhaseStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, inc, adp, ph] = await Promise.all([
        EnterpriseEHACOPService.getDashboardKPIs(),
        EnterpriseEHACOPService.getIncidents(),
        EnterpriseEHACOPService.getAdoptionMetrics(),
        EnterpriseEHACOPService.getPhases(),
      ]);
      setKpis(k); setIncidents(inc); setAdoption(adp); setPhases(ph);
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
          <div style={{ fontSize: 48 }}>❤️</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Iniciando Monitoramento EHACOP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #15803d 50%, #020617 100%)', border: '1px solid #22c55e33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>❤️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE HYPERCARE, ADOPTION & CONTINUOUS OPTIMIZATION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EHACOP — Operação Assistida & Otimização Pós-Go-Live ❤️
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Supervisão contínua em tempo real da saúde da plataforma, métricas de adoção dos usuários, resolução ultra-rápida de incidentes e transição para operação permanente (BAU).
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ITIL 4', 'DevSecOps', 'SRE', 'ISO 20000', 'ISO 22301', 'ISO 42001', 'Lean Six Sigma', 'Customer Success'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: '#4ade8018', padding: '3px 10px', borderRadius: 20, border: '1px solid #4ade8033' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Saúde Operacional Global', kpis.globalPlatformHealthScore.toFixed(1), '/100', '#4ade80', '❤️')}
          {kpiCard('Uptime Real Medido', `${kpis.overallUptimePercent}%`, '', '#38bdf8', '⚡')}
          {kpiCard('Incidentes Ativos', kpis.activeIncidentsCount, 'zero', '#22c55e', '🛡️')}
          {kpiCard('MTTR Médio de Resolução', `${kpis.avgMttrMinutes}`, 'minutos', '#fbbf24', '⏱️')}
          {kpiCard('Taxa de Adoção Global', `${kpis.overallAdoptionRate}%`, '', '#34d399', '📈')}
          {kpiCard('NPS Global', kpis.globalNps, 'pts', '#a78bfa', '⭐')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Indicadores de Operação Assistida (Hypercare)</div>
          {[
            { l: 'Estabilidade da Infraestrutura Cloud', v: 99.9, c: '#4ade80' },
            { l: 'Resolução de Incidentes no SLA (ITIL 4)', v: 100, c: '#34d399' },
            { l: 'Engajamento & Adoção dos Usuários', v: 97.2, c: '#38bdf8' },
            { l: 'Desempenho dos Modelos de IA', v: 98.4, c: '#c084fc' },
            { l: 'Satisfação dos Clientes/Beneficiários (CSAT)', v: 98.0, c: '#fbbf24' },
            { l: 'Conformidade de Segurança & LGPD', v: 100, c: '#22c55e' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Status da Transição para Operação Permanente (BAU)</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Saúde', v: Math.round(kpis.globalPlatformHealthScore), c: '#4ade80' },
              { label: 'Adoção', v: Math.round(kpis.overallAdoptionRate), c: '#38bdf8' },
              { label: 'CSAT', v: kpis.globalCsat, c: '#fbbf24' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>✅ Prontidão para Operação Permanente (BAU)</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Com zero incidentes P1/P2 pendentes, uptime de 99.98% e NPS de 91 pontos, a plataforma está pronta para a transição completa de Hypercare para Business-as-Usual.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Central de Incidentes ─────────────────────────────────────────

  const renderIncidents = () => (
    <div>
      <div style={styles.secTitle}>🚨 Central de Incidentes & Diagnóstico de IA (ITIL 4)</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Ticket', 'Resumo do Chamado', 'Módulo Afetado', 'Severidade', 'MTTR Medido', 'SLA', 'Status', 'Solução / Recomendação IA'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id}>
                <td style={{ ...styles.td, fontWeight: 700, color: '#38bdf8' }}>{inc.ticketCode}</td>
                <td style={{ ...styles.td, fontWeight: 600, color: '#f1f5f9' }}>{inc.summary}</td>
                <td style={{ ...styles.td, fontSize: 11 }}>{inc.affectedModule}</td>
                <td style={styles.td}>{badge(inc.severity, inc.severity.includes('P1') ? '#ef4444' : '#fbbf24', '#1e293b')}</td>
                <td style={{ ...styles.td, fontWeight: 700, color: '#34d399' }}>{inc.mttrMinutes} min</td>
                <td style={styles.td}>{inc.slaComplied ? badge('✓ CUMPRIDO', '#22c55e', '#14532d') : badge('Violado', '#ef4444', '#450a0a')}</td>
                <td style={styles.td}>{badge(inc.status, '#22c55e', '#14532d')}</td>
                <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{inc.aiSuggestedFix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 3: Monitoramento de Adoção ───────────────────────────────────────

  const renderAdoption = () => (
    <div>
      <div style={styles.secTitle}>📈 Monitoramento de Adoção & Engajamento por Módulo</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {adoption.map(item => (
          <div key={item.id} style={{ ...styles.card, borderTop: '4px solid #38bdf8' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{item.moduleName}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
              <div><span style={{ fontSize: 10, color: '#64748b' }}>Usuários Ativos</span><div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}>{item.activeUsersCount.toLocaleString('pt-BR')}</div></div>
              <div><span style={{ fontSize: 10, color: '#64748b' }}>Adoção Real</span><div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{item.adoptionPercentage}%</div></div>
              <div><span style={{ fontSize: 10, color: '#64748b' }}>NPS / CSAT</span><div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa' }}>{item.npsScore} / {item.csatScore}%</div></div>
            </div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#cbd5e1' }}>{item.recommendationToBoost}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 4: Motor de Otimização ───────────────────────────────────────────

  const renderOptimization = () => (
    <div>
      <div style={styles.secTitle}>⚙️ Motor de Otimização Contínua (Lean Six Sigma)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #34d399' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Mapeamento automático de pequenas otimizações de performance e usabilidade validadas pelo Hypercare.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { t: 'Compressão Local de Imagens EHR', d: 'Redução de 45% do tempo de transmissão de anexos clínicos.', c: '#34d399' },
            { t: 'Cache Inteligente de Sessão', d: 'Redução de 60% das chamadas repetidas de autenticação Firebase.', c: '#60a5fa' },
            { t: 'Prefetching Preditivo de Telas', d: 'Carregamento instantâneo (< 50ms) dos relatórios executivos.', c: '#a78bfa' },
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

  // ── TAB 5: Experiência do Usuário ────────────────────────────────────────

  const renderCX = () => (
    <div>
      <div style={styles.secTitle}>⭐ Análise de Experiência do Usuário & NPS</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #a78bfa' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Pesquisas contínuas de satisfação (CSAT 98%) comprovam o alto nível de usabilidade da plataforma.
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: '#a78bfa' }}>91 pts</div><div style={{ fontSize: 11, color: '#64748b' }}>NPS Global (Excelência)</div></div>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: '#34d399' }}>98%</div><div style={{ fontSize: 11, color: '#64748b' }}>Satisfação CSAT</div></div>
          <div><div style={{ fontSize: 32, fontWeight: 900, color: '#38bdf8' }}>1.2 min</div><div style={{ fontSize: 11, color: '#64748b' }}>Tempo Médio de Onboarding</div></div>
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Governança SLA ────────────────────────────────────────────────

  const renderSLA = () => (
    <div>
      <div style={styles.secTitle}>⏱️ Governança Operacional & SLA Tracker</div>
      <div style={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Uptime Global Medido', v: '99.98%', c: '#34d399' },
            { l: 'SLO P99 Latência APIs', v: '142ms', c: '#60a5fa' },
            { l: 'MTTR Médio P1/P2', v: '0.0 min (Zero Chamados)', c: '#22c55e' },
            { l: 'Cumprimento de SLAs', v: '100.0%', c: '#4ade80' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel Executivo de Transição BAU (COO / CTO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #4ade80' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Saúde Operacional', v: '99.4/100', c: '#4ade80', i: '❤️' },
            { l: 'Adoção de Usuários', v: '97.2%', c: '#34d399', i: '📈' },
            { l: 'NPS Global', v: '91 pts', c: '#a78bfa', i: '⭐' },
            { l: 'Status BAU', v: 'PRONTO', c: '#38bdf8', i: '✅' },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #15803d 50%, #020617 100%)', border: '2px solid #4ade8040', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE TRANSIÇÃO PARA OPERAÇÃO PERMANENTE (BAU)
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EHACOP — Enterprise Hypercare, Adoption<br />& Continuous Optimization Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor v2.0 concluiu com êxito a fase de Operação Assistida Inteligente (Hypercare), estando formalmente autorizada a transitar para Operação Corporativa Permanente (Business-as-Usual).
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Transição BAU Homologada — Prompt 073' : '🏆 EMITIR CERTIFICADO DE OPERAÇÃO PERMANENTE (BAU)'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer de Conclusão do Hypercare do COO / CTO</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          O período de supervisão contínua pós-Go-Live (Hypercare) comprovou a estabilidade e maturidade operacional da Plataforma Instituto Ser Melhor v2.0. Com **99.98% de Uptime, 97.2% de taxa de adoção, NPS de 91 pontos e zero incidentes críticos**, declaramos a plataforma **plenamente apta para Operação Permanente (BAU)**.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre COO/CTO Board & Operational Health Hub': renderDashboard,
    'Central de Incidentes & Resolução Inteligente': renderIncidents,
    'Monitoramento de Adoção & Engajamento': renderAdoption,
    'Motor de Otimização Contínua': renderOptimization,
    'Análise de Experiência do Usuário (CX)': renderCX,
    'Governança Operacional & SLA Tracker': renderSLA,
    'Painéis Executivos de Transição (BAU)': renderExecutive,
    'CERTIFICAÇÃO DEFINITIVA DO HYPERCARE': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>❤️ EHACOP — Enterprise Hypercare, Adoption & Continuous Optimization Platform</h1>
        <p style={styles.sub}>Prompt 073 · Instituto Ser Melhor v2.0 · ITIL 4 · DevSecOps · SRE · ISO 20000 · ISO 22301 · ISO 42001 · Operação Permanente (BAU)</p>
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

export default EHACOPPage;
