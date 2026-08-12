/**
 * CookieConsentBanner.tsx — NC-030: Gerenciador de Consentimento LGPD (Art. 7, I)
 * ─────────────────────────────────────────────────────────────────────────────
 * Banner acessível e granular para consentimento de cookies e tratamento de dados.
 * Suporta opções: "Aceitar Todos", "Apenas Essenciais" e "Personalizar".
 * Persiste preferências no localStorage ('ism_cookie_consent').
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

const CONSENT_STORAGE_KEY = 'ism_cookie_consent';

export interface CookiePreferences {
  essential: boolean;   // Sempre true (sessão, segurança, navegação)
  analytics: boolean;   // Google Analytics 4, métricas de tráfego
  functional: boolean;  // Preferências do usuário, idioma
  marketing: boolean;   // Campanhas de captação
  acceptedAt: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  functional: true,
  marketing: false,
  acceptedAt: '',
};

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!saved) {
        // Exibir banner se o usuário ainda não respondeu
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const savePreferences = (finalPrefs: CookiePreferences) => {
    const payload = { ...finalPrefs, acceptedAt: new Date().toISOString() };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch { /* ignore */ }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, functional: true, marketing: true, acceptedAt: '' });
  };

  const handleAcceptEssential = () => {
    savePreferences({ essential: true, analytics: false, functional: false, marketing: false, acceptedAt: '' });
  };

  const handleSaveCustom = () => {
    savePreferences(prefs);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
      style={{
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-white">

        {/* Info & Text */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>Privacidade &amp; Conformidade LGPD (Lei nº 13.709/2018)</span>
          </div>
          <h3 id="cookie-consent-title" className="text-lg font-bold text-white leading-snug">
            Nós valorizamos a sua privacidade e a transparência
          </h3>
          <p id="cookie-consent-desc" className="text-secondary-300 text-sm leading-relaxed max-w-3xl">
            Utilizamos cookies essenciais para garantir o funcionamento correto da plataforma do Instituto Ser Melhor.
            Com a sua autorização, utilizamos cookies de análise e métricas para aprimorar nossos serviços e prestação de contas.
          </p>
        </div>

        {/* Customization Details Modal/Drawer inside banner */}
        {showDetails && (
          <div className="w-full lg:w-auto bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preferências de Cookies:</h4>

            <div className="flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-white">Essenciais</span>
                <p className="text-slate-400 text-[11px]">Segurança e funcionamento básico</p>
              </div>
              <span className="text-emerald-400 font-bold">Obrigatório</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-white">Analytics / Métricas</span>
                <p className="text-slate-400 text-[11px]">Estatísticas de uso e visitantes (GA4)</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-white">Funcionais</span>
                <p className="text-slate-400 text-[11px]">Lembrar preferências de navegação</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.functional}
                onChange={(e) => setPrefs(p => ({ ...p, functional: e.target.checked }))}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-white">Comunicação</span>
                <p className="text-slate-400 text-[11px]">Divulgação de projetos e campanhas</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveCustom}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              Salvar Minhas Preferências
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Settings size={14} />
            <span>{showDetails ? 'Ocultar' : 'Personalizar'}</span>
          </button>

          <button
            onClick={handleAcceptEssential}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Apenas Essenciais
          </button>

          <button
            onClick={handleAcceptAll}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Check size={14} />
            <span>Aceitar Todos</span>
          </button>
        </div>

      </div>
    </div>
  );
};
