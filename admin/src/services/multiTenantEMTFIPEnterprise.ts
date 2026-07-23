/**
 * multiTenantEMTFIPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Multi-Tenant Federated Institutional Platform
 * Instituto Ser Melhor — Prompt 082 — Plataforma ISM v2.0
 *
 * Padrões: Multi-Tenant SaaS, Identity Federation, Zero Trust, OpenID Connect,
 *          OAuth 2.1, SAML 2.0, AlloyDB, Apigee, Cloud Identity, ISO 27001,
 *          TOGAF, COBIT 2019, DAMA-DMBOK2, Event Driven Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type TenantPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'GOVERNMENT';
export type TenantStatus = 'ATIVO' | 'TRIAL' | 'SUSPENSO' | 'CONFIGURANDO';
export type IsolationLayer = 'LOGICO' | 'SCHEMA' | 'DATABASE' | 'CLUSTER';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TenantEntry {
  id: string;
  tenantCode: string;         // ex: "TEN-ISM-001"
  tenantName: string;         // ex: "Instituto Ser Melhor (Sede)"
  organizationType: string;   // ex: "Instituto / OSCIP"
  plan: TenantPlan;
  status: TenantStatus;
  isolationLayer: IsolationLayer;
  modulesActive: number;      // módulos habilitados
  usersTotal: number;
  aiAgentsCount: number;
  storageUsedGB: number;
  ssoProvider: string;        // ex: "Google Workspace / SAML 2.0"
  dataRegion: string;         // ex: "southamerica-east1"
  complianceFlags: string[];  // ex: ["LGPD", "ISO 27001", "ESG"]
  createdAt?: unknown;
}

export interface TenantFederationRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  ruleCategory: 'ISOLAMENTO' | 'IDENTIDADE' | 'IA' | 'DADOS' | 'GOVERNANCA';
  enforced: boolean;
  description: string;
}

export interface EMTFIPDashboardKPIs {
  globalMultiTenantMaturityScore: number; // 0-100 (ex: 98.8)
  activeTenants: number;                  // ex: 4 tenants simulados
  totalUsersAcrossTenants: number;        // ex: 1240
  isolationComplianceRate: number;        // ex: 100%
  ssoFederationProtocols: number;         // ex: 4 (OIDC, OAuth 2.1, SAML 2.0, Passkeys)
  scalabilityTargetOrgs: number;          // ex: 1.000 orgs
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_TENANTS: Omit<TenantEntry, 'id' | 'createdAt'>[] = [
  {
    tenantCode: 'TEN-ISM-001',
    tenantName: 'Instituto Ser Melhor (Sede — SP)',
    organizationType: 'Instituto / OSCIP',
    plan: 'ENTERPRISE',
    status: 'ATIVO',
    isolationLayer: 'SCHEMA',
    modulesActive: 81,
    usersTotal: 480,
    aiAgentsCount: 9,
    storageUsedGB: 124,
    ssoProvider: 'Google Workspace · OIDC / OAuth 2.1',
    dataRegion: 'southamerica-east1 (São Paulo)',
    complianceFlags: ['LGPD', 'ISO 27001', 'ISO 9001', 'ESG', 'ODS'],
  },
  {
    tenantCode: 'TEN-FOND-002',
    tenantName: 'Fundação Parceira Beta (RJ)',
    organizationType: 'Fundação Privada',
    plan: 'PROFESSIONAL',
    status: 'ATIVO',
    isolationLayer: 'SCHEMA',
    modulesActive: 42,
    usersTotal: 280,
    aiAgentsCount: 4,
    storageUsedGB: 38,
    ssoProvider: 'Azure AD · SAML 2.0',
    dataRegion: 'southamerica-east1 (São Paulo)',
    complianceFlags: ['LGPD', 'ISO 27001'],
  },
  {
    tenantCode: 'TEN-PUBL-003',
    tenantName: 'Prefeitura Municipal Parceira (MG)',
    organizationType: 'Órgão Público Municipal',
    plan: 'GOVERNMENT',
    status: 'ATIVO',
    isolationLayer: 'DATABASE',
    modulesActive: 28,
    usersTotal: 360,
    aiAgentsCount: 3,
    storageUsedGB: 52,
    ssoProvider: 'Gov.br · OpenID Connect',
    dataRegion: 'southamerica-east1 (São Paulo)',
    complianceFlags: ['LGPD', 'ISO 27001', 'INDA Gov'],
  },
  {
    tenantCode: 'TEN-UNIV-004',
    tenantName: 'Universidade Parceira (RS)',
    organizationType: 'Instituição de Ensino Superior',
    plan: 'PROFESSIONAL',
    status: 'TRIAL',
    isolationLayer: 'SCHEMA',
    modulesActive: 18,
    usersTotal: 120,
    aiAgentsCount: 2,
    storageUsedGB: 14,
    ssoProvider: 'CAFe/RNP · SAML 2.0',
    dataRegion: 'southamerica-east1 (São Paulo)',
    complianceFlags: ['LGPD', 'ESG'],
  },
];

const SEED_RULES: Omit<TenantFederationRule, 'id'>[] = [
  { ruleCode: 'FED-ISO-001', ruleName: 'Isolamento Completo de Dados por Tenant (Schema Separation)', ruleCategory: 'ISOLAMENTO', enforced: true, description: 'Cada Tenant opera em schema AlloyDB isolado. Queries cross-tenant são bloqueadas em nível de ORM e API Gateway (Apigee).' },
  { ruleCode: 'FED-ID-002', ruleName: 'Federação de Identidade com MFA Obrigatório', ruleCategory: 'IDENTIDADE', enforced: true, description: 'SSO via OIDC/SAML 2.0 com MFA obrigatório para todos os usuários. Passkeys habilitadas como alternativa FIDO2.' },
  { ruleCode: 'FED-AI-003', ruleName: 'Segregação Absoluta de Contexto de IA por Tenant', ruleCategory: 'IA', enforced: true, description: 'Cada Tenant possui instância de RAG, vectorstore e memória de agentes isolada. Vertex AI Workspaces segregados.' },
  { ruleCode: 'FED-DAD-004', ruleName: 'Criptografia de Dados com Chaves por Tenant (CMEK)', ruleCategory: 'DADOS', enforced: true, description: 'Customer-Managed Encryption Keys (CMEK) via Cloud KMS — cada Tenant possui chave mestra própria, rotacionada anualmente.' },
  { ruleCode: 'FED-GOV-005', ruleName: 'Governança Federada Independente por Organização', ruleCategory: 'GOVERNANCA', enforced: true, description: 'Cada Tenant possui seus próprios administradores, políticas RBAC/ABAC, trilha de auditoria e fluxos de aprovação.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEMTFIPService = {

  async getTenants(): Promise<TenantEntry[]> {
    const q = query(collection(db, 'emtfip_tenants'), orderBy('modulesActive', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_TENANTS) {
        await addDoc(collection(db, 'emtfip_tenants'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getTenants();
    }
    return snap.docs.map(d => mapDoc<TenantEntry>(d));
  },

  async getFederationRules(): Promise<TenantFederationRule[]> {
    const q = query(collection(db, 'emtfip_federation_rules'), orderBy('ruleCode'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RULES) {
        await addDoc(collection(db, 'emtfip_federation_rules'), { ...item });
      }
      return this.getFederationRules();
    }
    return snap.docs.map(d => mapDoc<TenantFederationRule>(d));
  },

  async getDashboardKPIs(): Promise<EMTFIPDashboardKPIs> {
    return {
      globalMultiTenantMaturityScore: 98.8,
      activeTenants: 4,
      totalUsersAcrossTenants: 1240,
      isolationComplianceRate: 100,
      ssoFederationProtocols: 4,
      scalabilityTargetOrgs: 1000,
      certificationDate: '2026-07-22',
      certificationVersion: 'EMTFIP v1.0 — Prompt 082 (Multi-Tenant Federado Enterprise)',
    };
  },
};
