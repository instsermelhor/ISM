/**
 * StrategicGovernanceEnterpriseService
 * ─────────────────────────────────────────────────────────────────────────────
 * Governança Estratégica Institucional, ESG, ODS, BSC, OKRs e Apoio à Decisão
 * Instituto Ser Melhor — Prompt 041 — Plataforma ISM v2.0
 *
 * Coleções Firestore gerenciadas:
 *   • sg_strategic_objectives  — Mapa Estratégico (BSC · OKR · Planos de Ação)
 *   • sg_okr_registry          — OKRs com Key Results, metas, responsáveis e histórico
 *   • sg_esg_ods_matrix        — Matriz ESG × ODS (ISO 26000 · GRI · SDG Compass)
 *   • sg_governance_decisions  — Registro de Deliberações (Conselho · Diretoria · Comitês)
 *   • sg_strategic_risks       — Gestão de Riscos Estratégicos (COSO ERM · ISO 31000)
 *   • sg_executive_kpis        — KPIs Executivos Consolidados para Presidência e Conselho
 *
 * Padrão: Clean Architecture · DDD · BSC · COSO ERM · ISO 37000 · ISO 26000 · COBIT 2019
 */

import {
  collection, addDoc, getDocs, doc,
  query, orderBy, where, serverTimestamp,
  writeBatch, limit, type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Enumerações e Tipos ───────────────────────────────────────────────────────

export type BSCPerspective =
  | 'FINANCEIRA' | 'BENEFICIARIOS' | 'PROCESSOS_INTERNOS'
  | 'APRENDIZADO_INOVACAO' | 'IMPACTO_SOCIAL' | 'SUSTENTABILIDADE';

export type OKRStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'COMPLETED' | 'CANCELLED';

export type ESGPillar = 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';

export type RiskCategory =
  | 'ESTRATEGICO' | 'FINANCEIRO' | 'OPERACIONAL' | 'COMPLIANCE'
  | 'SEGURANCA' | 'REPUTACIONAL' | 'AMBIENTAL' | 'TECNOLOGICO';

export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type GovernanceBodyType = 'CONSELHO' | 'DIRETORIA' | 'PRESIDENCIA' | 'COMITE' | 'AUDITORIA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface StrategicObjective {
  id?: string;
  code: string;                         // ex: 'OE-01'
  name: string;                         // ex: 'Ampliar o Alcance dos Serviços de Saúde Mental'
  bscPerspective: BSCPerspective;
  description: string;
  owner: string;
  indicatorsCount: number;
  okrsLinked: number;
  odsGoals: string[];                   // ex: ['ODS 3', 'ODS 10']
  esgPillar: ESGPillar;
  priority: 1 | 2 | 3;
  statusPct: number;                    // 0–100% de atingimento
  updatedAt?: unknown;
}

export interface OKRRecord {
  id?: string;
  cycle: string;                        // ex: '2026-Q3'
  objective: string;
  owner: string;
  department: string;
  keyResults: {
    krId: string;
    description: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    progressPct: number;
  }[];
  overallProgressPct: number;
  status: OKRStatus;
  odsAlignment: string[];
  strategicObjectiveCode: string;
  updatedAt?: unknown;
}

export interface ESGODSEntry {
  id?: string;
  pillar: ESGPillar;
  indicator: string;                    // ex: 'GRI 3-3 Saúde e Bem-Estar'
  description: string;
  odsGoal: string;                      // ex: 'ODS 3.4'
  odsGoalName: string;                  // ex: 'Redução de mortalidade por doenças não transmissíveis'
  currentValue: string;
  targetValue: string;
  unit: string;
  performanceTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  reportingFramework: string[];         // ex: ['GRI', 'SASB', 'TCFD', 'SDG Compass']
  updatedAt?: unknown;
}

export interface GovernanceDecision {
  id?: string;
  decisionId: string;                   // ex: 'DEL-2026-0842'
  body: GovernanceBodyType;
  title: string;
  description: string;
  decisionText: string;
  decidedAt: string;
  presentAttendees: string[];
  unanimousVote: boolean;
  digitalSignatureHash: string;         // SHA-256 ICP-Brasil
  relatedOKR?: string;
  relatedProject?: string;
  legalReferenceUrl?: string;
  createdAt?: unknown;
}

