/**
 * cognitiveGovernanceECGDIILPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Governance, Decision Intelligence & Institutional Learning Platform
 * Instituto Ser Melhor — Prompt 097 — Plataforma ISM v2.0
 *
 * Padrões: Decision Intelligence, Organizational Learning, Cognitive Computing,
 *          Explainable AI (XAI), Behavioral Analytics, Systems Thinking,
 *          ISO 42001, ISO 37301, ISO 31000, ISO 27001, COBIT 2019, TOGAF ADM, GCP
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type DecisionDomain =
  | 'ESTRATEGICO' | 'OPERACIONAL' | 'CLINICO' | 'ASSISTENCIAL'
  | 'FINANCEIRO' | 'JURIDICO' | 'TECNOLOGICO' | 'RECURSOS_HUMANOS';

export type DecisionStatus = 'PROPOSTA' | 'EM_ANALISE' | 'APROVADA' | 'EM_EXECUCAO' | 'AVALIADA';
export type BiasType = 'CONFIRMACAO' | 'ESTATISTICO' | 'ALGORITMICO' | 'ORGANIZACIONAL' | 'CRITERIO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DecisionRecord {
  id: string;
  decisionCode: string;         // ex: "DEC-001"
  title: string;
  domain: DecisionDomain;
  status: DecisionStatus;
  proposer: string;
  approver: string;
  decisionDate: string;
  evidenceBasis: string[];      // referências a evidências/documentos
  alternativesEvaluated: number;
  confidenceScore: number;      // 0-100
  explainabilityScore: number;  // 0-100
  biasAlerts: BiasType[];
  outcomeEvaluation?: string;
  createdAt?: unknown;
}

export interface LessonsLearned {
  id: string;
  lessonCode: string;           // ex: "LL-001"
  title: string;
  domain: DecisionDomain;
  context: string;
  keyLearning: string;
  actionTaken: string;
  reusabilityScore: number;     // 0-100
  tags: string[];
  createdAt?: unknown;
}

export interface BiasDetectionResult {
  id: string;
  biasCode: string;             // ex: "BIAS-001"
  targetDecisionCode: string;
  biasType: BiasType;
  severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  description: string;
  mitigationRecommendation: string;
  isResolved: boolean;
  createdAt?: unknown;
}

export interface ECGDIILPDashboardKPIs {
  cognitiveGovernanceScore: number;      // ex: 99.1
  decisionQualityIndex: number;          // ex: 98.7
  institutionalLearningIndex: number;    // ex: 98.2
  biasReductionIndex: number;            // ex: 97.9
  explainabilityAverage: number;         // ex: 99.4%
  decisionsAudited: number;              // ex: 1420
  lessonsLearnedCount: number;           // ex: 512
  decisionGraphNodes: number;            // ex: 24800
  globalCognitiveMaturity: number;       // ex: 99.1
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_DECISIONS: Omit<DecisionRecord, 'id' | 'createdAt'>[] = [
  {
    decisionCode: 'DEC-001',
    title: 'Adoção do SVSm (Score de Vulnerabilidade Multicritério) em 142 Municípios',
    domain: 'ESTRATEGICO',
    status: 'AVALIADA',
    proposer: 'CMO · Chief Mission Officer',
    approver: 'ARB · Architecture Review Board + CEO',
    decisionDate: '2025-11-15',
    evidenceBasis: ['EV-001', 'EV-003', 'TOC-001'],
    alternativesEvaluated: 4,
    confidenceScore: 99,
    explainabilityScore: 100,
    biasAlerts: [],
    outcomeEvaluation: 'Excelente: Redução de 34% no tempo de triagem e zero não-conformidades jurídicas ou éticas.',
  },
  {
    decisionCode: 'DEC-002',
    title: 'Integração FHIR R4 com Hospitais Universitários e CRAS MG',
    domain: 'TECNOLOGICO',
    status: 'EM_EXECUCAO',
    proposer: 'CEA · Chief Enterprise Architect',
    approver: 'CISO + CTO + ARB',
    decisionDate: '2026-02-10',
    evidenceBasis: ['ISO 27001', 'LGPD Art. 7', 'EV-002'],
    alternativesEvaluated: 3,
    confidenceScore: 97,
    explainabilityScore: 98,
    biasAlerts: ['ESTATISTICO'],
    outcomeEvaluation: 'Em acompanhamento: Acurácia de sincronização 99.8% sem expor dados nominais.',
  },
  {
    decisionCode: 'DEC-003',
    title: 'Expansão da Telemedicina ISM para Comunidades Isoladas da Região Norte',
    domain: 'CLINICO',
    status: 'APROVADA',
    proposer: 'Diretoria de Saúde Comunitária',
    approver: 'Comitê de Ética e Saúde + CEO',
    decisionDate: '2026-05-20',
    evidenceBasis: ['EV-002', 'RCT-48K'],
    alternativesEvaluated: 5,
    confidenceScore: 98,
    explainabilityScore: 99,
    biasAlerts: [],
    outcomeEvaluation: 'Aprovada com unanimidade; fase piloto agendada para Q3 2026.',
  },
];

const SEED_LESSONS: Omit<LessonsLearned, 'id' | 'createdAt'>[] = [
  {
    lessonCode: 'LL-001',
    title: 'Transparência de Algoritmos na Triagem Social Aumenta Adesão de Gestores Municipais',
    domain: 'ESTRATEGICO',
    context: 'Implementação do SVSm em 87 municípios em 2025.',
    keyLearning: 'Explicabilidade completa (XAI) do score reduziu a resistência inicial de assistentes sociais em 82%.',
    actionTaken: 'Tornou-se requisito obrigatório ISO 42001 o fornecimento de relatório XAI em PDF para cada triagem.',
    reusabilityScore: 99,
    tags: ['XAI', 'Triagem Social', 'Gestão de Mudança', 'ISO 42001'],
  },
  {
    lessonCode: 'LL-002',
    title: 'Consentimento Multicamada em Projetos de Telemedicina Interinstitucional',
    domain: 'JURIDICO',
    context: 'Integração de dados FHIR R4 com a rede hospitalar de SP e MG.',
    keyLearning: 'Adoção de Opt-In granulado por especialidade médica aumentou a confiança dos pacientes e preveniu questionamentos regulatórios.',
    actionTaken: 'Padronizado no módulo IAM Zero Trust (EMTFIP) o fluxo de Opt-In dinâmico.',
    reusabilityScore: 97,
    tags: ['LGPD', 'FHIR R4', 'Consentimento', 'Telemedicina'],
  },
];

const SEED_BIASES: Omit<BiasDetectionResult, 'id' | 'createdAt'>[] = [
  {
    biasCode: 'BIAS-001',
    targetDecisionCode: 'DEC-002',
    biasType: 'ESTATISTICO',
    severity: 'MEDIA',
    description: 'Sub-representação de dados de conectividade de áreas rurais na amostragem inicial.',
    mitigationRecommendation: 'Ajustar amostragem com peso ponderado por densidade demográfica e infraestrutura de rede local.',
    isResolved: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseECGDIILPService = {

  async getDecisions(): Promise<DecisionRecord[]> {
    const q = query(collection(db, 'ecgdiilp_decisions'), orderBy('confidenceScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_DECISIONS) {
        await addDoc(collection(db, 'ecgdiilp_decisions'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getDecisions();
    }
    return snap.docs.map(d => mapDoc<DecisionRecord>(d));
  },

  async getLessonsLearned(): Promise<LessonsLearned[]> {
    const q = query(collection(db, 'ecgdiilp_lessons'), orderBy('reusabilityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_LESSONS) {
        await addDoc(collection(db, 'ecgdiilp_lessons'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getLessonsLearned();
    }
    return snap.docs.map(d => mapDoc<LessonsLearned>(d));
  },

  async getBiasDetections(): Promise<BiasDetectionResult[]> {
    const q = query(collection(db, 'ecgdiilp_biases'), orderBy('severity', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_BIASES) {
        await addDoc(collection(db, 'ecgdiilp_biases'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getBiasDetections();
    }
    return snap.docs.map(d => mapDoc<BiasDetectionResult>(d));
  },

  async getDashboardKPIs(): Promise<ECGDIILPDashboardKPIs> {
    return {
      cognitiveGovernanceScore: 99.1,
      decisionQualityIndex: 98.7,
      institutionalLearningIndex: 98.2,
      biasReductionIndex: 97.9,
      explainabilityAverage: 99.4,
      decisionsAudited: 1420,
      lessonsLearnedCount: 512,
      decisionGraphNodes: 24800,
      globalCognitiveMaturity: 99.1,
      certificationDate: '2026-07-23',
      certificationVersion: 'ECGDIILP v1.0 — Prompt 097 (Enterprise Cognitive Governance & Decision Intelligence Platform)',
    };
  },
};
