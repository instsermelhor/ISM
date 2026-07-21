/**
 * Admin Telemetry & Exception Tracker Utility
 * ──────────────────────────────────────────
 * Centraliza o envio de erros client-side para o Sentry e Cloud Logging.
 */

export interface TelemetryContext {
  userId?: string;
  userRole?: string;
  route?: string;
  action?: string;
  [key: string]: unknown;
}

export const Telemetry = {
  /** Registra uma exceção capturada com contexto tipado */
  captureException(error: Error | unknown, context?: TelemetryContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    console.error('[Telemetry Exception]', {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Envia para o Sentry SDK se disponível em ambiente de produção
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(errorObj, { extra: context });
    }
  },

  /** Registra um evento de auditoria de uso / navegação */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      console.log(`[Telemetry Event] ${eventName}:`, properties);
    }
  }
};
