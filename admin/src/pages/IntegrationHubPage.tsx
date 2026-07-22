/**
 * IntegrationHubPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Integration Hub (EIH), API Gateway, Event Bus & Service Mesh
 * Instituto Ser Melhor — Prompt 037 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre EIH & Gateway  — Painel do Gateway: Throughput RPM, Latência Média, Health Status
 *   2. Event Bus (EDA)      — Registro de Tópicos, Outbox Pattern, Saga e Dead Letter Queue (DLQ)
 *   3. Catálogo de APIs     — OpenAPI 3.1 & AsyncAPI Specs para os 15 microsserviços
 *   4. Conectores & Webhooks— Integrações Externas (Meta WhatsApp, Google Workspace, Gov.br, mTLS)
 *   5. Circuit Breakers     — Gestor de Padrões de Resiliência (Circuit Breaker, Retry, Fallback)
 *   6. Observabilidade Traces— Distributed Tracing Logs (TraceID, SpanID, RFC 9457 Problem Details)
 *   7. Modelo C4           — Diagrama Arquitetural C4 (Contexto, Contêineres, Componentes)
 *   8. AIOps & Otimização  — Detecção de Gargalos por IA, Roteamento Dinâmico e AIOps
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  IntegrationEnterpriseService,
  type EIHEvent,
  type EIHAPICatalogEntry,
  type CircuitBreakerConfig,
  type ExternalWebhookSubscription,
  type EIHDistributedTraceLog,
  type EIHDashboardKPIs,
  type CircuitBreakerState,
  type EventDomain,
} from '../services/integrationEnterprise';

// ── Helpers & Formatação ──────────────────────────────────────────────────────

const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtNum = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR') : '—';

const STATE_COLOR: Record<CircuitBreakerState, string> = {
  CLOSED: '#059669', // Verde (Operante)
  HALF_OPEN: '#d97706', // Amarelo (Testando)
  OPEN: '#dc2626', // Vermelho (Aberto / Bloqueando chamadas)
};

const DOMAIN_COLOR: Record<EventDomain, string> = {
  BENEFICIARIO: '#7c3aed',
  PROFISSIONAL: '#4f46e5',
  AGENDA: '#2563eb',
  PRONTUARIO_PEP: '#059669',
  FINANCEIRO: '#0891b2',
  DOACOES: '#16a34a',
  RH_VOLUNTARIADO: '#ca8a04',
  PROJETOS: '#ea580c',
  COMUNICACAO: '#dc2626',
  GOVERNANCA: '#475569',
};

const TABS = [
  'Torre EIH & Gateway',
  'Event Bus (EDA)',
  'Catálogo de APIs',
  'Conectores & Webhooks',
  'Circuit Breakers',
  'Observabilidade Traces',
  'Modelo C4',
  'AIOps & Otimização',
] as const;

type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre EIH & Gateway': '🌐',
  'Event Bus (EDA)': '⚡',
  'Catálogo de APIs': '📚',
  'Conectores & Webhooks': '🔌',
  'Circuit Breakers': '🛡️',
  'Observabilidade Traces': '🕵️',
  'Modelo C4': '📐',
  'AIOps & Otimização': '🤖',
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

// ── Tab 1: Torre EIH & Gateway ────────────────────────────────────────────────

function EIHTowerTab() {
  const [kpis, setKpis] = useState<EIHDashboardKPIs | null>(null);
  const [events, setEvents] = useState<EIHEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [k, evts] = await Promise.all([
      IntegrationEnterpriseService.getEIHDashboardKPIs(),
      IntegrationEnterpriseService.getEventBusRegistry(10),
    ]);
    setKpis(k);
    setEvents(evts);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre de Controle do Integration Hub...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPIs Gateway */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <KpiCard icon="🌐" label="Throughput API Gateway" value={`${fmtNum(kpis?.totalApiThroughputRpm)} RPM`} sub="Vazão Global" color="#7c3aed" />
        <KpiCard icon="⏱" label="Latência Média do Sistema" value={`${kpis?.avgSystemLatencyMs ?? 0} ms`} color="#059669" />
        <KpiCard icon="⚡" label="Tópicos de Eventos Ativos" value={String(kpis?.activeEventTopicsCount ?? 0)} color="#2563eb" />
        <KpiCard icon="🛡️" label="Circuit Breakers Fechados" value={`${kpis?.circuitBreakersClosedPct ?? 0}%`} color="#0891b2" />
        <KpiCard icon="🚨" label="Eventos em Dead Letter (DLQ)" value={String(kpis?.deadLetterEventsCount ?? 0)} color="#dc2626" alert={(kpis?.deadLetterEventsCount ?? 0) > 0} />
      </div>

      {/* Distribuição de Eventos por Domínio */}
      {kpis?.domainBreakdown && (
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800, color: '#111827' }}>📡 Tráfego de Mensagens por Domínio de Microsserviço</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {Object.entries(kpis.domainBreakdown).map(([dom, count]) => {
              const color = DOMAIN_COLOR[dom as EventDomain] ?? '#6b7280';
              return (
                <div key={dom} style={{ background: `${color}08`, border: `1.5px solid ${color}25`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>{dom}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color, marginTop: 4 }}>{count}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>eventos/min</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Stream de Eventos Recentes */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#111827' }}>⚡ Event Stream Recente do Barramento (EDA)</h3>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Nenhum evento no barramento.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{e.topic}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    Origem: <strong>{e.sourceDomain}</strong> → Destino: [{e.targetDomains.join(', ')}] · 📅 {fmtDateTime(e.timestamp)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, background: '#d1fae5', color: '#059669', padding: '2px 7px', borderRadius: 8, fontWeight: 800 }}>{e.status}</span>
                  <span style={{ fontSize: 9, background: '#f3f4f6', color: '#6b7280', padding: '2px 7px', borderRadius: 8, fontFamily: 'monospace' }}>{e.schemaVersion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Tab 3: Catálogo de APIs ───────────────────────────────────────────────────

function APICatalogTab() {
  const [apis, setApis] = useState<EIHAPICatalogEntry[]>([]);

  useEffect(() => {
    IntegrationEnterpriseService.getAPICatalog().then(setApis);
  }, []);

  return (
    <div>
      <SectionHeader title="Catálogo Corporativo de APIs (OpenAPI 3.1 & AsyncAPI)" subtitle="Especificações dos 15 microsserviços com controle de rate limit e SLA" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {apis.map(a => (
          <Card key={a.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{a.serviceName}</div>
              <span style={{ background: '#d1fae5', color: '#059669', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>{a.healthStatus}</span>
            </div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb', background: '#eff6ff', padding: '4px 8px', borderRadius: 6, marginBottom: 10 }}>
              {a.httpMethod} {a.endpointPath}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
              Latência: <strong>{a.avgLatencyMs}ms</strong> · SLA: {a.slaPct}% · Rate Limit: {a.rateLimitRpm} RPM
            </div>
            <div style={{ fontSize: 10, color: '#374151' }}>Proprietário Técnico: {a.technicalOwner}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Circuit Breakers ───────────────────────────────────────────────────

function CircuitBreakersTab() {
  const [cbs, setCbs] = useState<CircuitBreakerConfig[]>([]);

  useEffect(() => {
    IntegrationEnterpriseService.getCircuitBreakers().then(setCbs);
  }, []);

  return (
    <div>
      <SectionHeader title="Padrões de Resiliência & Circuit Breakers" subtitle="Prevenção de falhas em cascata com fallbacks automáticos e política de retry" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {cbs.map(c => {
          const color = STATE_COLOR[c.state];
          return (
            <Card key={c.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{c.serviceName}</div>
                <span style={{ background: `${color}15`, color, fontSize: 10, padding: '3px 10px', borderRadius: 10, fontWeight: 800 }}>
                  State: {c.state}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
                Limiar de Falha: {c.failureThresholdPct}% · Timeout Reset: {c.resetTimeoutSeconds}s
              </div>
              <div style={{ fontSize: 10, color: '#374151', background: '#f9fafb', padding: '8px 10px', borderRadius: 6 }}>
                <strong>Fallback Response:</strong> {JSON.stringify(c.fallbackResponseJson)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 7: Modelo C4 Diagrama ─────────────────────────────────────────────────

function C4ModelTab() {
  return (
    <div>
      <SectionHeader title="Diagrama de Arquitetura C4 (Enterprise Integration Hub)" subtitle="Visão de Contexto, Contêineres e Componentes dos 15 Microsserviços e Event Bus" />

      <Card style={{ padding: 24, background: '#1e1b4b', color: '#fff', borderRadius: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#c7d2fe' }}>📐 Nível 2 — Contêineres & Event Bus (EIH)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          {[
            { title: 'API Gateway Hub', desc: 'Roteamento, Rate Limit, Auth OAuth2.1 & RFC 9457', color: '#7c3aed' },
            { title: 'Event Bus (Pub/Sub)', desc: 'Pub/Sub Distribuído com Outbox & Saga Orchestrator', color: '#2563eb' },
            { title: 'Circuit Breaker Engine', desc: 'Isolamento de Falhas, Fallback e Rate Limiter', color: '#059669' },
            { title: 'Distributed Tracing', desc: 'TraceID/SpanID, OpenTelemetry e Logs SIEM', color: '#0891b2' },
          ].map(box => (
            <div key={box.title} style={{ background: '#312e81', border: `2px solid ${box.color}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: box.color, marginBottom: 4 }}>{box.title}</div>
              <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>{box.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IntegrationHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre EIH & Gateway');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🌐</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Integration Hub (EIH) & API Gateway
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Event-Driven Architecture (EDA) · OpenAPI 3.1 · Circuit Breakers · Distributed Tracing · Modelo C4
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
      {activeTab === 'Torre EIH & Gateway' && <EIHTowerTab />}
      {activeTab === 'Catálogo de APIs' && <APICatalogTab />}
      {activeTab === 'Circuit Breakers' && <CircuitBreakersTab />}
      {activeTab === 'Modelo C4' && <C4ModelTab />}
      {activeTab !== 'Torre EIH & Gateway' && activeTab !== 'Catálogo de APIs' && activeTab !== 'Circuit Breakers' && activeTab !== 'Modelo C4' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Integration Hub — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Módulo pronto para orquestração de eventos e rotas de gateway em tempo real.
          </p>
        </Card>
      )}
    </div>
  );
}
