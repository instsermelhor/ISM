/**
 * eplitecmfEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Product Lifecycle, Innovation, Technology Evolution &
 * Continuous Modernization Framework (EPLITECMF)
 * Instituto Ser Melhor — Prompt E026 — Plataforma ISM v2.0
 *
 * Frameworks & Standards:
 *   - ISO 56002 (Innovation Management Systems)
 *   - ISO 25010 (Software Product Quality & Maintainability)
 *   - ThoughtWorks Technology Radar (Adopt, Trial, Assess, Hold)
 *   - FinOps Foundation (Cloud Financial Management)
 *   - ITIL 4 / SRE / ISO 42001 / ISO 27001 / NIST CSF 2.0 / LGPD
 *   - DDD / CQRS / Clean Architecture / OpenTelemetry
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs, updateDoc, doc,
  serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from './firestore';

// ═══════════════════════════════════════════════════════════════════════════════
// ── DOMAIN ENUMS & TYPES ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type RadarRing = 'ADOPT' | 'TRIAL' | 'ASSESS' | 'HOLD';

export type RadarQuadrant = 'LANGUAGES_FRAMEWORKS' | 'INFRASTRUCTURE_CLOUD' | 'DATA_ANALYTICS_AI' | 'SECURITY_GOVERNANCE';

export type TechnicalDebtSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type InnovationPoCStatus = 'PROPOSED' | 'IN_EXPERIMENTATION' | 'GRADUATED_TO_ROADMAP' | 'DISCARDED';

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── AGGREGATE ROOTS (ETAPA 1) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root 1: TechnologyRadarItem */
export interface TechnologyRadarItem {
  id: string;
  code: string;               // ex: RAD-001
  name: string;
  quadrant: RadarQuadrant;
  ring: RadarRing;
  description: string;
  rationale: string;
  versionNumber: string;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root 2: TechnicalDebtItem */
export interface TechnicalDebtItem {
  id: string;
  code: string;               // ex: DEBT-001
  title: string;
  category: 'ARCHITECTURE' | 'CODE_QUALITY' | 'INFRASTRUCTURE' | 'DOCUMENTATION' | 'SECURITY';
  affectedModule: string;
  severity: TechnicalDebtSeverity;
  estimatedRemediationDays: number;
  businessImpactDescription: string;
  status: 'IDENTIFIED' | 'REMEDIATION_PLANNED' | 'REMEDIATED';
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root 3: InnovationPoC */
export interface InnovationPoC {
  id: string;
  code: string;               // ex: POC-001
  title: string;
  hypothesis: string;
  targetDomain: string;
  technologiesTested: string[];
  status: InnovationPoCStatus;
  experimentResultsSummary?: string;
  startedAt: string;
  completedAt?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root 4: ModernizationInitiative */
export interface ModernizationInitiative {
  id: string;
  code: string;               // ex: MOD-001
  title: string;
  horizonMonths: 12 | 24 | 36 | 60;
  primaryObjective: string;
  targetModules: string[];
  allocatedBudgetBrl: number;
  expectedSocialImpact: string;
  status: 'PLANNED' | 'IN_EXECUTION' | 'COMPLETED';
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root 5: FinOpsCostOptimization */
export interface FinOpsCostOptimization {
  id: string;
  resourceCategory: 'CLOUD_COMPUTE' | 'AI_INFERENCE_TOKENS' | 'STORAGE_ETL' | 'DATABASE_IO';
  monthlyCostBrl: number;
  optimizedTargetCostBrl: number;
  savingsPercentage: number;
  optimizationStrategy: string;
  status: 'OPTIMIZED' | 'IN_REVISE';
}

/** Aggregate Root 6: PlatformEvolutionCertification */
export interface EvolutionMaturityScore {
  dimension: string;
  score: number;               // 0-100
  maturityLevel: string;
}

export interface PlatformEvolutionCertification {
  evolutionMaturityIndex: number; // 0-100
  innovationScore: number;
  architectureGovernanceScore: number;
  productManagementScore: number;
  technicalDebtControlScore: number;
  finOpsOptimizationScore: number;
  sustainabilityScore: number;
  dimensionScores: EvolutionMaturityScore[];
  certifiedAt: string;
  certifiedBy: string;
  permanentGovernanceActive: boolean;
  conformanceChecklist: { item: string; standard: string; compliant: boolean }[];
}

export interface EPLITECMFConsolidatedDashboard {
  generatedAt: string;
  technologyRadarItemsCount: number;
  activePoCsInLabCount: number;
  remediatedTechnicalDebtPct: number;
  finOpsSavingsAchievedBrl: number;
  evolutionRoadmapHorizonsYears: number; // 1, 2, 3, 5 years
  evolutionMaturityIndex: number;
  governanceProgramStatus: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TS = () => new Date().toISOString();
const uid = (p: string, n: number) => `${p}-${String(n).padStart(3, '0')}`;

function generateRadar(): TechnologyRadarItem[] {
  const items = [
    { code: 'RAD-001', name: 'React 19 & Next.js App Router', q: 'LANGUAGES_FRAMEWORKS', r: 'ADOPT', desc: 'Padrão frontend corporativo oficial da plataforma.' },
    { code: 'RAD-002', name: 'Google Cloud Vertex AI & Gemini 1.5 Pro', q: 'DATA_ANALYTICS_AI', r: 'ADOPT', desc: 'Motor principal de Inteligência Artificial e RAG (E020).' },
    { code: 'RAD-003', name: 'OpenTelemetry Distributed Tracing W3C', q: 'INFRASTRUCTURE_CLOUD', r: 'ADOPT', desc: 'Padrão universal de observabilidade e métricas.' },
    { code: 'RAD-004', name: 'Local Llama 3.1 70B (On-Prem)', q: 'DATA_ANALYTICS_AI', r: 'TRIAL', desc: 'Experimento para inferências 100% privadas sem saída externa.' },
    { code: 'RAD-005', name: 'mTLS & OAuth 2.1 PKCE', q: 'SECURITY_GOVERNANCE', r: 'ADOPT', desc: 'Arquitetura Zero-Trust para APIs e conectores (E021).' },
    { code: 'RAD-006', name: 'Protobuf & gRPC Streams', q: 'INFRASTRUCTURE_CLOUD', r: 'TRIAL', desc: 'Comunicação de ultra-baixa latência para teleatendimento.' },
    { code: 'RAD-007', name: 'REST Legado sem versionamento OpenAPI 3.1', q: 'LANGUAGES_FRAMEWORKS', r: 'HOLD', desc: 'Tecnologia em descontinuação gradual.' },
  ];

  return items.map((t, i) => ({
    id: uid('RAD', i + 1),
    code: t.code,
    name: t.name,
    quadrant: t.q as RadarQuadrant,
    ring: t.r as RadarRing,
    description: t.desc,
    rationale: 'Avaliado pelo Comitê de Arquitetura e Inovação Tecnológica.',
    versionNumber: 'v2026.1',
    createdBy: 'cino@ism.org.br',
  }));
}

function generateTechnicalDebt(): TechnicalDebtItem[] {
  const debts = [
    { code: 'DEBT-001', title: 'Refatoração de rotas históricas do admin para React 19 lazy', cat: 'CODE_QUALITY', mod: 'E005', sev: 'LOW', days: 2, impact: 'Pequena otimização no bundle inicial.' },
    { code: 'DEBT-002', title: 'Padronização de índices compostos em coleções secundárias', cat: 'INFRASTRUCTURE', mod: 'E019', sev: 'LOW', days: 1, impact: 'Melhoria residual de 3ms na busca DW.' },
  ];

  return debts.map((d, i) => ({
    id: uid('DEBT', i + 1),
    code: d.code,
    title: d.title,
    category: d.cat as TechnicalDebtItem['category'],
    affectedModule: d.mod,
    severity: d.sev as TechnicalDebtSeverity,
    estimatedRemediationDays: d.days,
    businessImpactDescription: d.impact,
    status: 'REMEDIATED' as const,
    version: 1,
    createdBy: 'cto@ism.org.br',
  }));
}

function generatePoCs(): InnovationPoC[] {
  const pocs = [
    { code: 'POC-001', title: 'PoC Visão Computacional para Leitura de Prontuários Físicos', domain: 'E006', techs: ['Vertex AI Vision', 'Document AI'], status: 'GRADUATED_TO_ROADMAP' },
    { code: 'POC-002', title: 'PoC Criptografia Resistente a Computação Quântica', domain: 'E021', techs: ['Kyber-1024', 'Dilithium'], status: 'IN_EXPERIMENTATION' },
  ];

  return pocs.map((p, i) => ({
    id: uid('POC', i + 1),
    code: p.code,
    title: p.title,
    hypothesis: 'Validar viabilidade técnica sem impacto na estabilidade de produção.',
    targetDomain: p.domain,
    technologiesTested: p.techs,
    status: p.status as InnovationPoCStatus,
    experimentResultsSummary: 'Resultado preliminar positivo com 98.4% de acurácia.',
    startedAt: '2026-01-15',
    version: 1,
    createdBy: 'cino@ism.org.br',
  }));
}

function generateFinOps(): FinOpsCostOptimization[] {
  return [
    { id: 'FIN-001', resourceCategory: 'AI_INFERENCE_TOKENS', monthlyCostBrl: 18500, optimizedTargetCostBrl: 12200, savingsPercentage: 34.0, optimizationStrategy: 'Caching semântico de respostas RAG repetidas e prompt trimming', status: 'OPTIMIZED' },
    { id: 'FIN-002', resourceCategory: 'CLOUD_COMPUTE', monthlyCostBrl: 14200, optimizedTargetCostBrl: 9800, savingsPercentage: 31.0, optimizationStrategy: 'Autoscaling dinâmico no Cloud Run com instâncias min=0 fora do horário de pico', status: 'OPTIMIZED' },
    { id: 'FIN-003', resourceCategory: 'STORAGE_ETL', monthlyCostBrl: 8400, optimizedTargetCostBrl: 5600, savingsPercentage: 33.3, optimizationStrategy: 'Lifecycle policy no Cloud Storage movendo dados > 90 dias para Coldline', status: 'OPTIMIZED' },
  ];
}

function generateCertification(): PlatformEvolutionCertification {
  const scores: EvolutionMaturityScore[] = [
    { dimension: 'Governança do Ciclo de Vida do Produto', score: 98, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
    { dimension: 'Radar Tecnológico & Obsolescência', score: 99, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
    { dimension: 'Laboratório de Inovação & PoCs (ISO 56002)', score: 97, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
    { dimension: 'Gestão da Dívida Técnica & Refatoração', score: 98, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
    { dimension: 'FinOps & Otimização de Custos em Nuvem/IA', score: 99, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
    { dimension: 'Governança da Arquitetura & ADRs Contínuos', score: 98, maturityLevel: 'Nível 5 - Otimizado & Sustentável' },
  ];

  const overall = Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length);

  return {
    evolutionMaturityIndex: overall,
    innovationScore: 97,
    architectureGovernanceScore: 98,
    productManagementScore: 98,
    technicalDebtControlScore: 98,
    finOpsOptimizationScore: 99,
    sustainabilityScore: 98,
    dimensionScores: scores,
    certifiedAt: TS(),
    certifiedBy: 'Chief Product Officer (CPO) & Chief Innovation Officer (CINO)',
    permanentGovernanceActive: true,
    conformanceChecklist: [
      { item: 'Programa Permanente de Evolução da Plataforma instituído', standard: 'Enterprise Product Management', compliant: true },
      { item: 'Radar Tecnológico com quadrantes ADOPT, TRIAL, ASSESS, HOLD ativo', standard: 'ThoughtWorks Radar / ISO 56002', compliant: true },
      { item: 'Gestão de Dívida Técnica com controle e remediação contínua', standard: 'ISO 25010 Maintainability', compliant: true },
      { item: 'Laboratório de Inovação para PoCs isoladas do ambiente produtivo', standard: 'ISO 56002 Innovation', compliant: true },
      { item: 'FinOps: Redução de 33% nos custos operacionais de nuvem e IA', standard: 'FinOps Foundation Standard', compliant: true },
      { item: 'Roadmap Estratégico Multianual (12, 24, 36, 60 meses) homologado', standard: 'Strategic Product Roadmap', compliant: true },
      { item: 'Governança Contínua de IA (E020) contra riscos emergentes', standard: 'ISO 42001 Continuous Eval', compliant: true },
      { item: 'Monitoramento contínuo de obsolescência de dependências', standard: 'ITIL 4 / Life Cycle Control', compliant: true },
      { item: 'Revisões Periódicas de Arquitetura e registro formal de ADRs', standard: 'Architecture Governance', compliant: true },
      { item: 'Alinhamento permanente da tecnologia com o impacto social do ISM', standard: 'Institutional Mission Value', compliant: true },
    ],
  };
}

function generateConsolidated(): EPLITECMFConsolidatedDashboard {
  return {
    generatedAt: TS(),
    technologyRadarItemsCount: 7,
    activePoCsInLabCount: 2,
    remediatedTechnicalDebtPct: 99.1,
    finOpsSavingsAchievedBrl: 13500,
    evolutionRoadmapHorizonsYears: 5,
    evolutionMaturityIndex: 98,
    governanceProgramStatus: 'PROGRAMA PERMANENTE INSTITUÍDO E ATIVO',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SERVICE CLASS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export class EPLITECMFService {
  static async getConsolidatedDashboard(): Promise<EPLITECMFConsolidatedDashboard> {
    return generateConsolidated();
  }

  static async getRadar(): Promise<TechnologyRadarItem[]> {
    return generateRadar();
  }

  static async getTechnicalDebt(): Promise<TechnicalDebtItem[]> {
    return generateTechnicalDebt();
  }

  static async getPoCs(): Promise<InnovationPoC[]> {
    return generatePoCs();
  }

  static async getFinOps(): Promise<FinOpsCostOptimization[]> {
    return generateFinOps();
  }

  static async getCertification(): Promise<PlatformEvolutionCertification> {
    return generateCertification();
  }
}
