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
import { PartnersESGSection } from './components/sections/PartnersESGSection';
import { CampaignGoalsSection } from './components/sections/CampaignGoalsSection';
import { DonationSection } from './components/sections/DonationSection';
import { ProgramsSection } from './components/sections/ProgramsSection';
import { PillarsSection } from './components/sections/PillarsSection';
import { NewsSection } from './components/sections/NewsSection';
import { SROICalculator } from './components/sections/SROICalculator';

// UI & Legal
import { Modal } from './components/ui/Modal';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfUse } from './components/legal/TermsOfUse';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIAssistantWidget } from './components/ui/AIAssistantWidget';
import { PWAInstallBanner } from './components/ui/PWAInstallBanner';
import { PerformanceMonitorBadge } from './components/ui/PerformanceMonitorBadge';
import { SEOHead } from './components/seo/SEOHead';
import { SEOService } from './services/seoService';
import { PWARegisterService } from './services/pwaRegisterService';

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
          <SROICalculator sroiData={realtimeSROI} />

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
          <TimelineSection milestones={activeTimeline as any} />

          {/* Identidade & Rede — lê de institutional_page/main + services_page/main */}
          <IdentityAndNetwork
            pageData={activePageAttrs as any}
            networkCards={activeServices?.networkCards}
          />

          {/* Governança — lê de governance_instances + governance_members (realtime) */}
          <GovernanceStructure
            intro={activePageAttrs?.governanceIntro}
            instances={activeGovInst as any}
            members={activeGovMem as any}
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

          {/* Portal de Parceiros & Co-benefícios ESG — E002 */}
          <PartnersESGSection />

          {/* Painel Público de Metas e Termômetro de Captação em Tempo Real — E004 */}
          <CampaignGoalsSection />

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

      {/* Agente IA de Atendimento Flutuante — D001 */}
      <AIAssistantWidget />

      {/* Banner de Instalação PWA — F001 */}
      <PWAInstallBanner />

      {/* Indicador de Desempenho Core Web Vitals — F002 */}
      <PerformanceMonitorBadge />
    </LanguageProvider>
  );
}

export default App;