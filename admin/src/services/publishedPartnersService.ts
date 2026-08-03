/**
 * publishedPartnersService.ts
 * ───────────────────────────
 * CRUD para parceiros/patrocinadores exibidos no site institucional.
 * Coleção Firestore: partners (ordenada por campo "order")
 *
 * Lido pelo site em: src/services/data.ts
 */

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PublishedPartnerData {
  id?: string;
  order: number;
  name: string;
  category: 'GLOBAL' | 'ESTRATEGICO' | 'INSTITUCIONAL' | 'TECNICO';
  logoUrl: string;
  websiteUrl: string;
  description?: string;
  isPublished: boolean;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  updatedAt?: unknown;
}

export const PARTNERS_SEED: Omit<PublishedPartnerData, 'id'>[] = [
  { order: 1, name: 'Nações Unidas (ONU)', category: 'GLOBAL', logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&q=80', websiteUrl: 'https://un.org', description: 'Parceiro em Objetivos de Desenvolvimento Sustentável.', isPublished: true, tier: 'TIER_1' },
  { order: 2, name: 'Fundação Global Clima', category: 'ESTRATEGICO', logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80', websiteUrl: 'https://example.org', description: 'Financiamento de bolsas ambientais.', isPublished: true, tier: 'TIER_1' },
  { order: 3, name: 'Aliança para Redução da Pobreza', category: 'INSTITUCIONAL', logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80', websiteUrl: 'https://example.org', description: 'Desenvolvimento social e apoio psicossocial.', isPublished: true, tier: 'TIER_2' },
];

const COL = () => collection(db, 'partners');

export const PublishedPartnersService = {
  async getAll(): Promise<PublishedPartnerData[]> {
    try {
      const q = query(COL(), orderBy('order'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublishedPartnerData));
    } catch {
      return [];
    }
  },

  async getPublished(): Promise<PublishedPartnerData[]> {
    try {
      const all = await PublishedPartnersService.getAll();
      return all.filter(p => p.isPublished);
    } catch {
      return [];
    }
  },

  async getOrSeed(): Promise<PublishedPartnerData[]> {
    const items = await PublishedPartnersService.getAll();
    if (items.length > 0) return items;
    await PublishedPartnersService.seedDefaults();
    return PublishedPartnersService.getAll();
  },

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    PARTNERS_SEED.forEach((item) => {
      const ref = doc(COL());
      batch.set(ref, { ...item, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  async create(data: Omit<PublishedPartnerData, 'id'>): Promise<string> {
    const ref = await addDoc(COL(), { ...data, updatedAt: serverTimestamp() });
    return ref.id;
  },

  async update(id: string, data: Partial<PublishedPartnerData>): Promise<void> {
    await updateDoc(doc(db, 'partners', id), { ...data, updatedAt: serverTimestamp() });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'partners', id));
  },
};
