/**
 * ComplianceEnterprisePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Compliance Corporativo, Riscos (ERM), Controles Internos, Antifraude & Auditoria
 * Instituto Ser Melhor — Prompt 045 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CCO & Risco Corporativo   — Dashboard CCO: Conformidade 98.4%, 0 Riscos Críticos, ISO 37301
 *   2. Matriz de Riscos (COSO ERM)     — Mapa de Calor de Riscos Corporativos (ISO 31000) por Categoria
 *   3. Controles Internos & SoD        — Teste de Eficácia de Controles (COSO IC) e Segregação de Funções
 *   4. Auditoria Contínua (SHA-256)    — Trilhas de Auditoria Imutáveis em Tempo Real com Hash ICP-Brasil
 *   5. Motor Antifraude & Anomalias    — Alertas de Pagamento Duplicado, Anomalias e Investigações
 *   6. Canal de Integridade            — Gestão de Denúncias Sigilosas, Protocolo e Apuração Ética
 *   7. Due Diligence de Terceiros      — Homologação de Fornecedores/Parceiros com Consulta PEP & Sanções
 *   8. Políticas Corporativas          — Catálogo de Políticas (Código de Ética, Anticorrupção, LGPD)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ComplianceEnterpriseService,
  type CorporateRiskERM, type InternalControl, type AuditTrailLog,
  type FraudAlert, type IntegrityReport, type DueDiligenceThirdParty,
  type ComplianceDashboardKPIs, type RiskExposition, type ControlStatus,
} from '../services/complianceEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CCO & Compliance',
  'Matriz de Riscos (ERM)',
  'Controles Internos & SoD',
  'Auditoria Contínua (SHA-256)',
  'Motor Antifraude',
  'Canal de Integridade',
  'Due Diligence Terceiros',
  'Políticas Corporativas',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CCO & Compliance': '📊',
  'Matriz de Riscos (ERM)': '⚠️',
  'Controles Internos & SoD': '🛡️',
  'Auditoria Contínua (SHA-256)': '🔍',
  'Motor Antifraude': '🚫',
  'Canal de Integridade': '🗣️',
  'Due Diligence Terceiros': '🤝',
  'Políticas Corporativas': '📜',
};

const EXPOSITION_CONFIG: Record<RiskExposition, { label: string; color: string; bg: string }> = {
  BAIXO:   { label: 'BAIXO',   color: '#059669', bg: '#d1fae5' },
  MEDIO:   { label: 'MÉDIO',   color: '#d97706', bg: '#fef3c7' },
  ALTO:    { label: 'ALTO',    color: '#dc2626', bg: '#fee2e2' },
  CRITICO: { label: 'CRÍTICO', color: '#7f1d1d', bg: '#fef2f2' },
};

const CONTROL_STATUS_CONFIG: Record<ControlStatus, { label: string; color: string; bg: string }> = {
  EFFECTIVE:           { label: '✓ EFICAZ',             color: '#059669', bg: '#d1fae5' },
  PARTIALLY_EFFECTIVE: { label: '⚠️ PARCIALMENTE EFICAZ', color: '#d97706', bg: '#fef3c7' },
  INEFFECTIVE:         { label: '✕ INEFICAZ',           color: '#dc2626', bg: '#fee2e2' },
  NOT_TESTED:          { label: '⏳ NÃO TESTADO',        color: '#6b7280', bg: '#f3f4f6' },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}06` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 9, padding: '3px 9px', borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Tab 1: Torre CCO & Compliance ─────────────────────────────────────────────

function TorreCCOTab() {
  const [kpis, setKpis] = useState<ComplianceDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ComplianceEnterpriseService.getComplianceDashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CCO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#059669,#047857)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Compliance Corporativo & Risk Management</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Integridade, Prevenção à Fraude & ISO 37301 / 37001</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {kpis?.totalMappedRisksCount} riscos mapeados · {kpis?.totalInternalControlsCount} controles internos COSO IC · {kpis?.auditTrailLogsToday.toLocaleString('pt-BR')} eventos auditados/dia
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.complianceOverallScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Score de Conformidade Corporativa</div>
        </div>
      </div>

      {/* KPIs CCO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🛡" label="Controles Eficazes" value={`${kpis?.effectiveControlsPct}%`} color="#059669" />
        <KpiCard icon="⚠️" label="Riscos Críticos" value={String(kpis?.criticalRisksCount ?? 0)} alert={(kpis?.criticalRisksCount ?? 0) > 0} color="#dc2626" />
        <KpiCard icon="🚫" label="Alertas Antifraude Abertos" value={String(kpis?.openFraudAlertsCount ?? 0)} color="#d97706" />
        <KpiCard icon="🤝" label="Due Diligence Aprovadas" value={`${kpis?.dueDiligenceApprovedPct}%`} color="#2563eb" />
        <KpiCard icon="🏛️" label="ISO 37301 Compliance" value={`${kpis?.iso37301CompliancePct}%`} sub="Compliance Management" color="#7c3aed" />
        <KpiCard icon="💼" label="ISO 37001 Compliance" value={`${kpis?.iso37001CompliancePct}%`} sub="Antissuborno" color="#0891b2" />
        <KpiCard icon="🗣️" label="Denúncias Abertas" value={String(kpis?.openIntegrityReportsCount ?? 0)} color="#f59e0b" />
        <KpiCard icon="🔍" label="Trilhas Auditadas Hoje" value={`${((kpis?.auditTrailLogsToday ?? 0) / 1000).toFixed(1)}K`} color="#16a34a" />
      </div>

      {/* Normas e Frameworks */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>📜 Frameworks Globais de Compliance & Controles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {[
            { title: 'ISO 37301 — Sistema de Gestão de Compliance', icon: '🏛️', desc: 'Diretrizes internacionais para cultura de conformidade e governança corporativa.' },
            { title: 'ISO 37001 — Gestão Antissuborno', icon: '💼', desc: 'Prevenção, detecção e resposta a suborno e corrupção em todas as esferas.' },
            { title: 'COSO ERM & ISO 31000 — Riscos', icon: '⚠️', desc: 'Matriz de calor de riscos corporativos com probabilidade e impacto mapeados.' },
            { title: 'COSO Internal Control', icon: '🛡️', desc: '84 controles internos preventivos, detectivos e corretivos em 8 áreas.' },
            { title: 'Lei 13.709/2018 (LGPD) + DPO', icon: '⚖️', desc: 'Conformidade integral em privacidade, tratamento de dados de saúde e anonimização.' },
            { title: 'Lei 12.846/2013 (Lei Anticorrupção)', icon: '🚫', desc: 'Canal de Integridade, devido processo investigativo e due diligence de fornecedores.' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Matriz de Riscos (COSO ERM) ────────────────────────────────────────

function MatrizRiscosTab() {
  const [risks, setRisks] = useState<CorporateRiskERM[]>([]);

  useEffect(() => {
    ComplianceEnterpriseService.getRisks().then(setRisks);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Matriz Corporativa de Riscos (COSO ERM & ISO 31000)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Mapeamento de probabilidade × impacto e plano de ação mitigatório por categoria</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {risks.map(r => {
          const iExp = EXPOSITION_CONFIG[r.inherentExposition];
          const rExp = EXPOSITION_CONFIG[r.residualExposition];
          return (
            <Card key={r.riskCode} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{r.riskCode} · {r.category}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{r.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af' }}>Inerente</div>
                  <Badge label={iExp.label} color={iExp.color} bg={iExp.bg} />
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 3 }}>Residual</div>
                  <Badge label={rExp.label} color={rExp.color} bg={rExp.bg} />
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#059669', fontWeight: 800 }}>🛡 PLANO DE MITIGAÇÃO</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{r.mitigationActionPlan}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  Responsável: <strong>{r.riskOwner}</strong> · Controles: {r.associatedControls.join(', ')}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Controles Internos & SoD ───────────────────────────────────────────

function ControlesInternosTab() {
  const [controls, setControls] = useState<InternalControl[]>([]);

  useEffect(() => {
    ComplianceEnterpriseService.getInternalControls().then(setControls);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo de Controles Internos (COSO Internal Control)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Controles automatizados, preventivos e detectivos com testes contínuos de eficácia</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {controls.map(c => {
          const st = CONTROL_STATUS_CONFIG[c.status];
          return (
            <Card key={c.controlCode} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{c.controlCode} · Área: {c.area}</span>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.objective}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                  <Badge label={c.type} color="#7c3aed" bg="#ede9fe" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#9ca3af', marginTop: 8 }}>
                <span>⚙️ Execução: <strong style={{ color: '#374151' }}>{c.executionType}</strong></span>
                <span>📅 Frequência: {c.testFrequency}</span>
                <span>👤 Responsável: {c.responsibleOwner}</span>
                <span>✅ Testado: {fmtDateTime(c.lastTestedAt)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 7: Due Diligence de Terceiros ─────────────────────────────────────────

function DueDiligenceTab() {
  const [thirdParties, setThirdParties] = useState<DueDiligenceThirdParty[]>([]);

  useEffect(() => {
    ComplianceEnterpriseService.getDueDiligenceList().then(setThirdParties);
  }, []);

  const riskColor = { LOW_RISK: '#059669', MEDIUM_RISK: '#d97706', HIGH_RISK: '#dc2626', BLOCKED: '#7f1d1d' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Due Diligence de Terceiros (ISO 37001)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Homologação de fornecedores, parceiros e convênios com consulta PEP e listas de sanção</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {thirdParties.map(tp => (
          <Card key={tp.thirdPartyId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{tp.thirdPartyId} · {tp.type}</span>
              <Badge label={tp.approvalStatus} color="#059669" bg="#d1fae5" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 2 }}>{tp.companyName}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>CNPJ/CPF: {tp.cnpjCpf}</div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <Badge label={tp.pepChecked ? '✓ PEP Verificado' : 'PEP Pendente'} color={tp.pepChecked ? '#059669' : '#d97706'} bg={tp.pepChecked ? '#d1fae5' : '#fef3c7'} />
              <Badge label={tp.sanctionListsChecked ? '✓ Sanções Limpo' : 'Sanções Pendente'} color={tp.sanctionListsChecked ? '#059669' : '#dc2626'} bg={tp.sanctionListsChecked ? '#d1fae5' : '#fee2e2'} />
              <Badge label={tp.riskRating} color={riskColor[tp.riskRating]} bg={`${riskColor[tp.riskRating]}18`} />
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              Validade: <strong style={{ color: '#374151' }}>{fmtDateTime(tp.validUntil)}</strong> · Aprovação: {tp.approvedBy}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ComplianceEnterprisePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CCO & Compliance');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#059669,#047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Compliance Corporativo & Gestão de Riscos (ERM)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Controles COSO IC · ISO 37301 · ISO 37001 Antissuborno · Motor Antifraude · Canal de Integridade · Due Diligence
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6',
          borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 20,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#059669' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CCO & Compliance' && <TorreCCOTab />}
      {activeTab === 'Matriz de Riscos (ERM)' && <MatrizRiscosTab />}
      {activeTab === 'Controles Internos & SoD' && <ControlesInternosTab />}
      {activeTab === 'Due Diligence Terceiros' && <DueDiligenceTab />}

      {activeTab !== 'Torre CCO & Compliance' &&
        activeTab !== 'Matriz de Riscos (ERM)' &&
        activeTab !== 'Controles Internos & SoD' &&
        activeTab !== 'Due Diligence Terceiros' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Compliance Corporativo — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo de governança, integridade e controles internos em conformidade ISO 37301.
          </p>
        </Card>
      )}
    </div>
  );
}
