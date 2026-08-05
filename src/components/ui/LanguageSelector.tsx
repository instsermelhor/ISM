/**
 * LanguageSelector.tsx — C005: Seletor de Idiomas (PT / EN / ES)
 * ──────────────────────────────────────────────────────────────
 * Componente elegante para alternar idioma do site público entre
 * Português (PT), Inglês (EN) e Espanhol (ES).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'PT', label: 'Português', flag: '🇧🇷' },
  { code: 'EN', label: 'English', flag: '🇺🇸' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
];

export const LanguageSelector: React.FC<{ isScrolled?: boolean }> = ({ isScrolled = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Idioma atual: ${current.label}. Clique para alterar.`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
          isScrolled
            ? 'bg-gray-100/80 text-secondary-800 border-gray-200 hover:bg-gray-200'
            : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md'
        }`}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.code}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Selecionar idioma"
          className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in py-1"
        >
          {LANGUAGES.map(lang => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-extrabold'
                    : 'text-secondary-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
