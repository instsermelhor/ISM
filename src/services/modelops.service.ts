// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT 175 — MODELOPS SERVICE
// Instituto Ser Melhor · EAIGP Domain
// Etapa 3: Controle do Ciclo de Vida de Modelos em Produção
// ═══════════════════════════════════════════════════════════════════════════════
import type { ModelOpsRecord, ModelOpsPipelineStage } from '../types/ai-governance.types';

// ── Validation Gates (ISO/IEC 42001 §8.4) ─────────────────────────────────────
export const MODEL_VALIDATION_GATES = [
  'accuracy_gate',        // Accuracy / F1 ≥ threshold
  'bias_gate',            // Bias score within acceptable range
  'latency_gate',         // P99 latency ≤ SLA
  'drift_gate',           // No significant drift from baseline
  'security_gate',        // No adversarial vulnerability found
  'privacy_gate',         // PII not leaked in outputs
  'explainability_gate',  // Explanations generated for critical decisions
  'cost_gate',            // Cost per request within budget
] as const;

export type ModelValidationGate = typeof MODEL_VALIDATION_GATES[number];

// ── Stage Transition Rules ─────────────────────────────────────────────────────
const STAGE_TRANSITIONS: Record<ModelOpsPipelineStage, ModelOpsPipelineStage[]> = {
  TRAINING: ['VALIDATION'],
  VALIDATION: ['HOMOLOGATION', 'TRAINING'],
  HOMOLOGATION: ['STAGING', 'VALIDATION'],
  STAGING: ['PRODUCTION', 'HOMOLOGATION'],
  PRODUCTION: ['MONITORING', 'ROLLBACK', 'DEPRECATED'],
  MONITORING: ['PRODUCTION', 'ROLLBACK', 'DEPRECATED'],
  ROLLBACK: ['PRODUCTION', 'DEPRECATED'],
  DEPRECATED: ['ARCHIVED'],
  ARCHIVED: [],
};

// ── Required Gates per Stage ───────────────────────────────────────────────────
const REQUIRED_GATES_FOR_PRODUCTION: ModelValidationGate[] = [
  'accuracy_gate',
  'bias_gate',
  'latency_gate',
  'security_gate',
  'privacy_gate',
];

export function canTransitionToProduction(record: ModelOpsRecord): {
  allowed: boolean;
  missingGates: string[];
} {
  const missingGates = REQUIRED_GATES_FOR_PRODUCTION.filter(
    gate => !record.validationGatesPassed.includes(gate)
  );
  return { allowed: missingGates.length === 0, missingGates };
}

// ── Pipeline Operations ────────────────────────────────────────────────────────
export function createModelOpsRecord(assetId: string): ModelOpsRecord {
  return {
    assetId,
    currentStage: 'TRAINING',
    stageHistory: [
      {
        stage: 'TRAINING',
        enteredAt: new Date().toISOString(),
        triggeredBy: 'SYSTEM',
      },
    ],
    validationGatesPassed: [],
  };
}

export function advanceModelStage(
  record: ModelOpsRecord,
  newStage: ModelOpsPipelineStage,
  triggeredBy: string,
  notes?: string
): ModelOpsRecord {
  const allowed = STAGE_TRANSITIONS[record.currentStage] ?? [];
  if (!allowed.includes(newStage)) {
    throw new Error(
      `ModelOps: invalid stage transition ${record.currentStage} → ${newStage}. ` +
      `Allowed: [${allowed.join(', ') || 'none'}]`
    );
  }

  // Block promotion to PRODUCTION if required gates are missing
  if (newStage === 'PRODUCTION') {
    const { allowed: canPromote, missingGates } = canTransitionToProduction(record);
    if (!canPromote) {
      throw new Error(
        `ModelOps: Cannot promote to PRODUCTION. Missing validation gates: [${missingGates.join(', ')}]`
      );
    }
  }

  const now = new Date().toISOString();
  const updatedHistory = record.stageHistory.map(h =>
    h.stage === record.currentStage && !h.exitedAt ? { ...h, exitedAt: now } : h
  );

  return {
    ...record,
    previousStage: record.currentStage,
    currentStage: newStage,
    lastEvaluationAt: newStage === 'MONITORING' ? now : record.lastEvaluationAt,
    stageHistory: [
      ...updatedHistory,
      { stage: newStage, enteredAt: now, triggeredBy, notes },
    ],
  };
}

export function recordValidationGate(
  record: ModelOpsRecord,
  gate: ModelValidationGate
): ModelOpsRecord {
  if (record.validationGatesPassed.includes(gate)) return record;
  return {
    ...record,
    validationGatesPassed: [...record.validationGatesPassed, gate],
  };
}

export function initiateRollback(
  record: ModelOpsRecord,
  targetVersion: string,
  triggeredBy: string
): ModelOpsRecord {
  const withRollbackStage = advanceModelStage(record, 'ROLLBACK', triggeredBy, `Rollback to ${targetVersion}`);
  return { ...withRollbackStage, rollbackTargetVersion: targetVersion };
}

export function getModelOpsSummary(records: ModelOpsRecord[]): {
  total: number;
  inProduction: number;
  inMonitoring: number;
  pendingValidation: number;
  rolledBack: number;
  deprecated: number;
} {
  return {
    total: records.length,
    inProduction: records.filter(r => r.currentStage === 'PRODUCTION').length,
    inMonitoring: records.filter(r => r.currentStage === 'MONITORING').length,
    pendingValidation: records.filter(r => ['TRAINING', 'VALIDATION', 'HOMOLOGATION', 'STAGING'].includes(r.currentStage)).length,
    rolledBack: records.filter(r => r.currentStage === 'ROLLBACK').length,
    deprecated: records.filter(r => r.currentStage === 'DEPRECATED').length,
  };
}
