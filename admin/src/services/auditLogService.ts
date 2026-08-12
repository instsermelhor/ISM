/**
 * auditLogService.ts
 * ──────────────────
 * NC-017/018 — Serviço de auditoria REAL via Firestore.
 * Substitui o AuditService mock de api.ts que retornava dados fictícios.
 *
 * Coleção Firestore: audit_logs (IMUTÁVEL — sem update/delete por regra)
 * Schema obrigatório: { action, userEmail, timestamp, ...campos opcionais }
 *
 * LGPD Art. 6º, X — Responsabilização e Prestação de Contas.
 */

import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'PUBLISH'
  | 'ARCHIVE'
  | 'PASSWORD_CHANGE'
  | 'USER_INVITE'
  | 'USER_DELETE'
  | 'SETTINGS_CHANGE';

export interface AuditLogEntry {
  id: string;
  action: AuditAction | string;
  userEmail: string;
  userName?: string;
  userAvatar?: string;
  entity?: string;       // ex: 'blog_posts', 'governance_members'
  entityId?: string;     // ID do documento afetado
  description?: string;  // Descrição legível da ação
  ipAddress?: string;    // IP do cliente (quando disponível)
  timestamp: string;     // ISO string (convertido do Firestore Timestamp)
  // Compatibilidade com tipo AuditLog de ../types
  createdAt: string;
}

export interface AuditLogPage {
  data: AuditLogEntry[];
  total: number;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

const COL = () => collection(db, 'audit_logs');
const PAGE_SIZE = 15;

// Cursor cache para paginação: mapeia nº de página → último documento da página anterior
const cursorCache = new Map<number, QueryDocumentSnapshot<DocumentData>>();

// ─── Serviço ──────────────────────────────────────────────────────────────────

export const AuditLogService = {
  /**
   * Busca logs com paginação cursor-based e filtro de action.
   * NC-017: substituir AuditService.getLogs() mock em AuditPage.tsx.
   */
  async getPage(
    page: number = 1,
    pageSize: number = PAGE_SIZE,
    filterAction?: string
  ): Promise<{ data: AuditLogEntry[]; total: number }> {
    try {
      // Query base: ordenada por timestamp DESC
      const constraints: Parameters<typeof query>[1][] = [
        orderBy('timestamp', 'desc'),
        limit(pageSize),
      ];

      // Filtro opcional por tipo de ação
      if (filterAction && filterAction !== 'ALL') {
        constraints.unshift(where('action', '==', filterAction));
      }

      // Paginação: usar cursor do cache se disponível
      if (page > 1 && cursorCache.has(page - 1)) {
        constraints.push(startAfter(cursorCache.get(page - 1)!));
      }

      const q = query(COL(), ...constraints);
      const snap = await getDocs(q);

      // Salvar cursor desta página para a próxima
      if (snap.docs.length > 0) {
        cursorCache.set(page, snap.docs[snap.docs.length - 1]);
      }

      const data = snap.docs.map(d => {
        const raw = d.data();
        // Converter Firestore Timestamp → ISO string
        const ts = raw.timestamp?.toDate?.()?.toISOString?.() ?? raw.timestamp ?? new Date().toISOString();
        return {
          id: d.id,
          action: raw.action ?? '—',
          userEmail: raw.userEmail ?? '—',
          userName: raw.userName ?? raw.userEmail?.split('@')[0] ?? 'Sistema',
          userAvatar: raw.userAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.userName || 'S')}&background=16a34a&color=fff&size=40`,
          entity: raw.entity ?? '—',
          entityId: raw.entityId,
          description: raw.description ?? raw.details ?? '',
          ipAddress: raw.ipAddress,
          timestamp: ts,
          createdAt: ts,
        } satisfies AuditLogEntry;
      });

      // Para o total estimado: retornar 999 se houver uma página cheia (sem query count cara)
      // Nota: getCountFromServer() cobra 1 leitura por 1000 docs; usar apenas se necessário.
      const total = snap.docs.length < pageSize
        ? (page - 1) * pageSize + snap.docs.length
        : page * pageSize + 1; // "+1" sinaliza que há mais páginas

      return { data, total };
    } catch (err) {
      console.error('[AuditLogService.getPage] Erro ao ler audit_logs:', err);
      return { data: [], total: 0 };
    }
  },

  /**
   * Registra uma nova entrada de auditoria.
   * NC-018: garantir que ações do painel admin geram audit_log real.
   *
   * @param action  - Tipo da ação (CREATE, UPDATE, DELETE, etc.)
   * @param userEmail - E-mail do usuário autenticado
   * @param options - Campos opcionais (entity, entityId, description, userName)
   */
  async log(
    action: AuditAction | string,
    userEmail: string,
    options?: {
      userName?: string;
      userAvatar?: string;
      entity?: string;
      entityId?: string;
      description?: string;
      ipAddress?: string;
    }
  ): Promise<void> {
    try {
      if (!userEmail || !action) {
        console.warn('[AuditLogService.log] action e userEmail são obrigatórios. Skipping.');
        return;
      }
      await addDoc(COL(), {
        action,
        userEmail,
        userName: options?.userName ?? userEmail.split('@')[0],
        userAvatar: options?.userAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(options?.userName || 'S')}&background=16a34a&color=fff&size=40`,
        entity: options?.entity ?? 'sistema',
        entityId: options?.entityId ?? null,
        description: options?.description ?? `${action} em ${options?.entity ?? 'sistema'}`,
        ipAddress: options?.ipAddress ?? null,
        timestamp: serverTimestamp(), // Firestore server timestamp — imutável
      });
      // Limpar cache de paginação ao adicionar novo log
      cursorCache.clear();
    } catch (err) {
      // Logar no console mas não propagar — auditoria não deve quebrar fluxo principal
      console.error('[AuditLogService.log] Falha ao registrar audit_log:', err);
    }
  },

  /** Limpa o cache de cursores (útil ao refazer fetch da página 1) */
  clearCache(): void {
    cursorCache.clear();
  },
};
