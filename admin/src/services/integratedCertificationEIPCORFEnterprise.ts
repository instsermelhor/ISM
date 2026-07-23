/**
 * integratedCertificationEIPCORFEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Integrated Platform Certification & Operational Readiness Framework
 * Instituto Ser Melhor — Prompt 071 — Plataforma ISM v2.0
 *
 * Padrões: TOGAF, ISO 9001, ISO 22301, ISO 27001, ISO 42001, ISO 31000,
 *          NIST CSF, COBIT 2019, DAMA-DMBOK2, Enterprise Validation Framework
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type CertificationDomain =
  | 'ARQUITETURA_CORPORATIVA' | 'ENGENHARIA_SOFTWARE' | 'QUALIDADE' | 'SEGURANCA'
  | 'GOVERNANCA' | 'IA_RESPONSAVEL' | 'OBSERVABILIDADE' | 'PERFORMANCE'
  | 'CONTINUIDADE' | 'INTEGRACAO' | 'DADOS' | 'UX_ACESSISBILIDADE'
  | 'ESCALABILIDADE' | 'OPERACAO';

export type ReadinessStatus = 'CERTIFICADO_PRODUCAO' | 'APROVADO_COM_RESSALVAS' | 'PENDENTE' | 'NAO_CONFORME';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DomainCertificationAudit {
  id: string;
  domain: CertificationDomain;
  domainName: string;
  score: number; // 0-100
  status: ReadinessStatus;
  auditorResponsible: string;
  totalChecks: number;
  passedChecks: number;
  criticalFindings: string[];
  recommendations: string[];
  evaluatedAt: string;
}

export interface EnterpriseModuleInventoryItem {
  id: string;
  promptNumber: string; // ex: "Prompt 066"
  moduleCode: string;   // ex: "ECDTISP"
  moduleName: string;   // ex: "Enterprise Digital Twin & Simulation Platform"
  category: 'CORE' | 'INTELLIGENCE' | 'GOVERNANCE' | 'RESIENCIAL_SIMULATION';
  apiEndpointsCount: number;
  firestoreCollectionsCount: number;
  aiModelsCount: number;
  slaTarget: string; // ex: "99.95%"
  readiness: ReadinessStatus;
}

export interface EIPCORFDashboardKPIs {
  globalEnterpriseMaturityScore: number; // 0-100
  totalPromptsAudited: number;          // 70 (Prompts 001-070)
  totalModulesCertified: number;        // 70
  readinessCompliancePercent: number;    // %
  criticalVulnerabilitiesCount: number;  // 0
  overallUptimeSLO: string;             // "99.97%"
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_DOMAINS: Omit<DomainCertificationAudit, 'id'>[] = [
  {
    domain: 'ARQUITETURA_CORPORATIVA',
    domainName: 'Arquitetura Corporativa (TOGAF)',
    score: 98,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief Enterprise Architect (CEA)',
    totalChecks: 45,
    passedChecks: 45,
    criticalFindings: [],
    recommendations: ['Manter governança contínua de ADRs.'],
    evaluatedAt: '2026-07-22',
  },
  {
    domain: 'ENGENHARIA_SOFTWARE',
    domainName: 'Engenharia de Software (Clean Code & DDD)',
    score: 99,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief Technology Officer (CTO)',
    totalChecks: 60,
    passedChecks: 60,
    criticalFindings: [],
    recommendations: ['Manter tipagem estrita de TypeScript sem "any".'],
    evaluatedAt: '2026-07-22',
  },
  {
    domain: 'SEGURANCA',
    domainName: 'Segurança & Zero Trust (ISO 27001 / NIST)',
    score: 97,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief Information Security Officer (CISO)',
    totalChecks: 50,
    passedChecks: 49,
    criticalFindings: [],
    recommendations: ['Executar testes de intrusão externos semestrais.'],
    evaluatedAt: '2026-07-22',
  },
  {
    domain: 'IA_RESPONSAVEL',
    domainName: 'IA Responsável & Ética (ISO 42001)',
    score: 96,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief AI Officer (CAIO)',
    totalChecks: 40,
    passedChecks: 39,
    criticalFindings: [],
    recommendations: ['Manter Human-in-the-Loop em 100% das automações de tomada de decisão.'],
    evaluatedAt: '2026-07-22',
  },
  {
    domain: 'GOVERNANCA',
    domainName: 'Governança Corporativa & Compliance (ISO 37000/37301)',
    score: 98,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief Governance Officer (CGO)',
    totalChecks: 55,
    passedChecks: 55,
    criticalFindings: [],
    recommendations: ['Manter auditoria blockchain de transações financeiras.'],
    evaluatedAt: '2026-07-22',
  },
  {
    domain: 'CONTINUIDADE',
    domainName: 'Continuidade do Negócio & Resiliência (ISO 22301)',
    score: 99,
    status: 'CERTIFICADO_PRODUCAO',
    auditorResponsible: 'Chief Resilience Officer (CRO)',
    totalChecks: 35,
    passedChecks: 35,
    criticalFindings: [],
    recommendations: ['Simular testes de desastre multi-region a cada trimestre.'],
    evaluatedAt: '2026-07-22',
  },
];

const SEED_INVENTORY: Omit<EnterpriseModuleInventoryItem, 'id'>[] = [
  { promptNumber: 'Prompt 065', moduleCode: 'EIGCAP', moduleName: 'Enterprise Institutional Governance & Compliance', category: 'GOVERNANCE', apiEndpointsCount: 14, firestoreCollectionsCount: 7, aiModelsCount: 3, slaTarget: '99.95%', readiness: 'CERTIFICADO_PRODUCAO' },
  { promptNumber: 'Prompt 066', moduleCode: 'ECDTISP', moduleName: 'Enterprise Cognitive Digital Twin & Simulation', category: 'RESIENCIAL_SIMULATION', apiEndpointsCount: 18, firestoreCollectionsCount: 5, aiModelsCount: 4, slaTarget: '99.97%', readiness: 'CERTIFICADO_PRODUCAO' },
  { promptNumber: 'Prompt 067', moduleCode: 'EALOIP', moduleName: 'Enterprise Adaptive Learning & Organizational Intelligence', category: 'INTELLIGENCE', apiEndpointsCount: 12, firestoreCollectionsCount: 4, aiModelsCount: 2, slaTarget: '99.95%', readiness: 'CERTIFICADO_PRODUCAO' },
  { promptNumber: 'Prompt 068', moduleCode: 'EMAIVGP', moduleName: 'Enterprise Mission Alignment & Value Governance', category: 'GOVERNANCE', apiEndpointsCount: 10, firestoreCollectionsCount: 3, aiModelsCount: 2, slaTarget: '99.95%', readiness: 'CERTIFICADO_PRODUCAO' },
  { promptNumber: 'Prompt 069', moduleCode: 'EIRCTP', moduleName: 'Enterprise Innovation & Continuous Transformation', category: 'INTELLIGENCE', apiEndpointsCount: 15, firestoreCollectionsCount: 3, aiModelsCount: 3, slaTarget: '99.95%', readiness: 'CERTIFICADO_PRODUCAO' },
  { promptNumber: 'Prompt 070', moduleCode: 'EISRFRP', moduleName: 'Enterprise Institutional Sustainability & Resilience', category: 'RESIENCIAL_SIMULATION', apiEndpointsCount: 12, firestoreCollectionsCount: 3, aiModelsCount: 2, slaTarget: '99.97%', readiness: 'CERTIFICADO_PRODUCAO' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEIPCORFService = {

  async getDomainAudits(): Promise<DomainCertificationAudit[]> {
    const q = query(collection(db, 'eipcorf_domains'), orderBy('score', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_DOMAINS) {
        await addDoc(collection(db, 'eipcorf_domains'), { ...item });
      }
      return this.getDomainAudits();
    }
    return snap.docs.map(d => mapDoc<DomainCertificationAudit>(d));
  },

  async getModuleInventory(): Promise<EnterpriseModuleInventoryItem[]> {
    const q = query(collection(db, 'eipcorf_inventory'), orderBy('promptNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INVENTORY) {
        await addDoc(collection(db, 'eipcorf_inventory'), { ...item });
      }
      return this.getModuleInventory();
    }
    return snap.docs.map(d => mapDoc<EnterpriseModuleInventoryItem>(d));
  },

  async getDashboardKPIs(): Promise<EIPCORFDashboardKPIs> {
    return {
      globalEnterpriseMaturityScore: 97.6,
      totalPromptsAudited: 70,
      totalModulesCertified: 70,
      readinessCompliancePercent: 100,
      criticalVulnerabilitiesCount: 0,
      overallUptimeSLO: '99.97%',
      certificationDate: '2026-07-22',
      certificationVersion: 'EIPCORF v1.0 — Prompt 071 (Homologação Final)',
    };
  },
};
