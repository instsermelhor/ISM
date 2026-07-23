/**
 * federatedIntelligenceEFICKINPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Intelligence, Collaborative Knowledge &
 * Institutional Network Platform
 * Instituto Ser Melhor — Prompt 094 — Plataforma ISM v2.0
 *
 * Padrões: Federated Learning, Knowledge Management, Collaborative Intelligence,
 *          Data Spaces, Multi-Tenant, Zero Trust, ISO 30401, ISO 42001,
 *          ISO 27001, TOGAF, COBIT 2019, DAMA-DMBOK2, Vertex AI, GCP
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type InstitutionType =
  | 'TERCEIRO_SETOR' | 'FUNDACAO' | 'HOSPITAL' | 'UNIVERSIDADE'
  | 'CENTRO_PESQUISA' | 'ORGAO_PUBLICO' | 'EMPRESA_PARCEIRA' | 'ORGANISMO_INTERNACIONAL';

export type AssetConfidentiality = 'PUBLICO' | 'RESTRITO' | 'SENSIVEL' | 'CONFIDENCIAL';
export type FederatedModelStatus = 'TREINANDO' | 'VALIDADO' | 'PRODUCAO' | 'ROLLBACK';
export type CollaborationStatus = 'ATIVA' | 'PENDENTE_CONSENTIMENTO' | 'SUSPENSA' | 'ENCERRADA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CollaboratingInstitution {
  id: string;
  institutionCode: string;        // ex: "INST-001"
  name: string;
  institutionType: InstitutionType;
  country: string;
  state?: string;
  trustScore: number;             // 0-100
  sharedAssetsCount: number;
  federatedModelsCount: number;
  collaborationStatus: CollaborationStatus;
  consentedAt?: string;
  joinedAt: string;
  createdAt?: unknown;
}

export interface KnowledgeMarketplaceItem {
  id: string;
  itemCode: string;               // ex: "KM-001"
  title: string;
  category: 'METODOLOGIA' | 'MODELO_IA' | 'INDICADOR' | 'DASHBOARD' | 'PLAYBOOK' | 'PROTOCOLO' | 'INTEGRACAO';
  author: string;
  organization: string;
  version: string;
  license: 'CC-BY-4.0' | 'CC-BY-SA-4.0' | 'MIT' | 'APACHE-2.0' | 'PROPRIETARIO_ISM';
  confidentiality: AssetConfidentiality;
  downloads: number;
  ratingAverage: number;          // 0-5
  description: string;
  createdAt?: unknown;
}

export interface FederatedModel {
  id: string;
  modelCode: string;              // ex: "FED-001"
  name: string;
  status: FederatedModelStatus;
  participatingInstitutions: number;
  localEpochsPerRound: number;
  currentRound: number;
  aggregationMethod: 'FEDAVG' | 'FEDPROX' | 'SCAFFOLD';
  privacyMechanism: 'DP_GAUSSIAN' | 'SECURE_AGGREGATION' | 'HOMOMORPHIC';
  accuracy: number;               // 0-100
  dataRemainedLocal: boolean;     // always true
  createdAt?: unknown;
}

export interface EFICKINPDashboardKPIs {
  federatedIntelligenceScore: number;   // ex: 98.7
  collaborationIndex: number;           // ex: 97.4
  knowledgeReuseRate: number;           // ex: 94.8%
  federatedLearningAccuracy: number;    // ex: 97.2%
  activeInstitutions: number;           // ex: 47
  sharedAssetsTotal: number;            // ex: 284
  marketplaceDownloads: number;         // ex: 12480
  interopScore: number;                 // ex: 99.1
  trustScore: number;                   // ex: 98.9
  globalNetworkMaturityScore: number;   // ex: 98.7
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_INSTITUTIONS: Omit<CollaboratingInstitution, 'id' | 'createdAt'>[] = [
  {
    institutionCode: 'INST-001',
    name: 'Fundação Getúlio Vargas — Centro de Pesquisa em Impacto Social',
    institutionType: 'FUNDACAO',
    country: 'Brasil',
    state: 'SP',
    trustScore: 99,
    sharedAssetsCount: 24,
    federatedModelsCount: 3,
    collaborationStatus: 'ATIVA',
    consentedAt: '2026-01-15T10:00:00Z',
    joinedAt: '2026-01-15',
  },
  {
    institutionCode: 'INST-002',
    name: 'Hospital das Clínicas FMUSP — Grupo Telemedicina',
    institutionType: 'HOSPITAL',
    country: 'Brasil',
    state: 'SP',
    trustScore: 100,
    sharedAssetsCount: 18,
    federatedModelsCount: 2,
    collaborationStatus: 'ATIVA',
    consentedAt: '2026-02-01T09:00:00Z',
    joinedAt: '2026-02-01',
  },
  {
    institutionCode: 'INST-003',
    name: 'UNICEF Brasil — Divisão de Inovação e Tecnologia Social',
    institutionType: 'ORGANISMO_INTERNACIONAL',
    country: 'Brasil',
    state: 'DF',
    trustScore: 97,
    sharedAssetsCount: 31,
    federatedModelsCount: 1,
    collaborationStatus: 'ATIVA',
    consentedAt: '2026-03-10T14:00:00Z',
    joinedAt: '2026-03-10',
  },
  {
    institutionCode: 'INST-004',
    name: 'Secretaria de Assistência Social — Governo do Estado de MG',
    institutionType: 'ORGAO_PUBLICO',
    country: 'Brasil',
    state: 'MG',
    trustScore: 95,
    sharedAssetsCount: 12,
    federatedModelsCount: 1,
    collaborationStatus: 'PENDENTE_CONSENTIMENTO',
    joinedAt: '2026-06-01',
  },
];

const SEED_MARKETPLACE: Omit<KnowledgeMarketplaceItem, 'id' | 'createdAt'>[] = [
  {
    itemCode: 'KM-001',
    title: 'Protocolo ISM de Triagem Social por IA (Score de Vulnerabilidade)',
    category: 'PROTOCOLO',
    author: 'Equipe ISM Data Science',
    organization: 'Instituto Ser Melhor',
    version: '3.1.0',
    license: 'CC-BY-SA-4.0',
    confidentiality: 'PUBLICO',
    downloads: 3842,
    ratingAverage: 4.9,
    description: 'Metodologia completa de triagem inteligente com scoring de vulnerabilidade multicritério, validada em 142 municípios e 1.24M de casos.',
  },
  {
    itemCode: 'KM-002',
    title: 'Modelo de Impacto Social — Theory of Change Framework (ISM Edition)',
    category: 'METODOLOGIA',
    author: 'Equipe ISM Mission Intelligence',
    organization: 'Instituto Ser Melhor',
    version: '2.0.0',
    license: 'CC-BY-4.0',
    confidentiality: 'PUBLICO',
    downloads: 2187,
    ratingAverage: 4.8,
    description: 'Framework institucional de Theory of Change com 6 níveis (Problema → Impacto), metodologia SROI e alinhamento ODS da ONU.',
  },
  {
    itemCode: 'KM-003',
    title: 'Modelo Federado de Detecção de Evasão Escolar (Privacidade Diferencial)',
    category: 'MODELO_IA',
    author: 'Equipe ISM Federated AI + FGV',
    organization: 'ISM + Fundação Getúlio Vargas',
    version: '1.2.0',
    license: 'APACHE-2.0',
    confidentiality: 'RESTRITO',
    downloads: 482,
    ratingAverage: 4.7,
    description: 'Modelo federado treinado com DP-Gaussian em 12 municípios sem compartilhar dados de alunos. Acurácia 94.2% na detecção de risco de evasão.',
  },
];

const SEED_FED_MODELS: Omit<FederatedModel, 'id' | 'createdAt'>[] = [
  {
    modelCode: 'FED-001',
    name: 'Federated Social Vulnerability Predictor v2.0',
    status: 'PRODUCAO',
    participatingInstitutions: 14,
    localEpochsPerRound: 5,
    currentRound: 42,
    aggregationMethod: 'FEDAVG',
    privacyMechanism: 'DP_GAUSSIAN',
    accuracy: 97.4,
    dataRemainedLocal: true,
  },
  {
    modelCode: 'FED-002',
    name: 'Federated Child Health Risk Assessment (FHIR R4)',
    status: 'VALIDADO',
    participatingInstitutions: 6,
    localEpochsPerRound: 3,
    currentRound: 18,
    aggregationMethod: 'FEDPROX',
    privacyMechanism: 'SECURE_AGGREGATION',
    accuracy: 96.8,
    dataRemainedLocal: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEFICKINPService = {

  async getInstitutions(): Promise<CollaboratingInstitution[]> {
    const q = query(collection(db, 'efickinp_institutions'), orderBy('trustScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INSTITUTIONS) {
        await addDoc(collection(db, 'efickinp_institutions'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getInstitutions();
    }
    return snap.docs.map(d => mapDoc<CollaboratingInstitution>(d));
  },

  async getMarketplaceItems(): Promise<KnowledgeMarketplaceItem[]> {
    const q = query(collection(db, 'efickinp_marketplace'), orderBy('downloads', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MARKETPLACE) {
        await addDoc(collection(db, 'efickinp_marketplace'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getMarketplaceItems();
    }
    return snap.docs.map(d => mapDoc<KnowledgeMarketplaceItem>(d));
  },

  async getFederatedModels(): Promise<FederatedModel[]> {
    const q = query(collection(db, 'efickinp_federated_models'), orderBy('accuracy', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_FED_MODELS) {
        await addDoc(collection(db, 'efickinp_federated_models'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getFederatedModels();
    }
    return snap.docs.map(d => mapDoc<FederatedModel>(d));
  },

  async getDashboardKPIs(): Promise<EFICKINPDashboardKPIs> {
    return {
      federatedIntelligenceScore: 98.7,
      collaborationIndex: 97.4,
      knowledgeReuseRate: 94.8,
      federatedLearningAccuracy: 97.2,
      activeInstitutions: 47,
      sharedAssetsTotal: 284,
      marketplaceDownloads: 12480,
      interopScore: 99.1,
      trustScore: 98.9,
      globalNetworkMaturityScore: 98.7,
      certificationDate: '2026-07-23',
      certificationVersion: 'EFICKINP v1.0 — Prompt 094 (Enterprise Federated Intelligence & Collaborative Network)',
    };
  },
};
