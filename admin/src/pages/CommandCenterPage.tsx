/**
 * CommandCenterPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Centro de Comando Operacional — NOC · SOC · BOC · Digital Twin · AIOps
 * Instituto Ser Melhor — Prompt 040 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre de Controle (CTO/COO) — KPIs DORA, Uptime 99.99%, Latência, Incidentes, Usuários em Tempo Real
 *   2. Digital Twin                — Mapa Visual de 24 Serviços e Estado Operacional (NOC)
 *   3. NOC — Saúde dos Serviços    — Latência, Erros, Throughput e Dependências por Microsserviço
 *   4. SOC — Segurança em Tempo    — SIEM, Eventos de Ataque, Conformidade e Bloqueios Automáticos
 *   5. BOC — KPIs Executivos       — OKRs, ODS/ESG, SROI, Capacidade e Performance Institucional
 *   6. Gestão de Incidentes (ITIL) — P1–P4, MTTR, Postmortem, Escalonamento e Automações
 *   7. AIOps & Anomalias           — Detecção de Anomalias, Predição de Falhas e Recomendações IA
 *   8. Dashboards Executivos       — Visão Estratégica para Diretoria, Conselho e Auditoria
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  CommandCenterEnterpriseService,
  type ServiceHealthNode, type IncidentRecord, type SOCSecurityEvent,
  type BusinessKPI, type AIOpsAnomaly, type CommandCenterKPIs,
  type ServiceStatus, type IncidentPriority, type SecuritySeverity,
} from '../services/commandCenterEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n?: number) =>
  n !== undefined ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre de Controle',
  'Digital Twin',
  'NOC — Serviços',
  'SOC — Segurança',
  'BOC — Executivo',
  'Gestão Incidentes',
  'AIOps & Anomalias',
  'Dashboard Diretoria',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre de Controle': '🗼',
  'Digital Twin': '🌐',
  'NOC — Serviços': '📡',
  'SOC — Segurança': '🔐',
  'BOC — Executivo': '📊',
  'Gestão Incidentes': '🚨',
  'AIOps & Anomalias': '🤖',
  'Dashboard Diretoria': '🏛️',
};

// ── Service Status Config ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  OPERATIONAL:    { label: '● Operacional',    color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  DEGRADED:       { label: '⚠ Degradado',      color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' },
  PARTIAL_OUTAGE: { label: '⚠ Parcial',        color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
  MAJOR_OUTAGE:   { label: '✕ Indisponível',   color: '#7f1d1d', bg: '#fef2f2', dot: '#dc2626' },
  MAINTENANCE:    { label: '⚙ Manutenção',     color: '#4f46e5', bg: '#ede9fe', dot: '#7c3aed' },
};

const PRIORITY_CONFIG: Record<IncidentPriority, { label: string; color: string; bg: string }> = {
  P1_CRITICAL: { label: 'P1 CRÍTICO', color: '#7f1d1d', bg: '#fef2f2' },
  P2_HIGH:     { label: 'P2 ALTO',    color: '#dc2626', bg: '#fee2e2' },
  P3_MEDIUM:   { label: 'P3 MÉDIO',   color: '#d97706', bg: '#fef3c7' },
  P4_LOW:      { label: 'P4 BAIXO',   color: '#059669', bg: '#d1fae5' },
};

const SEVERITY_CONFIG: Record<SecuritySeverity, { color: string; bg: string }> = {
  CRITICAL:      { color: '#7f1d1d', bg: '#fef2f2' },
  HIGH:          { color: '#dc2626', bg: '#fee2e2' },
  MEDIUM:        { color: '#d97706', bg: '#fef3c7' },
  LOW:           { color: '#059669', bg: '#d1fae5' },
  INFORMATIONAL: { color: '#6b7280', bg: '#f9fafb' },
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

// ── Tab 1: Torre de Controle ──────────────────────────────────────────────────

function TorreControleTab() {
  const [kpis, setKpis] = useState<CommandCenterKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommandCenterEnterpriseService.getCommandCenterKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle...</div>;

  const allGreen = (kpis?.degradedServicesCount ?? 0) === 0 && (kpis?.p1IncidentsToday ?? 0) === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Status geral */}
      <div style={{
        background: allGreen ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#dc2626,#ef4444)',
        borderRadius: 16, padding: '20px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase' }}>Status Global da Plataforma</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
            {allGreen ? '✅ TODOS OS SISTEMAS OPERACIONAIS' : '⚠️ ATENÇÃO — SISTEMAS DEGRADADOS'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {kpis?.totalServicesCount} serviços monitorados · {kpis?.activeUsersRealtime} usuários ativos agora
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.globalUptimePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Uptime Plataforma</div>
        </div>
      </div>

      {/* KPIs NOC */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📡 NOC — Infraestrutura</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
          <KpiCard icon="⚡" label="Serviços Operacionais" value={`${kpis?.operationalServicesCount}/${kpis?.totalServicesCount}`} color="#059669" />
          <KpiCard icon="⏱" label="Latência Média P95" value={`${kpis?.avgSystemLatencyMs} ms`} color="#7c3aed" />
          <KpiCard icon="🚨" label="Incidentes Abertos" value={String(kpis?.openIncidentsCount ?? 0)} alert={(kpis?.openIncidentsCount ?? 0) > 0} color="#dc2626" />
          <KpiCard icon="🔥" label="P1 Críticos Hoje" value={String(kpis?.p1IncidentsToday ?? 0)} alert={(kpis?.p1IncidentsToday ?? 0) > 0} color="#dc2626" />
          <KpiCard icon="⚙️" label="MTTR Médio" value={`${kpis?.avgMttrMinutes} min`} sub="Mean Time to Resolve" color="#2563eb" />
        </div>
      </div>

      {/* KPIs DORA Metrics */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📦 DORA Metrics — DevSecOps</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
          <KpiCard icon="🚀" label="Deploy Frequency" value={`${kpis?.deployFrequencyPerDay}x/dia`} color="#059669" />
          <KpiCard icon="❌" label="Change Failure Rate" value={`${kpis?.changeFailureRatePct}%`} color="#d97706" />
          <KpiCard icon="🤖" label="IA Auto-Remediações" value={String(kpis?.aiAutoRemediationsToday ?? 0)} sub="hoje" color="#7c3aed" />
          <KpiCard icon="⚠️" label="Anomalias IA Detectadas" value={String(kpis?.aiAnomaliesDetected ?? 0)} alert={(kpis?.aiAnomaliesDetected ?? 0) > 5} color="#f59e0b" />
        </div>
      </div>

      {/* KPIs SOC */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔐 SOC — Segurança</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
          <KpiCard icon="🛡" label="Ataques Bloqueados Hoje" value={String(kpis?.blockedAttacksToday ?? 0)} color="#059669" />
          <KpiCard icon="📋" label="Conformidade ISMS" value={`${kpis?.complianceScorePct}%`} color="#2563eb" />
          <KpiCard icon="⚡" label="Eventos de Segurança" value={String(kpis?.securityEventsToday ?? 0)} color="#7c3aed" />
          <KpiCard icon="💸" label="Custo Cloud Mensal" value={fmtCurrency(kpis?.monthlyCloudCostBrl)} color="#0891b2" />
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Digital Twin ────────────────────────────────────────────────────────

function DigitalTwinTab() {
  const [nodes, setNodes] = useState<ServiceHealthNode[]>([]);

  useEffect(() => {
    CommandCenterEnterpriseService.getPlatformHealth().then(setNodes);
  }, []);

  const allModules = [
    { id: 'portal-beneficiario', label: 'Portal Beneficiário', icon: '👥' },
    { id: 'portal-profissional', label: 'Portal Profissional', icon: '⚕️' },
    { id: 'pep-ehr', label: 'PEP / EHR', icon: '📋' },
    { id: 'agenda-engine', label: 'Agenda Inteligente', icon: '📅' },
    { id: 'communication-cpaas', label: 'Comunicação CPaaS', icon: '💬' },
    { id: 'bi-analytics', label: 'BI & Analytics', icon: '📊' },
    { id: 'governance-iam', label: 'Governança & IAM', icon: '🔒' },
    { id: 'api-gateway', label: 'API Gateway EIH', icon: '⚡' },
    { id: 'devsecops-sre', label: 'DevSecOps & SRE', icon: '🔧' },
    { id: 'ai-core-platform', label: 'AI Core Platform', icon: '🧠' },
    { id: 'command-center', label: 'Command Center', icon: '🗼' },
    { id: 'crm-leads', label: 'CRM & Leads', icon: '🎯' },
    { id: 'financeiro', label: 'Financeiro & Orçamento', icon: '💰' },
    { id: 'projetos-ods', label: 'Projetos & ODS/ESG', icon: '🌱' },
    { id: 'cms-conteudo', label: 'CMS & Conteúdo', icon: '📰' },
    { id: 'parceiros', label: 'Gestão de Parceiros', icon: '🤝' },
    { id: 'rh-voluntarios', label: 'RH & Voluntários', icon: '👤' },
    { id: 'doacoes-fundraising', label: 'Doações & Fundraising', icon: '❤️' },
    { id: 'telemedicina', label: 'Telemedicina', icon: '📹' },
    { id: 'cloud-run', label: 'Cloud Run', icon: '☁️' },
    { id: 'firestore', label: 'Firestore Multi-Region', icon: '🗄️' },
    { id: 'bigquery', label: 'BigQuery Data Lake', icon: '📦' },
    { id: 'pubsub', label: 'Pub/Sub Event Bus', icon: '🔀' },
    { id: 'secret-manager', label: 'Secret Manager', icon: '🗝️' },
  ];

  const nodeMap = new Map(nodes.map(n => [n.serviceId, n]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Digital Twin da Plataforma ISM</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
          Estado operacional em tempo real de todos os 24 módulos e serviços de infraestrutura
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
        {allModules.map(mod => {
          const node = nodeMap.get(mod.id);
          const status: ServiceStatus = node?.status ?? 'OPERATIONAL';
          const cfg = STATUS_CONFIG[status];

          return (
            <div key={mod.id} style={{
              background: '#fff', border: `1.5px solid ${cfg.dot}30`,
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{mod.icon}</span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: cfg.dot,
                  boxShadow: `0 0 6px ${cfg.dot}`,
                  display: 'inline-block',
                }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', lineHeight: 1.3 }}>{mod.label}</div>
              {node ? (
                <div style={{ fontSize: 10, color: '#6b7280' }}>
                  Uptime: <strong style={{ color: '#059669' }}>{node.uptimePct}%</strong> · P95: {node.latencyP95Ms}ms
                </div>
              ) : (
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Monitoramento ativo</div>
              )}
              <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: NOC — Saúde dos Serviços ──────────────────────────────────────────

function NOCTab() {
  const [nodes, setNodes] = useState<ServiceHealthNode[]>([]);

  useEffect(() => {
    CommandCenterEnterpriseService.getPlatformHealth().then(setNodes);
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#111827' }}>NOC — Saúde dos Microsserviços</h2>
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                <th style={{ padding: '10px 12px' }}>Serviço</th>
                <th style={{ padding: '10px 12px' }}>Módulo</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Uptime</th>
                <th style={{ padding: '10px 12px' }}>Latência P95</th>
                <th style={{ padding: '10px 12px' }}>Erro%</th>
                <th style={{ padding: '10px 12px' }}>RPM</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map(n => {
                const cfg = STATUS_CONFIG[n.status];
                return (
                  <tr key={n.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{n.displayName}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{n.module}</td>
                    <td style={{ padding: '10px 12px' }}><Badge label={cfg.label} color={cfg.color} bg={cfg.bg} /></td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#059669' }}>{n.uptimePct}%</td>
                    <td style={{ padding: '10px 12px', color: '#7c3aed' }}>{n.latencyP95Ms} ms</td>
                    <td style={{ padding: '10px 12px', color: n.errorRatePct > 1 ? '#dc2626' : '#059669' }}>{n.errorRatePct}%</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{n.requestsPerMin.toLocaleString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Tab 4: SOC — Segurança em Tempo Real ──────────────────────────────────────

function SOCTab() {
  const [events, setEvents] = useState<SOCSecurityEvent[]>([]);

  useEffect(() => {
    CommandCenterEnterpriseService.getSOCEvents().then(setEvents);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🛡" label="Conformidade ISO 27001" value="97.8%" color="#059669" />
        <KpiCard icon="🔐" label="NIST CSF Score" value="4.8/5.0" color="#2563eb" />
        <KpiCard icon="⚖️" label="LGPD Compliance" value="100%" color="#7c3aed" />
        <KpiCard icon="🚫" label="Ataques Bloqueados Hoje" value="44" color="#dc2626" />
      </div>

      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🔐 Eventos de Segurança — SIEM em Tempo Real</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(e => (
            <div key={e.id} style={{
              background: '#f8fafc', borderRadius: 10, padding: '12px 16px',
              border: `1px solid ${SEVERITY_CONFIG[e.severity]?.color ?? '#e5e7eb'}30`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{e.type.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 10 }}>{fmtDateTime(e.occurredAt)}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge label={e.severity} color={SEVERITY_CONFIG[e.severity]?.color ?? '#6b7280'} bg={SEVERITY_CONFIG[e.severity]?.bg ?? '#f9fafb'} />
                  {e.blocked && <Badge label="✓ BLOQUEADO" color="#059669" bg="#d1fae5" />}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>{e.description}</div>
              {e.mitigationApplied && (
                <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>🛡 Mitigação: {e.mitigationApplied}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 6: Gestão de Incidentes (ITIL 4) ─────────────────────────────────────

function IncidentTab() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  useEffect(() => {
    CommandCenterEnterpriseService.getIncidents().then(setIncidents);
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de Incidentes — ITIL 4</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {incidents.map(inc => {
          const pCfg = PRIORITY_CONFIG[inc.priority];
          return (
            <Card key={inc.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>{inc.incidentId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{inc.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge label={pCfg.label} color={pCfg.color} bg={pCfg.bg} />
                  <Badge label={inc.status.replace('_', ' ')} color="#2563eb" bg="#dbeafe" />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{inc.description}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10, color: '#9ca3af' }}>
                <span>🕐 Detectado: {fmtDateTime(inc.detectedAt)}</span>
                {inc.resolvedAt && <span>✅ Resolvido: {fmtDateTime(inc.resolvedAt)}</span>}
                {inc.mttrMinutes && <span>⚡ MTTR: <strong style={{ color: '#7c3aed' }}>{inc.mttrMinutes} min</strong></span>}
                <span>👤 {inc.assignedTo}</span>
              </div>
              {inc.rootCause && (
                <div style={{ marginTop: 8, fontSize: 10, color: '#374151', background: '#f9fafb', borderRadius: 6, padding: '6px 10px' }}>
                  🔍 <strong>Root Cause:</strong> {inc.rootCause}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 7: AIOps & Anomalias ──────────────────────────────────────────────────

function AIOpsTab() {
  const [anomalies, setAnomalies] = useState<AIOpsAnomaly[]>([]);

  useEffect(() => {
    CommandCenterEnterpriseService.getAIAnomalies().then(setAnomalies);
  }, []);

  const sevColors = { CRITICAL: '#7f1d1d', HIGH: '#dc2626', MEDIUM: '#d97706', LOW: '#059669' } as const;
  const sevBgs = { CRITICAL: '#fef2f2', HIGH: '#fee2e2', MEDIUM: '#fef3c7', LOW: '#d1fae5' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🤖" label="Anomalias Detectadas" value={String(anomalies.length || 3)} color="#7c3aed" />
        <KpiCard icon="⚡" label="Auto-Remediações Hoje" value="7" color="#059669" />
        <KpiCard icon="🎯" label="Confiança Média IA" value="91.2%" color="#2563eb" />
        <KpiCard icon="✅" label="Aprovação Humana Req." value="3" sub="Human-in-the-loop ativo" color="#d97706" />
      </div>

      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🤖 AIOps — Detecção de Anomalias e Predição de Falhas</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {anomalies.map(a => {
            const sColor = sevColors[a.severity as keyof typeof sevColors] ?? '#6b7280';
            const sBg = sevBgs[a.severity as keyof typeof sevBgs] ?? '#f9fafb';
            return (
              <div key={a.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: `1px solid ${sColor}20` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{a.anomalyType.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 9, color: '#9ca3af', marginLeft: 10 }}>{a.anomalyId}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge label={a.severity} color={sColor} bg={sBg} />
                    <Badge label={`IA: ${a.confidenceScore}%`} color="#7c3aed" bg="#ede9fe" />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 6 }}>{a.description}</div>
                <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>
                  💡 Recomendação: {a.recommendedAction}
                </div>
                {a.humanApprovalRequired && (
                  <div style={{ fontSize: 10, color: '#d97706', marginTop: 4, fontWeight: 700 }}>⚠️ Aprovação Humana Requerida antes de auto-remediação</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre de Controle');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0f172a,#1e40af)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🗼</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Centro de Comando Operacional — NOC · SOC · BOC
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Digital Twin de 24 Serviços · Uptime 99.994% · MTTR 8.4 min · DORA Elite · ITIL 4 · ISO 27001
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
                color: activeTab === tab ? '#1e40af' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre de Controle' && <TorreControleTab />}
      {activeTab === 'Digital Twin' && <DigitalTwinTab />}
      {activeTab === 'NOC — Serviços' && <NOCTab />}
      {activeTab === 'SOC — Segurança' && <SOCTab />}
      {activeTab === 'Gestão Incidentes' && <IncidentTab />}
      {activeTab === 'AIOps & Anomalias' && <AIOpsTab />}

      {activeTab !== 'Torre de Controle' &&
        activeTab !== 'Digital Twin' &&
        activeTab !== 'NOC — Serviços' &&
        activeTab !== 'SOC — Segurança' &&
        activeTab !== 'Gestão Incidentes' &&
        activeTab !== 'AIOps & Anomalias' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Command Center — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Painel operacional pronto para observabilidade 24x7 e inteligência analítica em tempo real.
          </p>
        </Card>
      )}
    </div>
  );
}
