// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT 175 — AURA ENTERPRISE AI GOVERNANCE (EAIGP)
// Instituto Ser Melhor · AI Governance Domain Types
// Aligned: ISO/IEC 42001 · NIST AI RMF · LGPD · Responsible AI
// ═══════════════════════════════════════════════════════════════════════════════

// ── Asset Lifecycle ────────────────────────────────────────────────────────────
export type AIAssetStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'DEPRECATED'
  | 'ARCHIVED'
  | 'BLOCKED';

export type AIAssetType =
  | 'LLM'
  | 'CLASSIFICATION_MODEL'
  | 'REGRESSION_MODEL'
  | 'EMBEDDING_MODEL'
  | 'AGENT'
  | 'RAG_PIPELINE'
  | 'PROMPT'
  | 'TOOL'
  | 'WORKFLOW';

export type AIProvider =
  | 'GOOGLE_GEMINI'
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'MISTRAL'
  | 'COHERE'
  | 'VERTEX_AI'
  | 'INTERNAL'
  | 'OTHER';

// ── Risk Classification (ISO/IEC 42001 + NIST AI RMF) ─────────────────────────
export type AIRiskCategory =
  | 'ASSISTENCIAL'     // Clinical/social care decisions
  | 'JURIDICO'         // Legal compliance
  | 'REGULATORIO'      // Regulatory (LGPD, CFP, CRESS)
  | 'OPERACIONAL'      // Platform operations
  | 'ETICO'            // Bias, discrimination, fairness
  | 'TECNOLOGICO'      // Model drift, hallucinations
  | 'REPUTACIONAL';    // Institutional reputation

export type AIRiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type AIRiskStatus = 'OPEN' | 'MITIGATING' | 'MITIGATED' | 'ACCEPTED' | 'ESCALATED';

// ── Model Evaluation Metrics ───────────────────────────────────────────────────
export type EvaluationMetricType =
  | 'ACCURACY'
  | 'PRECISION'
  | 'RECALL'
  | 'F1_SCORE'
  | 'HALLUCINATION_RATE'
  | 'DRIFT_SCORE'
  | 'LATENCY_P50_MS'
  | 'LATENCY_P99_MS'
  | 'COST_PER_REQUEST_BRL'
  | 'TOXICITY_SCORE'
  | 'BIAS_SCORE'
  | 'USER_SATISFACTION_SCORE'
  | 'GROUNDEDNESS_SCORE';

// ── AI Registry ────────────────────────────────────────────────────────────────
export interface AIAssetRegistration {
  id: string;
  assetType: AIAssetType;
  name: string;
  code: string;                      // e.g. 'AURA_RISK_CLASSIFIER_V2'
  description: string;
  version: string;                   // semver: '2.1.0'
  provider: AIProvider;
  providerModelId?: string;          // e.g. 'gemini-1.5-pro-002'
  status: AIAssetStatus;
  ownerId: string;                   // Responsible person UUID
  teamId: string;
  domainContext: string;             // 'AURA' | 'FINANCIAL' | 'HR' | 'BENEFICIARY'
  inputSchema?: string;              // JSON Schema string
  outputSchema?: string;
  governancePolicyIds: string[];     // Linked governance policies
  riskIds: string[];                 // Linked risk records
  tags: string[];
  registeredAt: string;
  publishedAt?: string;
  deprecatedAt?: string;
  archivedAt?: string;
  changelogSummary?: string;
}

// ── Prompt Governance ──────────────────────────────────────────────────────────
export interface PromptRecord {
  id: string;
  code: string;                      // 'AURA_RISK_ASSESSMENT_PROMPT_V3'
  title: string;
  content: string;
  objective: string;
  authorId: string;
  version: string;
  status: AIAssetStatus;
  compatibleModelCodes: string[];    // Which model codes this prompt is approved for
  usedToolIds: string[];
  restrictions: string[];            // e.g. ['No PII in output', 'Human review required']
  estimatedRisks: string[];
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  changeReason?: string;
}

// ── ModelOps Pipeline Stage ────────────────────────────────────────────────────
export type ModelOpsPipelineStage =
  | 'TRAINING'
  | 'VALIDATION'
  | 'HOMOLOGATION'
  | 'STAGING'
  | 'PRODUCTION'
  | 'MONITORING'
  | 'ROLLBACK'
  | 'DEPRECATED'
  | 'ARCHIVED';

export interface ModelOpsRecord {
  assetId: string;
  currentStage: ModelOpsPipelineStage;
  previousStage?: ModelOpsPipelineStage;
  stageHistory: Array<{
    stage: ModelOpsPipelineStage;
    enteredAt: string;
    exitedAt?: string;
    triggeredBy: string;
    notes?: string;
  }>;
  validationGatesPassed: string[];   // List of gates: 'accuracy_gate', 'bias_gate', ...
  rollbackTargetVersion?: string;
  lastEvaluationAt?: string;
  nextEvaluationDueAt?: string;
}

