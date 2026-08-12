import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryService, sendTelemetryError, initTelemetry } from '../services/telemetryService';

describe('Suíte de Testes da Telemetria de Observabilidade (Fase 10 — OBS-005)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Teste 01: TelemetryService expõe os métodos estáticos esperados', () => {
    expect(TelemetryService.init).toBeDefined();
    expect(TelemetryService.reportError).toBeDefined();
  });

  it('Teste 02: initTelemetry() executa sem exceções no ambiente jsdom', () => {
    expect(() => initTelemetry()).not.toThrow();
  });

  it('Teste 03: sendTelemetryError() formata e envia o payload com a rota atual', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );

    const result = await sendTelemetryError({
      source: 'UnitTest',
      message: 'Erro simulado de teste unitário',
      statusCode: 500,
    });

    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const callArg = fetchSpy.mock.calls[0];
    expect(callArg[0]).toContain('/api/v2/telemetry/errors');
    
    const bodyObj = JSON.parse(callArg[1]?.body as string);
    expect(bodyObj.source).toBe('UnitTest');
    expect(bodyObj.message).toBe('Erro simulado de teste unitário');
    expect(bodyObj.statusCode).toBe(500);
  });

  it('Teste 04: sendTelemetryError() evita envio em loop de mensagens idênticas (deduplicação)', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 201 })
    );

    const payload = {
      source: 'LoopTest',
      message: 'Erro duplicado em loop',
      route: '/test-loop',
    };

    const firstSend = await sendTelemetryError(payload);
    const secondSend = await sendTelemetryError(payload);

    expect(firstSend).toBe(true);
    expect(secondSend).toBe(false); // Bloqueado pelo cache de de-duplicação
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
