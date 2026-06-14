// Tipos centrais do Admin Panel

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';
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

export interface Donation {
  id: string;
  donor: Pick<Donor, 'id' | 'name' | 'email' | 'avatarUrl' | 'tier' | 'isAnonymous'>;
  amount: number;
  currency: string;
  method: DonationMethod;
  status: DonationStatus;
  recurrence: RecurrenceType;
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
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  agency: string;
  accountType: 'CHECKING' | 'SAVINGS';
  status: BankConnectionStatus;
  lastSyncAt?: string;
  balance?: number;
  provider: 'OPEN_BANKING' | 'PLUGGY' | 'BELVO' | 'MANUAL';
  apiKey?: string; // Nunca exibir completo
  webhookUrl?: string;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
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
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
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
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'PUBLISH' | 'ARCHIVE';
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

export interface SiteSetting {
  key: string;
  value: string;
  group: 'general' | 'seo' | 'social' | 'design';
  label: string;
  type: 'text' | 'image' | 'color' | 'url' | 'textarea';
}

export interface AnalyticsSummary {
  pageviews30d: number;
  uniqueVisitors30d: number;
  bounceRate: number;
  leadsGenerated30d: number;
  series: TimeSeriesPoint[];
  topPages: { path: string; views: number }[];
  leadsBySource: { source: string; count: number }[];
}
