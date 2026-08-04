/**
 * useRealtimeContent.ts
 * ─────────────────────
 * Hooks para escutar atualizações em tempo real no Firestore
 * e refletir imediatamente no site público sem recarregar a página.
 *
 * Utiliza Firestore onSnapshot (WebSocket nativo do Firebase).
 * Alterações feitas no painel admin são refletidas em ~500ms no site.
 *
 * Coleções cobertas (14 no total):
 *  Documentos únicos: hero_section/main, site_navigation/main, site_footer/main,
 *                     seo_settings/main, institutional_page/main,
 *                     services_page/main, donation_section/main
 *  Coleções: impact_metrics, pillars, programs, blog_posts (publicados),
 *            partners (publicados), value_blocks, governance_instances,
 *            governance_members, timeline_milestones
 */

import { useEffect, useState } from 'react';
import {
  doc, onSnapshot, collection, query,
  orderBy, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const FIREBASE_ENABLED = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// Primitivos genéricos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escuta um documento único em tempo real.
 * @example useRealtimeDocument<HeroSectionData>('hero_section', 'main')
 */
export function useRealtimeDocument<T>(collectionName: string, docId: string): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    try {
      const unsub = onSnapshot(
        doc(db, collectionName, docId),
        (snap) => {
          if (snap.exists()) setData(snap.data() as T);
          else setData(null);
        },
        (err) => console.error(`[RealtimeDoc] ${collectionName}/${docId}:`, err),
      );
      return () => unsub();
    } catch (err) {
      console.error('[RealtimeDoc] setup error:', err);
    }
  }, [collectionName, docId]);

  return data;
}

/**
 * Escuta uma coleção inteira em tempo real, ordenada por campo.
 * @example useRealtimeCollection<ImpactMetricData>('impact_metrics', 'order')
 */
export function useRealtimeCollection<T>(
  collectionName: string,
  orderByField = 'order',
): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    try {
      const q = query(collection(db, collectionName), orderBy(orderByField));
      const unsub = onSnapshot(
        q,
        (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))),
        (err) => console.error(`[RealtimeCollection] ${collectionName}:`, err),
      );
      return () => unsub();
    } catch (err) {
      console.error('[RealtimeCollection] setup error:', err);
    }
  }, [collectionName, orderByField]);

  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks específicos para cada coleção/documento do site institucional
// ─────────────────────────────────────────────────────────────────────────────

/** hero_section/main — Seção Hero da capa */
export const useRealtimeHero = <T>() =>
  useRealtimeDocument<T>('hero_section', 'main');

/** site_navigation/main — Menu do header */
export const useRealtimeNavigation = <T>() =>
  useRealtimeDocument<T>('site_navigation', 'main');

/** site_footer/main — Dados do rodapé */
export const useRealtimeFooter = <T>() =>
  useRealtimeDocument<T>('site_footer', 'main');

/** seo_settings/main — Configurações SEO */
export const useRealtimeSeoSettings = <T>() =>
  useRealtimeDocument<T>('seo_settings', 'main');

/** institutional_page/main — Página institucional (missão, visão, etc.) */
export const useRealtimeInstitutionalPage = <T>() =>
  useRealtimeDocument<T>('institutional_page', 'main');

/** services_page/main — Configurações de transparência, parcerias, etc. */
export const useRealtimeServicesPage = <T>() =>
  useRealtimeDocument<T>('services_page', 'main');

/** donation_section/main — Seção de doações */
export const useRealtimeDonationSection = <T>() =>
  useRealtimeDocument<T>('donation_section', 'main');

/** impact_metrics — Métricas de impacto (ordenado por 'order') */
export const useRealtimeMetrics = <T>() =>
  useRealtimeCollection<T>('impact_metrics', 'order');

/** pillars — Pilares institucionais (ordenado por 'order') */
export const useRealtimePillars = <T>() =>
  useRealtimeCollection<T>('pillars', 'order');

/** value_blocks — Blocos de valores (ordenado por 'order') */
export const useRealtimeValueBlocks = <T>() =>
  useRealtimeCollection<T>('value_blocks', 'order');

/** governance_instances — Instâncias de governança (ordenado por 'order') */
export const useRealtimeGovernanceInstances = <T>() =>
  useRealtimeCollection<T>('governance_instances', 'order');

/** governance_members — Membros dos conselhos (ordenado por 'order') */
export const useRealtimeGovernanceMembers = <T>() =>
  useRealtimeCollection<T>('governance_members', 'order');

/** timeline_milestones — Marcos históricos (ordenado por 'year') */
export const useRealtimeTimeline = <T>() =>
  useRealtimeCollection<T>('timeline_milestones', 'year');

/** programs — Programas publicados em tempo real (filtro server-side por isPublished)
 * Requer índice composto: programs [isPublished ASC, order ASC]
 */
export function useRealtimePrograms<T>(): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    try {
      const q = query(
        collection(db, 'programs'),
        where('isPublished', '==', true),
        orderBy('order'),
      );
      const unsub = onSnapshot(
        q,
        (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))),
        (err) => console.error('[RealtimePrograms]:', err),
      );
      return () => unsub();
    } catch (err) {
      console.error('[RealtimePrograms] setup error:', err);
    }
  }, []);

  return items;
}

/**
 * blog_posts — Posts publicados em tempo real
 * Filtra por status == 'PUBLISHED' e ordena por publishedAt desc.
 * Requer índice composto no Firestore: blog_posts [status ASC, publishedAt DESC]
 */
export function useRealtimeBlogPosts<T>(): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    try {
      const q = query(
        collection(db, 'blog_posts'),
        where('status', '==', 'PUBLISHED'),
        orderBy('publishedAt', 'desc'),
      );
      const unsub = onSnapshot(
        q,
        (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))),
        (err) => console.error('[RealtimeBlogPosts]:', err),
      );
      return () => unsub();
    } catch (err) {
      console.error('[RealtimeBlogPosts] setup error:', err);
    }
  }, []);

  return items;
}

/**
 * partners — Parceiros publicados em tempo real
 * Filtra por isPublished == true e ordena por order asc.
 * Requer índice composto no Firestore: partners [isPublished ASC, order ASC]
 */
export function useRealtimePublishedPartners<T>(): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    try {
      const q = query(
        collection(db, 'partners'),
        where('isPublished', '==', true),
        orderBy('order'),
      );
      const unsub = onSnapshot(
        q,
        (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as T))),
        (err) => console.error('[RealtimePartners]:', err),
      );
      return () => unsub();
    } catch (err) {
      console.error('[RealtimePartners] setup error:', err);
    }
  }, []);

  return items;
}
