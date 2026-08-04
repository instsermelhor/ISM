/**
 * socialNetworksService.ts
 * ─────────────────────────
 * CRUD completo para a colecção `social_networks`.
 * Cada documento representa uma rede social configurável pelo admin.
 *
 * Colecção Firestore: social_networks/{id}
 * Lida pelo site em: src/hooks/useRealtimeSocialNetworks.ts
 */

import {
  collection, doc, getDocs, setDoc, deleteDoc,
  query, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface SocialNetwork {
  id: string;
  /** Chave da plataforma (string livre — sem enum fixo) */
  platform: string;
  /** Nome para exibição: "Instagram", "Bluesky", etc. */
  name: string;
  /** URL completa da rede */
  url: string;
  /** Ordem de exibição (menor = primeiro) */
  order: number;
  /** Visível no site público */
  isActive: boolean;
  /** Abrir em nova aba */
  openInNewTab: boolean;
  /** Exibir no cabeçalho (Header) */
  showInHeader: boolean;
  /** Exibir no rodapé (Footer) */
  showInFooter: boolean;
  /** Exibir na landing page */
  showInLanding: boolean;
  /** Timestamp da última actualização */
  updatedAt?: unknown;
}

// ── Seed inicial (redes canónicas do Instituto, handles correctos) ─────────────

export const SOCIAL_NETWORKS_SEED: Omit<SocialNetwork, 'updatedAt'>[] = [
  {
    id: 'instagram',
    platform: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/instsermelhor',
    order: 1,
    isActive: true,
    openInNewTab: true,
    showInHeader: false,
    showInFooter: true,
    showInLanding: true,
  },
  {
    id: 'facebook',
    platform: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/institutosermelhor',
    order: 2,
    isActive: true,
    openInNewTab: true,
    showInHeader: false,
    showInFooter: true,
    showInLanding: true,
  },
  {
    id: 'linkedin',
    platform: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/institutosermelhor',
    order: 3,
    isActive: true,
    openInNewTab: true,
    showInHeader: false,
    showInFooter: true,
    showInLanding: false,
  },
  {
    id: 'x',
    platform: 'x',
    name: 'X (Twitter)',
    url: 'https://x.com/instsermelhor',
    order: 4,
    isActive: true,
    openInNewTab: true,
    showInHeader: false,
    showInFooter: true,
    showInLanding: false,
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

const COL = 'social_networks';

export const SocialNetworksService = {

  /** Busca todas as redes ordenadas por `order` */
  async getAll(): Promise<SocialNetwork[]> {
    const snap = await getDocs(query(collection(db, COL), orderBy('order')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialNetwork));
  },

  /** Cria ou actualiza uma rede social */
  async save(network: SocialNetwork): Promise<void> {
    const { id, ...data } = network;
    await setDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  },

  /** Guarda múltiplas redes em batch (re-ordenação) */
  async saveAll(networks: SocialNetwork[]): Promise<void> {
    const batch = writeBatch(db);
    networks.forEach(n => {
      const { id, ...data } = n;
      batch.set(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
  },

  /** Remove uma rede social */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },

  /**
   * Verifica se a colecção já foi inicializada.
   * Se estiver vazia, faz o seed com as redes canónicas.
   */
  async getOrSeed(): Promise<SocialNetwork[]> {
    const existing = await this.getAll();
    if (existing.length > 0) return existing;

    // Seed inicial
    const batch = writeBatch(db);
    SOCIAL_NETWORKS_SEED.forEach(n => {
      batch.set(doc(db, COL, n.id), { ...n, updatedAt: serverTimestamp() });
    });
    await batch.commit();
    return this.getAll();
  },

  /** Gera um ID único para uma nova rede */
  generateId(platform: string): string {
    return `${platform}_${Date.now()}`;
  },
};
