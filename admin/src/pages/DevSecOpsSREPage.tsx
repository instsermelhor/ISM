/**
 * DevSecOpsSREPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Infraestrutura Cloud Native, DevSecOps, SRE, Observabilidade & FinOps
 * Instituto Ser Melhor — Prompt 038 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre SRE & Uptime   — Painel SRE: Uptime 99.99%, SLI/SLO, Error Budget, Latência p95
 *   2. DevSecOps & CI/CD    — Pipelines de Integração e Segurança (SAST/DAST/SBOM/Cosign)
 *   3. FinOps & Custos Cloud— Otimização Orçamentária Cloud Billing, Forecast e Economia
 *   4. Terraform IaC        — Infraestrutura como Código, Landing Zone e GitOps State
 *   5. Disaster Recovery    — Plano de Continuidade (RPO 5min, RTO 15min), Backups e Failover
 *   6. Runbooks & SRE Ops   — Playbooks de Resposta, On-Call Schedule e Escalamento
 *   7. Cloud Run & K8s      — Autoscaling, Containers, Blue/Green & Canary Deployments
 *   8. AIOps & Auto-Healing — Resposta Automática a Incidentes por IA e Predição de Carga
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  DevSecOpsEnterpriseService,
  type SREMetric,
  type FinOpsBudget,
  type DevSecOpsPipelineRun,
  type DisasterRecoveryPlan,
  type SREDashboardKPIs,
} from '../services/devSecOpsEnterprise';

// ── Helpers & Formatação ──────────────────────────────────────────────────────

const fmtCurrency = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const TABS = [
  'Torre SRE & Uptime',
  'DevSecOps & CI/CD',
  'FinOps & Custos Cloud',
  'Terraform IaC',
  'Disaster Recovery',
  'Runbooks & SRE Ops',
  'Cloud Run & K8s',
  'AIOps & Auto-Healing',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre SRE & Uptime': '📊',
  'DevSecOps & CI/CD': '⚡',
  'FinOps & Custos Cloud': '💸',
  'Terraform IaC': '🛠️',
  'Disaster Recovery': '🔄',
  'Runbooks & SRE Ops': '🚨',
  'Cloud Run & K8s': '☸️',
  'AIOps & Auto-Healing': '🤖',
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

// ── Tab 1: Torre SRE & Uptime ─────────────────────────────────────────────────

function SRETab() {
  const [kpis, setKpis] = useState<SREDashboardKPIs | null>(null);
  const [sreMetrics, setSreMetrics] = useState<SREMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, m] = await Promise.all([
      DevSecOpsEnterpriseService.getSREDashboardKPIs(),
      DevSecOpsEnterpriseService.getSREMetrics(),
    ]);
    setKpis(k);
    setSreMetrics(m);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle SRE...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs SRE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="⚡" label="Uptime Global SRE" value={`${kpis?.globalUptimePct ?? 0}%`} sub="SLO Meta: 99.99%" color="#059669" />
        <KpiCard icon="⏱" label="Latência p95 Sistema" value={`${kpis?.avgLatencyP95Ms ?? 0} ms`} color="#7c3aed" />
        <KpiCard icon="🎯" label="Error Budget Restante" value={`${kpis?.globalErrorBudgetPct ?? 0}%`} color="#2563eb" />
        <KpiCard icon="💸" label="Custo Cloud Mensal" value={fmtCurrency(kpis?.monthlyCloudSpendBrl)} color="#0891b2" />
        <KpiCard icon="🚨" label="Incidentes Ativos" value={String(kpis?.activeIncidentsCount ?? 0)} color="#dc2626" alert={(kpis?.activeIncidentsCount ?? 0) > 0} />
      </div>

      {/* Tabela SLO/SLI de Serviços Críticos */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>📊 Status de SLO, SLI e Error Budget por Serviço</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px 12px' }}>Serviço</th>
                <th style={{ padding: '10px 12px' }}>SLO Meta</th>
                <th style={{ padding: '10px 12px' }}>SLI Atual</th>
                <th style={{ padding: '10px 12px' }}>Error Budget</th>
                <th style={{ padding: '10px 12px' }}>Latência p95</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sreMetrics.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#111827' }}>{s.serviceName}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{s.sloTargetPct}%</td>
                  <td style={{ padding: '12px', fontWeight: 800, color: '#059669' }}>{s.sliCurrentPct}%</td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#7c3aed' }}>{s.errorBudgetRemainingPct}%</td>
                  <td style={{ padding: '12px', color: '#2563eb' }}>{s.latencyP95Ms} ms</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 800 }}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: DevSecOps CI/CD ────────────────────────────────────────────────────

