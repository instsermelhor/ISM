/**
 * pwaRegisterService.ts — PWA-001: Serviço de Registro PWA & Prompt de Instalação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Registra o Service Worker, gerencia o ciclo de vida de atualizações,
 * captura o evento 'beforeinstallprompt' e inicializa a sincronização offline.
 */

import { OfflineQueueService } from './offlineQueueService';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();
const updateListeners = new Set<() => void>();

export const PWARegisterService = {
  /** Registra o Service Worker no navegador e inicializa auto-sync */
  registerServiceWorker(onUpdateAvailable?: () => void) {
    if (onUpdateAvailable) {
      updateListeners.add(onUpdateAvailable);
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            if (import.meta.env.DEV) {
              console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
            }

            // Escuta novas versões do Service Worker instaladas
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] Nova versão da aplicação disponível.');
                    updateListeners.forEach((cb) => cb());
                  }
                });
              }
            });
          })
          .catch((err) => {
            if (import.meta.env.DEV) {
              console.error('[PWA] Falha ao registrar Service Worker:', err);
            }
          });
      });
    }

    // Inicializa observador de conectividade e sincronização da fila offline
    OfflineQueueService.initAutoSync();
  },

  /** Escuta o evento beforeinstallprompt para capturar o prompt nativo */
  initInstallListener(onPromptAvailable: () => void) {
    installListeners.add(onPromptAvailable);

    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      installListeners.forEach((cb) => cb());
    });
  },

  /** Verifica se o prompt de instalação está disponível */
  isInstallPromptAvailable(): boolean {
    return deferredPrompt !== null;
  },

  /** Aciona o prompt nativo de instalação do PWA */
  async promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return choice.outcome === 'accepted';
    } catch {
      return false;
    }
  },

  /** Verifica se o aplicativo está rodando em modo PWA Standalone (Instalado) */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true
    );
  },

  /** Atualiza o Service Worker forçando o reload para nova versão */
  skipWaitingAndReload() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    }
  },
};
