import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** ID único para `aria-labelledby`. Padrão: "modal-title" */
  titleId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  titleId = 'modal-title',
}) => {
  // A11y: Focus trap — WCAG 2.1.2 + 2.4.3
  const dialogRef = useFocusTrap(isOpen);

  // iOS-safe scroll lock — bloqueia scroll do body sem glitches no Safari WebKit
  useScrollLock(isOpen);

  // Fecha com Escape — WCAG 2.1.1
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 touch-manipulation"
          style={{
            paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
          }}
        >
          {/* Backdrop — clique fora fecha o modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog — focus trap ativo, altura dinâmica dvh */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] max-h-[90dvh] flex flex-col overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-7 py-4 sm:py-5 border-b border-gray-100 shrink-0">
              <h3 id={titleId} className="text-lg sm:text-xl font-bold text-secondary-900 leading-tight">{title}</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-secondary-400 hover:bg-gray-100 hover:text-secondary-700 transition-colors touch-manipulation"
                aria-label="Fechar modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Content com scroll interno suave e safe scroll */}
            <div className="px-6 sm:px-7 py-5 sm:py-6 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};