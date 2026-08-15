/**
 * useScrollLock.ts — Hook iOS-safe para bloquear o scroll da página
 * ──────────────────────────────────────────────────────────────────
 * Técnica: salva window.scrollY → aplica position:fixed no body →
 * restaura exatamente a mesma posição ao desbloquear.
 *
 * Por que não usar overflow:hidden?
 * No Safari/WebKit (iOS), `overflow:hidden` no body NÃO impede o scroll
 * em todos os casos (especialmente em modais e menus full-screen).
 * Esta técnica funciona corretamente em Safari, Chrome, Firefox e Edge
 * em desktop e mobile.
 *
 * Uso:
 *   const { lockScroll, unlockScroll } = useScrollLock();
 *   useEffect(() => { if (isOpen) lockScroll(); else unlockScroll(); }, [isOpen]);
 *
 * Ou simplesmente:
 *   useScrollLock(isOpen); // aplica/remove automaticamente
 */
import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook que bloqueia/desbloqueia o scroll do body de forma iOS-safe.
 * @param locked - se `true`, bloqueia o scroll imediatamente (modo controlado).
 *                 se `undefined`, retorna `{ lockScroll, unlockScroll }` para controle manual.
 */
export function useScrollLock(locked?: boolean) {
  const scrollY = useRef(0);
  const isLocked = useRef(false);

  const lockScroll = useCallback(() => {
    if (isLocked.current) return;
    scrollY.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll'; // evita CLS por scrollbar
    isLocked.current = true;
  }, []);

  const unlockScroll = useCallback(() => {
    if (!isLocked.current) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    window.scrollTo({ top: scrollY.current, behavior: 'instant' as ScrollBehavior });
    isLocked.current = false;
  }, []);

  // Modo controlado: aplica/remove automaticamente quando `locked` muda
  useEffect(() => {
    if (locked === undefined) return;
    if (locked) {
      lockScroll();
    } else {
      unlockScroll();
    }
    // Cleanup: garante desbloqueio se componente for desmontado com scroll travado
    return () => {
      unlockScroll();
    };
  }, [locked, lockScroll, unlockScroll]);

  // Cleanup de emergência no unmount (modo manual)
  useEffect(() => {
    return () => {
      unlockScroll();
    };
  }, [unlockScroll]);

  return { lockScroll, unlockScroll };
}
