/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTITUTO SER MELHOR — TIPOS CANÔNICOS DE MULTI-TENANCY (MT-001)
 * Definição formal de limites de isolamento, identidade, papéis e contexto.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type TenantType = 
  | 'INSTITUTION_HQ'       // Sede / Instituto Ser Melhor Matriz (Tenant Canônico Global)
  | 'CORPORATE_SPONSOR'    // Patrocinador Corporativo / Empresa Apoiadora
  | 'NGO_PARTNER'          // ONG Parceira / Organização da Sociedade Civil
  | 'PUBLIC_AGENCY'        // Órgão Público / Secretaria de Saúde / Assistência Social
  | 'REGIONAL_HUB';        // Polo / Unidade Regional Descentralizada

export type TenantStatus = 
  | 'ACTIVE'               // Operacional com acesso concedido
  | 'SUSPENDED'            // Bloqueado administrativamente por compliance ou inadimplência
  | 'ONBOARDING'           // Em fase de configuração inicial
  | 'ARCHIVED';            // Desativado e retido para conformidade legal

export type TenantRole = 
  | 'TENANT_ADMIN'         // Administrador Geral do Tenant específico
  | 'TENANT_GESTOR'        // Gestor de Projetos e Ações dentro do Tenant
  | 'TENANT_OPERADOR'      // Operador de Atendimento e Triagem do Tenant
  | 'TENANT_VIEWER';       // Visualizador com acesso somente leitura ao Tenant

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
  id: string;                      // ex: "tenant-ism-hq", "tenant-alpha-corp"
  name: string;                    // Nome da Instituição ou Empresa
  slug: string;                    // Identificador único de URL / Namespace
  type: TenantType;                // Classificação institucional
  status: TenantStatus;            // Estado de operação
  documentNumber?: string;         // CNPJ / Documento de Identificação Fiscal
  domain?: string;                 // Domínio próprio (ex: alpha.institutosermelhor.org)
  settings: TenantSettings;        // Configurações segregadas
  metadata?: Record<string, any>;  // Metadados adicionais de governança
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TenantMembership {
  id: string;                      // Vínculo explícito: `${userId}_${tenantId}`
  userId: string;                  // UID do usuário
  userEmail: string;               // E-mail do usuário
  tenantId: string;                // ID do tenant vinculado
  role: TenantRole;                // Papel do usuário neste tenant específico
  isDefault: boolean;              // Se este é o tenant padrão do usuário
  isActive: boolean;               // Vínculo ativo ou revogado
  grantedBy: string;               // E-mail de quem concedeu o acesso
  grantedAt: string;
  expiresAt?: string;              // Expiração opcional de acesso
}

export interface TenantContext {
  activeTenantId: string;
  activeTenant: Tenant | null;
  userRoleInTenant: TenantRole | 'SUPER_ADMIN' | null;
  isSuperAdmin: boolean;
  availableTenants: Tenant[];
  switchTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
}

export interface TenantScopedEntity {
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface TenantIsolationPolicy {
  resource: string;
  scope: 'GLOBAL' | 'TENANT_SCOPED' | 'USER_SCOPED' | 'PUBLIC';
  allowedRoles: string[];
  enforceTenantMatch: boolean;
}
