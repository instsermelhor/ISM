/**
 * enterpriseGovernanceEAGSCIRPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Autonomous Governance, Strategic Coordination &
 * Institutional Resilience Platform
 * Instituto Ser Melhor — Prompt 098 — Plataforma ISM v2.0
 *
 * Padrões: COBIT 2019, TOGAF ADM, ISO 22301 (BCM), ISO 31000 (Risco),
 *          ISO 37301 (Compliance), ISO 42001 (IA), ISO 27001, ITIL 4, DAMA-DMBOK2
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type PolicyCategory = 'ESTRATEGICA' | 'RISCO' | 'COMPLIANCE' | 'IA_GOVERNANCE' | 'CONTINUIDADE' | 'SEGURANCA';
export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type BCMStatus = 'ATIVO' | 'EM_TESTE' | 'SIMULADO' | 'EM_CRISE';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface GovernancePolicy {
  id: string;
  policyCode: string;          // ex: "POL-GOV-001"
  title: string;
  category: PolicyCategory;
  owner: string;               // ex: "CGO · Chief Governance Officer"
  version: string;
  complianceRate: number;      // 0-100%
  riskLevel: RiskLevel;
  lastReviewDate: string;
  nextReviewDate: string;
  isAutonomousEnabled: boolean;
  createdAt?: unknown;
}

export interface BCMPlan {
  id: string;
  bcmCode: string;             // ex: "BCM-001"
  title: string;
  status: BCMStatus;
  rtoMinutes: number;          // Recovery Time Objective
  rpoMinutes: number;          // Recovery Point Objective
  lastSimulationDate: string;
  simulationSuccessRate: number;// 0-100%
  resilienceScore: number;     // 0-100
  owner: string;
  createdAt?: unknown;
}

export interface RACIMatrixItem {
  id: string;
  processCode: string;         // ex: "RACI-001"
  processName: string;
  responsible: string;         // R
  accountable: string;         // A
  consulted: string;           // C
  informed: string;            // I
  domain: string;
  createdAt?: unknown;
}

export interface EAGSCIRPDashboardKPIs {
  enterpriseGovernanceScore: number;    // ex: 99.3
  strategicCoordinationIndex: number;   // ex: 98.9
  institutionalResilienceIndex: number; // ex: 99.0
  bcmSimulationsPassed: number;         // ex: 24/24 (100%)
  complianceAverage: number;            // ex: 99.6%
  residualRiskScore: number;            // ex: 4.2% (muito baixo)
  policiesActiveCount: number;          // ex: 148
  raciCoverageRate: number;             // ex: 100%
  globalResilienceMaturity: number;     // ex: 99.3
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_POLICIES: Omit<GovernancePolicy, 'id' | 'createdAt'>[] = [
  {
    policyCode: 'POL-GOV-001',
    title: 'Política Institucional de Governança Adaptativa & Limites de Autonomia de IA',
    category: 'IA_GOVERNANCE',
    owner: 'CGO · Chief Governance Officer',
    version: '4.0.0',
    complianceRate: 100,
    riskLevel: 'BAIXO',
    lastReviewDate: '2026-06-01',
    nextReviewDate: '2027-06-01',
    isAutonomousEnabled: true,
  },
  {
    policyCode: 'POL-GOV-002',
    title: 'Plano Diretor de Continuidade do Negócio & Gestão de Crises (ISO 22301)',
    category: 'CONTINUIDADE',
    owner: 'Chief Resilience Officer',
    version: '3.2.0',
    complianceRate: 99,
    riskLevel: 'BAIXO',
    lastReviewDate: '2026-05-15',
    nextReviewDate: '2027-05-15',
    isAutonomousEnabled: true,
  },
  {
    policyCode: 'POL-GOV-003',
    title: 'Matriz Corporativa de Gestão de Riscos & Controles Internos (ISO 31000)',
    category: 'RISCO',
    owner: 'CRO · Chief Risk Officer',
    version: '5.1.0',
    complianceRate: 100,
    riskLevel: 'BAIXO',
    lastReviewDate: '2026-04-10',
    nextReviewDate: '2027-04-10',
    isAutonomousEnabled: false,
  },
];

const SEED_BCM: Omit<BCMPlan, 'id' | 'createdAt'>[] = [
  {
    bcmCode: 'BCM-001',
    title: 'Plano de Continuidade Operacional da Infraestrutura Cloud ISM (GCP Cloud Run + AlloyDB)',
    status: 'ATIVO',
    rtoMinutes: 5,
    rpoMinutes: 0,
    lastSimulationDate: '2026-06-30',
    simulationSuccessRate: 100,
    resilienceScore: 99,
    owner: 'SRE / Cloud Lead',
  },
  {
    bcmCode: 'BCM-002',
    title: 'Plano de Resposta a Incidentes de Segurança & Zero Trust Incident Handling',
    status: 'ATIVO',
    rtoMinutes: 15,
    rpoMinutes: 0,
    lastSimulationDate: '2026-05-20',
    simulationSuccessRate: 100,
    resilienceScore: 100,
    owner: 'CISO · Chief Information Security Officer',
  },
];

const SEED_RACI: Omit<RACIMatrixItem, 'id' | 'createdAt'>[] = [
  {
    processCode: 'RACI-001',
    processName: 'Aprovação de Adaptação Arquitetural Automática EAICODOP',
    responsible: 'Engine IA EAICODOP',
    accountable: 'ARB · Architecture Review Board',
    consulted: 'CEA + CISO',
    informed: 'CEO + CGO',
    domain: 'Arquitetura & Governança',
  },
  {
    processCode: 'RACI-002',
    processName: 'Atualização do Decision Knowledge Graph ECGDIILP',
    responsible: 'Vertex AI Decision Engine',
    accountable: 'CDO · Chief Decision Officer',
    consulted: 'CKO + CAIO',
    informed: 'Conselho Consultivo',
    domain: 'Inteligência Decisória',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEAGSCIRPService = {

  async getPolicies(): Promise<GovernancePolicy[]> {
    const q = query(collection(db, 'eagscirp_policies'), orderBy('complianceRate', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_POLICIES) {
        await addDoc(collection(db, 'eagscirp_policies'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getPolicies();
    }
    return snap.docs.map(d => mapDoc<GovernancePolicy>(d));
  },

  async getBCMPlans(): Promise<BCMPlan[]> {
    const q = query(collection(db, 'eagscirp_bcm'), orderBy('resilienceScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_BCM) {
        await addDoc(collection(db, 'eagscirp_bcm'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getBCMPlans();
    }
    return snap.docs.map(d => mapDoc<BCMPlan>(d));
  },

  async getRACIMatrix(): Promise<RACIMatrixItem[]> {
    const q = query(collection(db, 'eagscirp_raci'), orderBy('processCode', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RACI) {
        await addDoc(collection(db, 'eagscirp_raci'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getRACIMatrix();
    }
    return snap.docs.map(d => mapDoc<RACIMatrixItem>(d));
  },

  async getDashboardKPIs(): Promise<EAGSCIRPDashboardKPIs> {
    return {
      enterpriseGovernanceScore: 99.3,
      strategicCoordinationIndex: 98.9,
      institutionalResilienceIndex: 99.0,
      bcmSimulationsPassed: 24,
      complianceAverage: 99.6,
      residualRiskScore: 4.2,
      policiesActiveCount: 148,
      raciCoverageRate: 100,
      globalResilienceMaturity: 99.3,
      certificationDate: '2026-07-23',
      certificationVersion: 'EAGSCIRP v1.0 — Prompt 098 (Enterprise Autonomous Governance & Institutional Resilience Platform)',
    };
  },
};
