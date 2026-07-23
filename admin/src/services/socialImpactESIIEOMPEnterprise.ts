/**
 * socialImpactESIIEOMPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Social Impact Intelligence, Evidence & Outcomes Management Platform
 * Instituto Ser Melhor — Prompt 078 — Plataforma ISM v2.0
 *
 * Padrões: SROI, Theory of Change, Logical Framework, Outcome Harvesting,
 *          ESG, ODS/SDG-ONU, BigQuery / Looker / Vertex AI, ISO 9001, ISO 42001
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ImpactProgramCategory =
  | 'SAUDE_MENTAL_PSICOSSOCIAL'
  | 'ASSISTENCIA_SOCIAL_PROTECAO'
  | 'ACESSO_JUSTICA_DIREITOS'
  | 'CAPACITACAO_EDUCACAO'
  | 'VOLUNTARIADO_COMUNIDADE';

export type EsgPillar = 'AMBIENTAL' | 'SOCIAL' | 'GOVERNANCA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SocialImpactProgram {
  id: string;
  programCode: string; // ex: "ISM-PROG-001"
  programName: string;
  category: ImpactProgramCategory;
  theoryOfChangeSummary: string; // mini theory of change
  beneficiariesReached: number;
  sroi: number;           // SROI ratio (ex: 5.2 = R$5,20 por R$1,00 investido)
  costPerBeneficiary: number; // em R$
  outcomeAchievementRate: number; // % (ex: 94.8%)
  alignedOdsNumbers: number[];   // ex: [3, 10, 16]
  esgPillars: EsgPillar[];
  evidenceFilesCount: number;
  impactScore: number; // 0-100
  createdAt?: unknown;
}

export interface OutcomeIndicator {
  id: string;
  indicatorCode: string; // ex: "IND-SM-001"
  name: string;
  programCode: string;
  formula: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  achievementPercent: number;
  measurementFrequency: string; // "Mensal" | "Trimestral"
  dataSource: string;
  methodologyNote: string;
}

export interface ESIIEOMPDashboardKPIs {
  globalSocialImpactScore: number;  // 0-100 (ex: 99.1)
  globalSroiRatio: number;          // ex: 5.4 (R$5,40 por R$1,00)
  totalBeneficiariesImpacted: number; // ex: 48320
  esgCompositeIndex: number;         // % (ex: 98.7%)
  odsCoveragePercent: number;        // % de ODS cobertos (ex: 80%)
  evidenceRepositoryCount: number;   // evidências catalogadas
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_PROGRAMS: Omit<SocialImpactProgram, 'id' | 'createdAt'>[] = [
  {
    programCode: 'ISM-PROG-001',
    programName: 'Telemedicina Sertão — Saúde Mental Remota',
    category: 'SAUDE_MENTAL_PSICOSSOCIAL',
    theoryOfChangeSummary: 'Ampliando acesso à saúde mental onde não há psiquiatras presenciais → redução de crises, hospitalização evitada e recuperação funcional.',
    beneficiariesReached: 22840,
    sroi: 6.8,
    costPerBeneficiary: 48,
    outcomeAchievementRate: 96.2,
    alignedOdsNumbers: [3, 10, 17],
    esgPillars: ['SOCIAL', 'GOVERNANCA'],
    evidenceFilesCount: 480,
    impactScore: 99,
  },
  {
    programCode: 'ISM-PROG-002',
    programName: 'Centro de Proteção Social e Fortalecimento Familiar',
    category: 'ASSISTENCIA_SOCIAL_PROTECAO',
    theoryOfChangeSummary: 'Articulando rede protetiva (CRAS, CREAS, Conselho Tutelar) → redução de vulnerabilidade, vínculos familiares restaurados.',
    beneficiariesReached: 14620,
    sroi: 4.9,
    costPerBeneficiary: 82,
    outcomeAchievementRate: 92.4,
    alignedOdsNumbers: [1, 2, 10, 16],
    esgPillars: ['SOCIAL'],
    evidenceFilesCount: 310,
    impactScore: 97,
  },
  {
    programCode: 'ISM-PROG-003',
    programName: 'Assistência Jurídica Gratuita & Acesso à Justiça',
    category: 'ACESSO_JUSTICA_DIREITOS',
    theoryOfChangeSummary: 'Oferecendo orientação jurídica especializada a populações sem acesso → garantia de direitos fundamentais e redução de violações.',
    beneficiariesReached: 7240,
    sroi: 4.2,
    costPerBeneficiary: 115,
    outcomeAchievementRate: 94.8,
    alignedOdsNumbers: [16, 10, 5],
    esgPillars: ['SOCIAL', 'GOVERNANCA'],
    evidenceFilesCount: 220,
    impactScore: 96,
  },
  {
    programCode: 'ISM-PROG-004',
    programName: 'Capacitação Profissional & Reinserção Produtiva',
    category: 'CAPACITACAO_EDUCACAO',
    theoryOfChangeSummary: 'Desenvolvendo habilidades técnicas e socioemocionais → empregabilidade elevada e autonomia econômica da família.',
    beneficiariesReached: 3620,
    sroi: 5.1,
    costPerBeneficiary: 220,
    outcomeAchievementRate: 89.3,
    alignedOdsNumbers: [4, 8, 10],
    esgPillars: ['SOCIAL', 'AMBIENTAL'],
    evidenceFilesCount: 160,
    impactScore: 94,
  },
];

const SEED_INDICATORS: Omit<OutcomeIndicator, 'id'>[] = [
  {
    indicatorCode: 'IND-SM-001',
    name: 'Taxa de Remissão de Crise Psiquiátrica',
    programCode: 'ISM-PROG-001',
    formula: '(Crises Evitadas / Crises Projetadas) × 100',
    unit: '%',
    currentValue: 94.7,
    targetValue: 90,
    achievementPercent: 105,
    measurementFrequency: 'Mensal',
    dataSource: 'EHR Enterprise — Módulo de Telemedicina',
    methodologyNote: 'Comparação com grupo controle histórico pré-intervenção.',
  },
  {
    indicatorCode: 'IND-AS-002',
    name: 'Índice de Fortalecimento de Vínculos Familiares',
    programCode: 'ISM-PROG-002',
    formula: '(Famílias com Evolução Positiva / Total Atendidas) × 100',
    unit: '%',
    currentValue: 88.4,
    targetValue: 80,
    achievementPercent: 110,
    measurementFrequency: 'Trimestral',
    dataSource: 'Prontuário Social — Assistência Social Enterprise',
    methodologyNote: 'Escala de Funcionalidade Familiar (EFF) validada pelo CFP.',
  },
  {
    indicatorCode: 'IND-JUR-003',
    name: 'Taxa de Resolução de Demandas Jurídicas',
    programCode: 'ISM-PROG-003',
    formula: '(Processos Resolvidos / Total Atendidos) × 100',
    unit: '%',
    currentValue: 92.1,
    targetValue: 85,
    achievementPercent: 108,
    measurementFrequency: 'Mensal',
    dataSource: 'Sistema Jurídico Enterprise — Módulo OAB',
    methodologyNote: 'Metodologia adaptada do Outcome Star Jurídico (OAB/SP).',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseESIIEOMPService = {

  async getPrograms(): Promise<SocialImpactProgram[]> {
    const q = query(collection(db, 'esiieomp_programs'), orderBy('impactScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_PROGRAMS) {
        await addDoc(collection(db, 'esiieomp_programs'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getPrograms();
    }
    return snap.docs.map(d => mapDoc<SocialImpactProgram>(d));
  },

  async getIndicators(): Promise<OutcomeIndicator[]> {
    const q = query(collection(db, 'esiieomp_indicators'), orderBy('achievementPercent', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INDICATORS) {
        await addDoc(collection(db, 'esiieomp_indicators'), { ...item });
      }
      return this.getIndicators();
    }
    return snap.docs.map(d => mapDoc<OutcomeIndicator>(d));
  },

  async getDashboardKPIs(): Promise<ESIIEOMPDashboardKPIs> {
    return {
      globalSocialImpactScore: 99.1,
      globalSroiRatio: 5.4,
      totalBeneficiariesImpacted: 48320,
      esgCompositeIndex: 98.7,
      odsCoveragePercent: 80,
      evidenceRepositoryCount: 1170,
      certificationDate: '2026-07-22',
      certificationVersion: 'ESIIEOMP v1.0 — Prompt 078 (Impacto Social Enterprise)',
    };
  },
};
