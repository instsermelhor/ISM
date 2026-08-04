/**
 * useRealtimeSocialNetworks.ts
 * ─────────────────────────────
 * Hook React que escuta a colecção `social_networks` em tempo real via
 * Firestore onSnapshot. Filtra por `isActive == true` e ordena por `order`.
 *
 * Requer índice composto em firestore.indexes.json:
 *   social_networks [isActive ASC, order ASC]  (já adicionado)
 *
 * Uso:
 *   const allActive = useRealtimeSocialNetworks();
 *   const footerNets = useRealtimeSocialNetworks({ showInFooter: true });
 *   const headerNets = useRealtimeSocialNetworks({ showInHeader: true });
 */

import { useState, useEffect } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
} from 'firebase/firestore';

// Importação condicional do firebase — graciosamente desactivado em ambiente sem .env
let db: ReturnType<typeof import('firebase/firestore').getFirestore> | null = null;
let FIREBASE_ENABLED = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { db: fireDb, FIREBASE_ENABLED: fe } = require('../lib/firebase');
  db = fireDb;
  FIREBASE_ENABLED = fe;
} catch {
  FIREBASE_ENABLED = false;
}

export interface SocialNetworkItem {
  id: string;
  platform: string;
  name: string;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  showInLanding: boolean;
}

export interface SocialNetworkFilter {
  showInFooter?: boolean;
  showInHeader?: boolean;
  showInLanding?: boolean;
}

/**
 * Hook principal. Escuta `social_networks` em tempo real,
 * filtrado por `isActive==true` e opcionalmente por localização (footer/header/landing).
 */
export function useRealtimeSocialNetworks(
  filter?: SocialNetworkFilter,
): SocialNetworkItem[] {
  const [items, setItems] = useState<SocialNetworkItem[]>([]);

  useEffect(() => {
    if (!FIREBASE_ENABLED || !db) return;

    try {
      const constraints: ReturnType<typeof where>[] = [
        where('isActive', '==', true),
      ];

      if (filter?.showInFooter !== undefined) {
        constraints.push(where('showInFooter', '==', filter.showInFooter));
      }
      if (filter?.showInHeader !== undefined) {
        constraints.push(where('showInHeader', '==', filter.showInHeader));
      }
      if (filter?.showInLanding !== undefined) {
        constraints.push(where('showInLanding', '==', filter.showInLanding));
      }

      const q = query(
        collection(db!, 'social_networks'),
        ...constraints,
        orderBy('order'),
      );

      const unsub = onSnapshot(
        q,
        snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialNetworkItem))),
        err => console.error('[useRealtimeSocialNetworks]:', err),
      );

      return () => unsub();
    } catch (err) {
      console.error('[useRealtimeSocialNetworks] setup error:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.showInFooter, filter?.showInHeader, filter?.showInLanding]);

  return items;
}
