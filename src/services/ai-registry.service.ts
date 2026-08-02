// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT 175 — AI REGISTRY SERVICE
// Instituto Ser Melhor · EAIGP Domain
// Etapa 2: Registro Corporativo de Todos os Ativos de IA
// ═══════════════════════════════════════════════════════════════════════════════
import type {
  AIAssetRegistration,
  AIAssetStatus,
  AIAssetType,
  AIProvider,
} from '../types/ai-governance.types';

// ── Validation Helpers ──────────────────────────────────────────────────────────
export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

export function isValidAssetCode(code: string): boolean {
  // Must be SCREAMING_SNAKE_CASE, 5–80 chars
  return /^[A-Z][A-Z0-9_]{4,79}$/.test(code);
}

// ── Registry Operations ────────────────────────────────────────────────────────
export function createAssetRegistration(
  input: Omit<AIAssetRegistration, 'id' | 'status' | 'registeredAt' | 'riskIds' | 'governancePolicyIds'>
): AIAssetRegistration {
  if (!isValidSemver(input.version)) {
    throw new Error(`Invalid semver version: ${input.version}. Must be MAJOR.MINOR.PATCH`);
  }
  if (!isValidAssetCode(input.code)) {
    throw new Error(`Invalid asset code: ${input.code}. Must be SCREAMING_SNAKE_CASE (5–80 chars)`);
  }
  return {
    ...input,
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'DRAFT',
    registeredAt: new Date().toISOString(),
    riskIds: [],
    governancePolicyIds: [],
  };
}

