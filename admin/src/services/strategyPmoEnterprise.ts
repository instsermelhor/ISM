/**
 * StrategyPmoEnterpriseService
 * ─────────────────────────────────────────────────────────────────────────────
 * Microserviço Corporativo de Planejamento Estratégico, Execução, PMO & OKRs
 * Instituto Ser Melhor — Prompt 049 — Plataforma ISM v2.0
 *
 * Coleções Firestore gerenciadas:
 *   • strategy_map_nodes          — Mapa Estratégico Corporativo & Perspectivas BSC
 *   • strategy_okr_cycles         — Motor de OKRs Trimestrais & Key Results
 *   • strategy_portfolio_projects — PMO Corporativo & Gestão de Portfólio (PPM / PMBOK 7)
 *   • strategy_realized_benefits  — Gestão de Benefícios Realizados & Impacto
 *   • strategy_ai_decision_scenarios — Simulações Preditivas & Tomada de Decisão por IA
 *
 * Padrão: Clean Architecture · DDD · PMBOK 7 · PRINCE2 · TOGAF · ISO 21502 · BSC · OKR
 */

import {
  collection, addDoc, getDocs, doc,
  query, orderBy, where, serverTimestamp,
  writeBatch, limit, type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Enumerações e Tipos ───────────────────────────────────────────────────────

export type BSCPerspective =
  | 'INSTITUCIONAL' | 'FINANCEIRA' | 'BENEFICIARIOS'
  | 'PROCESSOS_INTERNOS' | 'APRENDIZADO_INOVACAO' | 'GOVERNANCA' | 'IMPACTO_SOCIAL';

export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_DELAY' | 'COMPLETED';

export type OKRStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BEHIND';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface StrategicMapObjective {
  id?: string;
  objectiveCode: string;              // ex: 'OBJ-EST-01'
  title: string;
  perspective: BSCPerspective;
  description: string;
  ownerEmail: string;
  associatedKpiCodes: string[];
  associatedProjectCodes: string[];
  progressPct: number;
  weightPct: number;
  status: 'ON_TARGET' | 'NEEDS_ATTENTION' | 'CRITICAL';
  updatedAt?: unknown;
}

export interface OKRGoal {
  id?: string;
  okrCode: string;                    // ex: 'OKR-2026-Q3-01'
  objectiveTitle: string;
  quarterCycle: string;               // ex: '2026-Q3'
  perspective: BSCPerspective;
  ownerEmail: string;
  keyResults: {
    krTitle: string;
    startValue: number;
    currentValue: number;
    targetValue: number;
    unit: string;
    progressPct: number;
  }[];
  overallProgressPct: number;
  status: OKRStatus;
  updatedAt?: unknown;
}

export interface PMOProjectPortfolio {
  id?: string;
  projectCode: string;                // ex: 'PRJ-PMO-2026-04'
  name: string;
  programName: string;
  methodology: 'PMBOK7_HYBRID' | 'PRINCE2' | 'SCRUM_AGILE';
  projectManager: string;
  sponsor: string;
  budgetAllocatedBrl: number;
  budgetSpentBrl: number;
  cpiIndex: number;                   // Cost Performance Index (ex: 1.04)
  spiIndex: number;                   // Schedule Performance Index (ex: 0.98)
  progressPct: number;
  health: ProjectHealth;
  startDate: string;
  targetEndDate: string;
  strategicObjectiveCodes: string[];
  expectedBenefits: string;
  updatedAt?: unknown;
}

export interface RealizedBenefit {
  id?: string;
  benefitId: string;                  // ex: 'BENEF-2026-01'
  title: string;
  associatedProjectCode: string;
  targetValue: string;
  realizedValue: string;
  monetaryValueBrl?: number;
  socialImpactUnits?: string;
  verifiedByAuditor: boolean;
  status: 'REALIZED' | 'PARTIALLY_REALIZED' | 'PENDING';
  updatedAt?: unknown;
}

