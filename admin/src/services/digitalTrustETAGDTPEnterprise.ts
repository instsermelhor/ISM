/**
 * digitalTrustETAGDTPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Trusted Autonomous Governance & Digital Trust Platform
 * Instituto Ser Melhor — Prompt 088 — Plataforma ISM v2.0
 *
 * Padrões: Responsible AI, NIST AI RMF, ISO 42001, ISO 27001, ISO 37301,
 *          ISO 31000, COBIT 2019, DAMA-DMBOK2, TOGAF, LGPD, Vertex AI, AlloyDB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type DecisionCriticality = 'CRITICA_ALTA' | 'ESTRATEGICA_MEDIA' | 'OPERACIONAL_BAIXA';
export type HumanSupervisionLevel = 'OBRIGATORIA_PREVIA' | 'AUDITORIA_POSTERIOR' | 'INFORMATIVA_LOG';
export type RiskCategory = 'IA_ETICA' | 'PRIVACIDADE_LGPD' | 'SEGURANCA_CYBER' | 'OPERACIONAL' | 'REPUTACIONAL';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AutomatedDecisionEntry {
  id: string;
  decisionCode: string;      // ex: "DEC-AI-001"
  decisionName: string;      // ex: "Triagem de Vulnerabilidade & Concessão de Benefício"
  criticality: DecisionCriticality;
  supervisionLevel: HumanSupervisionLevel;
  aiModelUsed: string;       // ex: "Vertex AI Social Agent v2.4"
  explainabilityScore: number;// ex: 98.4 (0-100)
  humanApproved: boolean;    // Human-in-the-Loop
  auditTrailHash: string;    // SHA-256 Hash Imutável
  lastExecutedAt: string;
  createdAt?: unknown;
}

export interface EnterpriseRiskEntry {
  id: string;
  riskCode: string;          // ex: "RSK-AI-001"
  riskTitle: string;
  category: RiskCategory;
  probabilityScore: number;  // 1-5
  impactScore: number;       // 1-5
  riskIndex: number;         // prob * impact (ex: 4)
  mitigationPlan: string;
  riskOwner: string;
  status: 'MITIGADO' | 'MONITORADO' | 'ACEITO';
}

export interface ETAGDTPDashboardKPIs {
  globalDigitalTrustScore: number;       // 0-100 (ex: 99.2)
  responsibleAIMaturityScore: number;    // 0-100 (ex: 100.0)
  totalAutomatedDecisionsRegistered: number;
  activeMitigatedRisksCount: number;
  explainabilityAveragePercent: number;  // ex: 98.6%
  humanInTheLoopEnforcementPercent: number; // ex: 100%
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_DECISIONS: Omit<AutomatedDecisionEntry, 'id' | 'createdAt'>[] = [
  {
    decisionCode: 'DEC-AI-001',
    decisionName: 'Triagem de Vulnerabilidade & Concessão de Benefício Social',
    criticality: 'CRITICA_ALTA',
    supervisionLevel: 'OBRIGATORIA_PREVIA',
    aiModelUsed: 'Vertex AI Social Agent v2.4',
    explainabilityScore: 99.1,
    humanApproved: true,
    auditTrailHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    lastExecutedAt: '2026-07-22T19:40:00Z',
  },
  {
    decisionCode: 'DEC-AI-002',
    decisionName: 'Reagendamento Automático de Telemedicina por Prioridade Clínica',
    criticality: 'ESTRATEGICA_MEDIA',
    supervisionLevel: 'AUDITORIA_POSTERIOR',
    aiModelUsed: 'Clinical Priority Engine v1.8',
    explainabilityScore: 98.2,
    humanApproved: true,
    auditTrailHash: '8f4e3c2a1b9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f',
    lastExecutedAt: '2026-07-22T18:15:00Z',
  },
  {
    decisionCode: 'DEC-SH-003',
    decisionName: 'Self-Healing Autoscaling Pods em Pico de Requisições',
    criticality: 'OPERACIONAL_BAIXA',
    supervisionLevel: 'INFORMATIVA_LOG',
    aiModelUsed: 'EAOSPES Self-Healing Engine v1.0',
    explainabilityScore: 99.8,
    humanApproved: true,
    auditTrailHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    lastExecutedAt: '2026-07-22T20:00:00Z',
  },
];

const SEED_RISKS: Omit<EnterpriseRiskEntry, 'id'>[] = [
  {
    riskCode: 'RSK-AI-001',
    riskTitle: 'Vieses Algorítmicos em Modelos Preditivos de Vulnerabilidade',
    category: 'IA_ETICA',
    probabilityScore: 2,
    impactScore: 4,
    riskIndex: 8,
    mitigationPlan: 'Auditoria contínua com NIST AI RMF + Validação cega trimestral por Comitê de Ética.',
    riskOwner: 'CAIO — Chief AI Officer',
    status: 'MITIGADO',
  },
  {
    riskCode: 'RSK-PRV-002',
    riskTitle: 'Vazamento de Dados Pessoais Sensíveis (LGPD / Telemedicina)',
    category: 'PRIVACIDADE_LGPD',
    probabilityScore: 1,
    impactScore: 5,
    riskIndex: 5,
    mitigationPlan: 'Criptografia CMEK por Tenant + Pseudonimização k-Anonimato (k ≥ 50).',
    riskOwner: 'DPO — Data Protection Officer',
    status: 'MITIGADO',
  },
  {
    riskCode: 'RSK-CYB-003',
    riskTitle: 'Ataque de Injeção de Prompt / Adversarial em Agentes RAG',
    category: 'SEGURANCA_CYBER',
    probabilityScore: 2,
    impactScore: 4,
    riskIndex: 8,
    mitigationPlan: 'Apigee Guardrails + Vertex AI Safety Filters Enforced + Zero Trust Architecture.',
    riskOwner: 'CISO — Chief Information Security Officer',
    status: 'MITIGADO',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseETAGDTPService = {

  async getDecisions(): Promise<AutomatedDecisionEntry[]> {
    const q = query(collection(db, 'etagdtp_decisions'), orderBy('decisionCode'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_DECISIONS) {
        await addDoc(collection(db, 'etagdtp_decisions'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getDecisions();
    }
    return snap.docs.map(d => mapDoc<AutomatedDecisionEntry>(d));
  },

  async getRisks(): Promise<EnterpriseRiskEntry[]> {
    const q = query(collection(db, 'etagdtp_risks'), orderBy('riskIndex', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RISKS) {
        await addDoc(collection(db, 'etagdtp_risks'), { ...item });
      }
      return this.getRisks();
    }
    return snap.docs.map(d => mapDoc<EnterpriseRiskEntry>(d));
  },

  async getDashboardKPIs(): Promise<ETAGDTPDashboardKPIs> {
    return {
      globalDigitalTrustScore: 99.2,
      responsibleAIMaturityScore: 100.0,
      totalAutomatedDecisionsRegistered: 3,
      activeMitigatedRisksCount: 3,
      explainabilityAveragePercent: 99.0,
      humanInTheLoopEnforcementPercent: 100.0,
      certificationDate: '2026-07-22',
      certificationVersion: 'ETAGDTP v1.0 — Prompt 088 (Governança Digital & Confiança Computacional)',
    };
  },
};
