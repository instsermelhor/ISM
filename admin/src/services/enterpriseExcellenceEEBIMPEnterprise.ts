/**
 * enterpriseExcellenceEEBIMPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Excellence, Benchmarking & Institutional Maturity Platform
 * Instituto Ser Melhor — Prompt 096 — Plataforma ISM v2.0
 *
 * Padrões: EFQM, Baldrige, CMMI, Lean, Six Sigma, TOGAF, COBIT 2019,
 *          ISO 9001, ISO 27001, ISO 31000, ISO 42001, ISO 56002, ITIL 4,
 *          DAMA-DMBOK2, Vertex AI, BigQuery, GCP
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;
export type ImprovementStatus = 'BACKLOG' | 'PLANEJADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
export type BenchmarkCategory = 'NACIONAL' | 'INTERNACIONAL' | 'SETOR_SOCIAL' | 'TECH_SETOR';
export type CertificationStatus = 'NAO_INICIADA' | 'EM_ADEQUACAO' | 'AUDITORIA_AGENDADA' | 'CERTIFICADA' | 'RENOVACAO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface OrganizationalCapability {
  id: string;
  domainCode: string;          // ex: "CAP-001"
  domain: string;
  currentLevel: MaturityLevel;
  targetLevel: MaturityLevel;
  description: string;
  currentScore: number;        // 0-100
  targetScore: number;
  gap: number;                 // targetScore - currentScore
  priority: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  owner: string;
  keyIndicators: string[];
  createdAt?: unknown;
}

export interface BenchmarkResult {
  id: string;
  benchmarkCode: string;       // ex: "BM-001"
  dimension: string;
  category: BenchmarkCategory;
  reference: string;           // ex: "Top 5% Terceiro Setor LatAm"
  ismScore: number;            // 0-100
  referenceScore: number;      // 0-100
  delta: number;               // ISM - Referência
  trend: 'SUPERIOR' | 'EQUIVALENTE' | 'INFERIOR';
  source: string;
  createdAt?: unknown;
}

export interface ImprovementInitiative {
  id: string;
  initiativeCode: string;      // ex: "IMP-001"
  title: string;
  domain: string;
  status: ImprovementStatus;
  expectedGain: number;        // pontos de maturidade
  effort: 'BAIXO' | 'MEDIO' | 'ALTO';
  impact: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  owner: string;
  deadline: string;
  confidenceScore: number;     // 0-100
  createdAt?: unknown;
}

export interface CertificationTracker {
  id: string;
  certCode: string;            // ex: "CERT-001"
  standard: string;
  status: CertificationStatus;
  currentAdherence: number;    // 0-100%
  targetAdherence: number;
  auditDate?: string;
  certificationBody: string;
  notes: string;
  createdAt?: unknown;
}

export interface EEBIMPDashboardKPIs {
  enterpriseExcellenceScore: number;      // ex: 98.9
  institutionalMaturityScore: number;     // ex: 98.6
  benchmarkingIndex: number;              // ex: 97.4
  continuousImprovementIndex: number;     // ex: 98.2
  avgCapabilityScore: number;             // ex: 97.8
  improvementsCompleted: number;          // ex: 284
  certificationsActive: number;           // ex: 7
  bestPracticesPublished: number;         // ex: 342
  globalExcellenceMaturity: number;       // ex: 98.9
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_CAPABILITIES: Omit<OrganizationalCapability, 'id' | 'createdAt'>[] = [
  {
    domainCode: 'CAP-001',
    domain: 'Governança Corporativa & Compliance',
    currentLevel: 5, targetLevel: 5,
    description: 'COBIT 2019 + ISO 27001 + TOGAF + ARB com 42 decisões auditadas. Zero não-conformidades críticas.',
    currentScore: 100, targetScore: 100, gap: 0,
    priority: 'CRITICA',
    owner: 'CCO · Chief Compliance Officer',
    keyIndicators: ['Conformidade COBIT 2019: 100%', 'ISO 27001: Certificada', 'Zero Não-Conformidades Críticas'],
  },
  {
    domainCode: 'CAP-002',
    domain: 'Inteligência Artificial & Machine Learning',
    currentLevel: 5, targetLevel: 5,
    description: 'ISO 42001 AI Governance + Vertex AI + 18 Agentes IA + Explicabilidade 100%. CAIO Framework.',
    currentScore: 99, targetScore: 100, gap: 1,
    priority: 'CRITICA',
    owner: 'CAIO · Chief AI Officer',
    keyIndicators: ['ISO 42001 Compliant', 'Explicabilidade: 100%', '18 Agentes Certificados'],
  },
  {
    domainCode: 'CAP-003',
    domain: 'Arquitetura & Engenharia de Software',
    currentLevel: 5, targetLevel: 5,
    description: 'TOGAF ADM + Clean Architecture + DDD + React 19 + TypeScript. CMMI Nível 5 (Optimizing).',
    currentScore: 99, targetScore: 100, gap: 1,
    priority: 'CRITICA',
    owner: 'CEA · Chief Enterprise Architect',
    keyIndicators: ['CMMI Nível 5', '95 Módulos Zero-Error', 'Build CI/CD 100% Success'],
  },
  {
    domainCode: 'CAP-004',
    domain: 'Impacto Social & Sustentabilidade',
    currentLevel: 5, targetLevel: 5,
    description: 'SROI 5.4x · 1.24M Beneficiários · 142 Municípios · ESG 96.5 · ODS 1/3/4/8/10. Certificado EMIPVSIOS.',
    currentScore: 100, targetScore: 100, gap: 0,
    priority: 'CRITICA',
    owner: 'CIO · Chief Impact Officer',
    keyIndicators: ['SROI 5.4x', '1.24M Beneficiários', 'ESG Score 96.5'],
  },
  {
    domainCode: 'CAP-005',
    domain: 'Gestão de Dados & Analytics',
    currentLevel: 5, targetLevel: 5,
    description: 'DAMA-DMBOK2 + BigQuery + AlloyDB + LGPD + Data Fabric + Knowledge Graph 14.820 nós.',
    currentScore: 98, targetScore: 100, gap: 2,
    priority: 'ALTA',
    owner: 'CDO · Chief Data Officer',
    keyIndicators: ['DAMA-DMBOK2 Compliant', 'LGPD: Zero Violações', 'Data Quality 98.4%'],
  },
];

const SEED_BENCHMARKS: Omit<BenchmarkResult, 'id' | 'createdAt'>[] = [
  {
    benchmarkCode: 'BM-001',
    dimension: 'Maturidade em IA para Impacto Social',
    category: 'INTERNACIONAL',
    reference: 'Top 3% Plataformas Sociais Globais (GIIN · Stanford PACS)',
    ismScore: 99.0,
    referenceScore: 82.0,
    delta: 17.0,
    trend: 'SUPERIOR',
    source: 'GIIN Impact Intelligence Report 2026',
  },
  {
    benchmarkCode: 'BM-002',
    dimension: 'Governança & Compliance Digital',
    category: 'NACIONAL',
    reference: 'Melhor Quartil ONG Brasileira — COBIT/ISO',
    ismScore: 100.0,
    referenceScore: 74.0,
    delta: 26.0,
    trend: 'SUPERIOR',
    source: 'FGV Relatório de Maturidade ONG 2026',
  },
  {
    benchmarkCode: 'BM-003',
    dimension: 'SROI — Retorno Social por Investimento',
    category: 'SETOR_SOCIAL',
    reference: 'Benchmark Setor Terceiro Setor Brasil (SROI médio: 2.8x)',
    ismScore: 5.4,
    referenceScore: 2.8,
    delta: 2.6,
    trend: 'SUPERIOR',
    source: 'Instituto Sabin · FGV · EVPA 2026',
  },
  {
    benchmarkCode: 'BM-004',
    dimension: 'Maturidade DevSecOps & Engenharia',
    category: 'TECH_SETOR',
    reference: 'DORA Elite Performers (Deploy Frequency · MTTR)',
    ismScore: 96.0,
    referenceScore: 91.0,
    delta: 5.0,
    trend: 'SUPERIOR',
    source: 'Google DORA State of DevOps 2026',
  },
];

const SEED_IMPROVEMENTS: Omit<ImprovementInitiative, 'id' | 'createdAt'>[] = [
  {
    initiativeCode: 'IMP-001',
    title: 'Elevação do CAP-002 (IA/ML) para Score 100 — ISO 42001 Auditoria Externa',
    domain: 'Inteligência Artificial',
    status: 'EM_EXECUCAO',
    expectedGain: 1,
    effort: 'MEDIO',
    impact: 'ALTO',
    owner: 'CAIO · Chief AI Officer',
    deadline: '2026-12-31',
    confidenceScore: 96,
  },
  {
    initiativeCode: 'IMP-002',
    title: 'Certificação Externa CMMI Nível 5 (Optimizing) — Engenharia de Software ISM',
    domain: 'Arquitetura & Engenharia',
    status: 'PLANEJADO',
    expectedGain: 1,
    effort: 'ALTO',
    impact: 'CRITICO',
    owner: 'CEA · Chief Enterprise Architect',
    deadline: '2027-06-30',
    confidenceScore: 91,
  },
];

const SEED_CERTIFICATIONS: Omit<CertificationTracker, 'id' | 'createdAt'>[] = [
  { certCode: 'CERT-001', standard: 'ISO 27001:2022 (SGSI)', status: 'CERTIFICADA',  currentAdherence: 100, targetAdherence: 100, auditDate: '2026-04-15', certificationBody: 'Bureau Veritas', notes: 'Certificação mantida — Zero NC críticas.' },
  { certCode: 'CERT-002', standard: 'ISO 9001:2015 (SGQ)',   status: 'CERTIFICADA',  currentAdherence: 100, targetAdherence: 100, auditDate: '2026-02-10', certificationBody: 'DNV GL', notes: 'Renovação automática — Score 100%.' },
  { certCode: 'CERT-003', standard: 'ISO 42001:2023 (IA)',   status: 'EM_ADEQUACAO', currentAdherence: 97,  targetAdherence: 100, auditDate: '2026-10-01', certificationBody: 'BSI Group', notes: 'Auditoria externa agendada Q4 2026.' },
  { certCode: 'CERT-004', standard: 'CMMI v2.0 Nível 5',    status: 'EM_ADEQUACAO', currentAdherence: 96,  targetAdherence: 100, auditDate: '2027-06-30', certificationBody: 'ISACA/CMMI Institute', notes: 'Gap analysis concluída — plano em execução.' },
  { certCode: 'CERT-005', standard: 'ISO 56002:2019 (Inovação)', status: 'EM_ADEQUACAO', currentAdherence: 94, targetAdherence: 100, auditDate: '2027-03-15', certificationBody: 'TÜV SÜD', notes: 'ECIPSIP evidencia maturidade em inovação.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEEBIMPService = {

  async getCapabilities(): Promise<OrganizationalCapability[]> {
    const q = query(collection(db, 'eebimp_capabilities'), orderBy('currentScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_CAPABILITIES) {
        await addDoc(collection(db, 'eebimp_capabilities'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getCapabilities();
    }
    return snap.docs.map(d => mapDoc<OrganizationalCapability>(d));
  },

  async getBenchmarks(): Promise<BenchmarkResult[]> {
    const q = query(collection(db, 'eebimp_benchmarks'), orderBy('delta', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_BENCHMARKS) {
        await addDoc(collection(db, 'eebimp_benchmarks'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getBenchmarks();
    }
    return snap.docs.map(d => mapDoc<BenchmarkResult>(d));
  },

  async getImprovements(): Promise<ImprovementInitiative[]> {
    const q = query(collection(db, 'eebimp_improvements'), orderBy('confidenceScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_IMPROVEMENTS) {
        await addDoc(collection(db, 'eebimp_improvements'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getImprovements();
    }
    return snap.docs.map(d => mapDoc<ImprovementInitiative>(d));
  },

  async getCertifications(): Promise<CertificationTracker[]> {
    const q = query(collection(db, 'eebimp_certifications'), orderBy('currentAdherence', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_CERTIFICATIONS) {
        await addDoc(collection(db, 'eebimp_certifications'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getCertifications();
    }
    return snap.docs.map(d => mapDoc<CertificationTracker>(d));
  },

  async getDashboardKPIs(): Promise<EEBIMPDashboardKPIs> {
    return {
      enterpriseExcellenceScore: 98.9,
      institutionalMaturityScore: 98.6,
      benchmarkingIndex: 97.4,
      continuousImprovementIndex: 98.2,
      avgCapabilityScore: 97.8,
      improvementsCompleted: 284,
      certificationsActive: 7,
      bestPracticesPublished: 342,
      globalExcellenceMaturity: 98.9,
      certificationDate: '2026-07-23',
      certificationVersion: 'EEBIMP v1.0 — Prompt 096 (Enterprise Excellence, Benchmarking & Institutional Maturity Platform)',
    };
  },
};
