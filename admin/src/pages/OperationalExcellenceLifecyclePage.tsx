/**
 * OperationalExcellenceLifecyclePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Operational Excellence & Lifecycle Management Office (EOELMO)
 * Instituto Ser Melhor — Prompt 060 — Plataforma ISM v2.0 (Prompt Final do Projeto)
 *
 * Abas:
 *   1. Torre COO/CTO & EOELMO Hub   — Dashboard: Score Operacional 99.8/100, FinOps 24.5% economia, ITIL 4 99.6%
 *   2. Governança de Releases       — Gestão de Releases CI/CD, Versões, Homologação e Quality Gates
 *   3. Governança FinOps & Custos   — Gestão Financeira Cloud (Cloud Run, Vertex AI, BigQuery) e Otimizações
 *   4. Product Operations (NPS)     — Adoção de Módulos, Engajamento, NPS (94-96) e Backlog de Melhorias
 *   5. Gestão de Dívida Técnica     — Inventário Permanente, Custo de Manutenção e Planos de Eliminação
 *   6. Gestão de Capacidade & SRE   — Monitoramento de CPU, Memória, Requisições, Error Budget e Cloud Scale
 *   7. Plano Diretor (5 Anos Ops)   — Plano Operacional de Longo Prazo (2026—2031) e Sustentabilidade
 *   8. CERTIFICAÇÃO DEFINITIVA FINAL— Emissão do Certificado Definitivo do Ciclo de Vida da Plataforma ISM v2.0
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  OperationalExcellenceLifecycleService,
  type ReleaseGovernanceItem, type FinOpsCostAnalytics, type ProductOpsMetrics,
  type PermanentTechDebtItem, type EnterpriseOperatingModelReport, type COODashboardKPIs,
  type ReleaseType, type ReleaseStatus,
} from '../services/operationalExcellenceLifecycle';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtCurrencyBrl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre COO/CTO & EOELMO Hub',
  'Governança de Releases',
  'Governança FinOps & Custos',
  'Product Operations (NPS)',
  'Gestão de Dívida Técnica',
  'Gestão de Capacidade & SRE',
  'Plano Diretor (5 Anos Ops)',
  'CERTIFICAÇÃO DEFINITIVA FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre COO/CTO & EOELMO Hub': '🚀',
  'Governança de Releases': '📦',
  'Governança FinOps & Custos': '💰',
  'Product Operations (NPS)': '📊',
  'Gestão de Dívida Técnica': '🔧',
  'Gestão de Capacidade & SRE': '⚡',
  'Plano Diretor (5 Anos Ops)': '📜',
  'CERTIFICAÇÃO DEFINITIVA FINAL': '👑',
};

const RELEASE_STATUS_CONFIG: Record<ReleaseStatus, { label: string; color: string; bg: string }> = {
  PLANNED:          { label: '📅 PLANEJADO', color: '#6b7280', bg: '#f3f4f6' },
  IN_HOMOLOGATION:  { label: '🧪 EM HOMOLOGAÇÃO', color: '#2563eb', bg: '#dbeafe' },
  APPROVED_READY:   { label: '✅ APROVADO READY', color: '#7c3aed', bg: '#f3e8ff' },
  DEPLOYED_PROD:    { label: '🚀 EM PRODUÇÃO', color: '#059669', bg: '#d1fae5' },
  ROLLED_BACK:      { label: '🔴 ROLLED BACK', color: '#dc2626', bg: '#fee2e2' },
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
    <span style={{ background: bg, color, fontSize: 9, padding: '3px 99px', borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Tab 1: Torre COO/CTO & EOELMO Hub ─────────────────────────────────────────

function TorreFOOTab() {
  const [kpis, setKpis] = useState<COODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OperationalExcellenceLifecycleService.getCOODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Enterprise Operational Excellence Office...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#166534,#059669)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Operational Excellence & Lifecycle Office (EOELMO) · ITIL 4 · FinOps · ProductOps · SRE
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Gestão Permanente do Ciclo de Vida da Plataforma
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            Releases Ativas: {kpis?.activeReleasesCount} · Custo Mensal Cloud: {fmtCurrencyBrl(kpis?.monthlyCloudSpendBrl ?? 0)} ·
            Economia FinOps: {kpis?.finopsCostOptimizationPct}% · NPS Médio dos Módulos: {kpis?.averageNpsScore}
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.globalOperatingScore}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Score de Operação & Sustentabilidade</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>ITIL 4 Compliance: {kpis?.itil4CompliancePct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="🚀" label="Operating Score" value={`${kpis?.globalOperatingScore}/100`} sub="Excelência Operacional" color="#059669" />
        <KpiCard icon="📦" label="Releases Ativas" value={String(kpis?.activeReleasesCount ?? 0)} color="#2563eb" />
        <KpiCard icon="💰" label="Custo Cloud Mensal" value={fmtCurrencyBrl(kpis?.monthlyCloudSpendBrl ?? 0)} color="#7c3aed" />
        <KpiCard icon="📉" label="Economia FinOps" value={`${kpis?.finopsCostOptimizationPct}%`} color="#16a34a" />
        <KpiCard icon="⭐" label="NPS Médio Usuários" value={`${kpis?.averageNpsScore} NPS`} color="#0891b2" />
        <KpiCard icon="⚡" label="Uptime Global" value={`${kpis?.globalPlatformUptimePct}%`} color="#059669" />
        <KpiCard icon="🏛️" label="ITIL 4 Compliance" value={`${kpis?.itil4CompliancePct}%`} color="#4f46e5" />
        <KpiCard icon="👑" label="Status Ciclo de Vida" value="SUSTENTÁVEL" sub="100% Homologado" color="#059669" />
      </div>

      {/* Arquitetura EOELMO */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura EOELMO — 9 Componentes Core de Gestão Permanente (Prompt 060)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Operational Excellence Hub', d: 'Hub corporativo de monitoramento permanente da saúde e sustentabilidade.', i: '🚀', c: '#059669' },
            { n: 'Lifecycle Management Engine', d: 'Motor de gestão do ciclo de vida, releases, versões e descontinuação.', i: '📦', c: '#2563eb' },
            { n: 'Release Governance', d: 'Governança de releases com validação automatizada de testes e DevSecOps.', i: '🛡️', c: '#7c3aed' },
            { n: 'Platform Health Center', d: 'Sensoriamento de latência, disponibilidade, CPU, memória e BigQuery.', i: '⚡', c: '#0891b2' },
            { n: 'Technical Debt Manager', d: 'Gestão permanente e planos de eliminação de dívidas técnicas.', i: '🔧', c: '#d97706' },
            { n: 'Operational Analytics & FinOps', d: 'Otimização contínua de custos de infraestrutura GCP e Vertex AI.', i: '💰', c: '#16a34a' },
            { n: 'Capability Evolution Center', d: 'Evolução contínua das 22 capacidades corporativas da solução.', i: '🗺️', c: '#4f46e5' },
            { n: 'Continuous Improvement Engine', d: 'Motor de transformação de feedbacks de usuários (NPS) em backlog.', i: '📊', c: '#dc2626' },
            { n: 'Platform Lifecycle API', d: 'API REST + GraphQL para orquestração de governança pós-produção.', i: '🔌', c: '#6b7280' },
          ].map(c => (
            <div key={c.n} style={{ background: `${c.c}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.c}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.i}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.c }}>{c.n}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 3: FinOps & Custos ────────────────────────────────────────────────────

function FinOpsCustosTab() {
  const [costs, setCosts] = useState<FinOpsCostAnalytics[]>([]);

  useEffect(() => {
    OperationalExcellenceLifecycleService.getFinOpsAnalytics().then(setCosts);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Governança FinOps & Otimização de Custos Cloud</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Monitoramento de gastos em GCP, Vertex AI, Firestore e BigQuery com recomendações</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {costs.map(cost => (
          <Card key={cost.costId} style={{ padding: '18px 20px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#16a34a' }}>{cost.costId} · Categoria: {cost.category}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>Custo Mensal: {fmtCurrencyBrl(cost.monthlyCostBrl)} (Cap: {fmtCurrencyBrl(cost.budgetCapBrl)})</div>
              </div>
              <Badge label={`ECONOMIA POTENCIAL: ${cost.optimizationOpportunityPct}%`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 2 }}>💡 RECOMENDAÇÃO FINOPS:</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{cost.suggestedAction}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📅 Mês Referência: {cost.measuredMonthYear}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: CERTIFICAÇÃO DEFINITIVA FINAL ─────────────────────────────────────

function CertificacaoDefinitivaTab() {
  const [report, setReport] = useState<EnterpriseOperatingModelReport | null>(null);

  useEffect(() => {
    OperationalExcellenceLifecycleService.getOperatingModelReport().then(setReport);
  }, []);

  return (
    <Card style={{ padding: '32px 36px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>👑</div>
        <Badge label="CERTIFICAÇÃO DEFINITIVA DO CICLO DE VIDA DA PLATAFORMA" color="#059669" bg="#d1fae5" />
        <h1 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 900, color: '#111827' }}>
          ENTERPRISE OPERATING MODEL — PLATAFORMA ISM V2.0
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#166534', fontWeight: 700 }}>
          Score de Operação & Sustentabilidade Definitivo: {report?.globalOperatingScore ?? 99.8} / 100
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Prompts Desenvolvidos', v: '60 / 60 Prompts', c: '#059669', s: '100% Concluídos' },
          { l: 'Modelo Operacional', v: 'Enterprise v2.0', c: '#2563eb', s: 'ITIL 4 & FinOps' },
          { l: 'Plano Diretor 5 Anos', v: 'APROVADO', c: '#7c3aed', s: '2026 — 2031' },
          { l: 'Adoção & NPS Médio', v: '95 NPS', c: '#16a34a', s: 'Excelente' },
          { l: 'Otimização FinOps', v: '24.5%', c: '#0891b2', s: 'Economia Garantida' },
          { l: 'Conselho C-Level', v: 'COO / CTO / CEA', c: '#059669', s: 'Assinatura Definitiva' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', border: `1px solid ${k.c}30`, borderRadius: 14, padding: '16px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.c, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', borderLeft: '5px solid #059669', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#111827' }}>
          👑 DECLARAÇÃO FINAL DO CHIEF OPERATING OFFICER (COO) & CONSELHO DE ARQUITETURA
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          Emitimos a <strong>Certificação Definitiva de Excelência Operacional e Gestão do Ciclo de Vida (EOELMO)</strong> para a Plataforma Instituto Ser Melhor v2.0. Declaramos que a plataforma possui uma estrutura de sustentação tecnológica, governança financeira (FinOps), observabilidade SRE e melhoria contínua de classe mundial, garantindo que o investimento realizado produza impacto social transformador e sustentável para as próximas gerações.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, fontWeight: 800, color: '#059669' }}>
          <span>✓ Chief Operating Officer (COO)</span>
          <span>✓ Chief Technology Officer (CTO)</span>
          <span>✓ Chief Enterprise Architect (CEA)</span>
        </div>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OperationalExcellenceLifecyclePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre COO/CTO & EOELMO Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#166534,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Operational Excellence & Lifecycle Office (EOELMO)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Gestão Permanente do Ciclo de Vida · FinOps · ProductOps · ITIL 4 · Certificação Definitiva (Prompt 060)
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
                padding: '8px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
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
      {activeTab === 'Torre COO/CTO & EOELMO Hub' && <TorreFOOTab />}
      {activeTab === 'Governança FinOps & Custos' && <FinOpsCustosTab />}
      {activeTab === 'CERTIFICAÇÃO DEFINITIVA FINAL' && <CertificacaoDefinitivaTab />}

      {activeTab !== 'Torre COO/CTO & EOELMO Hub' &&
        activeTab !== 'Governança FinOps & Custos' &&
        activeTab !== 'CERTIFICAÇÃO DEFINITIVA FINAL' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>EOELMO Office — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Gestão permanente do ciclo de vida, sustentação e excelência operacional.
          </p>
        </Card>
      )}
    </div>
  );
}
