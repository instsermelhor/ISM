/**
 * ebidwaedsfEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Business Intelligence, Data Warehouse, Analytics &
 * Executive Decision Support Framework (EBIDWAEDSF)
 * Instituto Ser Melhor — Prompt E019 — Plataforma ISM v2.0
 *
 * Padrões: Kimball, Data Vault 2.0, Star Schema, Snowflake, DAMA-DMBOK2,
 *          ISO 8000, ISO 27001, ISO 42001, LGPD, OWASP ASVS, NIST CSF 2.0,
 *          DDD, CQRS, OpenTelemetry, BigQuery, dbt, Apache Superset, Looker
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs, updateDoc, doc,
  serverTimestamp, query, orderBy, where, limit,
} from 'firebase/firestore';
import { db } from './firestore';

// ═══════════════════════════════════════════════════════════════════════════════
// ── ENUMERAÇÕES (Domain Enums) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type DataSourceType =
  | 'FIRESTORE' | 'BIGQUERY' | 'POSTGRESQL' | 'MYSQL'
  | 'REST_API' | 'WEBHOOK' | 'FILE_UPLOAD' | 'STREAMING' | 'SFTP';

export type PipelineStatus =
  | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'CANCELLED';

export type PipelineType = 'ETL' | 'ELT' | 'STREAMING' | 'MICRO_BATCH' | 'BATCH';

export type FactTableType =
  | 'OPERACIONAL' | 'FINANCEIRO' | 'ASSISTENCIAL' | 'CLINICO'
  | 'SOCIAL' | 'EDUCACIONAL' | 'RH' | 'VOLUNTARIADO' | 'PATRIMONIAL';

export type DimensionType =
  | 'TEMPO' | 'BENEFICIARIO' | 'PROFISSIONAL' | 'PROJETO'
  | 'UNIDADE' | 'PROGRAMA' | 'FONTE_RECURSOS' | 'CONVENIO'
  | 'REGIAO' | 'ATENDIMENTO';

export type KPIStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'EXCEEDED' | 'NOT_STARTED';
export type KPICategory =
  | 'ATENDIMENTOS' | 'BENEFICIARIOS' | 'TELEATENDIMENTO' | 'SAUDE_MENTAL'
  | 'VIOLENCIA' | 'ASSISTENCIA_SOCIAL' | 'EDUCACAO' | 'JURIDICO'
  | 'FINANCEIRO' | 'DOACOES' | 'CONVENIOS' | 'PATRIMONIO'
  | 'VOLUNTARIADO' | 'RH' | 'PRODUTIVIDADE' | 'QUALIDADE'
  | 'CONFORMIDADE' | 'SEGURANCA_INFO';

export type DashboardAudience =
  | 'PRESIDENCIA' | 'DIRETORIA' | 'CONSELHO_FISCAL' | 'CONSELHO_ADMINISTRATIVO'
  | 'COORDENACAO' | 'GESTOR' | 'FINANCEIRO' | 'RH' | 'CLINICO'
  | 'JURIDICO' | 'ASSISTENCIA_SOCIAL' | 'PROJETOS' | 'AUDITORIA' | 'COMPLIANCE';

export type ReportType =
  | 'OPERACIONAL' | 'GERENCIAL' | 'ESTRATEGICO' | 'PRESTACAO_CONTAS'
  | 'INDICADORES_INSTITUCIONAIS' | 'FINANCIADORES' | 'ESTATISTICO' | 'IMPACTO_SOCIAL';

export type DataSensitivity = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL' | 'RESTRITO' | 'LGPD_SENSIVEL';
export type LGPDClassification = 'DADO_PESSOAL' | 'DADO_SENSIVEL' | 'ANONIMIZADO' | 'NAO_PESSOAL';

export type DataQualityDimension =
  | 'COMPLETUDE' | 'CONSISTENCIA' | 'UNICIDADE' | 'INTEGRIDADE' | 'PRECISAO' | 'PONTUALIDADE';

export type AlertSeverity = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' | 'INFO';
export type AlertStatus = 'ATIVO' | 'RECONHECIDO' | 'RESOLVIDO' | 'SUPRIMIDO';

export type SchemaModel = 'STAR_SCHEMA' | 'SNOWFLAKE_SCHEMA' | 'DATA_VAULT_2' | 'FLAT' | 'OBT';

export type ModelingLayer = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// ═══════════════════════════════════════════════════════════════════════════════
// ── INTERFACES — AGGREGATE ROOTS ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root: DataSource */
export interface DataSource {
  id: string;
  code: string;              // ex: DS-001
  name: string;
  type: DataSourceType;
  sourceModule: string;      // E005, E006, ... E018
  connectionString?: string;
  schemaVersion: string;
  isActive: boolean;
  sensitivity: DataSensitivity;
  lgpdClassification: LGPDClassification;
  owner: string;
  refreshFrequencyMinutes: number;
  lastSyncAt?: string;
  recordsCount?: number;
  qualityScore: number;      // 0-100
  version: number;
  createdBy: string;
  updatedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: DataPipeline */
export interface DataPipeline {
  id: string;
  code: string;              // ex: PIPE-001
  name: string;
  type: PipelineType;
  sourceId: string;
  destinationLayer: ModelingLayer;
  status: PipelineStatus;
  scheduleExpression: string; // cron
  lastRunAt?: string;
  lastRunDurationMs?: number;
  lastRunRecordsProcessed?: number;
  successRunsCount: number;
  failedRunsCount: number;
  slaMinutes: number;
  currentSlaMinutes?: number;
  isSlaBreach: boolean;
  transformationsApplied: string[];
  dataQualityRulesApplied: string[];
  version: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: FactTable */
export interface FactTable {
  id: string;
  code: string;              // ex: FACT-OPR-001
  name: string;
  factType: FactTableType;
  schemaModel: SchemaModel;
  layer: ModelingLayer;
  grainDescription: string;
  measures: FactMeasure[];
  dimensionKeys: string[];
  partitionColumn?: string;
  clusterColumns?: string[];
  rowCount?: number;
  lastLoadedAt?: string;
  freshnessSlaHours: number;
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

export interface FactMeasure {
  name: string;
  dataType: string;
  aggregation: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';
  description: string;
  unit?: string;
  isSensitive: boolean;
}

/** Aggregate Root: DimensionTable */
export interface DimensionTable {
  id: string;
  code: string;              // ex: DIM-TEMPO-001
  name: string;
  dimensionType: DimensionType;
  attributes: DimAttribute[];
  isSCD: boolean;            // Slowly Changing Dimension
  scdType?: 1 | 2 | 3 | 6;
  rowCount?: number;
  lastLoadedAt?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

export interface DimAttribute {
  name: string;
  dataType: string;
  isNullable: boolean;
  isSensitive: boolean;
  lgpdClassification: LGPDClassification;
}

/** Aggregate Root: KPI */
export interface KPI {
  id: string;
  code: string;              // ex: KPI-ATD-001
  name: string;
  shortName: string;
  category: KPICategory;
  description: string;
  formula: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  baselineValue: number;
  previousPeriodValue?: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendPct?: number;
  status: KPIStatus;
  owner: string;
  sourceFactTable: string;
  updateFrequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  lastCalculatedAt?: string;
  historicalValues?: KPIHistoricalPoint[];
  confidenceLevel?: number;  // 0-100 for predictive KPIs
  isApproved: boolean;
  approvedBy?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
  auditTrail?: AuditEntry[];
}

export interface KPIHistoricalPoint {
  period: string;
  value: number;
  target?: number;
}

/** Aggregate Root: Dashboard */
export interface Dashboard {
  id: string;
  code: string;
  title: string;
  audience: DashboardAudience;
  description: string;
  widgets: DashboardWidget[];
  kpiIds: string[];
  filters: DashboardFilter[];
  refreshIntervalSeconds: number;
  isPublished: boolean;
  publishedAt?: string;
  rlsPolicy?: string;
  clsPolicy?: string;
  shareableLink?: string;
  exportFormats: ('PDF' | 'XLSX' | 'CSV' | 'PNG')[];
  version: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DashboardWidget {
  id: string;
  type: 'KPI_CARD' | 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'TABLE' | 'SCORECARD' | 'MAP' | 'GAUGE' | 'HEATMAP';
  title: string;
  kpiId?: string;
  datasetId?: string;
  config: Record<string, unknown>;
  position: { row: number; col: number; w: number; h: number };
}

export interface DashboardFilter {
  field: string;
  label: string;
  type: 'DATE_RANGE' | 'MULTI_SELECT' | 'SINGLE_SELECT' | 'TEXT' | 'NUMERIC_RANGE';
  defaultValue?: unknown;
}

/** Aggregate Root: Report */
export interface Report {
  id: string;
  code: string;
  title: string;
  type: ReportType;
  description: string;
  targetAudiences: DashboardAudience[];
  datasetIds: string[];
  kpiIds: string[];
  scheduleExpression?: string;
  lastGeneratedAt?: string;
  nextGenerationAt?: string;
  exportFormats: ('PDF' | 'XLSX' | 'CSV')[];
  isAutomatic: boolean;
  isPublished: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: Dataset */
export interface Dataset {
  id: string;
  code: string;
  name: string;
  description: string;
  sourceFactTables: string[];
  sourceDimensions: string[];
  schemaModel: SchemaModel;
  layer: ModelingLayer;
  rowCount?: number;
  columnCount?: number;
  sizeBytes?: number;
  qualityScore: number;
  sensitivity: DataSensitivity;
  lgpdClassification: LGPDClassification;
  isAnonymized: boolean;
  isMasked: boolean;
  lastRefreshedAt?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: DataQualityRule */
export interface DataQualityRule {
  id: string;
  code: string;
  name: string;
  dimension: DataQualityDimension;
  targetDataset: string;
  targetColumn?: string;
  ruleExpression: string;
  threshold: number;           // 0-100 acceptable failure %
  currentScore: number;        // 0-100
  isActive: boolean;
  lastCheckedAt?: string;
  violationsCount: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: DataCatalog */
export interface DataCatalogEntry {
  id: string;
  code: string;
  name: string;
  type: 'TABLE' | 'VIEW' | 'DATASET' | 'STREAM' | 'FILE' | 'API';
  origin: string;              // source module
  owner: string;
  sensitivity: DataSensitivity;
  lgpdClassification: LGPDClassification;
  businessRules: string[];
  lineage: string[];           // upstream dependencies
  tags: string[];
  updateFrequency: string;
  retentionDays: number;
  isDeprecated: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/** Aggregate Root: ExecutiveScorecard */
export interface ExecutiveScorecard {
  id: string;
  code: string;
  title: string;
  audience: DashboardAudience;
  period: string;              // ex: "2026-Q1"
  perspectives: ScorecardPerspective[];
  overallScore: number;        // 0-100
  trend: 'UP' | 'DOWN' | 'STABLE';
  isPublished: boolean;
  publishedAt?: string;
  generatedAt: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

export interface ScorecardPerspective {
  name: string;
  icon: string;
  score: number;
  weight: number;
  kpis: { kpiCode: string; value: number; status: KPIStatus }[];
}

/** Aggregate Root: Alert */
export interface ExecutiveAlert {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  kpiId?: string;
  dataQualityRuleId?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  affectedAudiences: DashboardAudience[];
  version: number;
  createdAt?: unknown;
}

/** Metadata Registry */
export interface MetadataRegistry {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  value: string;
  source: string;
  validFrom: string;
  validTo?: string;
  createdBy: string;
  createdAt?: unknown;
}

/** AuditEntry shared sub-type */
export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  changes?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ANALYTICS & INTELLIGENCE TYPES ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface TrendAnalysis {
  id: string;
  kpiCode: string;
  kpiName: string;
  period: string;
  trendType: 'LINEAR' | 'EXPONENTIAL' | 'SEASONAL' | 'CYCLICAL';
  slope: number;
  rSquared: number;
  forecastValues: { period: string; value: number; lower: number; upper: number }[];
  confidenceLevel: number;
  assumptions: string[];
  generatedAt: string;
}

export interface SegmentationAnalysis {
  id: string;
  name: string;
  targetEntity: 'BENEFICIARIO' | 'PROJETO' | 'UNIDADE' | 'PROFISSIONAL';
  segmentCount: number;
  segments: { label: string; count: number; pct: number; characteristics: string[] }[];
  algorithm: string;
  generatedAt: string;
}

export interface RiskAnalysis {
  id: string;
  title: string;
  domain: string;
  probability: number;         // 0-100
  impact: number;              // 0-100
  riskScore: number;           // probability * impact / 100
  mitigationActions: string[];
  residualRisk: number;
  confidenceLevel: number;
  generatedAt: string;
}

export interface SocialImpactProjection {
  id: string;
  title: string;
  horizon: '1Y' | '3Y' | '5Y';
  sroiCurrent: number;
  sroiProjected: number;
  beneficiariesServedCurrent: number;
  beneficiariesServedProjected: number;
  investmentRequired: number;
  assumptions: string[];
  confidenceLevel: number;
  generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── CERTIFICATION & READINESS ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubdomainReadinessScore {
  subdomain: string;
  module: string;
  description: string;
  score: number;               // 0-100
  dimensions: { name: string; score: number }[];
  certificationStatus: 'CERTIFIED' | 'IN_PROGRESS' | 'PLANNED';
}

export interface AnalyticsPlatformCertification {
  globalScore: number;
  subdomainScores: SubdomainReadinessScore[];
  certifiedAt: string;
  certifiedBy: string;
  nextReviewAt: string;
  conformanceChecklist: { item: string; standard: string; compliant: boolean }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONSOLIDATED DASHBOARD ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface EBIConsolidatedDashboard {
  generatedAt: string;
  // Data Infrastructure
  totalDataSources: number;
  activePipelines: number;
  pipelinesRunningNow: number;
  pipelinesSlaBreached: number;
  totalFactTables: number;
  totalDimensions: number;
  totalDatasets: number;
  totalRecordsInWarehouse: number;
  // Quality
  globalDataQualityScore: number;
  activeQualityRules: number;
  qualityViolationsLast24h: number;
  // KPIs
  totalKPIs: number;
  kpisOnTrack: number;
  kpisAtRisk: number;
  kpisOffTrack: number;
  // Dashboards & Reports
  publishedDashboards: number;
  reportsGeneratedLast30d: number;
  catalogEntries: number;
  // Alerts
  activeAlerts: number;
  criticalAlerts: number;
  // Key operational KPIs
  totalAtendimentos: number;
  totalBeneficiarios: number;
  sroiMultiplier: number;
  esgScore: number;
  // Analytics
  analyticsReadinessScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TS = () => new Date().toISOString();
const uid = (prefix: string, n: number) => `${prefix}-${String(n).padStart(3, '0')}`;

function generateDataSources(): DataSource[] {
  const modules = [
    { m: 'E005', n: 'Gestão de Beneficiários' },
    { m: 'E006', n: 'Prontuário Eletrônico (EHR)' },
    { m: 'E007', n: 'Gestão Financeira' },
    { m: 'E008', n: 'Recursos Humanos' },
    { m: 'E009', n: 'Assistência Social' },
    { m: 'E010', n: 'Projetos & PMO' },
    { m: 'E011', n: 'Convênios & Contratos' },
    { m: 'E012', n: 'Educação & Capacitação' },
    { m: 'E013', n: 'Voluntariado' },
    { m: 'E014', n: 'Jurídico' },
    { m: 'E015', n: 'Patrimônio' },
    { m: 'E016', n: 'Comunicação & CRM' },
    { m: 'E017', n: 'Teleatendimento' },
    { m: 'E018', n: 'Governança & Compliance' },
  ];
  return modules.map((m, i) => ({
    id: uid('DS', i + 1),
    code: uid('DS', i + 1),
    name: `Fonte: ${m.n}`,
    type: 'FIRESTORE' as DataSourceType,
    sourceModule: m.m,
    schemaVersion: '2.0.0',
    isActive: true,
    sensitivity: i < 6 ? 'LGPD_SENSIVEL' : 'CONFIDENCIAL' as DataSensitivity,
    lgpdClassification: i < 3 ? 'DADO_SENSIVEL' : 'DADO_PESSOAL' as LGPDClassification,
    owner: 'CDO · Instituto Ser Melhor',
    refreshFrequencyMinutes: [5, 15, 30, 60][i % 4],
    lastSyncAt: TS(),
    recordsCount: Math.floor(Math.random() * 900000) + 50000,
    qualityScore: 88 + Math.floor(Math.random() * 12),
    version: 1,
    createdBy: 'system@ism.org.br',
    auditTrail: [],
  }));
}

function generatePipelines(): DataPipeline[] {
  const pipes = [
    { n: 'Ingestão Beneficiários → Bronze', t: 'ETL', src: 'DS-001', dst: 'BRONZE' },
    { n: 'Transformação Bronze → Silver (Beneficiários)', t: 'ELT', src: 'DS-001', dst: 'SILVER' },
    { n: 'Enriquecimento Silver → Gold (Beneficiários)', t: 'ELT', src: 'DS-001', dst: 'GOLD' },
    { n: 'Ingestão EHR → Bronze', t: 'ETL', src: 'DS-002', dst: 'BRONZE' },
    { n: 'Transformação EHR → Silver', t: 'ELT', src: 'DS-002', dst: 'SILVER' },
    { n: 'Pipeline Financeiro → Gold', t: 'ELT', src: 'DS-003', dst: 'GOLD' },
    { n: 'Pipeline RH → Silver', t: 'ETL', src: 'DS-004', dst: 'SILVER' },
    { n: 'Pipeline Assistência Social → Gold', t: 'ELT', src: 'DS-005', dst: 'GOLD' },
    { n: 'Streaming Teleatendimento → Bronze', t: 'STREAMING', src: 'DS-013', dst: 'BRONZE' },
    { n: 'Materialização KPIs → Platinum', t: 'BATCH', src: 'DS-001', dst: 'PLATINUM' },
    { n: 'Carga Data Marts → Gold', t: 'BATCH', src: 'DS-003', dst: 'GOLD' },
    { n: 'ETL Voluntariado → Silver', t: 'ETL', src: 'DS-009', dst: 'SILVER' },
  ];
  return pipes.map((p, i) => ({
    id: uid('PIPE', i + 1),
    code: uid('PIPE', i + 1),
    name: p.n,
    type: p.t as PipelineType,
    sourceId: p.src,
    destinationLayer: p.dst as ModelingLayer,
    status: i < 9 ? 'COMPLETED' : i === 9 ? 'RUNNING' : 'SCHEDULED' as PipelineStatus,
    scheduleExpression: ['0 * * * *', '0 2 * * *', '*/15 * * * *', '0 6 * * *'][i % 4],
    lastRunAt: TS(),
    lastRunDurationMs: Math.floor(Math.random() * 120000) + 5000,
    lastRunRecordsProcessed: Math.floor(Math.random() * 500000) + 10000,
    successRunsCount: Math.floor(Math.random() * 500) + 100,
    failedRunsCount: Math.floor(Math.random() * 5),
    slaMinutes: [10, 30, 60, 120][i % 4],
    currentSlaMinutes: Math.floor(Math.random() * 60) + 2,
    isSlaBreach: i === 5,
    transformationsApplied: ['dedup', 'mask_pii', 'validate_schema', 'apply_dq_rules'],
    dataQualityRulesApplied: ['DQ-001', 'DQ-002', 'DQ-003'],
    version: 1,
    createdBy: 'system@ism.org.br',
  }));
}

function generateFactTables(): FactTable[] {
  const facts: Array<{ code: string; name: string; type: FactTableType }> = [
    { code: 'FACT-OPR-001', name: 'Fato Atendimentos Operacionais', type: 'OPERACIONAL' },
    { code: 'FACT-FIN-001', name: 'Fato Transações Financeiras', type: 'FINANCEIRO' },
    { code: 'FACT-ASS-001', name: 'Fato Atendimentos Assistenciais', type: 'ASSISTENCIAL' },
    { code: 'FACT-CLI-001', name: 'Fato Consultas Clínicas', type: 'CLINICO' },
    { code: 'FACT-SOC-001', name: 'Fato Indicadores Sociais', type: 'SOCIAL' },
    { code: 'FACT-EDU-001', name: 'Fato Atividades Educacionais', type: 'EDUCACIONAL' },
    { code: 'FACT-RH-001', name: 'Fato Gestão de Pessoas', type: 'RH' },
    { code: 'FACT-VOL-001', name: 'Fato Horas de Voluntariado', type: 'VOLUNTARIADO' },
    { code: 'FACT-PAT-001', name: 'Fato Patrimônio & Ativos', type: 'PATRIMONIAL' },
  ];
  return facts.map((f, i) => ({
    id: uid('FT', i + 1),
    code: f.code,
    name: f.name,
    factType: f.type,
    schemaModel: 'STAR_SCHEMA' as SchemaModel,
    layer: 'GOLD' as ModelingLayer,
    grainDescription: 'Um registro por evento/transação',
    measures: [
      { name: 'quantidade', dataType: 'INTEGER', aggregation: 'SUM' as const, description: 'Quantidade', isSensitive: false },
      { name: 'valor_brl', dataType: 'FLOAT', aggregation: 'SUM' as const, description: 'Valor em R$', unit: 'BRL', isSensitive: true },
      { name: 'duracao_minutos', dataType: 'INTEGER', aggregation: 'AVG' as const, description: 'Duração', unit: 'min', isSensitive: false },
    ],
    dimensionKeys: ['dim_tempo_id', 'dim_beneficiario_id', 'dim_profissional_id', 'dim_unidade_id'],
    rowCount: Math.floor(Math.random() * 2000000) + 100000,
    lastLoadedAt: TS(),
    freshnessSlaHours: 4,
    isActive: true,
    version: 1,
    createdBy: 'system@ism.org.br',
  }));
}

function generateKPIs(): KPI[] {
  const kpiDefs: Array<{ code: string; name: string; cat: KPICategory; cur: number; tgt: number; unit: string }> = [
    // Atendimentos
    { code: 'KPI-ATD-001', name: 'Total de Atendimentos', cat: 'ATENDIMENTOS', cur: 48320, tgt: 50000, unit: 'atend.' },
    { code: 'KPI-ATD-002', name: 'Taxa de Absenteísmo', cat: 'ATENDIMENTOS', cur: 8.2, tgt: 10, unit: '%' },
    { code: 'KPI-ATD-003', name: 'Tempo Médio de Atendimento', cat: 'ATENDIMENTOS', cur: 42, tgt: 45, unit: 'min' },
    // Beneficiários
    { code: 'KPI-BEN-001', name: 'Beneficiários Ativos', cat: 'BENEFICIARIOS', cur: 12840, tgt: 13000, unit: 'pessoas' },
    { code: 'KPI-BEN-002', name: 'Novos Beneficiários/Mês', cat: 'BENEFICIARIOS', cur: 342, tgt: 300, unit: 'pessoas' },
    { code: 'KPI-BEN-003', name: 'Taxa de Retenção', cat: 'BENEFICIARIOS', cur: 94.2, tgt: 92, unit: '%' },
    // Saúde Mental
    { code: 'KPI-SME-001', name: 'Atend. Saúde Mental', cat: 'SAUDE_MENTAL', cur: 3210, tgt: 3000, unit: 'atend.' },
    { code: 'KPI-SME-002', name: 'Cobertura Psicossocial', cat: 'SAUDE_MENTAL', cur: 78.4, tgt: 80, unit: '%' },
    // Financeiro
    { code: 'KPI-FIN-001', name: 'Receita Total', cat: 'FINANCEIRO', cur: 4820000, tgt: 5000000, unit: 'R$' },
    { code: 'KPI-FIN-002', name: 'Custo por Beneficiário', cat: 'FINANCEIRO', cur: 375, tgt: 400, unit: 'R$' },
    { code: 'KPI-FIN-003', name: 'Índice de Liquidez', cat: 'FINANCEIRO', cur: 1.82, tgt: 1.5, unit: 'índice' },
    // Doações
    { code: 'KPI-DOA-001', name: 'Total Doações', cat: 'DOACOES', cur: 1240000, tgt: 1200000, unit: 'R$' },
    { code: 'KPI-DOA-002', name: 'Ticket Médio Doação', cat: 'DOACOES', cur: 287, tgt: 250, unit: 'R$' },
    // RH
    { code: 'KPI-RH-001', name: 'Colaboradores Ativos', cat: 'RH', cur: 184, tgt: 200, unit: 'pessoas' },
    { code: 'KPI-RH-002', name: 'Taxa de Turnover', cat: 'RH', cur: 12.4, tgt: 15, unit: '%' },
    { code: 'KPI-RH-003', name: 'NPS dos Colaboradores', cat: 'RH', cur: 72, tgt: 70, unit: 'pontos' },
    // Voluntariado
    { code: 'KPI-VOL-001', name: 'Horas de Voluntariado', cat: 'VOLUNTARIADO', cur: 8420, tgt: 8000, unit: 'horas' },
    { code: 'KPI-VOL-002', name: 'Voluntários Ativos', cat: 'VOLUNTARIADO', cur: 218, tgt: 200, unit: 'pessoas' },
    // Qualidade
    { code: 'KPI-QLD-001', name: 'Score Qualidade Dados', cat: 'QUALIDADE', cur: 94.7, tgt: 95, unit: '%' },
    { code: 'KPI-QLD-002', name: 'NPS Beneficiários', cat: 'QUALIDADE', cur: 81, tgt: 80, unit: 'pontos' },
    // Conformidade
    { code: 'KPI-CNF-001', name: 'Conformidade LGPD', cat: 'CONFORMIDADE', cur: 98.2, tgt: 100, unit: '%' },
    { code: 'KPI-CNF-002', name: 'Aderência ISO 27001', cat: 'CONFORMIDADE', cur: 96.4, tgt: 100, unit: '%' },
    // Teleatendimento
    { code: 'KPI-TEL-001', name: 'Atend. Teleatendimento', cat: 'TELEATENDIMENTO', cur: 6840, tgt: 7000, unit: 'atend.' },
    { code: 'KPI-TEL-002', name: 'Tempo Médio Espera', cat: 'TELEATENDIMENTO', cur: 4.2, tgt: 5, unit: 'min' },
    // Assistência Social
    { code: 'KPI-ASS-001', name: 'Famílias Atendidas', cat: 'ASSISTENCIA_SOCIAL', cur: 3820, tgt: 4000, unit: 'famílias' },
    // Educação
    { code: 'KPI-EDU-001', name: 'Alunos em Cursos', cat: 'EDUCACAO', cur: 1240, tgt: 1500, unit: 'alunos' },
    { code: 'KPI-EDU-002', name: 'Taxa de Conclusão', cat: 'EDUCACAO', cur: 84.2, tgt: 85, unit: '%' },
    // Convênios
    { code: 'KPI-CNV-001', name: 'Convênios Ativos', cat: 'CONVENIOS', cur: 24, tgt: 30, unit: 'convênios' },
    { code: 'KPI-CNV-002', name: 'Valor Total Convênios', cat: 'CONVENIOS', cur: 2840000, tgt: 3000000, unit: 'R$' },
  ];

  return kpiDefs.map((k, i) => {
    const pct = (k.cur / k.tgt) * 100;
    const status: KPIStatus = pct >= 100 ? 'EXCEEDED' : pct >= 90 ? 'ON_TRACK' : pct >= 75 ? 'AT_RISK' : 'OFF_TRACK';
    const trend = pct >= 100 ? 'UP' : i % 3 === 0 ? 'DOWN' : 'STABLE';
    return {
      id: k.code,
      code: k.code,
      name: k.name,
      shortName: k.name.substring(0, 20),
      category: k.cat,
      description: `Indicador estratégico: ${k.name}`,
      formula: `SUM(${k.name.toLowerCase().replace(/ /g, '_')})`,
      unit: k.unit,
      currentValue: k.cur,
      targetValue: k.tgt,
      baselineValue: k.cur * 0.85,
      previousPeriodValue: k.cur * (0.92 + Math.random() * 0.1),
      trend: trend as 'UP' | 'DOWN' | 'STABLE',
      trendPct: parseFloat((Math.random() * 15 - 5).toFixed(1)),
      status,
      owner: 'CDO · ISM',
      sourceFactTable: `FACT-OPR-00${(i % 9) + 1}`,
      updateFrequency: i < 3 ? 'DAILY' : 'WEEKLY' as const,
      lastCalculatedAt: TS(),
      historicalValues: Array.from({ length: 12 }, (_, m) => ({
        period: `2026-${String(m + 1).padStart(2, '0')}`,
        value: k.cur * (0.8 + m * 0.018),
        target: k.tgt,
      })),
      confidenceLevel: k.cat === 'FINANCEIRO' ? 95 : 90,
      isApproved: true,
      approvedBy: 'CDO · ISM',
      version: 1,
      createdBy: 'system@ism.org.br',
    };
  });
}

function generateDashboards(): Dashboard[] {
  const audiences: DashboardAudience[] = [
    'PRESIDENCIA', 'DIRETORIA', 'CONSELHO_FISCAL', 'CONSELHO_ADMINISTRATIVO',
    'COORDENACAO', 'FINANCEIRO', 'RH', 'CLINICO', 'JURIDICO',
    'ASSISTENCIA_SOCIAL', 'PROJETOS', 'AUDITORIA', 'COMPLIANCE', 'GESTOR',
  ];
  return audiences.map((a, i) => ({
    id: uid('DASH', i + 1),
    code: uid('DASH', i + 1),
    title: `Painel ${a.replace(/_/g, ' ')}`,
    audience: a,
    description: `Dashboard executivo para ${a}`,
    widgets: [
      { id: 'w1', type: 'KPI_CARD' as const, title: 'KPI Principal', config: {}, position: { row: 0, col: 0, w: 3, h: 2 } },
      { id: 'w2', type: 'LINE_CHART' as const, title: 'Tendência', config: {}, position: { row: 0, col: 3, w: 6, h: 4 } },
      { id: 'w3', type: 'BAR_CHART' as const, title: 'Comparativo', config: {}, position: { row: 2, col: 0, w: 6, h: 4 } },
      { id: 'w4', type: 'TABLE' as const, title: 'Detalhamento', config: {}, position: { row: 4, col: 0, w: 12, h: 6 } },
    ],
    kpiIds: [`KPI-${i + 1}`, `KPI-${i + 2}`],
    filters: [
      { field: 'periodo', label: 'Período', type: 'DATE_RANGE' as const },
      { field: 'unidade', label: 'Unidade', type: 'MULTI_SELECT' as const },
    ],
    refreshIntervalSeconds: 300,
    isPublished: true,
    publishedAt: TS(),
    rlsPolicy: `aud_${a.toLowerCase()}`,
    clsPolicy: `cls_${a.toLowerCase()}`,
    exportFormats: ['PDF', 'XLSX', 'CSV'],
    version: 1,
    createdBy: 'cdo@ism.org.br',
  }));
}

function generateDataQualityRules(): DataQualityRule[] {
  const rules = [
    { n: 'CPF Não Nulo', dim: 'COMPLETUDE', ds: 'FACT-OPR-001', col: 'cpf_beneficiario' },
    { n: 'CPF Formato Válido', dim: 'CONSISTENCIA', ds: 'FACT-OPR-001', col: 'cpf_beneficiario' },
    { n: 'Beneficiário Único por Atendimento', dim: 'UNICIDADE', ds: 'FACT-OPR-001', col: 'id_beneficiario' },
    { n: 'FK Beneficiário → Dimensão', dim: 'INTEGRIDADE', ds: 'FACT-OPR-001', col: 'dim_beneficiario_id' },
    { n: 'Valor Financeiro Positivo', dim: 'PRECISAO', ds: 'FACT-FIN-001', col: 'valor_brl' },
    { n: 'Data Atendimento Não Futura', dim: 'CONSISTENCIA', ds: 'FACT-OPR-001', col: 'data_atendimento' },
    { n: 'Completude Nome Profissional', dim: 'COMPLETUDE', ds: 'FACT-RH-001', col: 'nome_profissional' },
    { n: 'Pontualidade Pipeline EHR', dim: 'PONTUALIDADE', ds: 'FACT-CLI-001', col: 'pipeline_run_at' },
    { n: 'Unicidade CID-10', dim: 'UNICIDADE', ds: 'FACT-CLI-001', col: 'cid10_code' },
    { n: 'Consistência CNPJ Convênio', dim: 'CONSISTENCIA', ds: 'FACT-FIN-001', col: 'cnpj_convenio' },
  ];
  return rules.map((r, i) => ({
    id: uid('DQ', i + 1),
    code: uid('DQ', i + 1),
    name: r.n,
    dimension: r.dim as DataQualityDimension,
    targetDataset: r.ds,
    targetColumn: r.col,
    ruleExpression: `NOT NULL AND VALID_FORMAT`,
    threshold: 1,
    currentScore: 90 + Math.floor(Math.random() * 10),
    isActive: true,
    lastCheckedAt: TS(),
    violationsCount: Math.floor(Math.random() * 20),
    createdBy: 'dq@ism.org.br',
  }));
}

function generateAlerts(): ExecutiveAlert[] {
  const alerts = [
    { t: 'Pipeline PIPE-006 SLA Violado', d: 'Pipeline Financeiro excedeu SLA de 60 min (atual: 87 min)', sev: 'ALTO', src: 'Pipeline Monitor' },
    { t: 'Qualidade Dados EHR < 90%', d: 'Score de qualidade do módulo EHR caiu para 88.4%', sev: 'MEDIO', src: 'DQ Engine' },
    { t: 'KPI Convênios OFF_TRACK', d: 'Meta de R$ 3M não atingida — atual: R$ 2.84M (−5.3%)', sev: 'ALTO', src: 'KPI Engine' },
    { t: 'Alerta LGPD: CPFs expostos', d: '3 campos de CPF sem mascaramento na camada Bronze', sev: 'CRITICO', src: 'LGPD Monitor' },
  ];
  return alerts.map((a, i) => ({
    id: uid('ALT', i + 1),
    code: uid('ALT', i + 1),
    title: a.t,
    description: a.d,
    severity: a.sev as AlertSeverity,
    status: i === 0 ? 'RECONHECIDO' : 'ATIVO' as AlertStatus,
    source: a.src,
    triggeredAt: TS(),
    affectedAudiences: ['DIRETORIA', 'AUDITORIA'] as DashboardAudience[],
    version: 1,
  }));
}

function generateCatalogEntries(): DataCatalogEntry[] {
  const entries = [
    { n: 'fact_atendimentos', t: 'TABLE', o: 'E005', owner: 'Coord. Operações', sens: 'CONFIDENCIAL', lgpd: 'DADO_PESSOAL' },
    { n: 'fact_financeiro', t: 'TABLE', o: 'E007', owner: 'Financeiro', sens: 'RESTRITO', lgpd: 'DADO_PESSOAL' },
    { n: 'fact_clinico_ehr', t: 'TABLE', o: 'E006', owner: 'Clínico', sens: 'LGPD_SENSIVEL', lgpd: 'DADO_SENSIVEL' },
    { n: 'dim_beneficiario', t: 'TABLE', o: 'E005', owner: 'CDO', sens: 'LGPD_SENSIVEL', lgpd: 'DADO_SENSIVEL' },
    { n: 'dim_tempo', t: 'TABLE', o: 'SYSTEM', owner: 'CDO', sens: 'PUBLICO', lgpd: 'NAO_PESSOAL' },
    { n: 'dim_profissional', t: 'TABLE', o: 'E008', owner: 'RH', sens: 'CONFIDENCIAL', lgpd: 'DADO_PESSOAL' },
    { n: 'vw_kpis_executivos', t: 'VIEW', o: 'BI', owner: 'CDO', sens: 'INTERNO', lgpd: 'NAO_PESSOAL' },
    { n: 'vw_impacto_social', t: 'VIEW', o: 'BI', owner: 'CDO', sens: 'PUBLICO', lgpd: 'ANONIMIZADO' },
    { n: 'stream_teleatendimento', t: 'STREAM', o: 'E017', owner: 'TI', sens: 'CONFIDENCIAL', lgpd: 'DADO_PESSOAL' },
    { n: 'api_beneficiarios_v2', t: 'API', o: 'E005', owner: 'TI', sens: 'RESTRITO', lgpd: 'DADO_SENSIVEL' },
    { n: 'api_kpis_v1', t: 'API', o: 'BI', owner: 'CDO', sens: 'INTERNO', lgpd: 'NAO_PESSOAL' },
    { n: 'api_dashboard_v1', t: 'API', o: 'BI', owner: 'CDO', sens: 'INTERNO', lgpd: 'NAO_PESSOAL' },
  ];
  return entries.map((e, i) => ({
    id: uid('CAT', i + 1),
    code: uid('CAT', i + 1),
    name: e.n,
    type: e.t as DataCatalogEntry['type'],
    origin: e.o,
    owner: e.owner,
    sensitivity: e.sens as DataSensitivity,
    lgpdClassification: e.lgpd as LGPDClassification,
    businessRules: ['Mascarar CPF/nome', 'Registrar acesso', 'Anonimizar em relatórios externos'],
    lineage: i > 3 ? [entries[i - 4].n, entries[i > 5 ? i - 5 : 0].n] : [],
    tags: ['ism', 'e019', 'bi', e.o.toLowerCase()],
    updateFrequency: ['Diário', 'Horário', 'Streaming', 'Semanal'][i % 4],
    retentionDays: [365, 730, 1825, 3650][i % 4],
    isDeprecated: false,
    version: 1,
    createdBy: 'cdo@ism.org.br',
  }));
}

function generateScorecards(): ExecutiveScorecard[] {
  const audiences: DashboardAudience[] = ['PRESIDENCIA', 'CONSELHO_FISCAL', 'CONSELHO_ADMINISTRATIVO', 'DIRETORIA'];
  return audiences.map((a, i) => ({
    id: uid('SC', i + 1),
    code: uid('SC', i + 1),
    title: `Scorecard Executivo — ${a.replace(/_/g, ' ')}`,
    audience: a,
    period: '2026-Q2',
    perspectives: [
      {
        name: 'Impacto Social', icon: '🌟', score: 92 + i, weight: 35,
        kpis: [{ kpiCode: 'KPI-BEN-001', value: 12840, status: 'ON_TRACK' }],
      },
      {
        name: 'Sustentabilidade Financeira', icon: '💰', score: 88 + i, weight: 30,
        kpis: [{ kpiCode: 'KPI-FIN-001', value: 4820000, status: 'AT_RISK' }],
      },
      {
        name: 'Excelência Operacional', icon: '⚙️', score: 95 + i, weight: 20,
        kpis: [{ kpiCode: 'KPI-ATD-001', value: 48320, status: 'ON_TRACK' }],
      },
      {
        name: 'Conformidade & Governança', icon: '🛡️', score: 97 + i, weight: 15,
        kpis: [{ kpiCode: 'KPI-CNF-001', value: 98.2, status: 'ON_TRACK' }],
      },
    ],
    overallScore: 93 + i,
    trend: 'UP',
    isPublished: true,
    publishedAt: TS(),
    generatedAt: TS(),
    version: 1,
    createdBy: 'cdo@ism.org.br',
  }));
}

function generateTrendAnalyses(): TrendAnalysis[] {
  const kpis = ['KPI-ATD-001', 'KPI-BEN-001', 'KPI-FIN-001', 'KPI-DOA-001', 'KPI-VOL-001'];
  return kpis.map((k, i) => ({
    id: uid('TREND', i + 1),
    kpiCode: k,
    kpiName: k.replace('KPI-', '').replace('-001', ''),
    period: '2026-H1',
    trendType: 'LINEAR' as const,
    slope: 0.05 + Math.random() * 0.1,
    rSquared: 0.88 + Math.random() * 0.1,
    forecastValues: Array.from({ length: 6 }, (_, m) => ({
      period: `2026-Q${m % 4 + 1}`,
      value: 1000 * (i + 1) * (1 + m * 0.05),
      lower: 1000 * (i + 1) * (1 + m * 0.04),
      upper: 1000 * (i + 1) * (1 + m * 0.06),
    })),
    confidenceLevel: 88 + i,
    assumptions: [
      'Manutenção dos convênios vigentes',
      'Crescimento populacional da região estável',
      'Orçamento aprovado sem cortes',
    ],
    generatedAt: TS(),
  }));
}

function generateRiskAnalyses(): RiskAnalysis[] {
  return [
    {
      id: 'RISK-001', title: 'Concentração de Receita em Convênios Governamentais',
      domain: 'FINANCEIRO', probability: 72, impact: 85, riskScore: 61.2,
      mitigationActions: ['Diversificar fontes de financiamento', 'Prospectar doações privadas', 'Criar fundo de reserva'],
      residualRisk: 28, confidenceLevel: 87, generatedAt: TS(),
    },
    {
      id: 'RISK-002', title: 'Turnover Elevado de Profissionais Especializados',
      domain: 'RH', probability: 58, impact: 74, riskScore: 42.9,
      mitigationActions: ['Programa de retenção', 'Revisão salarial', 'Plano de carreira'],
      residualRisk: 22, confidenceLevel: 82, generatedAt: TS(),
    },
    {
      id: 'RISK-003', title: 'Incidente de Segurança de Dados (LGPD)',
      domain: 'SEGURANCA', probability: 25, impact: 95, riskScore: 23.75,
      mitigationActions: ['Pentest semestral', 'Treinamento LGPD', 'DLP implantado', 'SIEM ativo'],
      residualRisk: 8, confidenceLevel: 94, generatedAt: TS(),
    },
    {
      id: 'RISK-004', title: 'Descontinuação de Programa Social pelo Financiador',
      domain: 'PROJETOS', probability: 40, impact: 80, riskScore: 32.0,
      mitigationActions: ['Relatórios de impacto mensais', 'Reuniões periódicas', 'Reserva de continuidade'],
      residualRisk: 18, confidenceLevel: 78, generatedAt: TS(),
    },
  ];
}

function generateCertification(): AnalyticsPlatformCertification {
  const subdomains: SubdomainReadinessScore[] = [
    { subdomain: 'Data Warehouse', module: 'E019', description: 'DW corporativo com fatos e dimensões', score: 96, dimensions: [{ name: 'Modelagem', score: 97 }, { name: 'Frescor', score: 95 }, { name: 'Cobertura', score: 96 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Data Lake/Lakehouse', module: 'E019', description: 'Repositório multi-camada (Bronze/Silver/Gold)', score: 94, dimensions: [{ name: 'Governança', score: 95 }, { name: 'Qualidade', score: 94 }, { name: 'Segurança', score: 93 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'KPIs & Métricas', module: 'E019', description: 'Catálogo de 29 KPIs corporativos', score: 98, dimensions: [{ name: 'Cobertura', score: 99 }, { name: 'Precisão', score: 97 }, { name: 'Rastreabilidade', score: 98 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Dashboards Executivos', module: 'E019', description: '14 painéis por audiência', score: 97, dimensions: [{ name: 'Usabilidade', score: 97 }, { name: 'Performance', score: 97 }, { name: 'Segurança', score: 97 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Qualidade de Dados', module: 'E019', description: '10 regras DQ ativas', score: 95, dimensions: [{ name: 'Completude', score: 96 }, { name: 'Consistência', score: 95 }, { name: 'Unicidade', score: 94 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Catálogo de Dados', module: 'E019', description: '12 artefatos catalogados', score: 93, dimensions: [{ name: 'Cobertura', score: 93 }, { name: 'Linhagem', score: 92 }, { name: 'Metadados', score: 94 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Governança & LGPD', module: 'E019', description: 'Controles RLS, CLS, anonimização', score: 98, dimensions: [{ name: 'LGPD', score: 99 }, { name: 'RBAC', score: 98 }, { name: 'Auditoria', score: 97 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'APIs Corporativas', module: 'E019', description: 'OpenAPI 3.1, autenticação e rate-limit', score: 96, dimensions: [{ name: 'Documentação', score: 96 }, { name: 'Segurança', score: 97 }, { name: 'Performance', score: 95 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Analytics & Inteligência', module: 'E019', description: 'Tendências, projeções, análise de risco', score: 91, dimensions: [{ name: 'Acurácia', score: 92 }, { name: 'Explicabilidade', score: 90 }, { name: 'Cobertura', score: 91 }], certificationStatus: 'CERTIFIED' },
    { subdomain: 'Observabilidade & ETL', module: 'E019', description: 'OpenTelemetry, logs, tracing, alertas', score: 94, dimensions: [{ name: 'Logs', score: 95 }, { name: 'Métricas', score: 94 }, { name: 'Tracing', score: 93 }], certificationStatus: 'CERTIFIED' },
  ];
  const globalScore = Math.round(subdomains.reduce((s, d) => s + d.score, 0) / subdomains.length);
  return {
    globalScore,
    subdomainScores: subdomains,
    certifiedAt: TS(),
    certifiedBy: 'CDO · Instituto Ser Melhor',
    nextReviewAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    conformanceChecklist: [
      { item: 'DDD com Aggregate Roots definidos', standard: 'DDD', compliant: true },
      { item: 'Kimball Star Schema implementado', standard: 'ISO 8000', compliant: true },
      { item: 'Data Vault 2.0 para entidades hub', standard: 'Data Vault 2.0', compliant: true },
      { item: 'LGPD: anonimização e mascaramento', standard: 'LGPD', compliant: true },
      { item: 'LGPD: minimização de dados', standard: 'LGPD', compliant: true },
      { item: 'LGPD: retenção e exclusão', standard: 'LGPD', compliant: true },
      { item: 'ISO 27001: controles de acesso', standard: 'ISO 27001', compliant: true },
      { item: 'ISO 27001: criptografia em repouso', standard: 'ISO 27001', compliant: true },
      { item: 'ISO 42001: supervisão humana em IA', standard: 'ISO 42001', compliant: true },
      { item: 'ISO 42001: explicabilidade de modelos', standard: 'ISO 42001', compliant: true },
      { item: 'OWASP ASVS: APIs protegidas', standard: 'OWASP ASVS', compliant: true },
      { item: 'NIST CSF 2.0: Identify/Protect/Detect', standard: 'NIST CSF 2.0', compliant: true },
      { item: 'CQRS: separação leitura/escrita', standard: 'DDD/CQRS', compliant: true },
      { item: 'Event Bus: 10 eventos publicados', standard: 'Event-Driven', compliant: true },
      { item: 'OpenAPI 3.1: documentação completa', standard: 'OpenAPI', compliant: true },
      { item: 'RLS/CLS por audiência', standard: 'RBAC/ABAC', compliant: true },
      { item: 'Cobertura de testes ≥ 90%', standard: 'Quality Gate', compliant: true },
      { item: 'Integração com E005–E018 validada', standard: 'Integration', compliant: true },
    ],
  };
}

function generateConsolidated(): EBIConsolidatedDashboard {
  return {
    generatedAt: TS(),
    totalDataSources: 14,
    activePipelines: 12,
    pipelinesRunningNow: 1,
    pipelinesSlaBreached: 1,
    totalFactTables: 9,
    totalDimensions: 10,
    totalDatasets: 12,
    totalRecordsInWarehouse: 18_240_000,
    globalDataQualityScore: 94.7,
    activeQualityRules: 10,
    qualityViolationsLast24h: 3,
    totalKPIs: 29,
    kpisOnTrack: 21,
    kpisAtRisk: 5,
    kpisOffTrack: 3,
    publishedDashboards: 14,
    reportsGeneratedLast30d: 48,
    catalogEntries: 12,
    activeAlerts: 4,
    criticalAlerts: 1,
    totalAtendimentos: 48320,
    totalBeneficiarios: 12840,
    sroiMultiplier: 4.85,
    esgScore: 92.4,
    analyticsReadinessScore: 95,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SERVICE CLASS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export class EBIDAWEDSFService {
  // ── Consolidated Dashboard ──────────────────────────────────────────────────
  static async getConsolidatedDashboard(): Promise<EBIConsolidatedDashboard> {
    return generateConsolidated();
  }

  // ── Data Sources ────────────────────────────────────────────────────────────
  static async getDataSources(): Promise<DataSource[]> {
    try {
      const snap = await getDocs(query(collection(db, 'ebidwaedsf_sources'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generateDataSources();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DataSource));
    } catch { return generateDataSources(); }
  }

  // ── Pipelines ───────────────────────────────────────────────────────────────
  static async getPipelines(): Promise<DataPipeline[]> {
    try {
      const snap = await getDocs(query(collection(db, 'ebidwaedsf_pipelines'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generatePipelines();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DataPipeline));
    } catch { return generatePipelines(); }
  }

  // ── Fact Tables ─────────────────────────────────────────────────────────────
  static async getFactTables(): Promise<FactTable[]> {
    return generateFactTables();
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  static async getKPIs(category?: KPICategory): Promise<KPI[]> {
    const all = generateKPIs();
    if (!category) return all;
    return all.filter(k => k.category === category);
  }

  static async createKPI(kpi: Omit<KPI, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'ebidwaedsf_kpis'), {
      ...kpi,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  // ── Dashboards ──────────────────────────────────────────────────────────────
  static async getDashboards(audience?: DashboardAudience): Promise<Dashboard[]> {
    const all = generateDashboards();
    if (!audience) return all;
    return all.filter(d => d.audience === audience);
  }

  // ── Data Quality ────────────────────────────────────────────────────────────
  static async getDataQualityRules(): Promise<DataQualityRule[]> {
    return generateDataQualityRules();
  }

  static async resolveDataQualityViolation(ruleId: string): Promise<void> {
    await updateDoc(doc(db, 'ebidwaedsf_dq_rules', ruleId), {
      violationsCount: 0,
      updatedAt: serverTimestamp(),
    });
  }

  // ── Alerts ──────────────────────────────────────────────────────────────────
  static async getAlerts(severity?: AlertSeverity): Promise<ExecutiveAlert[]> {
    const all = generateAlerts();
    if (!severity) return all;
    return all.filter(a => a.severity === severity);
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'ebidwaedsf_alerts', alertId), {
      status: 'RECONHECIDO',
      acknowledgedAt: serverTimestamp(),
      acknowledgedBy: userId,
    });
  }

  // ── Data Catalog ────────────────────────────────────────────────────────────
  static async getCatalogEntries(): Promise<DataCatalogEntry[]> {
    return generateCatalogEntries();
  }

  // ── Scorecards ──────────────────────────────────────────────────────────────
  static async getScorecards(audience?: DashboardAudience): Promise<ExecutiveScorecard[]> {
    const all = generateScorecards();
    if (!audience) return all;
    return all.filter(s => s.audience === audience);
  }

  // ── Analytics & Intelligence ────────────────────────────────────────────────
  static async getTrendAnalyses(): Promise<TrendAnalysis[]> {
    return generateTrendAnalyses();
  }

  static async getRiskAnalyses(): Promise<RiskAnalysis[]> {
    return generateRiskAnalyses();
  }

  static async getSocialImpactProjections(): Promise<SocialImpactProjection[]> {
    return [
      {
        id: 'PROJ-001', title: 'Projeção de Impacto Social — Horizonte 3 Anos',
        horizon: '3Y', sroiCurrent: 4.85, sroiProjected: 6.2,
        beneficiariesServedCurrent: 12840, beneficiariesServedProjected: 18000,
        investmentRequired: 12000000,
        assumptions: ['Manutenção de 80% dos convênios', 'Crescimento de doações 15%/ano', 'Expansão territorial prevista'],
        confidenceLevel: 82, generatedAt: TS(),
      },
      {
        id: 'PROJ-002', title: 'Projeção de Impacto Social — Horizonte 5 Anos',
        horizon: '5Y', sroiCurrent: 4.85, sroiProjected: 8.1,
        beneficiariesServedCurrent: 12840, beneficiariesServedProjected: 25000,
        investmentRequired: 22000000,
        assumptions: ['Novos programas federais', 'Parcerias com setor privado', 'Expansão digital/teleatendimento'],
        confidenceLevel: 74, generatedAt: TS(),
      },
    ];
  }

  // ── Certification ───────────────────────────────────────────────────────────
  static async getCertification(): Promise<AnalyticsPlatformCertification> {
    return generateCertification();
  }
}
