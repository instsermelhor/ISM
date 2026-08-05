/**
 * pwaRegisterService.ts — F001: Serviço de Registro PWA & Prompt de Instalação
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Registra o Service Worker em ambiente de produção/browser e captura o evento 'beforeinstallprompt'.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const PWARegisterService = {
  /** Registra o Service Worker no navegador */
  registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          if (import.meta.env.DEV) {
            console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
          }
        }).catch((err) => {
          if (import.meta.env.DEV) {
            console.error('[PWA] Falha ao registrar Service Worker:', err);
          }
        });
      });
    }
  },

  /** Escuta o evento beforeinstallprompt para capturar o prompt nativo */
  initInstallListener(onPromptAvailable: () => void) {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      onPromptAvailable();
    });
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
};
