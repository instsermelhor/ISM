/**
 * analyticsService.ts — F004: Motor de Analytics de Conversão GA4-Compatible
 * ──────────────────────────────────────────────────────────────────────────────
 * Rastreamento de eventos de conversão do funil de doação, engajamento e
 * comportamento de usuário, compatível com Google Analytics 4 (gtag.js).
 *
 * Eventos rastreados:
 *   Funil de Doação:  donation_started → payment_method_selected →
 *                     donation_submitted → donation_completed → receipt_downloaded
 *   Engajamento:      page_view, section_viewed, cta_clicked, scroll_depth
 *   Parceiros:        partner_viewed, esg_calculator_used
 *   PWA:              pwa_install_prompted, pwa_installed
 *   Erros:            donation_error, form_validation_error
 *
 * Referências: https://developers.google.com/analytics/devguides/collection/ga4
 */

// ─── Tipos de Eventos ────────────────────────────────────────────────────────

export type DonationEventName =
  | 'donation_started'
  | 'payment_method_selected'
  | 'donation_submitted'
  | 'donation_completed'
  | 'donation_error'
  | 'receipt_downloaded'
  | 'recurring_donation_setup';

export type EngagementEventName =
  | 'page_view'
  | 'section_viewed'
  | 'cta_clicked'
  | 'scroll_depth'
  | 'partner_viewed'
  | 'esg_calculator_used'
  | 'pwa_install_prompted'
  | 'pwa_installed'
  | 'form_validation_error'
  | 'language_changed'
  | 'search_performed';

export type AnalyticsEventName = DonationEventName | EngagementEventName;

export interface DonationEventParams {
  currency?: string;          // 'BRL'
  value?: number;             // valor em reais
  payment_method?: string;    // 'PIX' | 'CREDIT_CARD' | 'RECURRING'
  pillar?: string;            // pilar de impacto escolhido
  donation_type?: string;     // 'SINGLE' | 'RECURRING'
  error_message?: string;     // em caso de erro
  transaction_id?: string;    // ID da transação confirmada
}

export interface EngagementEventParams {
  section_name?: string;      // nome da seção visualizada
  cta_label?: string;         // texto do botão clicado
  cta_location?: string;      // onde o botão está (hero, footer, etc)
  scroll_percent?: number;    // 25 | 50 | 75 | 90 | 100
  partner_name?: string;      // nome do parceiro
  language?: string;          // 'PT' | 'EN' | 'ES'
  search_term?: string;       // termo buscado
  page_path?: string;         // caminho da página
  page_title?: string;        // título da página
}

export type AnalyticsEventParams = DonationEventParams & EngagementEventParams;

// ─── Estado Interno ──────────────────────────────────────────────────────────

interface ConversionFunnelState {
  sessionId: string;
  startedAt: string | null;
  lastEvent: AnalyticsEventName | null;
  eventCount: number;
  scrollMilestones: Set<number>;
}

let _funnelState: ConversionFunnelState = {
  sessionId: '',
  startedAt: null,
  lastEvent: null,
  eventCount: 0,
  scrollMilestones: new Set(),
};

// ─── Utilitários ─────────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreateSessionId(): string {
  if (_funnelState.sessionId) return _funnelState.sessionId;
  const stored = sessionStorage.getItem('ism_session_id');
  if (stored) {
    _funnelState.sessionId = stored;
    return stored;
  }
  const newId = generateSessionId();
  _funnelState.sessionId = newId;
  try { sessionStorage.setItem('ism_session_id', newId); } catch { /* ignore */ }
  return newId;
}

/**
 * Chama window.gtag se disponível (carregado pelo GA4 script em App.tsx)
 */
function callGtag(
  command: 'event',
  eventName: string,
  params: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag(command, eventName, params);
  }
}

/**
 * Empurra para o dataLayer (GTM-compatible)
 */
function pushDataLayer(eventName: string, params: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    const dl = ((window as any).dataLayer = (window as any).dataLayer || []);
    dl.push({ event: eventName, ...params });
  }
}

// ─── Serviço Principal ────────────────────────────────────────────────────────

