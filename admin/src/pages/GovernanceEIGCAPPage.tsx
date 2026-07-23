/**
 * GovernanceEIGCAPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Governance, Compliance & Accountability Platform
 * Instituto Ser Melhor — Prompt 065 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CGO Board & Governance Hub  — Dashboard: Score 97.8/100, compliance 98.1%, 87 controles ativos
 *   2. Estrutura de Governança           — Órgãos, competências, responsabilidades e limites decisórios
 *   3. Gestão de Políticas               — Repositório corporativo de políticas, normas e códigos
 *   4. Compliance & Conformidade         — Obrigações regulatórias, frameworks (ISO 37301, LGPD, OSCIP)
 *   5. Gestão de Riscos                  — Matriz COSO/ISO 31000, riscos críticos e planos de mitigação
 *   6. Controles Internos & Auditoria    — CTRs segregados, auditorias planejadas e achados
 *   7. Accountability & Transparência    — Prestação de contas, relatórios públicos e indicadores
 *   8. CERTIFICAÇÃO EIGCAP FINAL        — Parecer executivo e roadmap de governança 5 anos
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import {
  EnterpriseEIGCAPService,
  type GovernanceOrgan, type InstitutionalPolicy, type InstitutionalRisk,
  type ComplianceObligation, type InternalControl, type InternalAudit,
  type AccountabilityRecord, type EIGCAPDashboardKPIs,
  type GovernanceOrganType, type PolicyStatus, type RiskLevel, type ComplianceStatus,
  type ControlType, type AuditStatus,
} from '../services/governanceEIGCAPEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6 }}>{text}</span>
);

const kpiCard = (label: string, value: string | number, unit: string, color: string, icon: string) => (
  <div style={{ background: '#0f172a', border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{value}<span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>{unit}</span></div>
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

// ── Tab Configs ───────────────────────────────────────────────────────────────

const TABS = [
  'Torre CGO Board & Governance Hub',
  'Estrutura de Governança',
  'Gestão de Políticas',
  'Compliance & Conformidade',
  'Gestão de Riscos',
  'Controles Internos & Auditoria',
  'Accountability & Transparência',
  'CERTIFICAÇÃO EIGCAP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CGO Board & Governance Hub': '🏛️',
  'Estrutura de Governança': '🏗️',
  'Gestão de Políticas': '📋',
  'Compliance & Conformidade': '✅',
  'Gestão de Riscos': '⚠️',
  'Controles Internos & Auditoria': '🔍',
  'Accountability & Transparência': '📜',
  'CERTIFICAÇÃO EIGCAP FINAL': '🏆',
};

// ── Badge maps ────────────────────────────────────────────────────────────────

const ORGAN_TYPE_CONFIG: Record<GovernanceOrganType, { label: string; color: string; bg: string }> = {
  ASSEMBLEIA_GERAL:      { label: 'ASSEMBLEIA GERAL', color: '#7c3aed', bg: '#f3e8ff' },
  CONSELHO_DELIBERATIVO: { label: 'CONSELHO DELIBERATIVO', color: '#1d4ed8', bg: '#dbeafe' },
  CONSELHO_FISCAL:       { label: 'CONSELHO FISCAL', color: '#0369a1', bg: '#e0f2fe' },
  DIRETORIA_EXECUTIVA:   { label: 'DIRETORIA EXECUTIVA', color: '#059669', bg: '#d1fae5' },
  COMITE_PERMANENTE:     { label: 'COMITÊ PERMANENTE', color: '#d97706', bg: '#fef3c7' },
  COMITE_TEMPORARIO:     { label: 'COMITÊ TEMPORÁRIO', color: '#9ca3af', bg: '#f3f4f6' },
  PRESIDENCIA:           { label: 'PRESIDÊNCIA', color: '#b91c1c', bg: '#fee2e2' },
  SUPERINTENDENCIA:      { label: 'SUPERINTENDÊNCIA', color: '#dc2626', bg: '#fef2f2' },
  COORDENACAO:           { label: 'COORDENAÇÃO', color: '#0891b2', bg: '#cffafe' },
  AREA_OPERACIONAL:      { label: 'ÁREA OPERACIONAL', color: '#6b7280', bg: '#f9fafb' },
};

const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  CRITICO:    { label: '🔴 CRÍTICO', color: '#dc2626', bg: '#fee2e2' },
  ALTO:       { label: '🟠 ALTO', color: '#d97706', bg: '#fef3c7' },
  MEDIO:      { label: '🟡 MÉDIO', color: '#ca8a04', bg: '#fefce8' },
  BAIXO:      { label: '🟢 BAIXO', color: '#16a34a', bg: '#dcfce7' },
  NEGLIGIVEL: { label: '⚪ NEGLIGÍVEL', color: '#9ca3af', bg: '#f3f4f6' },
};

const COMPLIANCE_STATUS_CONFIG: Record<ComplianceStatus, { label: string; color: string; bg: string }> = {
  CONFORME:                { label: '✅ CONFORME', color: '#059669', bg: '#d1fae5' },
  NAO_CONFORME:            { label: '❌ NÃO CONFORME', color: '#dc2626', bg: '#fee2e2' },
  PARCIALMENTE_CONFORME:   { label: '⚠️ PARCIAL', color: '#d97706', bg: '#fef3c7' },
  EM_AVALIACAO:            { label: '🔄 EM AVALIAÇÃO', color: '#2563eb', bg: '#dbeafe' },
};

const CONTROL_TYPE_CONFIG: Record<ControlType, { label: string; color: string }> = {
  PREVENTIVO: { label: '🛡️ PREVENTIVO', color: '#059669' },
  DETECTIVO:  { label: '🔍 DETECTIVO', color: '#2563eb' },
  CORRETIVO:  { label: '🔧 CORRETIVO', color: '#d97706' },
};

const POLICY_STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; bg: string }> = {
  VIGENTE:     { label: '✅ VIGENTE', color: '#059669', bg: '#d1fae5' },
  EM_REVISAO:  { label: '🔄 EM REVISÃO', color: '#2563eb', bg: '#dbeafe' },
  OBSOLETA:    { label: '⚫ OBSOLETA', color: '#6b7280', bg: '#f3f4f6' },
  PROPOSTA:    { label: '📝 PROPOSTA', color: '#7c3aed', bg: '#f3e8ff' },
  APROVADA:    { label: '✔️ APROVADA', color: '#d97706', bg: '#fef3c7' },
};

const AUDIT_STATUS_CONFIG: Record<AuditStatus, { label: string; color: string; bg: string }> = {
  PLANEJADA:    { label: '📅 PLANEJADA', color: '#7c3aed', bg: '#f3e8ff' },
  EM_ANDAMENTO: { label: '⚙️ EM ANDAMENTO', color: '#2563eb', bg: '#dbeafe' },
  CONCLUIDA:    { label: '✅ CONCLUÍDA', color: '#059669', bg: '#d1fae5' },
  SUSPENSA:     { label: '⏸️ SUSPENSA', color: '#d97706', bg: '#fef3c7' },
};

// ── Main Component ────────────────────────────────────────────────────────────

export function GovernanceEIGCAPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CGO Board & Governance Hub');
  const [kpis, setKpis] = useState<EIGCAPDashboardKPIs | null>(null);
  const [organs, setOrgans] = useState<GovernanceOrgan[]>([]);
  const [policies, setPolicies] = useState<InstitutionalPolicy[]>([]);
  const [risks, setRisks] = useState<InstitutionalRisk[]>([]);
  const [compliance, setCompliance] = useState<ComplianceObligation[]>([]);
  const [controls, setControls] = useState<InternalControl[]>([]);
  const [audits, setAudits] = useState<InternalAudit[]>([]);
  const [accountability, setAccountability] = useState<AccountabilityRecord[]>([]);
  const [aiRecs, setAiRecs] = useState<Awaited<ReturnType<typeof EnterpriseEIGCAPService.getAIGovernanceRecommendations>>>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, o, p, r, c, ctrl, a, acc, ai] = await Promise.all([
        EnterpriseEIGCAPService.getDashboardKPIs(),
        EnterpriseEIGCAPService.getGovernanceOrgans(),
        EnterpriseEIGCAPService.getInstitutionalPolicies(),
        EnterpriseEIGCAPService.getInstitutionalRisks(),
        EnterpriseEIGCAPService.getComplianceObligations(),
        EnterpriseEIGCAPService.getInternalControls(),
        EnterpriseEIGCAPService.getInternalAudits(),
        EnterpriseEIGCAPService.getAccountabilityRecords(),
        EnterpriseEIGCAPService.getAIGovernanceRecommendations(),
      ]);
      setKpis(k); setOrgans(o); setPolicies(p); setRisks(r);
      setCompliance(c); setControls(ctrl); setAudits(a);
      setAccountability(acc); setAiRecs(ai);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    container: { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    header: { marginBottom: 24 } as React.CSSProperties,
    title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab: (active: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      background: active ? '#1e293b' : 'transparent',
      color: active ? '#f8fafc' : '#64748b',
      border: active ? '1px solid #334155' : '1px solid transparent',
      borderBottom: active ? '1px solid #1e293b' : '1px solid transparent',
      transition: 'all 0.2s', display: 'flex', gap: 6, alignItems: 'center',
    }),
    section: { marginBottom: 32 } as React.CSSProperties,
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } as React.CSSProperties,
    card: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    darkCard: { background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 16 } as React.CSSProperties,
    rowFlex: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td: { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
    label: { fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 } as React.CSSProperties,
    value: { fontSize: 14, color: '#e2e8f0', fontWeight: 600 } as React.CSSProperties,
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>🏛️</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Carregando EIGCAP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%, #1a1a2e 100%)', border: '1px solid #1d4ed833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 160, opacity: 0.04, lineHeight: 1 }}>🏛️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE INSTITUTIONAL GOVERNANCE, COMPLIANCE & ACCOUNTABILITY PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
          EIGCAP — Torre do Chief Governance Officer 🏛️
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 700, lineHeight: 1.6 }}>
          Plataforma corporativa de Governança, Compliance e Accountability — integrando órgãos, políticas, riscos,
          controles, auditorias e transparência em um único modelo auditável, orientado por dados e certificado ISO 37000/37301.
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'ISO 37000', color: '#3b82f6' }, { label: 'ISO 37301', color: '#8b5cf6' },
            { label: 'ISO 31000', color: '#10b981' }, { label: 'COSO ERM', color: '#f59e0b' },
            { label: 'COBIT 2019', color: '#06b6d4' }, { label: 'ISO 42001', color: '#ec4899' },
            { label: 'LGPD', color: '#84cc16' }, { label: 'OSCIP', color: '#f97316' },
          ].map(f => (
            <span key={f.label} style={{ fontSize: 10, fontWeight: 700, color: f.color, background: f.color + '18', padding: '3px 10px', borderRadius: 20, border: `1px solid ${f.color}33` }}>{f.label}</span>
          ))}
        </div>
      </div>

      {/* KPI Row 1 */}
      <div style={styles.rowFlex}>
        {kpis && <>
          {kpiCard('Score Global Governança', kpis.globalGovernanceScore.toFixed(1), '/100', '#60a5fa', '🏛️')}
          {kpiCard('Índice de Compliance', kpis.complianceIndex.toFixed(1), '%', '#34d399', '✅')}
          {kpiCard('Maturidade Governança', kpis.governanceMaturity.toFixed(1), '/100', '#a78bfa', '📊')}
          {kpiCard('Score Ética & Integridade', kpis.ethicsIndex.toFixed(1), '/100', '#fb923c', '⚖️')}
          {kpiCard('Transparência Institucional', kpis.transparencyScore.toFixed(1), '%', '#38bdf8', '📜')}
        </>}
      </div>

      {/* KPI Row 2 */}
      <div style={styles.rowFlex}>
        {kpis && <>
          {kpiCard('Riscos Mitigados', kpis.risksMitigated, '%', '#f87171', '⚠️')}
          {kpiCard('Controles Ativos', kpis.activeControls, 'ctrls', '#4ade80', '🔍')}
          {kpiCard('Auditorias Concluídas', kpis.auditsConcluded, 'audits', '#fbbf24', '🔎')}
          {kpiCard('NC Tratadas', kpis.nonConformitiesTreated, '%', '#c084fc', '🛡️')}
          {kpiCard('Recom. IA Ativas', kpis.aiComplianceRecommendations, 'recs', '#67e8f9', '🤖')}
        </>}
      </div>

      {/* Maturity Scores Grid */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade por Domínio</div>
          {[
            { label: 'Governança Corporativa', value: 97, color: '#60a5fa' },
            { label: 'Compliance Institucional', value: 98, color: '#34d399' },
            { label: 'Gestão de Riscos', value: 95, color: '#f87171' },
            { label: 'Controles Internos', value: 96, color: '#a78bfa' },
            { label: 'Auditoria Interna', value: 94, color: '#fbbf24' },
            { label: 'Accountability', value: 98, color: '#38bdf8' },
            { label: 'Transparência', value: 98, color: '#4ade80' },
            { label: 'Ética e Integridade', value: 99, color: '#fb923c' },
          ].map(s => scoreBar(s.label, s.value, s.color))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade Avançados</div>
          {[
            { label: 'Gestão de Políticas', value: 97, color: '#c084fc' },
            { label: 'Conformidade Regulatória', value: 98, color: '#67e8f9' },
            { label: 'Governança Digital', value: 96, color: '#86efac' },
            { label: 'Governança da IA', value: 91, color: '#fda4af' },
            { label: 'Sustentabilidade Institucional', value: 95, color: '#fed7aa' },
            { label: 'Excelência Organizacional', value: 97, color: '#d8b4fe' },
            { label: 'Maturidade Global de Governança', value: 97, color: '#60a5fa' },
            { label: 'Score EIGCAP Final', value: 97, color: '#34d399' },
          ].map(s => scoreBar(s.label, s.value, s.color))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div style={{ ...styles.card, marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🤖 Inteligência Artificial — Recomendações de Governança</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {aiRecs.map(rec => (
            <div key={rec.id} style={{ background: '#1e293b', borderRadius: 10, padding: '14px 16px', borderLeft: `4px solid ${rec.priority === 'ALTA' ? '#f87171' : rec.priority === 'MEDIA' ? '#fbbf24' : '#4ade80'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{rec.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {badge(rec.priority, rec.priority === 'ALTA' ? '#dc2626' : rec.priority === 'MEDIA' ? '#d97706' : '#16a34a', rec.priority === 'ALTA' ? '#fee2e2' : rec.priority === 'MEDIA' ? '#fef3c7' : '#dcfce7')}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Confiança: {rec.confidence}%</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{rec.description}</div>
              <div style={{ fontSize: 12, color: '#38bdf8' }}>→ {rec.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Estrutura de Governança ───────────────────────────────────────

  const renderGovernanceStructure = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🏗️ Órgãos de Governança Institucional</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {organs.map(organ => {
            const cfg = ORGAN_TYPE_CONFIG[organ.type];
            return (
              <div key={organ.id} style={{ ...styles.card, borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{organ.name}</div>
                  {badge(cfg.label, cfg.color, cfg.bg)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{organ.description}</div>
                <div style={styles.grid2}>
                  <div><div style={styles.label}>Membros</div><div style={styles.value}>{organ.members}</div></div>
                  <div><div style={styles.label}>Frequência</div><div style={styles.value}>{organ.meetingFrequency}</div></div>
                  <div><div style={styles.label}>Quórum</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{organ.quorum}</div></div>
                  <div>
                    <div style={styles.label}>Maturidade</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: '#1e293b', borderRadius: 4 }}>
                        <div style={{ width: `${organ.maturityScore}%`, height: 6, background: '#34d399', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{organ.maturityScore}/100</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={styles.label}>Limite Decisório</div>
                  <div style={{ fontSize: 11, color: '#60a5fa' }}>{organ.decisionLimits}</div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={styles.label}>Competências Principais</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {organ.competencies.slice(0, 3).map((c, i) => (
                      <span key={i} style={{ fontSize: 10, background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 4 }}>{c}</span>
                    ))}
                  </div>
                </div>
                {organ.reportingTo && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>↑ Reporta a: {organ.reportingTo}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance Matrix */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📊 Matriz de Governança — Mapa de Responsabilidades</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Órgão</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Membros</th>
                <th style={styles.th}>Frequência</th>
                <th style={styles.th}>Limite Decisório</th>
                <th style={styles.th}>Maturidade</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {organs.map(o => {
                const cfg = ORGAN_TYPE_CONFIG[o.type];
                return (
                  <tr key={o.id}>
                    <td style={{ ...styles.td, fontWeight: 600, color: '#f1f5f9' }}>{o.name}</td>
                    <td style={styles.td}>{badge(cfg.label, cfg.color, cfg.bg)}</td>
                    <td style={styles.td}>{o.members}</td>
                    <td style={styles.td}>{o.meetingFrequency}</td>
                    <td style={{ ...styles.td, fontSize: 11, color: '#60a5fa' }}>{o.decisionLimits}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 5, background: '#1e293b', borderRadius: 3 }}>
                          <div style={{ width: `${o.maturityScore}%`, height: 5, background: '#34d399', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>{o.maturityScore}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{badge(o.isActive ? 'ATIVO' : 'INATIVO', o.isActive ? '#059669' : '#6b7280', o.isActive ? '#d1fae5' : '#f3f4f6')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── TAB 3: Gestão de Políticas ───────────────────────────────────────────

  const renderPolicies = () => (
    <div>
      <div style={{ ...styles.rowFlex, marginBottom: 20 }}>
        {kpis && <>
          {kpiCard('Total de Políticas', kpis.totalPolicies, 'docs', '#60a5fa', '📋')}
          {kpiCard('Políticas Vigentes', policies.filter(p => p.status === 'VIGENTE').length, 'ativas', '#34d399', '✅')}
          {kpiCard('Em Revisão', policies.filter(p => p.status === 'EM_REVISAO').length, 'docs', '#fbbf24', '🔄')}
          {kpiCard('Frameworks Cobertos', 8, 'normas', '#a78bfa', '🌐')}
        </>}
      </div>

      <div style={styles.sectionTitle}>📋 Repositório Corporativo de Políticas Institucionais</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {policies.map(policy => {
          const sc = POLICY_STATUS_CONFIG[policy.status];
          return (
            <div key={policy.id} style={{ ...styles.card, borderLeft: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>{policy.code}</span>
                    {badge(sc.label, sc.color, sc.bg)}
                    {badge(`v${policy.version}`, '#64748b', '#1e293b')}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{policy.title}</div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', minWidth: 120 }}>
                  <div>Vigência: {policy.effectiveDate}</div>
                  <div>Revisão: {policy.reviewDate}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{policy.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                <div><div style={styles.label}>Responsável</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{policy.responsible}</div></div>
                <div><div style={styles.label}>Aprovado por</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{policy.approvedBy}</div></div>
                <div><div style={styles.label}>Aprovação</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{policy.approvalDate}</div></div>
                <div><div style={styles.label}>Categoria</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{policy.category.replace('_', ' ')}</div></div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={styles.label}>Frameworks de Compliance</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {policy.complianceFrameworks.map((f, i) => (
                    <span key={i} style={{ fontSize: 10, background: '#1d4ed818', color: '#60a5fa', padding: '2px 8px', borderRadius: 10, border: '1px solid #1d4ed833' }}>{f}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>🔐 {policy.hash}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Compliance ────────────────────────────────────────────────────

  const renderCompliance = () => (
    <div>
      <div style={{ ...styles.rowFlex, marginBottom: 20 }}>
        {kpis && <>
          {kpiCard('Índice Compliance', kpis.complianceIndex.toFixed(1), '%', '#34d399', '✅')}
          {kpiCard('Obrigações Monitoradas', kpis.totalObligations, 'reqs', '#60a5fa', '📋')}
          {kpiCard('Conformes', compliance.filter(c => c.status === 'CONFORME').length, 'ok', '#4ade80', '🟢')}
          {kpiCard('NC Tratadas', kpis.nonConformitiesTreated, '%', '#f87171', '⚠️')}
        </>}
      </div>

      <div style={styles.sectionTitle}>✅ Obrigações de Compliance — Frameworks Regulatórios</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {compliance.map(obl => {
          const sc = COMPLIANCE_STATUS_CONFIG[obl.status];
          const maturityColors = ['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#22c55e', '#10b981'];
          return (
            <div key={obl.id} style={{ ...styles.card, borderTop: `3px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    {badge(obl.framework, '#7c3aed', '#f3e8ff')}
                    {badge(sc.label, sc.color, sc.bg)}
                    <span style={{ fontSize: 11, color: '#64748b' }}>Maturidade CMMI: {obl.maturityLevel}/5</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{obl.title}</div>
                </div>
                <div>
                  {/* Maturity indicator */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(l => (
                      <div key={l} style={{ width: 14, height: 14, borderRadius: 3, background: l <= obl.maturityLevel ? maturityColors[l] : '#1e293b' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{obl.requirement}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                <div><div style={styles.label}>Responsável</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{obl.responsible}</div></div>
                <div><div style={styles.label}>Última Avaliação</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{obl.lastAssessment}</div></div>
                <div><div style={styles.label}>Prazo</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{obl.deadline}</div></div>
              </div>
              <div style={{ marginBottom: obl.nonConformities.length > 0 ? 10 : 0 }}>
                <div style={styles.label}>Evidências</div>
                <div style={{ fontSize: 11, color: '#60a5fa', fontStyle: 'italic' }}>{obl.evidence}</div>
              </div>
              {obl.nonConformities.length > 0 && (
                <div style={{ background: '#fee2e210', border: '1px solid #f8717130', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠️ Não Conformidades</div>
                  {obl.nonConformities.map(nc => (
                    <div key={nc.id} style={{ background: '#0f172a', borderRadius: 6, padding: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>{nc.id}: {nc.description}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>📋 {nc.actionPlan}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {badge(nc.status, '#2563eb', '#dbeafe')}
                        <span style={{ fontSize: 11, color: '#64748b' }}>Prazo: {nc.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Gestão de Riscos ──────────────────────────────────────────────

  const renderRisks = () => (
    <div>
      <div style={{ ...styles.rowFlex, marginBottom: 20 }}>
        {kpis && <>
          {kpiCard('Riscos Mapeados', kpis.totalRisks, 'rsks', '#60a5fa', '⚠️')}
          {kpiCard('Riscos Críticos', risks.filter(r => r.level === 'CRITICO').length, 'crit', '#f87171', '🔴')}
          {kpiCard('Riscos Altos', risks.filter(r => r.level === 'ALTO').length, 'alto', '#fbbf24', '🟠')}
          {kpiCard('Riscos Mitigados', kpis.risksMitigated, '%', '#34d399', '✅')}
          {kpiCard('Em Monitoramento', risks.filter(r => r.status === 'MONITORADO').length, 'rsks', '#a78bfa', '👁️')}
        </>}
      </div>

      {/* Risk Matrix */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🗺️ Matriz de Riscos — COSO ERM / ISO 31000</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: 2, marginBottom: 20 }}>
            <div style={{ color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', padding: 8 }}>Prob↓ / Impact→</div>
            {['1 Mín', '2 Baixo', '3 Médio', '4 Alto', '5 Máx'].map(h => (
              <div key={h} style={{ background: '#0f172a', textAlign: 'center', padding: 8, fontSize: 11, color: '#94a3b8', borderRadius: 4 }}>{h}</div>
            ))}
            {[5,4,3,2,1].map(prob => (
              <React.Fragment key={prob}>
                <div style={{ background: '#0f172a', display: 'flex', alignItems: 'center', padding: '8px 12px', fontSize: 11, color: '#94a3b8', borderRadius: 4 }}>{prob} — {prob === 5 ? 'Quase certo' : prob === 4 ? 'Provável' : prob === 3 ? 'Possível' : prob === 2 ? 'Improvável' : 'Raro'}</div>
                {[1,2,3,4,5].map(imp => {
                  const score = prob * imp;
                  const color = score >= 16 ? '#dc2626' : score >= 10 ? '#d97706' : score >= 5 ? '#ca8a04' : '#16a34a';
                  const bg = score >= 16 ? '#fee2e2' : score >= 10 ? '#fef3c7' : score >= 5 ? '#fefce8' : '#dcfce7';
                  const risksHere = risks.filter(r => r.probability === prob && r.impact === imp);
                  return (
                    <div key={imp} style={{ background: color + '20', border: `1px solid ${color}40`, borderRadius: 4, padding: 6, minHeight: 50, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color, textAlign: 'right' }}>{score}</div>
                      {risksHere.map(r => (
                        <div key={r.id} style={{ fontSize: 8, background: color + '30', color, padding: '1px 4px', borderRadius: 2, lineHeight: 1.3 }}>{r.code}</div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Cards */}
      <div style={styles.sectionTitle}>📋 Catálogo de Riscos Institucionais</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {risks.map(risk => {
          const cfg = RISK_LEVEL_CONFIG[risk.level];
          const trendIcon = risk.trend === 'CRESCENTE' ? '📈' : risk.trend === 'DECRESCENTE' ? '📉' : '➡️';
          return (
            <div key={risk.id} style={{ ...styles.card, borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace' }}>{risk.code}</span>
                    {badge(cfg.label, cfg.color, cfg.bg)}
                    {badge(risk.category, '#2563eb', '#dbeafe')}
                    <span style={{ fontSize: 12 }}>{trendIcon}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{risk.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: cfg.color }}>{risk.riskScore}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Risk Score</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>P:{risk.probability} × I:{risk.impact}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{risk.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                <div><div style={styles.label}>Responsável</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{risk.responsible}</div></div>
                <div><div style={styles.label}>Risco Residual</div><div style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{risk.residualRisk} pts</div></div>
                <div><div style={styles.label}>Última Revisão</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{risk.lastReview}</div></div>
                <div><div style={styles.label}>Próxima Revisão</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{risk.nextReview}</div></div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>🛡️ Plano de Mitigação</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>{risk.mitigationPlan}</div>
              </div>
              <div>
                <div style={styles.label}>Controles Associados</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {risk.controls.map((c, i) => <span key={i} style={{ fontSize: 10, background: '#1e293b', color: '#60a5fa', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{c}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 6: Controles & Auditoria ─────────────────────────────────────────

  const renderControlsAudit = () => (
    <div>
      {/* Controls Section */}
      <div style={styles.section}>
        <div style={{ ...styles.rowFlex, marginBottom: 16 }}>
          {kpiCard('Controles Ativos', controls.filter(c => c.isActive).length, 'ctrs', '#34d399', '🔍')}
          {kpiCard('Automatizados', controls.filter(c => c.automationLevel === 'AUTOMATIZADO').length, 'auto', '#60a5fa', '🤖')}
          {kpiCard('Efetividade Média', Math.round(controls.reduce((a, c) => a + c.effectiveness, 0) / (controls.length || 1)), '%', '#a78bfa', '📊')}
          {kpiCard('Com Segregação', controls.filter(c => c.segregationOfDuties).length, 'ctrs', '#fbbf24', '🔐')}
        </div>
        <div style={styles.sectionTitle}>🔍 Controles Internos — COSO / COBIT 2019</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {controls.map(ctrl => {
            const cfg = CONTROL_TYPE_CONFIG[ctrl.type];
            return (
              <div key={ctrl.id} style={{ ...styles.card, borderTop: `3px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace' }}>{ctrl.code}</span>
                      {badge(cfg.label, cfg.color, '#00000020')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{ctrl.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: ctrl.effectiveness >= 95 ? '#34d399' : ctrl.effectiveness >= 85 ? '#fbbf24' : '#f87171' }}>{ctrl.effectiveness}%</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>Efetividade</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, lineHeight: 1.5 }}>{ctrl.description}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  <div><div style={styles.label}>Processo</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{ctrl.process}</div></div>
                  <div><div style={styles.label}>Frequência</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{ctrl.frequency}</div></div>
                  <div><div style={styles.label}>Automação</div><div style={{ fontSize: 11, color: '#60a5fa' }}>{ctrl.automationLevel.replace('_', ' ')}</div></div>
                  <div><div style={styles.label}>Segregação Funções</div><div style={{ fontSize: 11, color: ctrl.segregationOfDuties ? '#34d399' : '#94a3b8' }}>{ctrl.segregationOfDuties ? '✅ Sim' : '⚠️ Não'}</div></div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: '#1e293b', borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${ctrl.effectiveness}%`, background: ctrl.effectiveness >= 95 ? '#34d399' : ctrl.effectiveness >= 85 ? '#fbbf24' : '#f87171', borderRadius: 2, transition: 'width 0.8s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audits Section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>🔎 Centro de Auditoria Interna — CAE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {audits.map(audit => {
            const sc = AUDIT_STATUS_CONFIG[audit.status];
            return (
              <div key={audit.id} style={{ ...styles.card, borderLeft: `4px solid ${sc.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace' }}>{audit.code}</span>
                      {badge(sc.label, sc.color, sc.bg)}
                      {badge(audit.type, '#7c3aed', '#f3e8ff')}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{audit.title}</div>
                  </div>
                  {badge(audit.overallRating.replace('_', ' '), audit.overallRating === 'SATISFATORIO' ? '#059669' : audit.overallRating === 'PARCIALMENTE_SATISFATORIO' ? '#d97706' : '#dc2626', audit.overallRating === 'SATISFATORIO' ? '#d1fae5' : audit.overallRating === 'PARCIALMENTE_SATISFATORIO' ? '#fef3c7' : '#fee2e2')}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{audit.scope}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                  <div><div style={styles.label}>Responsável</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{audit.responsible}</div></div>
                  <div><div style={styles.label}>Início Planejado</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{audit.plannedStart}</div></div>
                  <div><div style={styles.label}>Fim Planejado</div><div style={{ fontSize: 11, color: '#e2e8f0' }}>{audit.plannedEnd}</div></div>
                  <div><div style={styles.label}>Achados</div><div style={{ fontSize: 12, fontWeight: 700, color: audit.findings.length > 0 ? '#fbbf24' : '#34d399' }}>{audit.findings.length} {audit.findings.length === 1 ? 'achado' : 'achados'}</div></div>
                </div>
                {audit.findings.length > 0 && (
                  <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>📌 Achados de Auditoria</div>
                    {audit.findings.map(f => (
                      <div key={f.id} style={{ background: '#0f172a', borderRadius: 6, padding: 10, marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{f.id}: {f.description}</span>
                          {badge(f.severity, f.severity === 'CRITICA' ? '#dc2626' : f.severity === 'ALTA' ? '#d97706' : f.severity === 'MEDIA' ? '#ca8a04' : '#16a34a', f.severity === 'CRITICA' ? '#fee2e2' : f.severity === 'ALTA' ? '#fef3c7' : f.severity === 'MEDIA' ? '#fefce8' : '#dcfce7')}
                        </div>
                        <div style={{ fontSize: 11, color: '#60a5fa', marginBottom: 4 }}>💡 {f.recommendation}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {badge(f.status, '#2563eb', '#dbeafe')}
                          <span style={{ fontSize: 11, color: '#64748b' }}>Prazo: {f.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>🔐 {audit.reportHash}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Accountability & Transparência ────────────────────────────────

  const renderAccountability = () => (
    <div>
      <div style={{ ...styles.rowFlex, marginBottom: 20 }}>
        {kpis && <>
          {kpiCard('Score Transparência', kpis.transparencyScore.toFixed(1), '%', '#38bdf8', '📜')}
          {kpiCard('Relatórios Publicados', kpis.totalAccountabilityRecords, 'docs', '#60a5fa', '📊')}
          {kpiCard('Documentos Públicos', accountability.filter(a => a.isPublic).length, 'docs', '#34d399', '🌐')}
          {kpiCard('KPIs Monitorados', accountability.reduce((acc, a) => acc + a.kpis.length, 0), 'kpis', '#a78bfa', '📈')}
        </>}
      </div>

      <div style={styles.sectionTitle}>📜 Registros de Accountability e Transparência Institucional</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {accountability.map(rec => (
          <div key={rec.id} style={{ ...styles.card, borderTop: '3px solid #38bdf8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  {badge(rec.type.replace(/_/g, ' '), '#0369a1', '#e0f2fe')}
                  {badge(`Período: ${rec.period}`, '#7c3aed', '#f3e8ff')}
                  {rec.isPublic && badge('🌐 PÚBLICO', '#059669', '#d1fae5')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{rec.title}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                <div>Responsável: {rec.responsible}</div>
                <div>Aprovado: {rec.approvedBy}</div>
                <div>Publicado: {rec.publishedAt}</div>
              </div>
            </div>

            {/* KPIs Table */}
            <div style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#94a3b8', borderBottom: '1px solid #0f172a' }}>📊 Indicadores de Resultado</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Indicador</th>
                    <th style={styles.th}>Realizado</th>
                    <th style={styles.th}>Meta</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.kpis.map((k, i) => (
                    <tr key={i}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{k.name}</td>
                      <td style={{ ...styles.td, color: '#f1f5f9', fontWeight: 700 }}>{k.value}</td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{k.target}</td>
                      <td style={styles.td}>{badge(k.status, k.status === 'OK' ? '#059669' : k.status === 'ALERTA' ? '#d97706' : '#dc2626', k.status === 'OK' ? '#d1fae5' : k.status === 'ALERTA' ? '#fef3c7' : '#fee2e2')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stakeholders */}
            <div style={{ marginBottom: 8 }}>
              <div style={styles.label}>Partes Interessadas</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {rec.stakeholders.map((s, i) => <span key={i} style={{ fontSize: 10, background: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: 4 }}>{s}</span>)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', marginTop: 8 }}>🔐 {rec.hash}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 8: Certificação EIGCAP Final ─────────────────────────────────────

  const renderCertification = () => (
    <div>
      {/* Certificate Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0c1f3d 0%, #0f172a 40%, #1a1040 100%)',
        border: '2px solid #3b82f680',
        borderRadius: 20, padding: '36px 40px', marginBottom: 28, position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 220, opacity: 0.03 }}>🏛️</div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE GOVERNANÇA ENTERPRISE
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>
          EIGCAP — Enterprise Institutional Governance<br />Compliance & Accountability Platform
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor possui um sistema de governança institucional plenamente operacional,
          integrando governança corporativa, compliance, riscos, controles internos, auditoria e accountability
          em um modelo unificado, auditável e orientado por dados.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
          {kpis && [
            { label: 'Score Global', value: `${kpis.globalGovernanceScore}/100`, color: '#60a5fa' },
            { label: 'Compliance', value: `${kpis.complianceIndex}%`, color: '#34d399' },
            { label: 'Ética', value: `${kpis.ethicsIndex}/100`, color: '#fb923c' },
            { label: 'Transparência', value: `${kpis.transparencyScore}%`, color: '#38bdf8' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{m.label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCertEmitted(true)}
          style={{
            background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #1d4ed8, #1e40af)',
            color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14,
            fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
          }}
        >
          {certEmitted ? '✅ Certificado EIGCAP Emitido — Prompt 065' : '🏛️ Emitir Certificado EIGCAP Final'}
        </button>
        {certEmitted && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#34d399' }}>
            Emitido em {kpis?.certificationDate} — {kpis?.certificationVersion}
          </div>
        )}
      </div>

      {/* Maturity Report */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Parecer Executivo de Maturidade</div>
          {[
            { d: 'Governança Corporativa', v: 97, c: '#60a5fa' },
            { d: 'Compliance Institucional', v: 98, c: '#34d399' },
            { d: 'Gestão de Riscos', v: 95, c: '#f87171' },
            { d: 'Controles Internos', v: 96, c: '#a78bfa' },
            { d: 'Auditoria Interna', v: 94, c: '#fbbf24' },
            { d: 'Accountability', v: 98, c: '#38bdf8' },
            { d: 'Transparência', v: 98, c: '#4ade80' },
            { d: 'Ética e Integridade', v: 99, c: '#fb923c' },
          ].map(s => scoreBar(s.d, s.v, s.c))}
          <div style={{ marginTop: 16, padding: 14, background: '#1e293b', borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#f1f5f9' }}>Parecer CGO:</strong> A Plataforma Instituto Ser Melhor demonstra maturidade de governança de <strong style={{ color: '#60a5fa' }}>nível 4+ (CMMI-like)</strong>, com processos documentados, controles efetivos, auditorias sistemáticas e cultura de compliance consolidada. Recomenda-se manutenção do ciclo de melhoria contínua e certificação formal ISO 37001 até 2027.
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🗺️ Roadmap de Governança — 5 Anos</div>
          {[
            { ano: '2026', title: 'Consolidação EIGCAP', color: '#60a5fa', items: ['Certificação ISO 37301 formal', 'Auditoria externa ISO 27001', 'XAI nos modelos de IA (ISO 42001)'] },
            { ano: '2027', title: 'Governança por IA', color: '#34d399', items: ['Compliance cognitivo automatizado', 'Certificação ISO 37001 (Antissuborno)', 'Risk scoring em tempo real'] },
            { ano: '2028', title: 'Auditorias Cognitivas', color: '#a78bfa', items: ['Auditoria contínua 24/7 por IA', 'Digital twin de governança', 'Benchmark setorial terceiro setor'] },
            { ano: '2029', title: 'Controles Adaptativos', color: '#fbbf24', items: ['Controles internos auto-ajustáveis', 'Governança preditiva de riscos', 'Relatórios de conformidade em real-time'] },
            { ano: '2030', title: 'Referência Nacional', color: '#fb923c', items: ['ISM: referência em governança no 3º setor', 'Framework EIGCAP open-source', 'Certificação IBGC Excelência'] },
          ].map(phase => (
            <div key={phase.ano} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 10, background: phase.color + '20', border: `2px solid ${phase.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: phase.color }}>{phase.ano}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{phase.title}</div>
                {phase.items.map((item, i) => <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>• {item}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Declaration */}
      <div style={{ ...styles.card, marginTop: 24, borderTop: '3px solid #60a5fa', textAlign: 'center' }}>
        <div style={{ fontSize: 20 }}>🏛️⚖️📜🛡️✅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginTop: 12, marginBottom: 8 }}>
          Declaração de Conclusão — EIGCAP (Prompt 065)
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, maxWidth: 800, margin: '0 auto' }}>
          A Plataforma Instituto Ser Melhor possui, a partir deste momento, um <strong style={{ color: '#60a5fa' }}>Enterprise Institutional Governance, Compliance & Accountability Platform (EIGCAP)</strong> plenamente operacional.
          A organização é administrada segundo padrões ISO 37000, ISO 37301, ISO 31000, COSO ERM e COBIT 2019,
          garantindo governança corporativa, compliance, gestão de riscos, controles internos, auditoria e transparência
          em um modelo unificado, auditável, seguro e orientado por dados — sustentando a confiança de beneficiários,
          parceiros, financiadores e órgãos de controle.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['EIGCAP v1.0', 'Prompt 065', 'ISO 37000 ✅', 'ISO 37301 ✅', 'ISO 31000 ✅', 'COBIT 2019 ✅', 'COSO ERM ✅', 'LGPD ✅', 'OSCIP ✅'].map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: '#1d4ed820', padding: '4px 12px', borderRadius: 20, border: '1px solid #1d4ed840' }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
          Plataforma ISM v2.0 — Módulo 65/65 — Ecossistema Enterprise Completo
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CGO Board & Governance Hub': renderDashboard,
    'Estrutura de Governança': renderGovernanceStructure,
    'Gestão de Políticas': renderPolicies,
    'Compliance & Conformidade': renderCompliance,
    'Gestão de Riscos': renderRisks,
    'Controles Internos & Auditoria': renderControlsAudit,
    'Accountability & Transparência': renderAccountability,
    'CERTIFICAÇÃO EIGCAP FINAL': renderCertification,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏛️ EIGCAP — Enterprise Institutional Governance, Compliance & Accountability Platform</h1>
        <p style={styles.subtitle}>Prompt 065 · Instituto Ser Melhor v2.0 · ISO 37000 · ISO 37301 · ISO 31000 · COSO ERM · COBIT 2019</p>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            <span>{TAB_ICONS[tab]}</span>
            <span style={{ fontSize: tab === 'CERTIFICAÇÃO EIGCAP FINAL' ? 11 : 11 }}>{tab}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tabContent[activeTab]()}
    </div>
  );
}

export default GovernanceEIGCAPPage;
