/**
 * webVitals.test.ts — PERF-001: Otimização de Core Web Vitals & Carregamento Preditivo
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Suíte de testes unitários para o Serviço de Medição e Telemetria de Core Web Vitals.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebVitalsService } from './webVitalsService';

describe('PERF-001 — WebVitalsService (Core Web Vitals Telemetry & RUM)', () => {

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

  describe('FCP Rating (First Contentful Paint)', () => {
    it('classifica <= 1800ms como GOOD', () => {
      expect(WebVitalsService.rateFCP(800)).toBe('GOOD');
      expect(WebVitalsService.rateFCP(1800)).toBe('GOOD');
    });

    it('classifica > 1800ms e <= 3000ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateFCP(2400)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica > 3000ms como POOR', () => {
      expect(WebVitalsService.rateFCP(3500)).toBe('POOR');
    });
  });

  describe('TTFB Rating (Time to First Byte)', () => {
    it('classifica <= 800ms como GOOD', () => {
      expect(WebVitalsService.rateTTFB(200)).toBe('GOOD');
      expect(WebVitalsService.rateTTFB(800)).toBe('GOOD');
    });

    it('classifica > 800ms e <= 1800ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateTTFB(1200)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica > 1800ms como POOR', () => {
      expect(WebVitalsService.rateTTFB(2200)).toBe('POOR');
    });
  });

  describe('recordMetric & getSnapshot', () => {
    it('gera snapshot com todas as 5 métricas essenciais (LCP, INP, CLS, FCP, TTFB)', () => {
      WebVitalsService.recordMetric('lcp', 1400);
      WebVitalsService.recordMetric('inp', 75);
      WebVitalsService.recordMetric('cls', 0.015);
      WebVitalsService.recordMetric('fcp', 850);
      WebVitalsService.recordMetric('ttfb', 190);

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

    it('identifica overallRating como NEEDS_IMPROVEMENT quando uma métrica decai', () => {
      WebVitalsService.recordMetric('lcp', 3200); // Needs improvement
      WebVitalsService.recordMetric('inp', 75);
      WebVitalsService.recordMetric('cls', 0.01);
      WebVitalsService.recordMetric('fcp', 800);
      WebVitalsService.recordMetric('ttfb', 200);

      const snap = WebVitalsService.getSnapshot();
      expect(snap.lcp.rating).toBe('NEEDS_IMPROVEMENT');
      expect(snap.overallRating).toBe('NEEDS_IMPROVEMENT');
    });

    it('identifica overallRating como POOR quando uma métrica atinge nível crítico', () => {
      WebVitalsService.recordMetric('lcp', 5000); // Poor
      const snap = WebVitalsService.getSnapshot();
      expect(snap.lcp.rating).toBe('POOR');
      expect(snap.overallRating).toBe('POOR');
    });
  });

  describe('initPerformanceObservers', () => {
    it('executa sem lançar exceções em qualquer ambiente', () => {
      expect(() => WebVitalsService.initPerformanceObservers()).not.toThrow();
    });
  });
});
