/**
 * adaptiveOSEAIOSEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Adaptive Institutional Operating System
 * Instituto Ser Melhor — Prompt 080 — Plataforma ISM v2.0 (Camada de Orquestração Máxima)
 *
 * Consolida todos os módulos (Prompts 001–079) em um Sistema Operacional
 * Institucional Adaptativo com governança central, observabilidade global
 * e coordenação inteligente supervisionada.
 *
 * Padrões: TOGAF, COBIT 2019, ISO 9001, ISO 27001, ISO 37301, ISO 42001,
 *          ISO 56002, ITIL 4, DAMA-DMBOK2, Enterprise OS, Adaptive Systems
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ModuleCluster =
  | 'ASSISTENCIAL_E_SAUDE'
  | 'GOVERNANCA_E_COMPLIANCE'
  | 'INTELIGENCIA_E_IA'
  | 'INFRAESTRUTURA_E_SEGURANCA'
  | 'IMPACTO_E_SUSTENTABILIDADE'
  | 'ORQUESTRACAO_COGNITIVA';

export type ModuleHealthStatus = 'VERDE_EXCELENTE' | 'VERDE_NORMAL' | 'AMARELO_ATENCAO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ModuleHealthEntry {
  id: string;
  moduleCode: string;          // ex: "ISM-MOD-001"
  moduleName: string;
  cluster: ModuleCluster;
  promptReference: string;     // ex: "Prompt 001"
  healthStatus: ModuleHealthStatus;
  uptimePercent: number;       // ex: 99.98
  maturityScore: number;       // 0-100
  aiAgentsLinked: number;
  lastAuditDate: string;
  createdAt?: unknown;
}

export interface GlobalPolicyRule {
  id: string;
  policyCode: string; // ex: "POL-ZERO-TRUST-001"
  policyName: string;
  category: 'SEGURANCA' | 'LGPD' | 'IA_RESPONSAVEL' | 'GOVERNANCA' | 'CONTINUIDADE';
  obligatoryFor: string;     // "Todos os Módulos" | "Módulos com Dados Sensíveis"
  complianceRate: number;    // 0-100%
  enforcedSince: string;
}

export interface EAIOSDashboardKPIs {
  globalEcosystemMaturityScore: number;   // 0-100 (ex: 99.4)
  totalModulesConsolidated: number;       // 79 módulos (001–079)
  globalAvailabilityPercent: number;      // ex: 99.98%
  globalSecurityScore: number;            // ex: 99.9%
  adaptiveOrchestrationScore: number;    // ex: 99.2%
  totalPoliciesEnforced: number;          // ex: 48 políticas
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_MODULES: Omit<ModuleHealthEntry, 'id' | 'createdAt'>[] = [
  { moduleCode: 'ISM-CLS-01', moduleName: 'Cluster Assistencial & Saúde (EHR, Telemedicina, Triagem IA)', cluster: 'ASSISTENCIAL_E_SAUDE', promptReference: 'Prompts 001–025', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.99, maturityScore: 99, aiAgentsLinked: 3, lastAuditDate: '2026-07-22' },
  { moduleCode: 'ISM-CLS-02', moduleName: 'Cluster Governança & Compliance (EIGCAP, EMAIVGP, EDCGC)', cluster: 'GOVERNANCA_E_COMPLIANCE', promptReference: 'Prompts 026–050', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.98, maturityScore: 99, aiAgentsLinked: 2, lastAuditDate: '2026-07-22' },
  { moduleCode: 'ISM-CLS-03', moduleName: 'Cluster Inteligência & IA (EFIIDSP, ECO-IDNS, AI Agents)', cluster: 'INTELIGENCIA_E_IA', promptReference: 'Prompts 051–070', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.97, maturityScore: 98, aiAgentsLinked: 9, lastAuditDate: '2026-07-22' },
  { moduleCode: 'ISM-CLS-04', moduleName: 'Cluster Infraestrutura & Segurança (Zero Trust, DevSecOps, EISRFRP)', cluster: 'INFRAESTRUTURA_E_SEGURANCA', promptReference: 'Prompts 071–075', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.99, maturityScore: 100, aiAgentsLinked: 1, lastAuditDate: '2026-07-22' },
  { moduleCode: 'ISM-CLS-05', moduleName: 'Cluster Impacto & Sustentabilidade (ESIIEOMP, ESG, SROI)', cluster: 'IMPACTO_E_SUSTENTABILIDADE', promptReference: 'Prompts 076–079', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.95, maturityScore: 99, aiAgentsLinked: 2, lastAuditDate: '2026-07-22' },
  { moduleCode: 'ISM-CLS-06', moduleName: 'Cluster Orquestração Cognitiva (EAIOS — Prompt 080)', cluster: 'ORQUESTRACAO_COGNITIVA', promptReference: 'Prompt 080', healthStatus: 'VERDE_EXCELENTE', uptimePercent: 99.99, maturityScore: 100, aiAgentsLinked: 9, lastAuditDate: '2026-07-22' },
];

const SEED_POLICIES: Omit<GlobalPolicyRule, 'id'>[] = [
  { policyCode: 'POL-ZERO-TRUST-001', policyName: 'Política Zero Trust Institucional (mTLS + OAuth 2.1)', category: 'SEGURANCA', obligatoryFor: 'Todos os Módulos', complianceRate: 100, enforcedSince: '2026-07-22' },
  { policyCode: 'POL-LGPD-002', policyName: 'Política de Proteção de Dados Pessoais (LGPD / GDPR-Ready)', category: 'LGPD', obligatoryFor: 'Todos os Módulos com Dados Sensíveis', complianceRate: 100, enforcedSince: '2026-07-22' },
  { policyCode: 'POL-AI-003', policyName: 'Política de IA Responsável (Human-in-the-Loop ISO 42001)', category: 'IA_RESPONSAVEL', obligatoryFor: 'Todos os Agentes e Modelos de IA', complianceRate: 100, enforcedSince: '2026-07-22' },
  { policyCode: 'POL-GOV-004', policyName: 'Política de Governança Corporativa (TOGAF / COBIT 2019)', category: 'GOVERNANCA', obligatoryFor: 'Toda Decisão Estratégica', complianceRate: 100, enforcedSince: '2026-07-22' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEAIOSService = {

  async getModuleHealth(): Promise<ModuleHealthEntry[]> {
    const q = query(collection(db, 'eaios_modules'), orderBy('maturityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MODULES) {
        await addDoc(collection(db, 'eaios_modules'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getModuleHealth();
    }
    return snap.docs.map(d => mapDoc<ModuleHealthEntry>(d));
  },

  async getPolicies(): Promise<GlobalPolicyRule[]> {
    const q = query(collection(db, 'eaios_policies'), orderBy('complianceRate', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_POLICIES) {
        await addDoc(collection(db, 'eaios_policies'), { ...item });
      }
      return this.getPolicies();
    }
    return snap.docs.map(d => mapDoc<GlobalPolicyRule>(d));
  },

  async getDashboardKPIs(): Promise<EAIOSDashboardKPIs> {
    return {
      globalEcosystemMaturityScore: 99.4,
      totalModulesConsolidated: 79,
      globalAvailabilityPercent: 99.98,
      globalSecurityScore: 99.9,
      adaptiveOrchestrationScore: 99.2,
      totalPoliciesEnforced: 48,
      certificationDate: '2026-07-22',
      certificationVersion: 'EAIOS v1.0 — Prompt 080 (Sistema Operacional Institucional Adaptativo — MÁXIMO)',
    };
  },
};
