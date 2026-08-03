import React, { useEffect, useCallback } from 'react';

// Layout
import { InstitutionalWrapper } from './components/layout/InstitutionalWrapper';

// Sections
import { HeroInstitutional } from './components/sections/HeroInstitutional';
import { ImpactMetrics } from './components/sections/ImpactMetrics';
import { MissionVisionValues } from './components/sections/MissionVisionValues';
import { TimelineSection } from './components/sections/TimelineSection';
import { IdentityAndNetwork } from './components/sections/IdentityAndNetwork';
import { ValuesSection } from './components/sections/ValuesSection';
import { GovernanceStructure } from './components/sections/GovernanceStructure';
import { TransparencyReport } from './components/sections/TransparencyReport';
import { PartnerSection } from './components/sections/PartnerSection';
import { DonationSection } from './components/sections/DonationSection';
import { ProgramsSection } from './components/sections/ProgramsSection';
import { PillarsSection } from './components/sections/PillarsSection';
import { NewsSection } from './components/sections/NewsSection';

// UI & Legal
import { Modal } from './components/ui/Modal';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfUse } from './components/legal/TermsOfUse';

// Data & Types
import { InstitutionalService } from './services/data';
import { AppData } from './types';

// Realtime hooks (onSnapshot — atualização em < 1s quando admin publica)
import {
  useRealtimeDocument,
  useRealtimeCollection,
  useRealtimeHero,
  useRealtimeNavigation,
  useRealtimeFooter,
  useRealtimeSeoSettings,
  useRealtimeInstitutionalPage,
  useRealtimeServicesPage,
  useRealtimeDonationSection,
  useRealtimeMetrics,
  useRealtimePillars,
  useRealtimeValueBlocks,
  useRealtimeGovernanceInstances,
  useRealtimeGovernanceMembers,
  useRealtimeTimeline,
  useRealtimePrograms,
  useRealtimeBlogPosts,
  useRealtimePublishedPartners,
} from './hooks/useRealtimeContent';

// ── SEO Helpers ────────────────────────────────────────────────────────────────

/**
 * Aplica ou atualiza uma meta tag pelo atributo de seleção.
 */
function setMeta(selector: string, attribute: string, content: string) {
  if (!content) return;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const parts = selector.match(/\[(.+?)="(.+?)"\]/);
    if (parts) el.setAttribute(parts[1], parts[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, content);
}

/**
 * Atualiza todos os metadados SEO (title, description, OG, Twitter, Schema.org).
 */
function applySeoSettings(seo: Record<string, any>) {
  if (!seo) return;

  // Title
  const title = seo.siteTitle || 'Instituto Ser Melhor';
  document.title = title;

  // Basic Meta
  setMeta('meta[name="description"]', 'content', seo.siteDescription || '');
  setMeta('meta[name="keywords"]', 'content', seo.keywords || '');
  setMeta('meta[name="robots"]', 'content', seo.robotsDirective || 'index, follow');

  // Canonical
  if (seo.canonicalUrl) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', seo.canonicalUrl);
  }

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', seo.ogTitle || title);
  setMeta('meta[property="og:description"]', 'content', seo.ogDescription || seo.siteDescription || '');
  setMeta('meta[property="og:image"]', 'content', seo.ogImage || seo.heroImage || '');
  setMeta('meta[property="og:url"]', 'content', seo.canonicalUrl || window.location.href);
  setMeta('meta[property="og:type"]', 'content', 'website');
  setMeta('meta[property="og:site_name"]', 'content', 'Instituto Ser Melhor');
  setMeta('meta[property="og:locale"]', 'content', 'pt_BR');

  // Twitter Cards
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', seo.twitterTitle || seo.ogTitle || title);
  setMeta('meta[name="twitter:description"]', 'content', seo.twitterDescription || seo.ogDescription || seo.siteDescription || '');
  setMeta('meta[name="twitter:image"]', 'content', seo.twitterImage || seo.ogImage || '');
  setMeta('meta[name="twitter:site"]', 'content', seo.twitterHandle || '@instsermelhor');

  // Schema.org JSON-LD — Organization
  const existingLd = document.getElementById('schema-org-organization');
  if (existingLd) existingLd.remove();

  const ldScript = document.createElement('script');
  ldScript.id = 'schema-org-organization';
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Instituto Ser Melhor',
    alternateName: 'ISM',
    url: seo.canonicalUrl || 'https://institutosermelhor.org',
    logo: seo.logoUrl || '/logo-ism.png',
    description: seo.siteDescription || '',
    foundingDate: '2022',
    email: seo.contactEmail || 'contato@institutosermelhor.org',
    sameAs: [
      'https://instagram.com/institutosermelhor',
      'https://facebook.com/institutosermelhor',
      'https://linkedin.com/company/institutosermelhor',
    ],
    areaServed: 'BR',
    nonprofitStatus: 'Nonprofit501c3',
  });
  document.head.appendChild(ldScript);

  // Google Analytics (se ainda não carregado)
  if (seo.googleAnalyticsId && !document.getElementById('ga-script')) {
    const gaScript = document.createElement('script');
    gaScript.id = 'ga-script';
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`;
    document.head.appendChild(gaScript);

    const gaConfig = document.createElement('script');
    gaConfig.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${seo.googleAnalyticsId}');`;
    document.head.appendChild(gaConfig);
  }
}