export const AnalyticsService = {

  /**
   * Inicializa o motor de analytics — chame no mount do App.
   * Configura session ID e listener de scroll depth.
   */
  init(): void {
    getOrCreateSessionId();
    _funnelState.startedAt = new Date().toISOString();
    this._initScrollDepthTracker();
  },

  /**
   * Rastreia qualquer evento GA4 com parâmetros tipados.
   */
  track(eventName: AnalyticsEventName, params: AnalyticsEventParams = {}): void {
    _funnelState.lastEvent = eventName;
    _funnelState.eventCount += 1;

    const enrichedParams = {
      ...params,
      session_id: getOrCreateSessionId(),
      event_timestamp: new Date().toISOString(),
      currency: params.currency ?? 'BRL',
    };

    callGtag('event', eventName, enrichedParams);
    pushDataLayer(eventName, enrichedParams);

    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${eventName}`, enrichedParams);
    }
  },

  // ── Funil de Doação ────────────────────────────────────────────────────────

  /** Usuário abriu o formulário de doação */
  trackDonationStarted(pillar?: string): void {
    this.track('donation_started', { pillar, currency: 'BRL' });
  },

  /** Usuário escolheu método de pagamento */
  trackPaymentMethodSelected(method: 'PIX' | 'CREDIT_CARD' | 'RECURRING', value?: number): void {
    this.track('payment_method_selected', {
      payment_method: method,
      value,
      currency: 'BRL',
    });
  },

  /** Usuário clicou em "Confirmar Doação" */
  trackDonationSubmitted(params: { method: string; value: number; pillar?: string }): void {
    this.track('donation_submitted', {
      payment_method: params.method,
      value: params.value,
      pillar: params.pillar,
      currency: 'BRL',
    });
  },

  /** Doação confirmada com sucesso */
  trackDonationCompleted(params: {
    transactionId: string;
    value: number;
    method: string;
    pillar?: string;
  }): void {
    this.track('donation_completed', {
      transaction_id: params.transactionId,
      value: params.value,
      payment_method: params.method,
      pillar: params.pillar,
      currency: 'BRL',
    });
  },

  /** Erro no processo de doação */
  trackDonationError(errorMessage: string, method?: string): void {
    this.track('donation_error', {
      error_message: errorMessage,
      payment_method: method,
    });
  },

  /** Usuário baixou ou imprimiu o recibo */
  trackReceiptDownloaded(transactionId: string): void {
    this.track('receipt_downloaded', { transaction_id: transactionId });
  },

  /** Configuração de doação recorrente */
  trackRecurringDonationSetup(value: number): void {
    this.track('recurring_donation_setup', { value, donation_type: 'RECURRING', currency: 'BRL' });
  },

  // ── Engajamento ────────────────────────────────────────────────────────────

  /** Visualização de página (SPA page view) */
  trackPageView(path: string, title: string): void {
    this.track('page_view', { page_path: path, page_title: title });
  },

  /** Seção entrou no viewport (IntersectionObserver) */
  trackSectionViewed(sectionName: string): void {
    this.track('section_viewed', { section_name: sectionName });
  },

  /** Clique em CTA (Call to Action) */
  trackCTAClick(label: string, location: string): void {
    this.track('cta_clicked', { cta_label: label, cta_location: location });
  },

  /** Parceiro visualizado no portal */
  trackPartnerViewed(partnerName: string): void {
    this.track('partner_viewed', { partner_name: partnerName });
  },

  /** Calculadora ESG utilizada */
  trackESGCalculatorUsed(): void {
    this.track('esg_calculator_used');
  },

  /** Mudança de idioma */
  trackLanguageChanged(language: 'PT' | 'EN' | 'ES'): void {
    this.track('language_changed', { language });
  },

  /** Banner de instalação PWA exibido */
  trackPWAInstallPrompted(): void {
    this.track('pwa_install_prompted');
  },

  /** PWA instalado com sucesso */
  trackPWAInstalled(): void {
    this.track('pwa_installed');
  },

  // ── Estado do Funil ────────────────────────────────────────────────────────

  /** Retorna o estado atual do funil de conversão (para diagnóstico) */
  getFunnelState(): Readonly<Omit<ConversionFunnelState, 'scrollMilestones'> & {
    scrollMilestones: number[];
  }> {
    return {
      sessionId: _funnelState.sessionId,
      startedAt: _funnelState.startedAt,
      lastEvent: _funnelState.lastEvent,
      eventCount: _funnelState.eventCount,
      scrollMilestones: Array.from(_funnelState.scrollMilestones).sort((a, b) => a - b),
    };
  },

  /** Reseta o estado do funil (útil em testes) */
  resetFunnelState(): void {
    _funnelState = {
      sessionId: '',
      startedAt: null,
      lastEvent: null,
      eventCount: 0,
      scrollMilestones: new Set(),
    };
  },

  // ── Scroll Depth ───────────────────────────────────────────────────────────

  _initScrollDepthTracker(): void {
    if (typeof window === 'undefined' || !('addEventListener' in window)) return;

    const MILESTONES = [25, 50, 75, 90, 100];
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) { ticking = false; return; }
        const percent = Math.round((scrollTop / docHeight) * 100);

        MILESTONES.forEach((milestone) => {
          if (percent >= milestone && !_funnelState.scrollMilestones.has(milestone)) {
            _funnelState.scrollMilestones.add(milestone);
            this.track('scroll_depth', { scroll_percent: milestone });
          }
        });
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  },
};
