/**
 * useCMSAutosave — Hook de Autosave para editores CMS
 * ─────────────────────────────────────────────────────
 * Salva automaticamente o conteúdo no localStorage a cada 30 segundos.
 * Ao montar, restaura o rascunho local se existir (proteção anti-perda).
 *
 * Uso:
 *   const { restoreAvailable, restore, clearSaved } = useCMSAutosave('hero', data);
 */

import { useEffect, useRef, useCallback } from 'react';

const AUTOSAVE_INTERVAL_MS = 30_000; // 30 segundos
const KEY_PREFIX = 'cms_autosave__';

interface AutosaveEntry<T> {
  data: T;
  savedAt: string; // ISO-8601
}

export function useCMSAutosave<T>(moduleId: string, data: T) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storageKey = `${KEY_PREFIX}${moduleId}`;

  // Salva no localStorage
  const save = useCallback((payload: T) => {
    const entry: AutosaveEntry<T> = {
      data: payload,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (e) {
      console.warn('[useCMSAutosave] localStorage quota exceeded:', e);
    }
  }, [storageKey]);

  // Inicia intervalo de autosave
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      save(data);
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data, save]);

  // Lê rascunho salvo
  const getSaved = useCallback((): AutosaveEntry<T> | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as AutosaveEntry<T>;
    } catch {
      return null;
    }
  }, [storageKey]);

  // Verifica se há rascunho disponível
  const restoreAvailable = !!getSaved();

  // Retorna os dados do rascunho salvo
  const restore = useCallback((): T | null => {
    return getSaved()?.data ?? null;
  }, [getSaved]);

  // Obtém data/hora do rascunho
  const savedAt = useCallback((): string | null => {
    const entry = getSaved();
    if (!entry) return null;
    return new Date(entry.savedAt).toLocaleString('pt-BR');
  }, [getSaved]);

  // Limpa o rascunho após publicação bem-sucedida
  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { restoreAvailable, restore, savedAt, clearSaved, saveNow: () => save(data) };
}
