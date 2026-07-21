/**
 * CMS Version Control Service
 * ────────────────────────────
 * Gerencia o histórico de versões de todos os módulos do CMS.
 * Arquitetura: Coleção Firestore `cms_versions` (Append-Only).
 *
 * Módulos suportados:
 *   hero | about | programs | donation | seo | blog | team | governance
 */

import {
  collection, addDoc, query, where, orderBy,
  getDocs, limit, serverTimestamp, doc, updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export type CMSModuleId =
  | 'hero' | 'about' | 'programs' | 'donation'
  | 'seo' | 'blog' | 'team' | 'governance' | 'partners';

export type CMSVersionStatus =
  | 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export interface CMSVersion {
  id?: string;
  moduleId: CMSModuleId;
  version: number;
  status: CMSVersionStatus;
  content: Record<string, unknown>;
  createdBy: string;
  createdAt?: unknown;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  comment?: string;
}

const COLLECTION = 'cms_versions';

export const CMSVersionService = {

  /**
   * Salva uma nova versão de rascunho do módulo.
   * Cada salvamento cria um novo documento (Append-Only).
   */
  async saveDraft(
    moduleId: CMSModuleId,
    content: Record<string, unknown>,
    userId: string,
    comment?: string
  ): Promise<string> {
    // Busca o número de versão atual para incrementar
    const existing = await CMSVersionService.getLatestVersion(moduleId);
    const nextVersion = existing ? existing.version + 1 : 1;

    const versionData: Omit<CMSVersion, 'id'> = {
      moduleId,
      version: nextVersion,
      status: 'DRAFT',
      content,
      createdBy: userId,
      createdAt: serverTimestamp(),
      publishedAt: null,
      scheduledFor: null,
      comment: comment || `Rascunho v${nextVersion}`,
    };

    const docRef = await addDoc(collection(db, COLLECTION), versionData);
    return docRef.id;
  },

  /**
   * Publica uma versão existente, atualizando o status para PUBLISHED.
   */
  async publish(versionDocId: string): Promise<void> {
    const ref = doc(db, COLLECTION, versionDocId);
    await updateDoc(ref, {
      status: 'PUBLISHED' as CMSVersionStatus,
      publishedAt: new Date().toISOString(),
    });
  },

  /**
   * Retorna o histórico das últimas versões de um módulo (mais recentes primeiro).
   */
  async getHistory(moduleId: CMSModuleId, limitCount = 10): Promise<CMSVersion[]> {
    const q = query(
      collection(db, COLLECTION),
      where('moduleId', '==', moduleId),
      orderBy('version', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CMSVersion));
  },

  /**
   * Retorna a última versão publicada de um módulo.
   */
  async getPublished(moduleId: CMSModuleId): Promise<CMSVersion | null> {
    const q = query(
      collection(db, COLLECTION),
      where('moduleId', '==', moduleId),
      where('status', '==', 'PUBLISHED'),
      orderBy('version', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as CMSVersion;
  },

  /**
   * Retorna a versão mais recente (qualquer status) de um módulo.
   */
  async getLatestVersion(moduleId: CMSModuleId): Promise<CMSVersion | null> {
    const q = query(
      collection(db, COLLECTION),
      where('moduleId', '==', moduleId),
      orderBy('version', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as CMSVersion;
  },

  /** Arquiva uma versão. */
  async archive(versionDocId: string): Promise<void> {
    const ref = doc(db, COLLECTION, versionDocId);
    await updateDoc(ref, { status: 'ARCHIVED' as CMSVersionStatus });
  },

  /** Label de status em português para UI. */
  statusLabel(status: CMSVersionStatus): string {
    const map: Record<CMSVersionStatus, string> = {
      DRAFT: 'Rascunho',
      REVIEW: 'Em Revisão',
      SCHEDULED: 'Agendado',
      PUBLISHED: 'Publicado',
      ARCHIVED: 'Arquivado',
    };
    return map[status] ?? status;
  },

  /** Cor de badge por status. */
  statusColor(status: CMSVersionStatus): string {
    const map: Record<CMSVersionStatus, string> = {
      DRAFT: '#f59e0b',
      REVIEW: '#3b82f6',
      SCHEDULED: '#8b5cf6',
      PUBLISHED: '#16a34a',
      ARCHIVED: '#9ca3af',
    };
    return map[status] ?? '#9ca3af';
  },
};
