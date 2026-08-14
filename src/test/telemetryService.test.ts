/**
 * telemetryService.test.ts — OBS-001: Observabilidade Enterprise & Tracing Distribuído
 * ─────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para a Telemetria de Erros, Redação de Segredos e Correlation IDs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TelemetryService,
  sendTelemetryError,
  initTelemetry,
  getCorrelationId,
  redactSensitiveData,
} from '../services/telemetryService';

describe('OBS-001 — Observabilidade Enterprise & Tracing Distribuído', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Correlation IDs & Tracing de Sessão', () => {
    it('OBS-001: getCorrelationId() retorna um ID de correlação consistente no formato corr-*', () => {
      const corrId1 = getCorrelationId();
      const corrId2 = getCorrelationId();

      expect(corrId1).toMatch(/^corr-[a-z0-9]+-[a-z0-9]+$/);
      expect(corrId1).toBe(corrId2); // Mesma sessão mantém o mesmo ID
    });

    it('OBS-002: TelemetryService expõe os métodos de telemetria e higienização', () => {
      expect(TelemetryService.init).toBeDefined();
      expect(TelemetryService.reportError).toBeDefined();
      expect(TelemetryService.getCorrelationId).toBeDefined();
      expect(TelemetryService.redactSensitiveData).toBeDefined();
    });
  });

  describe('2. Sanitização & Redação de Segredos (PII & Secrets Scrubbing)', () => {
    it('OBS-003: redactSensitiveData mascara chaves de API secretas (sk_live / sk_test)', () => {
      const sensitiveMsg = 'Erro ao processar Stripe com chave sk_live_abc12345678901234567890';
      const clean = redactSensitiveData(sensitiveMsg);
      expect(clean).not.toContain('sk_live_abc12345678901234567890');
      expect(clean).toContain('[REDACTED_API_KEY]');
    });

    it('OBS-004: redactSensitiveData mascara tokens JWT de autenticação', () => {
      const jwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignaturePart';
      const clean = redactSensitiveData(jwt);
      expect(clean).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(clean).toContain('[REDACTED_JWT]');
    });

    it('OBS-005: redactSensitiveData mascara números de cartão de crédito e senhas', () => {
      const text = 'Falha ao autenticar user password="SuperSecretPassword123" card=4532 1234 5678 9010';
      const clean = redactSensitiveData(text);
      expect(clean).not.toContain('SuperSecretPassword123');
      expect(clean).not.toContain('4532 1234 5678 9010');
      expect(clean).toContain('[REDACTED]');
      expect(clean).toContain('[REDACTED_CARD_NUMBER]');
    });
  });

  describe('3. Transmissão & De-duplicação de Telemetria', () => {
    it('OBS-006: sendTelemetryError() envia payload com x-correlation-id e mensagem sanitizada', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ received: true }), { status: 201 })
      );

      // Simulação de chave no formato de API secret (não é uma chave real)
      const fakeApiKey = ['sk', 'test', 'FAKE_KEY_FOR_TESTING_ONLY_NOT_REAL'].join('_');

      const result = await sendTelemetryError({
        source: 'UnitTest',
        message: `Erro com chave ${fakeApiKey}`,
        statusCode: 500,
        route: '/teste-obs',
      });

      expect(result).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const callArg = fetchSpy.mock.calls[0];
      expect(callArg[0]).toContain('/api/v2/telemetry/errors');
      
      const headers = callArg[1]?.headers as Record<string, string>;
      expect(headers['x-correlation-id']).toBeTruthy();

      const bodyObj = JSON.parse(callArg[1]?.body as string);
      expect(bodyObj.source).toBe('UnitTest');
      expect(bodyObj.message).toContain('[REDACTED_API_KEY]');
      expect(bodyObj.correlationId).toBeTruthy();
    });

    it('OBS-007: sendTelemetryError() previne loop de erros idênticos (cache deduplication)', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ received: true }), { status: 201 })
      );

      const payload = {
        source: 'LoopService',
        message: 'Erro repetido no render loop',
        route: '/loop-path',
      };

      const firstSend = await sendTelemetryError(payload);
      const secondSend = await sendTelemetryError(payload);

      expect(firstSend).toBe(true);
      expect(secondSend).toBe(false); // Ignorado pelo cache
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('OBS-008: initTelemetry() inicializa os listeners globais sem lançar exceções', () => {
      expect(() => initTelemetry()).not.toThrow();
    });
  });
});
