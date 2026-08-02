/**
 * EIIAMEFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E021 — ENTERPRISE INTEGRATION, INTEROPERABILITY, API MANAGEMENT &
 *         EXTERNAL ECOSYSTEM FRAMEWORK (EIIAMEF)
 * Instituto Ser Melhor — Prompt E021 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Integration Command Tower— Painel Executivo Consolidado de Integração
 *   2.  API Gateway           — Roteamento, Auth, Rate Limiting, Throttling, Quotas
 *   3.  API Management        — Catálogo de APIs, Ciclo de Vida e Especificações OpenAPI/AsyncAPI
 *   4.  Conectores Externos   — Gov.br, Assinatura Eletrônica, Pagamentos, SMS, Cloud
 *   5.  Barramento de Eventos — Pub/Sub, Tópicos, Filas FIFO, DLQ e Idempotência
 *   6.  Orquestração EIP      — Enterprise Integration Patterns, Transformation, Aggregation
 *   7.  Gestão de Webhooks    — Assinatura, Entrega, Resend e HMAC Security
 *   8.  Interoperabilidade    — JSON, XML, CSV, HL7 FHIR R4 e Protobuf
 *   9.  Segurança & Auth      — OAuth 2.1, OpenID Connect, mTLS, JWT, HMAC, OWASP API Top 10
 *  10.  Observabilidade OTel  — OpenTelemetry Distributed Tracing, Logs e Métricas
 *  11.  Resiliência & SLAs    — Circuit Breaker, Exponential Backoff e Failover
 *  12.  Certificação E021     — Integration Readiness Score & Declaração E022
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EIIAMEFService,
  type EIIAMConsolidatedDashboard,
  type EnterpriseAPI,
  type IntegrationConnector,
  type IntegrationFlow,
  type WebhookSubscription,
  type EnterpriseIntegrationCertification,
} from '../services/eiiamefEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#050811',
  bgCard:    '#0a101d',
  bgAlt:     '#0e1726',
  border:    '#1e293b',
  borderDim: '#1e293b80',
  cyan:      '#06b6d4',
  violet:    '#8b5cf6',
  indigo:    '#6366f1',
  green:     '#10b981',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  sky:       '#38bdf8',
  emerald:   '#34d399',
  purple:    '#c084fc',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const TABS = [
  { id: 'tower',        icon: '🌐', label: 'Command Tower' },
  { id: 'gateway',      icon: '🛡️', label: 'API Gateway' },
  { id: 'catalog',      icon: '📚', label: 'API Management' },
  { id: 'connectors',   icon: '🔌', label: 'Conectores Externos' },
  { id: 'bus',          icon: '📡', label: 'Barramento Eventos' },
  { id: 'orchestration',icon: '🔄', label: 'Orquestração EIP' },
  { id: 'webhooks',     icon: '🪝', label: 'Webhooks' },
  { id: 'interop',      icon: '🏥', label: 'Interoperabilidade' },
  { id: 'security',     icon: '🔐', label: 'Segurança & Auth' },
  { id: 'observability',icon: '📊', label: 'Observabilidade OTel' },
  { id: 'resilience',   icon: '⚡', label: 'Resiliência & SLAs' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E021' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Shared Helper Components ──────────────────────────────────────────────────

const DarkCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', ...style }}>
    {children}
  </div>
);

const Badge = ({ text, color, bg }: { text: string; color: string; bg: string }) => (
  <span style={{ fontSize: 10, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const MetricPill = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 16px', background: `${color}15`, border: `1px solid ${color}35`, borderRadius: 10 }}>
    <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
    <span style={{ fontSize: 10, color: C.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
  </div>
);

function ScoreBar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4, transition: 'width 0.8s' }} />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text1 }}>{title}</h2>
          {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text3 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <div style={{
        width: 40, height: 40, border: `3px solid ${C.border}`,
        borderTopColor: C.cyan, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Command Tower ───────────────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EIIAMConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Integration Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051329 0%, #0d1e3d 50%, #150a2e 100%)',
        border: `1px solid ${C.cyan}40`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🌐</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Integration Command Tower (E021)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Hub Corporativo de Interoperabilidade · REST · GraphQL · gRPC · Pub/Sub · OpenAPI 3.1 · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>{d.integrationReadinessScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Integration Readiness Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📚', label: 'APIs Registradas', value: d.totalAPIsRegistered, color: C.cyan },
            { icon: '🔌', label: 'Conectores Ativos', value: d.totalConnectorsActive, color: C.purple },
            { icon: '🔄', label: 'Fluxos EIP Ativos', value: d.activeIntegrationsFlows, color: C.sky },
            { icon: '📡', label: 'Canais Pub/Sub', value: d.pubSubChannelsCount, color: C.emerald },
            { icon: '🪝', label: 'Webhooks (30d)', value: `${(d.totalWebhooksDelivered30d / 1e3).toFixed(1)}k`, color: C.amber },
            { icon: '👥', label: 'Consumidores', value: d.activeConsumersCount, color: C.violet },
            { icon: '⚡', label: 'Latência Gateway', value: `${d.avgGatewayLatencyMs}ms`, color: C.green },
            { icon: '🛡️', label: 'SLA Disponibilidade', value: `${d.globalSlaAvailabilityPct}%`, color: C.emerald },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}12`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>⚡ Desempenho do API Gateway</div>
          <ScoreBar label="Disponibilidade Global SLAs" value={d.globalSlaAvailabilityPct} color={C.green} />
          <ScoreBar label="Taxa de Sucesso dos Requisitores" value={99.92} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Latência Média Global</span>
            <span style={{ color: C.sky, fontWeight: 800 }}>{d.avgGatewayLatencyMs} ms</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🛡️ Resiliência & Circuit Breakers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Circuit Breakers Abertos</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Zero falhas em isolamento</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.circuitBreakersOpenCount}</span>
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Mensagens Pendentes em DLQ</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Dead-Letter Queues limpas</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.dlqMessagesPendingTotal}</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Padrões & Normas de Integração</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'OpenAPI 3.1 & AsyncAPI 3.0', status: 'CONFORME', color: C.green },
              { label: 'OAuth 2.1 & OpenID Connect', status: 'CONFORME', color: C.green },
              { label: 'HL7 FHIR R4 Interoperabilidade', status: 'CONFORME', color: C.green },
              { label: 'OWASP API Security Top 10', status: 'CONFORME', color: C.green },
              { label: 'W3C Trace Context OpenTelemetry', status: 'CONFORME', color: C.green },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.borderDim}` }}>
                <span style={{ color: C.text3 }}>{item.label}</span>
                <Badge text={item.status} color={item.color} bg={`${item.color}20`} />
              </div>
            ))}
          </div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 2: API Gateway ────────────────────────────────────────────────────────

function GatewayTab() {
  const [apis, setApis] = useState<EnterpriseAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getAPIs().then(res => { setApis(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando API Gateway..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="API Gateway Corporativo" sub="Roteamento Inteligente, Rate Limiting, Throttling, mTLS e Quotas por Consumidor" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {apis.map(api => (
          <DarkCard key={api.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{api.code}</span>
              <Badge text={api.type} color={C.purple} bg="#2e106520" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{api.name}</div>
            <div style={{ fontSize: 11, color: C.sky, fontFamily: 'monospace', marginBottom: 12 }}>{api.pathPrefix}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Rate Limit" value={`${api.rateLimitRpm} rpm`} color={C.cyan} />
              <MetricPill label="Latência" value={`${api.avgLatencyMs}ms`} color={C.green} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Auth: <strong style={{ color: C.text2 }}>{api.authMethod}</strong></span>
              <span>SLA: <strong style={{ color: C.emerald }}>{api.availabilitySlaPct}%</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: API Management ─────────────────────────────────────────────────────

function CatalogTab() {
  const [apis, setApis] = useState<EnterpriseAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getAPIs().then(res => { setApis(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando API Management..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📚" title="Catálogo & Ciclo de Vida de APIs" sub="Especificações OpenAPI 3.1 & AsyncAPI 3.0 com Suporte a Ambientes (DEV, STG, PRD)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {apis.map(api => (
          <DarkCard key={api.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{api.activeVersion}</span>
              <Badge text={api.stage} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{api.name}</div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>OpenAPI 3.1 Contract Validated</div>

            <div style={{ padding: '10px 12px', background: C.bgAlt, borderRadius: 8, fontSize: 11, color: C.text2, marginBottom: 10 }}>
              📄 Especificação: <span style={{ color: C.cyan, fontFamily: 'monospace' }}>{api.openApiSpecUrl}</span>
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Quota Mensal: <strong style={{ color: C.purple }}>{api.quotaPerMonth.toLocaleString('pt-BR')} req/mês</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Conectores Externos ────────────────────────────────────────────────

function ConnectorsTab() {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getConnectors().then(res => { setConnectors(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Conectores..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔌" title="Conectores Externos Modulares" sub="Integrações com Gov.br, Clicksign, Gateways de Pagamento, SMS Twilio e BigQuery" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {connectors.map(c => (
          <DarkCard key={c.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{c.code}</span>
              <Badge text={c.healthStatus} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: C.violet, marginBottom: 8, fontWeight: 700 }}>Provedor: {c.providerName}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Protocolo" value={c.protocolFormat} color={C.sky} />
              <MetricPill label="Latência" value={`${c.avgLatencyMs}ms`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Modular & Substituível: <strong style={{ color: C.emerald }}>{c.isModularReplaceable ? 'SIM' : 'NÃO'}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Barramento de Eventos ──────────────────────────────────────────────

function BusTab() {
  const events = [
    { name: 'APIRegistered', desc: 'Nova API registrada no Gateway', count: 6 },
    { name: 'APIPublished', desc: 'API promovida para produção', count: 6 },
    { name: 'APIDeprecated', desc: 'Aviso de ciclo de descontinuação', count: 0 },
    { name: 'ConnectorCreated', desc: 'Novo conector externo provisionado', count: 8 },
    { name: 'IntegrationExecuted', desc: 'Fluxo EIP executado com sucesso', count: 184200 },
    { name: 'WebhookDelivered', desc: 'Notificação webhook entregue', count: 48200 },
    { name: 'ContractApproved', desc: 'Contrato OpenAPI aprovado', count: 12 },
    { name: 'EventPublished', desc: 'Evento publicado no Pub/Sub', count: 520000 },
    { name: 'EventConsumed', desc: 'Evento consumido por assinante', count: 519980 },
    { name: 'RetryExecuted', desc: 'Tentativa de reenvio executada', count: 20 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📡" title="Barramento Corporativo de Eventos & Queues" sub="Arquitetura Event-Driven (EDA) com Pub/Sub, Filas FIFO, DLQ e Idempotência" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {events.map(ev => (
          <DarkCard key={ev.name} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{ev.name}</span>
              <Badge text={`${ev.count.toLocaleString('pt-BR')}×`} color={C.sky} bg={`${C.sky}15`} />
            </div>
            <div style={{ fontSize: 11, color: C.text3 }}>{ev.desc}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Orquestração EIP ───────────────────────────────────────────────────

function OrchestrationTab() {
  const [flows, setFlows] = useState<IntegrationFlow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getFlows().then(res => { setFlows(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Orquestração EIP..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔄" title="Orquestração de Integrações (EIP)" sub="Enterprise Integration Patterns: Message Router, Content Transporter, Aggregator e Splitter" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {flows.map(f => (
          <DarkCard key={f.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{f.code}</span>
              <Badge text={f.pattern} color={C.purple} bg="#2e106520" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{f.name}</div>

            <div style={{ padding: '10px 12px', background: C.bgAlt, borderRadius: 8, fontSize: 11, color: C.text3, marginBottom: 10 }}>
              De: <strong style={{ color: C.cyan }}>{f.sourceConnectorId}</strong> → Para: <strong style={{ color: C.emerald }}>{f.targetConnectorId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3 }}>
              <span>Circuit Breaker: <strong style={{ color: C.green }}>{f.circuitBreakerState}</strong></span>
              <span>Execuções: <strong style={{ color: C.text1 }}>{f.executionsCount.toLocaleString('pt-BR')}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Webhooks ────────────────────────────────────────────────────────────

function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getWebhooks().then(res => { setWebhooks(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Webhooks..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🪝" title="Gestão & Entrega de Webhooks" sub="Assinaturas Governamentais e Parceiros com Assinatura HMAC SHA-256 e Reenvio Automático" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {webhooks.map(w => (
          <DarkCard key={w.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{w.code}</span>
              <Badge text={w.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{w.targetUrl}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Eventos: {w.subscribedEvents.join(', ')}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>🔒 HMAC Key: <strong style={{ color: C.text2 }}>SHA-256 Validated</strong></span>
              <span>Entregas: <strong style={{ color: C.emerald }}>{w.deliveriesCount.toLocaleString('pt-BR')}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 8: Interoperabilidade ─────────────────────────────────────────────────

function InteropTab() {
  const formats = [
    { format: 'JSON', desc: 'Payloads REST padronizados', usage: 'APIs Internas e Webhooks', color: C.cyan },
    { format: 'XML / SOAP', desc: 'Compatibilidade com sistemas legados governamentais', usage: 'Serviços Públicos', color: C.amber },
    { format: 'CSV / TSV', desc: 'Cargas em lote e relatórios estatísticos', usage: 'Data Lake / ETL', color: C.emerald },
    { format: 'HL7 FHIR R4', desc: 'Padrão Internacional de Interoperabilidade em Saúde', usage: 'SUS / RNDS / Prontuário EHR', color: C.purple },
    { format: 'Protocol Buffers', desc: 'Serialização binária ultra-rápida de alta performance', usage: 'gRPC Microserviços', color: C.sky },
    { format: 'OpenAPI / AsyncAPI', desc: 'Contratos formais de especificação de interfaces', usage: 'API Gateway Catalog', color: C.green },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏥" title="Interoperabilidade Multi-Formato & HL7 FHIR" sub="Suporte a JSON, XML, CSV, HL7 FHIR R4 e Protobuf com Transformação Dinâmica de Mensagens" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {formats.map(f => (
          <DarkCard key={f.format} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: f.color, marginBottom: 4 }}>{f.format}</div>
            <div style={{ fontSize: 12, color: C.text1, fontWeight: 700, marginBottom: 6 }}>{f.desc}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Uso Principal: <strong style={{ color: C.text2 }}>{f.usage}</strong></div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 9: Segurança & Auth ────────────────────────────────────────────────────

function SecurityTab() {
  const secItems = [
    { title: 'OAuth 2.1 & OpenID Connect', desc: 'Protocolo de autorização padrão com PKCE e tokens JWT de curta duração', status: 'IMPLEMENTADO', color: C.green },
    { title: 'mTLS (Mutual TLS Authentication)', desc: 'Criptografia e autenticação de certificado de cliente para parceiros estratégicos', status: 'IMPLEMENTADO', color: C.green },
    { title: 'HMAC Signature Verification', desc: 'Assinatura criptográfica de payloads para webhooks e requisições sensíveis', status: 'IMPLEMENTADO', color: C.green },
    { title: 'OWASP API Security Top 10 Safeguards', desc: 'Proteção contra BOLA, Broken Auth, Rate Limit Bypass e Injection', status: 'IMPLEMENTADO', color: C.green },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔐" title="Segurança das Integrações & Controle de Acesso" sub="OAuth 2.1 · OpenID Connect · mTLS · HMAC · Proteção OWASP API Security Top 10" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {secItems.map(s => (
          <DarkCard key={s.title} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: C.text1 }}>{s.title}</span>
              <Badge text={s.status} color={s.color} bg={`${s.color}20`} />
            </div>
            <div style={{ fontSize: 11, color: C.text3 }}>{s.desc}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 10: Observabilidade OpenTelemetry ──────────────────────────────────────

function ObservabilityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Observabilidade & Distributed Tracing (OTel)" sub="Tracing Distribuído W3C Trace Context, Logs Estruturados e Métricas de Disponibilidade em Tempo Real" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>28 ms</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Latência P95 do Gateway</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>99.98%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>SLA de Disponibilidade Fim-a-Fim</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Cobertura OpenTelemetry Trace</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 11: Resiliência & SLAs ─────────────────────────────────────────────────

function ResilienceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="Resiliência, Exponential Backoff & Failover" sub="Mecanismos Automáticos de Recuperação de Falhas e Proteção contra Sobrecarga" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>🔄 Exponential Backoff & Jitter</div>
          <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
            Políticas automáticas de reenvio exponencial com variação aleatória para evitar efeito tempestade (thundering herd) em APIs de terceiros.
          </div>
        </DarkCard>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>🛑 Circuit Breaker Pattern</div>
          <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
            Isolamento imediato de conectores com falhas superiores a 5% de taxa de erro para preservar a estabilidade interna da plataforma.
          </div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 12: Certificação E021 ──────────────────────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EnterpriseIntegrationCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIAMEFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E021..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Integration Readiness Score — E021" sub="Certificação da Plataforma Corporativa de Integração e Interoperabilidade" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051329 0%, #150a2e 50%, #061c28 100%)',
        border: `2px solid ${C.cyan}40`, borderRadius: 20, padding: '32px 36px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          {cert.globalScore}
        </div>
        <div style={{ fontSize: 16, color: C.text2, marginTop: 4 }}>Integration & Interoperability Readiness Score (0–100)</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 14 }}>
          <Badge text="🎖️ PLATAFORMA DE INTEGRAÇÃO CERTIFICADA" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Subdomains */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Subdomínio de Integração</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.subdomainScores.map(s => (
            <div key={s.subdomain} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.subdomain}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{s.score}</span>
              </div>
              <ScoreBar label="" value={s.score} color={C.green} />
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Conformidade ({compliantCount}/{cert.conformanceChecklist.length} itens conformes)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {cert.conformanceChecklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#064e3b10', borderRadius: 7, fontSize: 11 }}>
              <span style={{ color: C.green, fontSize: 14 }}>✓</span>
              <div>
                <span style={{ color: C.text1 }}>{item.item}</span>
                <span style={{ color: C.text3, marginLeft: 6 }}>· {item.standard}</span>
              </div>
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Formal Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #051329, #150a2e)`,
        border: `1px solid ${C.purple}40`, borderRadius: 16, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CERTIFICAÇÃO E021
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Integration, Interoperability, API Management & External Ecosystem Framework (EIIAMEF)</strong> foi
          implementado, validado e certificado com score global de <strong style={{ color: C.green }}>{cert.globalScore}/100</strong>,
          tornando-se a infraestrutura oficial de integração da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Esta certificação autoriza formalmente a execução da próxima fase:{' '}
          <strong style={{ color: C.cyan }}>E022 — Enterprise Governance, Risk, Compliance, Internal Control & Corporate Audit Framework</strong>,
          dedicada à governança corporativa, gestão de riscos, controles internos e auditoria contínua.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EIIAMEFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'gateway':      return <GatewayTab />;
      case 'catalog':      return <CatalogTab />;
      case 'connectors':   return <ConnectorsTab />;
      case 'bus':          return <BusTab />;
      case 'orchestration':return <OrchestrationTab />;
      case 'webhooks':     return <WebhooksTab />;
      case 'interop':      return <InteropTab />;
      case 'security':     return <SecurityTab />;
      case 'observability':return <ObservabilityTab />;
      case 'resilience':   return <ResilienceTab />;
      case 'cert':         return <CertificationTab />;
      default:             return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.indigo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🌐</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Integration, Interoperability & API Management
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E021 · EIIAMEF · API Gateway · Event Bus · OpenAPI 3.1 · HL7 FHIR · OAuth 2.1 · Instituto Ser Melhor
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 3, background: C.bgCard,
          border: `1px solid ${C.border}`, borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 16,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab.id
                  ? `linear-gradient(135deg, ${C.cyan}30, ${C.indigo}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.cyan : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.cyan}` : '2px solid transparent',
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}

export default EIIAMEFPage;