// ── Loading / Error Screens ────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-secondary-950">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-secondary-800 border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-ism.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-sm">Instituto Ser Melhor</p>
        <p className="text-secondary-500 text-xs mt-1 animate-pulse-slow">Carregando...</p>
      </div>
    </div>
  </div>
);

const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center h-screen bg-secondary-950">
    <div className="flex flex-col items-center gap-5 text-center px-6 max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl font-black">
        !
      </div>
      <div>
        <p className="text-white font-bold text-xl mb-2">Erro ao carregar dados</p>
        <p className="text-secondary-400 text-sm leading-relaxed">Não foi possível conectar ao sistema. Verifique sua conexão e tente novamente.</p>
      </div>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

// ── App State ─────────────────────────────────────────────────────────────────

interface AppState {
  data: AppData | null;
  servicesPage: Record<string, any> | null;
  error: boolean;
  isPrivacyOpen: boolean;
  isTermsOpen: boolean;
}

function App() {
  const [state, setState] = React.useState<AppState>({
    data: null,
    servicesPage: null,
    error: false,
    isPrivacyOpen: false,
    isTermsOpen: false,
  });

  // ── Realtime listeners — admin changes reflect in < 1s ───────────────────

  // Documentos únicos
  const realtimeHero       = useRealtimeHero<any>();
  const realtimeNav        = useRealtimeNavigation<any>();
  const realtimeFooter     = useRealtimeFooter<any>();
  const realtimeSeo        = useRealtimeSeoSettings<any>();
  const realtimeInstPage   = useRealtimeInstitutionalPage<any>();
  const realtimeServices   = useRealtimeServicesPage<any>();
  const realtimeDonation   = useRealtimeDonationSection<any>();

  // Coleções
  const realtimeMetrics          = useRealtimeMetrics<any>();
  const realtimePillars          = useRealtimePillars<any>();
  const realtimeValueBlocks      = useRealtimeValueBlocks<any>();
  const realtimeGovInstances     = useRealtimeGovernanceInstances<any>();
  const realtimeGovMembers       = useRealtimeGovernanceMembers<any>();
  const realtimeTimeline         = useRealtimeTimeline<any>();
  const realtimePrograms         = useRealtimePrograms<any>();
  const realtimeBlogPosts        = useRealtimeBlogPosts<any>();
  const realtimePartners         = useRealtimePublishedPartners<any>();

  // ── SEO — aplica em tempo real sempre que seo_settings mudar ────────────
  useEffect(() => {
    if (realtimeSeo) applySeoSettings(realtimeSeo);
  }, [realtimeSeo]);

  // ── Carga inicial (fallback para dados existentes no Firestore) ──────────
  // ── Carga inicial (resiliente com fallback para dados institucionais) ──────────
  const loadData = useCallback(async () => {
    setState(s => ({ ...s, error: false }));
    try {
      const results = await Promise.allSettled([
        InstitutionalService.getPage(),
        InstitutionalService.getValueBlocks(),
        InstitutionalService.getGovernanceInstances(),
        InstitutionalService.getTimelineMilestones(),
        InstitutionalService.getGovernanceMembers(),
        InstitutionalService.getPrograms(),
        InstitutionalService.getServicesPage(),
        InstitutionalService.getDonationSection(),
        InstitutionalService.getSeoSettings(),
        InstitutionalService.getMetrics(),
        InstitutionalService.getPillars(),
        InstitutionalService.getHeroSection(),
        InstitutionalService.getBlogPosts(),
      ]);

      const getValue = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
        result.status === 'fulfilled' ? result.value : fallback;

      const pageRes            = getValue(results[0], { data: { id: 1, attributes: {} as any }, meta: {} });
      const valuesRes          = getValue(results[1], { data: [], meta: {} });
      const governanceInstRes  = getValue(results[2], { data: [], meta: {} });
      const timelineRes        = getValue(results[3], { data: [], meta: {} });
      const membersRes         = getValue(results[4], { data: [], meta: {} });
      const programsRes        = getValue(results[5], []);
      const servicesPageRes    = getValue(results[6], null);
      const seoSettingsRes     = getValue(results[8], null);

      // Aplicar SEO inicial
      if (seoSettingsRes) applySeoSettings(seoSettingsRes);

      setState(s => ({
        ...s,
        servicesPage: servicesPageRes,
        data: {
          page: pageRes.data,
          valueBlocks: valuesRes.data,
          governanceInstances: governanceInstRes.data,
          timelineMilestones: timelineRes.data,
          governanceMembers: membersRes.data,
          programs: programsRes,
          financials: servicesPageRes?.financialSlices?.length
            ? servicesPageRes.financialSlices.map((s: any, i: number) => ({ id: i + 1, name: s.name, value: Number(s.value), color: s.color }))
            : [
                { id: 1, name: 'Programas', value: 75, color: '#16a34a' },
                { id: 2, name: 'Admin', value: 15, color: '#1e293b' },
                { id: 3, name: 'Captação', value: 10, color: '#94a3b8' },
              ],
        },
      }));
    } catch (err) {
      console.error('[ISM] Falha ao carregar dados institucionais:', err);
      // Fallback gracioso: define estado mínimo para não travar em tela de erro
      setState(s => ({
        ...s,
        error: false,
        data: s.data || {
          page: { id: 1, attributes: {} as any },
          valueBlocks: [],
          governanceInstances: [],
          timelineMilestones: [],
          governanceMembers: [],
          programs: [],
          financials: [],
        },
      }));
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Merge: Realtime sobrescreve dados da carga inicial ──────────────────

  const { data, servicesPage, error, isPrivacyOpen, isTermsOpen } = state;

  // Documentos únicos — usa realtime quando disponível, cai no carregamento inicial
  const activeHero     = realtimeHero     || null;
  const activeNav      = realtimeNav      || null;
  const activeFooter   = realtimeFooter   || null;
  const activeDonation = realtimeDonation || servicesPage;
  const activeServices = realtimeServices || servicesPage;

  // Dados da página institucional — garante objeto plano nunca undefined
  const DEFAULT_PAGE_ATTRS = {
    title: "Instituto Ser Melhor",
    introduction: "Somos uma organização não-governamental brasileira que atua como catalisadora de transformações sociais e ambientais.",
    missionStatement: "Promover a completa emancipação humana e o desenvolvimento sustentável integral, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais.",
    visionStatement: "Ser o fator decisivo na construção de um mundo equitativo, próspero e regenerativo.",
    governanceIntro: "A Governança do Instituto Ser Melhor é uma arquitetura de controle e deliberação desenhada para garantir a perpetuidade da Missão.",
    transparencyIntro: "Garantimos acesso irrestrito e auditado à nossa saúde financeira.",
    logoImage: "/logo-ism.png",
    heroImage: "https://picsum.photos/1920/1080?grayscale",
    motto: "Sapere Aude",
    mottoExplanation: "Significa 'Ouse Saber'. Reflete nosso valor de excelência inflexível e educação transformadora.",
    networkIntro: "O Instituto Ser Melhor reconhece que a excelência não é alcançada no isolamento.",
    logoExplanation: "O emblema circular com três figuras humanas estilizadas representa o nosso foco no Desenvolvimento Sustentável Integral.",
  };

  const activePageAttrs = {
    ...DEFAULT_PAGE_ATTRS,
    ...data?.page?.attributes,
    ...(realtimeInstPage || {}),
  };

  // Coleções — usa realtime quando disponível, cai no mock/fallback do data.ts
  const activeMetrics   = realtimeMetrics.length     > 0 ? realtimeMetrics   : [];
  const activePillars   = realtimePillars.length     > 0 ? realtimePillars   : [];
  const activeValues    = realtimeValueBlocks.length  > 0 ? realtimeValueBlocks  : (data?.valueBlocks ?? []);
  const activeGovInst   = realtimeGovInstances.length > 0 ? realtimeGovInstances : (data?.governanceInstances ?? []);
  const activeGovMem    = realtimeGovMembers.length   > 0 ? realtimeGovMembers   : (data?.governanceMembers ?? []);
  const activeTimeline  = realtimeTimeline.length     > 0 ? realtimeTimeline     : (data?.timelineMilestones ?? []);
  const activePrograms  = realtimePrograms.length     > 0 ? realtimePrograms     : (data?.programs ?? []);
  const activeBlog      = realtimeBlogPosts.length    > 0 ? realtimeBlogPosts    : [];
  const activePartners  = realtimePartners;

  // ── Normaliza coleções do Strapi para o formato plano ───────────────────
  function flattenStrapi<T>(items: any[]): T[] {
    if (!items || items.length === 0) return [];
    if (items[0]?.attributes !== undefined) {
      return items.map((item: any) => ({ id: item.id, ...item.attributes })) as T[];
    }
    return items as T[];
  }

  const flatValues    = flattenStrapi<any>(activeValues);
  const flatGovInst   = flattenStrapi<any>(activeGovInst);
  const flatGovMem    = flattenStrapi<any>(activeGovMem);
  const flatTimeline  = flattenStrapi<any>(activeTimeline);

  // ── Render Guards ───────────────────────────────────────────────────────
  if (error) return <ErrorScreen onRetry={loadData} />;
  if (!data && !realtimeInstPage) return <LoadingScreen />;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Skip to main content — keyboard a11y */}
      <a href="#main-content" className="skip-link">Ir para o conteúdo principal</a>

      <InstitutionalWrapper
        onOpenPrivacy={() => setState(s => ({ ...s, isPrivacyOpen: true }))}
        onOpenTerms={() => setState(s => ({ ...s, isTermsOpen: true }))}
        navData={activeNav}
        footerData={activeFooter}
      >
        <main id="main-content">
          {/* Hero — lê de hero_section/main (realtime) */}
          <HeroInstitutional
            data={activePageAttrs as any}
            heroSection={activeHero}
          />

          {/* Métricas de Impacto — lê de impact_metrics (realtime) */}
          <ImpactMetrics items={activeMetrics} />

          {/* Missão / Visão / Valores — lê de institutional_page/main (realtime) */}
          <MissionVisionValues data={activePageAttrs as any} />

          {/* Valores Institucionais — lê de value_blocks (realtime) */}
          <ValuesSection values={flatValues as any} />

          {/* Programas — lê de programs (realtime) */}
          <ProgramsSection
            programs={activePrograms as any}
            servicesPage={activeServices}
          />

          {/* Pilares — lê de pillars (realtime) */}
          <PillarsSection pillars={activePillars} />

          {/* Timeline — lê de timeline_milestones (realtime) */}
          <TimelineSection milestones={flatTimeline as any} />

          {/* Identidade & Rede — lê de institutional_page/main + services_page/main */}
          <IdentityAndNetwork
            pageData={activePageAttrs as any}
            networkCards={activeServices?.networkCards}
          />

          {/* Governança — lê de governance_instances + governance_members (realtime) */}
          <GovernanceStructure
            intro={activePageAttrs?.governanceIntro}
            instances={flatGovInst as any}
            members={flatGovMem as any}
          />

          {/* Transparência — lê de services_page/main (realtime) */}
          <TransparencyReport
            intro={activeServices?.transparencyIntro || activePageAttrs?.transparencyIntro}
            documents={
              activeServices?.transparencyDocuments?.length
                ? activeServices.transparencyDocuments
                : activePageAttrs?.transparencyDocuments
            }
            financials={data?.financials ?? []}
            efficiencyPct={activeServices?.efficiencyPct}
            integrityPillars={activeServices?.integrityPillars}
          />

          {/* Blog/Notícias — lê de blog_posts (realtime, filtro PUBLISHED) */}
          <NewsSection posts={activeBlog} />

          {/* Parceiros — lê de partners (realtime, filtro isPublished) + formulário de candidatura */}
          <PartnerSection
            servicesPage={activeServices}
            partners={activePartners}
          />

          {/* Doações — lê de donation_section/main (realtime) */}
          <DonationSection donationData={activeDonation} />
        </main>
      </InstitutionalWrapper>

      {/* Legal Modals */}
      <Modal
        isOpen={isPrivacyOpen}
        onClose={() => setState(s => ({ ...s, isPrivacyOpen: false }))}
        title="Política de Privacidade"
      >
        <PrivacyPolicy />
      </Modal>

      <Modal
        isOpen={isTermsOpen}
        onClose={() => setState(s => ({ ...s, isTermsOpen: false }))}
        title="Termos de Uso"
      >
        <TermsOfUse />
      </Modal>
    </>
  );
}

export default App;