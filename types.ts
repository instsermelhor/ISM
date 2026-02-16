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

// 1. Single Type: institutional-page
export interface InstitutionalPageAttributes {
  title: string; // Título principal
  introduction: string; // Rich Text (simplified to string)
  missionStatement: string; // Rich Text
  visionStatement: string; // Rich Text
  governanceIntro: string; // Rich Text - Intro to Governance
  transparencyIntro: string; // Rich Text - Intro to Transparency
  logoImage: string; // Media URL
  logoExplanation: string; // Rich Text
  motto: string; // "Sapere Aude"
  mottoExplanation: string; // Rich Text
  networkIntro: string; // Rich Text - Intro to Elite Network
  heroImage: string; // Added for UI completeness (technically part of media fields)
}

// 2. Collection Type: value-block
export interface ValueBlockAttributes {
  name: string; // Was title
  iconIdentifier: string; // 'diamond', 'shield', etc.
  description: string; // Rich Text
}

// 3. Collection Type: governance-instance
export interface GovernanceKeyAttribute {
  attributeText: string;
}

export interface GovernanceInstanceAttributes {
  title: string;
  order: number;
  summary: string; // Rich Text
  keyAttributes: GovernanceKeyAttribute[]; // Component Repeatable
}

// 4. Collection Type: timeline-milestone
export interface TimelineMilestoneAttributes {
  year: number;
  title: string;
  impactDescription: string; // Rich Text
}

// 5. Component: transparency-document
export type DocumentType = 'Financeiro' | 'Impacto' | 'Legal' | 'Código de Conduta';

export interface TransparencyDocumentAttributes {
  documentName: string;
  documentType: DocumentType;
  documentFile: string; // URL
  publicationDate: string; // Date string
  fileSize?: string; // Optional helper for UI
}

// Governance Members (Kept as extra context for the UI)
export interface GovernanceMemberAttributes {
  name: string;
  role: string;
  type: 'board' | 'executive' | 'advisory' | 'fiscal';
  bio: string;
  imageUrl: string;
}

// Financial Entry (Helper for charts)
export interface FinancialEntry {
  id: number;
  name: string;
  value: number;
  color: string;
}

// --- NEW TYPES FOR FORMS ---

// 6. Collection Type: partner-application
export type PartnerType = 'Corporativo' | 'Institucional/ONG' | 'Pesquisa/Academia' | 'Individual';

export interface PartnerApplicationPayload {
  submissionDate: string; // ISO String
  type: PartnerType;
  companyName?: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone?: string;
  areaOfInterest: string;
  intendedContribution?: string;
  status: 'Novo'; // Default on submission
}

// 7. Collection Type: donation-record
export type DonationType = 'Única' | 'Mensal' | 'Anual';

export interface DonationPayload {
  amount: number;
  currency: 'BRL';
  type: DonationType;
  donorName: string;
  donorEmail: string;
  taxId?: string; // CPF/CNPJ
  sourceCampaign?: string;
}

// Combined Data Structure for App State
export interface AppData {
  page: StrapiItem<InstitutionalPageAttributes>;
  valueBlocks: StrapiItem<ValueBlockAttributes>[];
  governanceInstances: StrapiItem<GovernanceInstanceAttributes>[];
  timelineMilestones: StrapiItem<TimelineMilestoneAttributes>[];
  transparencyDocuments: StrapiItem<TransparencyDocumentAttributes>[];
  governanceMembers: StrapiItem<GovernanceMemberAttributes>[];
  financials: FinancialEntry[];
}