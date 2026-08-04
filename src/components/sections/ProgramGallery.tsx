import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react';
import { ProgramGalleryImage } from '../../types';

interface Props {
  gallery: ProgramGalleryImage[];
  programTitle: string;
}

export const ProgramGallery: React.FC<Props> = ({ gallery, programTitle }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = lightboxIdx !== null;
  const sorted = [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const open = (i: number) => setLightboxIdx(i);
  const close = () => setLightboxIdx(null);
  const prev = useCallback(() => setLightboxIdx(i => (i === null || i === 0 ? sorted.length - 1 : i - 1)), [sorted.length]);
  const next = useCallback(() => setLightboxIdx(i => (i === null ? 0 : (i + 1) % sorted.length)), [sorted.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, prev, next]);

  useEffect(() => {
    if (isOpen && closeRef.current) closeRef.current.focus();
  }, [isOpen]);

  if (!sorted.length) return null;

  const current = lightboxIdx !== null ? sorted[lightboxIdx] : null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div
        role="region"
        aria-label={`Galeria de imagens de ${programTitle}`}
        className="grid grid-cols-3 gap-1.5 mt-3"
      >
        {sorted.slice(0, 6).map((img, i) => (
          <button
            key={img.id}
            onClick={() => open(i)}
            aria-label={`Ver imagem ${i + 1}${img.caption ? ': ' + img.caption : ''}`}
            className="relative aspect-square overflow-hidden rounded-lg bg-slate-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
          >
            <img
              src={img.url}
              alt={img.alt || img.caption || `Imagem ${i + 1} de ${programTitle}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {i === 5 && sorted.length > 6 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-sm">+{sorted.length - 6}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </button>
        ))}
        {sorted.length > 1 && (
          <button
            onClick={() => open(0)}
            className="col-span-3 flex items-center justify-center gap-1.5 mt-1 text-xs text-brand-600 font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`Ver todas as ${sorted.length} imagens da galeria`}
          >
            <Images size={13} />
            Ver galeria completa ({sorted.length} imagens)
          </button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Lightbox: ${current.alt || current.caption || `Imagem ${(lightboxIdx ?? 0) + 1}`}`}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                ref={closeRef}
                onClick={close}
                aria-label="Fechar lightbox"
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-lg transition-colors z-10"
              >
                <X size={22} />
              </button>

              {/* Counter */}
              <div className="absolute -top-10 left-0 text-white/60 text-sm font-medium">
                {(lightboxIdx ?? 0) + 1} / {sorted.length}
              </div>

              {/* Image */}
              <img
                src={current.url}
                alt={current.alt || current.caption || `Imagem ${(lightboxIdx ?? 0) + 1} de ${programTitle}`}
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
              />

              {/* Caption */}
              {current.caption && (
                <p className="mt-3 text-white/80 text-sm text-center max-w-xl">{current.caption}</p>
              )}

              {/* Nav buttons */}
              {sorted.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Imagem anterior"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Próxima imagem"
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
