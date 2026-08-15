import React, { useEffect, useCallback, Suspense, lazy } from 'react';

// Layout Crítico (Above the Fold — Eager)
import { InstitutionalWrapper } from './components/layout/InstitutionalWrapper';
import { HeroInstitutional } from './components/sections/HeroInstitutional';
import { ImpactMetrics } from './components/sections/ImpactMetrics';
import { MissionVisionValues } from './components/sections/MissionVisionValues';
import { ValuesSection } from './components/sections/ValuesSection';
import { ProgramsSection } from './components/sections/ProgramsSection';
import { PillarsSection } from './components/sections/PillarsSection';
import { DonationSection } from './components/sections/DonationSection';

// Seções Below the Fold & Componentes Interativos (Lazy Loaded — PERF-001)
const SROICalculator = lazy(() => import('./components/sections/SROICalculator').then(m => ({ default: m.SROICalculator })));
const TimelineSection = lazy(() => import('./components/sections/TimelineSection').then(m => ({ default: m.TimelineSection })));
const IdentityAndNetwork = lazy(() => import('./components/sections/IdentityAndNetwork').then(m => ({ default: m.IdentityAndNetwork })));
const GovernanceStructure = lazy(() => import('./components/sections/GovernanceStructure').then(m => ({ default: m.GovernanceStructure })));
const TransparencyReport = lazy(() => import('./components/sections/TransparencyReport').then(m => ({ default: m.TransparencyReport })));
const NewsSection = lazy(() => import('./components/sections/NewsSection').then(m => ({ default: m.NewsSection })));
const PartnerSection = lazy(() => import('./components/sections/PartnerSection').then(m => ({ default: m.PartnerSection })));
const PartnersESGSection = lazy(() => import('./components/sections/PartnersESGSection').then(m => ({ default: m.PartnersESGSection })));
const AtuacaoMapSection = lazy(() => import('./components/sections/AtuacaoMapSection').then(m => ({ default: m.AtuacaoMapSection })));
const CampaignGoalsSection = lazy(() => import('./components/sections/CampaignGoalsSection').then(m => ({ default: m.CampaignGoalsSection })));

// UI & Legal (Lazy Loaded — PERF-001)
import { Modal } from './components/ui/Modal';
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./components/legal/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const DataSubjectRightsModal = lazy(() => import('./components/legal/DataSubjectRightsModal').then(m => ({ default: m.DataSubjectRightsModal })));
import { LanguageProvider } from './contexts/LanguageContext';
const AIAssistantWidget = lazy(() => import('./components/ui/AIAssistantWidget').then(m => ({ default: m.AIAssistantWidget })));
import { PWAInstallBanner } from './components/ui/PWAInstallBanner';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { PerformanceMonitorBadge } from './components/ui/PerformanceMonitorBadge';
import { CookieConsentBanner } from './components/ui/CookieConsentBanner';

import { SEOHead } from './components/seo/SEOHead';
import { SEOService } from './services/seoService';
import { PWARegisterService } from './services/pwaRegisterService';
import { AnalyticsService } from './services/analyticsService';
import { TelemetryService } from './services/telemetryService';
const BeneficiaryPortalModal = lazy(() => import('./components/beneficiary/BeneficiaryPortalModal').then(m => ({ default: m.BeneficiaryPortalModal })));
const VolunteerPortalModal = lazy(() => import('./components/volunteer/VolunteerPortalModal').then(m => ({ default: m.VolunteerPortalModal })));

// Data & Types
import { InstitutionalService } from './services/data';
import { AppData } from './types';

