/**
 * bpmWorkflowEnterprise.ts  — Compatibility Stub (R009)
 * ────────────────────────────────────────────────────────
 * Re-exports the service used by PipelinePage.tsx.
 * Backend: Firestore collection `pipeline_tasks`.
 *
 * PipelinePage imports:
 *   BpmWorkflowEnterpriseService, type BpmTask, type TaskStage, type TaskPriority
 */

import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────

export type TaskStage =
  | 'IDEA'
  | 'WRITING'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED';

export type TaskPriority = 0 | 1 | 2;

export interface BpmTask {
  id?: string;
  title: string;
  description?: string;
  stage: TaskStage;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
  order?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Legacy alias exported so old references to `WorkflowTask` also compile
export type WorkflowTask = BpmTask;

// ── Seed Defaults ─────────────────────────────────────────────────────────

const SEED_TASKS: Omit<BpmTask, 'id'>[] = [
  {
    title: 'Mapeamento de Processos Internos',
    description: 'Levantamento e documentação dos processos críticos do Instituto.',
    stage: 'IDEA',
    priority: 1,
    order: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Relatório de Impacto Social Q2',
    description: 'Compilação de dados e redação do relatório trimestral de impacto.',
    stage: 'WRITING',
    priority: 2,
    order: 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    title: 'Conformidade LGPD — Revisão Anual',
    description: 'Auditoria e atualização da política de privacidade e termos de uso.',
    stage: 'REVIEW',
    priority: 1,
    order: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

const COL = () => collection(db, 'pipeline_tasks');

// ── Service ───────────────────────────────────────────────────────────────

export const BpmWorkflowEnterpriseService = {
  async getTasks(): Promise<BpmTask[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BpmTask));
    } catch {
      return [];
    }
  },

  async seedDefaults(): Promise<void> {
    try {
      for (const task of SEED_TASKS) {
        await addDoc(COL(), task);
      }
    } catch (e) {
      console.warn('[BpmWorkflowEnterpriseService] seedDefaults error:', e);
    }
  },

  async saveTask(t: BpmTask): Promise<void> {
    try {
      const { id, ...data } = t;
      const payload = { ...data, updatedAt: serverTimestamp() };
      if (id) {
        await updateDoc(doc(db, 'pipeline_tasks', id), payload);
      } else {
        await addDoc(COL(), { ...payload, createdAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('[BpmWorkflowEnterpriseService] saveTask error:', e);
      throw e;
    }
  },

  async moveTaskStage(id: string, stage: TaskStage): Promise<void> {
    try {
      await updateDoc(doc(db, 'pipeline_tasks', id), {
        stage,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('[BpmWorkflowEnterpriseService] moveTaskStage error:', e);
      throw e;
    }
  },
};
