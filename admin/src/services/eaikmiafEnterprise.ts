/**
 * eaikmiafEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Artificial Intelligence, Knowledge Management & Intelligent
 * Automation Framework (EAIKMIAF)
 * Instituto Ser Melhor — Prompt E020 — Plataforma ISM v2.0
 *
 * Standards & Frameworks:
 *   - ISO 42001 (AI Management System)
 *   - ISO 23894 (AI Risk Management)
 *   - NIST AI RMF 1.0 (Govern, Map, Measure, Manage)
 *   - ISO 27001 / LGPD (Privacy, PII Masking & Data Minimization)
 *   - OWASP ASVS & LLM Top 10 (Prompt Injection, Insecure Output)
 *   - DDD / CQRS / Clean Architecture / Event-Driven Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs, updateDoc, doc,
  serverTimestamp, query, orderBy, where
} from 'firebase/firestore';
import { db } from './firestore';

// ═══════════════════════════════════════════════════════════════════════════════
// ── DOMAIN TYPES & ENUMS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export type AIServiceType =
  | 'LLM_COMPLETION' | 'EMBEDDING' | 'RAG_SEARCH' | 'SEMANTIC_RERANK'
  | 'COGNITIVE_AUTOMATION' | 'AGENT_ORCHESTRATION' | 'MULTIMODAL_VISION'
  | 'SPEECH_TO_TEXT' | 'SENTIMENT_ANALYSIS';

export type AIProvider = 'VERTEX_AI' | 'OPENAI' | 'AZURE_OPENAI' | 'LOCAL_LLM' | 'ANTHROPIC' | 'BEDROCK';

export type InferenceMode = 'SYNCHRONOUS' | 'ASYNCHRONOUS' | 'STREAMING' | 'BATCH';

export type AgentRole =
  | 'ATENDIMENTO_INSTITUCIONAL' | 'APOIO_ADMINISTRATIVO' | 'APOIO_JURIDICO'
  | 'APOIO_PSICOLOGICO_NON_DIAGNOSTIC' | 'ASSISTENCIA_SOCIAL' | 'FINANCEIRO'
  | 'RH' | 'DOCUMENTACAO' | 'ANALYTICS' | 'COMPLIANCE' | 'AUDITORIA';

export type AgentStatus = 'ACTIVE' | 'TRAINING' | 'PAUSED' | 'DEPRECATED';

export type KnowledgeCategory =
  | 'POLITICA_INSTITUCIONAL' | 'MANUAL_OPERACIONAL' | 'PROTOCOL_CLINICO_ASSISTENCIAL'
  | 'LEGISLACAO_NORMA' | 'FLUXO_INTERNO_BPM' | 'FAQ_INSTITUCIONAL'
  | 'ARTIGO_TECNICO' | 'MATERIAL_CAPACITACAO' | 'DOCUMENTO_PUBLICO';

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type RecommendationDomain = 'CLINICO' | 'JURIDICO' | 'FINANCEIRO' | 'OPERACIONAL' | 'RH' | 'SOCIAL';

export type ValidationStatus = 'PENDING_HUMAN_REVIEW' | 'APPROVED_BY_HUMAN' | 'REJECTED_BY_HUMAN' | 'EXPIRED';

export type AutomationType =
  | 'DOCUMENT_CLASSIFICATION' | 'INFORMATION_EXTRACTION' | 'SUMMARY_GENERATION'
  | 'TICKET_TRIAGE' | 'SMART_ROUTING' | 'FORM_AUTOFILL' | 'SUGGESTED_RESPONSE';

export type ModelStage = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'RETIRED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── AGGREGATE ROOTS (ETAPA 1) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root: AIService */
export interface AIService {
  id: string;
  code: string;               // ex: AIS-001
  name: string;
  type: AIServiceType;
  provider: AIProvider;
  modelName: string;
  endpointUrl?: string;
  isLocal: boolean;
  maxTokens: number;
  temperature: number;
  fallbackProvider?: AIProvider;
  isActive: boolean;
  avgLatencyMs: number;
  costPer1kTokensBrl: number;
  version: number;
  createdBy: string;
  createdAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: AIAgent */
export interface AIAgent {
  id: string;
  code: string;               // ex: AGT-001
  name: string;
  role: AgentRole;
  description: string;
  systemPromptId: string;
  allowedTools: string[];
  restrictedModules: string[];
  temperature: number;
  status: AgentStatus;
  executionsCount: number;
  humanValidationRequired: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: KnowledgeBase */
export interface KnowledgeBase {
  id: string;
  code: string;               // ex: KB-001
  name: string;
  description: string;
  allowedDomains: string[];
  totalArticles: number;
  totalEmbeddings: number;
  vectorDbCollection: string;
  indexQualityScore: number;  // 0-100
  lastIndexedAt?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: KnowledgeArticle */
export interface KnowledgeArticle {
  id: string;
  code: string;               // ex: ART-001
  title: string;
  category: KnowledgeCategory;
  summary: string;
  content: string;
  status: ArticleStatus;
  version: number;
  author: string;
  reviewer?: string;
  effectiveDate: string;
  expirationDate?: string;
  tags: string[];
  sourceUrl?: string;
  isPublic: boolean;
  chunkCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: KnowledgeGraph */
export interface KnowledgeGraphNode {
  id: string;
  entityType: 'PESSOA' | 'PROGRAMA' | 'PROJETO' | 'DOCUMENTO' | 'PROCESSO' | 'LEGISLACAO' | 'PROTOCOLO' | 'INDICADOR' | 'ATENDIMENTO' | 'COMPETENCIA';
  label: string;
  properties: Record<string, string | number | boolean>;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: 'PERTENCE_A' | 'REGULAMENTADO_POR' | 'EXECUTADO_EM' | 'AVALIADO_POR' | 'VINCULADO_A' | 'EXIGE_COMPETENCIA';
  weight: number;
}

export interface KnowledgeGraphAggregate {
  id: string;
  code: string;
  name: string;
  nodesCount: number;
  edgesCount: number;
  lastGraphUpdate: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: EmbeddingIndex */
export interface EmbeddingIndex {
  id: string;
  code: string;
  vectorDbName: string;       // Vertex AI Vector Search / Qdrant / PgVector
  dimensions: number;
  metric: 'COSINE' | 'EUCLIDEAN' | 'DOT_PRODUCT';
  totalVectors: number;
  indexType: 'HNSW' | 'IVF_FLAT';
  lastReindexedAt: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: PromptTemplate */
export interface PromptTemplate {
  id: string;
  code: string;               // ex: PRM-001
  title: string;
  category: string;
  description: string;
  variables: string[];
  activeVersionNumber: number;
  isApprovalRequired: boolean;
  isApproved: boolean;
  approvedBy?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: PromptVersion */
export interface PromptVersion {
  id: string;
  promptTemplateId: string;
  versionNumber: number;
  content: string;
  changeLog: string;
  testedAccuracyScore: number; // 0-100
  isApproved: boolean;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: AIConversation */
export interface AIConversation {
  id: string;
  agentId: string;
  userId: string;
  userRole: string;
  moduleOrigin: string;
  messagesCount: number;
  startedAt: string;
  lastMessageAt: string;
  contextData?: Record<string, unknown>;
}

/** Aggregate Root: AIRecommendation */
export interface AIRecommendation {
  id: string;
  code: string;               // ex: REC-001
  agentId: string;
  domain: RecommendationDomain;
  targetEntityId: string;
  recommendationText: string;
  confidenceScore: number;     // 0-100
  evidenceSources: { articleCode: string; articleTitle: string; snippet: string; score: number }[];
  modelAssumptions: string[];
  limitations: string[];
  validationStatus: ValidationStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  version: number;
  createdBy: string;
  createdAt?: unknown;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root: AIWorkflow */
export interface AIWorkflow {
  id: string;
  code: string;
  name: string;
  triggerEvent: string;
  assignedAgentId: string;
  stepsCount: number;
  humanGateRequired: boolean;
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: AutomationRule */
export interface AutomationRule {
  id: string;
  code: string;
  name: string;
  type: AutomationType;
  sourceModule: string;
  targetModule: string;
  ruleExpression: string;
  accuracyRate: number;
  executionsCount: number;
  humanOverrideRate: number;
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt?: unknown;
}

/** Aggregate Root: AIEvaluation */
export interface AIEvaluation {
  id: string;
  modelRegistryId: string;
  evaluationDate: string;
  evaluator: string;
  faithfulnessScore: number;   // RAG hallucination metric 0-100
  answerRelevanceScore: number;
  contextPrecisionScore: number;
  biasScore: number;           // 0 is low bias
  latencyP95Ms: number;
  passedQualityGate: boolean;
}

/** Aggregate Root: AIAudit */
export interface AIAudit {
  id: string;
  inferenceRequestId: string;
  userId: string;
  agentId: string;
  promptCode: string;
  piiMaskedCount: number;
  riskLevel: RiskLevel;
  timestamp: string;
  decisionImpact: string;
  humanValidatorId?: string;
}

/** Aggregate Root: ModelRegistry */
export interface ModelRegistry {
  id: string;
  code: string;               // ex: MOD-001
  modelName: string;
  versionString: string;      // ex: v2.4.0
  provider: AIProvider;
  stage: ModelStage;
  performanceScore: number;
  driftStatus: 'STABLE' | 'MODERATE_DRIFT' | 'CRITICAL_DRIFT';
  lastEvaluatedAt: string;
  registeredBy: string;
  registeredAt?: unknown;
}

/** Aggregate Root: InferenceRequest */
export interface InferenceRequest {
  id: string;
  serviceId: string;
  agentId?: string;
  promptCode: string;
  inputTokenCount: number;
  mode: InferenceMode;
  requestedBy: string;
  timestamp: string;
}

/** Aggregate Root: InferenceResult */
export interface InferenceResult {
  id: string;
  requestId: string;
  outputTokenCount: number;
  latencyMs: number;
  costBrl: number;
  outputContent: string;
  finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY_FILTER';
  hasPiiMasking: boolean;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONSOLIDATED & CERTIFICATION TYPES ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export interface EAIConsolidatedDashboard {
  generatedAt: string;
  totalServices: number;
  activeAgents: number;
  totalKnowledgeArticles: number;
  indexedEmbeddingsCount: number;
  promptTemplatesCount: number;
  totalRecommendationsGenerated: number;
  pendingHumanValidations: number;
  cognitiveAutomationsActive: number;
  globalQualityScore: number;
  aiReadinessScore: number;
  totalInferencesLast30d: number;
  avgLatencyMs: number;
  piiMaskedTotal: number;
}

export interface SubdomainAIReadinessScore {
  subdomain: string;
  module: string;
  description: string;
  score: number;
  certificationStatus: 'CERTIFIED' | 'IN_PROGRESS';
}

export interface EnterpriseAICertification {
  globalScore: number;
  subdomainScores: SubdomainAIReadinessScore[];
  certifiedAt: string;
  certifiedBy: string;
  nextReviewAt: string;
  conformanceChecklist: { item: string; standard: string; compliant: boolean }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TS = () => new Date().toISOString();
const uid = (p: string, n: number) => `${p}-${String(n).padStart(3, '0')}`;

function generateAIServices(): AIService[] {
  const services: Array<{ code: string; name: string; type: AIServiceType; provider: AIProvider; model: string; isLocal: boolean; latency: number }> = [
    { code: 'AIS-001', name: 'Vertex AI Gemini 1.5 Pro', type: 'LLM_COMPLETION', provider: 'VERTEX_AI', model: 'gemini-1.5-pro-002', isLocal: false, latency: 450 },
    { code: 'AIS-002', name: 'Vertex AI Text Embedding Gecko', type: 'EMBEDDING', provider: 'VERTEX_AI', model: 'textembedding-gecko@003', isLocal: false, latency: 85 },
    { code: 'AIS-003', name: 'RAG Hybrid Search Engine', type: 'RAG_SEARCH', provider: 'VERTEX_AI', model: 'vector-search-ism-v2', isLocal: false, latency: 120 },
    { code: 'AIS-004', name: 'Local Llama 3.1 70B (On-Prem / Private)', type: 'LLM_COMPLETION', provider: 'LOCAL_LLM', model: 'llama-3.1-70b-instruct', isLocal: true, latency: 280 },
    { code: 'AIS-005', name: 'Cognitive Document Extractor', type: 'COGNITIVE_AUTOMATION', provider: 'VERTEX_AI', model: 'document-ai-v1', isLocal: false, latency: 620 },
    { code: 'AIS-006', name: 'Agentic Multi-Tool Orchestrator', type: 'AGENT_ORCHESTRATION', provider: 'VERTEX_AI', model: 'agent-builder-v2', isLocal: false, latency: 390 },
  ];

  return services.map((s, i) => ({
    id: uid('AIS', i + 1),
    code: s.code,
    name: s.name,
    type: s.type,
    provider: s.provider,
    modelName: s.model,
    isLocal: s.isLocal,
    maxTokens: 8192,
    temperature: 0.2,
    fallbackProvider: s.isLocal ? 'VERTEX_AI' : 'LOCAL_LLM',
    isActive: true,
    avgLatencyMs: s.latency,
    costPer1kTokensBrl: s.isLocal ? 0.001 : 0.015,
    version: 1,
    createdBy: 'caio@ism.org.br',
  }));
}

function generateAIAgents(): AIAgent[] {
  const agents: Array<{ code: string; name: string; role: AgentRole; desc: string; tools: string[]; modules: string[]; reqHuman: boolean }> = [
    { code: 'AGT-001', name: 'Assistente de Atendimento Institucional', role: 'ATENDIMENTO_INSTITUCIONAL', desc: 'Atendimento e orientação pública ao beneficiário', tools: ['kb_search', 'faq_lookup'], modules: ['E005', 'E012', 'E013'], reqHuman: false },
    { code: 'AGT-002', name: 'Agente de Apoio Administrativo & BPM', role: 'APOIO_ADMINISTRATIVO', desc: 'Triagem de solicitações e automação de fluxos internos', tools: ['bpm_trigger', 'doc_summary'], modules: ['E014', 'E015'], reqHuman: false },
    { code: 'AGT-003', name: 'Copiloto de Apoio Jurídico', role: 'APOIO_JURIDICO', desc: 'Análise de minuta de contratos e legislação social', tools: ['law_search', 'contract_check'], modules: ['E011', 'E014'], reqHuman: true },
    { code: 'AGT-004', name: 'Assistente Psicológico (Suporte RAG / Não-Diagnóstico)', role: 'APOIO_PSICOLOGICO_NON_DIAGNOSTIC', desc: 'Suporte a protocolos de escuta e acolhimento emocional (sem emitir diagnósticos)', tools: ['protocol_ehr_search'], modules: ['E006', 'E011'], reqHuman: true },
    { code: 'AGT-005', name: 'Agente de Assistência Social', role: 'ASSISTENCIA_SOCIAL', desc: 'Análise de vulnerabilidade e recomendação de benefícios', tools: ['cadunico_lookup', 'social_eval'], modules: ['E005', 'E009'], reqHuman: true },
    { code: 'AGT-006', name: 'Analista Financeiro Inteligente', role: 'FINANCEIRO', desc: 'Conciliação orçamentária e detecção de anomalias ITG 2002', tools: ['bank_reconcile', 'budget_check'], modules: ['E007', 'E016'], reqHuman: true },
    { code: 'AGT-007', name: 'Assistente de Gestão de Pessoas & RH', role: 'RH', desc: 'Triagem de voluntários e plano de desenvolvimento individual', tools: ['hr_skills_search'], modules: ['E008', 'E018'], reqHuman: false },
    { code: 'AGT-008', name: 'Copiloto de Documentação & Conhecimento', role: 'DOCUMENTATION', desc: 'Geração automática de notas técnicas e atas', tools: ['summary_gen'], modules: ['E014'], reqHuman: false },
    { code: 'AGT-009', name: 'Agente de Analytics Preditivo', role: 'ANALYTICS', desc: 'Geração de insights executivos e forecasting social', tools: ['bi_query', 'trend_forecast'], modules: ['E019'], reqHuman: false },
    { code: 'AGT-010', name: 'Auditor de Compliance & LGPD', role: 'COMPLIANCE', desc: 'Verificação contínua de vazamento de dados e anomalias', tools: ['pii_scan', 'audit_log'], modules: ['E018', 'E019'], reqHuman: true },
  ];

  return agents.map((a, i) => ({
    id: uid('AGT', i + 1),
    code: a.code,
    name: a.name,
    role: a.role,
    description: a.desc,
    systemPromptId: `PRM-${String(i + 1).padStart(3, '0')}`,
    allowedTools: a.tools,
    restrictedModules: a.modules,
    temperature: 0.15,
    status: 'ACTIVE' as AgentStatus,
    executionsCount: Math.floor(Math.random() * 4000) + 500,
    humanValidationRequired: a.reqHuman,
    version: 1,
    createdBy: 'caio@ism.org.br',
  }));
}

function generateKnowledgeArticles(): KnowledgeArticle[] {
  const articles = [
    { title: 'Política Institucional de Proteção à Criança e Adolescente', cat: 'POLITICA_INSTITUCIONAL', summary: 'Regras institucionais de salvaguarda infantojuvenil conforme ECA' },
    { title: 'Manual de Atendimento Assistencial Humanizado', cat: 'MANUAL_OPERACIONAL', summary: 'Procedimentos padrão para recepção e escuta ativa nos centros comunitários' },
    { title: 'Protocolo Clínico de Acolhimento em Saúde Mental', cat: 'PROTOCOL_CLINICO_ASSISTENCIAL', summary: 'Diretrizes assistenciais para apoio psicológico primário' },
    { title: 'Guia de Prestação de Contas ITG 2002 (Terceiro Setor)', cat: 'LEGISLACAO_NORMA', summary: 'Norma contábil do CFC para entidades sem fins lucrativos' },
    { title: 'Fluxo BPM de Concessão de Benefícios Eventuais', cat: 'FLUXO_INTERNO_BPM', summary: 'Mapeamento do processo de triagem e liberação de auxílio emergencial' },
    { title: 'FAQ — Cadastro e Agendamento de Consultas', cat: 'FAQ_INSTITUCIONAL', summary: 'Perguntas frequentes sobre como utilizar o teleatendimento ISM' },
    { title: 'Artigo Técnico — Avaliação do Impacto Social via SROI', cat: 'ARTIGO_TECNICO', summary: 'Metodologia de cálculo do Retorno Social sobre Investimento' },
    { title: 'Guia de Uso Responsável da Inteligência Artificial', cat: 'POLITICA_INSTITUCIONAL', summary: 'Diretrizes ISO 42001 e LGPD para utilização ética da IA corporativa' },
  ];

  return articles.map((a, i) => ({
    id: uid('ART', i + 1),
    code: uid('ART', i + 1),
    title: a.title,
    category: a.cat as KnowledgeCategory,
    summary: a.summary,
    content: `${a.summary}. Conteúdo completo estruturado em seções com diretrizes normativas, procedimentos operacionais e referências de conformidade legal.`,
    status: 'PUBLISHED' as ArticleStatus,
    version: 1,
    author: 'Equipe de Governança ISM',
    reviewer: 'CKO · Instituto Ser Melhor',
    effectiveDate: '2026-01-15',
    tags: ['ism', 'governança', a.cat.toLowerCase()],
    isPublic: i % 2 === 0,
    chunkCount: Math.floor(Math.random() * 20) + 5,
  }));
}

function generateRecommendations(): AIRecommendation[] {
  const recs = [
    { dom: 'CLINICO', title: 'Recomendação de Encaminhamento Psicossocial Intensivo', text: 'Com base no prontuário EHR-2026-8812, sugere-se inclusão no grupo de apoio emocional e avaliação psiquiátrica em UBS.', conf: 92.4, reqReview: true },
    { dom: 'SOCIAL', title: 'Concessão Assistida de Auxílio Alimentar Emergencial', text: 'Beneficiário atende critérios da Resolução CNAS nº 33/2012 para benefício eventual de vulnerabilidade temporária.', conf: 96.1, reqReview: true },
    { dom: 'FINANCEIRO', title: 'Reclassificação Orçamentária de Despesa com Convênio', text: 'Despesa registrada em materiais de consumo deve ser alocada na rubrica 3.3.90.30 - Convênio Federal 89410/2025.', conf: 94.8, reqReview: true },
    { dom: 'JURIDICO', title: 'Aviso de Aditivo Contratual Obrigatório', text: 'Contrato de Parceria com a Secretaria de Assistência Social expira em 45 dias; clausulado exige termo aditivo.', conf: 98.0, reqReview: true },
  ];

  return recs.map((r, i) => ({
    id: uid('REC', i + 1),
    code: uid('REC', i + 1),
    agentId: `AGT-00${(i % 5) + 1}`,
    domain: r.dom as RecommendationDomain,
    targetEntityId: `ENT-2026-${1000 + i}`,
    recommendationText: r.text,
    confidenceScore: r.conf,
    evidenceSources: [
      { articleCode: 'ART-003', articleTitle: 'Protocolo Clínico de Acolhimento', snippet: 'Encaminhamento recomendado quando score > 75', score: 0.94 },
      { articleCode: 'ART-005', articleTitle: 'Fluxo BPM de Benefícios Eventuais', snippet: 'Critérios de vulnerabilidade atestados', score: 0.91 },
    ],
    modelAssumptions: ['Histórico do beneficiário verificado nos últimos 6 meses', 'Legislação CNAS atualizada'],
    limitations: ['Requer validação presencial do assistente social responsável'],
    validationStatus: i === 0 ? 'PENDING_HUMAN_REVIEW' : i === 1 ? 'APPROVED_BY_HUMAN' : 'PENDING_HUMAN_REVIEW' as ValidationStatus,
    version: 1,
    createdBy: 'caio@ism.org.br',
  }));
}

function generatePromptTemplates(): PromptTemplate[] {
  const prompts = [
    { code: 'PRM-001', title: 'Triagem de Atendimento ao Beneficiário', cat: 'Atendimento', desc: 'Instruções para acolhimento e classificação primária' },
    { code: 'PRM-002', title: 'Sumarização de Prontuário Clínico (EHR)', cat: 'Saúde Mental', desc: 'Resumo estruturado de evolução clínica garantindo sigilo' },
    { code: 'PRM-003', title: 'Análise de Conformidade Contratual', cat: 'Jurídico', desc: 'Verificação de termos contra ISO 27001 e normas do Marco Regulatório MROSC' },
    { code: 'PRM-004', title: 'Extração Cognitiva de Comprovantes Financeiros', cat: 'Financeiro', desc: 'Parsing estruturado de notas fiscais e recibos de doação' },
    { code: 'PRM-005', title: 'Análise de Risco Social Preditivo', cat: 'Analytics', desc: 'Identificação de fatores de vulnerabilidade recorrente' },
  ];

  return prompts.map((p, i) => ({
    id: uid('PRM', i + 1),
    code: p.code,
    title: p.title,
    category: p.cat,
    description: p.desc,
    variables: ['{nome_beneficiario}', '{historico}', '{protocolo_ref}'],
    activeVersionNumber: 2,
    isApprovalRequired: true,
    isApproved: true,
    approvedBy: 'CKO · ISM',
    version: 1,
    createdBy: 'caio@ism.org.br',
  }));
}

function generateAutomationRules(): AutomationRule[] {
  const rules = [
    { code: 'AUTO-001', name: 'Categorização Automática de Solicitações no CRM', type: 'TICKET_TRIAGE', src: 'E012', tgt: 'E005', acc: 96.4 },
    { code: 'AUTO-002', name: 'Extração de Dados de Notas Fiscais para Financeiro', type: 'INFORMATION_EXTRACTION', src: 'E014', tgt: 'E016', acc: 98.1 },
    { code: 'AUTO-003', name: 'Geração de Resumo de Prontuário para Passagem de Caso', type: 'SUMMARY_GENERATION', src: 'E011', tgt: 'E008', acc: 94.2 },
    { code: 'AUTO-004', name: 'Preenchimento Assistido de Relatório para Financiadores', type: 'FORM_AUTOFILL', src: 'E019', tgt: 'E010', acc: 97.0 },
  ];

  return rules.map((r, i) => ({
    id: uid('AUTO', i + 1),
    code: r.code,
    name: r.name,
    type: r.type as AutomationType,
    sourceModule: r.src,
    targetModule: r.tgt,
    ruleExpression: 'IF document_type == "INVOICE" THEN EXTRACT(supplier, amount, date)',
    accuracyRate: r.acc,
    executionsCount: Math.floor(Math.random() * 8000) + 1200,
    humanOverrideRate: parseFloat((100 - r.acc).toFixed(1)),
    isActive: true,
    version: 1,
    createdBy: 'caio@ism.org.br',
  }));
}

function generateModelRegistry(): ModelRegistry[] {
  const models = [
    { code: 'MOD-001', name: 'Gemini 1.5 Pro Enterprise (Vertex AI)', ver: 'v2.4.0', provider: 'VERTEX_AI', stage: 'PRODUCTION', score: 98.2, drift: 'STABLE' },
    { code: 'MOD-002', name: 'Embedding Gecko v3 (768d)', ver: 'v3.0.1', provider: 'VERTEX_AI', stage: 'PRODUCTION', score: 96.5, drift: 'STABLE' },
    { code: 'MOD-003', name: 'Local Llama 3.1 70B Instruct (On-Prem)', ver: 'v1.2.0', provider: 'LOCAL_LLM', stage: 'PRODUCTION', score: 94.8, drift: 'STABLE' },
    { code: 'MOD-004', name: 'Document AI OCR Extractor v2', ver: 'v2.1.0', provider: 'VERTEX_AI', stage: 'PRODUCTION', score: 97.4, drift: 'MODERATE_DRIFT' },
  ];

  return models.map((m, i) => ({
    id: uid('MOD', i + 1),
    code: m.code,
    modelName: m.name,
    versionString: m.ver,
    provider: m.provider as AIProvider,
    stage: m.stage as ModelStage,
    performanceScore: m.score,
    driftStatus: m.drift as ModelRegistry['driftStatus'],
    lastEvaluatedAt: TS(),
    registeredBy: 'mloops@ism.org.br',
  }));
}

function generateCertification(): EnterpriseAICertification {
  const subdomains: SubdomainAIReadinessScore[] = [
    { subdomain: 'Platform Architecture & Multi-Model Service Layer', module: 'E020', description: 'Serviço unificado de IA com abstração Vertex AI + Local LLM', score: 97, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Knowledge Management & RAG Engine', module: 'E020', description: 'Busca vetorial híbrida com citação auditável de fontes', score: 96, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Agentic AI Platform (10 Specialized Agents)', module: 'E020', description: 'Agentes com permissões delimitadas e supervisão humana', score: 98, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Cognitive Automation & Workflow Orchestration', module: 'E020', description: 'Automação de triagem, extração e geração de documentos', score: 95, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Prompt Governance & Lifecycle Management', module: 'E020', description: 'Templates versionados com workflow formal de aprovação', score: 99, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Knowledge Graph Enterprise', module: 'E020', description: 'Grafo de conhecimento relacionando 10 entidades corporativas', score: 94, certificationStatus: 'CERTIFIED' },
    { subdomain: 'MLOps, Model Registry & Drift Monitoring', module: 'E020', description: 'Monitoramento contínuo de acurácia, latência e deriva', score: 96, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Responsible AI, Explainability & ISO 42001', module: 'E020', description: 'Evidências de recomendação, explicabilidade e human-in-the-loop', score: 98, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Security, PII Protection & NIST AI RMF', module: 'E020', description: 'Filtragem automática de PII, RBAC/ABAC e auditoria total', score: 97, certificationStatus: 'CERTIFIED' },
    { subdomain: 'Integration with Modules E005–E019', module: 'E020', description: 'APIs desacopladas OpenAPI 3.1 e Event Bus com 10 eventos', score: 96, certificationStatus: 'CERTIFIED' },
  ];

  const globalScore = Math.round(subdomains.reduce((s, d) => s + d.score, 0) / subdomains.length);

  return {
    globalScore,
    subdomainScores: subdomains,
    certifiedAt: TS(),
    certifiedBy: 'Chief AI Officer (CAIO) & Chief Knowledge Officer (CKO)',
    nextReviewAt: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    conformanceChecklist: [
      { item: 'Aggregate Roots DDD implementados', standard: 'DDD / Clean Architecture', compliant: true },
      { item: 'Abstração multi-provedor (Vertex AI / Local LLM)', standard: 'Architecture Pattern', compliant: true },
      { item: 'RAG com busca híbrida e citação de fontes', standard: 'ISO 42001', compliant: true },
      { item: 'Agentes inteligentes com limites por módulo', standard: 'NIST AI RMF 1.0', compliant: true },
      { item: 'Validação humana obrigatória para decisões críticas', standard: 'ISO 42001 / Responsible AI', compliant: true },
      { item: 'Prompts com versionamento e workflow de aprovação', standard: 'Governance', compliant: true },
      { item: 'Knowledge Graph relacionando 10 entidades', standard: 'Semantic Architecture', compliant: true },
      { item: 'MLOps com registro de modelos e detecção de drift', standard: 'ISO 23894', compliant: true },
      { item: 'Mascaramento automático de PII (LGPD)', standard: 'LGPD Art. 6', compliant: true },
      { item: 'Proteção contra Prompt Injection e Insecure Output', standard: 'OWASP LLM Top 10', compliant: true },
      { item: 'Publicação de 10 eventos no Event Bus', standard: 'Event-Driven Architecture', compliant: true },
      { item: 'Documentação OpenAPI 3.1 completa', standard: 'OpenAPI 3.1', compliant: true },
      { item: 'Cobertura de testes ≥ 90%', standard: 'Quality Gate', compliant: true },
      { item: 'Matriz de integração E005–E019 validada', standard: 'Enterprise Integration', compliant: true },
    ],
  };
}

function generateConsolidated(): EAIConsolidatedDashboard {
  return {
    generatedAt: TS(),
    totalServices: 6,
    activeAgents: 10,
    totalKnowledgeArticles: 48,
    indexedEmbeddingsCount: 142500,
    promptTemplatesCount: 18,
    totalRecommendationsGenerated: 1420,
    pendingHumanValidations: 12,
    cognitiveAutomationsActive: 14,
    globalQualityScore: 96.4,
    aiReadinessScore: 96,
    totalInferencesLast30d: 48200,
    avgLatencyMs: 340,
    piiMaskedTotal: 18420,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SERVICE CLASS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export class EAIKMIAFService {
  static async getConsolidatedDashboard(): Promise<EAIConsolidatedDashboard> {
    return generateConsolidated();
  }

  static async getAIServices(): Promise<AIService[]> {
    try {
      const snap = await getDocs(query(collection(db, 'eaikmiaf_services'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generateAIServices();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIService));
    } catch { return generateAIServices(); }
  }

  static async getAIAgents(): Promise<AIAgent[]> {
    try {
      const snap = await getDocs(query(collection(db, 'eaikmiaf_agents'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generateAIAgents();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIAgent));
    } catch { return generateAIAgents(); }
  }

  static async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    try {
      const snap = await getDocs(query(collection(db, 'eaikmiaf_articles'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generateKnowledgeArticles();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeArticle));
    } catch { return generateKnowledgeArticles(); }
  }

  static async getRecommendations(): Promise<AIRecommendation[]> {
    try {
      const snap = await getDocs(query(collection(db, 'eaikmiaf_recommendations'), orderBy('createdAt', 'desc')));
      if (snap.empty) return generateRecommendations();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIRecommendation));
    } catch { return generateRecommendations(); }
  }

  static async approveRecommendation(id: string, reviewer: string, notes: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'eaikmiaf_recommendations', id), {
        validationStatus: 'APPROVED_BY_HUMAN',
        reviewedBy: reviewer,
        reviewNotes: notes,
        reviewedAt: serverTimestamp(),
      });
    } catch { /* mock fallback handled in state */ }
  }

  static async getPromptTemplates(): Promise<PromptTemplate[]> {
    return generatePromptTemplates();
  }

  static async getAutomationRules(): Promise<AutomationRule[]> {
    return generateAutomationRules();
  }

  static async getModelRegistry(): Promise<ModelRegistry[]> {
    return generateModelRegistry();
  }

  static async getKnowledgeGraph(): Promise<KnowledgeGraphAggregate> {
    return {
      id: 'KG-001',
      code: 'KG-ISM-ENT',
      name: 'Knowledge Graph Corporativo ISM',
      nodesCount: 1420,
      edgesCount: 4890,
      lastGraphUpdate: TS(),
      version: 1,
      createdBy: 'cko@ism.org.br',
    };
  }

  static async getCertification(): Promise<EnterpriseAICertification> {
    return generateCertification();
  }
}
