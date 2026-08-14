/**
 * seoService.ts — SEO-002: Motor de SEO Avançado & Schema.org Dados Estruturados
 * ──────────────────────────────────────────────────────────────────────────────
 * Gera JSON-LD (Schema.org) para rich results no Google:
 *   - NonprofitOrganization  → Painel de conhecimento (Knowledge Panel)
 *   - DonateAction           → Ação de Doação indexável
 *   - FAQPage                → Perguntas Frequentes com rich result
 *   - BreadcrumbList         → Breadcrumb de navegação
 *   - WebSite + SearchAction → Sitelinks Search Box
 *   - NewsArticle            → Notícias e artigos de blog
 *   - Event                  → Ações e campanhas de voluntariado
 *   - Project / Fundraising  → Campanhas com meta de captação
 *   - WebApplication         → Calculadora de SROI
 *   - DigitalDocument        → Relatórios de transparência auditados
 *
 * Referências: https://schema.org | https://developers.google.com/search/docs/appearance/structured-data
 */

export const SEO_SITE_URL = 'https://www.institutosermelhor.org';
export const SEO_SITE_NAME = 'Instituto Ser Melhor';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface SEOPageMeta {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export interface SchemaOrgScript {
  type: string;
  json: Record<string, unknown>;
}

export interface ArticleSchemaData {
  headline: string;
  description: string;
  path: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  category?: string;
}

export interface EventSchemaData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  locationName: string;
  locationAddress?: string;
  isVirtual?: boolean;
  virtualUrl?: string;
  imageUrl?: string;
}

export interface CampaignSchemaData {
  name: string;
  description: string;
  path: string;
  targetAmount: number;
  currentAmount: number;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
}

export interface ReportSchemaData {
  name: string;
  description: string;
  fileUrl: string;
  datePublished: string;
  fileFormat?: string;
}

// ─── Serviço ─────────────────────────────────────────────────────────────────

