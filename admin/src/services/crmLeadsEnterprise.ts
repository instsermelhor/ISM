/**
 * crmLeadsEnterprise.ts  — Compatibility Stub (R009)
 * ───────────────────────────────────────────────────
 * Re-exports the service used by LeadsPage.tsx.
 * Backend: Firestore collection `leads`.
 */

import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────

export type LeadStage =
  | 'NOVO'
  | 'QUALIFICADO'
  | 'EM_NUTRICAO'
  | 'APRESENTACAO'
  | 'PROPOSTA'
  | 'CONVERTIDO'
  | 'ARQUIVADO';

export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export interface EnterpriseLead {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  stage: LeadStage;
  temperature?: LeadTemperature;
  score?: number;
  notes?: string;
  source?: string;
  tags?: string[];
  assignedTo?: string;
  nextContactDate?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── Seed Defaults ─────────────────────────────────────────────────────────

const SEED_LEADS: Omit<EnterpriseLead, 'id'>[] = [
  {
    name: 'Maria Souza',
    email: 'maria@exemplo.org',
    organization: 'Instituto Futuro',
    stage: 'NOVO',
    temperature: 'WARM',
    score: 55,
    source: 'Site Institucional',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'Carlos Mendes',
    email: 'carlos@empresa.com',
    organization: 'Empresa ESG Ltda',
    stage: 'QUALIFICADO',
    temperature: 'HOT',
    score: 85,
    source: 'Indicação',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

const COL = () => collection(db, 'leads');

// ── Service ───────────────────────────────────────────────────────────────

export const CrmLeadsEnterpriseService = {
  async getLeads(): Promise<EnterpriseLead[]> {
    try {
      const q = query(COL(), orderBy('createdAt'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as EnterpriseLead));
    } catch {
      return [];
    }
  },

  async seedDefaults(): Promise<void> {
    try {
      for (const lead of SEED_LEADS) {
        await addDoc(COL(), lead);
      }
    } catch (e) {
      console.warn('[CrmLeadsEnterpriseService] seedDefaults error:', e);
    }
  },

  async saveLead(lead: EnterpriseLead): Promise<void> {
    try {
      const { id, ...data } = lead;
      const payload = { ...data, updatedAt: serverTimestamp() };
      if (id) {
        await updateDoc(doc(db, 'leads', id), payload);
      } else {
        await addDoc(COL(), { ...payload, createdAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('[CrmLeadsEnterpriseService] saveLead error:', e);
      throw e;
    }
  },
};
