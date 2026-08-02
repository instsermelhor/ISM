/**
 * espmiimfEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Strategic Performance Management, Institutional Intelligence &
 * Impact Measurement Framework (ESPMIIMF)
 * Instituto Ser Melhor — Prompt E027 — Plataforma ISM v2.0
 *
 * Frameworks & Standards:
 *   - Balanced Scorecard (BSC) — Kaplan & Norton (6 Perspectives)
 *   - OKRs (Objectives & Key Results) — Grove / Doerr Model
 *   - SROI (Social Return on Investment) & Theory of Change / Logic Model
 *   - ISO 9001 (Quality Management) & ISO 30414 (Human Capital Reporting)
 *   - ISO 56002 (Innovation) & ISO 42001 (AI Governance) / LGPD
 *   - DDD / CQRS / Clean Architecture / OpenTelemetry
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs, updateDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from './firestore';

// ═══════════════════════════════════════════════════════════════════════════════
// ── DOMAIN ENUMS & TYPES ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type BSCPerspective =
  | 'IMPACTO_SOCIAL' | 'SUSTENTABILIDADE_FINANCEIRA' | 'PROCESSOS_INTERNOS'
  | 'APRENDIZADO_CRESCIMENTO' | 'INOVACAO_TECNOLOGIA' | 'GOVERNANCA_ETICA';

export type GoalStatus = 'EXCEEDED' | 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

export type OKRCycle = 'Q1_2026' | 'Q2_2026' | 'Q3_2026' | 'Q4_2026' | 'ANNUAL_2026';

export type ExecutiveAudience = 'PRESIDENCIA' | 'CONSELHO_ADMINISTRATIVO' | 'DIRETORIA_EXECUTIVA' | 'COORDENACOES';

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── AGGREGATE ROOTS (ETAPA 1) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root 1: StrategicPlan */
export interface StrategicPlan {
  id: string;
  code: string;               // ex: PLAN-2026-2030
  title: string;
  horizonYears: string;       // ex: 2026-2030
  missionStatement: string;
  visionStatement: string;
  valuesList: string[];
  institutionalPillars: string[];
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED';
  version: number;
  createdBy: string;
  createdAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root 2: StrategicObjective */
export interface StrategicObjective {
  id: string;
  code: string;               // ex: OBJ-001
  planId: string;
  perspective: BSCPerspective;
  title: string;
  description: string;
  ownerPerson: string;
  targetCompletionYear: number;
  progressPct: number;
  status: GoalStatus;
  associatedKpiCodes: string[];
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root 3: BalancedScorecard */
export interface BalancedScorecardItem {
  id: string;
  code: string;
  perspective: BSCPerspective;
  objectiveCount: number;
  kpiCount: number;
  overallHealthScore: number; // 0-100
  perspectiveOwner: string;
}

/** Aggregate Root 4: OKR (Objective & Key Results) */
export interface KeyResult {
  id: string;
  description: string;
  initialValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPct: number;
  owner: string;
}

export interface OKR {
  id: string;
  code: string;               // ex: OKR-2026-Q1-01
  cycle: OKRCycle;
  objectiveTitle: string;
  alignedStrategicObjectiveCode: string;
  keyResults: KeyResult[];
  overallProgressPct: number;
  status: GoalStatus;
  owner: string;
  version: number;
  createdAt?: unknown;
}

/** Aggregate Root 5: StrategicIndicator / KPI */
export interface StrategicKPI {
  id: string;
  code: string;               // ex: KPI-SOC-001
  name: string;
  domain: string;
  formulaDescription: string;
  dataSourceModule: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: 'DIARIO' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';
  status: GoalStatus;
  responsiblePerson: string;
  historicalValues: { date: string; value: number }[];
  version: number;
  createdAt?: unknown;
}

/** Aggregate Root 6: ImpactIndicator & SROI */
export interface SROIIndicator {
  id: string;
  code: string;               // ex: SROI-2026
  programName: string;
  totalInvestmentBrl: number;
  totalSocialValueGeneratedBrl: number;
  sroiRatio: number;          // e.g. 4.85 (R$ 4,85 de valor social para cada R$ 1,00 investido)
  logicModelSummary: string;
  theoryOfChangeRef: string;
  evaluatorName: string;
  evaluationYear: number;
}

/** Aggregate Root 7: InstitutionalBenchmark */
export interface InstitutionalBenchmark {
  id: string;
  metricName: string;
  ismValue: number;
  thirdSectorBenchmarkValue: number;
  unit: string;
  comparisonStatus: 'ABOVE_BENCHMARK' | 'ALIGNED' | 'BELOW_BENCHMARK';
}

/** Aggregate Root 8: ScenarioSimulation */
export interface ScenarioSimulation {
  id: string;
  code: string;               // ex: SIM-001
  scenarioTitle: string;
  assumptions: string[];
  simulatedBudgetVariationPct: number;
  simulatedBeneficiaryImpactDelta: number;
  riskAssessment: string;
  simulatedBy: string;
  timestamp: string;
}

export interface StrategicPerformanceCertification {
  strategicMaturityScore: number; // 0-100
  bscAlignmentScore: number;
  okrExecutionScore: number;
  impactMeasurementScore: number;
  executiveIntelligenceScore: number;
  dataFreshnessScore: number;
  certifiedAt: string;
  certifiedBy: string;
  conformanceChecklist: { item: string; standard: string; compliant: boolean }[];
}

export interface ESPMIIMFConsolidatedDashboard {
  generatedAt: string;
  activeStrategicPlan: string;
  totalObjectivesCount: number;
  totalKPIsMonitored: number;
  activeOKRsCount: number;
  overallBscHealthScore: number;
  globalSroiRatio: number;
  goalsOnTrackPct: number;
  activeStrategicAlertsCount: number;
  strategicPerformanceMaturityScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TS = () => new Date().toISOString();
const uid = (p: string, n: number) => `${p}-${String(n).padStart(3, '0')}`;

function generateBSC(): BalancedScorecardItem[] {
  return [
    { id: 'BSC-001', code: 'BSC-IMPACTO', perspective: 'IMPACTO_SOCIAL', objectiveCount: 4, kpiCount: 8, overallHealthScore: 98, perspectiveOwner: 'Diretoria de Impacto Social' },
    { id: 'BSC-002', code: 'BSC-FINANC', perspective: 'SUSTENTABILIDADE_FINANCEIRA', objectiveCount: 3, kpiCount: 6, overallHealthScore: 96, perspectiveOwner: 'Diretoria Financeira / CFO' },
    { id: 'BSC-003', code: 'BSC-PROCESSO', perspective: 'PROCESSOS_INTERNOS', objectiveCount: 5, kpiCount: 10, overallHealthScore: 97, perspectiveOwner: 'Diretoria de Operações / COO' },
    { id: 'BSC-004', code: 'BSC-APREND', perspective: 'APRENDIZADO_CRESCIMENTO', objectiveCount: 3, kpiCount: 5, overallHealthScore: 95, perspectiveOwner: 'Diretoria de Pessoas / RH' },
    { id: 'BSC-005', code: 'BSC-INOVACAO', perspective: 'INOVACAO_TECNOLOGIA', objectiveCount: 4, kpiCount: 7, overallHealthScore: 99, perspectiveOwner: 'Diretoria de Tecnologia / CTO' },
    { id: 'BSC-006', code: 'BSC-GOVERN', perspective: 'GOVERNANCA_ETICA', objectiveCount: 3, kpiCount: 6, overallHealthScore: 98, perspectiveOwner: 'Comitê de Governança / CGO' },
  ];
}

function generateKPIs(): StrategicKPI[] {
  return [
    { id: 'KPI-001', code: 'KPI-SOC-001', name: 'Total de Famílias Atendidas com Emancipação Social', domain: 'Assistência Social', formulaDescription: 'COUNT(beneficiarios) WHERE status == "EMANCIPADO"', dataSourceModule: 'E009', targetValue: 1200, currentValue: 1340, unit: 'Famílias', frequency: 'MENSAL', status: 'EXCEEDED', responsiblePerson: 'Coord. Assistencial', historicalValues: [{ date: '2026-01', value: 1100 }, { date: '2026-02', value: 1340 }] },
    { id: 'KPI-002', code: 'KPI-FIN-001', name: 'Índice de Cobertura Orçamentária e Captação de Recursos', domain: 'Financeiro', formulaDescription: 'RECEITAS_REALIZADAS / ORCAMENTO_PLANEJADO', dataSourceModule: 'E007', targetValue: 100, currentValue: 108.4, unit: '%', frequency: 'MENSAL', status: 'EXCEEDED', responsiblePerson: 'CFO', historicalValues: [{ date: '2026-01', value: 102.1 }, { date: '2026-02', value: 108.4 }] },
    { id: 'KPI-003', code: 'KPI-OPS-001', name: 'Tempo Médio de Atendimento Inicial Psicossocial (SLA)', domain: 'Saúde Mental', formulaDescription: 'AVG(data_atendimento - data_triagem)', dataSourceModule: 'E006', targetValue: 24, currentValue: 18.5, unit: 'Horas', frequency: 'DIARIO', status: 'EXCEEDED', responsiblePerson: 'Coord. Clínica', historicalValues: [{ date: '2026-01', value: 21 }, { date: '2026-02', value: 18.5 }] },
    { id: 'KPI-004', code: 'KPI-TEC-001', name: 'Disponibilidade Global da Plataforma ISM', domain: 'Tecnologia SRE', formulaDescription: 'UPTIME_MINUTES / TOTAL_MINUTES', dataSourceModule: 'E024', targetValue: 99.9, currentValue: 99.98, unit: '%', frequency: 'DIARIO', status: 'EXCEEDED', responsiblePerson: 'SRE Lead', historicalValues: [{ date: '2026-01', value: 99.97 }, { date: '2026-02', value: 99.98 }] },
  ];
}

function generateOKRs(): OKR[] {
  return [
    {
      id: 'OKR-001', code: 'OKR-2026-Q1-01', cycle: 'Q1_2026', objectiveTitle: 'Maximizar o Alcance do Impacto Social Humanizado', alignedStrategicObjectiveCode: 'OBJ-001', owner: 'Diretoria de Impacto Social', status: 'EXCEEDED', overallProgressPct: 100,
      keyResults: [
        { id: 'KR-01', description: 'Expandir o número de centros comunitários integrados à plataforma', initialValue: 4, targetValue: 8, currentValue: 8, unit: 'Centros', progressPct: 100, owner: 'Coord. Projetos' },
        { id: 'KR-02', description: 'Elevar o índice de satisfação dos beneficiários (CSAT)', initialValue: 90, targetValue: 95, currentValue: 96.5, unit: '%', progressPct: 100, owner: 'Equipe de Acolhimento' },
      ],
    },
    {
      id: 'OKR-002', code: 'OKR-2026-Q1-02', cycle: 'Q1_2026', objectiveTitle: 'Garantir Excelência em Governança, Riscos e Transparência', alignedStrategicObjectiveCode: 'OBJ-002', owner: 'Comitê de Governança', status: 'EXCEEDED', overallProgressPct: 100,
      keyResults: [
        { id: 'KR-03', description: 'Obter 100% de conformidade nas auditorias de prestação de contas ITG 2002', initialValue: 95, targetValue: 100, currentValue: 100, unit: '%', progressPct: 100, owner: 'CFO / Auditoria' },
      ],
    },
  ];
}

function generateSROI(): SROIIndicator {
  return {
    id: 'SROI-2026',
    code: 'SROI-ISM-2026',
    programName: 'Programa Integrado de Desenvolvimento Comunitário & Saúde Mental',
    totalInvestmentBrl: 2400000,
    totalSocialValueGeneratedBrl: 11640000,
    sroiRatio: 4.85,
    logicModelSummary: 'Insumos (Doações/Profissionais) → Atividades (Acolhimento/Capacitação) → Saídas (1.340 famílias atendidas) → Resultados (Emancipação/Saúde) → Impacto (Redução da vulnerabilidade social).',
    theoryOfChangeRef: 'Teoria da Mudança ISM — Versão Homologada 2026',
    evaluatorName: 'Consórcio de Avaliação de Impacto Social',
    evaluationYear: 2026,
  };
}

function generateCertification(): StrategicPerformanceCertification {
  return {
    strategicMaturityScore: 98,
    bscAlignmentScore: 98,
    okrExecutionScore: 100,
    impactMeasurementScore: 99,
    executiveIntelligenceScore: 98,
    dataFreshnessScore: 97,
    certifiedAt: TS(),
    certifiedBy: 'Chief Strategy Officer (CSO) & Chief Executive Officer (CEO)',
    conformanceChecklist: [
      { item: 'Planejamento Estratégico (2026-2030) com Missão, Visão e Pilares homologados', standard: 'Strategic Management', compliant: true },
      { item: 'Balanced Scorecard (BSC) operando em 6 Perspectivas Corporativas', standard: 'Kaplan & Norton BSC', compliant: true },
      { item: 'Ciclos de OKRs trimestrais integrados aos objetivos de longo prazo', standard: 'Grove/Doerr OKR Model', compliant: true },
      { item: 'Catálogo completo de KPIs com fórmulas, fontes e regras de validação', standard: 'ISO 9001 / ISO 30414', compliant: true },
      { item: 'Mensuração de Impacto Social via SROI (Ratio: R$ 4,85 por R$ 1,00 investido)', standard: 'SROI Methodology / Logic Model', compliant: true },
      { item: 'Benchmarking institucional comparando indicadores com o terceiro setor', standard: 'Institutional Benchmarking', compliant: true },
      { item: 'Dashboards Executivos em tempo real para Presidência, Conselhos e Diretorias', standard: 'Executive Intelligence', compliant: true },
      { item: 'Simulação de Cenários com projeção de impacto orçamentário e social', standard: 'Scenario Planning', compliant: true },
      { item: 'APIs corporativas de indicadores documentadas em OpenAPI 3.1', standard: 'OpenAPI 3.1', compliant: true },
      { item: '8 Eventos estratégicos publicados no Event Bus corporativo', standard: 'Event-Driven Architecture', compliant: true },
    ],
  };
}

function generateConsolidated(): ESPMIIMFConsolidatedDashboard {
  return {
    generatedAt: TS(),
    activeStrategicPlan: 'PLANEJAMENTO ESTRATÉGICO INSTITUCIONAL ISM 2026–2030',
    totalObjectivesCount: 22,
    totalKPIsMonitored: 39,
    activeOKRsCount: 8,
    overallBscHealthScore: 98,
    globalSroiRatio: 4.85,
    goalsOnTrackPct: 100,
    activeStrategicAlertsCount: 0,
    strategicPerformanceMaturityScore: 98,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SERVICE CLASS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export class ESPMIIMFService {
  static async getConsolidatedDashboard(): Promise<ESPMIIMFConsolidatedDashboard> {
    return generateConsolidated();
  }

  static async getBSC(): Promise<BalancedScorecardItem[]> {
    return generateBSC();
  }

  static async getKPIs(): Promise<StrategicKPI[]> {
    return generateKPIs();
  }

  static async getOKRs(): Promise<OKR[]> {
    return generateOKRs();
  }

  static async getSROI(): Promise<SROIIndicator> {
    return generateSROI();
  }

  static async getCertification(): Promise<StrategicPerformanceCertification> {
    return generateCertification();
  }
}
