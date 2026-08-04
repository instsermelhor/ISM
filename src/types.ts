// Strapi Base Types
export interface StrapiItem<T> {
  id: number;
  attributes: T;
}

export interface StrapiCollectionResponse<T> {
  data: StrapiItem<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiItem<T>;
  meta: {};
}

// 5. Component: transparency-document (Reutilizável/Component)
export type DocumentType = 'Financeiro' | 'Impacto' | 'Legal' | 'Código de Conduta';

// Changed from TransparencyDocumentAttributes to TransparencyDocument (flat object for components)
export interface TransparencyDocument {
  id: number;
  documentName: string;
  documentType: DocumentType;
  documentFile: string; // URL
  publicationDate: string; // Date string
  fileSize?: string; // Optional helper for UI
}

// 1. Single Type: institutional-page
export interface InstitutionalPageAttributes {
  title: string;
  introduction: string;
  missionStatement: string;
  visionStatement: string;
  governanceIntro: string;
  transparencyIntro: string;
  logoImage: string;
  logoExplanation: string;
  motto: string;
  mottoExplanation: string;
  networkIntro: string;
  heroImage: string;
  transparencyDocuments: TransparencyDocument[]; // Correctly nested component list
}

// 2. Collection Type: value-block
export interface ValueBlockAttributes {
  name: string; 
  iconIdentifier: string; 
  description: string; 
}

// 3. Collection Type: governance-instance
export interface GovernanceKeyAttribute {
  attributeText: string;
}

export interface GovernanceInstanceAttributes {
  title: string;
  order: number;
  summary: string;
  keyAttributes: GovernanceKeyAttribute[];
}

// 4. Collection Type: timeline-milestone
export interface TimelineMilestoneAttributes {
  year: number;
  title: string;
  impactDescription: string;
}

// Governance Members
export interface GovernanceMemberAttributes {
  name: string;
  role: string;
  type: 'board' | 'executive' | 'advisory' | 'fiscal';
  bio: string;
  imageUrl: string;
}

// Financial Entry
export interface FinancialEntry {
  id: number;
  name: string;
  value: number;
  color: string;
}

// --- NEW TYPES FOR FORMS ---

// 6. Collection Type: partner-application
export type PartnerType = 'Corporativo' | 'Empresarial' | 'Institucional/ONG' | 'Pesquisa/Academia' | 'Individual';
export type PartnerStatus = 'Novo' | 'Em Análise' | 'Contato Inicial' | 'Rejeitado' | 'Parceria Formalizada';

export interface PartnerApplicationPayload {
  submissionDate: string;
  type: PartnerType;
  companyName?: string;
  contactName: string;
  contactTitle?: string;
  email: string;
  phone?: string;
  areaOfInterest: string;
  intendedContribution?: string;
  status: PartnerStatus;
}

// ── Tipos para Seção Seja Parceiro & Parceiros Publicados ──────────────────────
export type PartnerPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type PartnerCategoryType =
  | 'GLOBAL'
  | 'ESTRATEGICO'
  | 'INSTITUCIONAL'
  | 'TECNICO'
  | 'UNIVERSIDADES'
  | 'EMPRESAS'
  | 'ORGANISMOS_INTERNACIONAIS'
  | 'FINANCIADORES'
  | 'OSCS'
  | string;

export type PartnerType =
  | 'CORPORATIVO'
  | 'ACADEMICO'
  | 'GOVERNAMENTAL'
  | 'OSC_ONG'
  | 'ORGANISMO_INTERNACIONAL'
  | 'INDIVIDUAL'
  | string;

/**
 * Modelo unificado de parceiro — utilizado pelo Site Institucional e pelo Painel Administrativo.
 * Todos os campos de exibição, identidade visual, links e auditoria estão consolidados aqui.
 */
export interface PublishedPartner {
  // ── Identificação ─────────────────────────────────────────────────────────
  id?: string;
  /** Nome oficial / razão social */
  name: string;
  /** Nome fantasia (opcional) */
  fantasyName?: string;
  /** Categoria da parceria */
  category: PartnerCategoryType;
  /** Tipo de parceiro */
  partnerType?: PartnerType;
  /** Área de atuação */
  area?: string;

  // ── Informações Institucionais ────────────────────────────────────────────
  /** Descrição resumida (até 250 caracteres) */
  description?: string;
  /** Descrição completa */
  fullDescription?: string;
  /** Missão da parceria (opcional) */
  missionStatement?: string;
  /** País de origem */
  country?: string;
  /** Estado */
  state?: string;
  /** Cidade */
  city?: string;

