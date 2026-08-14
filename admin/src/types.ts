// Tipos centrais do Admin Panel

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GESTOR' | 'EDITOR' | 'OPERADOR' | 'CONSULTA' | 'VIEWER';
export type PostStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type LeadStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
export type PipelineStage = 'IDEA' | 'WRITING' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
export type Priority = 0 | 1 | 2;
export type HealthStatus = 'ok' | 'warn' | 'error';

// ── FINANCEIRO ──────────────────────────────────────────────────
export type DonationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED' | 'CHARGEBACK';
export type DonationMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'BANK_TRANSFER' | 'CRYPTO';
export type DonorCategory = 'INDIVIDUAL' | 'CORPORATE' | 'FOUNDATION' | 'GOVERNMENT';
export type DonorTier = 'SUPPORTER' | 'CONTRIBUTOR' | 'CHAMPION' | 'PATRON' | 'BENEFACTOR';
export type RecurrenceType = 'SINGLE' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type BankConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';
export type TransactionType = 'DONATION' | 'EXPENSE' | 'TRANSFER' | 'REFUND' | 'FEE';

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string; // CPF ou CNPJ
  category: DonorCategory;
  tier: DonorTier;
  avatarUrl?: string;
  city?: string;
  state?: string;
  country: string;
  totalDonated: number;
  donationCount: number;
  firstDonationAt: string;
  lastDonationAt: string;
  isAnonymous: boolean;
  isRecurrent: boolean;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// ── MULTI-TENANCY ENTERPRISE (MT-001) ────────────────────────────
export type TenantType = 
  | 'INSTITUTION_HQ'       // Sede / Instituto Ser Melhor Matriz (Tenant Global)
  | 'CORPORATE_SPONSOR'    // Patrocinador Corporativo
  | 'NGO_PARTNER'          // ONG / OSC Parceira
  | 'PUBLIC_AGENCY'        // Órgão Público / Secretaria
  | 'REGIONAL_HUB';        // Polo Regional Descentralizado

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING' | 'ARCHIVED';

export type TenantRole = 'TENANT_ADMIN' | 'TENANT_GESTOR' | 'TENANT_OPERADOR' | 'TENANT_VIEWER';

export interface TenantSettings {
  primaryColor?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  allowedDomains?: string[];
  maxUsers?: number;
  dataRetentionDays?: number;
  enableAuditStreaming?: boolean;
  webhookUrl?: string;
  features?: {
    customBranding?: boolean;
    crmLeads?: boolean;
    donationsManagement?: boolean;
    bpmWorkflows?: boolean;
    financialReports?: boolean;
    biAnalytics?: boolean;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  status: TenantStatus;
  documentNumber?: string;
  domain?: string;
  settings: TenantSettings;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TenantMembership {
  id: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  role: TenantRole;
  isDefault: boolean;
  isActive: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface TenantContextState {
  activeTenantId: string;
  activeTenant: Tenant | null;
  userRoleInTenant: TenantRole | 'SUPER_ADMIN' | null;
  isSuperAdmin: boolean;
  availableTenants: Tenant[];
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
}

export interface Donation {
  id: string;
  donor: Pick<Donor, 'id' | 'name' | 'email' | 'avatarUrl' | 'tier' | 'isAnonymous'>;
  amount: number;
  currency: string;
  method: DonationMethod;
  status: DonationStatus;
  recurrence: RecurrenceType;
  tenantId?: string; // MT-001
  campaignId?: string;
  campaignName?: string;
  description?: string;
  gatewayId?: string; // ID na plataforma de pagamento
  gatewayName?: string; // Stripe, PagSeguro, etc.
  bankAccountId?: string;
  transactionHash?: string; // Para crypto
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  tenantId?: string; // MT-001
  totalReceived: number;
  totalReceived30d: number;
  totalReceived12m: number;
  recurrentMonthly: number;
  averageDonation: number;
  donorCount: number;
  newDonors30d: number;
  pendingAmount: number;
  projectedNextMonth: number;
  goalAmount: number;
  goalProgress: number; // 0-100
  monthlyBreakdown: MonthlyFinancial[];
  byMethod: { method: string; amount: number; count: number }[];
  byRecurrence: { type: string; amount: number; count: number }[];
  topCampaigns: { name: string; amount: number; donors: number }[];
}

export interface MonthlyFinancial {
  month: string; // 'Jan', 'Fev', etc.
  received: number;
  donors: number;
  recurrent: number;
  oneTime: number;
}

export interface BankConnection {
  id: string;
  tenantId?: string; // MT-001
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  agency: string;
  accountType: 'CHECKING' | 'SAVINGS';
  status: BankConnectionStatus;
  lastSyncAt?: string;
  balance?: number;
  provider: 'OPEN_BANKING' | 'PLUGGY' | 'BELVO' | 'MANUAL' | 'STRIPE' | 'PAYPAL' | 'MERCADO_PAGO' | 'PAGSEGURO' | 'ASAAS' | 'EFI_BANK';
  apiKey?: string; // Nunca exibir completo
  webhookUrl?: string;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  tenantId?: string; // MT-001
  bankConnectionId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  date: string;
  reference?: string;
  donationId?: string; // Se reconciliado com doação
  isReconciled: boolean;
}

export interface FinancialGoal {
  id: string;
  tenantId?: string; // MT-001
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
}
// ── FIM FINANCEIRO ───────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string; // MT-001: Tenant principal ou ativo
  allowedTenants?: string[]; // MT-001: Lista de tenants acessíveis
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  forcePasswordChange?: boolean;
  temporaryPassword?: boolean;
}

export interface KpiCard {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface TimeSeriesPoint {
  date: string;
  pageviews: number;
  leads: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  coverImage?: string;
  status: PostStatus;
  publishedAt?: string;
  scheduledFor?: string;
  authorName: string;
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconUrl?: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
  order: number;
}

export interface ContactLead {
  id: string;
  tenantId?: string; // MT-001
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
}

export interface PipelineCard {
  id: string;
  tenantId?: string; // MT-001
  title: string;
  description?: string;
  stage: PipelineStage;
  priority: Priority;
  dueDate?: string;
  assignee?: string;
  postId?: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string; // MT-001
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'PUBLISH' | 'ARCHIVE' | 'TENANT_SWITCH' | 'ACCESS_DENIED';
  entity: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export interface HealthCheck {
  api: HealthStatus;
  db: HealthStatus;
  redis: HealthStatus;
  storage: HealthStatus;
  dbLatency: number;
  redisLatency: number;
  storageUsedPct: number;
  uptime: string;
}

export interface DetailedHealthCheck extends HealthCheck {
  memory?: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
  };
  uptimeSeconds?: number;
  nodeVersion?: string;
  databaseStatus?: 'CONNECTED' | 'DISCONNECTED';
}

export interface SystemErrorItem {
  id: string;
  tenantId?: string; // MT-001
  source: string;
  message: string;
  route: string;
  statusCode: number;
  stack: string | null;
  correlationId?: string | null; // OBS-001 Tracing Distribuído
  timestamp: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  group: 'general' | 'seo' | 'social' | 'design';
  label: string;
  type: 'text' | 'image' | 'color' | 'url' | 'textarea';
}

export interface AnalyticsSummary {
  tenantId?: string; // MT-001
  pageviews30d: number;
  uniqueVisitors30d: number;
  bounceRate: number;
  leadsGenerated30d: number;
  series: TimeSeriesPoint[];
  topPages: { path: string; views: number }[];
  leadsBySource: { source: string; count: number }[];
}
