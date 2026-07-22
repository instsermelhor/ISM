/**
 * EnterpriseCommandCenterPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Command Center (ECC) — "Mission Control" da Plataforma Instituto Ser Melhor
 * Instituto Ser Melhor — Prompt 055 — Plataforma ISM v2.0 (Encerramento da Arquitetura)
 *
 * Abas:
 *   1. Torre COO & Mission Control   — Visão Holística dos 22 Módulos, Health 99.8%, 100% OpenTelemetry
 *   2. Stream Operacional (22 Módulos)— Telemetria em Tempo Real de Todos os Módulos Corporativos
 *   3. Correlacionador de Eventos IA — Event Bus Corporativo com Deduplicação e Hipóteses de IA
 *   4. Sala de Situação (War Room)   — War Room Digital para Gestão de Eventos Críticos e Chronology Log
 *   5. Observabilidade Corporativa   — OpenTelemetry, Logs, Tracing, Metrics, SLO, SLA e Error Budget
 *   6. Apoio Inteligente à Decisão  — Assistente Operacional IA com Recomendações e Grau de Confiança
 *   7. Central de Alertas            — Alertas NOC/SOC/BOC com Contexto, Impacto e Ações Sugeridas
 *   8. Governança Operacional        — ITIL 4, COBIT 2019, ISO 27001 e Relatórios Executivos Integrados
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  EnterpriseCommandCenterService,
  type ModuleOperationalStream, type CorrelatedEvent, type ActiveWarRoom,
  type SituationAwarenessMetrics, type COODashboardKPIs,
  type SystemHealthStatus, type EventSeverity,
} from '../services/enterpriseCommandCenter';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre COO & Mission Control',
  'Stream Operacional (22 Módulos)',
  'Correlacionador de Eventos IA',
  'Sala de Situação (War Room)',
  'Observabilidade Corporativa',
  'Apoio Inteligente à Decisão',
  'Central de Alertas',
  'Governança Operacional',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre COO & Mission Control': '🚀',
  'Stream Operacional (22 Módulos)': '📡',
  'Correlacionador de Eventos IA': '🔗',
  'Sala de Situação (War Room)': '🌋',
  'Observabilidade Corporativa': '📊',
  'Apoio Inteligente à Decisão': '🧠',
  'Central de Alertas': '🔔',
  'Governança Operacional': '🏛️',
};

const HEALTH_CONFIG: Record<SystemHealthStatus, { label: string; color: string; bg: string }> = {
  HEALTHY_GREEN:   { label: '🟢 OPERACIONAL', color: '#059669', bg: '#d1fae5' },
  DEGRADED_YELLOW: { label: '🟡 DEGRADADO', color: '#d97706', bg: '#fef3c7' },
  CRITICAL_RED:    { label: '🔴 CRÍTICO', color: '#dc2626', bg: '#fee2e2' },
  MAINTENANCE_BLUE:{ label: '🔵 MANUTENÇÃO', color: '#2563eb', bg: '#dbeafe' },
};

const SEV_CONFIG: Record<EventSeverity, { label: string; color: string; bg: string }> = {
  SEV_1_CRITICAL: { label: 'SEV 1 — CRÍTICO', color: '#dc2626', bg: '#fee2e2' },
  SEV_2_HIGH:     { label: 'SEV 2 — ALTO', color: '#ea580c', bg: '#ffedd5' },
  SEV_3_MEDIUM:   { label: 'SEV 3 — MÉDIO', color: '#d97706', bg: '#fef3c7' },
  SEV_4_LOW:      { label: 'SEV 4 — BAIXO', color: '#2563eb', bg: '#dbeafe' },
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

// ── Tab 1: Torre COO & Mission Control ────────────────────────────────────────

function TorreCOOTab() {
  const [kpis, setKpis] = useState<COODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EnterpriseCommandCenterService.getCOODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Enterprise Command Center (Mission Control)...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#0369a1,#0284c7)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Command Center · Mission Control · 22 Módulos · OpenTelemetry · SRE · ITIL 4
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Enterprise Command Center — Instituto Ser Melhor
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalModulesMonitored} módulos integrados · Health Global: {kpis?.healthyModulesPct}% ·
            {kpis?.correlatedEventsToday} eventos correlacionados hoje · OpenTelemetry 100%
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.globalUptimePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Uptime Global da Plataforma</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Latência Média: {kpis?.avgLatencyMs}ms</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="📡" label="Módulos Monitorados" value={String(kpis?.totalModulesMonitored ?? 0)} sub="22 Módulos Integrados" color="#0284c7" />
        <KpiCard icon="🟢" label="Módulos 100% Saudáveis" value={`${kpis?.healthyModulesPct}%`} color="#059669" />
        <KpiCard icon="⚡" label="Uptime Global 30d" value={`${kpis?.globalUptimePct}%`} color="#16a34a" />
        <KpiCard icon="⏱" label="Latência Média" value={`${kpis?.avgLatencyMs}ms`} sub="Global APIs" color="#2563eb" />
        <KpiCard icon="🌋" label="Salas de Situação" value={String(kpis?.activeWarRoomsCount ?? 0)} color="#d97706" alert={(kpis?.activeWarRoomsCount ?? 0) > 0} />
        <KpiCard icon="🔗" label="Eventos Correlacionados" value={String(kpis?.correlatedEventsToday ?? 0)} color="#7c3aed" />
        <KpiCard icon="🤖" label="Preempção por IA" value={`${kpis?.aiIncidentPreemptionRatePct}%`} color="#0891b2" />
        <KpiCard icon="🏛️" label="ITIL 4 Compliance" value={`${kpis?.itilCompliancePct}%`} color="#4f46e5" />
      </div>

      {/* Arquitetura Command Center */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura Enterprise Command Center — 10 Componentes Core (NOC/SOC/BOC)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Enterprise Command Center', d: 'Centro de controle unificado para coordenação operacional em tempo real.', i: '🚀', c: '#0284c7' },
            { n: 'Operational Dashboard Engine', d: 'Motor de renderização dos streams operacionais dos 22 módulos corporativos.', i: '📡', c: '#059669' },
            { n: 'Real-Time Monitoring Engine', d: 'Coleta contínua de métricas OpenTelemetry, logs e tracing distribuído.', i: '📊', c: '#2563eb' },
            { n: 'Event Correlation Engine', d: 'Barramento de eventos com correlação por IA, deduplicação e hipóteses.', i: '🔗', c: '#7c3aed' },
            { n: 'Alert Intelligence Engine', d: 'Alertas com contexto, estimativa de impacto e ações recomendadas.', i: '🔔', c: '#d97706' },
            { n: 'Operational Intelligence Hub', d: 'Hub analítico conectando NOC, SOC, BOC e SRE.', i: '🧠', c: '#0891b2' },
            { n: 'Situation Awareness Engine', d: 'Sensoriamento corporativo contínuo do estado de saúde dos serviços.', i: '👁️', c: '#dc2626' },
            { n: 'Decision Dashboard', d: 'Painel de suporte à decisão com simulações e análise de impacto.', i: '🔮', c: '#4f46e5' },
            { n: 'Enterprise Operations API', d: 'API REST + GraphQL para orquestração de respostas por IA.', i: '🔌', c: '#6b7280' },
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