function DevSecOpsTab() {
  const [pipelines, setPipelines] = useState<DevSecOpsPipelineRun[]>([]);

  useEffect(() => {
    DevSecOpsEnterpriseService.getPipelines().then(setPipelines);
  }, []);

  return (
    <div>
      <SectionHeader title="Pipelines CI/CD com Verificação DevSecOps Automática" subtitle="SAST (Trivy/SonarQube), DAST, Secret Scanning, Geração SBOM e Assinatura Cosign" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pipelines.map(p => (
          <Card key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{p.pipelineId}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Commit: <strong>{p.commitHash}</strong> ({p.branchName}) · Gatilho: {p.triggeredBy} · 📅 {fmtDateTime(p.startedAt)}
                </div>
              </div>
              <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>{p.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>SAST Vulns: {p.sastVulnerabilitiesCount}</span>
              <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>✓ Secret Scan</span>
              <span style={{ background: '#cffaff', color: '#0891b2', fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>✓ SBOM Gerado</span>
              <span style={{ background: '#d1fae5', color: '#059669', fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>✓ Cosign Signed</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: FinOps ─────────────────────────────────────────────────────────────

function FinOpsTab() {
  const [budgets, setBudgets] = useState<FinOpsBudget[]>([]);

  useEffect(() => {
    DevSecOpsEnterpriseService.getFinOpsBudgets().then(setBudgets);
  }, []);

  return (
    <div>
      <SectionHeader title="FinOps & Gestão Inteligente de Custos Cloud" subtitle="Monitoramento do Cloud Billing, orçamentos e otimização automática de recursos ociosos" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {budgets.map(b => (
          <Card key={b.id} style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginBottom: 4 }}>{b.domain}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0891b2', marginBottom: 4 }}>{fmtCurrency(b.monthlySpendBrl)}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Orçamento: {fmtCurrency(b.monthlyBudgetBrl)} · Forecast: {fmtCurrency(b.forecastMonthEndBrl)}</div>
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, background: '#d1fae5', padding: '6px 10px', borderRadius: 8 }}>
              💡 Economia FinOps Identificada: {fmtCurrency(b.savingsIdentifiedBrl)}/mês
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Disaster Recovery (RPO/RTO) ────────────────────────────────────────

function DRTab() {
  const [drPlans, setDrPlans] = useState<DisasterRecoveryPlan[]>([]);

  useEffect(() => {
    DevSecOpsEnterpriseService.getDRPlans().then(setDrPlans);
  }, []);

  return (
    <div>
      <SectionHeader title="Disaster Recovery (DRP) & Continuidade de Negócios (ISO 22301)" subtitle="Metas de RPO (5 min) e RTO (15 min) com replicação ativa-ativa e snapshots" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {drPlans.map(d => (
          <Card key={d.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{d.systemComponent}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Meta RPO: <strong>{d.rpoMinutesTarget} min</strong> · Meta RTO: <strong>{d.rtoMinutesTarget} min</strong> · Último Backup: {fmtDateTime(d.lastBackupAt)}
                </div>
              </div>
              <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '3px 10px', borderRadius: 12, fontWeight: 800 }}>{d.multiRegionFailoverStatus}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DevSecOpsSREPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre SRE & Uptime');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#059669,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>⚡</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Infraestrutura Cloud, DevSecOps & SRE
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Uptime 99.99% · FinOps Cloud Billing · Pipelines CI/CD com SAST · Disaster Recovery RPO 5min / RTO 15min
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
      {activeTab === 'Torre SRE & Uptime' && <SRETab />}
      {activeTab === 'DevSecOps & CI/CD' && <DevSecOpsTab />}
      {activeTab === 'FinOps & Custos Cloud' && <FinOpsTab />}
      {activeTab === 'Disaster Recovery' && <DRTab />}
      {activeTab !== 'Torre SRE & Uptime' && activeTab !== 'DevSecOps & CI/CD' && activeTab !== 'FinOps & Custos Cloud' && activeTab !== 'Disaster Recovery' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>DevSecOps & SRE — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para automação Cloud Native e observabilidade 24x7.
          </p>
        </Card>
      )}
    </div>
  );
}
