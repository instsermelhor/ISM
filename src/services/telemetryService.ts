/**
 * telemetryService.ts — OBS-001: Observabilidade Enterprise & Tracing Distribuído
 * ─────────────────────────────────────────────────────────────────────────────
 * Captura exceções não tratadas (window.onerror), rejeições de Promise não tratadas,
 * sanitiza PII e segredos antes do envio e injeta correlation IDs para rastreamento distribuído.
 */

export interface TelemetryPayload {
  source: string;
  message: string;
  route?: string;
  statusCode?: number;
  stack?: string;
  userAgent?: string;
  correlationId?: string;
  timestamp?: string;
}

export interface WebVitalsMetric {
  name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://southamerica-east1-ismbd-27e84.cloudfunctions.net/api';
let isInitialized = false;
const sentErrorsCache = new Set<string>();

/** Gera ou recupera o Correlation ID único da sessão atual */
let sessionCorrelationId: string = '';
export function getCorrelationId(): string {
  if (!sessionCorrelationId) {
    const randomPart = Math.random().toString(36).substring(2, 10);
    sessionCorrelationId = `corr-${Date.now().toString(36)}-${randomPart}`;
  }
  return sessionCorrelationId;
}

/** Sanitiza segredos, senhas e tokens de strings antes da transmissão */
export function redactSensitiveData(text: string): string {
  if (!text) return '';
  return text
    // Chaves de API e Secrets
    .replace(/(sk_[a-zA-Z0-9_-]{20,})/g, '[REDACTED_API_KEY]')
    .replace(/(AIza[0-9A-Za-z-_]{35})/g, '[REDACTED_FIREBASE_KEY]')
    .replace(/(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)/g, '[REDACTED_JWT]')
    // Senhas e campos de autorização
    .replace(/(password|senha|secret|token|authorization)\s*[:=]\s*["']?([^"',\s]+)["']?/gi, '$1="[REDACTED]"')
    // Números de cartão de crédito (13-16 dígitos)
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED_CARD_NUMBER]');
}

/** Envia payload de erro estruturado e higienizado para o backend de telemetria */
export async function sendTelemetryError(payload: TelemetryPayload): Promise<boolean> {
  const sanitizedMessage = redactSensitiveData(payload.message);
  const sanitizedStack = payload.stack ? redactSensitiveData(payload.stack) : undefined;
  const correlationId = payload.correlationId || getCorrelationId();

  const cacheKey = `${payload.source}:${sanitizedMessage}:${payload.route}`;
  if (sentErrorsCache.has(cacheKey)) {
    // Evita envio duplicado da mesma exceção em loop
    return false;
  }
  sentErrorsCache.add(cacheKey);
  if (sentErrorsCache.size > 50) {
    const first = sentErrorsCache.values().next().value;
    if (first) sentErrorsCache.delete(first);
  }

  try {
    const fullPayload: TelemetryPayload = {
      ...payload,
      message: sanitizedMessage,
      stack: sanitizedStack,
      route: payload.route || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NodeJS/Test',
      correlationId,
      timestamp: new Date().toISOString(),
    };

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(fullPayload)], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/api/v2/telemetry/errors`, blob);
      return true;
    }

    await fetch(`${API_BASE}/api/v2/telemetry/errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
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
  getCorrelationId,
  redactSensitiveData,
};
