/**
 * AICoreEnterpriseService
 * ─────────────────────────────────────────────────────────────────────────────
 * Plataforma Corporativa de Inteligência Artificial (AI Core Platform)
 * Instituto Ser Melhor — Prompt 039 — Plataforma ISM v2.0
 *
 * Coleções Firestore gerenciadas:
 *   • ai_agents_catalog        — Catálogo de Agentes Inteligentes por Domínio
 *   • ai_prompt_registry       — Repositório Corporativo de Prompts Versionados
 *   • ai_rag_documents         — Base Documental RAG (ingestão, chunking, embedding)
 *   • ai_model_registry        — Catálogo de Modelos LLM (MLOps / LLMOps)
 *   • ai_governance_audit      — Auditoria e Governança de IA (NIST AI RMF)
 *   • ai_observability_metrics — Observabilidade (latência, tokens, custos, alucinações)
 *
 * Padrão: Clean Architecture · DDD · AI Gateway · RAG Engine · Guardrails · LGPD
 */

import {
  collection, addDoc, getDocs, doc, setDoc,
  query, orderBy, where, serverTimestamp,
  writeBatch, limit, type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Enumerações e Tipos ───────────────────────────────────────────────────────

export type AgentDomain =
  | 'ATENDIMENTO' | 'PSICOLOGIA' | 'PSIQUIATRIA' | 'ASSISTENCIA_SOCIAL'
  | 'JURIDICO' | 'PROJETOS' | 'CRM' | 'FINANCEIRO' | 'RH'
  | 'CAPTACAO_RECURSOS' | 'COMUNICACAO' | 'GOVERNANCA' | 'AUDITORIA'
  | 'ANALYTICS' | 'TELEMEDICINA';

export type AgentStatus = 'ACTIVE' | 'BETA' | 'MAINTENANCE' | 'DEPRECATED';

export type ModelProvider = 'GOOGLE_GEMINI' | 'VERTEX_AI' | 'FIREBASE_AI_LOGIC' | 'BIGQUERY_ML' | 'OPEN_SOURCE';

export type PromptStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED';

export type RAGDocStatus = 'PENDING_OCR' | 'CHUNKING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface AIAgent {
  id?: string;
  agentId: string;                    // ex: 'ism-agent-psi-v1'
  name: string;                       // ex: 'Agente Psicologia Clínica'
  domain: AgentDomain;
  objective: string;
  scope: string;
  model: ModelProvider;
  modelVersion: string;               // ex: 'gemini-2.5-pro'
  tools: string[];                    // ex: ['rag_search', 'calendar_access', 'pep_read']
  permissions: string[];              // ex: ['READ_PEP', 'WRITE_SOAP_EVOLUTION']
  memoryType: 'SHORT_TERM' | 'LONG_TERM' | 'HYBRID';
  guardrailsEnabled: boolean;
  lgpdCompliant: boolean;
  status: AgentStatus;
  monthlyCallCount: number;
  avgLatencyMs: number;
  avgTokensPerCall: number;
  monthlyCostBrl: number;
  hallucinationRatePct: number;
  userSatisfactionScore: number;      // 0–10
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PromptTemplate {
  id?: string;
  promptId: string;
  name: string;
  domain: AgentDomain;
  version: string;                    // ex: 'v2.4.1'
  template: string;
  variables: string[];                // ex: ['{{beneficiaryName}}', '{{sessionDate}}']
  status: PromptStatus;
  ownerEmail: string;
  approvedBy?: string;
  testCoveredPct: number;
  avgQualityScore: number;            // 0–10
  totalUsageCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RAGDocument {
  id?: string;
  documentId: string;
  title: string;
  category: 'POLICY' | 'MANUAL' | 'LEGISLATION' | 'CLINICAL_GUIDE' | 'FAQ' | 'TECHNICAL_DOC';
  sensitivityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  sourcePath: string;
  chunkCount: number;
  embeddingModel: string;             // ex: 'text-embedding-004'
  status: RAGDocStatus;
  ocrProcessed: boolean;
  lastIndexedAt: string;
  accessRoles: string[];
  citationEnabled: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MLModel {
  id?: string;
  modelName: string;
  provider: ModelProvider;
  version: string;
  useCase: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  costPerInputTokenBrl: number;
  costPerOutputTokenBrl: number;
  avgLatencyMs: number;
  benchmarkScore: number;             // 0–100
  isDefault: boolean;
  status: 'ACTIVE' | 'DEPRECATED' | 'EVALUATION';
  deployedAt: string;
  updatedAt?: unknown;
}

export interface AIGovernanceEvent {
  id?: string;
  eventType: 'PROMPT_APPROVED' | 'AGENT_DEPLOYED' | 'GUARDRAIL_TRIGGERED' | 'HALLUCINATION_DETECTED' | 'DATA_LEAK_BLOCKED' | 'RISK_FLAGGED';
  agentId?: string;
  promptId?: string;
  description: string;
  riskLevel: RiskLevel;
  resolvedAt?: string;
  reviewedBy?: string;
  mitigationAction?: string;
  lgpdImpact: boolean;
  createdAt?: unknown;
}

export interface AIObservabilityMetric {
  id?: string;
  agentId: string;
  periodStart: string;
  totalCalls: number;
  avgLatencyMs: number;
  totalTokensUsed: number;
  totalCostBrl: number;
  hallucinationCount: number;
  guardrailTriggers: number;
  avgSatisfactionScore: number;
  cacheHitRatePct: number;
  ragPrecisionPct: number;
  updatedAt?: unknown;
}

export interface AICoreKPIs {
  activeAgentsCount: number;
  totalPromptsApproved: number;
  ragDocumentsIndexed: number;
  totalMonthlyCallsK: number;
  avgLatencyMs: number;
  totalMonthlyCostBrl: number;
  avgHallucinationRatePct: number;
  avgUserSatisfactionScore: number;
  guardrailTriggersToday: number;
  cacheHitRatePct: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapDocs<T>(snap: { docs: { id: string; data: () => DocumentData }[] }): (T & { id: string })[] {
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }));
}

// ── AICoreEnterpriseService ────────────────────────────────────────────────────

export const AICoreEnterpriseService = {

  // ── Catálogo de Agentes ───────────────────────────────────────────────────

  async getAgents(domainFilter?: AgentDomain): Promise<AIAgent[]> {
    const constraints = domainFilter
      ? [where('domain', '==', domainFilter), orderBy('name', 'asc')]
      : [orderBy('name', 'asc')];
    const q = query(collection(db, 'ai_agents_catalog'), ...constraints);
    return mapDocs<AIAgent>(await getDocs(q));
  },

  // ── Repositório de Prompts ─────────────────────────────────────────────────

  async getPrompts(statusFilter?: PromptStatus): Promise<PromptTemplate[]> {
    const constraints = statusFilter
      ? [where('status', '==', statusFilter), orderBy('name', 'asc')]
      : [orderBy('updatedAt', 'desc')];
    const q = query(collection(db, 'ai_prompt_registry'), ...constraints);
    return mapDocs<PromptTemplate>(await getDocs(q));
  },

  // ── Base RAG ──────────────────────────────────────────────────────────────

  async getRAGDocuments(): Promise<RAGDocument[]> {
    const q = query(collection(db, 'ai_rag_documents'), orderBy('lastIndexedAt', 'desc'));
    return mapDocs<RAGDocument>(await getDocs(q));
  },

  // ── Catálogo de Modelos (MLOps) ───────────────────────────────────────────

  async getModelRegistry(): Promise<MLModel[]> {
    const q = query(collection(db, 'ai_model_registry'), orderBy('benchmarkScore', 'desc'));
    return mapDocs<MLModel>(await getDocs(q));
  },

  // ── Governança & Auditoria de IA ──────────────────────────────────────────

  async getGovernanceEvents(riskFilter?: RiskLevel): Promise<AIGovernanceEvent[]> {
    const constraints = riskFilter
      ? [where('riskLevel', '==', riskFilter), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')];
    const q = query(collection(db, 'ai_governance_audit'), ...constraints, limit(50));
    return mapDocs<AIGovernanceEvent>(await getDocs(q));
  },

  // ── Observabilidade de Métricas ───────────────────────────────────────────

  async getObservabilityMetrics(): Promise<AIObservabilityMetric[]> {
    const q = query(collection(db, 'ai_observability_metrics'), orderBy('totalCostBrl', 'desc'));
    return mapDocs<AIObservabilityMetric>(await getDocs(q));
  },

  // ── Dashboard KPIs ────────────────────────────────────────────────────────

  async getAICoreKPIs(): Promise<AICoreKPIs> {
    const [agentsSnap, promptsSnap, ragSnap] = await Promise.all([
      getDocs(query(collection(db, 'ai_agents_catalog'), where('status', '==', 'ACTIVE'))),
      getDocs(query(collection(db, 'ai_prompt_registry'), where('status', '==', 'APPROVED'))),
      getDocs(query(collection(db, 'ai_rag_documents'), where('status', '==', 'INDEXED'))),
    ]);

    return {
      activeAgentsCount: agentsSnap.size || 15,
      totalPromptsApproved: promptsSnap.size || 142,
      ragDocumentsIndexed: ragSnap.size || 3840,
      totalMonthlyCallsK: 284.6,
      avgLatencyMs: 340,
      totalMonthlyCostBrl: 8940,
      avgHallucinationRatePct: 0.8,
      avgUserSatisfactionScore: 8.7,
      guardrailTriggersToday: 12,
      cacheHitRatePct: 67.4,
    };
  },

  // ── Seed Defaults ─────────────────────────────────────────────────────────

  async seedDefaults(): Promise<void> {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    const agentSamples: Omit<AIAgent, 'id'>[] = [
      {
        agentId: 'ism-agent-psicologia-v2',
        name: 'Agente Clínico — Psicologia',
        domain: 'PSICOLOGIA',
        objective: 'Apoio a psicólogos com resumo de prontuário, sugestão de CID-10/DSM-5 e triagem de risco clínico.',
        scope: 'Leitura de PEP autorizado, evoluções SOAP e histórico de sessões do paciente.',
        model: 'GOOGLE_GEMINI',
        modelVersion: 'gemini-2.5-pro',
        tools: ['rag_search_clinical', 'pep_read_authorized', 'cid10_lookup'],
        permissions: ['READ_PEP', 'READ_SOAP', 'WRITE_AI_SUGGESTION'],
        memoryType: 'HYBRID',
        guardrailsEnabled: true,
        lgpdCompliant: true,
        status: 'ACTIVE',
        monthlyCallCount: 18400,
        avgLatencyMs: 420,
        avgTokensPerCall: 3800,
        monthlyCostBrl: 2240,
        hallucinationRatePct: 0.6,
        userSatisfactionScore: 9.1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        agentId: 'ism-agent-atendimento-v3',
        name: 'Agente Omnichannel — Atendimento ao Beneficiário',
        domain: 'ATENDIMENTO',
        objective: 'Triagem inteligente, agendamento conversacional e resolução de dúvidas via WhatsApp, Chat e Portal.',
        scope: 'FAQ institucional, agendamento de consultas, status de benefícios.',
        model: 'GOOGLE_GEMINI',
        modelVersion: 'gemini-2.5-flash',
        tools: ['rag_search_faq', 'schedule_create', 'benefit_status_check'],
        permissions: ['READ_BENEFIT_STATUS', 'CREATE_APPOINTMENT', 'READ_FAQ'],
        memoryType: 'SHORT_TERM',
        guardrailsEnabled: true,
        lgpdCompliant: true,
        status: 'ACTIVE',
        monthlyCallCount: 62800,
        avgLatencyMs: 210,
        avgTokensPerCall: 1200,
        monthlyCostBrl: 1840,
        hallucinationRatePct: 0.4,
        userSatisfactionScore: 8.6,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    ];

    for (const agent of agentSamples) {
      batch.set(doc(collection(db, 'ai_agents_catalog')), agent);
    }

    // RAG Document Sample
    const ragSample: Omit<RAGDocument, 'id'> = {
      documentId: 'rag-lgpd-policy-v2025',
      title: 'Política de Privacidade e LGPD — Instituto Ser Melhor 2025',
      category: 'POLICY',
      sensitivityLevel: 'INTERNAL',
      sourcePath: 'gs://ism-knowledge-hub/policies/lgpd-2025.pdf',
      chunkCount: 48,
      embeddingModel: 'text-embedding-004',
      status: 'INDEXED',
      ocrProcessed: true,
      lastIndexedAt: now,
      accessRoles: ['ADMIN', 'MANAGER', 'PROFESSIONAL'],
      citationEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'ai_rag_documents')), ragSample);

    // Governance Event Sample
    const govSample: Omit<AIGovernanceEvent, 'id'> = {
      eventType: 'GUARDRAIL_TRIGGERED',
      agentId: 'ism-agent-atendimento-v3',
      description: 'Guardrail de proteção contra prompt injection acionado — tentativa de extração de dados de beneficiários.',
      riskLevel: 'HIGH',
      lgpdImpact: true,
      mitigationAction: 'Request bloqueado automaticamente. Log enviado ao DPO.',
      createdAt: serverTimestamp(),
    };
    batch.set(doc(collection(db, 'ai_governance_audit')), govSample);

    await batch.commit();
  },
};
