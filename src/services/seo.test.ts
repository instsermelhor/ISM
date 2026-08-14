/**
 * seo.test.ts — SEO-002: Testes Unitários do Motor SEO & Schema.org Rich Results
 * ──────────────────────────────────────────────────────────────────────────────
 * Cobre: geração de JSON-LD, Open Graph, canonical URL, NewsArticle, Event,
 * FundraisingCampaign, SROICalculator, TransparencyReport e validação de schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  SEOService,
  SEO_SITE_URL,
  SEO_SITE_NAME,
} from './seoService';

describe('SEO-002 — SEOService (Schema.org & Rich Results)', () => {

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

  // ── NewsArticle Schema (SEO-002) ─────────────────────────────────────────
  describe('buildNewsArticleSchema()', () => {
    it('gera schema NewsArticle com headline, datas e publisher', () => {
      const article = {
        headline: 'Instituto Ser Melhor inaugura novo polo em Minas Gerais',
        description: 'Expansão de atividades sociais no Vale do Jequitinhonha.',
        path: '/noticias/polo-minas-gerais',
        datePublished: '2026-08-10T10:00:00Z',
        authorName: 'Equipe de Comunicação',
        category: 'Expansão Regional',
      };

      const schema = SEOService.buildNewsArticleSchema(article);
      expect(schema['@type']).toBe('NewsArticle');
      expect(schema['headline']).toBe(article.headline);
      expect(schema['datePublished']).toBe(article.datePublished);
      expect(schema['inLanguage']).toBe('pt-BR');

      const publisher = schema['publisher'] as Record<string, unknown>;
      expect(publisher['name']).toBe('Instituto Ser Melhor');
      expect(SEOService.validateSchema(schema)).toBe(true);
    });
  });

  // ── Event Schema (SEO-002) ───────────────────────────────────────────────
  describe('buildEventSchema()', () => {
    it('gera schema Event presencial com local e gratuidade', () => {
      const event = {
        name: 'Mutirão de Voluntariado — Plantio de Mudas Nativas',
        description: 'Ação de restauração ecológica da Mata Atlântica.',
        startDate: '2026-09-15T09:00:00Z',
        endDate: '2026-09-15T16:00:00Z',
        locationName: 'Parque Ecológico Ser Melhor',
        locationAddress: 'Rua das Palmeiras, 100, São Paulo, SP',
      };

      const schema = SEOService.buildEventSchema(event);
      expect(schema['@type']).toBe('Event');
      expect(schema['name']).toBe(event.name);
      expect(schema['isAccessibleForFree']).toBe(true);
      expect(schema['eventAttendanceMode']).toContain('OfflineEventAttendanceMode');
      expect(SEOService.validateSchema(schema)).toBe(true);
    });

    it('gera schema Event virtual quando isVirtual é true', () => {
      const virtualEvent = {
        name: 'Webinar: Governança e ESG no Terceiro Setor',
        description: 'Discussão sobre transparência e impacto.',
        startDate: '2026-09-20T19:00:00Z',
        locationName: 'Online',
        isVirtual: true,
        virtualUrl: 'https://www.youtube.com/@institutosermelhor',
      };

      const schema = SEOService.buildEventSchema(virtualEvent);
      expect(schema['eventAttendanceMode']).toContain('OnlineEventAttendanceMode');
      const location = schema['location'] as Record<string, unknown>;
      expect(location['@type']).toBe('VirtualLocation');
    });
  });

  // ── Fundraising Campaign Schema (SEO-002) ────────────────────────────────
  describe('buildFundraisingCampaignSchema()', () => {
    it('gera schema Project com DonateAction e metas de captação', () => {
      const campaign = {
        name: 'Educação para o Futuro 2026',
        description: 'Captação para compra de materiais didáticos.',
        path: '/campanhas/educacao-2026',
        targetAmount: 50000,
        currentAmount: 28500,
      };

      const schema = SEOService.buildFundraisingCampaignSchema(campaign);
      expect(schema['@type']).toBe('Project');
      expect(schema['name']).toBe(campaign.name);

      const action = schema['potentialAction'] as Record<string, unknown>;
      expect(action['@type']).toBe('DonateAction');
      expect(action['price']).toBe(50000);
      expect(action['priceCurrency']).toBe('BRL');
    });
  });

  // ── SROI Calculator Schema (SEO-002) ─────────────────────────────────────
  describe('buildSROICalculatorSchema()', () => {
    it('gera schema WebApplication com categoria e gratuidade', () => {
      const schema = SEOService.buildSROICalculatorSchema();
      expect(schema['@type']).toBe('WebApplication');
      expect(schema['applicationCategory']).toBe('BusinessApplication');

      const offers = schema['offers'] as Record<string, unknown>;
      expect(offers['price']).toBe('0');
      expect(SEOService.validateSchema(schema)).toBe(true);
    });
  });

  // ── Transparency Report Schema (SEO-002) ─────────────────────────────────
  describe('buildTransparencyReportSchema()', () => {
    it('gera schema DigitalDocument com formato PDF e publisher', () => {
      const report = {
        name: 'Relatório Anual de Atividades e Demonstrações Financeiras 2025',
        description: 'Balanço auditado e prestação de contas.',
        fileUrl: `${SEO_SITE_URL}/docs/relatorio-2025.pdf`,
        datePublished: '2026-03-31',
      };

      const schema = SEOService.buildTransparencyReportSchema(report);
      expect(schema['@type']).toBe('DigitalDocument');
      expect(schema['encodingFormat']).toBe('application/pdf');
      expect(schema['url']).toContain('.pdf');
      expect(SEOService.validateSchema(schema)).toBe(true);
    });
  });

  // ── Open Graph ───────────────────────────────────────────────────────────
  describe('buildOpenGraphMeta()', () => {
    const meta = {
      title: 'Instituto Ser Melhor — Doação',
      description: 'Apoie nossa missão.',
      path: '/doacao',
      publishedTime: '2026-08-14T00:00:00Z',
      author: 'Instituto Ser Melhor',
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

    it('inclui twitter:card summary_large_image e twitter:site @instsermelhor', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['twitter:card']).toBe('summary_large_image');
      expect(og['twitter:site']).toBe('@instsermelhor');
    });

    it('inclui article:published_time e article:author quando informados', () => {
      const og = SEOService.buildOpenGraphMeta(meta);
      expect(og['article:published_time']).toBe('2026-08-14T00:00:00Z');
      expect(og['article:author']).toBe('Instituto Ser Melhor');
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
    it('retorna os schemas completos da homepage incluindo SROICalculator', () => {
      const schemas = SEOService.buildHomepageSchemas();
      expect(schemas.length).toBeGreaterThanOrEqual(5);
      const types = schemas.map((s) => s.type);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('DonateAction');
      expect(types).toContain('FAQPage');
      expect(types).toContain('SROICalculator');
    });

    it('todos os schemas passam pela validação', () => {
      const schemas = SEOService.buildHomepageSchemas();
      schemas.forEach(({ json }) => {
        expect(SEOService.validateSchema(json)).toBe(true);
      });
    });
  });
});
