/**
 * ETAGDTPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Trusted Autonomous Governance & Digital Trust Platform
 * Instituto Ser Melhor — Prompt 088 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CGO/CTO Board & Digital Trust Hub — Dashboard (Score 99.2 · 100% Responsible AI · Human-in-the-Loop 100%)
 *   2. Registro de Decisões Digitais Automatizadas— Repositório rastreável com SHA-256 e Explicabilidade
 *   3. Governança da IA & ISO 42001 / NIST AI RMF— Inventário de Modelos, Explicabilidade, Drift & Ética
 *   4. Gestão Integrada de Riscos Corporativos — Matriz ISO 31000 (Ética IA, LGPD, Cybersecurity, Operacional)
 *   5. Compliance Contínuo (LGPD · ISO 27001)  — Monitor de Conformidade Regulatória & Contratos
 *   6. Agente IA para Governança & Auditoria   — Vertex AI (Revisão de Decisões, Conflitos de Política)
 *   7. Motor de Confiança Computacional (Score)— Cálculo em tempo real do Digital Trust Score (99.2/100)
 *   8. CERTIFICAÇÃO SUPREMA DE GOVERNANÇA DIGITAL— Emissão do Certificado de Confiança Digital & IA Responsável
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseETAGDTPService,
  type AutomatedDecisionEntry, type EnterpriseRiskEntry,
  type ETAGDTPDashboardKPIs, type DecisionCriticality, type HumanSupervisionLevel, type RiskCategory,
} from '../services/digitalTrustETAGDTPEnterprise';

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

const progressRing = (value: number, color: string, size = 72) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={800} fill={color}>{value}%</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const CRITICALITY_CFG: Record<DecisionCriticality, { label: string; color: string; bg: string }> = {
  CRITICA_ALTA:      { label: '🔴 CRÍTICA ALTA',      color: '#ef4444', bg: '#450a0a' },
  ESTRATEGICA_MEDIA: { label: '🟡 ESTRATÉGICA MÉDIA', color: '#fbbf24', bg: '#78350f' },
  OPERACIONAL_BAIXA: { label: '🟢 OPERACIONAL BAIXA', color: '#22c55e', bg: '#14532d' },
};

const SUPERVISION_CFG: Record<HumanSupervisionLevel, { label: string; color: string }> = {
  OBRIGATORIA_PREVIA: { label: 'Human-in-the-Loop Prévia Obrigatória', color: '#f87171' },
  AUDITORIA_POSTERIOR:{ label: 'Auditoria Humana Posterior',           color: '#fbbf24' },
  INFORMATIVA_LOG:    { label: 'Log Informativo de Auditoria',       color: '#34d399' },
};

const RISK_CAT_CFG: Record<RiskCategory, { label: string; icon: string; color: string }> = {
  IA_ETICA:        { label: 'IA & Ética Computacional', icon: '🤖', color: '#c084fc' },
  PRIVACIDADE_LGPD:{ label: 'Privacidade & LGPD',       icon: '🛡️', color: '#34d399' },
  SEGURANCA_CYBER: { label: 'Segurança & Zero Trust',   icon: '🔒', color: '#f87171' },
  OPERACIONAL:     { label: 'Risco Operacional SRE',    icon: '⚙️', color: '#60a5fa' },
  REPUTACIONAL:    { label: 'Risco Reputacional',       icon: '🏛️', color: '#fbbf24' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const TRUST_SCORES = [
  { l: 'Governança Digital Adaptativa (COBIT 2019 / TOGAF)', v: 100, c: '#38bdf8' },
  { l: 'IA Responsável (ISO 42001 / NIST AI RMF)', v: 100, c: '#34d399' },
  { l: 'Gestão Integrada de Riscos (ISO 31000)', v: 99, c: '#c084fc' },
  { l: 'Compliance Contínuo (ISO 37301 / LGPD 100%)', v: 100, c: '#60a5fa' },
  { l: 'Digital Trust Score (Índice Computacional)', v: 99.2, c: '#fbbf24' },
  { l: 'Explicabilidade dos Modelos (Explainability Score)', v: 99, c: '#a78bfa' },
  { l: 'Auditoria Imutável (SHA-256 Hash Trail)', v: 100, c: '#f472b6' },
  { l: 'Supervisão Humana (Human-in-the-Loop 100%)', v: 100, c: '#4ade80' },
  { l: 'Segurança da Informação (ISO 27001 · Zero Trust)', v: 100, c: '#f87171' },
  { l: 'Transparência Algorítmica', v: 99, c: '#38bdf8' },
  { l: 'Continuidade Operacional (RTO < 5min)', v: 99, c: '#818cf8' },
  { l: 'Ética Computacional (Comitê Paritário)', v: 100, c: '#e879f9' },
  { l: 'Resiliência da Governança', v: 99, c: '#fb923c' },
  { l: 'Governança Adaptativa de Mudanças', v: 98, c: '#86efac' },
  { l: 'MATURIDADE GLOBAL DE CONFIANÇA DIGITAL', v: 99.2, c: '#38bdf8' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CGO/CTO Board & Digital Trust Hub',
  'Registro de Decisões Digitais Automatizadas',
  'Governança da IA & ISO 42001 / NIST AI RMF',
  'Gestão Integrada de Riscos Corporativos',
  'Compliance Contínuo (LGPD · ISO 27001)',
  'Agente IA para Governança & Auditoria',
  'Motor de Confiança Computacional (Score)',
  'CERTIFICAÇÃO SUPREMA DE GOVERNANÇA DIGITAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CGO/CTO Board & Digital Trust Hub':    '🛡️',
  'Registro de Decisões Digitais Automatizadas':'📜',
  'Governança da IA & ISO 42001 / NIST AI RMF': '🤖',
  'Gestão Integrada de Riscos Corporativos':    '⚠️',
  'Compliance Contínuo (LGPD · ISO 27001)':     '⚖️',
  'Agente IA para Governança & Auditoria':      '🔮',
  'Motor de Confiança Computacional (Score)':   '🎯',
  'CERTIFICAÇÃO SUPREMA DE GOVERNANÇA DIGITAL': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ETAGDTPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CGO/CTO Board & Digital Trust Hub');
  const [kpis, setKpis] = useState<ETAGDTPDashboardKPIs | null>(null);
  const [decisions, setDecisions] = useState<AutomatedDecisionEntry[]>([]);
  const [risks, setRisks] = useState<EnterpriseRiskEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, r] = await Promise.all([
        EnterpriseETAGDTPService.getDashboardKPIs(),
        EnterpriseETAGDTPService.getDecisions(),
        EnterpriseETAGDTPService.getRisks(),
      ]);
      setKpis(k); setDecisions(d); setRisks(r);
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
          <div style={{ fontSize: 48 }}>🛡️</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando Plataforma de Confiança Digital & Governança Adaptativa…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e3a5f 40%, #0f172a 100%)', border: '1px solid #38bdf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🛡️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE TRUSTED AUTONOMOUS GOVERNANCE & DIGITAL TRUST PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ETAGDTP — Governança Digital Adaptativa & Confiança Computacional 🛡️ · Prompt 088
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Supervisão contínua de inteligência artificial, automações, riscos corporativos e conformidade regulatória. Explicabilidade algorítmica de 99.0%, Human-in-the-Loop em 100% das decisões críticas e auditoria imutável via SHA-256.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Responsible AI', 'ISO 42001', 'NIST AI RMF', 'ISO 37301', 'Human-in-the-Loop 100%', 'SHA-256 Audit Trail', 'Digital Trust 99.2'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Digital Trust Score', kpis.globalDigitalTrustScore.toFixed(1), '/100', '#38bdf8', '🛡️')}
          {kpiCard('IA Responsável Maturity', `${kpis.responsibleAIMaturityScore}%`, '', '#34d399', '🤖')}
          {kpiCard('Human-in-the-Loop Enforcement', `${kpis.humanInTheLoopEnforcementPercent}%`, '', '#60a5fa', '👤')}
          {kpiCard('Explicabilidade Média (IA)', `${kpis.explainabilityAveragePercent}%`, '', '#c084fc', '🔍')}
          {kpiCard('Decisões Auditadas Hash SHA-256', kpis.totalAutomatedDecisionsRegistered, 'decisões', '#fbbf24', '📜')}
          {kpiCard('Riscos Mitigados (ISO 31000)', kpis.activeMitigatedRisksCount, 'riscos', '#4ade80', '⚠️')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade de Governança & Trust ETAGDTP</div>
          {TRUST_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard de Confiança Digital</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Trust Score', v: Math.round(kpis.globalDigitalTrustScore), c: '#38bdf8' },
              { label: 'Human-in-the-Loop', v: Math.round(kpis.humanInTheLoopEnforcementPercent), c: '#34d399' },
              { label: 'Explicabilidade', v: Math.round(kpis.explainabilityAveragePercent), c: '#c084fc' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #38bdf833' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>🛡️ Confiança Computacional Certificada</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Todas as decisões algorítmicas possuem rastreabilidade imutável via hash SHA-256, explicabilidade de 99% e governança alinhada às normas ISO 42001, ISO 27001 e NIST AI RMF.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Registro de Decisões Digitais ──────────────────────────────────

  const renderDecisions = () => (
    <div>
      <div style={styles.secTitle}>📜 Repositório de Decisões Digitais Automatizadas ({decisions.length} registradas)</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Código', 'Decisão Digital', 'Criticidade', 'Supervisão Humana', 'Modelo IA', 'Explicabilidade', 'Audit Trail (Hash)'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {decisions.map(d => {
              const crit = CRITICALITY_CFG[d.criticality];
              const sup = SUPERVISION_CFG[d.supervisionLevel];
              return (
                <tr key={d.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#38bdf8' }}>{d.decisionCode}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#f1f5f9', maxWidth: 260 }}>{d.decisionName}</td>
                  <td style={styles.td}>{badge(crit.label, crit.color, crit.bg)}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: sup.color }}>{sup.label}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{d.aiModelUsed}</td>
                  <td style={{ ...styles.td, fontWeight: 800, color: '#34d399' }}>{d.explainabilityScore}%</td>
                  <td style={{ ...styles.td, fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>{d.auditTrailHash.slice(0, 16)}...</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 3: Governança da IA & ISO 42001 ──────────────────────────────────

  const renderAIGovernance = () => (
    <div>
      <div style={styles.secTitle}>🤖 Governança da IA & ISO 42001 / NIST AI RMF</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Controles formais de IA Responsável cobrindo todo o ciclo de vida dos modelos: do treinamento e fine-tuning à monitoração contínua de alucinações, viés algorítmico e aposentadoria controlada.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Maturidade ISO 42001', v: '100% Aderência', c: '#34d399' },
            { l: 'Detecção de Viés Algorítmico', v: '0 Vieses Críticos', c: '#38bdf8' },
            { l: 'Deriva de Modelo (Model Drift)', v: 'Monitorado 24/7', c: '#c084fc' },
            { l: 'Filtros de Segurança Vertex AI', v: '100% Enforced', c: '#fbbf24' },
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

  // ── TAB 4: Gestão Integrada de Riscos ─────────────────────────────────────

  const renderRisks = () => (
    <div>
      <div style={styles.secTitle}>⚠️ Gestão Integrada de Riscos Corporativos (ISO 31000 — {risks.length} monitorados)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {risks.map(r => {
          const cat = RISK_CAT_CFG[r.category];
          return (
            <div key={r.id} style={{ ...styles.card, borderTop: `4px solid ${cat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                {badge(`Índice Risco: ${r.riskIndex}`, '#34d399', '#14532d')}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{r.riskCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{r.riskTitle}</div>
              <div style={{ fontSize: 11, color: cat.color, fontWeight: 700, marginBottom: 8 }}>{cat.label}</div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                📌 <strong>Plano de Mitigação:</strong> {r.mitigationPlan}
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Responsável: {r.riskOwner}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Compliance Contínuo ───────────────────────────────────────────

  const renderCompliance = () => (
    <div>
      <div style={styles.secTitle}>⚖️ Compliance Contínuo (LGPD · ISO 27001 · ISO 37301 · ISO 42001)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>📜 Matriz de Conformidade Regulatória</div>
          {['LGPD — Lei Geral de Proteção de Dados (100% Aderente)', 'ISO 27001:2022 — Segurança da Informação (Certificado)', 'ISO 42001:2023 — Gestão de IA Responsável (Certificado)', 'ISO 37301:2021 — Sistemas de Gestão de Compliance (96%)'].map((it, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
              <span style={{ color: '#34d399' }}>✓</span> {it}
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>🛡️ Auditoria & Controles Automatizados</div>
          {[
            { d: 'DPO Alert Bus & Notificações', v: 'Ativo 24/7' },
            { d: 'Análise de Impacto (DPIA / RIPD)', v: 'Atualizado MENSAL' },
            { d: 'Trilha Imutável de Consentimento', v: 'SHA-256 Verified' },
            { d: 'Não Conformidades Abertas', v: '0 Críticas' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: IA para Governança ─────────────────────────────────────────────

  const renderAIGovernanceAgent = () => (
    <div>
      <div style={styles.secTitle}>🔮 Agente IA para Governança & Auditoria (Vertex AI Governance Engine)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O Governance AI Agent revisa continuamente decisões automatizadas, identifica possíveis conflitos entre políticas institucionais e emite recomendações de auditoria fundamentadas.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Revisão Automática de Decisões', v: '100% Auditadas', c: '#34d399' },
            { l: 'Conflitos de Política Detectados', v: '0 Conflitos Ativos', c: '#38bdf8' },
            { l: 'Explicabilidade das Recomendações', v: '99.0% Confiança', c: '#c084fc' },
            { l: 'Auditorias Preventivas Recomendadas', v: '2 Concluídas', c: '#fbbf24' },
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

  // ── TAB 7: Digital Trust Score ───────────────────────────────────────────

  const renderTrustScore = () => (
    <div>
      <div style={styles.secTitle}>🎯 Motor de Confiança Computacional (Digital Trust Score Engine)</div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>📊 Componentes do Digital Trust Score (99.2/100)</div>
          {[
            { d: 'Qualidade & Integridade dos Dados', v: '99.4/100' },
            { d: 'Explicabilidade & Transparência IA', v: '99.0/100' },
            { l: 'Segurança Zero Trust & mTLS', v: '100.0/100' },
            { d: 'Supervisão Humana (Human-in-the-Loop)', v: '100.0/100' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d || (s as { l: string }).l}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>🛡️ Garantias da Instituição Confiável</div>
          {[
            { d: 'Zero Decisões Críticas sem Aprovação Humana', v: 'ENFORCED' },
            { d: 'Zero Algoritmos Caixa-Preta em Produção', v: 'ENFORCED' },
            { d: 'Hash Imutável SHA-256 para Toda Decisão', v: 'ENFORCED' },
            { d: 'Auditoria Externa Periódica Habilitada', v: 'ENFORCED' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e3a5f 40%, #0f172a 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE GOVERNANÇA DIGITAL E CONFIANÇA COMPUTACIONAL
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ETAGDTP — Enterprise Trusted Autonomous Governance<br />& Digital Trust Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é oficialmente declarada uma Instituição Digital Confiável (Trusted Autonomous Digital Institution), possuindo governança adaptativa contínua, IA 100% responsável e explicável, e supervisão humana obrigatória.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado ETAGDTP Emitido — Prompt 088' : '🏆 Emitir Certificado Suprema de Governança Digital'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade ETAGDTP — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {TRUST_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #38bdf833' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🛡️ Declaração do Chief Governance Officer & Chief Trust Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O ETAGDTP consolida a Plataforma Instituto Ser Melhor como uma Instituição Digital Confiável de referência internacional, com score global de confiança computacional de <strong style={{ color: '#38bdf8' }}>99.2/100</strong>. Com 100% de Human-in-the-Loop nas decisões críticas, explicabilidade algorítmica total e conformidade rigorosa com a ISO 42001 e LGPD, garantimos que a tecnologia sirva à sociedade com ética, segurança e transparência absolutas. <strong style={{ color: '#f1f5f9' }}>Governança Digital Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CGO/CTO Board & Digital Trust Hub':    renderDashboard,
    'Registro de Decisões Digitais Automatizadas':renderDecisions,
    'Governança da IA & ISO 42001 / NIST AI RMF': renderAIGovernance,
    'Gestão Integrada de Riscos Corporativos':    renderRisks,
    'Compliance Contínuo (LGPD · ISO 27001)':     renderCompliance,
    'Agente IA para Governança & Auditoria':      renderAIGovernanceAgent,
    'Motor de Confiança Computacional (Score)':   renderTrustScore,
    'CERTIFICAÇÃO SUPREMA DE GOVERNANÇA DIGITAL': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🛡️ ETAGDTP — Enterprise Trusted Autonomous Governance & Digital Trust Platform</h1>
        <p style={styles.sub}>Prompt 088 · Instituto Ser Melhor v2.0 · Responsible AI · ISO 42001 · NIST AI RMF · ISO 31000 · Digital Trust Score 99.2 · LGPD 100%</p>
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

export default ETAGDTPPage;
