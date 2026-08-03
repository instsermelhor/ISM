/**
 * impactMetricsService.ts
 * ────────────────────────
 * CRUD para as métricas de impacto do site institucional.
 * Coleção Firestore: impact_metrics (ordenada por campo "order")
 *
 * Lido pelo site em: src/services/data.ts → InstitutionalService.getMetrics()
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ImpactMetricData {
  id?: string;
  order: number;
  /** String numérica ex: "32000", "78", "4.85" */
  value: string;
  suffix: string;
  prefix: string;
  label: string;
  sublabel: string;
  /** Identificador do ícone: "users" | "map-pin" | "handshake" | "calendar" | "trending-up" | "file-text" */
  iconKey: string;
  /** Cor hex ex: "#1E3A8A" */
  color: string;
  /** Número de casas decimais para animação */
  decimals: number;
  updatedAt?: unknown;
}

export const METRICS_SEED: Omit<ImpactMetricData, 'id'>[] = [
  { order: 1, value: '32000', suffix: '+', prefix: '', label: 'Beneficiários Diretos', sublabel: 'Famílias e indivíduos assistidos anualmente', iconKey: 'users', color: '#1E3A8A', decimals: 0 },
  { order: 2, value: '78', suffix: '', prefix: '', label: 'Municípios', sublabel: 'Presença em todo o território nacional', iconKey: 'map-pin', color: '#D97706', decimals: 0 },
  { order: 3, value: '50', suffix: '+', prefix: '', label: 'Parceiros Globais', sublabel: 'Organizações, empresas e governos', iconKey: 'handshake', color: '#15803D', decimals: 0 },
  { order: 4, value: '15', suffix: '+', prefix: '', label: 'Anos de Impacto', sublabel: 'Construindo futuro desde 2007', iconKey: 'calendar', color: '#C2410C', decimals: 0 },
  { order: 5, value: '4.85', suffix: '', prefix: 'R$', label: 'SROI por Real Investido', sublabel: 'Retorno social comprovado por metodologia SROI', iconKey: 'trending-up', color: '#16a34a', decimals: 2 },
  { order: 6, value: '100', suffix: '%', prefix: '', label: 'Transparência', sublabel: 'Todas as contas auditadas e publicadas', iconKey: 'file-text', color: '#6366f1', decimals: 0 },
];

const COL = () => collection(db, 'impact_metrics');

export const ImpactMetricsService = {
  async getAll(): Promise<ImpactMetricData[]> {
    const q = query(COL(), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ImpactMetricData));
  },

  async getOrSeed(): Promise<ImpactMetricData[]> {
    const data = await ImpactMetricsService.getAll();
    if (data.length > 0) return data;
    await ImpactMetricsService.seedDefaults();
    return ImpactMetricsService.getAll();
  },

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    METRICS_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, { ...item, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  async create(data: Omit<ImpactMetricData, 'id'>): Promise<string> {
    const ref = await addDoc(COL(), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async update(id: string, data: Partial<ImpactMetricData>): Promise<void> {
    await updateDoc(doc(db, 'impact_metrics', id), { ...data, updatedAt: serverTimestamp() });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'impact_metrics', id));
  },

  async saveAll(metrics: ImpactMetricData[]): Promise<void> {
    const batch = writeBatch(db);
    metrics.forEach((m) => {
      if (m.id) {
        const { id, ...rest } = m;
        batch.update(doc(db, 'impact_metrics', id), { ...rest, updatedAt: serverTimestamp() });
      }
    });
    await batch.commit();
  },
};
