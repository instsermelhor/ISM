/**
 * webVitals.test.ts — F002: Otimização de Core Web Vitals & Carregamento Preditivo
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para o Serviço de Medição de Core Web Vitals.
 */

import { describe, it, expect } from 'vitest';
import { WebVitalsService } from './webVitalsService';

describe('F002 — WebVitalsService (Core Web Vitals Telemetry)', () => {

  describe('LCP Rating (Largest Contentful Paint)', () => {
    it('classifica <= 2500ms como GOOD', () => {
      expect(WebVitalsService.rateLCP(1200)).toBe('GOOD');
      expect(WebVitalsService.rateLCP(2500)).toBe('GOOD');
    });

    it('classifica 2501-4000ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateLCP(3000)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica > 4000ms como POOR', () => {
      expect(WebVitalsService.rateLCP(4500)).toBe('POOR');
    });
  });

  describe('INP Rating (Interaction to Next Paint)', () => {
    it('classifica <= 200ms como GOOD', () => {
      expect(WebVitalsService.rateINP(80)).toBe('GOOD');
      expect(WebVitalsService.rateINP(200)).toBe('GOOD');
    });

    it('classifica > 200ms e <= 500ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateINP(350)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica > 500ms como POOR', () => {
      expect(WebVitalsService.rateINP(600)).toBe('POOR');
    });
  });

  describe('CLS Rating (Cumulative Layout Shift)', () => {
    it('classifica <= 0.1 como GOOD', () => {
      expect(WebVitalsService.rateCLS(0.02)).toBe('GOOD');
      expect(WebVitalsService.rateCLS(0.1)).toBe('GOOD');
    });

    it('classifica > 0.1 e <= 0.25 como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateCLS(0.18)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica > 0.25 como POOR', () => {
      expect(WebVitalsService.rateCLS(0.35)).toBe('POOR');
    });
  });

  describe('getSnapshot', () => {
    it('gera snapshot com todas as 5 métricas essenciais (LCP, INP, CLS, FCP, TTFB)', () => {
      const snap = WebVitalsService.getSnapshot();

      expect(snap.lcp.name).toBe('LCP');
      expect(snap.inp.name).toBe('INP');
      expect(snap.cls.name).toBe('CLS');
      expect(snap.fcp.name).toBe('FCP');
      expect(snap.ttfb.name).toBe('TTFB');

      expect(snap.lcp.rating).toBe('GOOD');
      expect(snap.overallRating).toBe('GOOD');
      expect(snap.measuredAt).toBeTruthy();
    });
  });
});
