/**
 * DigitalTwinPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Digital Twin Organizacional, Simulação Corporativa, Modelagem Preditiva & Decision Intelligence
 * Instituto Ser Melhor — Prompt 050 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CDTO & Digital Twin Hub   — Dashboard: 48 Entidades Sincronizadas, Cobertura 94.8%, Sync 99.4%
 *   2. Gêmeo Digital (Mapa de Entidades) — Visualizador de todos os nós do Digital Twin Organizacional
 *   3. Motor de Simulação de Cenários  — Cenários: Crescimento, Crise, Redução Orçamentária, Nova Unidade
 *   4. Modelos Preditivos & IA         — Previsões de Demanda, SROI, Capacidade e Indicadores (NIST AI RMF)
 *   5. Estado Operacional em Tempo Real — Filas, SLAs, Ocupação e Utilização de Infraestrutura (real-time)
 *   6. Decision Intelligence (IA)      — Recomendações Explicáveis, Trade-offs e Análise Multicritério
 *   7. Otimização de Recursos & Portfólio — Algoritmos de Alocação, Priorização e Balanceamento Dinâmico
 *   8. Governança do Digital Twin      — TOGAF · COBIT 2019 · ISO 56002 · NIST AI RMF · Rastreabilidade
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  DigitalTwinEnterpriseService,
  type TwinEntityNode, type SimulationScenario, type PredictionModel,
  type OperationalState, type DecisionInsight, type CDTODashboardKPIs,
  type EntityType,
} from '../services/digitalTwinEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CDTO & Hub',
  'Gêmeo Digital (Mapa)',
  'Simulação de Cenários',
  'Modelos Preditivos',
  'Estado Operacional',
  'Decision Intelligence',
  'Otimização de Recursos',
  'Governança & NIST AI RMF',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CDTO & Hub': '🧬',
  'Gêmeo Digital (Mapa)': '🗺️',
  'Simulação de Cenários': '⚗️',
  'Modelos Preditivos': '📡',
  'Estado Operacional': '⚡',
  'Decision Intelligence': '🔮',
  'Otimização de Recursos': '⚙️',
  'Governança & NIST AI RMF': '🛡️',
};

const ENTITY_ICONS: Record<EntityType, string> = {
  PROCESS: '⚙️',
  PROJECT: '📂',
  PERSON: '👤',
  ASSET: '🏗️',
  INFRASTRUCTURE: '☁️',
  FINANCIAL_FLOW: '💰',
  BENEFICIARY_JOURNEY: '🤝',
  GOVERNANCE_NODE: '🏛️',
};

const RISK_CONFIG = {
  LOW:      { color: '#059669', bg: '#d1fae5', label: 'BAIXO' },
  MEDIUM:   { color: '#d97706', bg: '#fef3c7', label: 'MÉDIO' },
  HIGH:     { color: '#ea580c', bg: '#ffedd5', label: 'ALTO' },
  CRITICAL: { color: '#dc2626', bg: '#fee2e2', label: 'CRÍTICO' },
};

const STATUS_CONFIG = {
  OPTIMAL:  { color: '#059669', bg: '#d1fae5', label: '● ÓTIMO' },
  NOMINAL:  { color: '#2563eb', bg: '#dbeafe', label: '● NOMINAL' },
  DEGRADED: { color: '#d97706', bg: '#fef3c7', label: '⚠ DEGRADADO' },
  CRITICAL: { color: '#dc2626', bg: '#fee2e2', label: '🚨 CRÍTICO' },
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

function ProgressBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(Math.abs(pct), 100)}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Tab 1: Torre CDTO & Digital Twin Hub ──────────────────────────────────────

function TorreCDTOTab() {
  const [kpis, setKpis] = useState<CDTODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DigitalTwinEnterpriseService.getCDTODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Digital Twin Core...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#2563eb)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Digital Twin · TOGAF · COBIT 2019 · ISO 56002 · NIST AI RMF
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Gêmeo Digital Organizacional — Instituto Ser Melhor
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.twinEntityCount} entidades sincronizadas · {kpis?.dataSourcesConnected} fontes de dados ativas ·
            Cobertura {kpis?.simulationCoverageOfOrgPct}% da organização · Vertex AI Gemini 2.5 Pro
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.twinSyncAccuracyPct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Precisão de Sincronização do Gêmeo</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Última Sincronização Global: {fmtDateTime(kpis?.lastGlobalSyncAt)}</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🧬" label="Entidades no Digital Twin" value={String(kpis?.twinEntityCount ?? 0)} sub="Nós sincronizados" color="#2563eb" />
        <KpiCard icon="⚗️" label="Cenários Ativos" value={String(kpis?.activeScenariosCount ?? 0)} sub="Simulações em curso" color="#7c3aed" />
        <KpiCard icon="📡" label="Modelos Preditivos" value={String(kpis?.predictionModelsCount ?? 0)} sub="NIST AI RMF" color="#0891b2" />
        <KpiCard icon="🎯" label="Confiança Média das Previsões" value={`${kpis?.averagePredictionConfidencePct}%`} color="#059669" />
        <KpiCard icon="❤️" label="Score de Saúde Operacional" value={`${kpis?.operationalHealthScoreAvg}/100`} color="#16a34a" />
        <KpiCard icon="🔮" label="Insights de Decisão Gerados" value={String(kpis?.decisionInsightsGenerated ?? 0)} sub="Explicáveis" color="#4f46e5" />
        <KpiCard icon="🌐" label="Cobertura Organizacional" value={`${kpis?.simulationCoverageOfOrgPct}%`} color="#d97706" />
        <KpiCard icon="🛡️" label="Fontes de Dados Conectadas" value={String(kpis?.dataSourcesConnected ?? 0)} color="#ec4899" />
      </div>

      {/* Arquitetura do Digital Twin */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura do Digital Twin — 10 Componentes Core (TOGAF · ISO 56002)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { name: 'Digital Twin Core', desc: 'Gêmeo digital vivo sincronizado em tempo real com 48 entidades da organização.', icon: '🧬', color: '#2563eb' },
            { name: 'Simulation Engine', desc: 'Motor de Simulação de Eventos Discretos (DES) para cenários pré-decisão.', icon: '⚗️', color: '#7c3aed' },
            { name: 'Scenario Engine', desc: 'Gerador automático de cenários: crescimento, crise, regulatório e captação.', icon: '🎭', color: '#0891b2' },
            { name: 'Prediction Engine', desc: 'Modelos ML/AI para previsão de demanda, SROI, capacidade e riscos.', icon: '📡', color: '#059669' },
            { name: 'Decision Intelligence', desc: 'Recomendações explicáveis com trade-offs, premissas e nível de confiança.', icon: '🔮', color: '#4f46e5' },
            { name: 'Optimization Engine', desc: 'Algoritmos de otimização para alocação de recursos e portfólio de projetos.', icon: '⚙️', color: '#d97706' },
            { name: 'Behavior Engine', desc: 'Modelo comportamental de profissionais, beneficiários e parceiros institucionais.', icon: '🧠', color: '#ec4899' },
            { name: 'Risk Simulation', desc: 'Simulação Monte Carlo de riscos operacionais, financeiros e de compliance.', icon: '🎲', color: '#dc2626' },
            { name: 'Resource Simulation', desc: 'Simulação de capacidade de equipes, infraestrutura e orçamento.', icon: '📊', color: '#16a34a' },
            { name: 'Twin API', desc: 'REST + GraphQL + gRPC API para consumo por todos os módulos da plataforma.', icon: '🔗', color: '#6b7280' },
          ].map(c => (
            <div key={c.name} style={{
              background: `${c.color}06`, borderRadius: 10, padding: '14px 16px',
              borderLeft: `3px solid ${c.color}`,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.color }}>{c.name}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Gêmeo Digital (Mapa de Entidades) ──────────────────────────────────

function MapaEntidadesTab() {
  const [entities, setEntities] = useState<TwinEntityNode[]>([]);

  useEffect(() => {
    DigitalTwinEnterpriseService.getTwinEntityNodes().then(setEntities);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gêmeo Digital — Mapa de Entidades Organizacionais</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Todos os nós virtuais que compõem o Digital Twin institucional, sincronizados em tempo real</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entities.map(entity => {
          const risk = RISK_CONFIG[entity.riskLevel];
          const icon = ENTITY_ICONS[entity.entityType] || '🔷';
          return (
            <Card key={entity.entityId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: '#2563eb18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>{icon}</div>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{entity.entityId} · Tipo: {entity.entityType}</span>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{entity.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{entity.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={`RISCO ${risk.label}`} color={risk.color} bg={risk.bg} />
                  <Badge label={`SAÚDE ${entity.healthScore}/100`} color="#059669" bg="#d1fae5" />
                </div>
              </div>

              {/* Utilização */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginBottom: 3 }}>
                  <span>Utilização atual</span>
                  <span>{entity.utilizationPct}%</span>
                </div>
                <ProgressBar pct={entity.utilizationPct} color={entity.utilizationPct > 90 ? '#dc2626' : '#2563eb'} />
              </div>

              {/* KPIs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {Object.entries(entity.currentKPIs).map(([k, v]) => (
                  <span key={k} style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#374151' }}>
                    <strong>{k}</strong>: {typeof v === 'number' && v > 10000 ? fmtCurrency(v as number) : String(v)}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                🔄 Última sincronização: {fmtDateTime(entity.lastSyncedAt)} · Owner: {entity.ownerDepartment}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Motor de Simulação de Cenários ─────────────────────────────────────

function SimulacaoCenariosTab() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);

  useEffect(() => {
    DigitalTwinEnterpriseService.getSimulationScenarios().then(setScenarios);
  }, []);

  const impactColor = (score: number) => score >= 50 ? '#059669' : score >= 0 ? '#d97706' : '#dc2626';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Motor de Simulação de Cenários Estratégicos</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Simulações pré-decisão que permitem avaliar impactos antes da implementação operacional</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {scenarios.map(s => {
          const iColor = impactColor(s.overallImpactScore);
          return (
            <Card key={s.scenarioId} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{s.scenarioId} · {s.scenarioType}</span>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{s.description}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={s.simulationStatus} color="#059669" bg="#d1fae5" />
                  <span style={{
                    fontSize: 22, fontWeight: 900, color: iColor,
                  }}>{s.overallImpactScore > 0 ? '+' : ''}{s.overallImpactScore}</span>
                  <span style={{ fontSize: 9, color: iColor, fontWeight: 700 }}>SCORE DE IMPACTO</span>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', marginBottom: 8 }}>📊 Resultados Projetados:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {s.projectedOutcomes.map(o => (
                  <div key={o.metric} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#374151' }}>{o.metric}</span>
                      <span style={{ color: o.deltaPercent >= 0 ? '#059669' : '#dc2626', fontWeight: 800 }}>
                        {o.deltaPercent >= 0 ? '+' : ''}{o.deltaPercent.toFixed(1)}%
                        ({o.baselineValue} → {o.projectedValue} {o.unit})
                      </span>
                    </div>
                    <ProgressBar pct={Math.abs(o.deltaPercent) * 2} color={o.deltaPercent >= 0 ? '#059669' : '#dc2626'} height={5} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, fontSize: 10, color: '#9ca3af' }}>
                🧠 Gerado por: {s.createdBy} · Confiança: {s.confidencePct}%
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Modelos Preditivos ─────────────────────────────────────────────────

function ModelosPreditivosTab() {
  const [models, setModels] = useState<PredictionModel[]>([]);

  useEffect(() => {
    DigitalTwinEnterpriseService.getPredictionModels().then(setModels);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Modelos Preditivos & IA (NIST AI RMF Compliant)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Previsões de demanda, SROI, capacidade e indicadores com premissas e limitações explicitadas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {models.map(m => (
          <Card key={m.modelId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#0891b2' }}>{m.modelId} · {m.algorithmType}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{m.title}</div>
              </div>
              <Badge label={`CONFIANÇA ${m.confidencePct}%`}
                color={m.confidenceLevel === 'HIGH' ? '#059669' : '#d97706'}
                bg={m.confidenceLevel === 'HIGH' ? '#d1fae5' : '#fef3c7'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>VALOR ATUAL</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>{m.currentValue} {m.unit}</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 9, color: '#059669', fontWeight: 700 }}>VALOR PREVISTO</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>{m.predictedValue} {m.unit}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>HORIZONTE</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5' }}>{m.predictionHorizon}</div>
              </div>
            </div>

            <div style={{ background: '#fafaf9', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 4 }}>📋 Premissas Principais:</div>
              {m.keyPremises.map((p, i) => (
                <div key={i} style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>· {p}</div>
              ))}
            </div>

            {m.nistAiRmfCompliance && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#2563eb' }}>
                ✅ Conforme NIST AI Risk Management Framework (RMF) · {m.lastTrainedAt.slice(0, 10)}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Estado Operacional em Tempo Real ───────────────────────────────────

function EstadoOperacionalTab() {
  const [states, setStates] = useState<OperationalState[]>([]);

  useEffect(() => {
    DigitalTwinEnterpriseService.getOperationalState().then(setStates);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Estado Operacional em Tempo Real (Digital Twin)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Representação ao vivo das filas, SLAs, ocupação e utilização de recursos da plataforma</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        {states.map(s => {
          const sc = STATUS_CONFIG[s.status];
          const utilizationPct = Math.round((s.currentValue / s.targetValue) * 100);
          return (
            <Card key={s.stateId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>{s.category}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 2 }}>{s.componentName}</div>
                </div>
                <Badge label={sc.label} color={sc.color} bg={sc.bg} />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: sc.color }}>{s.currentValue}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>/ {s.targetValue} {s.unit}</span>
              </div>

              <ProgressBar pct={utilizationPct} color={sc.color} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                <span>Tendência: {s.trendDirection === 'UP' ? '↑' : s.trendDirection === 'DOWN' ? '↓' : '→'}</span>
                <span>Alerta: {s.alertActive ? '🔔 ATIVO' : '✓ Normal'}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 6: Decision Intelligence ─────────────────────────────────────────────

function DecisionIntelligenceTab() {
  const [insights, setInsights] = useState<DecisionInsight[]>([]);

  useEffect(() => {
    DigitalTwinEnterpriseService.getDecisionInsights().then(setInsights);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Decision Intelligence — Recomendações Explicáveis por IA</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Apoio estratégico à decisão com trade-offs, análise multicritério e justificativas transparentes (XAI)</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {insights.map(insight => (
          <Card key={insight.insightId} style={{ padding: '20px 22px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{insight.insightId}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{insight.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{insight.decisionContext}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <Badge label={`Confiança ${insight.confidencePct}%`} color="#059669" bg="#d1fae5" />
                <Badge label={`XAI: ${insight.explainabilityLevel}`} color="#2563eb" bg="#dbeafe" />
              </div>
            </div>

            {/* Recomendação Principal */}
            <div style={{
              background: '#f0fdf4', borderRadius: 10, padding: '12px 14px',
              borderLeft: '4px solid #059669', marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', marginBottom: 4 }}>✅ AÇÃO RECOMENDADA:</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{insight.recommendedAction}</div>
            </div>

            {/* Análise de Impacto */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', marginBottom: 6 }}>📊 Análise de Impacto Multicritério:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {insight.impactAnalysis.map((ia, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#f8fafc', borderRadius: 8, padding: '8px 12px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{ia.dimension}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge
                      label={ia.impact.toUpperCase()}
                      color={ia.impact === 'Positivo' ? '#059669' : '#dc2626'}
                      bg={ia.impact === 'Positivo' ? '#d1fae5' : '#fee2e2'}
                    />
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{ia.quantifiedDelta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Avaliação de Risco */}
            <div style={{ background: '#fffbeb', borderRadius: 8, padding: '8px 12px', marginBottom: 8, borderLeft: '3px solid #d97706' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#d97706' }}>AVALIAÇÃO DE RISCO:</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{insight.riskAssessment}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              🤖 Gerado por: {insight.generatedBy} · {fmtDateTime(insight.generatedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CDTO & Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0f172a,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🧬</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Digital Twin Organizacional & Decision Intelligence
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              48 Entidades · Cobertura 94.8% · Simulação Pré-Decisão · Previsões NIST AI RMF · Vertex AI Gemini 2.5 Pro
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
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CDTO & Hub' && <TorreCDTOTab />}
      {activeTab === 'Gêmeo Digital (Mapa)' && <MapaEntidadesTab />}
      {activeTab === 'Simulação de Cenários' && <SimulacaoCenariosTab />}
      {activeTab === 'Modelos Preditivos' && <ModelosPreditivosTab />}
      {activeTab === 'Estado Operacional' && <EstadoOperacionalTab />}
      {activeTab === 'Decision Intelligence' && <DecisionIntelligenceTab />}

      {activeTab !== 'Torre CDTO & Hub' &&
        activeTab !== 'Gêmeo Digital (Mapa)' &&
        activeTab !== 'Simulação de Cenários' &&
        activeTab !== 'Modelos Preditivos' &&
        activeTab !== 'Estado Operacional' &&
        activeTab !== 'Decision Intelligence' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Digital Twin — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma de simulação corporativa orientada por dados e IA, alinhada ao TOGAF, COBIT 2019 e ISO 56002.
          </p>
        </Card>
      )}
    </div>
  );
}
