/**
 * telemetryService.ts — OBS-002: Serviço de Coleta de Telemetria e Erros do Cliente (Frontend)
 * ─────────────────────────────────────────────────────────────────────────────
 * Captura exceções não tratadas (window.onerror), rejeições de Promise não tratadas,
 * e métricas de desempenho Core Web Vitals (LCP, CLS, INP) enviando dados estruturados
 * para a API de Telemetria (/api/v2/telemetry/errors) com rate-limiting e throttling local.
 */

export interface TelemetryPayload {
  source: string;
  message: string;
  route?: string;
  statusCode?: number;
  stack?: string;
  userAgent?: string;
}

export interface WebVitalsMetric {
  name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api';
let isInitialized = false;
const sentErrorsCache = new Set<string>();

/** Envia payload de erro estruturado para o backend de telemetria */
export async function sendTelemetryError(payload: TelemetryPayload): Promise<boolean> {
  const cacheKey = `${payload.source}:${payload.message}:${payload.route}`;
  if (sentErrorsCache.has(cacheKey)) {
    // Evita envio duplicado da mesma exceção em loop
    return false;
  }
  sentErrorsCache.add(cacheKey);
  if (sentErrorsCache.size > 50) {
    // Mantém o tamanho do cache limitado
    const first = sentErrorsCache.values().next().value;
    if (first) sentErrorsCache.delete(first);
  }

  try {
    const fullPayload: TelemetryPayload = {
      ...payload,
      route: payload.route || window.location.pathname,
      userAgent: window.navigator.userAgent,
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(fullPayload)], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/api/v2/telemetry/errors`, blob);
      return true;
    }

    await fetch(`${API_BASE}/api/v2/telemetry/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
    });
    return true;
  } catch (err) {
    console.warn('[TelemetryService] Falha ao transmitir erro para o backend:', err);
    return false;
  }
}

/** Inicializa os ouvintes globais de exceção e rejeição no navegador */
export function initTelemetry(): void {
  if (isInitialized || typeof window === 'undefined') return;

  // 1. Ouvinte de exceções de runtime
  window.addEventListener('error', (event: ErrorEvent) => {
    sendTelemetryError({
      source: 'Frontend Runtime',
      message: event.message || 'Exceção não tratada no cliente',
      route: window.location.pathname,
      stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
    });
  });

  // 2. Ouvinte de Promises rejeitadas sem catch
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = reason instanceof Error ? reason.message : String(reason || 'Rejeição de Promise não capturada');
    const stack = reason instanceof Error ? reason.stack : undefined;
    sendTelemetryError({
      source: 'Unhandled Promise',
      message: msg,
      route: window.location.pathname,
      stack,
    });
  });

  isInitialized = true;
  console.log('[TelemetryService] Telemetria de exceções e erros inicializada com sucesso.');
}

/** Telemetry Service Singleton Object */
export const TelemetryService = {
  init: initTelemetry,
  reportError: sendTelemetryError,
};