// Zero-CLS Section Fallback (PERF-001)
const SectionSkeleton: React.FC<{ height?: string }> = ({ height = "h-80" }) => (
  <div className={`w-full ${height} flex items-center justify-center p-6`} aria-hidden="true">
    <div className="w-full max-w-6xl h-full rounded-2xl perf-skeleton opacity-60 border border-zinc-200" />
  </div>
);

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
  useRealtimeSROI,
  useRealtimeMetrics,
  useRealtimePillars,
  useRealtimeValueBlocks,
  useRealtimeGovernanceInstances,
  useRealtimeGovernanceMembers,
  useRealtimeTimeline,
  useRealtimePrograms,
  useRealtimeBlogPosts,
  useRealtimePublishedPartners,
  useRealtimeSocialNetworks,
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
function applySeoSettings(seo: Record<string, any>, socialNetworks?: any[]) {
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
  // sameAs: usa social_networks se disponíveis, caso contrário seo.socialLinks ou URLs canônicas
  const sameAsLinks: string[] = (socialNetworks && socialNetworks.length > 0)
    ? socialNetworks.map((s: any) => s.url)
    : (seo.socialLinks && Array.isArray(seo.socialLinks) && seo.socialLinks.length > 0)
    ? seo.socialLinks.filter((s: any) => s?.url?.startsWith('https://')).map((s: any) => s.url)
    : [
        'https://www.instagram.com/instsermelhor',
        'https://www.facebook.com/institutosermelhor',
        'https://www.linkedin.com/company/institutosermelhor',
        'https://x.com/instsermelhor',
      ];

  ldScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Instituto Ser Melhor',
    alternateName: 'ISM',
    url: seo.canonicalUrl || 'https://institutosermelhor.org',
    logo: seo.logoUrl || '/logo-ism.png',
    description: seo.siteDescription || '',
    foundingDate: seo.foundingDate || '2007',
    email: seo.contactEmail || 'contato@institutosermelhor.org',
    sameAs: sameAsLinks,
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
  isLGPDOpen: boolean;
  isBeneficiaryPortalOpen: boolean;
  isVolunteerPortalOpen: boolean;
}