  // ── Identidade Visual ─────────────────────────────────────────────────────
  /** URL da logomarca (PNG/JPG/WEBP) */
  logoUrl?: string;
  /** Texto alternativo da logomarca (obrigatório para WCAG 2.1 AA) */
  logoAlt?: string;
  /** URL do logotipo vetorial (SVG) */
  logoSvgUrl?: string;
  /** URL da imagem institucional */
  institutionalImageUrl?: string;

  // ── Links ─────────────────────────────────────────────────────────────────
  /** Site oficial (obrigatoriamente https://) */
  websiteUrl?: string;
  /** Instagram */
  instagramUrl?: string;
  /** Facebook */
  facebookUrl?: string;
  /** LinkedIn */
  linkedinUrl?: string;
  /** YouTube */
  youtubeUrl?: string;
  /** X (antigo Twitter) */
  twitterUrl?: string;

  // ── Informações da Parceria ───────────────────────────────────────────────
  /** Data de início da parceria (YYYY-MM-DD) */
  partnershipStartDate?: string;
  /** Objetivos da parceria */
  objectives?: string;
  /** Resultados esperados */
  expectedResults?: string;
  /** IDs dos projetos vinculados */
  linkedProjectIds?: string[];

  // ── Configuração de Exibição ──────────────────────────────────────────────
  /** Ordem de exibição */
  order: number;
  /** Parceiro em destaque */
  isFeatured?: boolean;
  /** Exibir na Landing Page */
  showOnLandingPage?: boolean;
  /** Exibir na página institucional */
  showInstitutionalPage?: boolean;
  /** Status de publicação */
  status?: PartnerPublicationStatus;
  /** Flag de publicação (derivado de status) */
  isPublished?: boolean;
  /** Nível/tier do parceiro */
  tier?: 'TIER_1' | 'TIER_2' | 'TIER_3' | string;

  // ── Auditoria ─────────────────────────────────────────────────────────────
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  updatedBy?: string;
}

export interface PartnerBenefit {
  id: string;
  order: number;
  title: string;
  description: string;
  icon?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ServicesPageData {
  partnerBadge?: string;
  partnerTitle?: string;
  partnerSubtitle?: string;
  partnerDescription?: string;
  partnerBenefits?: PartnerBenefit[];
  trustBadges?: string[];
  partnerBannerUrl?: string;
  partnerVideoUrl?: string;
  partnerCtaLabel?: string;
  partnerCtaUrl?: string;
  partnerCtaTarget?: '_blank' | '_self';
  updatedAt?: unknown;
}


// 7. Collection Type: donation-record
export type DonationType = 'Única' | 'Mensal' | 'Anual';
export type PaymentStatus = 'Aprovado' | 'Pendente' | 'Falha' | 'Estorno';

// Institutional Pillar destination for donations
export type DonationPillar =
  | 'Geral'
  | 'Educação'
  | 'Social'
  | 'Meio Ambiente'
  | 'Cultura';

export interface DonationPayload {
  amount: number;
  currency: 'BRL';
  type: DonationType;
  donorName: string;
  donorEmail: string;
  taxId?: string;
  sourceCampaign?: string;
  /** Optional: destination pillar for targeted donation */
  destinationPillar?: DonationPillar;
}

export interface DonationRecord extends DonationPayload {
  transactionId: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

// Combined Data Structure for App State
export interface AppData {
  page: StrapiItem<InstitutionalPageAttributes>;
  valueBlocks: StrapiItem<ValueBlockAttributes>[];
  governanceInstances: StrapiItem<GovernanceInstanceAttributes>[];
  timelineMilestones: StrapiItem<TimelineMilestoneAttributes>[];
  governanceMembers: StrapiItem<GovernanceMemberAttributes>[];
  financials: FinancialEntry[];
  programs: ProgramData[];
  // Removed standalone transparencyDocuments as they are now part of 'page'
}

// ── Programas & Serviços (publicados pelo Admin Panel) ─────────────────────
export interface ProgramData {
  id: string;
  order: number;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  iconEmoji: string;
  imageUrl: string;
  isPublished: boolean;
  targetAudience: string;
  tags: string[];
  ctaLabel: string;
  ctaUrl: string;
  impactMetric: string;
  impactValue: string;
  linkUrl: string;
  linkLabel: string;
  pillarsTitle?: string;
  pillars?: string[];
  actionLinesTitle?: string;
  actionLinesSub?: string;
  actionLines?: string[];
  commitmentTitle?: string;
  commitment?: string;
}