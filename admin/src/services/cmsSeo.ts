/**
 * CMS SEO Manager Service
 * ────────────────────────
 * Gerencia as configurações avançadas de SEO da plataforma:
 *  - Título, Descrição, Canonical
 *  - OpenGraph (FB/LinkedIn/WhatsApp)
 *  - Twitter Cards
 *  - JSON-LD Structured Data (Schema.org)
 *  - Breadcrumbs, Robots, Hreflang (multi-idioma)
 *
 * Documento Firestore: seo_settings/main
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SeoSettings {
  // Básico
  siteTitle: string;        // Máx 60 chars
  siteDescription: string;  // Máx 160 chars
  canonical?: string;

  // OpenGraph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;         // 1200x630px recomendado

  // Twitter Cards
  twitterCard?: 'summary' | 'summary_large_image';
  twitterHandle?: string;

  // JSON-LD Schema.org
  jsonLdEnabled?: boolean;
  organizationName?: string;
  organizationUrl?: string;
  organizationLogo?: string;
  organizationFoundingYear?: string;
  organizationPhone?: string;
  organizationEmail?: string;
  organizationAddress?: string;

  // Técnico
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleSearchConsoleToken?: string;
  metaPixelId?: string;
  robotsDirective?: 'index,follow' | 'noindex,nofollow' | 'index,nofollow';
  keywords?: string;

  // Internacionalização
  defaultLanguage?: 'pt-BR' | 'en' | 'es';

  updatedAt?: unknown;
  updatedBy?: string;
}

const DOC_PATH = 'seo_settings/main';

export const CMSSeoService = {

  async get(): Promise<SeoSettings | null> {
    const ref = doc(db, 'seo_settings', 'main');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as SeoSettings;
  },

  async save(data: Partial<SeoSettings>, userId = 'system'): Promise<void> {
    const ref = doc(db, 'seo_settings', 'main');
    await setDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }, { merge: true });
  },

  /**
   * Gera o JSON-LD completo de NGO/Organization para ser
   * injetado no <head> do portal público via Astro SSR.
   */
  generateJsonLd(settings: SeoSettings): string {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NGO',
      'name': settings.organizationName || 'Instituto Ser Melhor',
      'url': settings.organizationUrl || 'https://institutosermelhor.org',
      'logo': settings.organizationLogo,
      'foundingDate': settings.organizationFoundingYear,
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': settings.organizationPhone,
        'email': settings.organizationEmail,
        'contactType': 'Atendimento Institucional',
        'areaServed': 'BR',
        'availableLanguage': 'Portuguese',
      },
      'address': settings.organizationAddress ? {
        '@type': 'PostalAddress',
        'addressLocality': settings.organizationAddress,
        'addressCountry': 'BR',
      } : undefined,
    };
    return JSON.stringify(jsonLd, null, 2);
  },
};
