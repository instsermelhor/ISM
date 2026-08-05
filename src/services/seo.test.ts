/**
 * seo.test.ts — F003: Testes Unitários do Motor SEO & Schema.org
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: geração de JSON-LD, Open Graph, canonical URL e validação de schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  SEOService,
  SEO_SITE_URL,
  SEO_SITE_NAME,
} from './seoService';

describe('F003 — SEOService (Schema.org & Open Graph)', () => {

  // ── Organization Schema ──────────────────────────────────────────────────
  describe('buildOrganizationSchema()', () => {
    it('gera schema com @type NonprofitOrganization e NGO', () => {
      const schema = SEOService.buildOrganizationSchema();
      expect(schema['@type']).toContain('NonprofitOrganization');
      expect(schema['@type']).toContain('NGO');
    });

    it('inclui CNPJ correto no taxID', () => {
      const schema = SEOService.buildOrganizationSchema();
      expect(schema['taxID']).toBe('09.040.440/0001-47');
    });

    it('inclui foundingDate 2007', () => {
      const schema = SEOService.buildOrganizationSchema();
      expect(schema['foundingDate']).toBe('2007');
    });

    it('inclui @id e url corretos', () => {
      const schema = SEOService.buildOrganizationSchema();
      expect(schema['@id']).toBe(`${SEO_SITE_URL}/#organization`);
      expect(schema['url']).toBe(SEO_SITE_URL);
    });

    it('inclui logo com ImageObject', () => {
      const schema = SEOService.buildOrganizationSchema();
      const logo = schema['logo'] as Record<string, unknown>;
      expect(logo['@type']).toBe('ImageObject');
      expect(logo['url']).toContain('logo-ism.png');
    });
  });

  // ── DonateAction Schema ──────────────────────────────────────────────────
  describe('buildDonateActionSchema()', () => {
    it('gera schema @type DonateAction', () => {
      const schema = SEOService.buildDonateActionSchema();
      expect(schema['@type']).toBe('DonateAction');
    });

    it('aponta para URL de doação', () => {
      const schema = SEOService.buildDonateActionSchema();
      expect(schema['url']).toContain('#doacao');
    });

    it('referencia a organização como recipient', () => {
      const schema = SEOService.buildDonateActionSchema();
      const recipient = schema['recipient'] as Record<string, unknown>;
      expect(recipient['@type']).toBe('NGO');
      expect(recipient['name']).toBe('Instituto Ser Melhor');
    });
  });

  // ── FAQ Schema ───────────────────────────────────────────────────────────
  describe('buildFAQSchema()', () => {
    it('gera schema @type FAQPage', () => {
      const schema = SEOService.buildFAQSchema();
      expect(schema['@type']).toBe('FAQPage');
    });

    it('contém ao menos 5 perguntas', () => {
      const schema = SEOService.buildFAQSchema();
      const items = schema['mainEntity'] as unknown[];
      expect(items.length).toBeGreaterThanOrEqual(5);
    });

    it('cada pergunta possui Question e Answer', () => {
      const schema = SEOService.buildFAQSchema();
      const items = schema['mainEntity'] as Array<Record<string, unknown>>;
      items.forEach((item) => {
        expect(item['@type']).toBe('Question');
        const answer = item['acceptedAnswer'] as Record<string, unknown>;
        expect(answer['@type']).toBe('Answer');
        expect(typeof answer['text']).toBe('string');
        expect((answer['text'] as string).length).toBeGreaterThan(10);
      });
    });
  });

  // ── WebSite Schema ───────────────────────────────────────────────────────
  describe('buildWebSiteSchema()', () => {
    it('gera schema @type WebSite', () => {
      const schema = SEOService.buildWebSiteSchema();
      expect(schema['@type']).toBe('WebSite');
    });

    it('inclui potentialAction SearchAction', () => {
      const schema = SEOService.buildWebSiteSchema();
      const action = schema['potentialAction'] as Record<string, unknown>;
      expect(action['@type']).toBe('SearchAction');
    });

    it('inclui inLanguage pt-BR', () => {
      const schema = SEOService.buildWebSiteSchema();
      expect(schema['inLanguage']).toBe('pt-BR');
    });
  });

  // ── Breadcrumb Schema ────────────────────────────────────────────────────
  describe('buildBreadcrumbSchema()', () => {
    it('gera BreadcrumbList com posições corretas', () => {
      const schema = SEOService.buildBreadcrumbSchema([
        { name: 'Início', path: '/' },
        { name: 'Programas', path: '/programas' },
      ]);
      expect(schema['@type']).toBe('BreadcrumbList');
      const items = schema['itemListElement'] as Array<Record<string, unknown>>;
      expect(items[0]['position']).toBe(1);
      expect(items[1]['position']).toBe(2);
      expect(items[0]['name']).toBe('Início');
      expect(items[1]['item']).toBe(`${SEO_SITE_URL}/programas`);
    });
  });

  // ── Open Graph ───────────────────────────────────────────────────────────
  describe('buildOpenGraphMeta()', () => {
    const meta = {
      title: 'Instituto Ser Melhor — Doação',
      description: 'Apoie nossa missão.',
      path: '/doacao',
    };

    it('inclui og:title e og:description', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['og:title']).toBe(meta.title);
      expect(og['og:description']).toBe(meta.description);
    });

    it('inclui og:url com domínio correto', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['og:url']).toBe(`${SEO_SITE_URL}/doacao`);
    });

    it('inclui og:site_name igual ao SEO_SITE_NAME', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['og:site_name']).toBe(SEO_SITE_NAME);
    });

    it('inclui twitter:card summary_large_image', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['twitter:card']).toBe('summary_large_image');
    });

    it('usa og-default.png como imagem fallback', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['og:image']).toContain('og-default.png');
    });
  });

  // ── Utilitários ──────────────────────────────────────────────────────────
  describe('buildCanonicalUrl()', () => {
    it('retorna URL completa com domínio', () => {
      expect(SEOService.buildCanonicalUrl('/')).toBe(`${SEO_SITE_URL}/`);
      expect(SEOService.buildCanonicalUrl('/programas')).toBe(`${SEO_SITE_URL}/programas`);
    });

    it('adiciona barra inicial se ausente', () => {
      expect(SEOService.buildCanonicalUrl('sobre')).toBe(`${SEO_SITE_URL}/sobre`);
    });
  });

  describe('serializeSchema()', () => {
    it('serializa JSON-LD sem espaços (minificado)', () => {
      const schema = { '@context': 'https://schema.org', '@type': 'NGO' };
      const result = SEOService.serializeSchema(schema);
      expect(result).toContain('schema.org');
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('validateSchema()', () => {
    it('valida schema correto com @context e @type', () => {
      const valid = SEOService.buildOrganizationSchema();
      expect(SEOService.validateSchema(valid)).toBe(true);
    });

    it('rejeita schema sem @type', () => {
      const invalid = { '@context': 'https://schema.org' };
      expect(SEOService.validateSchema(invalid)).toBe(false);
    });

    it('rejeita schema sem @context correto', () => {
      const invalid = { '@context': 'http://example.com', '@type': 'Thing' };
      expect(SEOService.validateSchema(invalid)).toBe(false);
    });
  });

  // ── buildHomepageSchemas ─────────────────────────────────────────────────
  describe('buildHomepageSchemas()', () => {
    it('retorna os 4 schemas da homepage', () => {
      const schemas = SEOService.buildHomepageSchemas();
      expect(schemas).toHaveLength(4);
      const types = schemas.map((s) => s.type);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('DonateAction');
      expect(types).toContain('FAQPage');
    });

    it('todos os schemas passam pela validação', () => {
      const schemas = SEOService.buildHomepageSchemas();
      schemas.forEach(({ json }) => {
        expect(SEOService.validateSchema(json)).toBe(true);
      });
    });
  });
});
