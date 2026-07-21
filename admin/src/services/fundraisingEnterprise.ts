/**
 * FundraisingEnterpriseService
 * ─────────────────────────────
 * Serviço de dados Enterprise para Campanhas de Captação, Doações Recorrentes, LTV/CAC e Certificados.
 *
 * Coleções gerenciadas:
 *   • fundraising_campaigns — Campanhas institucionais com metas e ODS
 *   • recurring_subscriptions — Assinaturas de doação recorrente (PIX/Cartão)
 *   • donor_impact_certificates — Certificados de impacto emitidos para doadores
 */

import {
  collection, addDoc, getDoc, setDoc, getDocs,
  doc, deleteDoc, query, orderBy, where,
  serverTimestamp, writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type CampaignStatus = 'RASCUNHO' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA' | 'ARQUIVADA';
export type RecurrenceFrequency = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export interface FundraisingCampaign {
  id?: string;
  code: string;               // ex: 'CAMP-2024-01'
  title: string;
  subtitle?: string;
  slug: string;
  targetAmount: number;       // Meta em R$
  raisedAmount: number;       // Arrecadado em R$
  donorCount: number;
  startDate: string;          // YYYY-MM-DD
  endDate?: string;           // YYYY-MM-DD
  odsTags?: string[];         // ex: ['ODS 1', 'ODS 4']
  programId?: string;
  bannerUrl?: string;
  status: CampaignStatus;
  matchingDonationEnabled?: boolean; // Empresa dobrando a doação
  matchingPartnerName?: string;
  updatedAt?: unknown;
}

export interface RecurringSubscription {
  id?: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  frequency: RecurrenceFrequency;
  paymentMethod: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO';
  status: 'ATIVA' | 'PAUSADA' | 'INADIMPLENTE' | 'CANCELADA';
  nextBillingDate: string;     // YYYY-MM-DD
  startedAt: string;
  updatedAt?: unknown;
}

export interface DonorImpactCertificate {
  id?: string;
  donorId: string;
  donorName: string;
  year: number;
  totalDonated: number;
  impactMetrics: { metric: string; value: string }[];
  certificateUrl?: string;
  issuedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── Service ────────────────────────────────────────────────────────────────

export const FundraisingEnterpriseService = {

  // ── Campaigns ────────────────────────────────────────────────────────────

  async getCampaigns(): Promise<FundraisingCampaign[]> {
    const q = query(collection(db, 'fundraising_campaigns'), orderBy('startDate', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<FundraisingCampaign>(snap);
  },

  async saveCampaign(data: FundraisingCampaign): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'fundraising_campaigns', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'fundraising_campaigns'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async deleteCampaign(id: string): Promise<void> {
    await deleteDoc(doc(db, 'fundraising_campaigns', id));
  },

  // ── Recurring Subscriptions ───────────────────────────────────────────────

  async getSubscriptions(): Promise<RecurringSubscription[]> {
    const q = query(collection(db, 'recurring_subscriptions'), orderBy('startedAt', 'desc'));
    const snap = await getDocs(q);
    return mapDocs<RecurringSubscription>(snap);
  },

  async saveSubscription(data: RecurringSubscription): Promise<string> {
    if (data.id) {
      const { id, ...rest } = data;
      await setDoc(doc(db, 'recurring_subscriptions', id), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    }
    const ref = await addDoc(collection(db, 'recurring_subscriptions'), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  // ── Seed Defaults ────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);

    const defaultCampaigns: Omit<FundraisingCampaign, 'id'>[] = [
      {
        code: 'CAMP-2024-01',
        title: 'Campanha Fundo de Sustentabilidade Perpétua 2025',
        subtitle: 'Garanta a independência financeira dos programas educacionais e de conservação.',
        slug: 'fundo-perpetuo-2025',
        targetAmount: 5000000,
        raisedAmount: 3750000,
        donorCount: 1420,
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        odsTags: ['ODS 4', 'ODS 13', 'ODS 17'],
        status: 'ATIVA',
        matchingDonationEnabled: true,
        matchingPartnerName: 'Fundação Itaú Social',
      },
      {
        code: 'CAMP-2024-02',
        title: 'Fundo Emergencial Regeneração da Amazônia',
        subtitle: 'Monitoramento via satélite e reflorestamento de biomas degradados.',
        slug: 'emergencia-amazonia',
        targetAmount: 2000000,
        raisedAmount: 1480000,
        donorCount: 890,
        startDate: '2024-03-01',
        odsTags: ['ODS 13', 'ODS 15'],
        status: 'ATIVA',
      },
    ];

    for (const camp of defaultCampaigns) {
      const ref = doc(collection(db, 'fundraising_campaigns'));
      batch.set(ref, { ...camp, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  },
};
