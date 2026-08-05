/**
 * fundraisingEnterprise.ts  — Compatibility Stub (R009)
 * ───────────────────────────────────────────────────────
 * Re-exports the service used by DonationEditorPage.tsx.
 * Backend: Firestore collection `donation_campaigns`.
 */

import {
  collection, getDocs, addDoc, updateDoc, doc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────

export interface FundraisingCampaign {
  id?: string;
  title: string;
  description?: string;
  goalAmount?: number;
  raisedAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  imageUrl?: string;
  order?: number;
  updatedAt?: unknown;
  createdAt?: unknown;
}

export interface RecurringSubscription {
  id?: string;
  donorName?: string;
  donorEmail?: string;
  amount?: number;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  startDate?: string;
  updatedAt?: unknown;
}

// ── Seed Defaults ─────────────────────────────────────────────────────────

const SEED_CAMPAIGNS: Omit<FundraisingCampaign, 'id'>[] = [
  {
    title: 'Fundo Educação para o Futuro',
    description: 'Campanha de captação para bolsas e laboratórios digitais.',
    goalAmount: 150000,
    raisedAmount: 0,
    isActive: true,
    order: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

const COL = () => collection(db, 'donation_campaigns');
const SUB_COL = () => collection(db, 'recurring_subscriptions');

// ── Service ───────────────────────────────────────────────────────────────

export const FundraisingEnterpriseService = {
  async getCampaigns(): Promise<FundraisingCampaign[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FundraisingCampaign));
    } catch {
      return [];
    }
  },

  async seedDefaults(): Promise<void> {
    try {
      for (const camp of SEED_CAMPAIGNS) {
        await addDoc(COL(), camp);
      }
    } catch (e) {
      console.warn('[FundraisingEnterpriseService] seedDefaults error:', e);
    }
  },

  async getSubscriptions(): Promise<RecurringSubscription[]> {
    try {
      const snap = await getDocs(SUB_COL());
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as RecurringSubscription));
    } catch {
      return [];
    }
  },

  async saveCampaign(camp: FundraisingCampaign): Promise<void> {
    try {
      const { id, ...data } = camp;
      const payload = { ...data, updatedAt: serverTimestamp() };
      if (id) {
        await updateDoc(doc(db, 'donation_campaigns', id), payload);
      } else {
        await addDoc(COL(), { ...payload, createdAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('[FundraisingEnterpriseService] saveCampaign error:', e);
      throw e;
    }
  },
};
