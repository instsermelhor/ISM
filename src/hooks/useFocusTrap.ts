/**
 * useFocusTrap.ts — A11y Hook (WCAG 2.1.2)
 * Fase 13 / A11Y-002
 *
 * Prende o foco dentro de um elemento container quando o modal/dialog está aberto.
 * Ao fechar, devolve o foco ao elemento que estava ativo antes de abrir.
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/**
 * Hook que gerencia o focus trap para dialogs/modais.
 *
 * @param isOpen - Se true, ativa o trap; se false, libera e restaura o foco.
 * @returns ref a ser aplicado no elemento container do dialog.
 *
 * @example
 * const dialogRef = useFocusTrap(isOpen);
 * return <div ref={dialogRef} role="dialog" aria-modal="true">...</div>;
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Guarda o elemento que tinha foco antes de abrir o modal
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Move o foco para o primeiro elemento focável dentro do container
    const focusableElements = Array.from<HTMLElement>(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );

    if (focusableElements.length > 0) {
      // Pequeno delay para garantir que a animação de entrada terminou
      const timer = setTimeout(() => {
        focusableElements[0].focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;

    // Devolve o foco ao elemento anterior ao fechar
    const el = previouslyFocusedRef.current;
    if (el && 'focus' in el && typeof (el as HTMLElement).focus === 'function') {
      // Pequeno delay para garantir que o modal foi desmontado
      setTimeout(() => (el as HTMLElement).focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(el => !(el as HTMLElement).hasAttribute('disabled') && (el as HTMLElement).offsetParent !== null);

      if (focusableElements.length === 0) return;

      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: se estiver no primeiro, vai para o último
        if (document.activeElement === firstEl) {
          e.preventDefault();
          (lastEl as HTMLElement).focus();
        }
      } else {
        // Tab: se estiver no último, vai para o primeiro
        if (document.activeElement === lastEl) {
          e.preventDefault();
          (firstEl as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return containerRef;
}
