/**
 * institutionalExcellenceEIEBCFEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Excellence, Benchmarking & Certification Framework
 * Instituto Ser Melhor — Prompt 081 — Plataforma ISM v2.0
 *
 * Padrões: EFQM 2020, Baldrige PEF, ISO 9001, ISO 27001, ISO 42001,
 *          COBIT 2019, ITIL 4, TOGAF, ISO 56002, ISO 31000, DAMA-DMBOK2
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ExcellenceDomain =
  | 'GOVERNANCA' | 'ARQUITETURA' | 'TECNOLOGIA' | 'SEGURANCA'
  | 'IA_RESPONSAVEL' | 'DADOS' | 'COMPLIANCE' | 'LGPD'
  | 'ESG_ODS' | 'IMPACTO_SOCIAL' | 'OPERACAO' | 'INOVACAO';

// Nível 1–7 (Inicial → Adaptativo)
export type MaturityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CertificationStatus =
  | 'CERTIFICADO' | 'EM_ADEQUACAO' | 'PLANEJADO' | 'NAO_INICIADO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ExcellenceDomainEntry {
  id: string;
  domainCode: string;      // ex: "DOM-GOV-001"
  domainName: string;
  domain: ExcellenceDomain;
  maturityLevel: MaturityLevel;
  maturityLabel: string;   // ex: "Nível 7 — Adaptativo"
  scoreOutOf100: number;
  responsible: string;     // ex: "CGO — Chief Governance Officer"
  mainIndicator: string;
  benchmarkReference: string;
  improvementPlanActive: boolean;
  createdAt?: unknown;
}

export interface CertificationEntry {
  id: string;
  certCode: string;        // ex: "CERT-ISO-9001"
  certName: string;
  framework: string;       // ex: "ISO 9001:2015"
  status: CertificationStatus;
  adherencePercent: number;
  gapCount: number;
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  targetDeadline: string;
  responsible: string;
}

export interface EIEBCFDashboardKPIs {
  globalExcellenceScore: number;  // 0-100 (ex: 99.2)
  globalMaturityLevel: MaturityLevel;
  certifiedCount: number;
  inAdequationCount: number;
  activePlansCount: number;
  benchmarkPositionNational: string; // ex: "Top 1% Terceiro Setor"
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const MATURITY_LABEL: Record<MaturityLevel, string> = {
  1: 'Nível 1 — Inicial',
  2: 'Nível 2 — Repetível',
  3: 'Nível 3 — Padronizado',
  4: 'Nível 4 — Gerenciado',
  5: 'Nível 5 — Otimizado',
  6: 'Nível 6 — Inteligente',
  7: 'Nível 7 — Adaptativo',
};

const SEED_DOMAINS: Omit<ExcellenceDomainEntry, 'id' | 'createdAt'>[] = [
  { domainCode: 'DOM-GOV-001', domainName: 'Governança Corporativa', domain: 'GOVERNANCA', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 100, responsible: 'CGO — Chief Governance Officer', mainIndicator: 'Índice COBIT 2019 · 100%', benchmarkReference: 'COBIT 2019 / ISO 37301 / Baldrige', improvementPlanActive: false },
  { domainCode: 'DOM-ARQ-002', domainName: 'Arquitetura Enterprise (TOGAF / C4)', domain: 'ARQUITETURA', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 99, responsible: 'CEA — Chief Enterprise Architect', mainIndicator: 'ADR Coverage · 100%', benchmarkReference: 'TOGAF / C4 / DDD / Clean Arch.', improvementPlanActive: false },
  { domainCode: 'DOM-TEC-003', domainName: 'Tecnologia & Plataforma (GCP / Firebase)', domain: 'TECNOLOGIA', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 99, responsible: 'CTO — Chief Technology Officer', mainIndicator: 'Uptime 99.98%', benchmarkReference: 'ITIL 4 / SRE / DevSecOps', improvementPlanActive: false },
  { domainCode: 'DOM-SEG-004', domainName: 'Segurança da Informação (Zero Trust)', domain: 'SEGURANCA', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 100, responsible: 'CISO — Chief Information Security Officer', mainIndicator: 'Zero Incidentes Críticos', benchmarkReference: 'ISO 27001 / NIST CSF / Zero Trust', improvementPlanActive: false },
  { domainCode: 'DOM-AI-005', domainName: 'IA Responsável (ISO 42001)', domain: 'IA_RESPONSAVEL', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 100, responsible: 'CAIO — Chief AI Officer', mainIndicator: 'Human-in-the-Loop 100%', benchmarkReference: 'ISO 42001 / NIST AI RMF / EU AI Act', improvementPlanActive: false },
  { domainCode: 'DOM-DAD-006', domainName: 'Gestão de Dados (DAMA-DMBOK2)', domain: 'DADOS', maturityLevel: 6, maturityLabel: MATURITY_LABEL[6], scoreOutOf100: 99, responsible: 'CDO — Chief Data Officer', mainIndicator: 'Data Quality Score 99.4%', benchmarkReference: 'DAMA-DMBOK2 / MDM / Data Fabric', improvementPlanActive: false },
  { domainCode: 'DOM-ESG-007', domainName: 'ESG & Alinhamento ODS-ONU', domain: 'ESG_ODS', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 99, responsible: 'CSO — Chief Strategy Officer', mainIndicator: 'ESG 98.7% · ODS 80%', benchmarkReference: 'GRI / SASB / TCFD / Agenda 2030', improvementPlanActive: false },
  { domainCode: 'DOM-IMP-008', domainName: 'Impacto Social (SROI / Outcome Harvesting)', domain: 'IMPACTO_SOCIAL', maturityLevel: 7, maturityLabel: MATURITY_LABEL[7], scoreOutOf100: 99, responsible: 'CIO — Chief Impact Officer', mainIndicator: 'SROI 5.4x · 48.320 Beneficiários', benchmarkReference: 'SROI Network UK / EVPA / Theory of Change', improvementPlanActive: false },
];

const SEED_CERTIFICATIONS: Omit<CertificationEntry, 'id'>[] = [
  { certCode: 'CERT-ISO-9001', certName: 'ISO 9001:2015 — Sistema de Gestão da Qualidade', framework: 'ISO 9001:2015', status: 'CERTIFICADO', adherencePercent: 99, gapCount: 0, priority: 'ALTA', targetDeadline: '2026-12-31', responsible: 'CQO — Chief Quality Officer' },
  { certCode: 'CERT-ISO-27001', certName: 'ISO 27001:2022 — Segurança da Informação', framework: 'ISO 27001:2022', status: 'CERTIFICADO', adherencePercent: 100, gapCount: 0, priority: 'ALTA', targetDeadline: '2026-12-31', responsible: 'CISO — Chief Information Security Officer' },
  { certCode: 'CERT-ISO-42001', certName: 'ISO 42001:2023 — Gestão de IA Responsável', framework: 'ISO 42001:2023', status: 'CERTIFICADO', adherencePercent: 100, gapCount: 0, priority: 'ALTA', targetDeadline: '2026-12-31', responsible: 'CAIO — Chief AI Officer' },
  { certCode: 'CERT-COBIT-2019', certName: 'COBIT 2019 — Governança de TI Enterprise', framework: 'COBIT 2019', status: 'CERTIFICADO', adherencePercent: 100, gapCount: 0, priority: 'ALTA', targetDeadline: '2026-12-31', responsible: 'CGO — Chief Governance Officer' },
  { certCode: 'CERT-ISO-37301', certName: 'ISO 37301:2021 — Compliance Management', framework: 'ISO 37301:2021', status: 'EM_ADEQUACAO', adherencePercent: 96, gapCount: 2, priority: 'ALTA', targetDeadline: '2027-06-30', responsible: 'CRO — Chief Risk Officer' },
  { certCode: 'CERT-EFQM-2020', certName: 'EFQM Excellence Model 2020', framework: 'EFQM 2020', status: 'PLANEJADO', adherencePercent: 88, gapCount: 5, priority: 'MEDIA', targetDeadline: '2027-12-31', responsible: 'CXO — Chief Excellence Officer' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEIEBCFService = {

  async getDomains(): Promise<ExcellenceDomainEntry[]> {
    const q = query(collection(db, 'eiebcf_domains'), orderBy('scoreOutOf100', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_DOMAINS) {
        await addDoc(collection(db, 'eiebcf_domains'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getDomains();
    }
    return snap.docs.map(d => mapDoc<ExcellenceDomainEntry>(d));
  },

  async getCertifications(): Promise<CertificationEntry[]> {
    const q = query(collection(db, 'eiebcf_certifications'), orderBy('adherencePercent', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_CERTIFICATIONS) {
        await addDoc(collection(db, 'eiebcf_certifications'), { ...item });
      }
      return this.getCertifications();
    }
    return snap.docs.map(d => mapDoc<CertificationEntry>(d));
  },

  async getDashboardKPIs(): Promise<EIEBCFDashboardKPIs> {
    return {
      globalExcellenceScore: 99.2,
      globalMaturityLevel: 7,
      certifiedCount: 4,
      inAdequationCount: 1,
      activePlansCount: 3,
      benchmarkPositionNational: 'Top 1% Terceiro Setor Nacional',
      certificationDate: '2026-07-22',
      certificationVersion: 'EIEBCF v1.0 — Prompt 081 (Excelência Institucional Enterprise)',
    };
  },
};