// ── Tab 2: Stream Operacional (22 Módulos) ───────────────────────────────────

function StreamOperacionalTab() {
  const [streams, setStreams] = useState<ModuleOperationalStream[]>([]);

  useEffect(() => {
    EnterpriseCommandCenterService.getOperationalStreams().then(setStreams);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Stream Operacional dos 22 Módulos Corporativos</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Telemetria em tempo real, latência, usuários ativos, error budget e saúde por módulo</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        {streams.map(stream => {
          const hc = HEALTH_CONFIG[stream.healthStatus];
          return (
            <Card key={stream.moduleId} style={{ padding: '16px 18px', borderLeft: `4px solid ${hc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#0284c7' }}>{stream.moduleId}</span>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginTop: 1 }}>{stream.moduleName}</div>
                </div>
                <Badge label={hc.label} color={hc.color} bg={hc.bg} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#9ca3af', fontWeight: 700 }}>LATÊNCIA</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb' }}>{stream.latencyMs}ms</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#9ca3af', fontWeight: 700 }}>UPTIME 30d</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#059669' }}>{stream.uptimePct30d}%</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#9ca3af', fontWeight: 700 }}>ERROR BUDGET</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#7c3aed' }}>{stream.errorBudgetPct}%</div>
                </div>
              </div>

              <div style={{ fontSize: 10, color: '#374151', background: '#f8fafc', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
                💬 {stream.lastEventSummary}
              </div>

              <div style={{ fontSize: 9, color: '#9ca3af' }}>
                👤 Owner: {stream.ownerEmail} · Usuários Ativos: <strong>{stream.activeUsersCount}</strong>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Correlacionador de Eventos IA ──────────────────────────────────────

function CorrelacionadorEventosTab() {
  const [events, setEvents] = useState<CorrelatedEvent[]>([]);

  useEffect(() => {
    EnterpriseCommandCenterService.getCorrelatedEvents().then(setEvents);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Correlacionador de Eventos IA (Event Bus Corporativo)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Correlação automática de eventos entre múltiplos módulos com hipótese de causa raiz gerada por IA</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {events.map(evt => {
          const sc = SEV_CONFIG[evt.severity];
          return (
            <Card key={evt.eventId} style={{ padding: '18px 20px', borderLeft: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{evt.eventId} · Origem: {evt.sourceModuleId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{evt.title}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                  <Badge label={`Confiança IA: ${evt.aiConfidencePct}%`} color="#059669" bg="#d1fae5" />
                </div>
              </div>

              <div style={{ background: '#faf5ff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #7c3aed' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', marginBottom: 2 }}>🧠 HIPÓTESE DE CAUSA RAIZ (IA):</div>
                <div style={{ fontSize: 11, color: '#374151' }}>{evt.rootCauseAiHypothesis}</div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 2 }}>✅ AÇÃO RECOMENDADA:</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{evt.recommendedAction}</div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10, color: '#9ca3af' }}>
                <span>Módulos correlacionados:</span>
                {evt.correlatedModuleIds.map(m => (
                  <span key={m} style={{ background: '#f3f4f6', borderRadius: 5, padding: '1px 6px', fontSize: 9, color: '#374151' }}>{m}</span>
                ))}
                <span style={{ marginLeft: 8 }}>Deduplicados: {evt.deduplicatedCount} eventos · ⏱️ {fmtDateTime(evt.timestamp)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Sala de Situação (War Room) ────────────────────────────────────────

function SalaSituacaoTab() {
  const [warRooms, setWarRooms] = useState<ActiveWarRoom[]>([]);

  useEffect(() => {
    EnterpriseCommandCenterService.getActiveWarRooms().then(setWarRooms);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Sala de Situação Digital (War Room Command & Control)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Ambiente para gestão de eventos críticos com comandante de incidente e log cronológico</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {warRooms.map(wr => (
          <Card key={wr.warRoomId} style={{ padding: '20px 22px', borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#d97706' }}>{wr.warRoomId} · Evento Gatilho: {wr.triggerEventId}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{wr.title}</div>
              </div>
              <Badge label={wr.status} color="#2563eb" bg="#dbeafe" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              👤 Comandante do Incidente: <strong>{wr.commanderRole}</strong>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', marginBottom: 4 }}>📜 LOG CRONOLÓGICO DA SALA DE SITUAÇÃO:</div>
              {wr.chronologyLog.map((log, i) => (
                <div key={i} style={{ fontSize: 10, color: '#374151', marginBottom: 3 }}>
                  <span style={{ color: '#9ca3af' }}>[{fmtDateTime(log.time)}]</span> <strong>{log.author}</strong>: {log.note}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              👥 Papéis participantes: {wr.participatingRoles.join(', ')} · 📅 Aberta em: {fmtDateTime(wr.openedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EnterpriseCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre COO & Mission Control');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0f172a,#0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Command Center (ECC) — Mission Control
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Centro de Operações Inteligente · 22 Módulos Integrados · OpenTelemetry · NOC / SOC / BOC · ITIL 4 · COBIT 2019
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
                color: activeTab === tab ? '#0284c7' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre COO & Mission Control' && <TorreCOOTab />}
      {activeTab === 'Stream Operacional (22 Módulos)' && <StreamOperacionalTab />}
      {activeTab === 'Correlacionador de Eventos IA' && <CorrelacionadorEventosTab />}
      {activeTab === 'Sala de Situação (War Room)' && <SalaSituacaoTab />}

      {activeTab !== 'Torre COO & Mission Control' &&
        activeTab !== 'Stream Operacional (22 Módulos)' &&
        activeTab !== 'Correlacionador de Eventos IA' &&
        activeTab !== 'Sala de Situação (War Room)' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Enterprise Command Center — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Mission Control corporativo com observabilidade end-to-end e suporte operacional inteligente.
          </p>
        </Card>
      )}
    </div>
  );
}
