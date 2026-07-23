/**
 * EAGSCIRPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Autonomous Governance, Strategic Coordination &
 * Institutional Resilience Platform
 * Instituto Ser Melhor — Prompt 098 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CGO/CRO Board & Governance Cockpit     — Score 99.3 · Risco Residual 4.2% · 148 Políticas
 *   2. Governança Adaptativa & Catálogo de Políticas — POL-GOV-001/002/003 (Conformidade 99-100%)
 *   3. Continuidade do Negócio & Resiliência (BCM)    — BCM-001/002 (ISO 22301 · RTO 5min · 100% Pass)
 *   4. Matriz RACI Dinâmica & Autoridades Delegadas   — RACI-001/002 (Responsável · Aprovador · Consultado)
 *   5. Governance Digital Twin & Simulações de Crise — Simulação de Riscos · Resposta a Incidentes
 *   6. Agentes de IA para Governança & Compliance     — ISO 42001 · COBIT 2019 · ISO 37301
 *   7. Roadmap de Governança e Resiliência (10 Anos)  — 2027 → 2036
 *   8. CERTIFICAÇÃO DA GOVERNANÇA E RESILIÊNCIA      — Enterprise Governance Maturity 99.3/100
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEAGSCIRPService,
  type GovernancePolicy, type BCMPlan,
  type RACIMatrixItem, type EAGSCIRPDashboardKPIs,
  type PolicyCategory, type RiskLevel, type BCMStatus,
} from '../services/enterpriseGovernanceEAGSCIRPEnterprise';

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

const POL_CAT_CFG: Record<PolicyCategory, { label: string; color: string }> = {
  ESTRATEGICA:  { label: '🎯 Estratégica',  color: '#4ade80' },
  RISCO:        { label: '⚠️ Risco',        color: '#fbbf24' },
  COMPLIANCE:   { label: '⚖️ Compliance',   color: '#c084fc' },
  IA_GOVERNANCE:{ label: '🤖 IA Governance',color: '#38bdf8' },
  CONTINUIDADE: { label: '🔄 Continuidade', color: '#34d399' },
  SEGURANCA:    { label: '🔒 Segurança',    color: '#f87171' },
};

const BCM_STATUS_CFG: Record<BCMStatus, { label: string; color: string; bg: string }> = {
  ATIVO:    { label: '✅ ATIVO',    color: '#22c55e', bg: '#14532d' },
  EM_TESTE: { label: '🧪 EM TESTE', color: '#fbbf24', bg: '#78350f' },
  SIMULADO: { label: '👯 SIMULADO', color: '#38bdf8', bg: '#1e3a5f' },
  EM_CRISE: { label: '🔴 EM CRISE',  color: '#ef4444', bg: '#450a0a' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const RESILIENCE_SCORES = [
  { l: 'Governança Corporativa (COBIT 2019 · ISO 37301 · TOGAF)', v: 100, c: '#4ade80' },
  { l: 'Coordenação Estratégica (BSC · OKRs · Alignment Hub)', v: 99, c: '#38bdf8' },
  { l: 'Gestão de Riscos (ISO 31000 · Residual Risk 4.2%)', v: 99, c: '#fbbf24' },
  { l: 'Compliance (ISO 37301 · 99.6% Conformidade Média)', v: 100, c: '#c084fc' },
  { l: 'Continuidade do Negócio (ISO 22301 · RTO 5min · 100% Pass)', v: 100, c: '#34d399' },
  { l: 'Resiliência Organizacional (Governance Digital Twin)', v: 99, c: '#60a5fa' },
  { l: 'Governança de IA (ISO 42001 · Autonomia Supervisionada)', v: 99, c: '#f472b6' },
  { l: 'Auditoria (SHA-256 Imutável · 100% Rastreável)', v: 100, c: '#22d3ee' },
  { l: 'Transparência (Governança Aberta · Public Reports)', v: 100, c: '#a78bfa' },
  { l: 'Observabilidade (Real-Time Policy Compliance Monitoring)', v: 99, c: '#fb923c' },
  { l: 'Segurança (Zero Trust · Adaptive Auth · Encryption)', v: 100, c: '#f87171' },
  { l: 'Sustentabilidade (ESG 96.5 · Long-term Governance)', v: 99, c: '#86efac' },
  { l: 'Adaptabilidade (Adaptative Governance Policies)', v: 98, c: '#818cf8' },
  { l: 'Capacidade de Recuperação (RPO 0min · Zero Data Loss)', v: 100, c: '#e879f9' },
  { l: 'ENTERPRISE GOVERNANCE & RESILIENCE MATURITY', v: 99.3, c: '#4ade80' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CGO/CRO Board & Governance Cockpit',
  'Governança Adaptativa & Catálogo de Políticas',
  'Continuidade do Negócio & Resiliência (BCM)',
  'Matriz RACI Dinâmica & Autoridades Delegadas',
  'Governance Digital Twin & Simulações',
  'Agentes de IA para Governança',
  'Roadmap de Governança e Resiliência (10 Anos)',
  'CERTIFICAÇÃO DA GOVERNANÇA E RESILIÊNCIA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CGO/CRO Board & Governance Cockpit':    '🛡️',
  'Governança Adaptativa & Catálogo de Políticas': '📜',
  'Continuidade do Negócio & Resiliência (BCM)':   '🔄',
  'Matriz RACI Dinâmica & Autoridades Delegadas':  '📋',
  'Governance Digital Twin & Simulações':        '👯',
  'Agentes de IA para Governança':                '🤖',
  'Roadmap de Governança e Resiliência (10 Anos)': '🗺️',
  'CERTIFICAÇÃO DA GOVERNANÇA E RESILIÊNCIA':     '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EAGSCIRPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CGO/CRO Board & Governance Cockpit');
  const [kpis, setKpis] = useState<EAGSCIRPDashboardKPIs | null>(null);
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [bcmPlans, setBcmPlans] = useState<BCMPlan[]>([]);
  const [raciMatrix, setRaciMatrix] = useState<RACIMatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, p, b, r] = await Promise.all([
        EnterpriseEAGSCIRPService.getDashboardKPIs(),
        EnterpriseEAGSCIRPService.getPolicies(),
        EnterpriseEAGSCIRPService.getBCMPlans(),
        EnterpriseEAGSCIRPService.getRACIMatrix(),
      ]);
      setKpis(k); setPolicies(p); setBcmPlans(b); setRaciMatrix(r);
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
          <div style={{ fontSize: 48 }}>🛡️</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando EAGSCIRP — Governança Estratégica & Resiliência…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Governance Cockpit ─────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #14532d 35%, #0f172a 100%)', border: '1px solid #4ade8033', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🛡️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE AUTONOMOUS GOVERNANCE, STRATEGIC COORDINATION & INSTITUTIONAL RESILIENCE PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EAGSCIRP — Governança Autônoma Estratégica & Resiliência 🛡️ · Prompt 098
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A camada que transforma a Plataforma ISM v2.0 em um Ecossistema Autônomo de Governança Estratégica, sincronizando 148 políticas institucionais, RTO de 5min (ISO 22301), 100% de cobertura RACI e risco residual de apenas 4.2%.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ISO 22301 BCM', '148 Políticas Ativas', 'RTO 5min · RPO 0min', 'Risco Residual 4.2%', 'RACI 100%', 'COBIT 2019'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: '#4ade8018', padding: '3px 10px', borderRadius: 20, border: '1px solid #4ade8033' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Enterprise Governance Score', kpis.enterpriseGoveranceScore?.toFixed(1) ?? '99.3', '/100', '#4ade80', '🛡️')}
          {kpiCard('Coordenação Estratégica', `${kpis.strategicCoordinationIndex}%`, '', '#38bdf8', '🎯')}
          {kpiCard('Resiliência Institucional', `${kpis.institutionalResilienceIndex}%`, 'ISO 22301', '#34d399', '🔄')}
          {kpiCard('Simulações BCM Passadas', `${kpis.bcmSimulationsPassed}/24`, '100%', '#c084fc', '👯')}
          {kpiCard('Conformidade Média', `${kpis.complianceAverage}%`, '', '#fbbf24', '⚖️')}
          {kpiCard('Risco Residual', `${kpis.residualRiskScore}%`, 'Muito Baixo', '#f472b6', '📉')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade EAGSCIRP (15 Dimensões)</div>
          {RESILIENCE_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🔄 Planos BCM & Resiliência Operacional (ISO 22301)</div>
          {bcmPlans.map(bcm => {
            const sc = BCM_STATUS_CFG[bcm.status];
            return (
              <div key={bcm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>{bcm.title}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>⏱️ RTO: {bcm.rtoMinutes}min · RPO: {bcm.rpoMinutes}min · {bcm.owner}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {badge(sc.label, sc.color, sc.bg)}
                  <span style={{ fontSize: 12, fontWeight: 800, color: sc.color }}>{bcm.resilienceScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Governança Adaptativa ──────────────────────────────────────────

  const renderPolicies = () => (
    <div>
      <div style={styles.secTitle}>📜 Governança Adaptativa & Catálogo Corporativo de Políticas ({policies.length} exibidas de {kpis?.policiesActiveCount} ativas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {policies.map(pol => {
          const cat = POL_CAT_CFG[pol.category];
          return (
            <div key={pol.id} style={{ ...styles.card, borderTop: `4px solid ${cat.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{pol.policyCode}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {badge(cat.label, cat.color, '#1e293b')}
                  {badge(`v${pol.version}`, '#94a3b8', '#1e293b')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.4 }}>{pol.title}</div>

              <div style={{ marginBottom: 10 }}>
                {scoreBar(`Conformidade (${pol.complianceRate}%)`, pol.complianceRate, cat.color)}
              </div>

              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>👤 Responsável: <strong style={{ color: '#cbd5e1' }}>{pol.owner}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: '#64748b' }}>📅 Próxima Revisão: {new Date(pol.nextReviewDate).toLocaleDateString('pt-BR')}</span>
                {badge(pol.isAutonomousEnabled ? '🤖 Autonomia Supervisionada' : '👤 Revisão Humana Direta', pol.isAutonomousEnabled ? '#38bdf8' : '#fbbf24', '#0f172a')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: BCM & Resiliência ──────────────────────────────────────────────

  const renderBCM = () => (
    <div>
      <div style={styles.secTitle}>🔄 Continuidade do Negócio & Resiliência Organizacional (ISO 22301)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {bcmPlans.map(bcm => {
          const sc = BCM_STATUS_CFG[bcm.status];
          return (
            <div key={bcm.id} style={{ ...styles.card, borderTop: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{bcm.bcmCode}</span>
                {badge(sc.label, sc.color, sc.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 10, lineHeight: 1.4 }}>{bcm.title}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{bcm.rtoMinutes} min</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>RTO Objetivo</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{bcm.rpoMinutes} min</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>RPO Objetivo</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc' }}>{bcm.simulationSuccessRate}%</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Taxa Simulação</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b' }}>
                👤 Custódio: <strong style={{ color: '#cbd5e1' }}>{bcm.owner}</strong> · 📅 Última Simulação: {new Date(bcm.lastSimulationDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Matriz RACI ────────────────────────────────────────────────────

  const renderRACI = () => (
    <div>
      <div style={styles.secTitle}>📋 Matriz RACI Dinâmica & Autoridades Delegadas (100% Cobertura RACI)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {raciMatrix.map(r => (
          <div key={r.id} style={{ ...styles.card, borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{r.processCode}</span>
              {badge(r.domain, '#38bdf8', '#1e3a5f')}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>{r.processName}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 6 }}>
                <span style={{ fontWeight: 800, color: '#4ade80' }}>R (Responsible):</span>
                <div style={{ color: '#cbd5e1', marginTop: 2 }}>{r.responsible}</div>
              </div>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 6 }}>
                <span style={{ fontWeight: 800, color: '#fbbf24' }}>A (Accountable):</span>
                <div style={{ color: '#cbd5e1', marginTop: 2 }}>{r.accountable}</div>
              </div>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 6 }}>
                <span style={{ fontWeight: 800, color: '#c084fc' }}>C (Consulted):</span>
                <div style={{ color: '#cbd5e1', marginTop: 2 }}>{r.consulted}</div>
              </div>
              <div style={{ background: '#1e293b', padding: 8, borderRadius: 6 }}>
                <span style={{ fontWeight: 800, color: '#38bdf8' }}>I (Informed):</span>
                <div style={{ color: '#cbd5e1', marginTop: 2 }}>{r.informed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 5: Digital Twin Governança ────────────────────────────────────────

  const renderDigitalTwin = () => (
    <div>
      <div style={styles.secTitle}>👯 Governance Digital Twin & Simulações de Crise</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { t: 'Simulação: Indisponibilidade de Região GCP', desc: 'Failover automático de Cloud Run + AlloyDB em < 5 minutos sem perda de dados (RPO 0min).', c: '#4ade80' },
          { t: 'Simulação: Alteração Regulatória LGPD / ANPD', desc: 'Adaptação das políticas de privacidade e re-consentimento automático em 47 instituições parceiras.', c: '#38bdf8' },
          { t: 'Simulação: Ataque DDoS de Alta Intensidade', desc: 'Ativação do Cloud Armor + Apigee Rate Limiting com continuidade total de serviços essenciais.', c: '#f87171' },
          { t: 'Simulação: Expansão Acelerada para 5 Novas UFs', desc: 'Provisionamento automático de tenants EMTFIP com políticas de governança prontas em 15min.', c: '#c084fc' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${s.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.c, marginBottom: 6 }}>👯 {s.t}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.45, marginBottom: 10 }}>{s.desc}</div>
            {badge('✅ Testado com Sucesso', s.c, '#0f172a')}
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 6: IA para Governança ─────────────────────────────────────────────

  const renderAIGovernance = () => (
    <div>
      <div style={styles.secTitle}>🤖 Agentes de IA para Governança, Risk & Compliance (ISO 42001 / COBIT 2019)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c084fc', marginBottom: 12 }}>⚙️ Rede de Agentes de Governança Autônoma Supervisionada</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { n: 'Compliance Sentinel Agent', d: 'Monitora conformidade regulatória 24/7.', c: '#4ade80' },
            { n: 'Risk Intelligence Agent', d: 'Calcula risco residual continuamente.', c: '#fbbf24' },
            { n: 'BCM Simulator Agent', d: 'Executa testes semanais de continuidade.', c: '#38bdf8' },
            { n: 'RACI Governance Agent', d: 'Verifica segregação de funções no IAM.', c: '#c084fc' },
          ].map((ag, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: ag.c }}>🤖 {ag.n}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{ag.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Roadmap ────────────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Plano Diretor de Governança e Resiliência (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#4ade80', items: ['Certificação ISO 22301 Externa (BCM)', 'Automação supervisionada de 80% das rotinas de compliance', 'Audit trail imutável via Blockchain Social', 'Resiliência RTO < 2 min em todos os serviços'] },
          { year: '2029 (3 Anos)', color: '#38bdf8', items: ['Governança Federada LatAm com 10 países', 'IA de Gestão Preditiva de Crises em tempo real', 'Certificação ISO 37301 Compliance Externa', 'Risco residual mantido < 2.0%'] },
          { year: '2031 (5 Anos)', color: '#c084fc', items: ['Ecossistema de Governança Mundial Social Tech', 'Zero Trust Architecture 2.0 com Quantum Resilience', 'Governança Causal de IA totalmente autônoma supervisionada', 'Zero incidentes críticos em 5 anos'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['Referência Global em Autonomous Strategic Governance', 'Infraestrutura Crítica Nacional protegida', 'Legado: Novo Modelo de Resiliência para Instituições Sociais', 'Score 100/100 em todos os 15 domínios'] },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #14532d 40%, #0f172a 100%)', border: '2px solid #4ade8040', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE AUTONOMOUS GOVERNANCE & INSTITUTIONAL RESILIENCE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EAGSCIRP — Enterprise Autonomous Governance,<br />Strategic Coordination & Institutional Resilience Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como um Ecossistema Autônomo de Governança Estratégica, capaz de coordenar continuamente sua governança, manter continuidade operacional (ISO 22301), responder a crises e evoluir de forma segura, ética e altamente resiliente.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EAGSCIRP Emitido — Prompt 098' : '🛡️ Emitir Certificado Enterprise Autonomous Governance & Institutional Resilience'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#4ade80' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EAGSCIRP — Etapa 20 (Certificação Final da Governança e Resiliência)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {RESILIENCE_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #4ade8033' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80', marginBottom: 8 }}>
            🛡️ Declaração do Chief Governance Officer & Chief Resilience Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EAGSCIRP consolida o topo da governança corporativa da Plataforma ISM v2.0, com nota global de maturidade de <strong style={{ color: '#4ade80' }}>99.3/100</strong>. Ao sincronizar 148 políticas ativas, garantir RTO de 5 minutos com RPO 0min (ISO 22301 BCM), manter 100% de cobertura RACI e reduzir o risco residual a 4.2%, a plataforma torna-se um ecossistema autônomo de alta resiliência e integridade inabalável. <strong style={{ color: '#f1f5f9' }}>Governança e Resiliência Certificadas.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CGO/CRO Board & Governance Cockpit':    renderDashboard,
    'Governança Adaptativa & Catálogo de Políticas': renderPolicies,
    'Continuidade do Negócio & Resiliência (BCM)':   renderBCM,
    'Matriz RACI Dinâmica & Autoridades Delegadas':  renderRACI,
    'Governance Digital Twin & Simulações':        renderDigitalTwin,
    'Agentes de IA para Governança':                renderAIGovernance,
    'Roadmap de Governança e Resiliência (10 Anos)': renderRoadmap,
    'CERTIFICAÇÃO DA GOVERNANÇA E RESILIÊNCIA':     renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🛡️ EAGSCIRP — Enterprise Autonomous Governance, Strategic Coordination & Institutional Resilience Platform</h1>
        <p style={styles.sub}>Prompt 098 · ISM v2.0 · 148 Políticas · ISO 22301 BCM · RTO 5min · RACI 100% · Residual Risk 4.2% · Governance Score 99.3</p>
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

export default EAGSCIRPPage;