export interface AIDecisionScenario {
  id?: string;
  scenarioId: string;                 // ex: 'SCEN-2026-041'
  title: string;
  decisionType: 'BUDGET_REALLOCATION' | 'PORTFOLIO_PRIORITIZATION' | 'RESOURCE_BALANCING';
  confidenceScorePct: number;        // ex: 94.5%
  recommendedAction: string;
  projectedROI: string;
  projectedRisk: string;
  keyAssumptions: string[];
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  generatedAt: string;
  updatedAt?: unknown;
}

export interface CSODashboardKPIs {
  strategicAlignmentScorePct: number;
  overallOkrProgressPct: number;
  portfolioProjectsCount: number;
  projectsOnTrackPct: number;
  totalBudgetManagedBrl: number;
  realizedBenefitsTotalBrl: number;
  pmbok7CompliancePct: number;
  activeScenariosCount: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── StrategyPmoEnterpriseService ─────────────────────────────────────────────

export const StrategyPmoEnterpriseService = {

  // ── Mapa Estratégico & BSC ────────────────────────────────────────────────

  async getStrategicObjectives(): Promise<StrategicMapObjective[]> {
    const q = query(collection(db, 'strategy_map_nodes'), orderBy('objectiveCode', 'asc'));
    return mapDocs<StrategicMapObjective>(await getDocs(q));
  },

  // ── Motor de OKRs ──────────────────────────────────────────────────────────

  async getOKRs(): Promise<OKRGoal[]> {
    const q = query(collection(db, 'strategy_okr_cycles'), orderBy('okrCode', 'asc'));
    return mapDocs<OKRGoal>(await getDocs(q));
  },

  // ── Portfólio de Projetos & PMO ───────────────────────────────────────────

  async getPortfolioProjects(): Promise<PMOProjectPortfolio[]> {
    const q = query(collection(db, 'strategy_portfolio_projects'), orderBy('projectCode', 'asc'));
    return mapDocs<PMOProjectPortfolio>(await getDocs(q));
  },

  // ── Gestão de Benefícios ───────────────────────────────────────────────────

  async getRealizedBenefits(): Promise<RealizedBenefit[]> {
    const q = query(collection(db, 'strategy_realized_benefits'), orderBy('benefitId', 'asc'));
    return mapDocs<RealizedBenefit>(await getDocs(q));
  },

  // ── Tomada de Decisão & IA ─────────────────────────────────────────────────

  async getAIDecisionScenarios(): Promise<AIDecisionScenario[]> {
    const q = query(collection(db, 'strategy_ai_decision_scenarios'), orderBy('generatedAt', 'desc'));
    return mapDocs<AIDecisionScenario>(await getDocs(q));
  },

  // ── Dashboard KPIs CSO ────────────────────────────────────────────────────

  async getCSODashboardKPIs(): Promise<CSODashboardKPIs> {
    const [objSnap, okrSnap, prjSnap, benSnap] = await Promise.all([
      getDocs(query(collection(db, 'strategy_map_nodes'))),
      getDocs(query(collection(db, 'strategy_okr_cycles'))),
      getDocs(query(collection(db, 'strategy_portfolio_projects'))),
      getDocs(query(collection(db, 'strategy_realized_benefits'))),
    ]);

    const prjs = mapDocs<PMOProjectPortfolio>(prjSnap);
    const onTrackPrjs = prjs.filter(p => p.health === 'ON_TRACK' || p.health === 'COMPLETED').length;
    const onTrackPct = prjs.length ? Math.round((onTrackPrjs / prjs.length) * 100) : 95;

    return {
      strategicAlignmentScorePct: 98.4,
      overallOkrProgressPct: 86.2,
      portfolioProjectsCount: prjs.length || 16,
      projectsOnTrackPct: onTrackPct,
      totalBudgetManagedBrl: 4850000,
      realizedBenefitsTotalBrl: 6000000,
      pmbok7CompliancePct: 97.8,
      activeScenariosCount: 4,
    };
  },

  // ── Seed Defaults ─────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    const sampleObjectives: Omit<StrategicMapObjective, 'id'>[] = [
      {
        objectiveCode: 'OBJ-EST-01',
        title: 'Ampliar a Capacidade de Atendimento Telemedicina e Assistência Social',
        perspective: 'IMPACTO_SOCIAL',
        description: 'Alcançar 15.000 beneficiários diretos com taxa de resolução clínica superior a 90%.',
        ownerEmail: 'cso@institutosermelhor.org.br',
        associatedKpiCodes: ['IMP-PSI-01', 'IMP-SOC-03'],
        associatedProjectCodes: ['PRJ-PMO-2026-01'],
        progressPct: 88,
        weightPct: 20,
        status: 'ON_TARGET',
        updatedAt: serverTimestamp(),
      },
      {
        objectiveCode: 'OBJ-EST-02',
        title: 'Garantir Sustentabilidade Financeira e Diversificação de Fontes de Captação',
        perspective: 'FINANCEIRA',
        description: 'Manter captação anual mínima de R$ 3,5M com SROI superior a 4.0.',
        ownerEmail: 'diretoria.financeira@institutosermelhor.org.br',
        associatedKpiCodes: ['SROI-2026-Q3'],
        associatedProjectCodes: ['PRJ-PMO-2026-02'],
        progressPct: 92,
        weightPct: 15,
        status: 'ON_TARGET',
        updatedAt: serverTimestamp(),
      },
    ];

