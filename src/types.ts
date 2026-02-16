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

// 5. Component: transparency-document
export type DocumentType = 'Financeiro' | 'Impacto' | 'Legal' | 'Código de Conduta';

export interface TransparencyDocumentAttributes {
  documentName: string;
  documentType: DocumentType;
  documentFile: string; 
  publicationDate: string; 
  fileSize?: string; 
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
  status: 'Novo'; 
  consentLGPD: boolean; 
}

// 7. Collection Type: donation-record
export type DonationType = 'Única' | 'Mensal' | 'Anual';

export interface DonationPayload {
  amount: number;
  currency: 'BRL';
  type: DonationType;
  donorName: string;
  donorEmail: string;
  taxId?: string; 
  sourceCampaign?: string;
  consentLGPD: boolean; 
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