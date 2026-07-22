/**
 * EnterpriseIntelligencePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Intelligence Platform (EIP) — Analytics Cognitivo & Decision Intelligence
 * Instituto Ser Melhor — Prompt 052 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CDAO & EIP Hub        — Dashboard: 148 Insights, 840 Nós KG, 284 KPIs Unificados, 98.2% QS
 *   2. Intelligence Insights (IA)  — Insights Corporativos: Descritivo, Diagnóstico, Preditivo, Prescritivo, Causal
 *   3. Knowledge Graph Corporativo — Grafo de Conhecimento: Pessoas, Projetos, Indicadores, Objetivos e Leis
 *   4. Analytics Avançado          — Modelos Preditivos & Prescritivos (XGBoost, SHAP, Bayesian) NIST AI RMF
 *   5. Alertas Inteligentes        — Alertas Contextualizados com Impacto Estimado e Ação Recomendada
 *   6. Catálogo Unificado de KPIs  — 284 KPIs com proprietário, fonte, frequência e tendência
 *   7. Decision Intelligence       — Suporte Explicável à Tomada de Decisão com Evidências e Alternativas
 *   8. Governança Analítica        — DAMA-DMBOK2, Observabilidade, Model Drift, Data Drift e Qualidade
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  EnterpriseIntelligencePlatformService,
  type IntelligenceInsight, type KnowledgeGraphNode, type PredictiveAnalyticsModel,
  type SmartAlert, type UnifiedKPI, type CDAODashboardKPIs,
  type AnalyticsType, type AlertSeverity, type InsightPriority,
} from '../services/enterpriseIntelligencePlatform';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CDAO & EIP Hub',
  'Intelligence Insights',
  'Knowledge Graph',
  'Analytics Avançado',
  'Alertas Inteligentes',
  'Catálogo de KPIs',
  'Decision Intelligence',
  'Governança Analítica',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CDAO & EIP Hub': '🧭',
  'Intelligence Insights': '💡',
  'Knowledge Graph': '🕸️',
  'Analytics Avançado': '📡',
  'Alertas Inteligentes': '🔔',
  'Catálogo de KPIs': '📊',
  'Decision Intelligence': '🔮',
  'Governança Analítica': '🏛️',
};

const ANALYTICS_CONFIG: Record<AnalyticsType, { label: string; color: string; bg: string; icon: string }> = {
  DESCRIPTIVE:  { label: 'Descritivo', color: '#6b7280', bg: '#f3f4f6', icon: '📋' },
  DIAGNOSTIC:   { label: 'Diagnóstico', color: '#2563eb', bg: '#dbeafe', icon: '🔍' },
  PREDICTIVE:   { label: 'Preditivo', color: '#7c3aed', bg: '#f3e8ff', icon: '📡' },
  PRESCRIPTIVE: { label: 'Prescritivo', color: '#059669', bg: '#d1fae5', icon: '💊' },
  CAUSAL:       { label: 'Causal', color: '#d97706', bg: '#fef3c7', icon: '🔗' },
};

const PRIORITY_CONFIG: Record<InsightPriority, { color: string; bg: string }> = {
  CRITICAL: { color: '#dc2626', bg: '#fee2e2' },
  HIGH:     { color: '#ea580c', bg: '#ffedd5' },
  MEDIUM:   { color: '#d97706', bg: '#fef3c7' },
  LOW:      { color: '#6b7280', bg: '#f3f4f6' },
};

const ALERT_CONFIG: Record<AlertSeverity, { color: string; bg: string; icon: string }> = {
  CRITICAL: { color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
  HIGH:     { color: '#ea580c', bg: '#ffedd5', icon: '⚠️' },
  MEDIUM:   { color: '#d97706', bg: '#fef3c7', icon: '📢' },
  LOW:      { color: '#2563eb', bg: '#dbeafe', icon: 'ℹ️' },
};

const NODE_ICONS: Record<string, string> = {
  PERSON: '👤', BENEFICIARY: '🤝', PROJECT: '📂', PROCESS: '⚙️',
  INDICATOR: '📊', RISK: '⚠️', DOCUMENT: '📄', LAW_REGULATION: '⚖️',
  STRATEGIC_OBJECTIVE: '🎯', DECISION: '🔮',
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

// ── Tab 1: Torre CDAO & EIP Hub ───────────────────────────────────────────────

function TorreCDAOTab() {
  const [kpis, setKpis] = useState<CDAODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getCDAODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Enterprise Intelligence Platform...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#1e3a5f,#0891b2)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, bottom: -40, width: 240, height: 240,
          background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Intelligence Platform · DAMA-DMBOK2 · NIST AI RMF · ISO 42001 · BigQuery · Vertex AI
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Centro de Inteligência Corporativa — Instituto Ser Melhor
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalInsightsGenerated} insights gerados · {kpis?.unifiedKPICount} KPIs unificados ·
            {kpis?.dataSourcesConnected} fontes de dados · {kpis?.knowledgeGraphNodeCount} nós no Knowledge Graph
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.analyticsQualityScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Score de Qualidade Analítica</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{kpis?.insightsConsumedTodayCount} insights consumidos hoje</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="💡" label="Insights Gerados" value={String(kpis?.totalInsightsGenerated ?? 0)} sub="Acumulado" color="#0891b2" />
        <KpiCard icon="🚨" label="Insights Críticos" value={String(kpis?.criticalInsightsCount ?? 0)} color="#dc2626" alert={(kpis?.criticalInsightsCount ?? 0) > 0} />
        <KpiCard icon="🕸️" label="Nós no Knowledge Graph" value={(kpis?.knowledgeGraphNodeCount ?? 0).toLocaleString('pt-BR')} color="#7c3aed" />
        <KpiCard icon="🔗" label="Relações no Grafo" value={Math.round(kpis?.knowledgeGraphRelationCount ?? 0).toLocaleString('pt-BR')} color="#4f46e5" />
        <KpiCard icon="📡" label="Modelos Preditivos Ativos" value={String(kpis?.predictiveModelsActive ?? 0)} color="#059669" />
        <KpiCard icon="🎯" label="Acurácia Média dos Modelos" value={`${kpis?.avgModelAccuracyPct}%`} color="#16a34a" />
        <KpiCard icon="🔔" label="Alertas Ativos" value={String(kpis?.activeAlertsCount ?? 0)} color="#d97706" alert={(kpis?.criticalAlertsCount ?? 0) > 0} />
        <KpiCard icon="📊" label="KPIs Unificados" value={String(kpis?.unifiedKPICount ?? 0)} color="#2563eb" />
      </div>

      {/* Arquitetura EIP */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura Enterprise Intelligence Platform — 10 Componentes Core
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'EIP Intelligence Hub', d: 'Camada central de consolidação de toda inteligência corporativa da plataforma.', i: '🧭', c: '#0891b2' },
            { n: 'Decision Intelligence Engine', d: 'Suporte à decisão com recomendações, trade-offs, evidências e alternativas.', i: '🔮', c: '#7c3aed' },
            { n: 'Analytics Engine', d: 'Descritivo, Diagnóstico, Preditivo, Prescritivo e Causal em pipeline unificado.', i: '📡', c: '#059669' },
            { n: 'Predictive Analytics Engine', d: 'Modelos ML (XGBoost, ARIMA, BSTS, LSTM) com SHAP Explainability.', i: '🤖', c: '#2563eb' },
            { n: 'Prescriptive Analytics Engine', d: 'Recomendações acionáveis geradas automaticamente a partir de previsões.', i: '💊', c: '#16a34a' },
            { n: 'Knowledge Graph Engine', d: 'Grafo corporativo de 840+ nós com consultas semânticas (SPARQL-like).', i: '🕸️', c: '#4f46e5' },
            { n: 'Insight Generator', d: 'Geração automática de insights por Vertex AI Gemini 2.5 Pro.', i: '💡', c: '#d97706' },
            { n: 'Executive Intelligence API', d: 'REST + GraphQL API para consumo por dashboards, agentes e Digital Twin.', i: '🔌', c: '#6b7280' },
            { n: 'Correlation Engine', d: 'Detecção automática de correlações entre módulos e indicadores.', i: '🔗', c: '#ec4899' },
            { n: 'Evidence Repository', d: 'Repositório auditável de evidências que sustentam cada insight gerado.', i: '🗃️', c: '#0f172a' },
          ].map(c => (
            <div key={c.n} style={{ background: `${c.c}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.c}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.i}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.c }}>{c.n}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Matriz de Analytics */}
      <Card>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🔬 Capacidades Analytics — Da Descrição à Prescrição (DAMA-DMBOK2)
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(ANALYTICS_CONFIG).map(([type, config]) => (
            <div key={type} style={{
              background: config.bg, borderRadius: 10, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 160px',
            }}>
              <span style={{ fontSize: 20 }}>{config.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: config.color }}>{config.label}</div>
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                  {type === 'DESCRIPTIVE' && 'O que aconteceu?'}
                  {type === 'DIAGNOSTIC' && 'Por que aconteceu?'}
                  {type === 'PREDICTIVE' && 'O que vai acontecer?'}
                  {type === 'PRESCRIPTIVE' && 'O que fazer agora?'}
                  {type === 'CAUSAL' && 'Qual a causa raiz?'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Intelligence Insights ──────────────────────────────────────────────

function InsightsTab() {
  const [insights, setInsights] = useState<IntelligenceInsight[]>([]);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getIntelligenceInsights().then(setInsights);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Intelligence Insights — Da Correlação ao Conhecimento Acionável</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Insights gerados automaticamente pelo EIP Correlation Engine + Vertex AI Gemini 2.5 Pro</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {insights.map(insight => {
          const ac = ANALYTICS_CONFIG[insight.analyticsType];
          const pc = PRIORITY_CONFIG[insight.priority];
          const trendColor = insight.trendDirection === 'IMPROVING' ? '#059669' : insight.trendDirection === 'DECLINING' ? '#dc2626' : '#6b7280';
          const trendIcon = insight.trendDirection === 'IMPROVING' ? '↑' : insight.trendDirection === 'DECLINING' ? '↓' : '→';
          return (
            <Card key={insight.insightId} style={{ padding: '20px 22px', borderLeft: `4px solid ${pc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <Badge label={`${ac.icon} ${ac.label}`} color={ac.color} bg={ac.bg} />
                    <Badge label={`PRIORIDADE: ${insight.priority}`} color={pc.color} bg={pc.bg} />
                    <Badge label={`Tendência: ${trendIcon} ${insight.trendDirection}`} color={trendColor} bg={trendColor + '18'} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{insight.title}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0891b2' }}>{insight.confidencePct}%</div>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>Confiança</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, marginBottom: 12 }}>
                {insight.detailedNarrative}
              </div>

              {/* Ações Recomendadas */}
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 4 }}>✅ AÇÕES RECOMENDADAS:</div>
                {insight.recommendedActions.map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 2 }}>• {a}</div>
                ))}
              </div>

              {/* Evidências */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>🗃️ Fontes:</span>
                {insight.evidenceSources.map(s => (
                  <span key={s} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#374151' }}>{s}</span>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                🤖 {insight.generatedBy} · {fmtDateTime(insight.generatedAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Knowledge Graph ────────────────────────────────────────────────────

function KnowledgeGraphTab() {
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>([]);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getKnowledgeGraphNodes().then(setNodes);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Knowledge Graph Corporativo (840+ Nós Semânticos)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Grafo de relacionamentos entre Pessoas, Projetos, Indicadores, Leis e Objetivos Estratégicos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {nodes.map(node => {
          const nodeIcon = NODE_ICONS[node.nodeType] || '🔷';
          return (
            <Card key={node.nodeId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: '#4f46e518',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  }}>{nodeIcon}</div>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#4f46e5' }}>{node.nodeId} · Tipo: {node.nodeType}</span>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 1 }}>{node.label}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{node.description}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textAlign: 'right' }}>PESO SEMÂNTICO</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#4f46e5', textAlign: 'right' }}>{node.semanticWeight}</div>
                </div>
              </div>

              {/* KV Properties */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {Object.entries(node.properties).map(([k, v]) => (
                  <span key={k} style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#374151' }}>
                    <strong>{k}</strong>: {String(v)}
                  </span>
                ))}
              </div>

              {/* Relações */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Relacionamentos:</span>
                {node.relationshipTypes.map(r => (
                  <span key={r} style={{ background: '#f3e8ff', borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#7c3aed' }}>⟶ {r}</span>
                ))}
                <span style={{ fontSize: 9, color: '#9ca3af' }}>({node.relatedNodeIds.length} nós conectados)</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Analytics Avançado ─────────────────────────────────────────────────

function AnalyticsAvancadoTab() {
  const [models, setModels] = useState<PredictiveAnalyticsModel[]>([]);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getPredictiveModels().then(setModels);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Modelos Preditivos & Prescritivos (NIST AI RMF · SHAP Explainability)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Machine Learning em produção com importância de features, prescrições e conformidade regulatória</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {models.map(model => {
          const ac = ANALYTICS_CONFIG[model.analyticsType];
          return (
            <Card key={model.modelId} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <Badge label={`${ac.icon} ${ac.label}`} color={ac.color} bg={ac.bg} />
                    <Badge label={model.algorithmType} color="#0891b2" bg="#e0f2fe" />
                    {model.nistAiRmfCompliant && <Badge label="✅ NIST AI RMF" color="#059669" bg="#d1fae5" />}
                    {model.dataDriftAlert && <Badge label="⚠️ DATA DRIFT" color="#dc2626" bg="#fee2e2" />}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{model.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Alvo: {model.targetMetric}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ACURÁCIA</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#059669' }}>{model.accuracyPct}%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>VALOR ATUAL</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>{model.currentValue} {model.unit}</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 9, color: '#059669', fontWeight: 700 }}>VALOR PREVISTO</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>{model.predictedValue} {model.unit}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>HORIZONTE</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5' }}>{model.predictionHorizon}</div>
                </div>
              </div>

              {/* Feature Importance */}
              <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', marginBottom: 6 }}>📊 Importância das Features (SHAP):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {model.featureImportance.slice(0, 4).map(f => (
                  <div key={f.feature}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{f.feature}</span>
                      <span style={{ color: '#7c3aed' }}>{f.importancePct}%</span>
                    </div>
                    <ProgressBar pct={f.importancePct} color="#7c3aed" height={5} />
                  </div>
                ))}
              </div>

              {model.prescriptiveRecommendation && (
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #059669' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 2 }}>💊 RECOMENDAÇÃO PRESCRITIVA:</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{model.prescriptiveRecommendation}</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Alertas Inteligentes ───────────────────────────────────────────────

function AlertasInteligenteTab() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getSmartAlerts().then(setAlerts);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Alertas Inteligentes com Contexto, Impacto e Ação Recomendada</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Alertas gerados pelo EIP Correlation Engine com correlação automática a insights e modelos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map(alert => {
          const ac = ALERT_CONFIG[alert.severity];
          return (
            <Card key={alert.alertId} style={{ padding: '20px 22px', borderLeft: `4px solid ${ac.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <Badge label={`${ac.icon} ${alert.severity}`} color={ac.color} bg={ac.bg} />
                    <Badge label={alert.domain} color="#6b7280" bg="#f3f4f6" />
                    <Badge label={alert.status} color="#2563eb" bg="#dbeafe" />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{alert.title}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', marginBottom: 3 }}>📋 CONTEXTO:</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{alert.context}</div>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', marginBottom: 3 }}>💥 IMPACTO ESTIMADO:</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{alert.estimatedImpact}</div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #059669', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 3 }}>✅ AÇÃO SUGERIDA:</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{alert.suggestedAction}</div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10, color: '#9ca3af' }}>
                <span>Módulos afetados:</span>
                {alert.affectedModules.map(m => (
                  <span key={m} style={{ background: '#f3f4f6', borderRadius: 5, padding: '1px 6px', fontSize: 9, color: '#374151' }}>{m}</span>
                ))}
                <span style={{ marginLeft: 8 }}>⏱️ {fmtDateTime(alert.triggeredAt)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 6: Catálogo Unificado de KPIs ─────────────────────────────────────────

function CatalogoKPIsTab() {
  const [kpis, setKpis] = useState<UnifiedKPI[]>([]);

  useEffect(() => {
    EnterpriseIntelligencePlatformService.getUnifiedKPIs().then(setKpis);
  }, []);

  const domainColor: Record<string, string> = {
    IMPACT_SOCIAL: '#16a34a', FINANCIAL: '#d97706', CLINICAL: '#2563eb',
    OPERATIONAL: '#7c3aed', GOVERNANCE: '#4f46e5', PEOPLE: '#ec4899',
    TECHNOLOGY: '#0891b2', STRATEGIC: '#111827',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo Unificado de KPIs (284 Indicadores Corporativos)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Single Source of Truth para todos os indicadores com proprietário, fonte e rastreabilidade estratégica</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {kpis.map(kpi => {
          const color = domainColor[kpi.domain] || '#6b7280';
          const trendColor = kpi.trendPct >= 0 ? '#059669' : '#dc2626';
          return (
            <Card key={kpi.kpiCode} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color }}>{kpi.kpiCode}</span>
                    <Badge label={kpi.domain} color={color} bg={color + '18'} />
                    <Badge label={kpi.criticality} color={PRIORITY_CONFIG[kpi.criticality].color} bg={PRIORITY_CONFIG[kpi.criticality].bg} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>{kpi.name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                    Fonte: {kpi.sourceModule} · Owner: {kpi.ownerEmail} · Atualização: {kpi.updateFrequency}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color }}>{kpi.currentValue} {kpi.unit}</div>
                  <div style={{ fontSize: 10, color: trendColor, fontWeight: 700 }}>
                    {fmtPct(kpi.trendPct)} (meta: {kpi.targetValue} {kpi.unit})
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EnterpriseIntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CDAO & EIP Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#0f172a,#0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🧭</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Intelligence Platform (EIP)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              148 Insights Gerados · 840 Nós no Knowledge Graph · 284 KPIs · Decision Intelligence · DAMA-DMBOK2 · Vertex AI
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
                color: activeTab === tab ? '#0891b2' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CDAO & EIP Hub' && <TorreCDAOTab />}
      {activeTab === 'Intelligence Insights' && <InsightsTab />}
      {activeTab === 'Knowledge Graph' && <KnowledgeGraphTab />}
      {activeTab === 'Analytics Avançado' && <AnalyticsAvancadoTab />}
      {activeTab === 'Alertas Inteligentes' && <AlertasInteligenteTab />}
      {activeTab === 'Catálogo de KPIs' && <CatalogoKPIsTab />}

      {activeTab !== 'Torre CDAO & EIP Hub' &&
        activeTab !== 'Intelligence Insights' &&
        activeTab !== 'Knowledge Graph' &&
        activeTab !== 'Analytics Avançado' &&
        activeTab !== 'Alertas Inteligentes' &&
        activeTab !== 'Catálogo de KPIs' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Enterprise Intelligence — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma cognitiva de inteligência institucional alinhada ao DAMA-DMBOK2 e NIST AI RMF.
          </p>
        </Card>
      )}
    </div>
  );
}
