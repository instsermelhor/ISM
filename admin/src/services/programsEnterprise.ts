/**
 * ProgramsEnterpriseService
 * ──────────────────────────
 * Serviço de dados Enterprise para Gestão de Programas, PMO Social, Matriz Lógica e SROI.
 *
 * Coleções gerenciadas:
 *   • social_programs     — Programas Sociais Institucionais
 *   • social_projects     — Projetos & Entregáveis (PMO)
 *   • logical_matrices    — Matriz Lógica (M&A)
 *   • program_kpis        — Metas, OKRs e Indicadores SROI / ESG
 *   • program_evidences   — Evidências e Documentos Auditáveis
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ProgramLifecycleStage =
  | 'PLANEJAMENTO'
  | 'APROVACAO'
  | 'CAPTACAO'
  | 'EXECUCAO'
  | 'MONITORAMENTO'
  | 'PRESTACAO_CONTAS'
  | 'CONCLUIDO'
  | 'ARQUIVADO';

export interface SocialProgram {
  id?: string;
  code: string;               // ex: 'PROG-001'
  title: string;
  slug: string;
  category: 'Educacao' | 'MeioAmbiente' | 'Cultura' | 'Emancipacao' | 'DireitosHumanos';
  summary: string;
  fullDescription: string;
  stage: ProgramLifecycleStage;
  ods: string[];              // ex: ['ODS 1', 'ODS 4', 'ODS 13']
  targetAudience: string;
  totalBudget: number;        // Orçamento total planejado
  executedBudget: number;     // Valor executado
  startDate: string;          // YYYY-MM-DD
  endDate?: string;           // YYYY-MM-DD
  coordinatorName: string;
  partnerIds?: string[];
  bannerUrl?: string;
  iconEmoji: string;
  isPublished: boolean;
  order: number;
  sroiRatio?: number;         // ex: 4.5 (R$ 4,50 de retorno social para cada R$ 1,00 investido)
  updatedAt?: unknown;
}

export interface SocialProject {
  id?: string;
  programId: string;
  code: string;               // ex: 'PROJ-010'
  title: string;
  deliverables: string[];
  stage: ProgramLifecycleStage;
  startDate: string;
  endDate: string;
  progressPct: number;        // 0 a 100
  responsibleName: string;
  budgetAllocated: number;
  cityState: string;          // ex: 'Campinas / SP'
  beneficiaryTarget: number;
  beneficiaryReached: number;
  updatedAt?: unknown;
}

export interface LogicalMatrix {
  id?: string;
  programId: string;
  centralProblem: string;
  generalGoal: string;
  specificGoals: string[];
  expectedResults: string[];
  activities: string[];
  indicators: string[];
  verificationMeans: string[];
  assumptions: string[];
  risksAndMitigation: { risk: string; mitigation: string }[];
  updatedAt?: unknown;
}

export interface ProgramKpi {
  id?: string;
  programId: string;
  name: string;               // ex: 'Jovens Formados'
  targetValue: number;
  currentValue: number;
  unit: string;               // ex: 'pessoas', 'hectares', 'horas'
  period: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  odsTag?: string;
  category: 'social' | 'esg' | 'financeiro';
  updatedAt?: unknown;
}

export interface ProgramEvidence {
  id?: string;
  programId: string;
  projectId?: string;
  title: string;
  type: 'laudo' | 'foto' | 'lista_presenca' | 'contrato' | 'relatorio_tecnico';
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const ProgramsEnterpriseService = {

  // ── Programs ─────────────────────────────────────────────────────────────

  async getPrograms(): Promise<SocialProgram[]> {
    const q = query(collection(db, 'social_programs'), orderBy('order'));
    const snap = await getDocs(q);
    return mapDocs<SocialProgram>(snap);
  },

  async saveProgram(data: SocialProgram): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'social_programs', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'social_programs'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteProgram(id: string): Promise<void> {
    await deleteDoc(doc(db, 'social_programs', id));
  },

  // ── Projects ─────────────────────────────────────────────────────────────

  async getProjects(programId?: string): Promise<SocialProject[]> {
    let q = programId
      ? query(collection(db, 'social_projects'), where('programId', '==', programId), orderBy('title'))
      : query(collection(db, 'social_projects'), orderBy('title'));
    const snap = await getDocs(q);
    return mapDocs<SocialProject>(snap);
  },

  async saveProject(data: SocialProject): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'social_projects', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'social_projects'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, 'social_projects', id));
  },

  // ── Logical Matrix ───────────────────────────────────────────────────────

  async getLogicalMatrix(programId: string): Promise<LogicalMatrix | null> {
    const q = query(collection(db, 'logical_matrices'), where('programId', '==', programId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as LogicalMatrix;
  },

  async saveLogicalMatrix(data: LogicalMatrix): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'logical_matrices', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'logical_matrices'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── KPIs & SROI ──────────────────────────────────────────────────────────

  async getKpis(programId?: string): Promise<ProgramKpi[]> {
    let q = programId
      ? query(collection(db, 'program_kpis'), where('programId', '==', programId))
      : query(collection(db, 'program_kpis'));
    const snap = await getDocs(q);
    return mapDocs<ProgramKpi>(snap);
  },

  async saveKpi(data: ProgramKpi): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'program_kpis', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'program_kpis'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultPrograms: Omit<SocialProgram, 'id'>[] = [
      {
        code: 'PROG-001',
        title: 'Programa Educação Regenerativa & Liderança Climate Youth',
        slug: 'educacao-regenerativa',
        category: 'Educacao',
        summary: 'Formação de jovens líderes socioambientais e capacitação técnica em regeneração sustentável.',
        fullDescription: 'Programa intensivo de 12 meses focando em empoderamento jovem, transição energética local e governança comunitária.',
        stage: 'EXECUCAO',
        ods: ['ODS 4', 'ODS 8', 'ODS 13'],
        targetAudience: 'Jovens de 16 a 24 anos da rede pública de ensino',
        totalBudget: 1500000,
        executedBudget: 980000,
        startDate: '2024-01-15',
        coordinatorName: 'Dr. Fernando Santos',
        iconEmoji: '🌱',
        isPublished: true,
        order: 1,
        sroiRatio: 4.8,
      },
      {
        code: 'PROG-002',
        title: 'Programa Emancipação Econômica & Microcrédito Social',
        slug: 'emancipacao-economica',
        category: 'Emancipacao',
        summary: 'Fomento ao empreendedorismo periférico e inclusão produtiva de mulheres chefes de família.',
        fullDescription: 'Acompanhamento técnico, incubação de pequenos negócios comunitários e concessão de microcrédito orientado.',
        stage: 'EXECUCAO',
        ods: ['ODS 1', 'ODS 5', 'ODS 8', 'ODS 10'],
        targetAudience: 'Mulheres empreendedoras periféricas',
        totalBudget: 2200000,
        executedBudget: 1450000,
        startDate: '2023-06-01',
        coordinatorName: 'Mariana Albuquerque',
        iconEmoji: '💡',
        isPublished: true,
        order: 2,
        sroiRatio: 5.2,
      },
    ];

    for (const prog of defaultPrograms) {
      const ref = doc(collection(db, 'social_programs'));
      batch.set(ref, { ...prog, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