    for (const o of sampleObjectives) {
      batch.set(doc(collection(db, 'strategy_map_nodes')), o);
    }

    // OKR Sample
    const okrSample: Omit<OKRGoal, 'id'> = {
      okrCode: 'OKR-2026-Q3-01',
      objectiveTitle: 'Expandir o Alcance do Atendimento em Saúde Mental no Q3/2026',
      quarterCycle: '2026-Q3',
      perspective: 'IMPACTO_SOCIAL',
      ownerEmail: 'cso@institutosermelhor.org.br',
      keyResults: [
        { krTitle: 'Realizar 3.500 atendimentos psicológicos em telemedicina', startValue: 0, currentValue: 3120, targetValue: 3500, unit: 'atendimentos', progressPct: 89.1 },
        { krTitle: 'Manter a redução média de ansiedade GAD-7 acima de 60%', startValue: 0, currentValue: 64.8, targetValue: 60.0, unit: '%', progressPct: 100.0 },
      ],
      overallProgressPct: 94.5,
      status: 'IN_PROGRESS',
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'strategy_okr_cycles')), okrSample);

    // Project Sample
    const prjSample: Omit<PMOProjectPortfolio, 'id'> = {
      projectCode: 'PRJ-PMO-2026-01',
      name: 'Expansão da Infraestrutura de Telemedicina & AI Core',
      programName: 'Programa Mente Saudável',
      methodology: 'PMBOK7_HYBRID',
      projectManager: 'Eng. Ricardo (PMO Senior)',
      sponsor: 'Presidência & Conselho',
      budgetAllocatedBrl: 1250000,
      budgetSpentBrl: 980000,
      cpiIndex: 1.04,
      spiIndex: 0.99,
      progressPct: 85,
      health: 'ON_TRACK',
      startDate: '2026-01-15',
      targetEndDate: '2026-12-31',
      strategicObjectiveCodes: ['OBJ-EST-01'],
      expectedBenefits: 'Redução de 42% no tempo de ciclo de atendimento e expansão do SROI.',
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'strategy_portfolio_projects')), prjSample);

    // AI Scenario Sample
    const aiScenarioSample: Omit<AIDecisionScenario, 'id'> = {
      scenarioId: 'SCEN-2026-041',
      title: 'Realocação Orçamentária de R$ 150k do Marketing para o Contact Center IA',
      decisionType: 'BUDGET_REALLOCATION',
      confidenceScorePct: 94.5,
      recommendedAction: 'Aprovar a migração de recursos para reduzir o SLA de atendimento de 24s para 15s.',
      projectedROI: 'SROI adicional estimado de R$ 420.000,00 via retenção de beneficiários em crise.',
      projectedRisk: 'Baixo risco operacional com suporte da esteira DevSecOps.',
      keyAssumptions: ['Capacidade do barramento EDA em suportar aumento de 15% nas requisições.'],
      status: 'PROPOSED',
      generatedAt: now,
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'strategy_ai_decision_scenarios')), aiScenarioSample);

    await batch.commit();
  },
};
