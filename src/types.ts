// NOTE: Strapi wrapper types (StrapiItem, StrapiCollectionResponse, StrapiSingleResponse) were
// permanently removed in R011 (SIL-ISM 1.0). All data is now flat native Firestore objects.

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

// ── Tipos para Governança, Liderança & Equipe (E045) ────────────────────────
export type MemberCategory =
  | 'DIRETORIA_EXECUTIVA'
  | 'CONSELHO_DELIBERATIVO'
  | 'CONSELHO_FISCAL'
  | 'CONSELHO_CONSULTIVO'
  | 'COORDENACAO'
  | 'EQUIPE_TECNICA'
  | 'CONSULTOR'
  | 'VOLUNTARIO'
  | 'OUTRO'
  | string;

export type MemberPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface GovernanceMemberAttributes {
  id?: string;
  // ── Identificação ─────────────────────────────────────────────────────────
  name: string;
  socialName?: string;
  role: string;
  shortRole?: string;
  area?: string;
  category?: MemberCategory;
  type?: 'board' | 'executive' | 'advisory' | 'fiscal' | 'coordination' | 'technical' | 'consultant' | 'volunteer' | 'other' | string;

  // ── Perfil Institucional & Acadêmico ───────────────────────────────────────
  bio: string; // biografia resumida
  shortBio?: string;
  fullBio?: string; // biografia completa para o modal
  academicFormation?: string;
  specializations?: string;
  certifications?: string;
  experience?: string;
  expertise?: string[]; // tags de áreas de conhecimento

  // ── Fotografia & Imagens ──────────────────────────────────────────────────
  imageUrl: string;
  imageAlt?: string; // Texto alternativo (WCAG 2.1 AA)
  highResImageUrl?: string;
  thumbnailUrl?: string;

  // ── Informações Institucionais & Exibição ────────────────────────────────
  startDate?: string;
  status?: MemberPublicationStatus;
  isPublished?: boolean;
  isFeatured?: boolean;
  order: number;
  email?: string;
  phone?: string;
  showPublicContact?: boolean; // Controle LGPD para exibir e-mail/telefone

  // ── Redes Sociais & Links Validados (HTTPS apenas) ────────────────────────
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  lattesUrl?: string;
  orcidUrl?: string;
  researchGateUrl?: string;
  websiteUrl?: string;
  resumeUrl?: string;

  // ── Auditoria ─────────────────────────────────────────────────────────────
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  updatedBy?: string;
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
export type PartnerStatus = 'Novo' | 'Em Análise' | 'Contato Inicial' | 'Rejeitado' | 'Parceria Formalizada';

export interface PartnerApplicationPayload {
  submissionDate?: string;
  type: PartnerType;
  companyName?: string;
  contactName: string;
  contactTitle?: string;
  contactEmail?: string;
  email?: string;
  phone?: string;
  areaOfInterest?: string;
  intendedContribution?: string;
  status?: PartnerStatus;
  taxId?: string;
  estimatedBudget?: string;
  interestPillar?: string;
  message?: string;
  [key: string]: any;
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

// Combined Data Structure for App State — SIL-ISM 1.0 (flat native Firestore types)
export interface AppData {
  page: InstitutionalPageAttributes;
  valueBlocks: ValueBlockAttributes[];
  governanceInstances: GovernanceInstanceAttributes[];
  timelineMilestones: TimelineMilestoneAttributes[];
  governanceMembers: GovernanceMemberAttributes[];
  financials: FinancialEntry[];
  programs: ProgramData[];
}

// ── Programas & Serviços (publicados pelo Admin Panel) ─────────────────────

export type ProgramPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProgramGalleryImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  order: number;
}

export interface ProgramData {
  // ── Identificação ─────────────────────────────────────────────────────────
  id: string;
  code?: string;
  /** Ordem de exibição */
  order: number;
  /** Título do programa */
  title: string;
  /** Subtítulo */
  subtitle?: string;
  /** Slug para URL amigável */
  slug: string;
  /** Categoria temática */
  category?: 'Educacao' | 'MeioAmbiente' | 'Cultura' | 'Emancipacao' | 'DireitosHumanos' | string;
  /** Área temática */
  thematicArea?: string;
  /** Estágio do ciclo de vida */
  stage?: string;

  // ── Conteúdo & Metodologia ─────────────────────────────────────────────────
  /** Resumo curto (exibido no card compacto da Landing Page) */
  description: string;
  /** Descrição detalhada / completa */
  longDescription?: string;
  /** Objetivos do programa */
  objectives?: string;
  /** Público-alvo */
  targetAudience?: string;
  /** Metodologia aplicada */
  methodology?: string;
  /** Título dos pilares */
  pillarsTitle?: string;
  /** Lista de pilares */
  pillars?: string[];
  /** Título das linhas de atuação */
  actionLinesTitle?: string;
  /** Subtítulo das linhas de atuação */
  actionLinesSub?: string;
  /** Lista de linhas de atuação */
  actionLines?: string[];
  /** Resultados esperados */
  expectedResults?: string;
  /** Título do compromisso */
  commitmentTitle?: string;
  /** Compromisso institucional */
  commitment?: string;

  // ── Indicadores & Tags ────────────────────────────────────────────────────
  /** Métrica de impacto */
  impactMetric?: string;
  /** Valor numérico ou resumido do impacto */
  impactValue?: string;
  /** Tags temáticas */
  tags?: string[];
  /** Emoji representativo */
  iconEmoji?: string;

  // ── Imagens & Galeria ──────────────────────────────────────────────────────
  /** URL da imagem principal */
  imageUrl?: string;
  /** Texto alternativo da imagem principal (WCAG 2.1 AA) */
  imageAlt?: string;
  /** URL da imagem banner institucional */
  bannerUrl?: string;
  /** Galeria de imagens */
  gallery?: ProgramGalleryImage[];

  // ── Links Externos Validados ──────────────────────────────────────────────
  /** Site oficial do programa (obrigatoriamente https://) */
  websiteUrl?: string;
  /** Página institucional interna */
  institutionalPageUrl?: string;
  /** Link do Projeto AURA (ex: https://...) */
  auraProjectUrl?: string;
  /** Link para documentos oficiais */
  documentsUrl?: string;
  /** Link para relatórios de impacto */
  reportsUrl?: string;
  /** Link para formulário de participação */
  participationFormUrl?: string;

  // CTA legado para compatibilidade
  ctaLabel?: string;
  ctaUrl?: string;
  linkUrl?: string;
  linkLabel?: string;

  // ── Configuração de Exibição & Status ─────────────────────────────────────
  /** Programa em destaque */
  isFeatured?: boolean;
  /** Exibir na Landing Page */
  showOnLandingPage?: boolean;
  /** Status de publicação */
  status?: ProgramPublicationStatus;
  /** Flag de publicação (sincronizada com status) */
  isPublished: boolean;
  /** Data de publicação */
  publishedAt?: unknown;
  /** Data de última atualização */
  updatedAt?: unknown;

  // ── SEO & Auditoria ───────────────────────────────────────────────────────
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  createdBy?: string;
  updatedBy?: string;
}