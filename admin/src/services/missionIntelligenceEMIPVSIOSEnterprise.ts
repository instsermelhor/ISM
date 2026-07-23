/**
 * missionIntelligenceEMIPVSIOSEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission Intelligence, Public Value & Social Impact Operating System
 * Instituto Ser Melhor — Prompt 093 — Plataforma ISM v2.0
 *
 * Padrões: Theory of Change, Logic Model, OKRs, BSC, SROI, ESG, ODS ONU,
 *          ISO 9001, ISO 42001, TOGAF, COBIT 2019, Impact Measurement,
 *          DAMA-DMBOK2, Vertex AI, BigQuery, Google Cloud Platform
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ProgramStatus = 'ATIVO' | 'EM_EXPANSAO' | 'PILOTO' | 'SUSPENSO' | 'CONCLUIDO';
export type OKRStatus = 'NO_PRAZO' | 'EM_RISCO' | 'ATRASADO' | 'CONCLUIDO';
export type ImpactLevel = 'TRANSFORMADOR' | 'SIGNIFICATIVO' | 'MODERADO' | 'INICIAL';
export type OdsNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SocialProgram {
  id: string;
  programCode: string;           // ex: "PROG-001"
  name: string;
  status: ProgramStatus;
  impactLevel: ImpactLevel;
  targetAudience: string;        // ex: "Crianças 0-5 anos em vulnerabilidade"
  beneficiariesReached: number;  // ex: 284000
  territoriesCount: number;      // ex: 142 municípios
  odsAligned: OdsNumber[];       // ex: [3, 4, 8]
  sroi: number;                  // ex: 5.4 (R$5.40 retorno por R$1 investido)
  missionAlignment: number;      // 0-100
  annualBudget: number;          // R$
  createdAt?: unknown;
}

export interface TheoryOfChangeNode {
  id: string;
  tocCode: string;               // ex: "TOC-001"
  level: 'PROBLEMA' | 'INSUMO' | 'ATIVIDADE' | 'OUTPUT' | 'OUTCOME' | 'IMPACTO';
  description: string;
  program: string;               // referência ao programa
  evidenceQuality: 'FORTE' | 'MODERADA' | 'EMERGENTE';
  confidenceScore: number;       // 0-100
  createdAt?: unknown;
}

export interface InstitutionalOKR {
  id: string;
  okrCode: string;               // ex: "OKR-001"
  objective: string;
  keyResult: string;
  owner: string;                 // ex: "CMO · Chief Mission Officer"
  status: OKRStatus;
  currentProgress: number;       // 0-100%
  targetValue: string;           // ex: "1.500.000 Beneficiários"
  deadline: string;              // ISO date
  odsAligned: OdsNumber[];
  createdAt?: unknown;
}

export interface ESGIndicator {
  id: string;
  esgCode: string;               // ex: "ESG-E-001"
  pillar: 'E' | 'S' | 'G';      // Environmental, Social, Governance
  indicator: string;
  currentValue: string;
  targetValue: string;
  trend: 'MELHORA' | 'ESTAVEL' | 'PIORA';
  score: number;                 // 0-100
  createdAt?: unknown;
}

export interface EMIPVSIOSDashboardKPIs {
  missionAlignmentScore: number;        // ex: 99.4
  socialImpactIndex: number;            // ex: 98.8
  publicValueScore: number;             // ex: 99.1
  esgScore: number;                     // ex: 96.5
  sroi: number;                         // ex: 5.4 (R$ 5.40 por R$ 1 investido)
  totalBeneficiaries: number;           // ex: 1240000
  territoriesServed: number;            // ex: 142
  activePrograms: number;               // ex: 18
  okrCompletionRate: number;            // ex: 94.2%
  missionIntelligenceScore: number;     // ex: 99.2
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_PROGRAMS: Omit<SocialProgram, 'id' | 'createdAt'>[] = [
  {
    programCode: 'PROG-001',
    name: 'Saúde Comunitária Inteligente (FHIR R4 + Telemedicina ISM)',
    status: 'EM_EXPANSAO',
    impactLevel: 'TRANSFORMADOR',
    targetAudience: 'Famílias em situação de vulnerabilidade socioeconômica sem acesso a serviços de saúde primária',
    beneficiariesReached: 420000,
    territoriesCount: 87,
    odsAligned: [3, 10],
    sroi: 6.2,
    missionAlignment: 100,
    annualBudget: 4200000,
  },
  {
    programCode: 'PROG-002',
    name: 'Educação Transformadora & Capacitação Profissional Digital',
    status: 'ATIVO',
    impactLevel: 'TRANSFORMADOR',
    targetAudience: 'Jovens de 14–29 anos fora do mercado formal de trabalho',
    beneficiariesReached: 312000,
    territoriesCount: 64,
    odsAligned: [4, 8, 10],
    sroi: 4.8,
    missionAlignment: 98,
    annualBudget: 3100000,
  },
  {
    programCode: 'PROG-003',
    name: 'Assistência Social & Proteção às Famílias (CRAS Digital ISM)',
    status: 'ATIVO',
    impactLevel: 'SIGNIFICATIVO',
    targetAudience: 'Famílias em extrema pobreza vinculadas ao CadÚnico e CRAS',
    beneficiariesReached: 508000,
    territoriesCount: 142,
    odsAligned: [1, 2, 10],
    sroi: 5.1,
    missionAlignment: 100,
    annualBudget: 5080000,
  },
];

const SEED_TOC: Omit<TheoryOfChangeNode, 'id' | 'createdAt'>[] = [
  {
    tocCode: 'TOC-001',
    level: 'PROBLEMA',
    description: 'Acesso desigual a serviços sociais de saúde, educação e assistência em 142 municípios brasileiros',
    program: 'Todos os programas ISM',
    evidenceQuality: 'FORTE',
    confidenceScore: 99,
  },
  {
    tocCode: 'TOC-002',
    level: 'INSUMO',
    description: 'Infraestrutura Digital GCP (Vertex AI, AlloyDB, Cloud Run) + Rede de Parceiros + Recurso Humano Especializado',
    program: 'Plataforma ISM v2.0 (Prompts 001-093)',
    evidenceQuality: 'FORTE',
    confidenceScore: 100,
  },
  {
    tocCode: 'TOC-003',
    level: 'ATIVIDADE',
    description: 'Triagem inteligente por IA, Atendimento Omnichannel, Gestão de Casos, Telemedicina, Capacitação Digital',
    program: 'Todos os módulos operacionais',
    evidenceQuality: 'FORTE',
    confidenceScore: 98,
  },
  {
    tocCode: 'TOC-004',
    level: 'OUTPUT',
    description: '1.240.000 beneficiários atendidos · 142 municípios cobertos · 4 estados · 18 programas ativos',
    program: 'Resultado consolidado 2026',
    evidenceQuality: 'FORTE',
    confidenceScore: 99,
  },
  {
    tocCode: 'TOC-005',
    level: 'OUTCOME',
    description: 'Melhora mensurável em acesso a saúde (+34%), empregabilidade (+28%) e segurança alimentar (+41%) dos beneficiários',
    program: 'Avaliação de Impacto 2025-2026',
    evidenceQuality: 'FORTE',
    confidenceScore: 96,
  },
  {
    tocCode: 'TOC-006',
    level: 'IMPACTO',
    description: 'Redução estrutural da vulnerabilidade social em territórios atendidos (SROI médio R$ 5.4 por R$ 1 investido)',
    program: 'Análise SROI Longitudinal 2024-2026',
    evidenceQuality: 'FORTE',
    confidenceScore: 94,
  },
];

const SEED_OKRS: Omit<InstitutionalOKR, 'id' | 'createdAt'>[] = [
  {
    okrCode: 'OKR-001',
    objective: 'Ampliar o alcance do Instituto Ser Melhor para 1.500.000 beneficiários até Dez/2026',
    keyResult: 'Crescimento de 21% na base de beneficiários ativos, de 1.240.000 para 1.500.000',
    owner: 'CMO · Chief Mission Officer',
    status: 'NO_PRAZO',
    currentProgress: 83,
    targetValue: '1.500.000 Beneficiários',
    deadline: '2026-12-31',
    odsAligned: [1, 3, 4, 10],
  },
  {
    okrCode: 'OKR-002',
    objective: 'Atingir SROI médio de R$ 6.0 por R$ 1 investido em todos os programas até Dez/2026',
    keyResult: 'Evolução de SROI de 5.4x para 6.0x através de otimizações EAEIALP e EAICODOP',
    owner: 'CIO · Chief Impact Officer',
    status: 'NO_PRAZO',
    currentProgress: 74,
    targetValue: 'SROI ≥ 6.0x',
    deadline: '2026-12-31',
    odsAligned: [8, 10],
  },
  {
    okrCode: 'OKR-003',
    objective: 'Expandir para 5 novos estados até Jun/2027, triplicando territórios',
    keyResult: 'De 142 municípios (4 estados) para 426 municípios (9 estados) com plena operação digital',
    owner: 'CSO · Chief Strategy Officer',
    status: 'EM_RISCO',
    currentProgress: 31,
    targetValue: '426 Municípios / 9 Estados',
    deadline: '2027-06-30',
    odsAligned: [10, 11, 17],
  },
];

const SEED_ESG: Omit<ESGIndicator, 'id' | 'createdAt'>[] = [
  {
    esgCode: 'ESG-E-001',
    pillar: 'E',
    indicator: 'Pegada de Carbono Operacional (GCP Carbon Neutral)',
    currentValue: '-22% vs. baseline 2024',
    targetValue: '-40% até 2028',
    trend: 'MELHORA',
    score: 88,
  },
  {
    esgCode: 'ESG-S-001',
    pillar: 'S',
    indicator: 'Cobertura Social — Beneficiários em Situação de Extrema Vulnerabilidade',
    currentValue: '1.240.000 beneficiários',
    targetValue: '2.000.000 até 2028',
    trend: 'MELHORA',
    score: 99,
  },
  {
    esgCode: 'ESG-G-001',
    pillar: 'G',
    indicator: 'Governança Corporativa (COBIT 2019 · ARB 42 Decisões · ISO 27001)',
    currentValue: '100% conformidade auditada',
    targetValue: 'Manter ≥ 99% conformidade',
    trend: 'ESTAVEL',
    score: 100,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEMIPVSIOSService = {

  async getSocialPrograms(): Promise<SocialProgram[]> {
    const q = query(collection(db, 'emipvsios_programs'), orderBy('beneficiariesReached', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_PROGRAMS) {
        await addDoc(collection(db, 'emipvsios_programs'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getSocialPrograms();
    }
    return snap.docs.map(d => mapDoc<SocialProgram>(d));
  },

  async getTheoryOfChange(): Promise<TheoryOfChangeNode[]> {
    const q = query(collection(db, 'emipvsios_toc'), orderBy('tocCode', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_TOC) {
        await addDoc(collection(db, 'emipvsios_toc'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getTheoryOfChange();
    }
    return snap.docs.map(d => mapDoc<TheoryOfChangeNode>(d));
  },

  async getInstitutionalOKRs(): Promise<InstitutionalOKR[]> {
    const q = query(collection(db, 'emipvsios_okrs'), orderBy('currentProgress', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_OKRS) {
        await addDoc(collection(db, 'emipvsios_okrs'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getInstitutionalOKRs();
    }
    return snap.docs.map(d => mapDoc<InstitutionalOKR>(d));
  },

  async getESGIndicators(): Promise<ESGIndicator[]> {
    const q = query(collection(db, 'emipvsios_esg'), orderBy('score', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_ESG) {
        await addDoc(collection(db, 'emipvsios_esg'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getESGIndicators();
    }
    return snap.docs.map(d => mapDoc<ESGIndicator>(d));
  },

  async getDashboardKPIs(): Promise<EMIPVSIOSDashboardKPIs> {
    return {
      missionAlignmentScore: 99.4,
      socialImpactIndex: 98.8,
      publicValueScore: 99.1,
      esgScore: 96.5,
      sroi: 5.4,
      totalBeneficiaries: 1240000,
      territoriesServed: 142,
      activePrograms: 18,
      okrCompletionRate: 94.2,
      missionIntelligenceScore: 99.2,
      certificationDate: '2026-07-23',
      certificationVersion: 'EMIPVSIOS v1.0 — Prompt 093 (Enterprise Mission Intelligence & Social Impact OS)',
    };
  },
};
