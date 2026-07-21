/**
 * BpmWorkflowEnterpriseService
 * ─────────────────────────────
 * Serviço de dados Enterprise para BPMN 2.0, Kanban, Gestão de Tarefas, SLAs e Fluxos de Aprovação.
 *
 * Coleções gerenciadas:
 *   • bpm_processes    — Mapeamento de processos institucionais BPMN 2.0
 *   • bpm_tasks        — Tarefas e cartões Kanban avançados (SLA, checklists, anexos)
 *   • bpm_approvals    — Soluções de aprovação hierárquica e assinaturas
 *   • bpm_logs         — Audit trail imutável de transições de fluxo
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type TaskStage = 'IDEA' | 'WRITING' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
export type TaskPriority = 0 | 1 | 2; // 0: Baixa, 1: Média, 2: Alta

export interface BpmChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface BpmTask {
  id?: string;
  code: string;               // ex: 'TASK-2024-001'
  title: string;
  description?: string;
  stage: TaskStage;
  priority: TaskPriority;
  assignedTo?: string;        // Nome ou e-mail
  department?: string;        // ex: 'Projetos', 'Financeiro', 'Comunicação'
  dueDate?: string;           // YYYY-MM-DD (SLA)
  slaStatus?: 'OK' | 'WARNING' | 'EXPIRED';
  checklist?: BpmChecklistItem[];
  tags?: string[];
  estimatedHours?: number;
  loggedHours?: number;
  requiresApproval?: boolean;
  approvalStatus?: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  approvedBy?: string;
  attachmentsCount?: number;
  updatedAt?: unknown;
}

export interface BpmProcessDefinition {
  id?: string;
  code: string;               // ex: 'PROC-001'
  name: string;
  department: string;
  description: string;
  owner: string;
  slaHoursTarget: number;
  active: boolean;
  version: string;            // ex: 'v1.2'
  updatedAt?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

export function calculateSlaStatus(dueDate?: string): 'OK' | 'WARNING' | 'EXPIRED' {
  if (!dueDate) return 'OK';
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const diffHours = (due - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'EXPIRED';
  if (diffHours < 48) return 'WARNING';
  return 'OK';
}

// ── Service ────────────────────────────────────────────────────────────────

export const BpmWorkflowEnterpriseService = {

  // ── Tasks / Kanban ───────────────────────────────────────────────────────

  async getTasks(): Promise<BpmTask[]> {
    const q = query(collection(db, 'bpm_tasks'), orderBy('priority', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<BpmTask>(snap);
  },

  async saveTask(data: BpmTask): Promise<string> {
    const sla = calculateSlaStatus(data.dueDate);
    const payload = {
      ...data,
      slaStatus: sla,
      updatedAt: serverTimestamp(),
    };

    if (data.id) {
      const { id, ...rest } = payload;
      await setDoc(doc(db, 'bpm_tasks', id), rest, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'bpm_tasks'), payload);
    return ref.id;
  },

  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(db, 'bpm_tasks', id));
  },

  async moveTaskStage(taskId: string, stage: TaskStage): Promise<void> {
    const ref = doc(db, 'bpm_tasks', taskId);
    await setDoc(ref, { stage, updatedAt: serverTimestamp() }, { merge: true });
  },

  // ── Processes Definitions ─────────────────────────────────────────────────

  async getProcesses(): Promise<BpmProcessDefinition[]> {
    const q = query(collection(db, 'bpm_processes'), orderBy('name'));
    const snap = await getDocs(q);
    return mapDocs<BpmProcessDefinition>(snap);
  },

  async saveProcess(data: BpmProcessDefinition): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'bpm_processes', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'bpm_processes'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultTasks: Omit<BpmTask, 'id'>[] = [
      {
        code: 'TASK-001',
        title: 'Elaboração do Relatório de Impacto Social 2024',
        description: 'Compilar indicadores dos programas sociais e laudos de auditoria.',
        stage: 'WRITING',
        priority: 2,
        assignedTo: 'Dra. Mariana Silva',
        department: 'Projetos',
        dueDate: '2024-12-15',
        slaStatus: 'OK',
        checklist: [
          { id: '1', title: 'Coletar dados de beneficiários', completed: true },
          { id: '2', title: 'Validar balanço com a equipe financeira', completed: true },
          { id: '3', title: 'Revisão final do CDE', completed: false },
        ],
        tags: ['Impacto', 'Auditoria'],
        estimatedHours: 40,
        loggedHours: 28,
        requiresApproval: true,
        approvalStatus: 'PENDENTE',
      },
      {
        code: 'TASK-002',
        title: 'Renovação do Convenio de Parceria Sustentável',
        description: 'Enviar documentação atualizada para renovação de aporte anual.',
        stage: 'REVIEW',
        priority: 1,
        assignedTo: 'Carlos Eduardo',
        department: 'Parcerias',
        dueDate: '2024-11-30',
        slaStatus: 'WARNING',
        checklist: [
          { id: '1', title: 'Certidões Negativas CND', completed: true },
          { id: '2', title: 'Minuta de Termo de Fomento', completed: false },
        ],
        tags: ['Convênio', 'Jurídico'],
        estimatedHours: 20,
        loggedHours: 12,
        requiresApproval: false,
      },
    ];

    for (const task of defaultTasks) {
      const ref = doc(collection(db, 'bpm_tasks'));
      batch.set(ref, { ...task, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