export const SEOService = {

  /**
   * Gera o JSON-LD da organização sem fins lucrativos (NonprofitOrganization)
   * https://schema.org/NGO
   */
  buildOrganizationSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': ['NonprofitOrganization', 'NGO'],
      '@id': `${SEO_SITE_URL}/#organization`,
      name: 'Instituto Ser Melhor',
      alternateName: 'ISM',
      legalName: 'Instituto Ser Melhor',
      url: SEO_SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_SITE_URL}/logo-ism.png`,
        width: 512,
        height: 512,
      },
      foundingDate: '2007',
      description:
        'ONG brasileira que catalisa transformações sociais, ambientais, educacionais e culturais em comunidades vulneráveis. Presente em 12 estados com mais de 47.000 impactos diretos.',
      taxID: '09.040.440/0001-47',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BR',
        addressLocality: 'Brasil',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Brasil',
      },
      knowsAbout: [
        'Transformação Social',
        'Sustentabilidade Ambiental',
        'Educação Inclusiva',
        'Cultura e Artes',
        'Desenvolvimento Comunitário',
        'ODS — Objetivos de Desenvolvimento Sustentável',
      ],
      sameAs: [
        'https://www.instagram.com/institutosermelhor',
        'https://www.facebook.com/institutosermelhor',
        'https://www.linkedin.com/company/instituto-ser-melhor',
        'https://www.youtube.com/@institutosermelhor',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['Portuguese'],
        email: 'contato@institutosermelhor.org',
      },
    };
  },

  /**
   * Gera JSON-LD para ação de doação (DonateAction)
   * https://schema.org/DonateAction
   */
  buildDonateActionSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'DonateAction',
      name: 'Faça uma doação ao Instituto Ser Melhor',
      description:
        'Apoie projetos de transformação social, ambiental, educacional e cultural. Cada R$ 1,00 doado gera até R$ 4,20 de retorno social (SROI).',
      url: `${SEO_SITE_URL}/#doacao`,
      recipient: {
        '@type': 'NGO',
        name: 'Instituto Ser Melhor',
        '@id': `${SEO_SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'DonateAction',
        target: `${SEO_SITE_URL}/#doacao`,
      },
    };
  },

  /**
   * Gera JSON-LD para Perguntas Frequentes (FAQPage)
   * https://schema.org/FAQPage — exibe rich result de FAQ no Google
   */
  buildFAQSchema(): Record<string, unknown> {
    const faqs = [
      {
        question: 'O que é o Instituto Ser Melhor?',
        answer:
          'O Instituto Ser Melhor é uma ONG brasileira fundada em 2007 que catalisa transformações sociais, ambientais, educacionais e culturais em comunidades vulneráveis. Atuamos com foco nos Objetivos de Desenvolvimento Sustentável (ODS) da ONU.',
      },
      {
        question: 'Como posso fazer uma doação?',
        answer:
          'Você pode fazer uma doação via PIX (chave CNPJ: 09.040.440/0001-47), cartão de crédito ou doação recorrente mensal diretamente em nosso site. Emitimos recibo oficial para todos os doadores.',
      },
      {
        question: 'Minha doação é dedutível do Imposto de Renda?',
        answer:
          'Sim! Como somos uma OSCIP qualificada, doações ao Instituto Ser Melhor podem ser deduzidas do Imposto de Renda de Pessoa Jurídica (IRPJ). Consulte nosso time pelo e-mail contato@institutosermelhor.org para informações específicas.',
      },
      {
        question: 'Onde posso acompanhar a transparência financeira?',
        answer:
          'Publicamos relatórios anuais auditados, balanços financeiros e indicadores de impacto em nossa seção de Transparência. Todos os documentos estão disponíveis para consulta pública.',
      },
      {
        question: 'Em quais estados o Instituto atua?',
        answer:
          'Atuamos em 12 estados brasileiros com projetos nas áreas de saúde, educação, meio ambiente, cultura e desenvolvimento econômico comunitário, impactando mais de 47.000 pessoas diretamente.',
      },
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  },

  /**
   * Gera JSON-LD para Sitelinks Search Box
   * https://developers.google.com/search/docs/appearance/sitelinks-searchbox
   */
  buildWebSiteSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SEO_SITE_URL}/#website`,
      url: SEO_SITE_URL,
      name: 'Instituto Ser Melhor',
      description: 'Catalisadores de transformações sociais, ambientais, educacionais e culturais.',
      inLanguage: 'pt-BR',
      publisher: {
        '@id': `${SEO_SITE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SEO_SITE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  },

  /**
   * Gera JSON-LD de BreadcrumbList para uma página específica
   * https://schema.org/BreadcrumbList
   */
  buildBreadcrumbSchema(
    crumbs: Array<{ name: string; path: string }>
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: `${SEO_SITE_URL}${crumb.path}`,
      })),
    };
  },

  /**
   * Gera JSON-LD para Artigos e Notícias (NewsArticle / BlogPosting) — SEO-002
   * https://developers.google.com/search/docs/appearance/structured-data/article
   */
  buildNewsArticleSchema(article: ArticleSchemaData): Record<string, unknown> {
    const imageUrl = article.imageUrl || `${SEO_SITE_URL}/og-default.png`;
    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SEO_SITE_URL}${article.path}`,
      },
      headline: article.headline,
      description: article.description,
      image: [imageUrl],
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Organization',
        name: article.authorName || 'Instituto Ser Melhor',
        url: SEO_SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Instituto Ser Melhor',
        url: SEO_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SEO_SITE_URL}/logo-ism.png`,
        },
      },
      inLanguage: 'pt-BR',
      articleSection: article.category || 'Impacto Social',
    };
  },

  /**
   * Gera JSON-LD para Eventos e Voluntariado (Event / SocialEvent) — SEO-002
   * https://developers.google.com/search/docs/appearance/structured-data/event
   */
  buildEventSchema(event: EventSchemaData): Record<string, unknown> {
    const location = event.isVirtual
      ? {
          '@type': 'VirtualLocation',
          url: event.virtualUrl || SEO_SITE_URL,
        }
      : {
          '@type': 'Place',
          name: event.locationName,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.locationAddress || 'Brasil',
            addressCountry: 'BR',
          },
        };

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      description: event.description,
      image: [event.imageUrl || `${SEO_SITE_URL}/og-default.png`],
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: event.isVirtual
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      location,
      organizer: {
        '@type': 'NGO',
        name: 'Instituto Ser Melhor',
        url: SEO_SITE_URL,
      },
      isAccessibleForFree: true,
      inLanguage: 'pt-BR',
    };
  },

  /**
   * Gera JSON-LD para Campanhas de Arrecadação (Project com MonetaryGrant) — SEO-002
   */
  buildFundraisingCampaignSchema(campaign: CampaignSchemaData): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Project',
      name: campaign.name,
      description: campaign.description,
      url: `${SEO_SITE_URL}${campaign.path}`,
      image: campaign.imageUrl || `${SEO_SITE_URL}/og-default.png`,
      funder: {
        '@type': 'NGO',
        name: 'Instituto Ser Melhor',
      },
      potentialAction: {
        '@type': 'DonateAction',
        name: `Doar para ${campaign.name}`,
        target: `${SEO_SITE_URL}${campaign.path}`,
        price: campaign.targetAmount,
        priceCurrency: 'BRL',
      },
    };
  },

  /**
   * Gera JSON-LD para Calculadora de SROI (WebApplication) — SEO-002
   */
  buildSROICalculatorSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Calculadora de SROI — Instituto Ser Melhor',
      description:
        'Ferramenta pública e interativa de cálculo do Retorno Social sobre o Investimento (SROI) para projetos e doações.',
      url: `${SEO_SITE_URL}/#sroi`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      provider: {
        '@type': 'NGO',
        name: 'Instituto Ser Melhor',
      },
    };
  },

  /**
   * Gera JSON-LD para Relatório de Transparência Auditado (DigitalDocument) — SEO-002
   */
  buildTransparencyReportSchema(report: ReportSchemaData): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'DigitalDocument',
      name: report.name,
      description: report.description,
      url: report.fileUrl,
      encodingFormat: report.fileFormat || 'application/pdf',
      datePublished: report.datePublished,
      publisher: {
        '@type': 'NGO',
        name: 'Instituto Ser Melhor',
      },
      inLanguage: 'pt-BR',
    };
  },

  /**
   * Gera o conjunto completo de schemas para a página principal
   */
  buildHomepageSchemas(): SchemaOrgScript[] {
    return [
      { type: 'Organization', json: this.buildOrganizationSchema() },
      { type: 'WebSite', json: this.buildWebSiteSchema() },
      { type: 'DonateAction', json: this.buildDonateActionSchema() },
      { type: 'FAQPage', json: this.buildFAQSchema() },
      { type: 'SROICalculator', json: this.buildSROICalculatorSchema() },
    ];
  },

  /**
   * Monta as meta tags Open Graph de uma página
   */
  buildOpenGraphMeta(meta: SEOPageMeta): Record<string, string> {
    const ogImage = meta.ogImage ?? `${SEO_SITE_URL}/og-default.png`;
    const fullUrl = `${SEO_SITE_URL}${meta.path}`;

    const tags: Record<string, string> = {
      'og:title': meta.title,
      'og:description': meta.description,
      'og:type': meta.ogType ?? 'website',
      'og:url': fullUrl,
      'og:image': ogImage,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': meta.title,
      'og:site_name': SEO_SITE_NAME,
      'og:locale': 'pt_BR',
      // Twitter Cards
      'twitter:card': 'summary_large_image',
      'twitter:title': meta.title,
      'twitter:description': meta.description,
      'twitter:image': ogImage,
      'twitter:image:alt': meta.title,
      'twitter:site': '@instsermelhor',
    };

    if (meta.publishedTime) {
      tags['article:published_time'] = meta.publishedTime;
    }
    if (meta.modifiedTime) {
      tags['article:modified_time'] = meta.modifiedTime;
    }
    if (meta.author) {
      tags['article:author'] = meta.author;
    }
    if (meta.section) {
      tags['article:section'] = meta.section;
    }

    return tags;
  },

  /**
   * Serializa um schema para injeção no DOM como <script type="application/ld+json">
   */
  serializeSchema(schema: Record<string, unknown>): string {
    return JSON.stringify(schema, null, 0);
  },

  /**
   * Gera canonical URL para uma path relativa
   */
  buildCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SEO_SITE_URL}${cleanPath}`;
  },

  /**
   * Extrai e valida que um JSON-LD possui o @type obrigatório
   */
  validateSchema(schema: Record<string, unknown>): boolean {
    return (
      typeof schema['@context'] === 'string' &&
      schema['@context'].includes('schema.org') &&
      ('@type' in schema)
    );
  },
};
