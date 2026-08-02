// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT 175 — LLMOPS SERVICE
// Instituto Ser Melhor · EAIGP Domain
// Etapa 4: Gestão Operacional de LLMs — Provedor-Agnóstica
// ═══════════════════════════════════════════════════════════════════════════════
import type { LLMOpsConfig, AIProvider } from '../types/ai-governance.types';

// ── LLM Operational Limits (NIST AI RMF MG-2.2) ───────────────────────────────
export const LLMOPS_DEFAULTS: Omit<LLMOpsConfig, 'assetId' | 'connectors' | 'tools' | 'allowedCallerIds'> = {
  temperature: 0.2,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  contextWindowTokens: 32768,
  memoryStrategy: 'SESSION',
  rateLimitRpm: 60,
  rateLimitTpd: 500000,
  providerFallbackChain: ['GOOGLE_GEMINI', 'VERTEX_AI'],
  piiFilteringEnabled: true,
  outputValidationEnabled: true,
  humanReviewRequired: false,
};

// ── Validation ─────────────────────────────────────────────────────────────────
export function validateLLMOpsConfig(config: LLMOpsConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.temperature < 0 || config.temperature > 2) {
    errors.push(`temperature must be 0.0–2.0, got ${config.temperature}`);
  }
  if (config.maxOutputTokens < 1 || config.maxOutputTokens > 32768) {
    errors.push(`maxOutputTokens must be 1–32768, got ${config.maxOutputTokens}`);
  }
  if (config.rateLimitRpm < 1) {
    errors.push(`rateLimitRpm must be ≥ 1, got ${config.rateLimitRpm}`);
  }
  if (config.rateLimitTpd < 1) {
    errors.push(`rateLimitTpd must be ≥ 1, got ${config.rateLimitTpd}`);
  }
  if (!config.piiFilteringEnabled) {
    errors.push('piiFilteringEnabled must be true — LGPD compliance requires PII filtering');
  }
  if (config.providerFallbackChain.length === 0) {
    errors.push('providerFallbackChain must have at least one provider');
  }

  return { valid: errors.length === 0, errors };
}

// ── Config Factory ─────────────────────────────────────────────────────────────
export function createLLMOpsConfig(
  assetId: string,
  overrides: Partial<Omit<LLMOpsConfig, 'assetId'>> = {}
): LLMOpsConfig {
  const config: LLMOpsConfig = {
    assetId,
    connectors: [],
    tools: [],
    allowedCallerIds: [],
    ...LLMOPS_DEFAULTS,
    ...overrides,
  };

  const { valid, errors } = validateLLMOpsConfig(config);
  if (!valid) {
    throw new Error(`LLMOps config validation failed for ${assetId}: ${errors.join('; ')}`);
  }

  return config;
}

// ── Provider Swap (business logic unchanged) ───────────────────────────────────
export function swapLLMProvider(
  config: LLMOpsConfig,
  newPrimaryProvider: AIProvider
): LLMOpsConfig {
  const updatedChain = [
    newPrimaryProvider,
    ...config.providerFallbackChain.filter(p => p !== newPrimaryProvider),
  ];
  return { ...config, providerFallbackChain: updatedChain };
}

export function getActiveProvider(config: LLMOpsConfig): AIProvider {
  return config.providerFallbackChain[0];
}

// ── Tool & Connector Management ────────────────────────────────────────────────
export function addTool(config: LLMOpsConfig, toolId: string): LLMOpsConfig {
  if (config.tools.includes(toolId)) return config;
  return { ...config, tools: [...config.tools, toolId] };
}

export function removeTool(config: LLMOpsConfig, toolId: string): LLMOpsConfig {
  return { ...config, tools: config.tools.filter(t => t !== toolId) };
}

export function addConnector(config: LLMOpsConfig, connectorId: string): LLMOpsConfig {
  if (config.connectors.includes(connectorId)) return config;
  return { ...config, connectors: [...config.connectors, connectorId] };
}

export function addAllowedCaller(config: LLMOpsConfig, callerId: string): LLMOpsConfig {
  if (config.allowedCallerIds.includes(callerId)) return config;
  return { ...config, allowedCallerIds: [...config.allowedCallerIds, callerId] };
}

// ── Rate Limit Check ───────────────────────────────────────────────────────────
export function isWithinRateLimit(
  config: LLMOpsConfig,
  currentRpm: number,
  currentTpd: number
): { withinRpm: boolean; withinTpd: boolean; withinLimits: boolean } {
  const withinRpm = currentRpm <= config.rateLimitRpm;
  const withinTpd = currentTpd <= config.rateLimitTpd;
  return { withinRpm, withinTpd, withinLimits: withinRpm && withinTpd };
}

// ── Caller Authorization ───────────────────────────────────────────────────────
export function isCallerAuthorized(config: LLMOpsConfig, callerId: string): boolean {
  return config.allowedCallerIds.includes(callerId);
}