// ── LLMOps Configuration ───────────────────────────────────────────────────────
export interface LLMOpsConfig {
  assetId: string;
  temperature: number;               // 0.0 – 2.0
  topP?: number;
  topK?: number;
  maxOutputTokens: number;
  contextWindowTokens: number;
  memoryStrategy: 'NONE' | 'SESSION' | 'PERSISTENT' | 'VECTOR_STORE';
  connectors: string[];              // e.g. ['firestore', 'bigquery', 'pub_sub']
  tools: string[];                   // function-calling tool IDs
  rateLimitRpm: number;              // requests per minute
  rateLimitTpd: number;              // tokens per day
  allowedCallerIds: string[];        // Service IDs allowed to invoke
  providerFallbackChain: AIProvider[];// e.g. ['GOOGLE_GEMINI', 'OPENAI']
  piiFilteringEnabled: boolean;
  outputValidationEnabled: boolean;
  humanReviewRequired: boolean;
}

// ── AI Risk Record ─────────────────────────────────────────────────────────────
export interface AIRiskRecord {
  id: string;
  assetId: string;
  assetCode: string;
  category: AIRiskCategory;
  severity: AIRiskSeverity;
  status: AIRiskStatus;
  title: string;
  description: string;
  likelihood: number;                // 1–5
  impact: number;                    // 1–5
  riskScore: number;                 // likelihood × impact (1–25)
  mitigationPlan: string;
  mitigationOwner: string;
  mitigationDueDate: string;
  detectedAt: string;
  resolvedAt?: string;
  relatedRegulations: string[];      // e.g. ['LGPD Art.20', 'CFP Res.4/2020']
}

// ── Explainability Record ──────────────────────────────────────────────────────
export interface AIExplanationRecord {
  id: string;
  requestId: string;                 // Linked to original AI request
  assetId: string;
  decisionType: string;              // e.g. 'RISK_SCORE_AURA', 'RECOMMENDATION'
  decisionOutput: string;            // The decision/recommendation
  confidence: number;                // 0.0 – 1.0
  groundedness: number;              // 0.0 – 1.0 (for RAG pipelines)
  factorsConsidered: Array<{
    factor: string;
    weight: number;                  // relative importance 0–1
    value: string;
  }>;
  evidenceSources: Array<{
    sourceType: 'DOCUMENT' | 'DATABASE' | 'VECTOR_STORE' | 'RULE';
    reference: string;
    relevanceScore: number;
  }>;
  modelLimitations: string[];
  humanReviewRequired: boolean;
  humanReviewedById?: string;
  humanReviewedAt?: string;
  generatedAt: string;
}

// ── Evaluation Metric Result ───────────────────────────────────────────────────
export interface EvaluationMetricResult {
  metricType: EvaluationMetricType;
  value: number;
  threshold: number;
  passed: boolean;
  unit: string;
  measuredAt: string;
}

export interface ModelEvaluationReport {
  id: string;
  assetId: string;
  assetCode: string;
  evaluationPeriod: string;          // 'YYYY-MM'
  metrics: EvaluationMetricResult[];
  overallPassed: boolean;
  alertsGenerated: string[];
  evaluatedAt: string;
  evaluatedById: string;             // 'AUTOMATED' or person UUID
  notes?: string;
}

// ── Cognitive Agent Governance ─────────────────────────────────────────────────
export interface CognitiveAgentGovernanceRecord {
  agentId: string;
  agentCode: string;
  agentName: string;
  governedSince: string;
  allowedActions: string[];          // RBAC action list
  forbiddenActions: string[];
  maxAutonomyLevel: 'L0_HUMAN_ONLY' | 'L1_ASSISTED' | 'L2_SUPERVISED' | 'L3_CONDITIONAL' | 'L4_FULL_AUTO';
  hitlRequired: boolean;             // Human-in-the-loop
  dataAccessScope: string[];         // Firestore collection paths allowed
  auditEveryNRequests: number;       // Audit sampling rate
  activeIncidents: number;
  lastGovernanceReviewAt: string;
  nextGovernanceReviewDueAt: string;
}

// ── Governance Policy ──────────────────────────────────────────────────────────
export interface AIGovernancePolicy {
  id: string;
  code: string;                      // 'POL-AURA-LLM-001'
  title: string;
  description: string;
  category: 'RESPONSIBLE_AI' | 'DATA_PRIVACY' | 'SECURITY' | 'MODELOPS' | 'LLMOPS' | 'ETHICS';
  mandatoryForAssetTypes: AIAssetType[];
  rules: string[];
  effectiveDate: string;
  reviewDate: string;
  ownerId: string;
  version: string;
  isActive: boolean;
}

// ── Audit Event ────────────────────────────────────────────────────────────────
export interface AIAuditEvent {
  id: string;
  eventType:
    | 'AIModelRegistered'
    | 'AIModelApproved'
    | 'AIModelPublished'
    | 'AIModelDeprecated'
    | 'PromptApproved'
    | 'PromptUpdated'
    | 'AIRiskDetected'
    | 'AIRiskMitigated'
    | 'AIExplanationGenerated'
    | 'ModelPerformanceEvaluated'
    | 'CognitiveAgentGoverned'
    | 'AIAuditCompleted'
    | 'GovernancePolicyViolation'
    | 'LLMOpsConfigChanged';
  assetId: string;
  assetCode: string;
  actorId: string;                   // 'SYSTEM' or person UUID
  actorType: 'SYSTEM' | 'HUMAN' | 'AGENT';
  payload: Record<string, unknown>;
  ipAddress?: string;
  occurredAt: string;
  correlationId: string;
  tenantId: string;
}
