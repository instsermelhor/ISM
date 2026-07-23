/**
 * EAEIALPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Autonomous Evolution, Innovation & Architecture Lifecycle Platform
 * Instituto Ser Melhor — Prompt 091 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CEA/CINO Board & Evolution Cockpit  — Dashboard (Score 99.1 · ARB 42 Decisões · Debt 2.1%)
 *   2. Technology Radar Corporativo (5 Entradas)  — ADOTAR / EXPERIMENTAR / AVALIAR / DESCONTINUAR
 *   3. Observatório da Dívida Técnica             — DEBT-001 & DEBT-002 com plano de remediação
 *   4. Backlog Estratégico (ARB Aprovado)         — BLG-001 ao BLG-003 com ROI, esforço e confiança IA
 *   5. Portfólio de Inovação                      — INNOV-001 & INNOV-002 (Experimento → Escala)
 *   6. Architecture Review Board (ARB) Portal     — Aprovações formais de mudanças estruturais
 *   7. Roadmap de Evolução Tecnológica (10 Anos)  — Plano Diretor 2026 → 2036
 *   8. CERTIFICAÇÃO DE EVOLUÇÃO ARQUITETURAL      — Architecture Evolution Score 99.1/100
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEAEIALPService,
  type TechRadarEntry, type TechnicalDebtItem,
  type StrategicBacklogItem, type InnovationInitiative,
  type EAEIALPDashboardKPIs, type TechRadarCategory, type TechnicalDebtSeverity,
  type BacklogItemStatus, type InnovationStatus,
} from '../services/autonomousEvolutionEAEIALPEnterprise';

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
      <div style={{ height: 6, width: `${Math.min(value, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

// ── Config Maps ───────────────────────────────────────────────────────────────

const RADAR_CFG: Record<TechRadarCategory, { label: string; color: string; bg: string; icon: string }> = {
  ADOTAR:        { label: '✅ ADOTAR',        color: '#22c55e', bg: '#14532d', icon: '🟢' },
  EXPERIMENTAR:  { label: '🧪 EXPERIMENTAR', color: '#38bdf8', bg: '#1e3a5f', icon: '🔵' },
  AVALIAR:       { label: '🔍 AVALIAR',      color: '#fbbf24', bg: '#78350f', icon: '🟡' },
  DESCONTINUAR:  { label: '⛔ DESCONTINUAR', color: '#ef4444', bg: '#450a0a', icon: '🔴' },
};

const DEBT_CFG: Record<TechnicalDebtSeverity, { color: string; bg: string }> = {
  CRITICA:  { color: '#ef4444', bg: '#450a0a' },
  ALTA:     { color: '#f97316', bg: '#431407' },
  MODERADA: { color: '#fbbf24', bg: '#78350f' },
  BAIXA:    { color: '#34d399', bg: '#14532d' },
};

const BACKLOG_CFG: Record<BacklogItemStatus, { label: string; color: string; bg: string }> = {
  APROVADO_ARB:  { label: '✅ APROVADO ARB',   color: '#22c55e', bg: '#14532d' },
  EM_AVALIACAO:  { label: '🔍 EM AVALIAÇÃO',   color: '#fbbf24', bg: '#78350f' },
  PLANEJADO:     { label: '📋 PLANEJADO',       color: '#60a5fa', bg: '#1e3a5f' },
  CONCLUIDO:     { label: '🏁 CONCLUÍDO',       color: '#a78bfa', bg: '#2e1065' },
};

const INNOV_CFG: Record<InnovationStatus, { label: string; color: string; bg: string }> = {
  EXPERIMENTO: { label: '🧪 EXPERIMENTO', color: '#38bdf8', bg: '#1e3a5f' },
  VALIDADO:    { label: '✅ VALIDADO',    color: '#22c55e', bg: '#14532d' },
  ESCALA:      { label: '🚀 ESCALA',      color: '#c084fc', bg: '#2e1065' },
  ARQUIVADO:   { label: '📦 ARQUIVADO',   color: '#64748b', bg: '#1e293b' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const EVOLUTION_SCORES = [
  { l: 'Evolução Arquitetural (TOGAF 10 ADRs)', v: 100, c: '#38bdf8' },
  { l: 'Inovação (ISO 56002 · Portfólio 6 Iniciativas)', v: 98, c: '#c084fc' },
  { l: 'Gestão do Ciclo de Vida (90 Componentes)', v: 99, c: '#34d399' },
  { l: 'Radar Tecnológico (5 Categorias Mapeadas)', v: 99, c: '#60a5fa' },
  { l: 'Dívida Técnica (Índice 2.1% — Mínimo Histórico)', v: 98, c: '#fbbf24' },
  { l: 'Governança Arquitetural (ARB · 42 Decisões Formais)', v: 100, c: '#f472b6' },
  { l: 'Gestão de Portfólio Tecnológico', v: 99, c: '#4ade80' },
  { l: 'Observabilidade da Evolução (OpenTelemetry)', v: 99, c: '#a78bfa' },
  { l: 'Segurança das Mudanças (SHA-256 + ARB Gate)', v: 100, c: '#f87171' },
  { l: 'Sustentabilidade Tecnológica', v: 98, c: '#818cf8' },
  { l: 'Modernização Contínua (SAFe Enterprise ART)', v: 99, c: '#86efac' },
  { l: 'Gestão do Conhecimento Arquitetural (ADR Register)', v: 99, c: '#e879f9' },
  { l: 'Capacidade Adaptativa (Auto-Evolution Engine)', v: 98, c: '#fb923c' },
  { l: 'Excelência em Engenharia (DORA ELITE Metrics)', v: 99, c: '#22d3ee' },
  { l: 'MATURIDADE GLOBAL DE EVOLUÇÃO CONTÍNUA', v: 99.1, c: '#38bdf8' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CEA/CINO Board & Evolution Cockpit',
  'Technology Radar Corporativo',
  'Observatório da Dívida Técnica',
  'Backlog Estratégico (ARB Aprovado)',
  'Portfólio de Inovação',
  'Architecture Review Board (ARB) Portal',
  'Roadmap de Evolução Tecnológica (10 Anos)',
  'CERTIFICAÇÃO DE EVOLUÇÃO ARQUITETURAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEA/CINO Board & Evolution Cockpit': '🔭',
  'Technology Radar Corporativo':             '📡',
  'Observatório da Dívida Técnica':           '🔬',
  'Backlog Estratégico (ARB Aprovado)':       '📋',
  'Portfólio de Inovação':                   '💡',
  'Architecture Review Board (ARB) Portal':  '⚖️',
  'Roadmap de Evolução Tecnológica (10 Anos)':'🗺️',
  'CERTIFICAÇÃO DE EVOLUÇÃO ARQUITETURAL':    '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EAEIALPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEA/CINO Board & Evolution Cockpit');
  const [kpis, setKpis] = useState<EAEIALPDashboardKPIs | null>(null);
  const [radar, setRadar] = useState<TechRadarEntry[]>([]);
  const [debt, setDebt] = useState<TechnicalDebtItem[]>([]);
  const [backlog, setBacklog] = useState<StrategicBacklogItem[]>([]);
  const [innovations, setInnovations] = useState<InnovationInitiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, r, d, b, i] = await Promise.all([
        EnterpriseEAEIALPService.getDashboardKPIs(),
        EnterpriseEAEIALPService.getTechRadar(),
        EnterpriseEAEIALPService.getTechnicalDebt(),
        EnterpriseEAEIALPService.getStrategicBacklog(),
        EnterpriseEAEIALPService.getInnovationInitiatives(),
      ]);
      setKpis(k); setRadar(r); setDebt(d); setBacklog(b); setInnovations(i);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:     { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:    { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:      { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:   { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:      (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:     { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:      { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 } as React.CSSProperties,
    th:       { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:       { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🔭</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando EAEIALP — Plataforma de Evolução Autônoma…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0c4a6e 40%, #0f172a 100%)', border: '1px solid #38bdf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🔭</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE AUTONOMOUS EVOLUTION, INNOVATION & ARCHITECTURE LIFECYCLE PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EAEIALP — Evolução Autônoma & Ciclo de Vida Arquitetural 🔭 · Prompt 091
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A camada de auto-aperfeiçoamento contínuo da Plataforma ISM v2.0, responsável por avaliar, propor e governar toda evolução tecnológica, arquitetural e de inovação de forma estruturada, auditável e orientada por valor.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Technology Radar', 'ARB 42 Decisões', 'Debt 2.1%', 'ISO 56002', 'SAFe Enterprise', 'ADR Register'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Architecture Evolution Score', kpis.architectureEvolutionScore.toFixed(1), '/100', '#38bdf8', '🔭')}
          {kpiCard('Índice de Inovação', kpis.innovationIndex.toFixed(1), '/100', '#c084fc', '💡')}
          {kpiCard('Índice de Dívida Técnica', `${kpis.technicalDebtIndex}%`, '', '#fbbf24', '🔬')}
          {kpiCard('Decisões ARB Formais', kpis.arbDecisionsMade, 'aprovações', '#34d399', '⚖️')}
          {kpiCard('Backlog Estratégico', kpis.activeBacklogItems, 'itens ativos', '#60a5fa', '📋')}
          {kpiCard('Iniciativas de Inovação', kpis.innovationInitiativesActive, 'em andamento', '#f472b6', '🚀')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade EAEIALP (15 Dimensões)</div>
          {EVOLUTION_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Resumo Executivo de Evolução Tecnológica</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { l: 'Taxa de Atualização Tecnológica', v: `${kpis?.technologyUpdateIndex}%`, c: '#38bdf8' },
              { l: 'Refatorações Concluídas', v: `${kpis?.refactoringCompletionRate}%`, c: '#34d399' },
              { l: 'Maturidade Global de Evolução', v: `${kpis?.globalEvolutionMaturityScore}/100`, c: '#c084fc' },
              { l: 'Índice de Dívida Técnica', v: `${kpis?.technicalDebtIndex}% (Mínimo)`, c: '#fbbf24' },
            ].map((k, i) => (
              <div key={i} style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 12, border: '1px solid #38bdf833' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>🔭 Architecture Review Board — Última Decisão</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              ARB deliberou formalmente sobre a migração do Knowledge Graph para AlloyDB AI com pgvector nativo, aprovando ROI estimado de 38% e prazo de 30 dias.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Technology Radar ───────────────────────────────────────────────

  const renderTechRadar = () => (
    <div>
      <div style={styles.secTitle}>📡 Technology Radar Corporativo — Instituto Ser Melhor (Julho 2026)</div>
      {(['ADOTAR', 'EXPERIMENTAR', 'AVALIAR', 'DESCONTINUAR'] as TechRadarCategory[]).map(cat => {
        const entries = radar.filter(r => r.radarCategory === cat);
        if (!entries.length) return null;
        const cfg = RADAR_CFG[cat];
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: cfg.color, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{cfg.icon}</span> {cfg.label} ({entries.length} tecnologia{entries.length > 1 ? 's' : ''})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
              {entries.map(e => (
                <div key={e.id} style={{ ...styles.card, borderLeft: `4px solid ${cfg.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{e.entryCode}</span>
                    {badge(cfg.label, cfg.color, cfg.bg)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{e.technology}</div>
                  <div style={{ fontSize: 11, color: '#38bdf8', marginBottom: 8 }}>📂 {e.domain} · v{e.currentVersion}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.45, marginBottom: 10 }}>{e.rationale}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cfg.color }}>{e.adoptionScore}%</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>Adoção</div>
                    </div>
                    <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>{e.strategicAlignment}%</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>Alinhamento</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── TAB 3: Dívida Técnica ─────────────────────────────────────────────────

  const renderTechDebt = () => (
    <div>
      <div style={styles.secTitle}>🔬 Observatório da Dívida Técnica (Índice Atual: 2.1% — Mínimo Histórico)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {debt.map(d => {
          const cfg = DEBT_CFG[d.severity];
          return (
            <div key={d.id} style={{ ...styles.card, borderTop: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{d.debtCode}</span>
                {badge(`${d.severity}`, cfg.color, cfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 8 }}>📌 {d.component}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>
                <strong style={{ color: '#f87171' }}>Impacto:</strong> {d.impactDescription}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>
                <strong style={{ color: '#34d399' }}>Remediação:</strong> {d.remediationPlan}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24' }}>{d.estimatedHours}h</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Esforço</div>
                </div>
                <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f472b6' }}>R$ {d.estimatedCost.toLocaleString('pt-BR')}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Custo Estimado</div>
                </div>
                {badge(d.status === 'EM_TRATAMENTO' ? '🔧 EM TRATAMENTO' : d.status === 'ABERTO' ? '⚠️ ABERTO' : '✅ RESOLVIDO',
                  d.status === 'EM_TRATAMENTO' ? '#38bdf8' : d.status === 'ABERTO' ? '#fbbf24' : '#22c55e',
                  d.status === 'EM_TRATAMENTO' ? '#1e3a5f' : d.status === 'ABERTO' ? '#78350f' : '#14532d')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Backlog Estratégico ────────────────────────────────────────────

  const renderBacklog = () => (
    <div>
      <div style={styles.secTitle}>📋 Backlog Estratégico ({backlog.length} itens exibidos de 18 ativos)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {backlog.map(b => {
          const cfg = BACKLOG_CFG[b.status];
          return (
            <div key={b.id} style={{ ...styles.card, borderTop: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{b.backlogCode}</span>
                {badge(cfg.label, cfg.color, cfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: 11, color: '#c084fc', marginBottom: 8 }}>📂 {b.category.replace('_', ' ')}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>ROI {b.estimatedROI}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>ROI Estimado</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>{b.effortDays}d</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Esforço</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa' }}>{b.aiConfidence}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Confiança IA</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b' }}>
                Prioridade: <strong style={{ color: '#f1f5f9' }}>P{b.priority}</strong> · Deps: {b.dependencies.join(', ')}
              </div>
              {b.arbApprovedAt && (
                <div style={{ fontSize: 10, color: '#22c55e', marginTop: 4 }}>
                  ✅ ARB Aprovado em: {new Date(b.arbApprovedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Portfólio de Inovação ──────────────────────────────────────────

  const renderInnovations = () => (
    <div>
      <div style={styles.secTitle}>💡 Portfólio de Inovação ({innovations.length} iniciativas exibidas de 6 ativas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {innovations.map(inn => {
          const cfg = INNOV_CFG[inn.status];
          return (
            <div key={inn.id} style={{ ...styles.card, borderTop: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{inn.initiativeCode}</span>
                {badge(cfg.label, cfg.color, cfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{inn.title}</div>
              <div style={{ fontSize: 11, color: '#c084fc', marginBottom: 8 }}>📂 {inn.domain}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 10 }}>
                <strong style={{ color: '#34d399' }}>Impacto esperado:</strong> {inn.expectedImpact}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 10 }}>
                <strong style={{ color: '#38bdf8' }}>Resultado:</strong> {inn.resultsNotes}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24' }}>{inn.confidenceScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Confiança</div>
                </div>
                <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa' }}>
                    {new Date(inn.pilotStartDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Início do Piloto</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 6: ARB Portal ─────────────────────────────────────────────────────

  const renderARB = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Architecture Review Board (ARB) Portal — Governança de Mudanças Estruturais</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O ARB é o órgão formal responsável por validar todas as evoluções arquiteturais da Plataforma ISM v2.0. Nenhuma mudança estrutural pode ser aplicada em produção sem aprovação documentada e rastreavél via ADR.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Decisões Formais no ARB', v: '42 Aprovações', c: '#fbbf24' },
            { l: 'ADRs Registrados', v: '38 Documentos', c: '#38bdf8' },
            { l: 'Tempo Médio de Aprovação', v: '< 48 horas', c: '#34d399' },
            { l: 'Taxa de Conformidade', v: '100% Auditado', c: '#c084fc' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Roadmap 10 Anos ────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor de Evolução Tecnológica (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#38bdf8', items: ['Migração Knowledge Graph → AlloyDB AI (pgvector)', 'PoC Edge Computing WASM para Municípios', 'Federated Learning Cross-Tenant em Produção', 'Certificação SOC 2 Type II Externa'] },
          { year: '2028 (3 Anos)', color: '#34d399', items: ['Expansão LatAm: Colômbia + Chile + México', 'GraphQL Federation Supergraph para APIs', 'Vertex AI Gemini 3.0 Multimodal Upgrade', 'ISO 27701 (Privacy Information Management)'] },
          { year: '2031 (5 Anos)', color: '#c084fc', items: ['Raciocínio Causal Quântico-Resistente (Post-Quantum Crypto)', 'Digital Twins Predictivos em Tempo Real com ML', 'Arquitetura Serverless-First (Cloud Run v3)', 'IPO ou Parceria Estratégica Global'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['Infraestrutura Cognitiva Autônoma Global', 'Rede Federal de 5.000+ Organizações Conectadas', 'IA Causal Federada com Dados de 100M Cidadãos', 'Referência Internacional em Social Tech'] },
        ].map((r, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${r.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: r.color, marginBottom: 12 }}>🗓️ {r.year}</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {r.items.map((item, j) => (
                <li key={j} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.45 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0c4a6e 40%, #0f172a 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE EVOLUÇÃO ARQUITETURAL CONTÍNUA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EAEIALP — Enterprise Autonomous Evolution,<br />Innovation & Architecture Lifecycle Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como uma plataforma com capacidade permanente de auto-evolução tecnológica, inovação governada e gestão completa do ciclo de vida arquitetural.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0369a1, #075985)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EAEIALP Emitido — Prompt 091' : '🏆 Emitir Certificado Enterprise de Evolução Arquitetural Contínua'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EAEIALP — Etapa 20 (Certificação Final de Evolução Contínua)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {EVOLUTION_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #38bdf833' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🔭 Declaração do Chief Enterprise Architect & Chief Innovation Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EAEIALP assegura que a Plataforma Instituto Ser Melhor nunca se tornará obsoleta. Com nota global de maturidade de <strong style={{ color: '#38bdf8' }}>99.1/100</strong>, Technology Radar ativo, ARB com 42 decisões formais registradas, backlog estratégico de 18 itens priorizados e índice de dívida técnica em mínimo histórico de 2.1%, a plataforma está preparada para evoluir continuamente. <strong style={{ color: '#f1f5f9' }}>Evolução Contínua Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEA/CINO Board & Evolution Cockpit': renderDashboard,
    'Technology Radar Corporativo':             renderTechRadar,
    'Observatório da Dívida Técnica':           renderTechDebt,
    'Backlog Estratégico (ARB Aprovado)':       renderBacklog,
    'Portfólio de Inovação':                   renderInnovations,
    'Architecture Review Board (ARB) Portal':  renderARB,
    'Roadmap de Evolução Tecnológica (10 Anos)':renderRoadmap,
    'CERTIFICAÇÃO DE EVOLUÇÃO ARQUITETURAL':    renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🔭 EAEIALP — Enterprise Autonomous Evolution, Innovation & Architecture Lifecycle Platform</h1>
        <p style={styles.sub}>Prompt 091 · Instituto Ser Melhor v2.0 · Technology Radar · ARB 42 Decisões · Debt 2.1% · ISO 56002 · SAFe Enterprise · Evolution Score 99.1</p>
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

export default EAEIALPPage;
