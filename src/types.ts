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
export type PartnerType = 'Corporativo' | 'Institucional/ONG' | 'Pesquisa/Academia' | 'Individual';
export type PartnerStatus = 'Novo' | 'Em Análise' | 'Contato Inicial' | 'Rejeitado' | 'Parceria Formalizada';

export interface PartnerApplicationPayload {
  submissionDate: string;
  type: PartnerType;
  companyName?: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone?: string;
  areaOfInterest: string;
  intendedContribution?: string;
  status: PartnerStatus;
}

// 7. Collection Type: donation-record
export type DonationType = 'Única' | 'Mensal' | 'Anual';
export type PaymentStatus = 'Aprovado' | 'Pendente' | 'Falha' | 'Estorno';

export interface DonationPayload {
  amount: number;
  currency: 'BRL';
  type: DonationType;
  donorName: string;
  donorEmail: string;
  taxId?: string;
  sourceCampaign?: string;
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
  // Removed standalone transparencyDocuments as they are now part of 'page'
}