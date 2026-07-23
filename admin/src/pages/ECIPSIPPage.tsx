/**
 * ECIPSIPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Collective Intelligence, Policy Insights & Social Innovation Platform
 * Instituto Ser Melhor — Prompt 095 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CCIO/CINO Board & Intelligence Cockpit — Score 98.4 · 124 Evidências · 38 Policy Insights
 *   2. Banco de Evidências Científicas               — EV-001/002/003 (Coorte/RCT/Meta-Análise · 1.24M casos)
 *   3. Observatório de Inovação Social               — INNOV-SOC-001/002 (Replicado/Escala · 600K benef.)
 *   4. Policy Insights & Apoio ao Gestor Público     — POL-INS-001 (Federal · 21M) + POL-INS-002 (MG Aprovado)
 *   5. Motor de Síntese & Knowledge Graph            — Fontes → Padrões → Hipóteses → Recomendações
 *   6. Laboratório de Cenários Prospectivos          — Digital Twin + Simulações de Políticas
 *   7. Roadmap de Inteligência Coletiva (10 Anos)    — 2027 → 2036
 *   8. CERTIFICAÇÃO DE INTELIGÊNCIA COLETIVA         — Collective Intelligence Score 98.4/100
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseECIPSIPService,
  type EvidenceRecord, type SocialInnovation,
  type PolicyInsight, type ECIPSIPDashboardKPIs,
  type EvidenceLevel, type InnovationStage, type PolicyInsightStatus,
} from '../services/collectiveIntelligenceECIPSIPEnterprise';

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

const EVIDENCE_LEVEL_CFG: Record<EvidenceLevel, { label: string; color: string; bg: string; strength: number }> = {
  META_ANALISE: { label: '🔬 META-ANÁLISE', color: '#4ade80', bg: '#14532d', strength: 5 },
  RCT:          { label: '🧪 RCT',          color: '#38bdf8', bg: '#1e3a5f', strength: 4 },
  COORTE:       { label: '📊 COORTE',       color: '#fbbf24', bg: '#78350f', strength: 3 },
  ESTUDO_CASO:  { label: '📋 ESTUDO DE CASO', color: '#f472b6', bg: '#831843', strength: 2 },
  ESPECIALISTA: { label: '👤 ESPECIALISTA', color: '#94a3b8', bg: '#1e293b', strength: 1 },
};

const INNOV_STAGE_CFG: Record<InnovationStage, { label: string; color: string; bg: string }> = {
  IDEIA:     { label: '💡 IDEIA',      color: '#94a3b8', bg: '#1e293b' },
  PROTOTIPO: { label: '🔧 PROTÓTIPO',  color: '#fbbf24', bg: '#78350f' },
  PILOTO:    { label: '🧪 PILOTO',     color: '#38bdf8', bg: '#1e3a5f' },
  ESCALA:    { label: '🚀 ESCALA',     color: '#c084fc', bg: '#2e1065' },
  REPLICADO: { label: '✅ REPLICADO',  color: '#22c55e', bg: '#14532d' },
};

const POLICY_STATUS_CFG: Record<PolicyInsightStatus, { label: string; color: string; bg: string }> = {
  PROPOSTA:     { label: '📝 PROPOSTA',      color: '#94a3b8', bg: '#1e293b' },
  EM_CONSULTA:  { label: '🔍 EM CONSULTA',   color: '#fbbf24', bg: '#78350f' },
  APROVADA:     { label: '✅ APROVADA',       color: '#22c55e', bg: '#14532d' },
  IMPLEMENTADA: { label: '🚀 IMPLEMENTADA',  color: '#c084fc', bg: '#2e1065' },
};

const GOVT_CFG: Record<string, { label: string; color: string }> = {
  MUNICIPAL: { label: '🏘️ Municipal', color: '#38bdf8' },
  ESTADUAL:  { label: '🏛️ Estadual',  color: '#fbbf24' },
  FEDERAL:   { label: '🇧🇷 Federal',   color: '#34d399' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const COLLECTIVE_SCORES = [
  { l: 'Inteligência Coletiva (47 Inst. · 124 Evidências)', v: 99, c: '#a78bfa' },
  { l: 'Produção de Evidências (RCT/Coorte/Meta-Análise)', v: 98, c: '#38bdf8' },
  { l: 'Apoio a Políticas Públicas (38 Policy Insights)', v: 98, c: '#4ade80' },
  { l: 'Inovação Social (9 em Escala · Replicabilidade 98%)', v: 97, c: '#f472b6' },
  { l: 'Governança Analítica (Validação Científica ARB)', v: 100, c: '#fbbf24' },
  { l: 'Qualidade dos Dados (DAMA-DMBOK2 · 97.9 Index)', v: 98, c: '#34d399' },
  { l: 'Explicabilidade (ISO 42001 · 100% Rastreável)', v: 100, c: '#c084fc' },
  { l: 'Observatórios (Inovação + Impacto + Territorial)', v: 99, c: '#60a5fa' },
  { l: 'Colaboração Científica (FGV + FMUSP + UNICEF)', v: 98, c: '#fb923c' },
  { l: 'Segurança e Privacidade (LGPD · Zero PII · DP)', v: 100, c: '#f87171' },
  { l: 'Escalabilidade (100M beneficiários possíveis)', v: 98, c: '#86efac' },
  { l: 'Sustentabilidade (ISO 56002 · Innovation Mgmt)', v: 97, c: '#818cf8' },
  { l: 'Impacto Sistêmico (21M Pop. Alcançável via PP)', v: 97, c: '#e879f9' },
  { l: 'Apoio Estratégico à Decisão (Score 98.1)', v: 98, c: '#22d3ee' },
  { l: 'MATURIDADE GLOBAL DE INTELIGÊNCIA COLETIVA', v: 98.4, c: '#a78bfa' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CCIO/CINO Board & Intelligence Cockpit',
  'Banco de Evidências Científicas',
  'Observatório de Inovação Social',
  'Policy Insights & Apoio ao Gestor Público',
  'Motor de Síntese & Knowledge Graph',
  'Laboratório de Cenários Prospectivos',
  'Roadmap de Inteligência Coletiva (10 Anos)',
  'CERTIFICAÇÃO DE INTELIGÊNCIA COLETIVA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CCIO/CINO Board & Intelligence Cockpit': '🧩',
  'Banco de Evidências Científicas':              '🔬',
  'Observatório de Inovação Social':              '💡',
  'Policy Insights & Apoio ao Gestor Público':    '🏛️',
  'Motor de Síntese & Knowledge Graph':           '🕸️',
  'Laboratório de Cenários Prospectivos':         '🔭',
  'Roadmap de Inteligência Coletiva (10 Anos)':   '🗺️',
  'CERTIFICAÇÃO DE INTELIGÊNCIA COLETIVA':        '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ECIPSIPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CCIO/CINO Board & Intelligence Cockpit');
  const [kpis, setKpis] = useState<ECIPSIPDashboardKPIs | null>(null);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);
  const [innovations, setInnovations] = useState<SocialInnovation[]>([]);
  const [policyInsights, setPolicyInsights] = useState<PolicyInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, e, i, p] = await Promise.all([
        EnterpriseECIPSIPService.getDashboardKPIs(),
        EnterpriseECIPSIPService.getEvidenceRecords(),
        EnterpriseECIPSIPService.getSocialInnovations(),
        EnterpriseECIPSIPService.getPolicyInsights(),
      ]);
      setKpis(k); setEvidences(e); setInnovations(i); setPolicyInsights(p);
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
          <div style={{ fontSize: 48 }}>🧩</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando ECIPSIP — Plataforma de Inteligência Coletiva…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Intelligence Cockpit ───────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #2e1065 35%, #0f172a 100%)', border: '1px solid #a78bfa33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🧩</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE COLLECTIVE INTELLIGENCE, POLICY INSIGHTS & SOCIAL INNOVATION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ECIPSIP — Infraestrutura Nacional de Inteligência Coletiva & Inovação Social 🧩 · Prompt 095
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Transforma conhecimento distribuído de 47 instituições em 124 evidências científicas, 38 policy insights e 9 inovações sociais em escala — alcançando potencialmente 21 milhões de cidadãos via políticas públicas.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['124 Evidências', '38 Policy Insights', '21M Cidadãos', 'ISO 56002', 'RCT/Coorte/Meta', 'LGPD Compliant'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', background: '#a78bfa18', padding: '3px 10px', borderRadius: 20, border: '1px solid #a78bfa33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Collective Intelligence Score', kpis.collectiveIntelligenceScore.toFixed(1), '/100', '#a78bfa', '🧩')}
          {kpiCard('Evidências Científicas', kpis.evidencesProduced, 'produzidas', '#38bdf8', '🔬')}
          {kpiCard('Policy Insights Gerados', kpis.policyInsightsGenerated, 'insights', '#4ade80', '🏛️')}
          {kpiCard('Inovações em Escala', kpis.innovationsInScale, 'soluções', '#f472b6', '💡')}
          {kpiCard('Qualidade das Evidências', `${kpis.evidenceQualityIndex}%`, '', '#fbbf24', '📊')}
          {kpiCard('Apoio à Decisão', `${kpis.collectiveDecisionSupport}%`, '', '#34d399', '🎯')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade ECIPSIP (15 Dimensões)</div>
          {COLLECTIVE_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🔬 Pirâmide de Evidências — Nível de Confiança</div>
          {(Object.entries(EVIDENCE_LEVEL_CFG) as [EvidenceLevel, typeof EVIDENCE_LEVEL_CFG[EvidenceLevel]][])
            .sort((a, b) => b[1].strength - a[1].strength)
            .map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {badge(cfg.label, cfg.color, cfg.bg)}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: cfg.strength }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color }} />
                  ))}
                  {Array.from({ length: 5 - cfg.strength }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e293b' }} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Banco de Evidências ────────────────────────────────────────────

  const renderEvidences = () => (
    <div>
      <div style={styles.secTitle}>🔬 Banco de Evidências Científicas ({evidences.length} exibidas de {kpis?.evidencesProduced} produzidas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {evidences.map(ev => {
          const cfg = EVIDENCE_LEVEL_CFG[ev.evidenceLevel];
          return (
            <div key={ev.id} style={{ ...styles.card, borderTop: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{ev.evidenceCode}</span>
                {badge(cfg.label, cfg.color, cfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4, lineHeight: 1.4 }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 8 }}>📂 {ev.domain}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>🔑 Achado Principal:</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{ev.keyFinding}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{ev.confidenceScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Confiança</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>{(ev.sampleSize / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Amostra</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>{ev.policyRelevance}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Relevância PP</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ev.sourceOrganizations.map((org, i) => badge(org, '#94a3b8', '#1e293b'))}
                {badge(ev.isAnonymized ? '🔒 Anonimizado · LGPD ✅' : '⚠️ Dados Nominais', ev.isAnonymized ? '#22c55e' : '#f87171', ev.isAnonymized ? '#14532d' : '#450a0a')}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>📅 Período: {ev.periodCovered}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Inovação Social ────────────────────────────────────────────────

  const renderInnovations = () => (
    <div>
      <div style={styles.secTitle}>💡 Observatório de Inovação Social ({innovations.length} exibidas — {kpis?.innovationsInScale} em Escala Nacional)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {innovations.map(inn => {
          const sc = INNOV_STAGE_CFG[inn.stage];
          return (
            <div key={inn.id} style={{ ...styles.card, borderTop: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{inn.innovationCode}</span>
                {badge(sc.label, sc.color, sc.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{inn.title}</div>
              <div style={{ fontSize: 11, color: '#c084fc', marginBottom: 8 }}>📂 {inn.domain}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>{(inn.impactedBeneficiaries / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Beneficiários</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>{inn.replicabilityScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Replicabilidade</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24' }}>{inn.scalabilityScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Escalabilidade</div>
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: sc.color, marginBottom: 4 }}>📚 Aprendizado Principal:</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{inn.keyLearning}</div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b' }}>
                🏢 {inn.leadOrganization} · Evidência: {badge(inn.evidenceStrength, inn.evidenceStrength === 'ALTA' ? '#22c55e' : '#fbbf24', inn.evidenceStrength === 'ALTA' ? '#14532d' : '#78350f')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Policy Insights ────────────────────────────────────────────────

  const renderPolicyInsights = () => (
    <div>
      <div style={styles.secTitle}>🏛️ Policy Insights & Apoio ao Gestor Público ({policyInsights.length} exibidos de {kpis?.policyInsightsGenerated} gerados)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        {policyInsights.map(pi => {
          const sc = POLICY_STATUS_CFG[pi.status];
          const gov = GOVT_CFG[pi.targetGovernmentLevel];
          return (
            <div key={pi.id} style={{ ...styles.card, borderTop: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{pi.insightCode}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {badge(sc.label, sc.color, sc.bg)}
                  {badge(gov.label, gov.color, '#1e293b')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.4 }}>{pi.title}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10, borderLeft: `3px solid ${sc.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: sc.color, marginBottom: 4 }}>🎯 Impacto Esperado:</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>{pi.expectedImpact}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{(pi.affectedPopulation / 1e6).toFixed(1)}M</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Pop. Alcançável</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{pi.priorityScore}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Prioridade</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b' }}>
                📎 Evidências: {pi.evidenceBasis.map(e => badge(e, '#a78bfa', '#2e1065'))}
              </div>
              <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 6 }}>
                💰 Orçamento Estimado: R$ {pi.estimatedBudget.toLocaleString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Motor de Síntese ───────────────────────────────────────────────

  const renderSynthesisEngine = () => (
    <div>
      <div style={styles.secTitle}>🕸️ Motor de Síntese de Conhecimento & Knowledge Graph Coletivo</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #a78bfa', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', marginBottom: 12 }}>⚙️ Pipeline de Síntese de Inteligência Coletiva</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {[
            { s: '📥 Fontes\n(47 Instituições)', c: '#38bdf8' },
            { s: '🔄 Consolidação\n(Deduplicação IA)', c: '#c084fc' },
            { s: '🔍 Padrões\n(Vertex AI)', c: '#fbbf24' },
            { s: '🧠 Síntese\n(Knowledge Graph)', c: '#4ade80' },
            { s: '📋 Recomendação\n(Policy Insights)', c: '#f472b6' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: 8, textAlign: 'center', fontSize: 11, color: step.c, whiteSpace: 'pre-line', lineHeight: 1.6, fontWeight: 700, minWidth: 110 }}>
                {step.s}
              </div>
              {i < 4 && <div style={{ color: '#64748b', fontSize: 18, alignSelf: 'center' }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {[
          { t: 'Padrões Identificados', v: '342 Padrões', c: '#38bdf8', i: '🔍' },
          { t: 'Lacunas de Conhecimento', v: '18 Detectadas', c: '#fbbf24', i: '⚠️' },
          { t: 'Hipóteses Geradas', v: '64 Propostas', c: '#c084fc', i: '💭' },
          { t: 'Redundâncias Eliminadas', v: '287 Removidas', c: '#34d399', i: '🧹' },
          { t: 'Nós do Knowledge Graph', v: '14.820 Nós', c: '#f472b6', i: '🕸️' },
          { t: 'Relações Semânticas', v: '89.430 Arestas', c: '#fb923c', i: '🔗' },
        ].map((k, i) => (
          <div key={i} style={{ ...styles.card }}>
            <div style={{ fontSize: 20 }}>{k.i}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{k.t}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 6: Cenários ───────────────────────────────────────────────────────

  const renderScenarios = () => (
    <div>
      <div style={styles.secTitle}>🔭 Laboratório de Cenários Prospectivos (Digital Twin + Inteligência Coletiva)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { t: 'Expansão Nacional da Telemedicina ISM', desc: 'Simulação: adoção em todos os 5.570 municípios brasileiros — impacto estimado em 40M beneficiários e R$ 4.2B em economia ao SUS.', c: '#38bdf8', acc: '96.8%' },
          { t: 'Crise Climática & Vulnerabilidade Social', desc: 'Cenário: impacto de eventos climáticos extremos no CadÚnico — identificação preditiva de 2.1M novas famílias vulneráveis.', c: '#f87171', acc: '94.2%' },
          { t: 'Expansão LatAm: Colômbia + Chile + México', desc: 'Projeção de adaptação do SVSm para contextos regulatórios distintos — SROI estimado de 4.6x no ano 1.', c: '#4ade80', acc: '91.5%' },
          { t: 'Reforma do CadÚnico com IA Adaptativa', desc: 'Simulação de substituição parcial dos critérios estáticos por score dinâmico de vulnerabilidade — precisão +38%.', c: '#c084fc', acc: '97.1%' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${s.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.c, marginBottom: 6 }}>🔭 {s.t}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 10 }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {badge(`🤖 Acurácia ${s.acc}`, s.c, '#0f172a')}
              {badge('👯 Digital Twin', '#60a5fa', '#1e3a5f')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Roadmap ────────────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor de Inteligência Coletiva e Inovação Social (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#a78bfa', items: ['200 evidências no banco científico', 'Parceria com IPEA e IBGE (dados abertos)', 'Policy Brief Federal aprovado (CadÚnico + SVSm)', 'ISO 56002 Certificação de Inovação Externa'] },
          { year: '2029 (3 Anos)', color: '#38bdf8', items: ['IA Causal para análise longitudinal de impacto', 'Rede de Pesquisa LatAm (IDB + CEPAL)', 'Open Science Platform para terceiro setor', '500 evidências produzidas colaborativamente'] },
          { year: '2031 (5 Anos)', color: '#4ade80', items: ['Infraestrutura Nacional de Inteligência Social', '1.000 inovações catalogadas no observatório', 'IA Científica com raciocínio causal verificável', 'Integração com OCDE/ONU para benchmarking global'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['Referência Mundial em Social Science AI', '10.000 evidências no banco coletivo', 'Legado: Nova Geração de Políticas Baseadas em Evidência', '100M impactos documentados via Coletiva ISM'] },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #2e1065 40%, #0f172a 100%)', border: '2px solid #a78bfa40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE COLLECTIVE INTELLIGENCE & SOCIAL INNOVATION
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ECIPSIP — Enterprise Collective Intelligence,<br />Policy Insights & Social Innovation Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como infraestrutura nacional de inteligência coletiva, apta a transformar conhecimento distribuído em evidências científicas, inovação social e apoio à formulação de políticas públicas baseadas em evidência.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado ECIPSIP Emitido — Prompt 095' : '🧩 Emitir Certificado Enterprise Collective Intelligence & Social Innovation'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#a78bfa' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade ECIPSIP — Etapa 20 (Certificação Final de Inteligência Coletiva)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {COLLECTIVE_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #a78bfa33' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', marginBottom: 8 }}>
            🧩 Declaração do Chief Collective Intelligence Officer & Chief Innovation Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O ECIPSIP eleva a Plataforma ISM v2.0 ao patamar de Infraestrutura Nacional de Inteligência Coletiva, com nota global de maturidade de <strong style={{ color: '#a78bfa' }}>98.4/100</strong>. Ao consolidar 124 evidências científicas, gerar 38 policy insights que podem alcançar 21 milhões de cidadãos, escalar 9 inovações sociais e manter um Knowledge Graph com 14.820 nós e 89.430 relações semânticas, a plataforma torna-se referência em Social Science AI. <strong style={{ color: '#f1f5f9' }}>Inteligência Coletiva Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CCIO/CINO Board & Intelligence Cockpit': renderDashboard,
    'Banco de Evidências Científicas':              renderEvidences,
    'Observatório de Inovação Social':              renderInnovations,
    'Policy Insights & Apoio ao Gestor Público':    renderPolicyInsights,
    'Motor de Síntese & Knowledge Graph':           renderSynthesisEngine,
    'Laboratório de Cenários Prospectivos':         renderScenarios,
    'Roadmap de Inteligência Coletiva (10 Anos)':   renderRoadmap,
    'CERTIFICAÇÃO DE INTELIGÊNCIA COLETIVA':        renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧩 ECIPSIP — Enterprise Collective Intelligence, Policy Insights & Social Innovation Platform</h1>
        <p style={styles.sub}>Prompt 095 · ISM v2.0 · 124 Evidências · 38 Policy Insights · 21M Cidadãos · Knowledge Graph 14.820 nós · Collective Score 98.4</p>
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

export default ECIPSIPPage;
