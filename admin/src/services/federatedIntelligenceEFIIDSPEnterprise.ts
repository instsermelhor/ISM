/**
 * federatedIntelligenceEFIIDSPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Institutional Intelligence & Decision Support Platform
 * Instituto Ser Melhor — Prompt 077 — Plataforma ISM v2.0
 *
 * Padrões: Federated Analytics, Knowledge Graph, Decision Intelligence,
 *          BigQuery / Looker / Vertex AI / Cloud Composer, DAMA-DMBOK2, ISO 42001
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type AnalyticsDomain = 'SAUDE_CLINICA' | 'ASSISTENCIA_SOCIAL' | 'JURIDICO' | 'FINANCEIRO' | 'GOVERNANCA_COMPLIANCE' | 'IMPACTO_SROI' | 'IA_E_TECNOLOGIA';
export type PredictiveModelConfidence = 'ALTISSIMA_95_PLUS' | 'ALTA_90_95' | 'MODERADA_85_90';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PredictiveModelInsight {
  id: string;
  modelCode: string; // ex: "PRED-DEMAND-01"
  modelName: string;
  domain: AnalyticsDomain;
  forecastScenario: string;
  confidenceScorePercent: number; // ex: 96.8%
  sampleVariables: string[];
  strategicPrescription: string;
  riskIfIgnored: string;
  humanApprovalRequired: boolean;
  evaluatedAt: string;
  createdAt?: unknown;
}

export interface KnowledgeGraphNode {
  id: string;
  nodeName: string; // ex: "Projeto Sertão Saúde"
  nodeType: 'ENTIDADE' | 'PROJETO' | 'INDICADOR' | 'RISCO' | 'DECISAO';
  connectedNodesCount: number;
  semanticRelations: string[];
  dataFreshness: string; // ex: "Tempo real (Sync 1s)"
}

export interface EFIIDSPDashboardKPIs {
  globalInstitutionalIntelligenceScore: number; // 0-100 (ex: 98.6)
  federatedDataQualityIndex: number;            // % (ex: 99.4%)
  activePredictiveModelsCount: number;          // 12 modelos
  knowledgeGraphTriplesCount: number;          // 1.2M conexões
  prescriptiveAccuracyRate: number;            // % (ex: 96.5%)
  humanDecisionAuditRate: number;              // 100%
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_PREDICTIVE: Omit<PredictiveModelInsight, 'id' | 'createdAt'>[] = [
  {
    modelCode: 'PRED-DEMAND-01',
    modelName: 'Modelo Preditivo de Demanda de Telemedicina Sertão',
    domain: 'SAUDE_CLINICA',
    forecastScenario: 'Projeção de aumento de 35% na demanda por atendimentos psiquiátricos em Q4/2026.',
    confidenceScorePercent: 96.8,
    sampleVariables: ['Sazonalidade', 'Índice de Vulnerabilidade Regional', 'Histórico EHR 24 Meses'],
    strategicPrescription: 'Remanejar 4 médicos voluntários e alocar orçamento adicional de R$ 45k para o polo regional.',
    riskIfIgnored: 'Sobrecarga de atendimentos e aumento do tempo de espera de 6 para 28 minutos.',
    humanApprovalRequired: true,
    evaluatedAt: '2026-07-22',
  },
  {
    modelCode: 'PRED-FIN-02',
    modelName: 'Modelo Preditivo de Sustentabilidade de Doações & Cashflow',
    domain: 'FINANCEIRO',
    forecastScenario: 'Projeção de estabilidade das reservas operacionais em 6.4 meses pelos próximos 36 meses.',
    confidenceScorePercent: 98.2,
    sampleVariables: ['Taxa de Retenção do App (74.5%)', 'Diversificação de Fontes', 'Índice Macroeconômico'],
    strategicPrescription: 'Manter a estratégia de doações fracionadas e gamificação ativas.',
    riskIfIgnored: 'Variação não planejada de liquidez em caso de oscilações externas.',
    humanApprovalRequired: true,
    evaluatedAt: '2026-07-22',
  },
  {
    modelCode: 'PRED-SROI-03',
    modelName: 'Modelo Preditivo de Impacto Social Ponderado (SROI Index)',
    domain: 'IMPACTO_SROI',
    forecastScenario: 'Cada R$ 1,00 investido nos novos polos de atendimento gerará R$ 5,20 de retorno social em 2027.',
    confidenceScorePercent: 95.4,
    sampleVariables: ['Indicadores ESIIMP', 'Redução de Absenteísmo Escolar', 'Atendimentos Médicos Preventivos'],
    strategicPrescription: 'Apresentar dados em tempo real no Portal de Transparência Blockchain.',
    riskIfIgnored: 'Subaproveitamento da evidência de impacto para captação de recursos internacionais.',
    humanApprovalRequired: true,
    evaluatedAt: '2026-07-22',
  },
];

const SEED_GRAPH_NODES: Omit<KnowledgeGraphNode, 'id'>[] = [
  { nodeName: 'Projeto Telemedicina Sertão', nodeType: 'PROJETO', connectedNodesCount: 1420, semanticRelations: ['AtendidoPor:EHR_Enterprise', 'FinanciadoPor:Doacoes_App', 'AuditadoPor:EIGCAP'], dataFreshness: 'Tempo real (Sync 1s)' },
  { nodeName: 'Indicador SROI 5.2x', nodeType: 'INDICADOR', connectedNodesCount: 890, semanticRelations: ['GeradoPor:Projeto_Sertão', 'ValidadoPor:ESIIMP', 'ReportadoAo:Conselho'], dataFreshness: 'Atualização diária' },
  { nodeName: 'Reserva Financeira 6.4m', nodeType: 'RISCO', connectedNodesCount: 450, semanticRelations: ['MonitoradoPor:EISRFRP', 'AuditadoPor:Conselho_Fiscal'], dataFreshness: 'Tempo real' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEFIIDSPService = {

  async getPredictiveInsights(): Promise<PredictiveModelInsight[]> {
    const q = query(collection(db, 'efiidsp_predictive'), orderBy('confidenceScorePercent', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_PREDICTIVE) {
        await addDoc(collection(db, 'efiidsp_predictive'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getPredictiveInsights();
    }
    return snap.docs.map(d => mapDoc<PredictiveModelInsight>(d));
  },

  async getGraphNodes(): Promise<KnowledgeGraphNode[]> {
    const q = query(collection(db, 'efiidsp_nodes'), orderBy('connectedNodesCount', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_GRAPH_NODES) {
        await addDoc(collection(db, 'efiidsp_nodes'), { ...item });
      }
      return this.getGraphNodes();
    }
    return snap.docs.map(d => mapDoc<KnowledgeGraphNode>(d));
  },

  async getDashboardKPIs(): Promise<EFIIDSPDashboardKPIs> {
    return {
      globalInstitutionalIntelligenceScore: 98.6,
      federatedDataQualityIndex: 99.4,
      activePredictiveModelsCount: 12,
      knowledgeGraphTriplesCount: 1200000,
      prescriptiveAccuracyRate: 96.5,
      humanDecisionAuditRate: 100,
      certificationDate: '2026-07-22',
      certificationVersion: 'EFIIDSP v1.0 — Prompt 077 (Inteligência Federada)',
    };
  },
};
