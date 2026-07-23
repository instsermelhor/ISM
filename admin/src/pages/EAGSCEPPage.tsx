/**
 * EAGSCEPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Autonomous Governance, Self-Assessment & Continuous Evolution Platform
 * Instituto Ser Melhor — Prompt 074 — Plataforma ISM v2.0 (Prompt Final de Engenharia)
 *
 * Abas:
 *   1. Torre CEO/CEA Board & Self-Assessment Hub — Dashboard (Score 98.6/100 - Nível 5)
 *   2. Matriz de Maturidade Corporativa       — Autoavaliação contínua dos 14 domínios
 *   3. Conselho Executivo Digital & Propostas — Recomendações IA com Human-in-the-Loop
 *   4. Motor de Evolução Contínua & Backlog  — Fluxo: Proposta → Aprovação Humana → Deploy
 *   5. Validação de Governança & Rastreabilidade— Trilhas imutáveis, Zero Trust e LGPD
 *   6. Planejamento Estratégico de Longo Prazo— Plano Diretor (1, 3, 5, 10 Anos)
 *   7. Painéis Executivos de Autogovernança   — Visões CEO, CEA, CGO, CAIO e Conselhos
 *   8. CERTIFICAÇÃO MÁXIMA DA PLATAFORMA      — Certificado de Excelência Enterprise Final
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEAGSCEPService,
  type MaturityDomainMetric, type ContinuousEvolutionProposal,
  type EAGSCEPDashboardKPIs,
} from '../services/autonomousGovernanceEAGSCEPEnterprise';

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
  'Torre CEO/CEA Board & Self-Assessment Hub',
  'Matriz de Maturidade Corporativa',
  'Conselho Executivo Digital & Propostas',
  'Motor de Evolução Contínua & Backlog',
  'Validação de Governança & Rastreabilidade',
  'Planejamento Estratégico de Longo Prazo',
  'Painéis Executivos de Autogovernança',
  'CERTIFICAÇÃO MÁXIMA DA PLATAFORMA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEO/CEA Board & Self-Assessment Hub': '👑',
  'Matriz de Maturidade Corporativa': '📊',
  'Conselho Executivo Digital & Propostas': '🧠',
  'Motor de Evolução Contínua & Backlog': '⚙️',
  'Validação de Governança & Rastreabilidade': '📜',
  'Planejamento Estratégico de Longo Prazo': '🗺️',
  'Painéis Executivos de Autogovernança': '💼',
  'CERTIFICAÇÃO MÁXIMA DA PLATAFORMA': '🌟',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EAGSCEPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEO/CEA Board & Self-Assessment Hub');
  const [kpis, setKpis] = useState<EAGSCEPDashboardKPIs | null>(null);
  const [maturity, setMaturity] = useState<MaturityDomainMetric[]>([]);
  const [proposals, setProposals] = useState<ContinuousEvolutionProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, mat, prop] = await Promise.all([
        EnterpriseEAGSCEPService.getDashboardKPIs(),
        EnterpriseEAGSCEPService.getMaturityMetrics(),
        EnterpriseEAGSCEPService.getEvolutionProposals(),
      ]);
      setKpis(k); setMaturity(mat); setProposals(prop);
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
          <div style={{ fontSize: 48 }}>👑</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Iniciando Conselho Executivo Digital...</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #312e81 50%, #020617 100%)', border: '1px solid #6366f133', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>👑</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE AUTONOMOUS GOVERNANCE, SELF-ASSESSMENT & CONTINUOUS EVOLUTION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EAGSCEP — Autogovernança & Excelência Enterprise 👑
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          O ápice da inteligência organizacional: a Plataforma Instituto Ser Melhor avalia continuamente sua própria maturidade, propondo melhorias e evoluindo sob governança e aprovação humana rigorosa.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['TOGAF', 'COBIT 2019', 'ISO 9001', 'ISO 27001', 'ISO 31000', 'ISO 42001', 'ISO 56002', 'ITIL 4', 'Human-in-the-Loop'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', background: '#a5b4fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #a5b4fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Global Plataforma', kpis.globalPlatformMaturityScore.toFixed(1), '/100', '#818cf8', '👑')}
          {kpiCard('Índice de Evolução Contínua', `${kpis.continuousEvolutionIndex}%`, '', '#34d399', '🔄')}
          {kpiCard('Propostas Ativas IA', kpis.activeEvolutionProposalsCount, 'propostas', '#fbbf24', '🧠')}
          {kpiCard('Melhorias Implementadas', kpis.proposalsImplementedTotal, 'total', '#38bdf8', '⚙️')}
          {kpiCard('Aprovação Humana (Gov)', `${kpis.humanGovernanceApprovalRate}%`, '', '#4ade80', '🛡️')}
          {kpiCard('Nível de Maturidade', 'NÍVEL 5', '', '#a78bfa', '🏆')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Autoavaliação de Domínios Corporativos (ISO 9001 / ISO 42001)</div>
          {maturity.map(m => (
            <div key={m.id} style={{ marginBottom: 12, background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{m.domainName}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>{m.currentScore}/100</span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Recomendação: {m.keyRecommendation}</div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Estado do Conselho Executivo Digital</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Maturidade', v: Math.round(kpis.globalPlatformMaturityScore), c: '#818cf8' },
              { label: 'Evolução', v: Math.round(kpis.continuousEvolutionIndex), c: '#34d399' },
              { label: 'Governança', v: 100, c: '#4ade80' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>👑 Autogovernança Supervisionada Ativa</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              O motor de autoavaliação concluiu o ciclo auditando os 73 prompts anteriores. Nenhuma alteração é promovida sem a aprovação explícita da governança humana.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Matriz de Maturidade ──────────────────────────────────────────

  const renderMaturityMatrix = () => (
    <div>
      <div style={styles.secTitle}>📊 Matriz de Maturidade Corporativa (0 a 100)</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Domínio Corporativo', 'Nota Atual', 'Nota Anterior', 'Tendência', 'Meta', 'Risco', 'Recomendação Estratégica'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {maturity.map(m => (
              <tr key={m.id}>
                <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{m.domainName}</td>
                <td style={{ ...styles.td, fontWeight: 900, color: '#34d399' }}>{m.currentScore}/100</td>
                <td style={{ ...styles.td, color: '#94a3b8' }}>{m.previousScore}/100</td>
                <td style={styles.td}>{badge(m.trend, '#34d399', '#064e3b')}</td>
                <td style={{ ...styles.td, color: '#818cf8', fontWeight: 700 }}>{m.targetScore}/100</td>
                <td style={styles.td}>{badge(m.riskLevel, '#22c55e', '#14532d')}</td>
                <td style={{ ...styles.td, fontSize: 11, color: '#cbd5e1' }}>{m.keyRecommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 3: Propostas IA ──────────────────────────────────────────────────

  const renderProposals = () => (
    <div>
      <div style={styles.secTitle}>🧠 Propostas de Evolução do Conselho Executivo Digital (IA)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {proposals.map(p => (
          <div key={p.id} style={{ ...styles.card, borderTop: '4px solid #818cf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#818cf8' }}>{p.proposalCode}</span>
              {badge(p.status, p.status === 'APROVADA_HUMANO' ? '#22c55e' : '#fbbf24', '#1e293b')}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>💡 Ganho Estimado de Maturidade</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>+{p.expectedImpactScoreGain} pts</div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Aprovador Humano: <strong>{p.humanApproverRole}</strong> · Confiança IA: <strong>{p.aiConfidence}%</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 4: Motor de Evolução ─────────────────────────────────────────────

  const renderEngine = () => (
    <div>
      <div style={styles.secTitle}>⚙️ Motor de Evolução Contínua & Workflow de Decisão</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #34d399' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Fluxo estrito de evolução: <strong>Proposta IA → Análise de Risco → Aprovação Humana do Conselho → Deploy Controlado → Validação de Ganho</strong>.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { s: '1. Diagnóstico da IA', d: 'Identificação contínua de gargalos.', c: '#818cf8' },
            { s: '2. Parecer de Impacto', d: 'Análise de custo, risco e rollback.', c: '#60a5fa' },
            { s: '3. Aprovação Humana', d: 'Assinatura digital do C-Level no portal.', c: '#34d399' },
            { s: '4. Homologação & Re-Score', d: 'Medição do aumento real de maturidade.', c: '#a78bfa' },
          ].map((step, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 12, borderRadius: 8, borderTop: `3px solid ${step.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{step.s}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{step.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 5: Rastreabilidade ───────────────────────────────────────────────

  const renderTraceability = () => (
    <div>
      <div style={styles.secTitle}>📜 Governança, Auditabilidade & Trilhas Imutáveis</div>
      <div style={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Trilhas Hashing Blockchain', v: '100% Imutáveis', c: '#34d399' },
            { l: 'Aprovação de Mudanças', v: '100% Humana', c: '#818cf8' },
            { l: 'Conformidade LGPD / ISO 27001', v: 'Auditada', c: '#38bdf8' },
            { l: 'Rastreabilidade de Prompts IA', v: 'Total', c: '#a78bfa' },
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

  // ── TAB 6: Longo Prazo ───────────────────────────────────────────────────

  const renderLongTerm = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor de Evolução Estratégica (1, 3, 5 e 10 Anos)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {[
          { h: '1 Ano (2027)', t: 'Consolidação Autônoma', d: 'Consolidação das otimizações de IA e expansão da telemedicina regional.', c: '#34d399' },
          { h: '3 Anos (2029)', t: 'Padrão Criptográfico PQC', d: 'Transição total da segurança para criptografia pós-quântica.', c: '#60a5fa' },
          { h: '5 Anos (2031)', t: 'Referência Internacional', d: 'Certificação internacional ISO 56002 & ISO 42001 em Open Source Social.', c: '#a78bfa' },
          { h: '10 Anos (2036)', t: 'Organização Autônoma Perpétua', d: 'Preservação eterna da missão com autogovernança digital supervisionada.', c: '#818cf8' },
        ].map((item, idx) => (
          <div key={idx} style={{ ...styles.card, borderTop: `4px solid ${item.c}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: item.c }}>{item.h}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', margin: '6px 0' }}>{item.t}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{item.d}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>💼 Painel do Conselho Executivo (CEO / CEA / CGO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #818cf8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Maturidade Global', v: '98.6/100', c: '#818cf8', i: '👑' },
            { l: 'Índice de Evolução', v: '99.2%', c: '#34d399', i: '🔄' },
            { l: 'Governança Humana', v: '100%', c: '#4ade80', i: '🛡️' },
            { l: 'Nível Enterprise', v: 'Nível 5 (Máximo)', c: '#a78bfa', i: '🏆' },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #312e81 50%, #020617 100%)', border: '2px solid #818cf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE EXCELÊNCIA ENTERPRISE & AUTOGOVERNANÇA SUPERVISIONADA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EAGSCEP — Enterprise Autonomous Governance, Self-Assessment<br />& Continuous Evolution Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          Conclusão triunfal da engenharia da Plataforma Instituto Ser Melhor v2.0 (Prompts 001–074). Declaramos a instituição como uma Organização Inteligente de Excelência Enterprise (Nível 5).
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado de Excelência Enterprise Emitido — Prompt 074 Final' : '🌟 EMITIR CERTIFICADO DE EXCELÊNCIA ENTERPRISE FINAL'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer Executivo Final do CEO & Conselho de Arquitetura</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          A Plataforma Instituto Ser Melhor conclui com êxito absoluto a sua jornada de engenharia (74 Prompts). A plataforma consolida-se como um ecossistema inteligente, autogerido sob supervisão humana, com **score de maturidade global de 98.6/100 (Nível 5)**. Parabéns a toda a equipe executiva e técnica por esta conquista histórica.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEO/CEA Board & Self-Assessment Hub': renderDashboard,
    'Matriz de Maturidade Corporativa': renderMaturityMatrix,
    'Conselho Executivo Digital & Propostas': renderProposals,
    'Motor de Evolução Contínua & Backlog': renderEngine,
    'Validação de Governança & Rastreabilidade': renderTraceability,
    'Planejamento Estratégico de Longo Prazo': renderLongTerm,
    'Painéis Executivos de Autogovernança': renderExecutive,
    'CERTIFICAÇÃO MÁXIMA DA PLATAFORMA': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>👑 EAGSCEP — Enterprise Autonomous Governance, Self-Assessment & Continuous Evolution Platform</h1>
        <p style={styles.sub}>Prompt 074 (Final) · Instituto Ser Melhor v2.0 · TOGAF · COBIT 2019 · ISO 9001 · ISO 27001 · ISO 42001 · Autogovernança Enterprise</p>
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

export default EAGSCEPPage;
