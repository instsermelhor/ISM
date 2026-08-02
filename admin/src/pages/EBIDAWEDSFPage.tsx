/**
 * EBIDAWEDSFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E019 — Enterprise Business Intelligence, Data Warehouse, Analytics &
 *         Executive Decision Support Framework (EBIDWAEDSF)
 * Instituto Ser Melhor — Prompt E019 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Command Tower          — Painel Executivo Consolidado C-Level
 *   2.  Data Warehouse         — Fatos, Dimensões e Camadas (Bronze→Platinum)
 *   3.  KPIs & Métricas        — Catálogo de 29 KPIs por categoria
 *   4.  Dashboards             — 14 painéis por audiência
 *   5.  Pipelines ETL/ELT      — Monitoramento em tempo real
 *   6.  Qualidade de Dados     — DQ Engine, alertas e score
 *   7.  Catálogo de Dados      — Linhagem, governança e metadados
 *   8.  Analytics & Inteligência— Tendências, riscos e projeções de impacto
 *   9.  Scorecards Executivos  — BSC por audiência e perspectiva
 *  10.  Governança & LGPD      — Classificação, retenção e auditoria
 *  11.  Alertas Corporativos   — Executive Alerts Engine
 *  12.  Certificação E019      — Enterprise Analytics Readiness Score
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  EBIDAWEDSFService,
  type EBIConsolidatedDashboard,
  type DataSource,
  type DataPipeline,
  type FactTable,
  type KPI,
  type KPIStatus,
  type Dashboard,
  type DataQualityRule,
  type ExecutiveAlert,
  type DataCatalogEntry,
  type ExecutiveScorecard,
  type TrendAnalysis,
  type RiskAnalysis,
  type SocialImpactProjection,
  type AnalyticsPlatformCertification,
  type AlertSeverity,
  type DataSensitivity,
} from '../services/ebidwaedsfEnterprise';

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmtNum  = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR') : '—';
const fmtCur  = (n?: number) => n !== undefined ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : '—';
const fmtPct  = (n?: number) => n !== undefined ? `${n.toFixed(1)}%` : '—';
const fmtMs   = (ms: number) => ms >= 60000 ? `${(ms / 60000).toFixed(1)} min` : `${(ms / 1000).toFixed(0)} s`;
const fmtBytes= (b: number) => b > 1e9 ? `${(b/1e9).toFixed(1)} GB` : b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(0)} KB`;

// ── Design Tokens ──────────────────────────────────────────────────────────────

const C = {
  bg:     '#080c14',
  bgCard: '#0d1526',
  bgAlt:  '#111827',
  border: '#1e3a5f',
  borderDim: '#1a2840',
  cyan:   '#06b6d4',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  green:  '#10b981',
  amber:  '#f59e0b',
  rose:   '#f43f5e',
  sky:    '#38bdf8',
  lime:   '#84cc16',
  text1:  '#f1f5f9',
  text2:  '#94a3b8',
  text3:  '#64748b',
};

// ── Status / Severity Configs ──────────────────────────────────────────────────

const KPI_STATUS_CFG: Record<KPIStatus, { label: string; color: string; bg: string }> = {
  EXCEEDED:    { label: '🏆 SUPERADO',  color: '#10b981', bg: '#064e3b' },
  ON_TRACK:    { label: '✅ NO PRAZO',  color: '#38bdf8', bg: '#0c2340' },
  AT_RISK:     { label: '⚠️ EM RISCO',  color: '#f59e0b', bg: '#451a03' },
  OFF_TRACK:   { label: '❌ FORA',      color: '#f43f5e', bg: '#4c0519' },
  NOT_STARTED: { label: '⚪ NÃO INIC.', color: '#64748b', bg: '#1e293b' },
};

const SEV_CFG: Record<AlertSeverity, { color: string; bg: string; icon: string }> = {
  CRITICO: { color: '#f43f5e', bg: '#4c0519', icon: '🔴' },
  ALTO:    { color: '#f97316', bg: '#431407', icon: '🟠' },
  MEDIO:   { color: '#f59e0b', bg: '#451a03', icon: '🟡' },
  BAIXO:   { color: '#38bdf8', bg: '#0c2340', icon: '🔵' },
  INFO:    { color: '#94a3b8', bg: '#1e293b', icon: '⚪' },
};

const SENS_CFG: Record<DataSensitivity, { color: string; label: string }> = {
  PUBLICO:       { color: '#10b981', label: '🟢 Público' },
  INTERNO:       { color: '#38bdf8', label: '🔵 Interno' },
  CONFIDENCIAL:  { color: '#f59e0b', label: '🟡 Confidencial' },
  RESTRITO:      { color: '#f97316', label: '🟠 Restrito' },
  LGPD_SENSIVEL: { color: '#f43f5e', label: '🔴 LGPD Sensível' },
};

const PIPE_STATUS_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  COMPLETED: { color: '#10b981', bg: '#064e3b', icon: '✅' },
  RUNNING:   { color: '#38bdf8', bg: '#0c2340', icon: '🔄' },
  SCHEDULED: { color: '#8b5cf6', bg: '#2e1065', icon: '⏳' },
  FAILED:    { color: '#f43f5e', bg: '#4c0519', icon: '❌' },
  PAUSED:    { color: '#f59e0b', bg: '#451a03', icon: '⏸️' },
  CANCELLED: { color: '#64748b', bg: '#1e293b', icon: '⛔' },
};

const FACT_TYPE_ICONS: Record<string, string> = {
  OPERACIONAL: '⚙️', FINANCEIRO: '💰', ASSISTENCIAL: '🤝', CLINICO: '🏥',
  SOCIAL: '🌟', EDUCACIONAL: '📚', RH: '👥', VOLUNTARIADO: '💚', PATRIMONIAL: '🏛️',
};

const LAYER_CFG: Record<string, { color: string; label: string }> = {
  BRONZE:   { color: '#cd7c2a', label: 'Bronze' },
  SILVER:   { color: '#94a3b8', label: 'Silver' },
  GOLD:     { color: '#f59e0b', label: 'Gold' },
  PLATINUM: { color: '#c084fc', label: 'Platinum' },
};

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'tower',       icon: '🏰', label: 'Command Tower' },
  { id: 'warehouse',   icon: '🗄️', label: 'Data Warehouse' },
  { id: 'kpis',        icon: '📊', label: 'KPIs & Métricas' },
  { id: 'dashboards',  icon: '📺', label: 'Dashboards' },
  { id: 'pipelines',   icon: '🔁', label: 'Pipelines ETL/ELT' },
  { id: 'quality',     icon: '🛡️', label: 'Qualidade de Dados' },
  { id: 'catalog',     icon: '📚', label: 'Catálogo de Dados' },
  { id: 'analytics',   icon: '🧠', label: 'Analytics & IA' },
  { id: 'scorecards',  icon: '🏅', label: 'Scorecards' },
  { id: 'governance',  icon: '⚖️', label: 'Governança & LGPD' },
  { id: 'alerts',      icon: '🔔', label: 'Alertas' },
  { id: 'cert',        icon: '🎖️', label: 'Certificação E019' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Shared UI Primitives ───────────────────────────────────────────────────────

const Dark = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', ...style }}>
    {children}
  </div>
);

const MetricPill = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 18px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 10 }}>
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
        <div style={{ height: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4, transition: 'width 0.9s' }} />
      </div>
    </div>
  );
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return <span style={{ fontSize: 10, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{text}</span>;
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.text1 }}>{title}</h2>
          {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text3 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ── TAB 1: Command Tower ───────────────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EBIConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getConsolidatedDashboard().then(r => { setD(r); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Command Tower..." />;

  const globalHealth = Math.round(
    (d.globalDataQualityScore * 0.3 + d.analyticsReadinessScore * 0.4 + (d.kpisOnTrack / d.totalKPIs * 100) * 0.3)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Headline Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0c1b3e 50%, #12063a 100%)',
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, background: `${C.cyan}08`, borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 200, width: 150, height: 150, background: `${C.violet}08`, borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>📡</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise BI Command Tower
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E019 · EBIDWAEDSF · Instituto Ser Melhor · Gerado em {new Date(d.generatedAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>{globalHealth}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Platform Health Score</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '👥', label: 'Beneficiários', value: fmtNum(d.totalBeneficiarios), color: C.green },
            { icon: '📋', label: 'Atendimentos', value: fmtNum(d.totalAtendimentos), color: C.sky },
            { icon: '💎', label: 'SROI', value: `${d.sroiMultiplier}x`, color: C.violet },
            { icon: '🌿', label: 'ESG Score', value: fmtPct(d.esgScore), color: C.lime },
            { icon: '📊', label: 'KPIs Ativos', value: fmtNum(d.totalKPIs), color: C.cyan },
            { icon: '🗄️', label: 'Registros DW', value: `${(d.totalRecordsInWarehouse / 1e6).toFixed(1)}M`, color: C.amber },
            { icon: '🎯', label: 'Qualidade Dados', value: fmtPct(d.globalDataQualityScore), color: C.green },
            { icon: '🔁', label: 'Pipelines Ativos', value: fmtNum(d.activePipelines), color: C.indigo },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: `${kpi.color}12`, border: `1px solid ${kpi.color}30`,
              borderRadius: 12, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{kpi.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* KPIs Status */}
        <Dark>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 14 }}>🎯 Status dos KPIs</div>
          {[
            { label: 'Superados', value: d.kpisOnTrack, color: C.green, total: d.totalKPIs },
            { label: 'Em Risco', value: d.kpisAtRisk, color: C.amber, total: d.totalKPIs },
            { label: 'Fora da Meta', value: d.kpisOffTrack, color: C.rose, total: d.totalKPIs },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.text2 }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>{item.value} / {item.total}</span>
              </div>
              <div style={{ height: 5, background: '#1e293b', borderRadius: 3 }}>
                <div style={{ height: 5, width: `${(item.value / item.total) * 100}%`, background: item.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Dark>

        {/* Infrastructure */}
        <Dark>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 14 }}>🏗️ Infraestrutura</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Fontes de Dados', value: d.totalDataSources },
              { label: 'Tabelas Fato', value: d.totalFactTables },
              { label: 'Dimensões', value: d.totalDimensions },
              { label: 'Datasets', value: d.totalDatasets },
              { label: 'Dashboards', value: d.publishedDashboards },
              { label: 'Entradas Catálogo', value: d.catalogEntries },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.borderDim}` }}>
                <span style={{ fontSize: 12, color: C.text3 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.sky }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Dark>

        {/* Health Indicators */}
        <Dark>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 14 }}>💊 Saúde da Plataforma</div>
          <ScoreBar label="Analytics Readiness" value={d.analyticsReadinessScore} color={C.cyan} />
          <ScoreBar label="Qualidade de Dados" value={d.globalDataQualityScore} color={C.green} />
          <ScoreBar label="KPIs On Track" value={Math.round(d.kpisOnTrack / d.totalKPIs * 100)} color={C.violet} />
          <ScoreBar label="Pipelines Saudáveis" value={Math.round((d.activePipelines - d.pipelinesSlaBreached) / d.activePipelines * 100)} color={C.amber} />
          {d.criticalAlerts > 0 && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#4c051920', border: '1px solid #f43f5e44', borderRadius: 8, fontSize: 12, color: '#f43f5e' }}>
              ⚠️ {d.criticalAlerts} alerta(s) crítico(s) ativo(s)
            </div>
          )}
        </Dark>
      </div>

      {/* Integration Matrix */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>🔗 Matriz de Integração — Módulos E005–E018 → E019</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { m: 'E005', n: 'Beneficiários', status: 'ATIVO', flows: '↗ Fato Atend.', color: C.green },
            { m: 'E006', n: 'EHR/Prontuário', status: 'ATIVO', flows: '↗ Fato Clínico', color: C.green },
            { m: 'E007', n: 'Financeiro', status: 'ATIVO', flows: '↗ Fato Financ.', color: C.green },
            { m: 'E008', n: 'RH', status: 'ATIVO', flows: '↗ Fato RH', color: C.green },
            { m: 'E009', n: 'Assist. Social', status: 'ATIVO', flows: '↗ Fato Social', color: C.green },
            { m: 'E010', n: 'Projetos/PMO', status: 'ATIVO', flows: '↗ Dim Projeto', color: C.green },
            { m: 'E011', n: 'Convênios', status: 'ATIVO', flows: '↗ Dim Convênio', color: C.green },
            { m: 'E012', n: 'Educação', status: 'ATIVO', flows: '↗ Fato Educ.', color: C.green },
            { m: 'E013', n: 'Voluntariado', status: 'ATIVO', flows: '↗ Fato Volunt.', color: C.green },
            { m: 'E014', n: 'Jurídico', status: 'ATIVO', flows: '↗ Dim Juridico', color: C.green },
            { m: 'E015', n: 'Patrimônio', status: 'ATIVO', flows: '↗ Fato Patrim.', color: C.green },
            { m: 'E016', n: 'Comunicação', status: 'ATIVO', flows: '↗ Dim CRM', color: C.green },
            { m: 'E017', n: 'Teleatendimento', status: 'ATIVO', flows: '↗ Streaming', color: C.cyan },
            { m: 'E018', n: 'Governança', status: 'ATIVO', flows: '↗ Dim Compliance', color: C.green },
          ].map(mod => (
            <div key={mod.m} style={{ background: `${mod.color}10`, border: `1px solid ${mod.color}30`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: mod.color }}>{mod.m}</span>
                <Badge text="●" color={mod.color} bg={`${mod.color}20`} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginBottom: 2 }}>{mod.n}</div>
              <div style={{ fontSize: 10, color: C.text3 }}>{mod.flows}</div>
            </div>
          ))}
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 2: Data Warehouse ──────────────────────────────────────────────────────

function DataWarehouseTab() {
  const [facts, setFacts] = useState<FactTable[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([EBIDAWEDSFService.getFactTables(), EBIDAWEDSFService.getDataSources()]).then(([f, s]) => {
      setFacts(f); setSources(s); setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState text="Carregando Data Warehouse..." />;

  const dims = [
    { code: 'DIM-TEMPO-001', name: 'Dimensão Tempo', type: 'TEMPO', rows: 36500, icon: '📅' },
    { code: 'DIM-BEN-001', name: 'Dimensão Beneficiário', type: 'BENEFICIARIO', rows: 18240, icon: '👥' },
    { code: 'DIM-PRF-001', name: 'Dimensão Profissional', type: 'PROFISSIONAL', rows: 284, icon: '👨‍⚕️' },
    { code: 'DIM-PRJ-001', name: 'Dimensão Projeto', type: 'PROJETO', rows: 48, icon: '📁' },
    { code: 'DIM-UNI-001', name: 'Dimensão Unidade', type: 'UNIDADE', rows: 12, icon: '🏢' },
    { code: 'DIM-PRG-001', name: 'Dimensão Programa', type: 'PROGRAMA', rows: 26, icon: '📋' },
    { code: 'DIM-FON-001', name: 'Dimensão Fonte de Recursos', type: 'FONTE_RECURSOS', rows: 38, icon: '💰' },
    { code: 'DIM-CNV-001', name: 'Dimensão Convênio', type: 'CONVENIO', rows: 24, icon: '📜' },
    { code: 'DIM-REG-001', name: 'Dimensão Região', type: 'REGIAO', rows: 850, icon: '🗺️' },
    { code: 'DIM-ATD-001', name: 'Dimensão Atendimento', type: 'ATENDIMENTO', rows: 120, icon: '🤝' },
  ];

  const layers = [
    { name: 'Bronze', icon: '🥉', desc: 'Dados brutos — ingestão direta das fontes, sem transformação', tables: 14, records: '3.2M', color: '#cd7c2a', purpose: 'Landing Zone / Raw' },
    { name: 'Silver', icon: '🥈', desc: 'Dados limpos, padronizados, deduplicados e enriquecidos', tables: 28, records: '8.8M', color: '#94a3b8', purpose: 'Cleansed / Conformed' },
    { name: 'Gold', icon: '🥇', desc: 'Fatos e dimensões modelados (Star Schema, Data Vault 2.0)', tables: 19, records: '5.6M', color: '#f59e0b', purpose: 'Business / Analytics' },
    { name: 'Platinum', icon: '💎', desc: 'KPIs materializados, scorecards e dados para dashboards', tables: 8, records: '0.6M', color: '#c084fc', purpose: 'Serving / Insights' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🗄️" title="Data Warehouse Corporativo" sub="Kimball Star Schema + Data Vault 2.0 · 4 Camadas (Bronze → Platinum)" />

      {/* Layers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {layers.map(layer => (
          <Dark key={layer.name} style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{layer.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: layer.color }}>{layer.name}</div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10 }}>{layer.purpose}</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <MetricPill label="Tabelas" value={layer.tables} color={layer.color} />
              <MetricPill label="Registros" value={layer.records} color={layer.color} />
            </div>
            <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>{layer.desc}</div>
          </Dark>
        ))}
      </div>

      {/* Fact Tables */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Tabelas Fato (Star Schema — Gold Layer)</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.text3 }}>
                {['Código', 'Nome', 'Tipo', 'Modelo', 'Registros', 'Medidas', 'Última Carga', 'SLA'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facts.map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.borderDim}` }}>
                  <td style={{ padding: '10px 12px', color: C.cyan, fontWeight: 700, fontFamily: 'monospace' }}>{f.code}</td>
                  <td style={{ padding: '10px 12px', color: C.text1, fontWeight: 600 }}>
                    {FACT_TYPE_ICONS[f.factType]} {f.name}
                  </td>
                  <td style={{ padding: '10px 12px' }}><Badge text={f.factType} color={C.amber} bg="#451a0320" /></td>
                  <td style={{ padding: '10px 12px' }}><Badge text={f.schemaModel} color={C.violet} bg="#2e106520" /></td>
                  <td style={{ padding: '10px 12px', color: C.text1, fontWeight: 700 }}>{fmtNum(f.rowCount)}</td>
                  <td style={{ padding: '10px 12px', color: C.sky }}>{f.measures.length} colunas</td>
                  <td style={{ padding: '10px 12px', color: C.text3, fontSize: 11 }}>
                    {f.lastLoadedAt ? new Date(f.lastLoadedAt).toLocaleTimeString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge text={`${f.freshnessSlaHours}h`} color={C.green} bg="#064e3b20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Dark>

      {/* Dimensions */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📐 Dimensões Analíticas (10 Dimensões Conformadas)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {dims.map(d => (
            <div key={d.code} style={{ background: `${C.indigo}12`, border: `1px solid ${C.indigo}30`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{d.icon}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: C.indigo }}>{d.code}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginTop: 2 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{fmtNum(d.rows)} registros</div>
            </div>
          ))}
        </div>
      </Dark>

      {/* Data Sources */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>🔌 Fontes de Dados — Módulos E005–E018</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {sources.map(src => (
            <div key={src.id} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: C.sky, fontFamily: 'monospace' }}>{src.code}</span>
                <Badge text={src.isActive ? '● ATIVO' : '○ INATIVO'} color={src.isActive ? C.green : C.rose} bg={src.isActive ? '#064e3b20' : '#4c051920'} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text1, marginBottom: 4 }}>{src.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text3 }}>
                <span>{fmtNum(src.recordsCount)} reg.</span>
                <span>Score: <span style={{ color: src.qualityScore >= 95 ? C.green : C.amber, fontWeight: 700 }}>{src.qualityScore}%</span></span>
              </div>
              <div style={{ marginTop: 6, fontSize: 10 }}>
                {SENS_CFG[src.sensitivity] && (
                  <span style={{ color: SENS_CFG[src.sensitivity].color }}>{SENS_CFG[src.sensitivity].label}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 3: KPIs & Métricas ─────────────────────────────────────────────────────

function KPIsTab() {
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [filter, setFilter] = useState<string>('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getKPIs().then(k => { setKPIs(k); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando KPIs..." />;

  const categories = ['TODOS', ...Array.from(new Set(kpis.map(k => k.category)))];
  const filtered = filter === 'TODOS' ? kpis : kpis.filter(k => k.category === filter);

  const byStatus = {
    EXCEEDED: kpis.filter(k => k.status === 'EXCEEDED').length,
    ON_TRACK: kpis.filter(k => k.status === 'ON_TRACK').length,
    AT_RISK: kpis.filter(k => k.status === 'AT_RISK').length,
    OFF_TRACK: kpis.filter(k => k.status === 'OFF_TRACK').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Catálogo de KPIs Corporativos" sub={`${kpis.length} indicadores estratégicos · Criação dinâmica habilitada`} />

      {/* Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {Object.entries(byStatus).map(([status, count]) => {
          const cfg = KPI_STATUS_CFG[status as KPIStatus];
          return (
            <Dark key={status} style={{ textAlign: 'center', padding: '18px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: cfg.color }}>{count}</div>
              <Badge text={cfg.label} color={cfg.color} bg={cfg.bg} />
            </Dark>
          );
        })}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '5px 12px', borderRadius: 8, border: `1px solid ${filter === cat ? C.cyan : C.borderDim}`,
            background: filter === cat ? `${C.cyan}20` : 'transparent',
            color: filter === cat ? C.cyan : C.text3,
            fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* KPI Table */}
      <Dark>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.text3 }}>
                {['Código', 'Indicador', 'Categoria', 'Atual', 'Meta', 'Progresso', 'Tendência', 'Status', 'Atualização'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const pct = Math.min((k.currentValue / k.targetValue) * 100, 120);
                const cfg = KPI_STATUS_CFG[k.status];
                const trendColor = k.trend === 'UP' ? C.green : k.trend === 'DOWN' ? C.rose : C.amber;
                const trendIcon = k.trend === 'UP' ? '↑' : k.trend === 'DOWN' ? '↓' : '→';
                return (
                  <tr key={k.id} style={{ borderBottom: `1px solid ${C.borderDim}` }}>
                    <td style={{ padding: '10px 10px', color: C.cyan, fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }}>{k.code}</td>
                    <td style={{ padding: '10px 10px', color: C.text1, fontWeight: 600, maxWidth: 200 }}>{k.name}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <Badge text={k.category.replace(/_/g, ' ')} color={C.violet} bg="#2e106520" />
                    </td>
                    <td style={{ padding: '10px 10px', fontWeight: 800, color: C.text1 }}>
                      {k.unit === 'R$' ? fmtCur(k.currentValue) : k.currentValue.toLocaleString('pt-BR')} {k.unit !== 'R$' ? k.unit : ''}
                    </td>
                    <td style={{ padding: '10px 10px', color: C.text3 }}>
                      {k.unit === 'R$' ? fmtCur(k.targetValue) : k.targetValue.toLocaleString('pt-BR')} {k.unit !== 'R$' ? k.unit : ''}
                    </td>
                    <td style={{ padding: '10px 10px', minWidth: 100 }}>
                      <div style={{ height: 5, background: '#1e293b', borderRadius: 3 }}>
                        <div style={{ height: 5, width: `${Math.min(pct, 100)}%`, background: cfg.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{pct.toFixed(0)}%</div>
                    </td>
                    <td style={{ padding: '10px 10px', fontWeight: 800, color: trendColor }}>
                      {trendIcon} {k.trendPct !== undefined ? `${k.trendPct > 0 ? '+' : ''}${k.trendPct}%` : ''}
                    </td>
                    <td style={{ padding: '10px 10px' }}><Badge text={cfg.label} color={cfg.color} bg={cfg.bg} /></td>
                    <td style={{ padding: '10px 10px', fontSize: 10, color: C.text3 }}>{k.updateFrequency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 4: Dashboards ──────────────────────────────────────────────────────────

function DashboardsTab() {
  const [dashes, setDashes] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getDashboards().then(d => { setDashes(d); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Dashboards..." />;

  const audienceIcons: Record<string, string> = {
    PRESIDENCIA: '👑', DIRETORIA: '🏢', CONSELHO_FISCAL: '⚖️',
    CONSELHO_ADMINISTRATIVO: '🏛️', COORDENACAO: '📋', GESTOR: '👤',
    FINANCEIRO: '💰', RH: '👥', CLINICO: '🏥', JURIDICO: '⚖️',
    ASSISTENCIA_SOCIAL: '🤝', PROJETOS: '📁', AUDITORIA: '🔍', COMPLIANCE: '🛡️',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📺" title="Dashboards Executivos" sub={`${dashes.length} painéis publicados · Filtros avançados · Atualização a cada 5 min`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {dashes.map(dash => (
          <Dark key={dash.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 28 }}>{audienceIcons[dash.audience] || '📊'}</div>
              <Badge text={dash.isPublished ? '● PUBLICADO' : '○ RASCUNHO'} color={C.green} bg="#064e3b20" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, marginBottom: 4 }}>{dash.title}</div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10 }}>
              {dash.widgets.length} widgets · Refresh: {dash.refreshIntervalSeconds / 60} min
            </div>

            {/* Widget Types */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
              {Array.from(new Set(dash.widgets.map(w => w.type))).map(wt => (
                <span key={wt} style={{ fontSize: 9, color: C.indigo, background: `${C.indigo}20`, padding: '2px 6px', borderRadius: 4 }}>
                  {wt.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            {/* Export Formats */}
            <div style={{ display: 'flex', gap: 4 }}>
              {dash.exportFormats.map(fmt => (
                <Badge key={fmt} text={fmt} color={C.sky} bg={`${C.sky}15`} />
              ))}
            </div>

            {/* Filters */}
            <div style={{ marginTop: 8, fontSize: 10, color: C.text3 }}>
              Filtros: {dash.filters.map(f => f.label).join(', ')}
            </div>

            {/* Security */}
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#06113820', borderRadius: 6, fontSize: 10, color: C.text3 }}>
              🔐 RLS: {dash.rlsPolicy} · CLS: {dash.clsPolicy}
            </div>
          </Dark>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Pipelines ETL/ELT ──────────────────────────────────────────────────

function PipelinesTab() {
  const [pipes, setPipes] = useState<DataPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getPipelines().then(p => { setPipes(p); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Pipelines..." />;

  const summary = {
    total: pipes.length,
    completed: pipes.filter(p => p.status === 'COMPLETED').length,
    running: pipes.filter(p => p.status === 'RUNNING').length,
    scheduled: pipes.filter(p => p.status === 'SCHEDULED').length,
    failed: pipes.filter(p => p.status === 'FAILED').length,
    slaBreach: pipes.filter(p => p.isSlaBreach).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔁" title="Monitoramento de Pipelines ETL/ELT" sub="Rastreabilidade completa · SLA tracking · Auditoria de execuções" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          { label: 'Total', value: summary.total, color: C.sky },
          { label: 'Concluídos', value: summary.completed, color: C.green },
          { label: 'Em Execução', value: summary.running, color: C.cyan },
          { label: 'Agendados', value: summary.scheduled, color: C.violet },
          { label: 'Falhos', value: summary.failed, color: C.rose },
          { label: 'SLA Violado', value: summary.slaBreach, color: C.amber },
        ].map(s => (
          <Dark key={s.label} style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{s.label}</div>
          </Dark>
        ))}
      </div>

      {/* Pipeline List */}
      <Dark>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.text3 }}>
                {['ID', 'Pipeline', 'Tipo', 'Destino', 'Status', 'Duração', 'Registros', 'Taxa Sucesso', 'SLA', 'Schedule'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pipes.map(pipe => {
                const cfg = PIPE_STATUS_CFG[pipe.status] || PIPE_STATUS_CFG['COMPLETED'];
                const successRate = pipe.successRunsCount / (pipe.successRunsCount + pipe.failedRunsCount) * 100;
                const layerCfg = LAYER_CFG[pipe.destinationLayer];
                return (
                  <tr key={pipe.id} style={{ borderBottom: `1px solid ${C.borderDim}` }}>
                    <td style={{ padding: '10px 10px', color: C.cyan, fontFamily: 'monospace', fontSize: 11 }}>{pipe.code}</td>
                    <td style={{ padding: '10px 10px', color: C.text1, fontWeight: 600, maxWidth: 220 }}>
                      {pipe.name}
                      {pipe.isSlaBreach && <span style={{ marginLeft: 6, fontSize: 10, color: C.amber }}>⚠️ SLA</span>}
                    </td>
                    <td style={{ padding: '10px 10px' }}><Badge text={pipe.type} color={C.indigo} bg={`${C.indigo}20`} /></td>
                    <td style={{ padding: '10px 10px' }}><Badge text={layerCfg?.label || pipe.destinationLayer} color={layerCfg?.color || C.sky} bg={`${layerCfg?.color || C.sky}15`} /></td>
                    <td style={{ padding: '10px 10px' }}><Badge text={`${cfg.icon} ${pipe.status}`} color={cfg.color} bg={cfg.bg} /></td>
                    <td style={{ padding: '10px 10px', color: C.text1 }}>{pipe.lastRunDurationMs ? fmtMs(pipe.lastRunDurationMs) : '—'}</td>
                    <td style={{ padding: '10px 10px', color: C.sky }}>{fmtNum(pipe.lastRunRecordsProcessed)}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ color: successRate >= 98 ? C.green : successRate >= 90 ? C.amber : C.rose, fontWeight: 800 }}>
                        {successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 10, color: pipe.isSlaBreach ? C.amber : C.green }}>
                      {pipe.slaMinutes} min
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>{pipe.scheduleExpression}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 6: Qualidade de Dados ──────────────────────────────────────────────────

function DataQualityTab() {
  const [rules, setRules] = useState<DataQualityRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getDataQualityRules().then(r => { setRules(r); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Regras de Qualidade..." />;

  const avgScore = rules.reduce((s, r) => s + r.currentScore, 0) / rules.length;
  const totalViolations = rules.reduce((s, r) => s + r.violationsCount, 0);

  const dimColors: Record<string, string> = {
    COMPLETUDE: C.cyan, CONSISTENCIA: C.violet, UNICIDADE: C.green,
    INTEGRIDADE: C.amber, PRECISAO: C.sky, PONTUALIDADE: C.rose,
  };

  const dimScores = rules.reduce((acc, r) => {
    if (!acc[r.dimension]) acc[r.dimension] = [];
    acc[r.dimension].push(r.currentScore);
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Data Quality Engine (ISO 8000 · DAMA-DMBOK2)" sub="Validação contínua · Score global · Alertas automáticos" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <Dark style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: avgScore >= 95 ? C.green : avgScore >= 90 ? C.amber : C.rose }}>{avgScore.toFixed(1)}%</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Score Global de Qualidade</div>
        </Dark>
        <Dark style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.sky }}>{rules.filter(r => r.isActive).length}</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Regras DQ Ativas</div>
        </Dark>
        <Dark style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: totalViolations > 20 ? C.rose : totalViolations > 5 ? C.amber : C.green }}>{totalViolations}</div>
          <div style={{ fontSize: 12, color: C.text3 }}>Violações Detectadas</div>
        </Dark>
      </div>

      {/* Score by Dimension */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📐 Score por Dimensão de Qualidade</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {Object.entries(dimScores).map(([dim, scores]) => {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const color = dimColors[dim] || C.sky;
            return (
              <div key={dim} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 10, padding: '14px 16px' }}>
                <ScoreBar label={dim.replace(/_/g, ' ')} value={parseFloat(avg.toFixed(1))} color={color} />
                <div style={{ fontSize: 10, color: C.text3 }}>{scores.length} regra(s)</div>
              </div>
            );
          })}
        </div>
      </Dark>

      {/* Rules Table */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📋 Regras de Qualidade Ativas</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, color: C.text3 }}>
                {['ID', 'Regra', 'Dimensão', 'Dataset', 'Coluna', 'Score', 'Violações', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map(r => {
                const color = dimColors[r.dimension] || C.sky;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderDim}` }}>
                    <td style={{ padding: '10px 10px', color: C.cyan, fontFamily: 'monospace', fontSize: 11 }}>{r.code}</td>
                    <td style={{ padding: '10px 10px', color: C.text1, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: '10px 10px' }}><Badge text={r.dimension} color={color} bg={`${color}20`} /></td>
                    <td style={{ padding: '10px 10px', fontSize: 11, color: C.text3, fontFamily: 'monospace' }}>{r.targetDataset}</td>
                    <td style={{ padding: '10px 10px', fontSize: 11, color: C.text3 }}>{r.targetColumn || '—'}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontWeight: 800, color: r.currentScore >= 95 ? C.green : r.currentScore >= 90 ? C.amber : C.rose }}>
                        {r.currentScore}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ fontWeight: 800, color: r.violationsCount === 0 ? C.green : r.violationsCount < 10 ? C.amber : C.rose }}>
                        {r.violationsCount}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <Badge text={r.isActive ? '● ATIVO' : '○ INATIVO'} color={r.isActive ? C.green : C.rose} bg={r.isActive ? '#064e3b20' : '#4c051920'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 7: Catálogo de Dados ───────────────────────────────────────────────────

function DataCatalogTab() {
  const [entries, setEntries] = useState<DataCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getCatalogEntries().then(e => { setEntries(e); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Catálogo..." />;

  const typeIcons: Record<string, string> = {
    TABLE: '📋', VIEW: '👁️', DATASET: '📦', STREAM: '🌊', FILE: '📄', API: '🔌',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📚" title="Catálogo de Dados Corporativo" sub={`${entries.length} artefatos catalogados · Linhagem completa · Classificação LGPD`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {entries.map(e => {
          const sensCfg = SENS_CFG[e.sensitivity];
          return (
            <Dark key={e.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{typeIcons[e.type] || '📋'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, fontFamily: 'monospace' }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: C.text3 }}>{e.code} · {e.type} · {e.origin}</div>
                  </div>
                </div>
                {sensCfg && <span style={{ fontSize: 10, color: sensCfg.color }}>{sensCfg.label}</span>}
              </div>

              <div style={{ fontSize: 11, color: C.text3, marginBottom: 8 }}>
                👤 {e.owner} · 🔄 {e.updateFrequency} · 📅 {e.retentionDays}d retenção
              </div>

              {/* LGPD Classification */}
              <div style={{ marginBottom: 8 }}>
                <Badge text={`LGPD: ${e.lgpdClassification.replace(/_/g, ' ')}`}
                  color={e.lgpdClassification === 'DADO_SENSIVEL' ? C.rose : e.lgpdClassification === 'DADO_PESSOAL' ? C.amber : C.green}
                  bg={e.lgpdClassification === 'DADO_SENSIVEL' ? '#4c051920' : e.lgpdClassification === 'DADO_PESSOAL' ? '#451a0320' : '#064e3b20'} />
              </div>

              {/* Business Rules */}
              <div style={{ fontSize: 10, color: C.text3, marginBottom: 6 }}>
                <strong style={{ color: C.text2 }}>Regras:</strong> {e.businessRules.join(' · ')}
              </div>

              {/* Lineage */}
              {e.lineage.length > 0 && (
                <div style={{ fontSize: 10, color: C.indigo }}>
                  ← Linhagem: {e.lineage.join(', ')}
                </div>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                {e.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, color: C.text3, background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>{t}</span>
                ))}
              </div>
            </Dark>
          );
        })}
      </div>
    </div>
  );
}

// ── TAB 8: Analytics & Inteligência ───────────────────────────────────────────

function AnalyticsTab() {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [projections, setProjections] = useState<SocialImpactProjection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      EBIDAWEDSFService.getTrendAnalyses(),
      EBIDAWEDSFService.getRiskAnalyses(),
      EBIDAWEDSFService.getSocialImpactProjections(),
    ]).then(([t, r, p]) => { setTrends(t); setRisks(r); setProjections(p); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Processando modelos analíticos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧠" title="Analytics & Inteligência Corporativa" sub="Tendências · Análise de Risco · Projeções de Impacto Social · Supervisão Humana" />

      {/* Aviso ISO 42001 */}
      <div style={{ padding: '12px 16px', background: `${C.amber}15`, border: `1px solid ${C.amber}40`, borderRadius: 10, fontSize: 12, color: C.amber }}>
        ⚠️ <strong>ISO 42001:</strong> Análises preditivas apresentam nível de confiança e premissas. Supervisão humana obrigatória em decisões estratégicas.
      </div>

      {/* Trend Analyses */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📈 Análise de Tendências — Séries Temporais</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {trends.map(t => (
            <div key={t.id} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{t.kpiCode}</span>
                <Badge text={`R²: ${t.rSquared.toFixed(2)}`} color={C.green} bg="#064e3b20" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <MetricPill label="Tipo" value={t.trendType} color={C.cyan} />
                <MetricPill label="Confiança" value={`${t.confidenceLevel}%`} color={C.violet} />
              </div>
              <div style={{ fontSize: 10, color: C.text3, marginBottom: 6 }}>
                <strong style={{ color: C.text2 }}>Premissas:</strong>
                <ul style={{ margin: '4px 0 0 14px', padding: 0 }}>
                  {t.assumptions.slice(0, 2).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
              <div style={{ fontSize: 10, color: C.text3 }}>
                📅 Próxima projeção: {t.forecastValues[0]?.period} → {t.forecastValues[0]?.value?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </div>
            </div>
          ))}
        </div>
      </Dark>

      {/* Risk Analysis */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>⚠️ Análise de Risco Institucional</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {risks.map(r => {
            const riskColor = r.riskScore >= 50 ? C.rose : r.riskScore >= 30 ? C.amber : C.green;
            return (
              <div key={r.id} style={{ background: C.bgAlt, border: `1px solid ${riskColor}30`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text1 }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Domínio: {r.domain} · Confiança: {r.confidenceLevel}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: riskColor }}>{r.riskScore.toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: C.text3 }}>Risk Score</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.text3 }}>Probabilidade</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.amber }}>{r.probability}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: C.text3 }}>Impacto</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.rose }}>{r.impact}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: C.text3 }}>Risco Residual</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{r.residualRisk}%</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.text3 }}>
                  <strong style={{ color: C.text2 }}>Mitigações:</strong> {r.mitigationActions.join(' · ')}
                </div>
              </div>
            );
          })}
        </div>
      </Dark>

      {/* Social Impact Projections */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>🌟 Projeções de Impacto Social</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {projections.map(p => (
            <div key={p.id} style={{ background: `${C.violet}12`, border: `1px solid ${C.violet}30`, borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text1, marginBottom: 12 }}>{p.title}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.text3 }}>SROI Atual</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.cyan }}>{p.sroiCurrent}x</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text3 }}>SROI Projetado</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{p.sroiProjected}x</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text3 }}>Beneficiários Atuais</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text1 }}>{fmtNum(p.beneficiariesServedCurrent)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.text3 }}>Beneficiários Projetados</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmtNum(p.beneficiariesServedProjected)}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>
                💰 Investimento necessário: {fmtCur(p.investmentRequired)}
              </div>
              <div style={{ fontSize: 10, color: C.text3, marginBottom: 6 }}>
                <strong style={{ color: C.text2 }}>Premissas:</strong>
                <ul style={{ margin: '4px 0 0 14px', padding: 0 }}>
                  {p.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
              <Badge text={`Confiança: ${p.confidenceLevel}%`} color={C.violet} bg="#2e106530" />
            </div>
          ))}
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 9: Scorecards ──────────────────────────────────────────────────────────

function ScorecardsTab() {
  const [scorecards, setScorecards] = useState<ExecutiveScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getScorecards().then(s => { setScorecards(s); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Scorecards..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏅" title="Scorecards Executivos (BSC)" sub={`${scorecards.length} scorecards publicados · Perspectivas: Impacto, Financeiro, Operacional, Governança`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {scorecards.map(sc => (
          <Dark key={sc.id} style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text1 }}>{sc.title}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Período: {sc.period} · {sc.audience}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: sc.overallScore >= 90 ? C.green : sc.overallScore >= 75 ? C.amber : C.rose }}>
                  {sc.overallScore}
                </div>
                <div style={{ fontSize: 9, color: C.text3 }}>Score Geral</div>
              </div>
            </div>

            {sc.perspectives.map(p => (
              <div key={p.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.text2 }}>{p.icon} {p.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: p.score >= 90 ? C.green : p.score >= 75 ? C.amber : C.rose }}>
                    {p.score}/100 (peso {p.weight}%)
                  </span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
                  <div style={{
                    height: 6, width: `${p.score}%`,
                    background: `linear-gradient(90deg, ${p.score >= 90 ? C.green : p.score >= 75 ? C.amber : C.rose}88, ${p.score >= 90 ? C.green : p.score >= 75 ? C.amber : C.rose})`,
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <Badge text={sc.isPublished ? '● PUBLICADO' : '● RASCUNHO'} color={C.green} bg="#064e3b20" />
              <span style={{ fontSize: 10, color: C.text3, marginLeft: 8 }}>
                Tendência: {sc.trend === 'UP' ? '↑' : sc.trend === 'DOWN' ? '↓' : '→'}
              </span>
            </div>
          </Dark>
        ))}
      </div>
    </div>
  );
}

// ── TAB 10: Governança & LGPD ──────────────────────────────────────────────────

function GovernanceTab() {
  const govItems = [
    { icon: '🔐', title: 'RBAC — Role-Based Access Control', desc: '14 perfis de acesso mapeados por audiência (PRESIDENCIA → COMPLIANCE)', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🎯', title: 'ABAC — Attribute-Based Access Control', desc: 'Controle por atributos: unidade, programa, região e sensibilidade', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🔒', title: 'Row-Level Security (RLS)', desc: 'Filtro de linhas por perfil — cada usuário vê apenas seus dados', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🔏', title: 'Column-Level Security (CLS)', desc: 'Mascaramento de colunas sensíveis (CPF, nome, CID) por perfil', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🔑', title: 'Criptografia em Repouso e Trânsito', desc: 'AES-256 repouso · TLS 1.3 trânsito · KMS gerenciado', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🎭', title: 'Anonimização & Pseudonimização', desc: 'k-anonymity para dados externos · Pseudonimização para análises internas', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🗑️', title: 'Retenção & Direito ao Esquecimento', desc: 'Políticas automáticas de retenção (365–3650 dias) · LGPD Art. 18', status: 'IMPLEMENTADO', color: C.green },
    { icon: '📋', title: 'Auditoria Completa (Immutable Log)', desc: 'Toda ação registrada: quem acessou, o quê, quando e por quê', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🏢', title: 'Multi-Tenant Segregation', desc: 'Isolamento completo por tenant — dados nunca se misturam', status: 'IMPLEMENTADO', color: C.green },
    { icon: '✅', title: 'Aprovação de Novos Indicadores', desc: 'Workflow: Proposta → CDO Review → Aprovação → Catálogo', status: 'IMPLEMENTADO', color: C.green },
    { icon: '🌐', title: 'Minimização de Dados (LGPD Art. 6)', desc: 'Apenas dados necessários coletados. Coleta proporcional à finalidade', status: 'IMPLEMENTADO', color: C.green },
    { icon: '📜', title: 'DPIA — Data Protection Impact Assessment', desc: 'Avaliação de impacto realizada para dados sensíveis', status: 'IMPLEMENTADO', color: C.green },
  ];

  const lgpdCategories = [
    { cat: 'DADO_SENSIVEL', label: 'Dado Pessoal Sensível', count: 4, color: C.rose, examples: 'EHR, diagnóstico, condição mental' },
    { cat: 'DADO_PESSOAL', label: 'Dado Pessoal', count: 5, color: C.amber, examples: 'Nome, CPF, endereço, contato' },
    { cat: 'ANONIMIZADO', label: 'Dado Anonimizado', count: 2, color: C.green, examples: 'Relatórios de impacto, estatísticas' },
    { cat: 'NAO_PESSOAL', label: 'Não Pessoal', count: 1, color: C.sky, examples: 'Dimensão tempo, agências' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Governança de Dados & Conformidade LGPD" sub="LGPD · ISO 27001 · NIST CSF 2.0 · OWASP ASVS · RBAC/ABAC/RLS/CLS" />

      {/* LGPD Classification */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>🏷️ Classificação LGPD do Catálogo de Dados</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {lgpdCategories.map(l => (
            <div key={l.cat} style={{ background: `${l.color}12`, border: `1px solid ${l.color}30`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: l.color }}>{l.count}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: l.color, marginTop: 2 }}>{l.label}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>{l.examples}</div>
            </div>
          ))}
        </div>
      </Dark>

      {/* Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {govItems.map(item => (
          <Dark key={item.title} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{item.title}</div>
                  <Badge text={item.status} color={item.color} bg={`${item.color}20`} />
                </div>
                <div style={{ fontSize: 11, color: C.text3 }}>{item.desc}</div>
              </div>
            </div>
          </Dark>
        ))}
      </div>
    </div>
  );
}

// ── TAB 11: Alertas ────────────────────────────────────────────────────────────

function AlertsTab() {
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getAlerts().then(a => { setAlerts(a); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Alertas..." />;

  const events = [
    { name: 'DatasetCreated', desc: 'Novo dataset registrado no catálogo', count: 3 },
    { name: 'PipelineExecuted', desc: 'Pipeline ETL/ELT concluído', count: 142 },
    { name: 'DashboardPublished', desc: 'Dashboard publicado para audiência', count: 14 },
    { name: 'KPICalculated', desc: 'KPI recalculado e atualizado', count: 290 },
    { name: 'ReportGenerated', desc: 'Relatório gerado automaticamente', count: 48 },
    { name: 'DataQualityViolationDetected', desc: 'Violação de regra DQ detectada', count: 7 },
    { name: 'DataCatalogUpdated', desc: 'Entrada do catálogo atualizada', count: 22 },
    { name: 'ExecutiveAlertTriggered', desc: 'Alerta executivo disparado', count: 4 },
    { name: 'ScorecardUpdated', desc: 'Scorecard executivo atualizado', count: 8 },
    { name: 'ETLCompleted', desc: 'Ciclo ETL completo concluído', count: 96 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔔" title="Executive Alerts Engine & Event Bus" sub="Alertas automáticos · 10 tipos de eventos · SLA tracking" />

      {/* Active Alerts */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>
          🚨 Alertas Executivos Ativos ({alerts.filter(a => a.status === 'ATIVO').length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(a => {
            const cfg = SEV_CFG[a.severity];
            return (
              <div key={a.id} style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}30`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text1 }}>{cfg.icon} {a.title}</div>
                    <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Fonte: {a.source} · {a.code}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge text={a.severity} color={cfg.color} bg={cfg.bg} />
                    <Badge text={a.status} color={a.status === 'ATIVO' ? C.rose : C.amber} bg="#1e293b" />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.text2 }}>{a.description}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>
                  Audiências: {a.affectedAudiences.join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </Dark>

      {/* Event Catalog */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📡 Catálogo de Eventos — Event Bus (E019)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {events.map(ev => (
            <div key={ev.name} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{ev.name}</span>
                <Badge text={`${ev.count}×`} color={C.sky} bg={`${C.sky}15`} />
              </div>
              <div style={{ fontSize: 11, color: C.text3 }}>{ev.desc}</div>
            </div>
          ))}
        </div>
      </Dark>
    </div>
  );
}

// ── TAB 12: Certificação E019 ──────────────────────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<AnalyticsPlatformCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EBIDAWEDSFService.getCertification().then(c => { setCert(c); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Processando Certificação..." />;

  const compliant = cert.conformanceChecklist.filter(c => c.compliant).length;
  const total = cert.conformanceChecklist.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Enterprise Analytics Readiness Score — E019" sub="Certificação da Plataforma Corporativa de Business Intelligence" />

      {/* Global Score */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #061630 50%, #0d0630 100%)',
        border: `2px solid ${C.cyan}40`, borderRadius: 20, padding: '32px 36px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: `${C.cyan}06`, borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ fontSize: 80, fontWeight: 900, color: cert.globalScore >= 90 ? C.green : C.amber, lineHeight: 1 }}>
          {cert.globalScore}
        </div>
        <div style={{ fontSize: 16, color: C.text2, marginTop: 4 }}>Enterprise Analytics Readiness Score (0–100)</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 8 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16 }}>
          <Badge text="🎖️ PLATAFORMA CERTIFICADA" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Subdomain Scores */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Subdomínio Analítico</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.subdomainScores.map(s => (
            <div key={s.subdomain} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.subdomain}</div>
                  <div style={{ fontSize: 10, color: C.text3 }}>{s.description}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.score >= 95 ? C.green : s.score >= 90 ? C.cyan : C.amber }}>
                  {s.score}
                </div>
              </div>
              <ScoreBar label="" value={s.score} color={s.score >= 95 ? C.green : s.score >= 90 ? C.cyan : C.amber} />
              {s.dimensions.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.text3, marginTop: 4 }}>
                  <span>{d.name}</span>
                  <span style={{ fontWeight: 700, color: d.score >= 95 ? C.green : C.amber }}>{d.score}</span>
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <Badge text={s.certificationStatus} color={C.green} bg="#064e3b20" />
              </div>
            </div>
          ))}
        </div>
      </Dark>

      {/* Conformance Checklist */}
      <Dark>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 8 }}>
          ✅ Checklist de Conformidade ({compliant}/{total} itens conformes)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {cert.conformanceChecklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: item.compliant ? '#064e3b10' : '#4c051910', borderRadius: 7, fontSize: 11 }}>
              <span style={{ color: item.compliant ? C.green : C.rose, fontSize: 14 }}>{item.compliant ? '✓' : '✗'}</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: C.text1 }}>{item.item}</span>
                <span style={{ color: C.text3, marginLeft: 6 }}>· {item.standard}</span>
              </div>
            </div>
          ))}
        </div>
      </Dark>

      {/* Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #061630, #0c0630)`,
        border: `1px solid ${C.violet}40`, borderRadius: 16, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.violet, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CERTIFICAÇÃO
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Business Intelligence, Data Warehouse, Analytics & Executive Decision Support
          Framework (EBIDWAEDSF)</strong> foi implementado, validado e certificado com score global de{' '}
          <strong style={{ color: C.green }}>{cert.globalScore}/100</strong>, tornando-se a plataforma oficial de inteligência
          corporativa da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>, consolidando todos os módulos
          E005–E018 em uma camada única de dados, analytics e decisão executiva.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Esta certificação autoriza formalmente a execução da próxima fase:{' '}
          <strong style={{ color: C.cyan }}>E020 — Enterprise Artificial Intelligence, Knowledge Management &
          Intelligent Automation Framework</strong>, dedicada à implantação da camada corporativa de inteligência
          artificial, gestão do conhecimento, automação cognitiva e assistentes inteligentes.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Badge text="DDD ✓" color={C.green} bg="#064e3b20" />
          <Badge text="ISO 8000 ✓" color={C.green} bg="#064e3b20" />
          <Badge text="ISO 27001 ✓" color={C.green} bg="#064e3b20" />
          <Badge text="ISO 42001 ✓" color={C.green} bg="#064e3b20" />
          <Badge text="LGPD ✓" color={C.green} bg="#064e3b20" />
          <Badge text="OWASP ASVS ✓" color={C.green} bg="#064e3b20" />
          <Badge text="NIST CSF 2.0 ✓" color={C.green} bg="#064e3b20" />
          <Badge text="Data Vault 2.0 ✓" color={C.green} bg="#064e3b20" />
          <Badge text="Kimball ✓" color={C.green} bg="#064e3b20" />
          <Badge text="DAMA-DMBOK2 ✓" color={C.green} bg="#064e3b20" />
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: C.text3 }}>
          Certificado por: {cert.certifiedBy} · Próxima revisão: {new Date(cert.nextReviewAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}

// ── Loading State ──────────────────────────────────────────────────────────────

function LoadingState({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <div style={{
        width: 44, height: 44, border: `3px solid ${C.borderDim}`,
        borderTopColor: C.cyan, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function EBIDAWEDSFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTab = () => {
    switch (activeTab) {
      case 'tower':      return <CommandTowerTab />;
      case 'warehouse':  return <DataWarehouseTab />;
      case 'kpis':       return <KPIsTab />;
      case 'dashboards': return <DashboardsTab />;
      case 'pipelines':  return <PipelinesTab />;
      case 'quality':    return <DataQualityTab />;
      case 'catalog':    return <DataCatalogTab />;
      case 'analytics':  return <AnalyticsTab />;
      case 'scorecards': return <ScorecardsTab />;
      case 'governance': return <GovernanceTab />;
      case 'alerts':     return <AlertsTab />;
      case 'cert':       return <CertificationTab />;
      default:           return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>📡</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise BI, Data Warehouse & Decision Support
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E019 · EBIDWAEDSF · Kimball · Data Vault 2.0 · ISO 8000 · LGPD · NIST CSF 2.0 · Instituto Ser Melhor
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 3, background: '#0d1526',
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
                  ? `linear-gradient(135deg, ${C.cyan}30, ${C.violet}30)`
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
      <div>{renderTab()}</div>
    </div>
  );
}

export default EBIDAWEDSFPage;
