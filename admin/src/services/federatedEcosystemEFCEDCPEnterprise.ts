/**
 * federatedEcosystemEFCEDCPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Collaborative Ecosystem & Digital Commons Platform
 * Instituto Ser Melhor — Prompt 083 — Plataforma ISM v2.0
 *
 * Padrões: Federated Systems, Digital Commons, Data Spaces, Gaia-X,
 *          ISO 27001, ISO 42001, ISO 56002, LGPD, TOGAF, COBIT 2019,
 *          DAMA-DMBOK2, AlloyDB, Apigee, Vertex AI, Pub/Sub, GCP
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type AssetCategory =
  | 'METODOLOGIA' | 'INDICADOR' | 'MODELO_IA' | 'TEMPLATE'
  | 'POLITICA' | 'PESQUISA' | 'COMPONENTE' | 'TREINAMENTO';

export type AssetLicense = 'CC-BY-4.0' | 'CC-BY-SA-4.0' | 'MIT' | 'APACHE-2.0' | 'PROPRIETARIA';
export type AssetStatus = 'PUBLICADO' | 'EM_REVISAO' | 'RASCUNHO' | 'DEPRECIADO';
export type SharingLevel = 'PUBLICO' | 'ECOSSISTEMA' | 'PARCEIROS' | 'PRIVADO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DigitalCommonsAsset {
  id: string;
  assetCode: string;         // ex: "DC-MET-001"
  assetName: string;
  assetCategory: AssetCategory;
  authorOrg: string;         // ex: "Instituto Ser Melhor"
  license: AssetLicense;
  version: string;           // ex: "v2.3"
  status: AssetStatus;
  sharingLevel: SharingLevel;
  downloadCount: number;
  reuseCount: number;
  ratingAvg: number;         // 0-5
  tagsKeywords: string[];
  lgpdCompliant: boolean;
  anonymized: boolean;
  createdAt?: unknown;
}

export interface EcosystemMemberOrg {
  id: string;
  orgCode: string;
  orgName: string;
  orgType: string;           // ex: "Instituto · OSCIP"
  assetsShared: number;
  assetsConsumed: number;
  reputationScore: number;   // 0-100
  collaborationLevel: 'OURO' | 'PRATA' | 'BRONZE' | 'MEMBRO';
  joinedAt: string;
  activeSince: string;
  specialties: string[];
}

export interface EFCEDCPDashboardKPIs {
  globalCollaborativeMaturityScore: number; // 0-100
  totalMemberOrgs: number;
  totalDigitalCommonsAssets: number;
  totalDownloads: number;
  totalReuseEvents: number;
  collectiveImpactBeneficiaries: number;
  ecosystemTrustScore: number;              // 0-100
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_ASSETS: Omit<DigitalCommonsAsset, 'id' | 'createdAt'>[] = [
  {
    assetCode: 'DC-MET-001',
    assetName: 'Metodologia de Avaliação de Vulnerabilidade Social (MAVS)',
    assetCategory: 'METODOLOGIA',
    authorOrg: 'Instituto Ser Melhor',
    license: 'CC-BY-4.0',
    version: 'v3.1',
    status: 'PUBLICADO',
    sharingLevel: 'PUBLICO',
    downloadCount: 1240,
    reuseCount: 87,
    ratingAvg: 4.9,
    tagsKeywords: ['vulnerabilidade', 'social', 'avaliação', 'terceiro-setor'],
    lgpdCompliant: true,
    anonymized: true,
  },
  {
    assetCode: 'DC-IND-002',
    assetName: 'Dashboard de Indicadores ODS Agregados (Anonimizado)',
    assetCategory: 'INDICADOR',
    authorOrg: 'Instituto Ser Melhor',
    license: 'CC-BY-SA-4.0',
    version: 'v1.8',
    status: 'PUBLICADO',
    sharingLevel: 'ECOSSISTEMA',
    downloadCount: 432,
    reuseCount: 38,
    ratingAvg: 4.8,
    tagsKeywords: ['ODS', 'indicadores', 'impacto', 'ESG', 'dashboard'],
    lgpdCompliant: true,
    anonymized: true,
  },
  {
    assetCode: 'DC-AI-003',
    assetName: 'Agente de Triagem Social IA (Modelo Fine-tuned Compartilhado)',
    assetCategory: 'MODELO_IA',
    authorOrg: 'Instituto Ser Melhor',
    license: 'APACHE-2.0',
    version: 'v2.0',
    status: 'PUBLICADO',
    sharingLevel: 'ECOSSISTEMA',
    downloadCount: 218,
    reuseCount: 22,
    ratingAvg: 4.7,
    tagsKeywords: ['IA', 'triagem', 'social', 'NLP', 'LGPD'],
    lgpdCompliant: true,
    anonymized: true,
  },
  {
    assetCode: 'DC-TPL-004',
    assetName: 'Templates de Relatórios de Impacto Social (SROI / GRI)',
    assetCategory: 'TEMPLATE',
    authorOrg: 'Instituto Ser Melhor',
    license: 'CC-BY-4.0',
    version: 'v1.4',
    status: 'PUBLICADO',
    sharingLevel: 'PUBLICO',
    downloadCount: 890,
    reuseCount: 145,
    ratingAvg: 4.9,
    tagsKeywords: ['SROI', 'GRI', 'impacto', 'relatorio', 'terceiro-setor'],
    lgpdCompliant: true,
    anonymized: true,
  },
  {
    assetCode: 'DC-POL-005',
    assetName: 'Política de Proteção de Dados LGPD para OSCIPs (Modelo)',
    assetCategory: 'POLITICA',
    authorOrg: 'Instituto Ser Melhor',
    license: 'CC-BY-4.0',
    version: 'v2.2',
    status: 'PUBLICADO',
    sharingLevel: 'PUBLICO',
    downloadCount: 2340,
    reuseCount: 312,
    ratingAvg: 5.0,
    tagsKeywords: ['LGPD', 'privacidade', 'OSCIP', 'conformidade', 'DPO'],
    lgpdCompliant: true,
    anonymized: true,
  },
  {
    assetCode: 'DC-TRN-006',
    assetName: 'Curso: Transformação Digital para Terceiro Setor',
    assetCategory: 'TREINAMENTO',
    authorOrg: 'Instituto Ser Melhor',
    license: 'CC-BY-SA-4.0',
    version: 'v1.0',
    status: 'PUBLICADO',
    sharingLevel: 'PUBLICO',
    downloadCount: 560,
    reuseCount: 48,
    ratingAvg: 4.8,
    tagsKeywords: ['transformacao-digital', 'capacitacao', 'terceiro-setor', 'ONG'],
    lgpdCompliant: true,
    anonymized: true,
  },
];

const SEED_MEMBERS: Omit<EcosystemMemberOrg, 'id'>[] = [
  { orgCode: 'ORG-ISM-001', orgName: 'Instituto Ser Melhor', orgType: 'Instituto · OSCIP', assetsShared: 24, assetsConsumed: 8, reputationScore: 100, collaborationLevel: 'OURO', joinedAt: '2024-01-01', activeSince: '2024-01-01', specialties: ['Saúde', 'Governança', 'IA Social', 'Impacto Social'] },
  { orgCode: 'ORG-FOND-002', orgName: 'Fundação Parceira Beta', orgType: 'Fundação Privada', assetsShared: 7, assetsConsumed: 14, reputationScore: 88, collaborationLevel: 'PRATA', joinedAt: '2024-06-01', activeSince: '2024-06-01', specialties: ['Educação', 'Voluntariado', 'ESG'] },
  { orgCode: 'ORG-PUBL-003', orgName: 'Prefeitura Municipal Parceira', orgType: 'Órgão Público', assetsShared: 3, assetsConsumed: 18, reputationScore: 82, collaborationLevel: 'BRONZE', joinedAt: '2025-02-01', activeSince: '2025-02-01', specialties: ['Políticas Públicas', 'Saúde Municipal', 'Dados Abertos'] },
  { orgCode: 'ORG-UNIV-004', orgName: 'Universidade Parceira', orgType: 'IES', assetsShared: 12, assetsConsumed: 10, reputationScore: 92, collaborationLevel: 'OURO', joinedAt: '2025-04-01', activeSince: '2025-04-01', specialties: ['Pesquisa', 'Inovação', 'Metodologias', 'ODS'] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEFCEDCPService = {

  async getDigitalCommons(): Promise<DigitalCommonsAsset[]> {
    const q = query(collection(db, 'efcedcp_digital_commons'), orderBy('downloadCount', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_ASSETS) {
        await addDoc(collection(db, 'efcedcp_digital_commons'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getDigitalCommons();
    }
    return snap.docs.map(d => mapDoc<DigitalCommonsAsset>(d));
  },

  async getEcosystemMembers(): Promise<EcosystemMemberOrg[]> {
    const q = query(collection(db, 'efcedcp_members'), orderBy('reputationScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MEMBERS) {
        await addDoc(collection(db, 'efcedcp_members'), { ...item });
      }
      return this.getEcosystemMembers();
    }
    return snap.docs.map(d => mapDoc<EcosystemMemberOrg>(d));
  },

  async getDashboardKPIs(): Promise<EFCEDCPDashboardKPIs> {
    return {
      globalCollaborativeMaturityScore: 98.4,
      totalMemberOrgs: 4,
      totalDigitalCommonsAssets: 6,
      totalDownloads: 5680,
      totalReuseEvents: 652,
      collectiveImpactBeneficiaries: 82000,
      ecosystemTrustScore: 99.1,
      certificationDate: '2026-07-22',
      certificationVersion: 'EFCEDCP v1.0 — Prompt 083 (Ecossistema Colaborativo Federado)',
    };
  },
};
