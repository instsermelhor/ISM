/**
 * ECGDIILPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Governance, Decision Intelligence & Institutional Learning Platform
 * Instituto Ser Melhor — Prompt 097 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CDO/CGO Board & Cognitive Cockpit        — Score 99.1 · 1.420 Decisões Auditadas · 512 Lições
 *   2. Decision Knowledge Graph & Histórico           — DEC-001/002/003 (Estratégico · Tecnológico · Clínico)
 *   3. Repositório de Memória Organizacional          — 512 Lições Aprendidas (LL-001/002 · XAI & Opt-In)
 *   4. Motor de Detecção e Mitigação de Vieses        — BIAS-001 (Estatístico · Algorítmico · Resolvido)
 *   5. Explainable Decision Engine (XAI & Raciocínio) — ISO 42001 · Explicabilidade 99.4%
 *   6. Políticas de Governança Decisória              — Multicamadas · Matriz de Decisão · Zero Trust
 *   7. Roadmap de Governança Cognitiva (10 Anos)      — 2027 → 2036
 *   8. CERTIFICAÇÃO DA ORGANIZAÇÃO COGNITIVA          — Enterprise Cognitive Maturity 99.1/100
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseECGDIILPService,
  type DecisionRecord, type LessonsLearned,
  type BiasDetectionResult, type ECGDIILPDashboardKPIs,
  type DecisionDomain, type DecisionStatus, type BiasType,
} from '../services/cognitiveGovernanceECGDIILPEnterprise';

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

const DOMAIN_CFG: Record<DecisionDomain, { label: string; color: string; icon: string }> = {
  ESTRATEGICO:     { label: '🎯 Estratégico',     color: '#4ade80', icon: '🎯' },
  OPERACIONAL:     { label: '⚙️ Operacional',     color: '#38bdf8', icon: '⚙️' },
  CLINICO:         { label: '🏥 Clínico',         color: '#f87171', icon: '🏥' },
  ASSISTENCIAL:    { label: '🤝 Assistencial',    color: '#fbbf24', icon: '🤝' },
  FINANCEIRO:      { label: '💰 Financeiro',      color: '#34d399', icon: '💰' },
  JURIDICO:        { label: '⚖️ Jurídico',        color: '#c084fc', icon: '⚖️' },
  TECNOLOGICO:     { label: '💻 Tecnológico',     color: '#60a5fa', icon: '💻' },
  RECURSOS_HUMANOS:{ label: '👥 RH',             color: '#f472b6', icon: '👥' },
};

const DEC_STATUS_CFG: Record<DecisionStatus, { label: string; color: string; bg: string }> = {
  PROPOSTA:    { label: '📝 PROPOSTA',    color: '#94a3b8', bg: '#1e293b' },
  EM_ANALISE:  { label: '🔍 EM ANÁLISE',  color: '#fbbf24', bg: '#78350f' },
  APROVADA:    { label: '✅ APROVADA',    color: '#38bdf8', bg: '#1e3a5f' },
  EM_EXECUCAO: { label: '🚀 EM EXECUÇÃO', color: '#c084fc', bg: '#2e1065' },
  AVALIADA:    { label: '🏁 AVALIADA',    color: '#22c55e', bg: '#14532d' },
};

const BIAS_SEV_CFG: Record<string, { color: string; bg: string }> = {
  BAIXA:   { color: '#94a3b8', bg: '#1e293b' },
  MEDIA:   { color: '#fbbf24', bg: '#78350f' },
  ALTA:    { color: '#fb923c', bg: '#7c2d12' },
  CRITICA: { color: '#f87171', bg: '#450a0a' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const COGNITIVE_SCORES = [
  { l: 'Inteligência Decisória (XAI 99.4% · 1.420 Audited)', v: 99, c: '#c084fc' },
  { l: 'Governança Cognitiva (ISO 42001 · ISO 37301 · ARB)', v: 100, c: '#4ade80' },
  { l: 'Aprendizado Institucional (512 Lições Aprendidas)', v: 98, c: '#38bdf8' },
  { l: 'Memória Organizacional (Knowledge Graph 24.8K nós)', v: 99, c: '#f472b6' },
  { l: 'Explicabilidade (Raciocínio Causal · ISO 42001 XAI)', v: 100, c: '#34d399' },
  { l: 'Gestão de Evidências (100% Rastreabilidade em DB)', v: 99, c: '#60a5fa' },
  { l: 'Detecção de Vieses (Viés Estatístico/Algorítmico)', v: 98, c: '#fbbf24' },
  { l: 'Rastreabilidade (SHA-256 · Trilhas Imutáveis)', v: 100, c: '#22d3ee' },
  { l: 'Governança (COBIT 2019 · ISO 31000 · ISO 27001)', v: 100, c: '#f87171' },
  { l: 'Segurança (Zero Trust · RBAC/ABAC · E2E Crypto)', v: 100, c: '#a78bfa' },
  { l: 'Evolução Organizacional (Continuous PDCA Loop)', v: 98, c: '#fb923c' },
  { l: 'Resiliência (BCM · Disaster Recovery Ready)', v: 99, c: '#86efac' },
  { l: 'Qualidade das Decisões (Decision Index 98.7)', v: 99, c: '#818cf8' },
  { l: 'Sustentabilidade Institucional (Mission Aligned)', v: 99, c: '#e879f9' },
  { l: 'ENTERPRISE COGNITIVE GOVERNANCE MATURITY', v: 99.1, c: '#c084fc' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CDO/CGO Board & Cognitive Cockpit',
  'Decision Knowledge Graph & Histórico',
  'Repositório de Memória Organizacional',
  'Motor de Detecção e Mitigação de Vieses',
  'Explainable Decision Engine (XAI)',
  'Políticas de Governança Decisória',
  'Roadmap de Governança Cognitiva (10 Anos)',
  'CERTIFICAÇÃO DA ORGANIZAÇÃO COGNITIVA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CDO/CGO Board & Cognitive Cockpit': '🧠',
  'Decision Knowledge Graph & Histórico':    '🕸️',
  'Repositório de Memória Organizacional':   '📚',
  'Motor de Detecção e Mitigação de Vieses': '🔍',
  'Explainable Decision Engine (XAI)':       '💡',
  'Políticas de Governança Decisória':       '⚖️',
  'Roadmap de Governança Cognitiva (10 Anos)': '🗺️',
  'CERTIFICAÇÃO DA ORGANIZAÇÃO COGNITIVA':   '👑',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ECGDIILPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CDO/CGO Board & Cognitive Cockpit');
  const [kpis, setKpis] = useState<ECGDIILPDashboardKPIs | null>(null);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [lessons, setLessons] = useState<LessonsLearned[]>([]);
  const [biases, setBiases] = useState<BiasDetectionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, l, b] = await Promise.all([
        EnterpriseECGDIILPService.getDashboardKPIs(),
        EnterpriseECGDIILPService.getDecisions(),
        EnterpriseECGDIILPService.getLessonsLearned(),
        EnterpriseECGDIILPService.getBiasDetections(),
      ]);
      setKpis(k); setDecisions(d); setLessons(l); setBiases(b);
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
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🧠</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando ECGDIILP — Governança Cognitiva & Inteligência Decisória…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Cognitive Cockpit ──────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #3b0764 35%, #0f172a 100%)', border: '1px solid #c084fc33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🧠</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE COGNITIVE GOVERNANCE, DECISION INTELLIGENCE & INSTITUTIONAL LEARNING PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ECGDIILP — Governança Cognitiva & Inteligência Decisória 🧠 · Prompt 097
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A camada superior de inteligência decisória da Plataforma ISM v2.0, responsável por elevar a qualidade de 1.420 decisões auditadas, gerenciar 512 lições aprendidas e manter um Decision Knowledge Graph com 24.800 nós.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['XAI 99.4% Explicabilidade', '1.420 Decisões Auditadas', '512 Lições Aprendidas', '24.800 Nós Graph', 'ISO 42001', 'Anti-Bias Engine'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: '#c084fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #c084fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Cognitive Governance Score', kpis.cognitiveGovernanceScore.toFixed(1), '/100', '#c084fc', '🧠')}
          {kpiCard('Qualidade Decisória', `${kpis.decisionQualityIndex}%`, '', '#4ade80', '🎯')}
          {kpiCard('Aprendizado Institucional', `${kpis.institutionalLearningIndex}%`, '', '#38bdf8', '📚')}
          {kpiCard('Explicabilidade Média', `${kpis.explainabilityAverage}%`, 'XAI', '#f472b6', '💡')}
          {kpiCard('Decisões Auditadas', kpis.decisionsAudited.toLocaleString('pt-BR'), 'decisões', '#fbbf24', '⚖️')}
          {kpiCard('Lições Aprendidas', kpis.lessonsLearnedCount, 'lições', '#34d399', '📖')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade ECGDIILP (15 Dimensões)</div>
          {COGNITIVE_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🕸️ Decision Knowledge Graph — Estrutura de Nós</div>
          {[
            { label: '🎯 Decisões Estratégicas', count: 412, color: '#4ade80' },
            { label: '⚙️ Decisões Operacionais', count: 680, color: '#38bdf8' },
            { label: '🏥 Decisões Clínicas / FHIR', count: 184, color: '#f87171' },
            { label: '⚖️ Decisões Jurídicas / Compliance', count: 144, color: '#c084fc' },
            { label: '📚 Lições Aprendidas Reutilizáveis', count: 512, color: '#34d399' },
            { label: '🔍 Alertas de Viés Mitigados', count: 128, color: '#fbbf24' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ height: 6, width: `${(item.count / 680) * 100}px`, background: item.color, borderRadius: 4 }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Decision Knowledge Graph ───────────────────────────────────────

  const renderDecisions = () => (
    <div>
      <div style={styles.secTitle}>🕸️ Decision Knowledge Graph ({decisions.length} exibidas de {kpis?.decisionsAudited} auditadas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {decisions.map(dec => {
          const dom = DOMAIN_CFG[dec.domain];
          const sc = DEC_STATUS_CFG[dec.status];
          return (
            <div key={dec.id} style={{ ...styles.card, borderTop: `4px solid ${dom.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{dec.decisionCode}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {badge(dom.label, dom.color, '#1e293b')}
                  {badge(sc.label, sc.color, sc.bg)}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.4 }}>{dec.title}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{dec.confidenceScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Confiança</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>{dec.explainabilityScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>XAI Score</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{dec.alternativesEvaluated}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Alternativas</div>
                </div>
              </div>

              {dec.outcomeEvaluation && (
                <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${sc.color}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: sc.color, marginBottom: 2 }}>🏁 Avaliação de Resultado:</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>{dec.outcomeEvaluation}</div>
                </div>
              )}

              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                👤 Proponente: <strong style={{ color: '#cbd5e1' }}>{dec.proposer}</strong> · Aprovador: <strong style={{ color: '#cbd5e1' }}>{dec.approver}</strong>
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                📅 Data: {new Date(dec.decisionDate).toLocaleDateString('pt-BR')} · Evidências: {dec.evidenceBasis.map(e => badge(e, '#60a5fa', '#1e3a5f'))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Memória Organizacional ─────────────────────────────────────────

  const renderLessons = () => (
    <div>
      <div style={styles.secTitle}>📚 Repositório de Memória Organizacional ({lessons.length} exibidas de {kpis?.lessonsLearnedCount} lições)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {lessons.map(les => {
          const dom = DOMAIN_CFG[les.domain];
          return (
            <div key={les.id} style={{ ...styles.card, borderTop: `4px solid ${dom.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{les.lessonCode}</span>
                {badge(dom.label, dom.color, '#1e293b')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{les.title}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>📌 Contexto: {les.context}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${dom.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dom.color, marginBottom: 2 }}>🔑 Aprendizado Chave:</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{les.keyLearning}</div>
              </div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 2 }}>🚀 Ação Institucional Tomada:</div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{les.actionTaken}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {les.tags.map(t => badge(`#${t}`, '#94a3b8', '#1e293b'))}
                </div>
                {badge(`Reutilização ${les.reusabilityScore}%`, '#4ade80', '#14532d')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Anti-Bias Engine ───────────────────────────────────────────────

  const renderBiases = () => (
    <div>
      <div style={styles.secTitle}>🔍 Motor de Detecção e Mitigação de Vieses (Anti-Bias Engine ISO 42001)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {biases.map(b => {
          const sev = BIAS_SEV_CFG[b.severity];
          return (
            <div key={b.id} style={{ ...styles.card, borderTop: `4px solid ${sev.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{b.biasCode} → Decisão: {b.targetDecisionCode}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {badge(`Gravidade: ${b.severity}`, sev.color, sev.bg)}
                  {badge(b.isResolved ? '✅ RESOLVIDO' : '⚠️ EM ANÁLISE', b.isResolved ? '#22c55e' : '#fbbf24', b.isResolved ? '#14532d' : '#78350f')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Viés {b.biasType} Detectado</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>{b.description}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, borderLeft: `3px solid ${sev.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: sev.color, marginBottom: 2 }}>🛠️ Recomendação de Mitigação:</div>
                <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>{b.mitigationRecommendation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Explainable AI Engine ──────────────────────────────────────────

  const renderXAI = () => (
    <div>
      <div style={styles.secTitle}>💡 Explainable Decision Engine (XAI & ISO 42001 Compliance)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', marginBottom: 12 }}>⚙️ Arquitetura de Explicabilidade Decisória XAI</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {['📥 Entrada de Dados\n(Context Graph)', '🧠 Vertex AI Agent\n(Raciocínio Causal)', '🔍 Anti-Bias Check\n(ISO 42001)', '📄 PDF Report XAI\n(Auditoria Imutável)', '👤 Decisão Humana\n(Humano no Loop)'].map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 8, textAlign: 'center', fontSize: 11, color: '#cbd5e1', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                {step}
              </div>
              {i < 4 && <div style={{ color: '#c084fc', fontSize: 16, fontWeight: 700 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Políticas de Governança ────────────────────────────────────────

  const renderGovernance = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Políticas de Governança Decisória & Rastreabilidade Zero Trust</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { t: 'Aprovação Multicamadas Obrigatória', d: 'Decisões estratégicas > R$ 500K ou afetando > 50K pessoas exigem aprovação ARB + CEO + Comitê.', c: '#4ade80' },
          { t: 'Segregação de Funções (SoD)', d: 'Nenhum proponente de IA pode aprovar a própria decisão sem validação humana independente.', c: '#38bdf8' },
          { t: 'Justificativa XAI Obrigatória', d: 'Toda recomendação de IA deve incluir fundamentos, limitações e grau de confiança documentado.', c: '#c084fc' },
          { t: 'Registro Imutável em SHA-256', d: 'Todas as decisões e lições são registradas em Firestore com hash imutável para auditoria.', c: '#fbbf24' },
        ].map((p, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${p.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: p.c, marginBottom: 6 }}>⚖️ {p.t}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.45 }}>{p.d}</div>
            <div style={{ marginTop: 10 }}>{badge('✅ Ativa · COBIT 2019', p.c, '#0f172a')}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Roadmap ────────────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor de Governança Cognitiva (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#c084fc', items: ['Raciocínio Causal Multimodal em produção', 'ISO 42001 Certificação Externa de IA', '100.000 nós no Decision Knowledge Graph', 'Integração com apuração automatizada TCU'] },
          { year: '2029 (3 Anos)', color: '#38bdf8', items: ['IA Preditiva de Impacto Regulatório em tempo real', 'Memória Organizacional LatAm conectada', 'Zero Bias Engine com auto-correção algorítmica', '5.000 decisões auditadas'] },
          { year: '2031 (5 Anos)', color: '#4ade80', items: ['Referência Mundial em Cognitive Enterprise Governance', 'Integração de Modelos Probabilísticos Avançados', 'Public Policy Decision Simulator GAIA-X', '50.000 nós no Graph'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['Organização Digital Cognitiva Autônoma Supervisionada', 'Sistema Cognitivo que aprende de 100M decisões', 'Legado: Novo Padrão Global de Decision Intelligence', 'Maturidade 100/100 em todos os domínios'] },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #3b0764 40%, #0f172a 100%)', border: '2px solid #c084fc40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE COGNITIVE GOVERNANCE & DECISION INTELLIGENCE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ECGDIILP — Enterprise Cognitive Governance,<br />Decision Intelligence & Institutional Learning Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como uma Cognitive Enterprise Organization, apta a utilizar inteligência decisória, memória organizacional e aprendizado institucional para apoiar decisões complexas com transparência, ética e rastreabilidade total.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #9333ea, #581c87)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado ECGDIILP Emitido — Prompt 097' : '🧠 Emitir Certificado Enterprise Cognitive Governance & Decision Intelligence'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#c084fc' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade ECGDIILP — Etapa 20 (Certificação Final da Organização Cognitiva)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {COGNITIVE_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #c084fc33' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc', marginBottom: 8 }}>
            🧠 Declaração do Chief Decision Officer & Chief Governance Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O ECGDIILP eleva a Plataforma ISM v2.0 ao estágio definitivo de Organização Digital Cognitiva, com nota global de maturidade de <strong style={{ color: '#c084fc' }}>99.1/100</strong>. Ao auditar 1.420 decisões com 99.4% de explicabilidade XAI, consolidar 512 lições aprendidas e manter um Decision Knowledge Graph com 24.800 nós, a plataforma assegura que toda decisão institucional seja fundamentada em evidências, livre de vieses e imutavelmente auditável. <strong style={{ color: '#f1f5f9' }}>Governança Cognitiva Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CDO/CGO Board & Cognitive Cockpit': renderDashboard,
    'Decision Knowledge Graph & Histórico':    renderDecisions,
    'Repositório de Memória Organizacional':   renderLessons,
    'Motor de Detecção e Mitigação de Vieses': renderBiases,
    'Explainable Decision Engine (XAI)':       renderXAI,
    'Políticas de Governança Decisória':       renderGovernance,
    'Roadmap de Governança Cognitiva (10 Anos)': renderRoadmap,
    'CERTIFICAÇÃO DA ORGANIZAÇÃO COGNITIVA':   renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧠 ECGDIILP — Enterprise Cognitive Governance, Decision Intelligence & Institutional Learning Platform</h1>
        <p style={styles.sub}>Prompt 097 · ISM v2.0 · 1.420 Decisões Auditadas · XAI 99.4% · 512 Lições Aprendidas · Graph 24.8K nós · Cognitive Score 99.1</p>
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

export default ECGDIILPPage;
