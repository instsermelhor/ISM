/**
 * collectiveIntelligenceECIPSIPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Collective Intelligence, Policy Insights & Social Innovation Platform
 * Instituto Ser Melhor — Prompt 095 — Plataforma ISM v2.0
 *
 * Padrões: Collective Intelligence, Evidence-Based Policy, Social Innovation,
 *          Impact Analytics, Systems Thinking, Knowledge Graphs, ISO 30401,
 *          ISO 56002, ISO 42001, TOGAF, COBIT 2019, Vertex AI, BigQuery, GCP
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type EvidenceLevel = 'META_ANALISE' | 'RCT' | 'COORTE' | 'ESTUDO_CASO' | 'ESPECIALISTA';
export type InnovationStage = 'IDEIA' | 'PROTOTIPO' | 'PILOTO' | 'ESCALA' | 'REPLICADO';
export type PolicyInsightStatus = 'PROPOSTA' | 'EM_CONSULTA' | 'APROVADA' | 'IMPLEMENTADA';
export type KnowledgeSourceReliability = 'ALTA' | 'MODERADA' | 'EMERGENTE';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface EvidenceRecord {
  id: string;
  evidenceCode: string;           // ex: "EV-001"
  title: string;
  evidenceLevel: EvidenceLevel;
  domain: string;                 // ex: "Saúde Pública · FHIR R4"
  sourceOrganizations: string[];
  confidenceScore: number;        // 0-100
  sampleSize: number;             // número de casos/beneficiários
  periodCovered: string;          // ex: "2024–2026"
  keyFinding: string;
  policyRelevance: number;        // 0-100
  isAnonymized: boolean;
  createdAt?: unknown;
}

export interface SocialInnovation {
  id: string;
  innovationCode: string;         // ex: "INNOV-SOC-001"
  title: string;
  stage: InnovationStage;
  domain: string;
  impactedBeneficiaries: number;
  replicabilityScore: number;     // 0-100
  scalabilityScore: number;       // 0-100
  evidenceStrength: KnowledgeSourceReliability;
  leadOrganization: string;
  keyLearning: string;
  createdAt?: unknown;
}

export interface PolicyInsight {
  id: string;
  insightCode: string;            // ex: "POL-INS-001"
  title: string;
  status: PolicyInsightStatus;
  targetGovernmentLevel: 'MUNICIPAL' | 'ESTADUAL' | 'FEDERAL';
  affectedPopulation: number;     // estimado
  evidenceBasis: string[];        // códigos de EvidenceRecord
  expectedImpact: string;
  estimatedBudget: number;        // R$
  priorityScore: number;          // 0-100
  createdAt?: unknown;
}

export interface ECIPSIPDashboardKPIs {
  collectiveIntelligenceScore: number;  // ex: 98.4
  evidenceQualityIndex: number;         // ex: 97.9
  socialInnovationIndex: number;        // ex: 96.8
  policyInsightsGenerated: number;      // ex: 38
  evidencesProduced: number;            // ex: 124
  innovationsInScale: number;           // ex: 9
  knowledgeReuseRate: number;           // ex: 93.6%
  collectiveDecisionSupport: number;    // ex: 98.1%
  impactSystemicScore: number;          // ex: 97.4
  globalCollectiveMaturityScore: number;// ex: 98.4
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_EVIDENCES: Omit<EvidenceRecord, 'id' | 'createdAt'>[] = [
  {
    evidenceCode: 'EV-001',
    title: 'Impacto da Triagem IA de Vulnerabilidade Social na Redução do Tempo de Acesso a Serviços (Estudo Coorte)',
    evidenceLevel: 'COORTE',
    domain: 'Assistência Social · IA · Triagem Inteligente',
    sourceOrganizations: ['Instituto Ser Melhor', 'FGV Centro de Pesquisa em Impacto Social'],
    confidenceScore: 96,
    sampleSize: 284000,
    periodCovered: '2024–2026',
    keyFinding: 'Redução de 34% no tempo médio de acesso a serviços sociais em municípios que adotaram triagem por IA comparado ao grupo controle (n=284.000 casos).',
    policyRelevance: 98,
    isAnonymized: true,
  },
  {
    evidenceCode: 'EV-002',
    title: 'Efetividade da Telemedicina no Cuidado Primário de Populações Rurais em Situação de Vulnerabilidade',
    evidenceLevel: 'RCT',
    domain: 'Saúde Pública · Telemedicina · FHIR R4',
    sourceOrganizations: ['Instituto Ser Melhor', 'HC-FMUSP Grupo Telemedicina'],
    confidenceScore: 99,
    sampleSize: 48200,
    periodCovered: '2025–2026',
    keyFinding: 'RCT com 48.200 participantes: telemedicina ISM reduziu hospitalizações evitáveis em 41% e aumentou adesão ao tratamento em 29% nas áreas rurais.',
    policyRelevance: 99,
    isAnonymized: true,
  },
  {
    evidenceCode: 'EV-003',
    title: 'SROI Longitudinal dos Programas ISM (2022–2026): Retorno Social de R$ 5.4 por Real Investido',
    evidenceLevel: 'META_ANALISE',
    domain: 'Impacto Social · SROI · Avaliação de Programas',
    sourceOrganizations: ['Instituto Ser Melhor', 'UNICEF Brasil', 'FGV'],
    confidenceScore: 97,
    sampleSize: 1240000,
    periodCovered: '2022–2026',
    keyFinding: 'Meta-análise de 4 anos com 1.24M beneficiários confirma SROI médio de R$ 5.4 por R$ 1 investido, com tendência de crescimento para 6.2x nos próximos 24 meses.',
    policyRelevance: 100,
    isAnonymized: true,
  },
];

const SEED_INNOVATIONS: Omit<SocialInnovation, 'id' | 'createdAt'>[] = [
  {
    innovationCode: 'INNOV-SOC-001',
    title: 'Score de Vulnerabilidade Social Multicritério (SVSm) — Triagem por IA para Gestores Municipais',
    stage: 'REPLICADO',
    domain: 'Assistência Social · IA · Políticas Públicas',
    impactedBeneficiaries: 420000,
    replicabilityScore: 98,
    scalabilityScore: 97,
    evidenceStrength: 'ALTA',
    leadOrganization: 'Instituto Ser Melhor',
    keyLearning: 'Metodologia validada em 87 municípios e replicada por 6 prefeituras de forma autônoma com redução de 34% no tempo de triagem e custo operacional 28% menor.',
  },
  {
    innovationCode: 'INNOV-SOC-002',
    title: 'Prontuário Social Digital Federado (FHIR R4 + CRAS + SUS)',
    stage: 'ESCALA',
    domain: 'Saúde & Assistência Social · Interoperabilidade',
    impactedBeneficiaries: 180000,
    replicabilityScore: 92,
    scalabilityScore: 99,
    evidenceStrength: 'ALTA',
    leadOrganization: 'ISM + HC-FMUSP + Secretaria Social MG',
    keyLearning: 'Integração FHIR R4 entre CRAS, UBS e hospital possibilitou visão longitudinal de saúde-assistência, eliminando 62% das duplicidades de atendimento.',
  },
];

const SEED_POLICY_INSIGHTS: Omit<PolicyInsight, 'id' | 'createdAt'>[] = [
  {
    insightCode: 'POL-INS-001',
    title: 'Recomendação Federal: Adoção do SVSm como Critério Complementar ao CadÚnico para Priorização de Benefícios',
    status: 'EM_CONSULTA',
    targetGovernmentLevel: 'FEDERAL',
    affectedPopulation: 21000000,
    evidenceBasis: ['EV-001', 'EV-003'],
    expectedImpact: 'Melhora de até 38% na precisão de identificação de famílias em maior vulnerabilidade, reduzindo erros de inclusão e exclusão no CadÚnico.',
    estimatedBudget: 18000000,
    priorityScore: 98,
  },
  {
    insightCode: 'POL-INS-002',
    title: 'Recomendação Estadual MG: Telemedicina ISM como Política Pública de Atenção Básica Rural',
    status: 'APROVADA',
    targetGovernmentLevel: 'ESTADUAL',
    affectedPopulation: 1400000,
    evidenceBasis: ['EV-002'],
    expectedImpact: 'Extensão do modelo ISM para 142 municípios rurais de MG, reduzindo hospitalizações evitáveis em 40% e economizando R$ 48M/ano ao SUS estadual.',
    estimatedBudget: 12000000,
    priorityScore: 96,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseECIPSIPService = {

  async getEvidenceRecords(): Promise<EvidenceRecord[]> {
    const q = query(collection(db, 'ecipsip_evidences'), orderBy('policyRelevance', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_EVIDENCES) {
        await addDoc(collection(db, 'ecipsip_evidences'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getEvidenceRecords();
    }
    return snap.docs.map(d => mapDoc<EvidenceRecord>(d));
  },

  async getSocialInnovations(): Promise<SocialInnovation[]> {
    const q = query(collection(db, 'ecipsip_innovations'), orderBy('replicabilityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INNOVATIONS) {
        await addDoc(collection(db, 'ecipsip_innovations'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getSocialInnovations();
    }
    return snap.docs.map(d => mapDoc<SocialInnovation>(d));
  },

  async getPolicyInsights(): Promise<PolicyInsight[]> {
    const q = query(collection(db, 'ecipsip_policy_insights'), orderBy('priorityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_POLICY_INSIGHTS) {
        await addDoc(collection(db, 'ecipsip_policy_insights'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getPolicyInsights();
    }
    return snap.docs.map(d => mapDoc<PolicyInsight>(d));
  },

  async getDashboardKPIs(): Promise<ECIPSIPDashboardKPIs> {
    return {
      collectiveIntelligenceScore: 98.4,
      evidenceQualityIndex: 97.9,
      socialInnovationIndex: 96.8,
      policyInsightsGenerated: 38,
      evidencesProduced: 124,
      innovationsInScale: 9,
      knowledgeReuseRate: 93.6,
      collectiveDecisionSupport: 98.1,
      impactSystemicScore: 97.4,
      globalCollectiveMaturityScore: 98.4,
      certificationDate: '2026-07-23',
      certificationVersion: 'ECIPSIP v1.0 — Prompt 095 (Enterprise Collective Intelligence & Social Innovation Platform)',
    };
  },
};