export function transitionAssetStatus(
  asset: AIAssetRegistration,
  newStatus: AIAssetStatus,
  actorId: string
): AIAssetRegistration {
  const validTransitions: Record<AIAssetStatus, AIAssetStatus[]> = {
    DRAFT: ['PENDING_REVIEW', 'BLOCKED'],
    PENDING_REVIEW: ['APPROVED', 'DRAFT', 'BLOCKED'],
    APPROVED: ['PUBLISHED', 'BLOCKED', 'PENDING_REVIEW'],
    PUBLISHED: ['DEPRECATED', 'BLOCKED'],
    DEPRECATED: ['ARCHIVED', 'PUBLISHED'],
    ARCHIVED: [],
    BLOCKED: ['DRAFT', 'ARCHIVED'],
  };

  const allowed = validTransitions[asset.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${asset.status} → ${newStatus}. ` +
      `Allowed from ${asset.status}: [${allowed.join(', ') || 'none'}]. Actor: ${actorId}`
    );
  }

  const now = new Date().toISOString();
  return {
    ...asset,
    status: newStatus,
    publishedAt: newStatus === 'PUBLISHED' ? now : asset.publishedAt,
    deprecatedAt: newStatus === 'DEPRECATED' ? now : asset.deprecatedAt,
    archivedAt: newStatus === 'ARCHIVED' ? now : asset.archivedAt,
  };
}

export function filterAssetsByStatus(
  assets: AIAssetRegistration[],
  status: AIAssetStatus
): AIAssetRegistration[] {
  return assets.filter(a => a.status === status);
}

export function filterAssetsByType(
  assets: AIAssetRegistration[],
  type: AIAssetType
): AIAssetRegistration[] {
  return assets.filter(a => a.assetType === type);
}

export function filterAssetsByProvider(
  assets: AIAssetRegistration[],
  provider: AIProvider
): AIAssetRegistration[] {
  return assets.filter(a => a.provider === provider);
}

export function linkGovernancePolicyToAsset(
  asset: AIAssetRegistration,
  policyId: string
): AIAssetRegistration {
  if (asset.governancePolicyIds.includes(policyId)) return asset;
  return { ...asset, governancePolicyIds: [...asset.governancePolicyIds, policyId] };
}

export function linkRiskToAsset(
  asset: AIAssetRegistration,
  riskId: string
): AIAssetRegistration {
  if (asset.riskIds.includes(riskId)) return asset;
  return { ...asset, riskIds: [...asset.riskIds, riskId] };
}

export function getRegistrySummary(assets: AIAssetRegistration[]): {
  total: number;
  byStatus: Record<AIAssetStatus, number>;
  byType: Record<string, number>;
  byProvider: Record<string, number>;
  publishedCount: number;
  blockedCount: number;
} {
  const byStatus = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {} as Record<AIAssetStatus, number>);

  const byType = assets.reduce((acc, a) => {
    acc[a.assetType] = (acc[a.assetType] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byProvider = assets.reduce((acc, a) => {
    acc[a.provider] = (acc[a.provider] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: assets.length,
    byStatus,
    byType,
    byProvider,
    publishedCount: byStatus['PUBLISHED'] ?? 0,
    blockedCount: byStatus['BLOCKED'] ?? 0,
  };
}

// ── AURA Platform AI Asset Catalogue (Seed Data) ───────────────────────────────
export const AURA_AI_REGISTRY_SEED: Omit<AIAssetRegistration, 'id' | 'registeredAt' | 'riskIds' | 'governancePolicyIds'>[] = [
  {
    assetType: 'LLM',
    name: 'AURA Risk Assessment LLM',
    code: 'AURA_RISK_ASSESSMENT_LLM_V1',
    description: 'Gemini 1.5 Pro para avaliação de risco psicossocial e priorização de casos AURA',
    version: '1.0.0',
    provider: 'GOOGLE_GEMINI',
    providerModelId: 'gemini-1.5-pro-002',
    status: 'PUBLISHED',
    ownerId: 'system-caio',
    teamId: 'team-ai-platform',
    domainContext: 'AURA',
    tags: ['risk', 'assessment', 'psicossocial', 'core'],
  },
  {
    assetType: 'AGENT',
    name: 'AURA Cognitive Orchestrator Agent',
    code: 'AURA_COGNITIVE_ORCHESTRATOR_V1',
    description: 'Agente cognitivo orquestrador central da Plataforma AURA — coordena decisões e fluxos',
    version: '1.0.0',
    provider: 'GOOGLE_GEMINI',
    status: 'PUBLISHED',
    ownerId: 'system-caio',
    teamId: 'team-ai-platform',
    domainContext: 'AURA',
    tags: ['orchestrator', 'agent', 'core', 'aura'],
  },
  {
    assetType: 'EMBEDDING_MODEL',
    name: 'ISM Knowledge Embedding Model',
    code: 'ISM_KNOWLEDGE_EMBEDDING_V1',
    description: 'Modelo de embeddings para o Knowledge Graph institucional e RAG pipelines',
    version: '1.0.0',
    provider: 'GOOGLE_GEMINI',
    providerModelId: 'text-embedding-004',
    status: 'PUBLISHED',
    ownerId: 'system-caio',
    teamId: 'team-ai-platform',
    domainContext: 'AURA',
    tags: ['embedding', 'rag', 'knowledge-graph'],
  },
  {
    assetType: 'RAG_PIPELINE',
    name: 'AURA Institutional Knowledge RAG',
    code: 'AURA_INSTITUTIONAL_RAG_V1',
    description: 'Pipeline RAG sobre Knowledge Graph institucional para consultas de casos e políticas',
    version: '1.0.0',
    provider: 'INTERNAL',
    status: 'PUBLISHED',
    ownerId: 'system-caio',
    teamId: 'team-ai-platform',
    domainContext: 'AURA',
    tags: ['rag', 'knowledge', 'institutional'],
  },
  {
    assetType: 'CLASSIFICATION_MODEL',
    name: 'AURA Social Vulnerability Classifier',
    code: 'AURA_VULNERABILITY_CLASSIFIER_V1',
    description: 'Classificador de vulnerabilidade social para triagem e priorização de beneficiários',
    version: '1.0.0',
    provider: 'INTERNAL',
    status: 'APPROVED',
    ownerId: 'system-caio',
    teamId: 'team-ai-platform',
    domainContext: 'AURA',
    tags: ['classifier', 'vulnerability', 'social', 'triage'],
  },
];
