/**
 * ECDTISPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Digital Twin & Institutional Simulation Platform
 * Instituto Ser Melhor — Prompt 066 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CEA/CAIO Board & Twin Hub   — Dashboard: Score 94.8/100, cobertura 96.4%, 65 entidades
 *   2. Mapa do Gêmeo Digital             — Entidades, estados, sincronização, fidelidade
 *   3. Simulador de Cenários             — Atual, Otimista, Conservador, Crítico + comparação
 *   4. Modelagem Preditiva               — 4 modelos com IC95%, premissas e limitações
 *   5. Decision Intelligence             — Simulação de decisões com opções e recomendação IA
 *   6. Análise Sistêmica & Grafos        — Mapa de influências, alavancas e propagação de riscos
 *   7. Painéis Executivos                — Visões para Presidência, Diretoria, Conselhos
 *   8. CERTIFICAÇÃO ECDTISP FINAL        — Parecer executivo + roadmap 5 anos
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseECDTISPService,
  type TwinEntity, type SimulationScenario, type PredictiveModel,
  type DecisionSimulation, type SystemicAnalysisNode, type ECDTISPDashboardKPIs,
  type TwinEntityType, type SyncStatus, type ScenarioType, type ModelType,
} from '../services/digitalTwinECDTISPEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6 }}>
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
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size > 60 ? 14 : 11} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CEA/CAIO Board & Twin Hub',
  'Mapa do Gêmeo Digital',
  'Simulador de Cenários',
  'Modelagem Preditiva',
  'Decision Intelligence',
  'Análise Sistêmica & Grafos',
  'Painéis Executivos',
  'CERTIFICAÇÃO ECDTISP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEA/CAIO Board & Twin Hub': '🌐',
  'Mapa do Gêmeo Digital':           '🗺️',
  'Simulador de Cenários':           '🎮',
  'Modelagem Preditiva':             '📈',
  'Decision Intelligence':           '🧠',
  'Análise Sistêmica & Grafos':      '🕸️',
  'Painéis Executivos':              '📊',
  'CERTIFICAÇÃO ECDTISP FINAL':      '🏆',
};

// ── Badge Configs ─────────────────────────────────────────────────────────────

const ENTITY_TYPE_CFG: Record<TwinEntityType, { label: string; color: string; bg: string }> = {
  UNIDADE_ORGANIZACIONAL: { label: '🏢 Unidade Org.', color: '#2563eb', bg: '#dbeafe' },
  PROCESSO:               { label: '⚙️ Processo', color: '#0891b2', bg: '#cffafe' },
  PROGRAMA_SOCIAL:        { label: '💚 Programa Social', color: '#059669', bg: '#d1fae5' },
  PROJETO:                { label: '📋 Projeto', color: '#7c3aed', bg: '#f3e8ff' },
  EQUIPE:                 { label: '👥 Equipe', color: '#d97706', bg: '#fef3c7' },
  ATIVO_FINANCEIRO:       { label: '💰 Ativo Financeiro', color: '#16a34a', bg: '#dcfce7' },
  INFRAESTRUTURA_TI:      { label: '🖥️ Infra TI', color: '#6366f1', bg: '#eef2ff' },
  MODELO_IA:              { label: '🤖 Modelo IA', color: '#ec4899', bg: '#fdf2f8' },
  INDICADOR_KPI:          { label: '📊 KPI', color: '#f59e0b', bg: '#fffbeb' },
  RISCO:                  { label: '⚠️ Risco', color: '#dc2626', bg: '#fee2e2' },
  BENEFICIARIO_GRUPO:     { label: '🌱 Beneficiários', color: '#84cc16', bg: '#f7fee7' },
  CADEIA_DECISAO:         { label: '🧭 Decisão', color: '#8b5cf6', bg: '#f5f3ff' },
};

const SYNC_CFG: Record<SyncStatus, { label: string; color: string; dot: string }> = {
  SINCRONIZADO:  { label: 'Sincronizado', color: '#22c55e', dot: '🟢' },
  PENDENTE:      { label: 'Pendente', color: '#f59e0b', dot: '🟡' },
  ERRO:          { label: 'Erro', color: '#ef4444', dot: '🔴' },
  DESATUALIZADO: { label: 'Desatualizado', color: '#9ca3af', dot: '⚪' },
};

const SCENARIO_CFG: Record<ScenarioType, { label: string; color: string; bg: string; icon: string }> = {
  ATUAL:        { label: 'Atual',        color: '#60a5fa', bg: '#1e3a5f', icon: '📍' },
  OTIMISTA:     { label: 'Otimista',     color: '#34d399', bg: '#064e3b', icon: '🚀' },
  CONSERVADOR:  { label: 'Conservador',  color: '#fbbf24', bg: '#451a03', icon: '⚖️' },
  CRITICO:      { label: 'Crítico',      color: '#f87171', bg: '#450a0a', icon: '🔴' },
  PERSONALIZADO:{ label: 'Personalizado',color: '#a78bfa', bg: '#2e1065', icon: '✏️' },
};

const MODEL_TYPE_CFG: Record<ModelType, string> = {
  SERIES_TEMPORAL:         '📉 Séries Temporais',
  REGRESSAO:               '📊 Regressão',
  CLASSIFICACAO:           '🏷️ Classificação',
  SIMULACAO_MONTECARLO:    '🎲 Monte Carlo',
  SYSTEM_DYNAMICS:         '🔄 System Dynamics',
  REDES_NEURAIS:           '🧠 Redes Neurais',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ECDTISPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEA/CAIO Board & Twin Hub');
  const [kpis, setKpis] = useState<ECDTISPDashboardKPIs | null>(null);
  const [entities, setEntities] = useState<TwinEntity[]>([]);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [decisions, setDecisions] = useState<DecisionSimulation[]>([]);
  const [nodes, setNodes] = useState<SystemicAnalysisNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeDecision, setActiveDecision] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, e, s, m, d, n] = await Promise.all([
        EnterpriseECDTISPService.getDashboardKPIs(),
        EnterpriseECDTISPService.getTwinEntities(),
        EnterpriseECDTISPService.getSimulationScenarios(),
        EnterpriseECDTISPService.getPredictiveModels(),
        EnterpriseECDTISPService.getDecisionSimulations(),
        EnterpriseECDTISPService.getSystemicAnalysisNodes(),
      ]);
      setKpis(k); setEntities(e); setScenarios(s); setModels(m); setDecisions(d); setNodes(n);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:      { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:     { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:       { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:    { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:       (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      borderBottom: a ? '1px solid #1e293b' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:      { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    darkCard:  { background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 16 } as React.CSSProperties,
    row:       { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    grid3:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } as React.CSSProperties,
    sec:       { marginBottom: 32 } as React.CSSProperties,
    secTitle:  { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    label:     { fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 } as React.CSSProperties,
    val:       { fontSize: 14, color: '#e2e8f0', fontWeight: 600 } as React.CSSProperties,
    th:        { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:        { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🌐</div>
          <div style={{ color: '#64748b', marginTop: 12, fontSize: 14 }}>Iniciando Gêmeo Digital…</div>
          <div style={{ color: '#334155', marginTop: 6, fontSize: 12 }}>Sincronizando 65 entidades organizacionais</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0d2137 0%, #0f172a 50%, #1a0a2e 100%)', border: '1px solid #1d4ed833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🌐</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE COGNITIVE DIGITAL TWIN & INSTITUTIONAL SIMULATION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ECDTISP — Gêmeo Digital Corporativo 🌐
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Representação digital completa da organização em tempo quase real — simulando cenários estratégicos,
          modelando comportamentos preditivos e apoiando decisões de alto impacto com IA explicável e auditável.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['TOGAF', 'NIST AI RMF', 'ISO 42001', 'System Dynamics', 'Monte Carlo', 'COBIT 2019', 'Decision Intelligence', 'Zero Trust'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', background: '#a78bfa18', padding: '3px 10px', borderRadius: 20, border: '1px solid #a78bfa33' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* KPI Row 1 */}
      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Digital Twin', kpis.twinMaturityScore.toFixed(1), '/100', '#a78bfa', '🌐')}
          {kpiCard('Cobertura Organizacional', kpis.twinCoveragePercent.toFixed(1), '%', '#60a5fa', '📡')}
          {kpiCard('Fidelidade do Twin', kpis.twinFidelityScore.toFixed(1), '/100', '#34d399', '🎯')}
          {kpiCard('Entidades Representadas', kpis.entitiesRepresented, 'módulos', '#fb923c', '🗂️')}
          {kpiCard('Latência de Sync', kpis.syncLatencyMs, 'ms', '#38bdf8', '⚡')}
        </>}
      </div>

      {/* KPI Row 2 */}
      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Cenários Simulados', kpis.scenariosCreated, 'cen.', '#fbbf24', '🎮')}
          {kpiCard('Decisões Simuladas', kpis.decisionsSimulated, 'dec.', '#c084fc', '🧠')}
          {kpiCard('Acurácia Média Modelos', kpis.avgModelAccuracy.toFixed(1), '%', '#4ade80', '📈')}
          {kpiCard('Riscos Antecipados', kpis.risksAnticipated, 'rsks', '#f87171', '⚠️')}
          {kpiCard('Valor Gerado (Otimiz.)', `R$ ${(kpis.savingsGenerated / 1e6).toFixed(1)}M`, '', '#67e8f9', '💎')}
        </>}
      </div>

      {/* Maturity + Ring Grid */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade ECDTISP</div>
          {[
            { l: 'Digital Twin Corporativo', v: 95, c: '#a78bfa' },
            { l: 'Modelagem Organizacional', v: 93, c: '#60a5fa' },
            { l: 'Simulação Estratégica', v: 92, c: '#34d399' },
            { l: 'Modelagem Preditiva', v: 94, c: '#fbbf24' },
            { l: 'Decision Intelligence', v: 91, c: '#fb923c' },
            { l: 'Integração Sistêmica', v: 96, c: '#38bdf8' },
            { l: 'Precisão das Simulações', v: 92, c: '#4ade80' },
            { l: 'Apoio à Alta Administração', v: 93, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 KPIs Primários do Twin</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {kpis && [
              { label: 'Cobertura', v: Math.round(kpis.twinCoveragePercent), c: '#60a5fa' },
              { label: 'Fidelidade', v: Math.round(kpis.twinFidelityScore), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.twinMaturityScore), c: '#a78bfa' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {progressRing(r.v, r.c)}
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.label}</div>
              </div>
            ))}
          </div>
          {[
            { l: 'Inteligência Adaptativa', v: 90, c: '#f87171' },
            { l: 'Gestão de Cenários', v: 93, c: '#fda4af' },
            { l: 'Representação Org.', v: 95, c: '#86efac' },
            { l: 'Governança dos Modelos', v: 91, c: '#d8b4fe' },
            { l: 'Resiliência Organizacional', v: 94, c: '#fed7aa' },
            { l: 'Capacidade Preditiva', v: 92, c: '#a5f3fc' },
            { l: 'Maturidade Global Twin', v: 95, c: '#a78bfa' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>
      </div>

      {/* Sync Status Banner */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>🔄 Status de Sincronização — Entidades Críticas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {entities.slice(0, 6).map(e => {
            const sc = SYNC_CFG[e.syncStatus];
            return (
              <div key={e.id} style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${sc.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: sc.color }}>{sc.dot} {sc.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: '#64748b' }}>Cobertura: <strong style={{ color: '#60a5fa' }}>{e.coverageScore}%</strong></span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>Fidelidade: <strong style={{ color: '#34d399' }}>{e.fidelityScore}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Mapa do Gêmeo Digital ────────────────────────────────────────

  const renderTwinMap = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Total Entidades', entities.length, 'ent.', '#a78bfa', '🗂️')}
        {kpiCard('Sincronizadas', entities.filter(e => e.syncStatus === 'SINCRONIZADO').length, 'ok', '#34d399', '🟢')}
        {kpiCard('Cobertura Média', Math.round(entities.reduce((a, e) => a + e.coverageScore, 0) / (entities.length || 1)), '%', '#60a5fa', '📡')}
        {kpiCard('Fidelidade Média', Math.round(entities.reduce((a, e) => a + e.fidelityScore, 0) / (entities.length || 1)), '/100', '#fbbf24', '🎯')}
      </div>

      <div style={styles.secTitle}>🗺️ Entidades Representadas no Gêmeo Digital</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {entities.map(e => {
          const tc = ENTITY_TYPE_CFG[e.type];
          const sc = SYNC_CFG[e.syncStatus];
          const critColor = { CRITICA: '#f87171', ALTA: '#fbbf24', MEDIA: '#60a5fa', BAIXA: '#4ade80' }[e.criticality];
          return (
            <div key={e.id} style={{ ...styles.card, borderLeft: `4px solid ${tc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    {badge(tc.label, tc.color, tc.bg)}
                    {badge(e.criticality, critColor!, critColor! + '20')}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{e.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: sc.color, fontWeight: 700 }}>{sc.dot} {sc.label}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{e.syncFrequency.replace('_', ' ')}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{e.description}</div>

              {/* State Capsules */}
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>ESTADO ATUAL</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(e.currentState).slice(0, 4).map(([k, v]) => (
                    <div key={k} style={{ background: '#0f172a', borderRadius: 6, padding: '4px 8px', minWidth: 80 }}>
                      <div style={{ fontSize: 9, color: '#64748b' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{typeof v === 'number' && v > 10000 ? `R$ ${(v / 1e6).toFixed(1)}M` : String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage & Fidelity bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={styles.label}>Cobertura</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 5, background: '#1e293b', borderRadius: 3 }}>
                      <div style={{ width: `${e.coverageScore}%`, height: 5, background: '#60a5fa', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>{e.coverageScore}%</span>
                  </div>
                </div>
                <div>
                  <div style={styles.label}>Fidelidade</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 5, background: '#1e293b', borderRadius: 3 }}>
                      <div style={{ width: `${e.fidelityScore}%`, height: 5, background: '#34d399', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>{e.fidelityScore}%</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                🔌 {e.dataSource} &nbsp;|&nbsp; 👤 {e.responsible}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Matrix Table */}
      <div style={{ ...styles.sec, marginTop: 24 }}>
        <div style={styles.secTitle}>📋 Matriz de Representação Digital</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Entidade', 'Tipo', 'Fonte de Dados', 'Frequência', 'Criticidade', 'Cobertura', 'Fidelidade', 'Sync'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entities.map(e => {
                const tc = ENTITY_TYPE_CFG[e.type];
                const sc = SYNC_CFG[e.syncStatus];
                const critColor = { CRITICA: '#f87171', ALTA: '#fbbf24', MEDIA: '#60a5fa', BAIXA: '#4ade80' }[e.criticality];
                return (
                  <tr key={e.id}>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{e.name}</td>
                    <td style={styles.td}>{badge(tc.label, tc.color, tc.bg)}</td>
                    <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{e.dataSource}</td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{e.syncFrequency.replace(/_/g, ' ')}</td>
                    <td style={styles.td}>{badge(e.criticality, critColor!, critColor! + '20')}</td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: '#60a5fa' }}>{e.coverageScore}%</span></td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: '#34d399' }}>{e.fidelityScore}%</span></td>
                    <td style={styles.td}><span style={{ color: sc.color }}>{sc.dot} {sc.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── TAB 3: Simulador de Cenários ─────────────────────────────────────────

  const renderScenarios = () => {
    const scen = scenarios[activeScenario];
    return (
      <div>
        <div style={styles.row}>
          {kpiCard('Cenários Criados', scenarios.length, 'cen.', '#a78bfa', '🎮')}
          {kpiCard('Score Máx. (Otimista)', scenarios.reduce((m, s) => Math.max(m, s.overallImpactScore), 0), '/100', '#34d399', '🚀')}
          {kpiCard('Score Mín. (Crítico)', Math.abs(scenarios.reduce((m, s) => Math.min(m, s.overallImpactScore), 0)), 'risco', '#f87171', '🔴')}
          {kpiCard('Decisões Apoiadas', 8, 'dec.', '#fbbf24', '🧠')}
        </div>

        {/* Scenario Selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {scenarios.map((s, i) => {
            const cfg = SCENARIO_CFG[s.type];
            return (
              <button key={s.id} onClick={() => setActiveScenario(i)}
                style={{ padding: '10px 18px', borderRadius: 10, border: `2px solid ${i === activeScenario ? cfg.color : '#1e293b'}`, background: i === activeScenario ? cfg.bg : '#0f172a', color: i === activeScenario ? cfg.color : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .2s' }}>
                {cfg.icon} {s.name.length > 30 ? s.name.slice(0, 30) + '…' : s.name}
              </button>
            );
          })}
        </div>

        {scen && (() => {
          const cfg = SCENARIO_CFG[scen.type];
          const impactColor = scen.overallImpactScore >= 60 ? '#34d399' : scen.overallImpactScore >= 20 ? '#fbbf24' : scen.overallImpactScore >= 0 ? '#60a5fa' : '#f87171';
          return (
            <div>
              {/* Scenario Header */}
              <div style={{ ...styles.card, borderTop: `4px solid ${cfg.color}`, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      {badge(`${cfg.icon} ${cfg.label}`, cfg.color, cfg.bg)}
                      {badge(`Horizonte: ${scen.horizon.replace(/_/g, ' ')}`, '#64748b', '#1e293b')}
                      {badge(`Risco: ${scen.riskLevel}`, scen.riskLevel === 'CRITICO' ? '#dc2626' : scen.riskLevel === 'ALTO' ? '#d97706' : scen.riskLevel === 'MEDIO' ? '#ca8a04' : '#16a34a', '#1e293b')}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>{scen.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>{scen.description}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: impactColor }}>{scen.overallImpactScore > 0 ? '+' : ''}{scen.overallImpactScore}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Impact Score</div>
                  </div>
                </div>

                {/* Premises */}
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>📌 PREMISSAS DO CENÁRIO</div>
                  {scen.premises.map((p, i) => <div key={i} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 3 }}>• {p}</div>)}
                </div>
              </div>

              {/* Variables Table */}
              <div style={{ ...styles.card, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>📊 Variáveis Simuladas — Baseline vs Projetado</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Variável', 'Baseline', 'Simulado', 'Variação', '% Δ'].map(h => <th key={h} style={styles.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {scen.variables.map((v, i) => {
                      const dc = v.delta >= 0 ? '#34d399' : '#f87171';
                      return (
                        <tr key={i}>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{v.name}</td>
                          <td style={{ ...styles.td, color: '#94a3b8' }}>{typeof v.baseline === 'number' && v.baseline > 1e6 ? `R$ ${(v.baseline / 1e6).toFixed(1)}M` : v.baseline.toLocaleString('pt-BR')} <span style={{ color: '#64748b', fontSize: 10 }}>{v.unit}</span></td>
                          <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{typeof v.simulated === 'number' && v.simulated > 1e6 ? `R$ ${(v.simulated / 1e6).toFixed(1)}M` : v.simulated.toLocaleString('pt-BR')} <span style={{ color: '#64748b', fontSize: 10 }}>{v.unit}</span></td>
                          <td style={{ ...styles.td, fontWeight: 700, color: dc }}>{v.delta > 0 ? '+' : ''}{typeof v.delta === 'number' && Math.abs(v.delta) > 1e6 ? `R$ ${(v.delta / 1e6).toFixed(1)}M` : v.delta.toLocaleString('pt-BR')}</td>
                          <td style={{ ...styles.td, fontWeight: 800, color: dc }}>{v.deltaPercent > 0 ? '+' : ''}{v.deltaPercent.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Impact Areas + KPIs */}
              <div style={styles.grid2}>
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>🎯 Impacto por Área</div>
                  {scen.impactAreas.map((a, i) => {
                    const ic = { MUITO_POSITIVO: '#34d399', POSITIVO: '#86efac', NEUTRO: '#94a3b8', NEGATIVO: '#fca5a5', MUITO_NEGATIVO: '#f87171' }[a.impact];
                    return (
                      <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{a.area}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: ic }}>{a.impact.replace('_', ' ')}</span>
                        </div>
                        <div style={{ height: 4, background: '#0f172a', borderRadius: 2, marginBottom: 4 }}>
                          <div style={{ width: `${a.magnitude}%`, height: 4, background: ic, borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.description}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={styles.card}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📈 KPIs Projetados (IC 95%)</div>
                  {scen.projectedKPIs.map((k, i) => {
                    const up = k.trend === 'CRESCENTE';
                    const dn = k.trend === 'DECRESCENTE';
                    const tc = up ? '#34d399' : dn ? '#f87171' : '#fbbf24';
                    return (
                      <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{k.kpi}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: tc }}>{up ? '▲' : dn ? '▼' : '→'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>Atual: {k.currentValue.toLocaleString('pt-BR')} {k.unit}</span>
                          <span style={{ fontWeight: 700, color: tc }}>→ {k.projectedValue.toLocaleString('pt-BR')} {k.unit}</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
                          IC 95%: [{k.confidenceInterval.low.toLocaleString('pt-BR')}, {k.confidenceInterval.high.toLocaleString('pt-BR')}] {k.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // ── TAB 4: Modelagem Preditiva ───────────────────────────────────────────

  const renderPredictiveModels = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Modelos Ativos', models.filter(m => m.isActive).length, 'models', '#a78bfa', '🧠')}
        {kpiCard('Acurácia Média', (models.reduce((a, m) => a + m.accuracy, 0) / (models.length || 1)).toFixed(1), '%', '#34d399', '🎯')}
        {kpiCard('R² Médio', (models.reduce((a, m) => a + m.r2Score, 0) / (models.length || 1)).toFixed(3), '', '#60a5fa', '📊')}
        {kpiCard('Data Points Total', models.reduce((a, m) => a + m.dataPoints, 0).toLocaleString('pt-BR'), 'pts', '#fbbf24', '📡')}
      </div>

      <div style={styles.secTitle}>🔮 Modelos Preditivos Ativos — ISO 42001 Compliance</div>
      {models.map(model => (
        <div key={model.id} style={{ ...styles.card, marginBottom: 20, borderLeft: `4px solid ${model.isActive ? '#34d399' : '#64748b'}` }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {badge(MODEL_TYPE_CFG[model.type], '#7c3aed', '#f3e8ff')}
                {badge(model.isActive ? '✅ ATIVO' : '⏸️ INATIVO', model.isActive ? '#059669' : '#64748b', model.isActive ? '#d1fae5' : '#f3f4f6')}
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b', background: '#0f172a', padding: '2px 8px', borderRadius: 4 }}>{model.governanceTag}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{model.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Alvo: <strong style={{ color: '#60a5fa' }}>{model.target}</strong></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
              {[
                { l: 'Acurácia', v: `${model.accuracy}%`, c: '#34d399' },
                { l: 'R²', v: model.r2Score.toFixed(3), c: '#60a5fa' },
                { l: 'MAPE', v: `${model.mape}%`, c: '#fbbf24' },
              ].map(m => (
                <div key={m.l} style={{ background: '#1e293b', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{model.description}</div>

          {/* Features */}
          <div style={{ marginBottom: 12 }}>
            <div style={styles.label}>Variáveis de Entrada (Features)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {model.features.map((f, i) => <span key={i} style={{ fontSize: 10, background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 4 }}>{f}</span>)}
            </div>
          </div>

          {/* Predictions Chart */}
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>📈 Previsões com Intervalo de Confiança 95%</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr>
                    {['Período', 'Previsto', 'IC 95% Inferior', 'IC 95% Superior', 'Unidade'].map(h => (
                      <th key={h} style={{ ...styles.th, background: '#0f172a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {model.predictions.map((p, i) => (
                    <tr key={i}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{p.period}</td>
                      <td style={{ ...styles.td, fontWeight: 800, color: '#60a5fa' }}>{p.predicted.toLocaleString('pt-BR')}</td>
                      <td style={{ ...styles.td, color: '#94a3b8' }}>{p.low95.toLocaleString('pt-BR')}</td>
                      <td style={{ ...styles.td, color: '#94a3b8' }}>{p.high95.toLocaleString('pt-BR')}</td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premissas + Limitações */}
          <div style={styles.grid2}>
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>✅ Premissas</div>
              {model.premises.map((p, i) => <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>• {p}</div>)}
            </div>
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>⚠️ Limitações</div>
              {model.limitations.map((l, i) => <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>• {l}</div>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── TAB 5: Decision Intelligence ─────────────────────────────────────────

  const renderDecisions = () => {
    const dec = decisions[activeDecision];
    return (
      <div>
        <div style={styles.row}>
          {kpiCard('Decisões Simuladas', decisions.length, 'dec.', '#a78bfa', '🧠')}
          {kpiCard('Confiança Média IA', (decisions.reduce((a, d) => a + d.simulationConfidence, 0) / (decisions.length || 1)).toFixed(1), '%', '#34d399', '🎯')}
          {kpiCard('Aprovadas/Implementadas', decisions.filter(d => ['APROVADO', 'IMPLEMENTADO'].includes(d.status)).length, 'dec.', '#60a5fa', '✅')}
          {kpiCard('Opções Avaliadas', decisions.reduce((a, d) => a + d.decisionOptions.length, 0), 'opts', '#fbbf24', '⚖️')}
        </div>

        {/* Decision Selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {decisions.map((d, i) => (
            <button key={d.id} onClick={() => setActiveDecision(i)}
              style={{ padding: '10px 18px', borderRadius: 10, border: `2px solid ${i === activeDecision ? '#a78bfa' : '#1e293b'}`, background: i === activeDecision ? '#2e1065' : '#0f172a', color: i === activeDecision ? '#a78bfa' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .2s' }}>
              🧠 {d.title.length > 35 ? d.title.slice(0, 35) + '…' : d.title}
            </button>
          ))}
        </div>

        {dec && (
          <div>
            <div style={{ ...styles.card, borderTop: '3px solid #a78bfa', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    {badge(dec.category, '#7c3aed', '#f3e8ff')}
                    {badge(dec.status, dec.status === 'SIMULADO' ? '#2563eb' : dec.status === 'APROVADO' ? '#059669' : dec.status === 'IMPLEMENTADO' ? '#34d399' : '#64748b', '#1e293b')}
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Confiança IA: <strong style={{ color: '#a78bfa' }}>{dec.simulationConfidence}%</strong></span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>{dec.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>{dec.description}</div>
                </div>
              </div>

              {/* AI Rationale */}
              <div style={{ background: '#1e293b', border: '1px solid #a78bfa30', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>🤖 Fundamentação da IA — Opção Recomendada: {dec.recommendedOption}</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{dec.aiRationale}</div>
              </div>
            </div>

            {/* Decision Options */}
            <div style={styles.secTitle}>⚖️ Opções de Decisão — Análise Comparativa</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {dec.decisionOptions.map(opt => {
                const isRec = opt.id === dec.recommendedOption;
                return (
                  <div key={opt.id} style={{ ...styles.card, borderTop: `4px solid ${isRec ? '#a78bfa' : '#334155'}`, position: 'relative' }}>
                    {isRec && <div style={{ position: 'absolute', top: -1, right: 14, background: '#7c3aed', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: '0 0 6px 6px', letterSpacing: '0.05em' }}>★ RECOMENDADA IA</div>}
                    <div style={{ fontSize: 13, fontWeight: 700, color: isRec ? '#a78bfa' : '#f1f5f9', marginBottom: 4 }}>{opt.id}: {opt.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{opt.description}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div><div style={styles.label}>Custo</div><div style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>R$ {(opt.cost / 1e6).toFixed(2)}M</div></div>
                      <div><div style={styles.label}>Prazo</div><div style={{ fontSize: 12, color: '#e2e8f0' }}>{opt.timeToImplement}</div></div>
                    </div>

                    {/* Score Bars */}
                    {[
                      { l: 'Score Impacto', v: opt.impactScore, c: '#60a5fa' },
                      { l: 'Viabilidade', v: opt.feasibilityScore, c: '#34d399' },
                      { l: 'Score Recomendação', v: opt.recommendationScore, c: '#a78bfa' },
                    ].map(s => (
                      <div key={s.l} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>
                          <span>{s.l}</span><span style={{ fontWeight: 700, color: s.c }}>{s.v}/100</span>
                        </div>
                        <div style={{ height: 5, background: '#1e293b', borderRadius: 3 }}>
                          <div style={{ width: `${s.v}%`, height: 5, background: s.c, borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}

                    <div style={styles.grid2}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>✅ Benefícios</div>
                        {opt.projectedBenefits.map((b, i) => <div key={i} style={{ fontSize: 10, color: '#86efac', marginBottom: 2 }}>• {b}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>⚠️ Riscos</div>
                        {opt.projectedRisks.map((r, i) => <div key={i} style={{ fontSize: 10, color: '#fca5a5', marginBottom: 2 }}>• {r}</div>)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── TAB 6: Análise Sistêmica & Grafos ────────────────────────────────────

  const renderSystemicAnalysis = () => {
    const sortedByLeverage = [...nodes].sort((a, b) => b.leverage - a.leverage);
    return (
      <div>
        <div style={styles.row}>
          {kpiCard('Nós Mapeados', nodes.length, 'nós', '#a78bfa', '🕸️')}
          {kpiCard('Maior Alavanca', sortedByLeverage[0]?.label.split(' ')[0] ?? '—', '', '#34d399', '⚡')}
          {kpiCard('Influência Máx.', Math.max(...nodes.map(n => n.influence)), '/100', '#60a5fa', '📡')}
          {kpiCard('Prop. Risco Máx.', Math.max(...nodes.map(n => n.riskPropagation)), '/100', '#f87171', '⚠️')}
        </div>

        {/* Leverage Matrix */}
        <div style={styles.secTitle}>⚡ Pontos de Alavancagem Sistêmica</div>
        <div style={{ ...styles.card, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
            Nós com maior leverage (influência/dependência) representam os pontos estratégicos para intervenção de máximo impacto.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {sortedByLeverage.map(node => {
              const leverageColor = node.leverage >= 2 ? '#34d399' : node.leverage >= 1.3 ? '#60a5fa' : node.leverage >= 1 ? '#fbbf24' : '#f87171';
              const typeIcon = { AREA: '🏢', PROCESSO: '⚙️', INDICADOR: '📊', RISCO: '⚠️', RECURSO: '💰' }[node.type];
              return (
                <div key={node.id} style={{ background: '#1e293b', borderRadius: 10, padding: 14, borderLeft: `4px solid ${leverageColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{typeIcon} {node.label}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: leverageColor }}>{node.leverage.toFixed(2)}×</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>leverage</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {[
                      { l: 'Influência', v: node.influence, c: '#60a5fa' },
                      { l: 'Dependência', v: node.dependency, c: '#f87171' },
                      { l: 'Prop. Risco', v: node.riskPropagation, c: '#fbbf24' },
                    ].map(m => (
                      <div key={m.l} style={{ textAlign: 'center', background: '#0f172a', borderRadius: 6, padding: '6px 4px' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: m.c }}>{m.v}</div>
                        <div style={{ fontSize: 9, color: '#64748b' }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  {node.currentValue !== undefined && (
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Estado atual: <strong style={{ color: '#e2e8f0' }}>{node.currentValue.toLocaleString('pt-BR')} {node.unit}</strong>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>CONEXÕES ({node.connections.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {node.connections.map((c, i) => {
                        const cn = nodes.find(n => n.id === c.targetId);
                        const cc = c.type === 'POSITIVA' ? '#34d399' : c.type === 'NEGATIVA' ? '#f87171' : '#94a3b8';
                        return <span key={i} style={{ fontSize: 9, background: '#0f172a', color: cc, padding: '1px 6px', borderRadius: 4 }}>{c.type === 'POSITIVA' ? '+' : c.type === 'NEGATIVA' ? '−' : '~'} {cn?.label ?? c.targetId} ({c.weight})</span>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Propagation Risk Map */}
        <div style={styles.secTitle}>🔴 Mapa de Propagação de Riscos</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nó', 'Tipo', 'Influência', 'Dependência', 'Leverage', 'Prop. Risco', 'Estado Atual'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...nodes].sort((a, b) => b.riskPropagation - a.riskPropagation).map(node => {
                const rp = node.riskPropagation;
                const rpc = rp >= 90 ? '#f87171' : rp >= 75 ? '#fbbf24' : rp >= 60 ? '#60a5fa' : '#34d399';
                const lc = node.leverage >= 2 ? '#34d399' : node.leverage >= 1.3 ? '#60a5fa' : node.leverage >= 1 ? '#fbbf24' : '#f87171';
                return (
                  <tr key={node.id}>
                    <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{node.label}</td>
                    <td style={styles.td}>{badge(node.type, '#7c3aed', '#f3e8ff')}</td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: '#60a5fa' }}>{node.influence}</span>/100</td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: '#f87171' }}>{node.dependency}</span>/100</td>
                    <td style={styles.td}><span style={{ fontWeight: 800, color: lc }}>{node.leverage.toFixed(2)}×</span></td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 5, background: '#1e293b', borderRadius: 3 }}>
                          <div style={{ width: `${rp}%`, height: 5, background: rpc, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: rpc }}>{rp}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{node.currentValue !== undefined ? <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{node.currentValue.toLocaleString('pt-BR')} {node.unit}</span> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutivePanels = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel da Presidência — Visão Estratégica 360°</div>
      <div style={{ ...styles.card, marginBottom: 24, borderTop: '3px solid #a78bfa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          {[
            { l: 'Beneficiários Ativos', v: '124.000', c: '#34d399', i: '💚' },
            { l: 'Atendimentos/mês', v: '8.420', c: '#60a5fa', i: '🏥' },
            { l: 'Orçamento Anual', v: 'R$ 48,7M', c: '#fbbf24', i: '💰' },
            { l: 'SROI', v: 'R$ 4,85 : R$ 1', c: '#fb923c', i: '📈' },
            { l: 'Score Governança', v: '97,8/100', c: '#a78bfa', i: '🏛️' },
            { l: 'Uptime Plataforma', v: '99,97%', c: '#38bdf8', i: '🖥️' },
          ].map(k => (
            <div key={k.l} style={{ background: '#1e293b', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>🤖 Recomendações Estratégicas da IA — Presidência</div>
          {[
            { rec: 'Expansão via telemedicina apresenta ROI 310% em 18 meses com IC90% positivo. Janela de captação favorável Q3/2026.', p: 'ALTA', c: '#f87171' },
            { rec: 'Score SROI projetado de 5.04 até Dez/2026 confirma trajetória de crescimento. Manter investimento em programas de saúde.', p: 'MEDIA', c: '#fbbf24' },
            { rec: 'Concentração financeira em poucos convênios representa risco residual 15 pts. Diversificação prioritária em 2027.', p: 'ALTA', c: '#f87171' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, background: '#0f172a', borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: r.c, background: r.c + '20', padding: '2px 8px', borderRadius: 10, height: 'fit-content', whiteSpace: 'nowrap' }}>{r.p}</span>
              <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{r.rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.secTitle}>📋 Painel do Conselho Deliberativo — Governança & Riscos</div>
      <div style={{ ...styles.card, marginBottom: 24, borderTop: '3px solid #60a5fa' }}>
        <div style={styles.grid2}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>🏛️ Status de Governança</div>
            {[
              { l: 'Índice de Compliance', v: '98,1%', c: '#34d399', ok: true },
              { l: 'Score EIGCAP', v: '97,8/100', c: '#34d399', ok: true },
              { l: 'Riscos Críticos Ativos', v: '1 (LGPD drift)', c: '#fbbf24', ok: false },
              { l: 'Auditorias em Andamento', v: '1 (ISO 27001)', c: '#60a5fa', ok: true },
              { l: 'Políticas Vigentes', v: '5 / 5 ativas', c: '#34d399', ok: true },
            ].map((k, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{k.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: k.c }}>{k.ok ? '✅' : '⚠️'} {k.v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>⚠️ Top Riscos para o Conselho</div>
            {[
              { t: 'Dependência Financeira (RSK-FIN-001)', s: 15, c: '#f87171', trend: '📈' },
              { t: 'Concentração de Poder Decisório (RSK-GOV-001)', s: 4, c: '#fbbf24', trend: '📉' },
              { t: 'Não Conformidade IA ISO 42001 (NC-AI-001)', s: 'Em tratamento', c: '#fbbf24', trend: '🔄' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{r.t}</span>
                  <span style={{ fontSize: 14 }}>{r.trend}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.c }}>Risco Residual: {r.s} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.secTitle}>⚙️ Painel Operacional — Diretoria Executiva</div>
      <div style={{ ...styles.card, borderTop: '3px solid #34d399' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { l: 'Processos Automatizados', v: '68%', c: '#34d399', i: '🤖' },
            { l: 'SLA Atendimento', v: '91%', c: '#60a5fa', i: '⏱️' },
            { l: 'Gargalos Críticos', v: '2', c: '#fbbf24', i: '🔴' },
            { l: 'Modelos IA Ativos', v: '12', c: '#a78bfa', i: '🧠' },
            { l: 'Uptime Cloud', v: '99,97%', c: '#38bdf8', i: '🖥️' },
            { l: 'Custo/Atendimento', v: 'R$ 245', c: '#fb923c', i: '💰' },
          ].map(k => (
            <div key={k.l} style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
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
      {/* Certificate Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #0f172a 40%, #1a0a2e 100%)', border: '2px solid #a78bfa40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 220, opacity: 0.03 }}>🌐</div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE GÊMEO DIGITAL ENTERPRISE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ECDTISP — Enterprise Cognitive Digital Twin<br />& Institutional Simulation Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor possui um Gêmeo Digital Corporativo plenamente operacional,
          representando toda a organização digitalmente e permitindo simulações estratégicas, modelagem preditiva
          e apoio à decisão baseado em evidências com IA explicável e auditável.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
          {kpis && [
            { l: 'Maturidade Twin', v: `${kpis.twinMaturityScore}/100`, c: '#a78bfa' },
            { l: 'Cobertura', v: `${kpis.twinCoveragePercent}%`, c: '#60a5fa' },
            { l: 'Fidelidade', v: `${kpis.twinFidelityScore}/100`, c: '#34d399' },
            { l: 'Acurácia Modelos', v: `${kpis.avgModelAccuracy}%`, c: '#fbbf24' },
          ].map(m => (
            <div key={m.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.c }}>{m.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{m.l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
          {certEmitted ? '✅ Certificado ECDTISP Emitido — Prompt 066' : '🌐 Emitir Certificado ECDTISP Final'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      {/* Maturity + Roadmap */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Parecer Executivo — CEA/CAIO</div>
          {[
            { l: 'Digital Twin Corporativo', v: 95, c: '#a78bfa' },
            { l: 'Modelagem Organizacional', v: 93, c: '#60a5fa' },
            { l: 'Simulação Estratégica', v: 92, c: '#34d399' },
            { l: 'Modelagem Preditiva', v: 94, c: '#fbbf24' },
            { l: 'Decision Intelligence', v: 91, c: '#fb923c' },
            { l: 'Integração Sistêmica', v: 96, c: '#38bdf8' },
            { l: 'Precisão das Simulações', v: 92, c: '#4ade80' },
            { l: 'Governança dos Modelos', v: 91, c: '#c084fc' },
            { l: 'Resiliência Organizacional', v: 94, c: '#fed7aa' },
            { l: 'Maturidade Global Twin', v: 95, c: '#a78bfa' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
          <div style={{ marginTop: 16, padding: 14, background: '#1e293b', borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#f1f5f9' }}>Parecer CEA/CAIO:</strong> O ECDTISP demonstra maturidade digital de <strong style={{ color: '#a78bfa' }}>nível 4 (ISO 42001/NIST AI RMF)</strong> com cobertura organizacional de 96.4%, fidelidade média de 94.9% e capacidade comprovada de apoio a decisões estratégicas com confiança média de IA de 89.3%. O Digital Twin é confiável como ferramenta oficial de planejamento institucional.
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🗺️ Roadmap ECDTISP — 5 Anos</div>
          {[
            { ano: '2026', title: 'Consolidação & Cobertura', color: '#a78bfa', items: ['Cobertura Twin >99%', 'Sync < 60ms para entidades críticas', 'Retrain automático mensal dos modelos'] },
            { ano: '2027', title: 'Simulação em Tempo Quase Real', color: '#60a5fa', items: ['Cenários simulados em < 5 segundos', 'Digital Twin multimodal (texto + dados + imagem)', 'Agentes especializados de simulação'] },
            { ano: '2028', title: 'Aprendizado Adaptativo', color: '#34d399', items: ['Modelos auto-ajustáveis por feedback', 'Integração com fontes externas autorizadas (IBGE, OMS)', 'Otimização automática supervisionada de recursos'] },
            { ano: '2029', title: 'Modelos Probabilísticos Avançados', color: '#fbbf24', items: ['Monte Carlo em tempo real', 'Gemini multimodal para análise de cenários', 'Twin conectado a sensores IoT (instalações físicas)'] },
            { ano: '2030', title: 'Organização Autônoma Inteligente', color: '#fb923c', items: ['ISM: referência em Digital Twin no terceiro setor', 'Modelo ECDTISP publicado como framework open-source', 'Decisões operacionais automatizadas com supervisão humana'] },
          ].map(p => (
            <div key={p.ano} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 10, background: p.color + '20', border: `2px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: p.color }}>{p.ano}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{p.title}</div>
                {p.items.map((item, i) => <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>• {item}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Declaration */}
      <div style={{ ...styles.card, marginTop: 24, borderTop: '3px solid #a78bfa', textAlign: 'center' }}>
        <div style={{ fontSize: 22 }}>🌐🧠🎮📈⚡</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginTop: 12, marginBottom: 8 }}>
          Declaração de Conclusão — ECDTISP (Prompt 066)
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, maxWidth: 820, margin: '0 auto' }}>
          A Plataforma Instituto Ser Melhor possui, a partir deste momento, um <strong style={{ color: '#a78bfa' }}>Enterprise Cognitive Digital Twin & Institutional Simulation Platform (ECDTISP)</strong> plenamente operacional.
          A organização é digitalmente representada em 96.4% de sua estrutura com fidelidade de 94.9%, permitindo simulações estratégicas,
          modelagem preditiva com IC95% e apoio a decisões de alto impacto com IA explicável — fortalecendo a resiliência,
          a capacidade adaptativa e a excelência institucional do Instituto Ser Melhor.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ECDTISP v1.0', 'Prompt 066', 'TOGAF ✅', 'NIST AI RMF ✅', 'ISO 42001 ✅', 'System Dynamics ✅', 'Monte Carlo ✅', 'Decision Intelligence ✅'].map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', background: '#7c3aed20', padding: '4px 12px', borderRadius: 20, border: '1px solid #7c3aed40' }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
          Plataforma ISM v2.0 — Módulo 66/66 — Organização Autônoma Orientada por Inteligência
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEA/CAIO Board & Twin Hub': renderDashboard,
    'Mapa do Gêmeo Digital':           renderTwinMap,
    'Simulador de Cenários':           renderScenarios,
    'Modelagem Preditiva':             renderPredictiveModels,
    'Decision Intelligence':           renderDecisions,
    'Análise Sistêmica & Grafos':      renderSystemicAnalysis,
    'Painéis Executivos':              renderExecutivePanels,
    'CERTIFICAÇÃO ECDTISP FINAL':      renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🌐 ECDTISP — Enterprise Cognitive Digital Twin & Institutional Simulation Platform</h1>
        <p style={styles.sub}>Prompt 066 · Instituto Ser Melhor v2.0 · TOGAF · NIST AI RMF · ISO 42001 · System Dynamics · Decision Intelligence</p>
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

export default ECDTISPPage;