function App() {
  const [state, setState] = React.useState<AppState>({
    data: null,
    servicesPage: null,
    error: false,
    isPrivacyOpen: false,
    isTermsOpen: false,
    isLGPDOpen: false,
    isBeneficiaryPortalOpen: false,
    isVolunteerPortalOpen: false,
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
  const realtimeSROI       = useRealtimeSROI<any>();

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
  const realtimeSocials          = useRealtimeSocialNetworks();

  // ── SEO — aplica em tempo real sempre que seo_settings ou social_networks mudar ────────────
  useEffect(() => {
    if (realtimeSeo) applySeoSettings(realtimeSeo, realtimeSocials);
  }, [realtimeSeo, realtimeSocials]);

  // ── Analytics & Telemetria — init motor de conversão, telemetria e page_view ────────────
  useEffect(() => {
    TelemetryService.init();
    AnalyticsService.init();
    AnalyticsService.trackPageView('/', 'Instituto Ser Melhor — Transformação Social');
  }, []);

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

      const EMPTY_ARRAY: any[] = [];
      const pageRes            = getValue(results[0], {} as any);
      const valuesRes          = getValue(results[1], EMPTY_ARRAY);
      const governanceInstRes  = getValue(results[2], EMPTY_ARRAY);
      const timelineRes        = getValue(results[3], EMPTY_ARRAY);
      const membersRes         = getValue(results[4], EMPTY_ARRAY);
      const programsRes        = getValue(results[5], []);
      const servicesPageRes    = getValue(results[6], null);
      const seoSettingsRes     = getValue(results[8], null);

      // Aplicar SEO inicial
      if (seoSettingsRes) applySeoSettings(seoSettingsRes);

      setState(s => ({
        ...s,
        servicesPage: servicesPageRes,
        data: {
          page: pageRes,
          valueBlocks: valuesRes,
          governanceInstances: governanceInstRes,
          timelineMilestones: timelineRes,
          governanceMembers: membersRes,
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
          page: {} as any,
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
    introduction: "Somos uma organização não governamental brasileira dedicada a impulsionar transformações educacionais, sociais e ambientais. Nossa trajetória é movida pela busca contínua por redefinir as fronteiras do impacto sistêmico.",
    missionStatement: "Promover a emancipação humana e o desenvolvimento sustentável, atuando como catalisador de transformações sociais, ambientais, educacionais e culturais, com base em direitos, evidências e impacto mensurável.",
    visionStatement: "Ser uma organização de referência na construção de um mundo equitativo, próspero e regenerativo.",
    governanceIntro: "A Governança do Instituto Ser Melhor é uma arquitetura de controle, deliberação e prestação de contas, estruturada para garantir a perpetuidade da missão institucional, a transparência, a integridade, a conformidade e a máxima eficiência na gestão e na alocação dos recursos.",
    transparencyIntro: "Garantimos acesso público e auditado às nossas demonstrações financeiras e relatórios de impacto.",
    logoImage: "/logo-ism.png",
    // heroImage sem fallback externo — o componente trata graciosamente a ausência de imagem
    heroImage: "",
    motto: "Sapere Aude",
    mottoExplanation: "Sapere Aude — Ouse Saber. Reflete nosso compromisso com a educação transformadora e a autonomia intelectual, posicionando o Instituto como promotor do pensamento crítico e da formação cidadã.",
    networkIntro: "O Instituto Ser Melhor reconhece que o impacto sustentável se constrói em parceria. Nosso Ecossistema Colaborativo Estratégico reúne organizações comprometidas com o desenvolvimento sustentável.",
    logoExplanation: "O emblema circular com três figuras humanas estilizadas representa o nosso compromisso com o Desenvolvimento Sustentável Integral.",
  };

  const activePageAttrs = {
    ...DEFAULT_PAGE_ATTRS,
    ...(data?.page || {}),
    ...(realtimeInstPage || {}),
  };

  // Coleções — usa realtime quando disponível, cai no mock/fallback do data.ts
  const activeMetrics   = realtimeMetrics.length     > 0 ? realtimeMetrics   : [];
  const activePillars   = realtimePillars.length     > 0 ? realtimePillars   : [];

  // ── NOTE: métricas e pilares usam apenas realtime (Firestore onSnapshot).
  // O fallback definitivo fica nos DEFAULT_METRICS / DEFAULT_PILLARS dentro dos próprios componentes.
  // Para ambientes sem Firebase, os componentes exibem seus dados hardcoded internos.
  const activeValues    = realtimeValueBlocks.length  > 0 ? realtimeValueBlocks  : (data?.valueBlocks ?? []);
  const activeGovInst   = realtimeGovInstances.length > 0 ? realtimeGovInstances : (data?.governanceInstances ?? []);
  const activeGovMem    = realtimeGovMembers.length   > 0 ? realtimeGovMembers   : (data?.governanceMembers ?? []);
  const activeTimeline  = realtimeTimeline.length     > 0 ? realtimeTimeline     : (data?.timelineMilestones ?? []);
  const activePrograms  = realtimePrograms.length     > 0 ? realtimePrograms     : (data?.programs ?? []);
  const activeBlog      = realtimeBlogPosts.length    > 0 ? realtimeBlogPosts    : [];
  const activePartners  = realtimePartners;

  // ── NOTE: dados já são planos (SIL-ISM 1.0 — flattenStrapi removido).
  // ── Render Guards ───────────────────────────────────────────────────────
  if (error) return <ErrorScreen onRetry={loadData} />;
  if (!data && !realtimeInstPage) return <LoadingScreen />;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <LanguageProvider>
      {/* SEO: Meta tags dinâmicas + Schema.org JSON-LD — F003 */}
      <SEOHead
        meta={{
          title: 'Instituto Ser Melhor — Transformação Social e Sustentabilidade',
          description: 'ONG brasileira que catalisa transformações sociais, ambientais, educacionais e culturais. Conheça nossa missão, faça uma doação e acompanhe nosso impacto.',
          path: '/',
          keywords: 'ONG, instituto, sustentabilidade, transformação social, doação, impacto social, OSCIP, Brasil',
          ogType: 'website',
        }}
        schemas={SEOService.buildHomepageSchemas()}
      />

      {/* Skip to main content — keyboard a11y */}
      <a href="#main-content" className="skip-link">Ir para o conteúdo principal</a>

      <InstitutionalWrapper
        onOpenPrivacy={() => setState(s => ({ ...s, isPrivacyOpen: true }))}
        onOpenTerms={() => setState(s => ({ ...s, isTermsOpen: true }))}
        onOpenLGPD={() => setState(s => ({ ...s, isLGPDOpen: true }))}
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

          {/* Calculadora SROI Automatizada — lê de sroi_config/main (realtime) */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <SROICalculator sroiData={realtimeSROI} />
            </div>
          </Suspense>

          {/* Missão / Visão / Valores — lê de institutional_page/main (realtime) */}
          <MissionVisionValues data={activePageAttrs as any} />

          {/* Valores Institucionais — lê de value_blocks (realtime) */}
          <ValuesSection values={activeValues as any} />

          {/* Programas — lê de programs (realtime) */}
          <ProgramsSection
            programs={activePrograms as any}
            servicesPage={activeServices}
            isLoading={activePrograms.length === 0 && realtimePrograms.length === 0}
          />

          {/* Pilares — lê de pillars (realtime) */}
          <PillarsSection pillars={activePillars} />

          {/* Timeline — lê de timeline_milestones (realtime) */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <TimelineSection milestones={activeTimeline as any} />
            </div>
          </Suspense>

          {/* Identidade & Rede — lê de institutional_page/main + services_page/main */}
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <div className="cv-auto-short">
              <IdentityAndNetwork
                pageData={activePageAttrs as any}
                networkCards={activeServices?.networkCards}
              />
            </div>
          </Suspense>

          {/* Governança — lê de governance_instances + governance_members (realtime) */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <GovernanceStructure
                intro={activePageAttrs?.governanceIntro}
                instances={activeGovInst as any}
                members={activeGovMem as any}
              />
            </div>
          </Suspense>

          {/* Transparência — lê de services_page/main (realtime) */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
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
            </div>
          </Suspense>

          {/* Blog/Notícias — lê de blog_posts (realtime, filtro PUBLISHED) */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <NewsSection posts={activeBlog} />
            </div>
          </Suspense>

          {/* Parceiros — lê de partners (realtime, filtro isPublished) + formulário de candidatura */}
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <div className="cv-auto-short">
              <PartnerSection
                servicesPage={activeServices}
                partners={activePartners}
              />
            </div>
          </Suspense>

          {/* Portal de Parceiros & Co-benefícios ESG — E002 */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <PartnersESGSection />
            </div>
          </Suspense>

          {/* Mapa Interativo de Atuação por Município e Pilar — G001 */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <AtuacaoMapSection />
            </div>
          </Suspense>

          {/* Painel Público de Metas e Termômetro de Captação em Tempo Real — E004 */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <div className="cv-auto">
              <CampaignGoalsSection />
            </div>
          </Suspense>

          {/* Doações — lê de donation_section/main (realtime) */}
          <DonationSection donationData={activeDonation} />
        </main>
      </InstitutionalWrapper>

      {/* Legal Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
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

        {/* Portal do Beneficiário & Famílias Assistidas — G002 */}
        <BeneficiaryPortalModal
          isOpen={state.isBeneficiaryPortalOpen}
          onClose={() => setState(s => ({ ...s, isBeneficiaryPortalOpen: false }))}
        />

        {/* Portal de Voluntários & Registro de Horas — G003 */}
        <VolunteerPortalModal
          isOpen={state.isVolunteerPortalOpen}
          onClose={() => setState(s => ({ ...s, isVolunteerPortalOpen: false }))}
        />

        {/* Canal de Direitos do Titular LGPD — Art. 18 */}
        <DataSubjectRightsModal
          isOpen={state.isLGPDOpen}
          onClose={() => setState(s => ({ ...s, isLGPDOpen: false }))}
        />
      </Suspense>

      {/* Botões de Acesso Rápido (Portal Família & Portal Voluntário) — Posicionados à esquerda com safe-area */}
      <div
        className="touch-manipulation"
        style={{
          position: 'fixed',
          bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
          left: 'calc(1.25rem + env(safe-area-inset-left, 0px))',
          zIndex: 9970,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          maxWidth: 'calc(100vw - 6rem)',
        }}
      >
        <button
          onClick={() => setState(s => ({ ...s, isBeneficiaryPortalOpen: true }))}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: 20,
            color: '#4ade80',
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          title="Área Restrita do Beneficiário & Cadastro Familiar"
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
          Portal Família
        </button>

        <button
          onClick={() => setState(s => ({ ...s, isVolunteerPortalOpen: true }))}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: 20,
            color: '#c084fc',
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          title="Programa de Voluntariado & Horas Registradas"
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c084fc' }} />
          Seja Voluntário
        </button>
      </div>

      {/* Agente IA de Atendimento Flutuante — D001 (Lazy Loaded) */}
      <Suspense fallback={null}>
        <AIAssistantWidget />
      </Suspense>

      {/* Indicador de Status Offline & Fila de Sincronização — PWA-001 */}
      <OfflineIndicator />

      {/* Banner de Instalação PWA — F001 */}
      <PWAInstallBanner />

      {/* Indicador de Desempenho Core Web Vitals — F002 */}
      <PerformanceMonitorBadge />

      {/* Banner de Consentimento de Cookies & LGPD — NC-030 */}
      <CookieConsentBanner />
    </LanguageProvider>

  );
}

export default App;