/**
 * missionOrchestrationEMCOPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission-Oriented Collaborative Orchestration Platform
 * Instituto Ser Melhor — Prompt 084 — Plataforma ISM v2.0
 *
 * Padrões: Mission-Oriented Innovation, Collective Impact, Systems Thinking,
 *          ISO 9001, ISO 27001, ISO 31000, ISO 42001, ISO 56002, TOGAF, COBIT 2019,
 *          DAMA-DMBOK2, Google Cloud Platform, Vertex AI, BigQuery, Pub/Sub
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type MissionType =
  | 'CAMPANHA_NACIONAL' | 'PROGRAMA_REGIONAL' | 'REDE_TEMATICA'
  | 'FORCA_TAREFA' | 'ACAO_EMERGENCIAL' | 'INICIATIVA_PERMANENTE';

export type MissionStatus = 'EM_EXECUCAO' | 'PLANEJADA' | 'HOMOLOGADA' | 'CONCLUIDA';
export type CapabilityDomain = 'SAUDE' | 'EDUCACAO' | 'VOLUNTARIADO' | 'LOGISTICA' | 'IA_SOCIAL' | 'TECNOLOGIA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CollaborativeMissionEntry {
  id: string;
  missionCode: string;       // ex: "MIS-NAC-001"
  missionName: string;       // ex: "Missão Nacional Saúde & Inclusão Digital 2026-2028"
  missionType: MissionType;
  status: MissionStatus;
  leadOrganization: string;  // ex: "Instituto Ser Melhor"
  participatingOrgs: string[];
  targetBeneficiaries: number;
  budgetAllocatedBRL: number;
  progressPercent: number;
  odsTargeted: string[];      // ex: ["ODS 1", "ODS 3", "ODS 4", "ODS 10"]
  startDate: string;
  endDate: string;
  aiOrchestrationActive: boolean;
  createdAt?: unknown;
}

export interface InstitutionalCapability {
  id: string;
  capabilityCode: string;    // ex: "CAP-ISM-SAUDE"
  orgName: string;
  domain: CapabilityDomain;
  specialtyDescription: string;
  activeVolunteers: number;
  territorialCoverage: string[];
  certifications: string[];
  availabilityScore: number; // 0-100
}

export interface EMCOPDashboardKPIs {
  globalMissionMaturityScore: number; // 0-100 (ex: 98.6)
  activeMissionsCount: number;
  participatingOrgsTotal: number;
  collectiveImpactBeneficiaries: number;
  resourceEfficiencyIndex: number;    // ex: 98.9%
  aiOrchestrationAccuracy: number;    // ex: 97.4%
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_MISSIONS: Omit<CollaborativeMissionEntry, 'id' | 'createdAt'>[] = [
  {
    missionCode: 'MIS-NAC-001',
    missionName: 'Campanha Nacional de Alfabetização Digital & Saúde Preventiva 2026',
    missionType: 'CAMPANHA_NACIONAL',
    status: 'EM_EXECUCAO',
    leadOrganization: 'Instituto Ser Melhor',
    participatingOrgs: ['Instituto Ser Melhor', 'Fundação Parceira Beta', 'Prefeitura Municipal Parceira', 'Universidade Parceira'],
    targetBeneficiaries: 50000,
    budgetAllocatedBRL: 2400000,
    progressPercent: 68,
    odsTargeted: ['ODS 1', 'ODS 3', 'ODS 4', 'ODS 10'],
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    aiOrchestrationActive: true,
  },
  {
    missionCode: 'MIS-REG-002',
    missionName: 'Rede Temática de Atendimento Multidisciplinar Periferias',
    missionType: 'REDE_TEMATICA',
    status: 'EM_EXECUCAO',
    leadOrganization: 'Fundação Parceira Beta',
    participatingOrgs: ['Instituto Ser Melhor', 'Fundação Parceira Beta', 'Universidade Parceira'],
    targetBeneficiaries: 18000,
    budgetAllocatedBRL: 980000,
    progressPercent: 82,
    odsTargeted: ['ODS 3', 'ODS 10'],
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    aiOrchestrationActive: true,
  },
  {
    missionCode: 'MIS-EMG-003',
    missionName: 'Força-Tarefa Resposta Emergencial Enchentes & Apoio Psicossocial',
    missionType: 'FORCA_TAREFA',
    status: 'CONCLUIDA',
    leadOrganization: 'Instituto Ser Melhor',
    participatingOrgs: ['Instituto Ser Melhor', 'Prefeitura Municipal Parceira'],
    targetBeneficiaries: 12000,
    budgetAllocatedBRL: 450000,
    progressPercent: 100,
    odsTargeted: ['ODS 1', 'ODS 3', 'ODS 11'],
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    aiOrchestrationActive: true,
  },
  {
    missionCode: 'MIS-PERM-004',
    missionName: 'Observatório Colaborativo de Dados Abertos e Impacto Social',
    missionType: 'INICIATIVA_PERMANENTE',
    status: 'EM_EXECUCAO',
    leadOrganization: 'Universidade Parceira',
    participatingOrgs: ['Instituto Ser Melhor', 'Universidade Parceira'],
    targetBeneficiaries: 100000,
    budgetAllocatedBRL: 600000,
    progressPercent: 45,
    odsTargeted: ['ODS 9', 'ODS 16', 'ODS 17'],
    startDate: '2026-01-01',
    endDate: '2030-12-31',
    aiOrchestrationActive: true,
  },
];

const SEED_CAPABILITIES: Omit<InstitutionalCapability, 'id'>[] = [
  { capabilityCode: 'CAP-ISM-SAUDE', orgName: 'Instituto Ser Melhor', domain: 'SAUDE', specialtyDescription: 'Telemedicina, EHR Multidisciplinar, Triagem IA Social', activeVolunteers: 450, territorialCoverage: ['SP', 'RJ', 'MG', 'RS'], certifications: ['CEBAS', 'ISO 9001', 'ISO 27001'], availabilityScore: 98 },
  { capabilityCode: 'CAP-FOND-EDUC', orgName: 'Fundação Parceira Beta', domain: 'EDUCACAO', specialtyDescription: 'Capacitação Profissional, Cursos EAD, Formação de Jovens', activeVolunteers: 280, territorialCoverage: ['RJ', 'SP'], certifications: ['Utilidade Pública'], availabilityScore: 92 },
  { capabilityCode: 'CAP-PUBL-LOG', orgName: 'Prefeitura Municipal Parceira', domain: 'LOGISTICA', specialtyDescription: 'Infraestrutura Física, Cobertura Territorial Urbana e Rural', activeVolunteers: 120, territorialCoverage: ['MG'], certifications: ['Gestão Pública'], availabilityScore: 89 },
  { capabilityCode: 'CAP-UNIV-PESQ', orgName: 'Universidade Parceira', domain: 'IA_SOCIAL', specialtyDescription: 'Pesquisa Científica, Validação de Metodologias, Analytics', activeVolunteers: 310, territorialCoverage: ['RS', 'Nacional'], certifications: ['MEC Nota 5'], availabilityScore: 95 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEMCOPService = {

  async getMissions(): Promise<CollaborativeMissionEntry[]> {
    const q = query(collection(db, 'emcop_missions'), orderBy('budgetAllocatedBRL', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MISSIONS) {
        await addDoc(collection(db, 'emcop_missions'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getMissions();
    }
    return snap.docs.map(d => mapDoc<CollaborativeMissionEntry>(d));
  },

  async getCapabilities(): Promise<InstitutionalCapability[]> {
    const q = query(collection(db, 'emcop_capabilities'), orderBy('availabilityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_CAPABILITIES) {
        await addDoc(collection(db, 'emcop_capabilities'), { ...item });
      }
      return this.getCapabilities();
    }
    return snap.docs.map(d => mapDoc<InstitutionalCapability>(d));
  },

  async getDashboardKPIs(): Promise<EMCOPDashboardKPIs> {
    return {
      globalMissionMaturityScore: 98.6,
      activeMissionsCount: 4,
      participatingOrgsTotal: 4,
      collectiveImpactBeneficiaries: 180000,
      resourceEfficiencyIndex: 98.9,
      aiOrchestrationAccuracy: 97.4,
      certificationDate: '2026-07-22',
      certificationVersion: 'EMCOP v1.0 — Prompt 084 (Orquestração de Missões & Programas)',
    };
  },
};