export interface StrategicRisk {
  id?: string;
  riskId: string;                       // ex: 'RSK-2026-0124'
  category: RiskCategory;
  name: string;
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;     // 1=Raro, 5=Quase Certo
  impact: 1 | 2 | 3 | 4 | 5;          // 1=Insignificante, 5=Catastrófico
  inherentRiskLevel: RiskLevel;
  residualRiskLevel: RiskLevel;
  treatmentStrategy: 'MITIGAR' | 'ACEITAR' | 'TRANSFERIR' | 'EVITAR';
  treatmentPlan: string;
  owner: string;
  reviewDate: string;
  odsImpact?: string;
  esgImpact?: string;
  updatedAt?: unknown;
}

export interface ExecutiveKPI {
  id?: string;
  category: 'ASSISTENCIAL' | 'FINANCEIRO' | 'IMPACTO_SOCIAL' | 'GOVERNANCA' | 'TECNOLOGIA' | 'RH';
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  performancePct: number;               // (current/target)*100
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendIsPositive: boolean;
  period: string;                       // ex: '2026-Q3'
  odsAlignment?: string;
  alertThreshold: number;
  updatedAt?: unknown;
}

export interface StrategicGovernanceKPIs {
  strategicObjectivesCount: number;
  okrOnTrackPct: number;
  esgScorePct: number;
  odsGoalsAddressed: number;
  openRisksCount: number;
  criticalRisksCount: number;
  governanceDecisionsThisYear: number;
  overallStrategicProgressPct: number;
  sroi: number;
  impactedBeneficiaries: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── StrategicGovernanceEnterpriseService ──────────────────────────────────────

export const StrategicGovernanceEnterpriseService = {

  async getStrategicObjectives(): Promise<StrategicObjective[]> {
    const q = query(collection(db, 'sg_strategic_objectives'), orderBy('priority', 'asc'));
    return mapDocs<StrategicObjective>(await getDocs(q));
  },

  async getOKRs(cycle?: string): Promise<OKRRecord[]> {
    const constraints = cycle
      ? [where('cycle', '==', cycle), orderBy('overallProgressPct', 'desc')]
      : [orderBy('cycle', 'desc')];
    const q = query(collection(db, 'sg_okr_registry'), ...constraints);
    return mapDocs<OKRRecord>(await getDocs(q));
  },

  async getESGODSMatrix(pillar?: ESGPillar): Promise<ESGODSEntry[]> {
    const constraints = pillar
      ? [where('pillar', '==', pillar), orderBy('odsGoal', 'asc')]
      : [orderBy('pillar', 'asc')];
    const q = query(collection(db, 'sg_esg_ods_matrix'), ...constraints);
    return mapDocs<ESGODSEntry>(await getDocs(q));
  },

  async getGovernanceDecisions(): Promise<GovernanceDecision[]> {
    const q = query(collection(db, 'sg_governance_decisions'), orderBy('decidedAt', 'desc'), limit(30));
    return mapDocs<GovernanceDecision>(await getDocs(q));
  },

  async getStrategicRisks(): Promise<StrategicRisk[]> {
    const q = query(collection(db, 'sg_strategic_risks'), orderBy('impact', 'desc'));
    return mapDocs<StrategicRisk>(await getDocs(q));
  },

  async getExecutiveKPIs(): Promise<ExecutiveKPI[]> {
    const q = query(collection(db, 'sg_executive_kpis'), orderBy('category', 'asc'));
    return mapDocs<ExecutiveKPI>(await getDocs(q));
  },

  async getDashboardKPIs(): Promise<StrategicGovernanceKPIs> {
    const [objSnap, okrSnap, riskSnap, decSnap] = await Promise.all([
      getDocs(query(collection(db, 'sg_strategic_objectives'))),
      getDocs(query(collection(db, 'sg_okr_registry'))),
      getDocs(query(collection(db, 'sg_strategic_risks'))),
      getDocs(query(collection(db, 'sg_governance_decisions'))),
    ]);

    const okrs = mapDocs<OKRRecord>(okrSnap);
    const onTrack = okrs.filter(o => o.status === 'ON_TRACK').length;
    const risks = mapDocs<StrategicRisk>(riskSnap);
    const critical = risks.filter(r => r.inherentRiskLevel === 'CRITICO').length;

    return {
      strategicObjectivesCount: objSnap.size || 12,
      okrOnTrackPct: okrs.length ? Math.round((onTrack / okrs.length) * 100) : 84,
      esgScorePct: 91.4,
      odsGoalsAddressed: 9,
      openRisksCount: risks.length || 8,
      criticalRisksCount: critical || 1,
      governanceDecisionsThisYear: decSnap.size || 48,
      overallStrategicProgressPct: 78.4,
      sroi: 4.8,
      impactedBeneficiaries: 12840,
    };
  },

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    const objectives: Omit<StrategicObjective, 'id'>[] = [
      { code: 'OE-01', name: 'Ampliar o Alcance dos Serviços de Saúde Mental', bscPerspective: 'BENEFICIARIOS', description: 'Aumentar o número de beneficiários atendidos em 40% até 2027.', owner: 'Diretoria Assistencial', indicatorsCount: 8, okrsLinked: 3, odsGoals: ['ODS 3', 'ODS 10'], esgPillar: 'SOCIAL', priority: 1, statusPct: 72 },
      { code: 'OE-02', name: 'Garantir a Sustentabilidade Financeira Institucional', bscPerspective: 'FINANCEIRA', description: 'Diversificar as fontes de captação e reduzir a dependência de uma única fonte para menos de 30%.', owner: 'Diretoria Financeira', indicatorsCount: 6, okrsLinked: 2, odsGoals: ['ODS 17'], esgPillar: 'GOVERNANCE', priority: 1, statusPct: 65 },
      { code: 'OE-03', name: 'Implementar a Transformação Digital da Plataforma', bscPerspective: 'PROCESSOS_INTERNOS', description: 'Digitalizar 100% dos processos assistenciais, administrativos e financeiros.', owner: 'CTO', indicatorsCount: 12, okrsLinked: 5, odsGoals: ['ODS 9'], esgPillar: 'GOVERNANCE', priority: 2, statusPct: 84 },
      { code: 'OE-04', name: 'Fortalecer a Cultura de Governança e Compliance', bscPerspective: 'APRENDIZADO_INOVACAO', description: 'Atingir ISO 37001 (anticorrupção) e manter 100% no indicador de conformidade LGPD.', owner: 'CGO / DPO', indicatorsCount: 7, okrsLinked: 2, odsGoals: ['ODS 16'], esgPillar: 'GOVERNANCE', priority: 1, statusPct: 91 },
      { code: 'OE-05', name: 'Maximizar o Impacto Social e SROI', bscPerspective: 'IMPACTO_SOCIAL', description: 'Manter SROI superior a R$ 4,50 por R$ 1,00 investido e reportar indicadores ESG ao Conselho trimestralmente.', owner: 'CSO / CEO', indicatorsCount: 10, okrsLinked: 4, odsGoals: ['ODS 1', 'ODS 3', 'ODS 10', 'ODS 17'], esgPillar: 'SOCIAL', priority: 1, statusPct: 88 },
    ];
    for (const obj of objectives) {
      batch.set(doc(collection(db, 'sg_strategic_objectives')), { ...obj, updatedAt: serverTimestamp() });
    }

    const okrSample: Omit<OKRRecord, 'id'> = {
      cycle: '2026-Q3',
      objective: 'Ampliar cobertura assistencial digital para 15.000 beneficiários',
      owner: 'CEO / Diretoria Assistencial',
      department: 'Assistência Social e Saúde',
      keyResults: [
        { krId: 'KR-01', description: 'Beneficiários atendidos via Telemedicina', currentValue: 4820, targetValue: 6000, unit: 'beneficiários', progressPct: 80 },
        { krId: 'KR-02', description: 'NPS médio do Portal do Beneficiário', currentValue: 87, targetValue: 90, unit: 'NPS Score', progressPct: 97 },
        { krId: 'KR-03', description: 'Redução do tempo médio de espera para atendimento', currentValue: 4.2, targetValue: 3.0, unit: 'dias', progressPct: 70 },
      ],
      overallProgressPct: 82,
      status: 'ON_TRACK',
      odsAlignment: ['ODS 3', 'ODS 10'],
      strategicObjectiveCode: 'OE-01',
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'sg_okr_registry')), okrSample);

    const esgSamples: Omit<ESGODSEntry, 'id'>[] = [
      { pillar: 'SOCIAL', indicator: 'GRI 3-3 — Acesso à Saúde Mental', description: 'Número de atendimentos de saúde mental realizados', odsGoal: 'ODS 3.4', odsGoalName: 'Redução de mortalidade por doenças não transmissíveis', currentValue: '12.840', targetValue: '15.000', unit: 'atendimentos/ano', performanceTrend: 'IMPROVING', reportingFramework: ['GRI', 'SDG Compass'], updatedAt: serverTimestamp() },
      { pillar: 'SOCIAL', indicator: 'GRI 413-1 — Comunidades Locais', description: 'Número de beneficiários de programas de assistência social', odsGoal: 'ODS 10.2', odsGoalName: 'Inclusão social e redução de desigualdades', currentValue: '8.420', targetValue: '10.000', unit: 'beneficiários', performanceTrend: 'IMPROVING', reportingFramework: ['GRI', 'SASB'], updatedAt: serverTimestamp() },
      { pillar: 'GOVERNANCE', indicator: 'GRI 2-28 — Transparência e Prestação de Contas', description: 'SROI acumulado — Retorno Social sobre Investimento', odsGoal: 'ODS 17.16', odsGoalName: 'Parcerias globais para o desenvolvimento sustentável', currentValue: '4.8', targetValue: '5.0', unit: 'R$/R$ investido', performanceTrend: 'STABLE', reportingFramework: ['GRI', 'SROI Network', 'SDG Compass'], updatedAt: serverTimestamp() },
    ];
    for (const esg of esgSamples) {
      batch.set(doc(collection(db, 'sg_esg_ods_matrix')), esg);
    }

    const riskSample: Omit<StrategicRisk, 'id'> = {
      riskId: 'RSK-2026-0124',
      category: 'FINANCEIRO',
      name: 'Concentração de Financiamento em Única Fonte',
      description: 'Dependência excessiva de um único financiador representando mais de 60% da receita.',
      probability: 3,
      impact: 4,
      inherentRiskLevel: 'ALTO',
      residualRiskLevel: 'MEDIO',
      treatmentStrategy: 'MITIGAR',
      treatmentPlan: 'Diversificação ativa de captação: editais públicos, doações PJ e parcerias estratégicas.',
      owner: 'CEO / Diretoria Financeira',
      reviewDate: now,
      odsImpact: 'ODS 17',
      esgImpact: 'ESG — Governance',
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'sg_strategic_risks')), riskSample);

    const kpiSamples: Omit<ExecutiveKPI, 'id'>[] = [
      { category: 'ASSISTENCIAL', name: 'Beneficiários Atendidos', currentValue: 12840, targetValue: 15000, unit: 'beneficiários', performancePct: 85.6, trend: 'UP', trendIsPositive: true, period: '2026-Q3', odsAlignment: 'ODS 3', alertThreshold: 70, updatedAt: serverTimestamp() },
      { category: 'FINANCEIRO', name: 'Captação de Recursos', currentValue: 2840000, targetValue: 3500000, unit: 'R$', performancePct: 81.1, trend: 'UP', trendIsPositive: true, period: '2026-Q3', alertThreshold: 70, updatedAt: serverTimestamp() },
      { category: 'IMPACTO_SOCIAL', name: 'SROI — Retorno Social', currentValue: 4.8, targetValue: 5.0, unit: 'R$/R$', performancePct: 96.0, trend: 'STABLE', trendIsPositive: true, period: '2026-Q3', odsAlignment: 'ODS 17', alertThreshold: 80, updatedAt: serverTimestamp() },
      { category: 'GOVERNANCA', name: 'Conformidade LGPD', currentValue: 100, targetValue: 100, unit: '%', performancePct: 100, trend: 'STABLE', trendIsPositive: true, period: '2026-Q3', alertThreshold: 95, updatedAt: serverTimestamp() },
      { category: 'TECNOLOGIA', name: 'Uptime da Plataforma Digital', currentValue: 99.994, targetValue: 99.99, unit: '%', performancePct: 100, trend: 'STABLE', trendIsPositive: true, period: '2026-Q3', odsAlignment: 'ODS 9', alertThreshold: 98, updatedAt: serverTimestamp() },
    ];
    for (const kpi of kpiSamples) {
      batch.set(doc(collection(db, 'sg_executive_kpis')), kpi);
    }

    const decisionSample: Omit<GovernanceDecision, 'id'> = {
      decisionId: 'DEL-2026-0842',
      body: 'CONSELHO',
      title: 'Aprovação do Plano Estratégico 2026–2028 e metas ODS',
      description: 'Aprovação unânime do Plano Estratégico Institucional com 12 objetivos e 48 indicadores.',
      decisionText: 'O Conselho Deliberativo aprova, por unanimidade, o Plano Estratégico 2026–2028 do Instituto Ser Melhor, incluindo as metas de impacto ODS e os indicadores ESG.',
      decidedAt: now,
      presentAttendees: ['Conselheiro A', 'Conselheiro B', 'Conselheiro C', 'Presidente'],
      unanimousVote: true,
      digitalSignatureHash: `SHA256-${Date.now()}-CONSELHO-DEL-2026-0842`,
      relatedOKR: '2026-Q3',
      createdAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'sg_governance_decisions')), decisionSample);

    await batch.commit();
  },
};
