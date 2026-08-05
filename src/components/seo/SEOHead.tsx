/**
 * SEOHead.tsx — F003: Componente de Injeção Dinâmica de SEO
 * ──────────────────────────────────────────────────────────
 * Injeta no <head> do documento:
 *   - Title e meta description dinâmicos por página
 *   - Meta tags Open Graph e Twitter Cards
 *   - Link canonical
 *   - JSON-LD Schema.org (múltiplos schemas via <script> tags)
 *   - Meta robots (noindex/nofollow opcional)
 *
 * Uso: <SEOHead meta={...} schemas={[...]} />
 */

import { useEffect } from 'react';
import { SEOService, type SEOPageMeta, type SchemaOrgScript } from '../../services/seoService';

interface SEOHeadProps {
  meta: SEOPageMeta;
  schemas?: SchemaOrgScript[];
}

/** Remove todas as meta tags og: e twitter: anteriores (evita duplicação) */
function cleanPreviousOGTags(): void {
  document
    .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
    .forEach((el) => el.remove());
}

/** Remove todos os scripts JSON-LD anteriores injetados por este componente */
function cleanPreviousJsonLD(): void {
  document
    .querySelectorAll('script[data-seo-jsonld]')
    .forEach((el) => el.remove());
}

/** Remove link canonical anterior */
function cleanPreviousCanonical(): void {
  document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
}

export function SEOHead({ meta, schemas = [] }: SEOHeadProps): null {
  useEffect(() => {
    // ── Title ───────────────────────────────────────────────
    document.title = meta.title;

    // ── Meta description ────────────────────────────────────
    let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    descEl.content = meta.description;

    // ── Meta keywords ───────────────────────────────────────
    if (meta.keywords) {
      let kwEl = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (!kwEl) {
        kwEl = document.createElement('meta');
        kwEl.name = 'keywords';
        document.head.appendChild(kwEl);
      }
      kwEl.content = meta.keywords;
    }

    // ── Robots ──────────────────────────────────────────────
    let robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.name = 'robots';
      document.head.appendChild(robotsEl);
    }
    robotsEl.content = meta.noindex ? 'noindex, nofollow' : 'index, follow';

    // ── Canonical ───────────────────────────────────────────
    cleanPreviousCanonical();
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = SEOService.buildCanonicalUrl(meta.path);
    document.head.appendChild(canonical);

    // ── Open Graph + Twitter Cards ──────────────────────────
    cleanPreviousOGTags();
    const ogMeta = SEOService.buildOpenGraphMeta(meta);
    Object.entries(ogMeta).forEach(([key, content]) => {
      const el = document.createElement('meta');
      if (key.startsWith('twitter:')) {
        el.setAttribute('name', key);
      } else {
        el.setAttribute('property', key);
      }
      el.content = content;
      document.head.appendChild(el);
    });

    // ── JSON-LD Schema.org ──────────────────────────────────
    cleanPreviousJsonLD();
    schemas.forEach(({ json }) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = SEOService.serializeSchema(json);
      document.head.appendChild(script);
    });
  }, [meta, schemas]);

  return null; // Componente headless — sem renderização visual
}
