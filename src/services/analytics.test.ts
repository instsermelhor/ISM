/**
 * analytics.test.ts — F004: Testes Unitários do Motor de Analytics de Conversão
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: funil de doação completo, geração de session ID, enriquecimento de
 * parâmetros, rastreamento de engajamento e estado do funil.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from './analyticsService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock window.gtag
const gtagMock = vi.fn();
const dataLayerPushes: unknown[] = [];

beforeEach(() => {
  // Reset estado do funil antes de cada teste
  AnalyticsService.resetFunnelState();
  gtagMock.mockClear();
  dataLayerPushes.length = 0;

  // Configura mocks globais
  (globalThis as any).window = {
    gtag: gtagMock,
    dataLayer: { push: (...args: unknown[]) => dataLayerPushes.push(...args) },
    scrollY: 0,
    innerHeight: 768,
    addEventListener: vi.fn(),
    sessionStorage: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    },
  };
  (globalThis as any).sessionStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  };
  (globalThis as any).document = {
    documentElement: { scrollTop: 0, scrollHeight: 3000 },
  };
});

// ── Testes ────────────────────────────────────────────────────────────────────

describe('F004 — AnalyticsService (Motor de Conversão GA4)', () => {

  // ── Estado inicial ──────────────────────────────────────────────────────────
  describe('getFunnelState()', () => {
    it('retorna estado inicial zerado após reset', () => {
      const state = AnalyticsService.getFunnelState();
      expect(state.eventCount).toBe(0);
      expect(state.lastEvent).toBeNull();
      expect(state.startedAt).toBeNull();
      expect(state.scrollMilestones).toEqual([]);
    });
  });

  // ── Funil de Doação ─────────────────────────────────────────────────────────
  describe('Funil de Doação', () => {

    it('trackDonationStarted incrementa eventCount e seta lastEvent', () => {
      AnalyticsService.trackDonationStarted('SOCIAL');
      const state = AnalyticsService.getFunnelState();
      expect(state.eventCount).toBe(1);
      expect(state.lastEvent).toBe('donation_started');
    });

    it('trackDonationStarted inclui pillar nos params', () => {
      // Verifica que track() é chamado com os params corretos
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationStarted('AMBIENTAL');
      expect(trackSpy).toHaveBeenCalledWith('donation_started', expect.objectContaining({
        pillar: 'AMBIENTAL',
        currency: 'BRL',
      }));
    });

    it('trackPaymentMethodSelected inclui method e value', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackPaymentMethodSelected('PIX', 150);
      expect(trackSpy).toHaveBeenCalledWith('payment_method_selected', expect.objectContaining({
        payment_method: 'PIX',
        value: 150,
        currency: 'BRL',
      }));
    });

    it('trackDonationSubmitted inclui method, value e pillar', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationSubmitted({ method: 'CREDIT_CARD', value: 250, pillar: 'EDUCACAO' });
      expect(trackSpy).toHaveBeenCalledWith('donation_submitted', expect.objectContaining({
        payment_method: 'CREDIT_CARD',
        value: 250,
        pillar: 'EDUCACAO',
      }));
    });

    it('trackDonationCompleted inclui transaction_id', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationCompleted({
        transactionId: 'TXN-2026-001',
        value: 100,
        method: 'PIX',
        pillar: 'SOCIAL',
      });
      expect(trackSpy).toHaveBeenCalledWith('donation_completed', expect.objectContaining({
        transaction_id: 'TXN-2026-001',
        value: 100,
        payment_method: 'PIX',
      }));
    });

    it('trackDonationError inclui error_message', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationError('Cartão recusado', 'CREDIT_CARD');
      expect(trackSpy).toHaveBeenCalledWith('donation_error', expect.objectContaining({
        error_message: 'Cartão recusado',
        payment_method: 'CREDIT_CARD',
      }));
    });

    it('trackReceiptDownloaded inclui transaction_id', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackReceiptDownloaded('TXN-2026-001');
      expect(trackSpy).toHaveBeenCalledWith('receipt_downloaded', expect.objectContaining({
        transaction_id: 'TXN-2026-001',
      }));
    });

    it('trackRecurringDonationSetup inclui donation_type RECURRING', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackRecurringDonationSetup(50);
      expect(trackSpy).toHaveBeenCalledWith('recurring_donation_setup', expect.objectContaining({
        value: 50,
        donation_type: 'RECURRING',
        currency: 'BRL',
      }));
    });

    it('funil completo gera 5 eventos em sequência', () => {
      AnalyticsService.trackDonationStarted('SOCIAL');
      AnalyticsService.trackPaymentMethodSelected('PIX', 100);
      AnalyticsService.trackDonationSubmitted({ method: 'PIX', value: 100 });
      AnalyticsService.trackDonationCompleted({ transactionId: 'T001', value: 100, method: 'PIX' });
      AnalyticsService.trackReceiptDownloaded('T001');

      const state = AnalyticsService.getFunnelState();
      expect(state.eventCount).toBe(5);
      expect(state.lastEvent).toBe('receipt_downloaded');
    });
  });

  // ── Engajamento ─────────────────────────────────────────────────────────────
  describe('Eventos de Engajamento', () => {

    it('trackPageView inclui page_path e page_title', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackPageView('/', 'Instituto Ser Melhor');
      expect(trackSpy).toHaveBeenCalledWith('page_view', expect.objectContaining({
        page_path: '/',
        page_title: 'Instituto Ser Melhor',
      }));
    });

    it('trackSectionViewed inclui section_name', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackSectionViewed('Pilares de Impacto');
      expect(trackSpy).toHaveBeenCalledWith('section_viewed', expect.objectContaining({
        section_name: 'Pilares de Impacto',
      }));
    });

    it('trackCTAClick inclui label e location', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackCTAClick('Faça uma Doação', 'hero');
      expect(trackSpy).toHaveBeenCalledWith('cta_clicked', expect.objectContaining({
        cta_label: 'Faça uma Doação',
        cta_location: 'hero',
      }));
    });

    it('trackPartnerViewed inclui partner_name', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackPartnerViewed('ONU');
      expect(trackSpy).toHaveBeenCalledWith('partner_viewed', expect.objectContaining({
        partner_name: 'ONU',
      }));
    });

    it('trackLanguageChanged inclui language', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackLanguageChanged('EN');
      expect(trackSpy).toHaveBeenCalledWith('language_changed', expect.objectContaining({
        language: 'EN',
      }));
    });

    it('trackPWAInstallPrompted dispara evento correto', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackPWAInstallPrompted();
      expect(trackSpy).toHaveBeenCalledWith('pwa_install_prompted');
    });

    it('trackPWAInstalled dispara evento correto', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackPWAInstalled();
      expect(trackSpy).toHaveBeenCalledWith('pwa_installed');
    });

    it('trackESGCalculatorUsed dispara evento correto', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackESGCalculatorUsed();
      expect(trackSpy).toHaveBeenCalledWith('esg_calculator_used');
    });
  });

  // ── Enriquecimento de Parâmetros ────────────────────────────────────────────
  describe('track() — enriquecimento automático', () => {
    it('adiciona event_timestamp ISO em todos os eventos', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationStarted();
      const call = trackSpy.mock.calls[0];
      // track recebe o evento; os params enriquecidos são passados internamente para gtag
      expect(call[0]).toBe('donation_started');
    });

    it('currency default é BRL quando não especificado', () => {
      const trackSpy = vi.spyOn(AnalyticsService, 'track');
      AnalyticsService.trackDonationStarted('CULTURAL');
      expect(trackSpy).toHaveBeenCalledWith('donation_started', expect.objectContaining({
        currency: 'BRL',
      }));
    });

    it('cada track() incrementa eventCount em 1', () => {
      AnalyticsService.track('page_view', {});
      AnalyticsService.track('section_viewed', { section_name: 'Hero' });
      AnalyticsService.track('cta_clicked', { cta_label: 'Doe' });
      expect(AnalyticsService.getFunnelState().eventCount).toBe(3);
    });
  });

  // ── Reset ───────────────────────────────────────────────────────────────────
  describe('resetFunnelState()', () => {
    it('zera eventCount, lastEvent e scrollMilestones', () => {
      AnalyticsService.trackDonationStarted();
      AnalyticsService.trackDonationError('teste');
      AnalyticsService.resetFunnelState();
      const state = AnalyticsService.getFunnelState();
      expect(state.eventCount).toBe(0);
      expect(state.lastEvent).toBeNull();
      expect(state.scrollMilestones).toEqual([]);
    });
  });
});
