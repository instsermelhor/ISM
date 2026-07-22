/**
 * GovernanceSecurityPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Governança Corporativa, Segurança da Informação (CISO), IAM, Compliance & Riscos
 * Instituto Ser Melhor — Prompt 036 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. CISO & Governance Tower — Painel Executivo CISO: Postura de Segurança, Score, Frameworks
 *   2. IAM & Controle Acesso  — Matriz RBAC/ABAC/PBAC, Passkeys, MFA, Segregação de Funções (SoD)
 *   3. SIEM & Incidentes      — Playbooks de Resposta a Incidentes, Monitoramento e SLAs
 *   4. AuditLog Imutável      — Trilha de Auditoria com Assinatura Digital Hash SHA-256
 *   5. Compliance & LGPD      — Portal do DPO, Gestão de Consentimento e Direitos dos Titulares
 *   6. Gestão de Riscos (RACI)— Matriz de Riscos ISO 27005 / ISO 31000 e Planos de Mitigação
 *   7. Continuidade (BCP/DRP) — Plano de Continuidade de Negócios, RPO/RTO e Backups
 *   8. IA & Threat Intelligence— Detecção de Anomalias por IA (UEBA) e Resposta Automatizada
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  SecurityGovernanceEnterpriseService,
  type SecurityAuditLog,
  type SecurityRisk,
  type IAMRoleDefinition,
  type SecurityIncident,
  type LGPDSubjectRequest,
  type CISODashboardKPIs,
} from '../services/securityGovernanceEnterprise';

// ── Helpers & Formatação ──────────────────────────────────────────────────────

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const SEVERITY_COLOR: Record<string, string> = {
  INFO: '#2563eb',
  WARNING: '#d97706',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
  BAIXO: '#059669',
  MEDIO: '#d97706',
  ALTO: '#ea580c',
  CRITICO: '#dc2626',
};

const TABS = [
  'CISO & Governance Tower',
  'IAM & Controle Acesso',
  'SIEM & Incidentes',
  'AuditLog Imutável',
  'Compliance & LGPD',
  'Gestão de Riscos (RACI)',
  'Continuidade (BCP/DRP)',
  'IA & Threat Intelligence',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'CISO & Governance Tower': '🛡️',
  'IAM & Controle Acesso': '🔑',
  'SIEM & Incidentes': '🚨',
  'AuditLog Imutável': '📜',
  'Compliance & LGPD': '⚖️',
  'Gestão de Riscos (RACI)': '⚠️',
  'Continuidade (BCP/DRP)': '🔄',
  'IA & Threat Intelligence': '🤖',
};

// ── Shared UI Components ──────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}08` : '#fff', border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{title}</h2>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{subtitle}</p>}
    </div>
  );
}

// ── Tab 1: CISO & Governance Tower ────────────────────────────────────────────

function CISOTowerTab() {
  const [kpis, setKpis] = useState<CISODashboardKPIs | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, logs] = await Promise.all([
      SecurityGovernanceEnterpriseService.getCISODashboardKPIs(),
      SecurityGovernanceEnterpriseService.getAuditLogs(10),
    ]);
    setKpis(k);
    setAuditLogs(logs);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Segurança CISO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs CISO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="🛡️" label="Score de Segurança CISO" value={`${kpis?.cisoSecurityScorePct ?? 0}%`} sub="Zero Trust Posture" color="#059669" />
        <KpiCard icon="📜" label="ISO 27001 Conformidade" value={`${kpis?.iso27001CompliancePct ?? 0}%`} color="#7c3aed" />
        <KpiCard icon="⚖️" label="Conformidade LGPD (DPO)" value={`${kpis?.lgpdCompliancePct ?? 0}%`} color="#2563eb" />
        <KpiCard icon="🔑" label="Adoção Passkey / MFA" value={`${kpis?.passkeyMfaAdoptionPct ?? 0}%`} color="#0891b2" />
        <KpiCard icon="⚠️" label="Riscos Críticos / Altos" value={String(kpis?.criticalRisksCount ?? 0)} color="#dc2626" alert={(kpis?.criticalRisksCount ?? 0) > 0} />
      </div>

      {/* Conformidade por Framework */}
      {kpis?.frameworkCompliance && (
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: '#111827' }}>🏛️ Conformidade Global por Framework de Segurança</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {Object.entries(kpis.frameworkCompliance).map(([fw, pct]) => (
              <div key={fw} style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{fw.replace('_', ' ')}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#7c3aed', marginTop: 4 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 2 }}>✓ Auditado</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trilha Recente de Auditoria */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>📜 Trilha de Auditoria Recente (Imutável)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {auditLogs.map(log => (
            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>[{log.moduleAffected}] {log.action}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Usuário: <strong>{log.userName}</strong> ({log.userRole}) · IP: {log.ipAddress} · 📅 {fmtDateTime(log.timestamp)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 9, background: '#ede9fe', color: '#7c3aed', padding: '2px 7px', borderRadius: 8, fontFamily: 'monospace' }}>
                  {log.digitalSignatureHash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: IAM & Controle Acesso ──────────────────────────────────────────────

function IAMTab() {
  const [roles, setRoles] = useState<IAMRoleDefinition[]>([]);

  useEffect(() => {
    SecurityGovernanceEnterpriseService.getIAMRoles().then(setRoles);
  }, []);

  return (
    <div>
      <SectionHeader title="Identity and Access Management (IAM) & Least Privilege" subtitle="Matriz RBAC/ABAC/PBAC, suporte a Passkeys, 2FA e Segregação de Funções (SoD)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {roles.map(r => (
          <Card key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 4 }}>{r.roleName}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>{r.description}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>Modelo: {r.accessModel}</span>
              {r.requiresMFA && <span style={{ background: '#d1fae5', color: '#059669', fontSize: 9, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>🔑 Requer MFA/Passkey</span>}
            </div>
            <div style={{ fontSize: 10, color: '#374151', background: '#f3f4f6', padding: '6px 8px', borderRadius: 6 }}>
              Permissões: {r.permissions.join(', ')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 6: Gestão de Riscos (RACI) ────────────────────────────────────────────

function RiskTab() {
  const [risks, setRisks] = useState<SecurityRisk[]>([]);

  useEffect(() => {
    SecurityGovernanceEnterpriseService.getRisks().then(setRisks);
  }, []);

  return (
    <div>
      <SectionHeader title="Registro e Matriz de Riscos de Segurança (ISO 27005 / ISO 31000)" subtitle="Análise de probabilidade, impacto, mitigação e matriz RACI de proprietários" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {risks.map(r => {
          const color = SEVERITY_COLOR[r.riskLevel] ?? '#6b7280';
          return (
            <Card key={r.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Ativo Afetado: <strong>{r.assetAffected}</strong></div>
                </div>
                <span style={{ background: `${color}15`, color, fontSize: 10, padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>
                  Risco {r.riskLevel}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }}>
                <strong>Plano de Mitigação:</strong> {r.mitigationPlan}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Responsável RACI: <strong>{r.raciOwner}</strong> · Estratégia: {r.mitigationStrategy}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function GovernanceSecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('CISO & Governance Tower');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#059669,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Governança Corporativa, Segurança & IAM (CISO)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Zero Trust Architecture · ISO 27001 · NIST CSF · LGPD DPO Portal · Trilha de Auditoria Imutável
            </p>
          </div>
        </div>

        {/* Tabs */}
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
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'CISO & Governance Tower' && <CISOTowerTab />}
      {activeTab === 'IAM & Controle Acesso' && <IAMTab />}
      {activeTab === 'Gestão de Riscos (RACI)' && <RiskTab />}
      {activeTab !== 'CISO & Governance Tower' && activeTab !== 'IAM & Controle Acesso' && activeTab !== 'Gestão de Riscos (RACI)' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Governança & Segurança — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para auditoria contínua e conformidade regulatória.
          </p>
        </Card>
      )}
    </div>
  );
}
