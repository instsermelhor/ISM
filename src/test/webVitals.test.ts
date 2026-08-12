/**
 * webVitals.test.ts — Fase 12 / PERF-003
 * Testes unitários do WebVitalsService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebVitalsService } from '../services/webVitalsService';

describe('WebVitalsService — Classificação de métricas (CWV)', () => {
  // ──────────────────────────────────────────────
  // LCP — Largest Contentful Paint
  // ──────────────────────────────────────────────
  describe('rateLCP', () => {
    it('classifica LCP ≤ 2500ms como GOOD', () => {
      expect(WebVitalsService.rateLCP(1000)).toBe('GOOD');
      expect(WebVitalsService.rateLCP(2500)).toBe('GOOD');
    });

    it('classifica LCP entre 2501–4000ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateLCP(2501)).toBe('NEEDS_IMPROVEMENT');
      expect(WebVitalsService.rateLCP(4000)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica LCP > 4000ms como POOR', () => {
      expect(WebVitalsService.rateLCP(4001)).toBe('POOR');
      expect(WebVitalsService.rateLCP(9000)).toBe('POOR');
    });
  });

  // ──────────────────────────────────────────────
  // INP — Interaction to Next Paint
  // ──────────────────────────────────────────────
  describe('rateINP', () => {
    it('classifica INP ≤ 200ms como GOOD', () => {
      expect(WebVitalsService.rateINP(50)).toBe('GOOD');
      expect(WebVitalsService.rateINP(200)).toBe('GOOD');
    });

    it('classifica INP entre 201–500ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateINP(201)).toBe('NEEDS_IMPROVEMENT');
      expect(WebVitalsService.rateINP(500)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica INP > 500ms como POOR', () => {
      expect(WebVitalsService.rateINP(501)).toBe('POOR');
    });
  });

  // ──────────────────────────────────────────────
  // CLS — Cumulative Layout Shift
  // ──────────────────────────────────────────────
  describe('rateCLS', () => {
    it('classifica CLS ≤ 0.1 como GOOD', () => {
      expect(WebVitalsService.rateCLS(0)).toBe('GOOD');
      expect(WebVitalsService.rateCLS(0.1)).toBe('GOOD');
    });

    it('classifica CLS entre 0.11–0.25 como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateCLS(0.11)).toBe('NEEDS_IMPROVEMENT');
      expect(WebVitalsService.rateCLS(0.25)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica CLS > 0.25 como POOR', () => {
      expect(WebVitalsService.rateCLS(0.26)).toBe('POOR');
    });
  });

  // ──────────────────────────────────────────────
  // FCP — First Contentful Paint
  // ──────────────────────────────────────────────
  describe('rateFCP', () => {
    it('classifica FCP ≤ 1800ms como GOOD', () => {
      expect(WebVitalsService.rateFCP(500)).toBe('GOOD');
      expect(WebVitalsService.rateFCP(1800)).toBe('GOOD');
    });

    it('classifica FCP entre 1801–3000ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateFCP(1801)).toBe('NEEDS_IMPROVEMENT');
      expect(WebVitalsService.rateFCP(3000)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica FCP > 3000ms como POOR', () => {
      expect(WebVitalsService.rateFCP(3001)).toBe('POOR');
    });
  });

  // ──────────────────────────────────────────────
  // TTFB — Time to First Byte
  // ──────────────────────────────────────────────
  describe('rateTTFB', () => {
    it('classifica TTFB ≤ 800ms como GOOD', () => {
      expect(WebVitalsService.rateTTFB(200)).toBe('GOOD');
      expect(WebVitalsService.rateTTFB(800)).toBe('GOOD');
    });

    it('classifica TTFB entre 801–1800ms como NEEDS_IMPROVEMENT', () => {
      expect(WebVitalsService.rateTTFB(801)).toBe('NEEDS_IMPROVEMENT');
      expect(WebVitalsService.rateTTFB(1800)).toBe('NEEDS_IMPROVEMENT');
    });

    it('classifica TTFB > 1800ms como POOR', () => {
      expect(WebVitalsService.rateTTFB(1801)).toBe('POOR');
    });
  });

  // ──────────────────────────────────────────────
  // Snapshot consolidado
  // ──────────────────────────────────────────────
  describe('getSnapshot', () => {
    it('retorna snapshot com todas as métricas necessárias', () => {
      const snap = WebVitalsService.getSnapshot();

      expect(snap).toHaveProperty('lcp');
      expect(snap).toHaveProperty('inp');
      expect(snap).toHaveProperty('cls');
      expect(snap).toHaveProperty('fcp');
      expect(snap).toHaveProperty('ttfb');
      expect(snap).toHaveProperty('overallRating');
      expect(snap).toHaveProperty('measuredAt');
    });

    it('retorna overallRating GOOD quando todas as métricas são GOOD', () => {
      const snap = WebVitalsService.getSnapshot();
      // Os valores simulados estão dentro do threshold GOOD
      expect(snap.overallRating).toBe('GOOD');
    });

    it('retorna measuredAt como ISO 8601 válido', () => {
      const snap = WebVitalsService.getSnapshot();
      expect(() => new Date(snap.measuredAt)).not.toThrow();
      expect(new Date(snap.measuredAt).toISOString()).toBe(snap.measuredAt);
    });

    it('cada métrica tem name, value, rating e targetThreshold', () => {
      const snap = WebVitalsService.getSnapshot();
      for (const key of ['lcp', 'inp', 'cls', 'fcp', 'ttfb'] as const) {
        const metric = snap[key];
        expect(metric.name).toBeTypeOf('string');
        expect(metric.value).toBeTypeOf('number');
        expect(['GOOD', 'NEEDS_IMPROVEMENT', 'POOR']).toContain(metric.rating);
        expect(metric.targetThreshold).toBeGreaterThan(0);
      }
    });
  });

  // ──────────────────────────────────────────────
  // initPerformanceObservers (sem crash em JSDOM)
  // ──────────────────────────────────────────────
  describe('initPerformanceObservers', () => {
    it('não lança exceção mesmo sem PerformanceObserver no JSDOM', () => {
      // JSDOM não suporta PerformanceObserver com "largest-contentful-paint"
      expect(() => WebVitalsService.initPerformanceObservers()).not.toThrow();
    });

    it('é silencioso quando window é undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error — simula SSR
      delete global.window;
      expect(() => WebVitalsService.initPerformanceObservers()).not.toThrow();
      global.window = originalWindow;
    });
  });
});
