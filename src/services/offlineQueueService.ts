/**
 * offlineQueueService.ts — PWA-001: Fila de Sincronização Offline (IndexedDB)
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Permite que submissões de formulários (leads, voluntários, contato, DSR LGPD) sejam
 * armazenadas localmente em modo offline e sincronizadas automaticamente quando a conexão voltar.
 */

export interface OfflineSubmission {
  id: string;
  type: 'LEAD' | 'VOLUNTEER' | 'CONTACT' | 'LGPD_DSR';
  endpoint: string;
  payload: Record<string, any>;
  timestamp: string;
  attempts: number;
}

const DB_NAME = 'ism_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_submissions';

// Fallback em memória caso o ambiente (ou testes) não suporte IndexedDB nativo
let memoryQueue: OfflineSubmission[] = [];
const subscribers = new Set<(count: number) => void>();

function notifySubscribers(count: number) {
  subscribers.forEach((cb) => {
    try {
      cb(count);
    } catch {
      // Ignore subscriber errors
    }
  });
}

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export const OfflineQueueService = {
  /** Enfileira uma submissão para envio posterior */
  async enqueue(
    type: OfflineSubmission['type'],
    endpoint: string,
    payload: Record<string, any>
  ): Promise<OfflineSubmission> {
    const submission: OfflineSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      endpoint,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
    };

    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(submission);
        tx.oncomplete = () => resolve();
        tx.onerror = () => {
          memoryQueue.push(submission);
          resolve();
        };
      });
    } else {
      memoryQueue.push(submission);
    }

    const count = await this.getCount();
    notifySubscribers(count);

    // Tenta registrar Background Sync se disponível no Service Worker
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'SyncManager' in window
    ) {
      navigator.serviceWorker.ready.then((reg: any) => {
        if (reg.sync) {
          reg.sync.register('sync-offline-forms').catch(() => {});
        }
      });
    }

    return submission;
  },

  /** Obtém todas as submissões pendentes */
  async getAll(): Promise<OfflineSubmission[]> {
    const db = await openDB();
    if (!db) {
      return [...memoryQueue];
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([...memoryQueue]);
    });
  },

  /** Remove uma submissão processada com sucesso */
  async remove(id: string): Promise<void> {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
    memoryQueue = memoryQueue.filter((item) => item.id !== id);

    const count = await this.getCount();
    notifySubscribers(count);
  },

  /** Retorna a quantidade de itens pendentes */
  async getCount(): Promise<number> {
    const items = await this.getAll();
    return items.length;
  },

  /** Descarrega e envia todas as submissões pendentes para os respectivos endpoints */
  async flushQueue(): Promise<{ success: number; failed: number }> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return { success: 0, failed: 0 };
    }

    const items = await this.getAll();
    let success = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const res = await fetch(item.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          await this.remove(item.id);
          success++;
        } else {
          item.attempts++;
          failed++;
        }
      } catch {
        item.attempts++;
        failed++;
      }
    }

    const count = await this.getCount();
    notifySubscribers(count);

    return { success, failed };
  },

  /** Inscreve um callback para ser notificado sempre que o total pendente mudar */
  subscribe(callback: (count: number) => void): () => void {
    subscribers.add(callback);
    this.getCount().then(callback);
    return () => subscribers.delete(callback);
  },

  /** Inicializa ouvintes automáticos de reconexão e mensagens do SW */
  initAutoSync(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Conexão restabelecida. Sincronizando fila...');
      this.flushQueue();
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_TRIGGER') {
          console.log('[OfflineQueue] Background Sync acionado pelo Service Worker.');
          this.flushQueue();
        }
      });
    }
  },
};
