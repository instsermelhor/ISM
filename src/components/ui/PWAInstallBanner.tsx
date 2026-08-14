import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { PWARegisterService } from '../../services/pwaRegisterService';

const DISMISSED_KEY = 'ism_pwa_install_dismissed_until';
const COOLDOWN_DAYS = 7;

export const PWAInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Não exibe se já estiver em modo standalone
    if (PWARegisterService.isStandalone()) {
      return;
    }

    // Checa cooldown de dismiss
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    setDismissed(false);

    // Escuta evento de disponibilidade de instalação
    PWARegisterService.initInstallListener(() => {
      setCanInstall(true);
    });

    if (PWARegisterService.isInstallPromptAvailable()) {
      setCanInstall(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    const cooldownTimestamp = Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISSED_KEY, String(cooldownTimestamp));
  };

  const handleInstall = async () => {
    const success = await PWARegisterService.promptInstall();
    if (success) {
      setInstalled(true);
      setTimeout(() => setDismissed(true), 3000);
    }
  };

  if (dismissed || !canInstall) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Instalar aplicativo Instituto Ser Melhor"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-fade-in bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-4 transition-all"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
          {installed ? <Check size={24} className="text-emerald-600" /> : <Smartphone size={24} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              {installed ? 'Aplicativo Instalado!' : 'Instalar Aplicativo'}
            </h4>
            <button
              onClick={handleDismiss}
              aria-label="Fechar banner de instalação"
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
            {installed
              ? 'O Instituto Ser Melhor agora está acessível na sua tela inicial com suporte offline.'
              : 'Acesse relatórios, notícias e projetos com navegação rápida e suporte offline.'}
          </p>

          {!installed && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="btn btn-primary text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 font-bold shadow-sm"
              >
                <Download size={14} />
                Instalar App
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 py-1.5 px-2.5 font-medium transition-colors"
              >
                Agora não
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
