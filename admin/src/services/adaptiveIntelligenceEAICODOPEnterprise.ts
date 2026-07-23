/**
 * adaptiveIntelligenceEAICODOPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Adaptive Intelligence, Context-Aware Orchestration &
 * Dynamic Optimization Platform
 * Instituto Ser Melhor — Prompt 092 — Plataforma ISM v2.0
 *
 * Padrões: Adaptive Systems, Context-Aware Computing, Autonomic Computing,
 *          Reinforcement Learning Supervisionado, Decision Intelligence,
 *          Digital Twins, Vertex AI, TOGAF, ISO 42001, ISO 56002, DAMA-DMBOK2
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ContextDomain =
  | 'INSTITUCIONAL' | 'OPERACIONAL' | 'TERRITORIAL' | 'JURIDICO'
  | 'FINANCEIRO' | 'TECNOLOGICO' | 'SOCIAL' | 'CLINICO'
  | 'EDUCACIONAL' | 'ASSISTENCIAL' | 'REGULATORIO';

export type AdaptationTrigger = 'AUTOMATICA' | 'CONDICIONAL' | 'REQUER_APROVACAO';
export type AdaptationStatus = 'ATIVA' | 'PENDENTE_APROVACAO' | 'REVERTIDA' | 'ARQUIVADA';
export type PolicyLevel = 'PERMITIDA' | 'CONDICIONAL' | 'PROIBIDA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ContextGraphNode {
  id: string;
  nodeCode: string;            // ex: "CTX-001"
  contextDomain: ContextDomain;
  label: string;               // ex: "Contexto Clínico (FHIR R4 + Telemedicina)"
  confidenceScore: number;     // 0-100
  validUntil: string;          // ISO date
  priority: number;            // 1-5
  relatedEntities: number;     // ex: 24 (nós relacionados no grafo)
  createdAt?: unknown;
}

export interface AdaptiveRecommendation {
  id: string;
  recommendationCode: string;  // ex: "ADAPT-001"
  title: string;
  trigger: AdaptationTrigger;
  status: AdaptationStatus;
  contextDomain: ContextDomain;
  expectedImpact: string;
  aiConfidence: number;        // 0-100
  estimatedGain: string;       // ex: "Redução de 18% no tempo de triagem"
  riskLevel: 'BAIXO' | 'MODERADO' | 'ALTO';
  reversible: boolean;
  approvalRequired: boolean;
  appliedAt?: string;
  createdAt?: unknown;
}

export interface AdaptationPolicy {
  id: string;
  policyCode: string;          // ex: "POL-ADAPT-001"
  title: string;
  policyLevel: PolicyLevel;
  affectedScope: string;       // ex: "Dashboard UX, Notificações, Filas"
  triggerCondition: string;
  approvalLevel: string;       // ex: "COO / CTO"
  isReversible: boolean;
  auditRequired: boolean;
  createdAt?: unknown;
}

export interface EAICODOPDashboardKPIs {
  adaptiveIntelligenceScore: number;   // ex: 99.0
  contextAwarenessIndex: number;       // ex: 98.9
  dynamicOptimizationRate: number;     // ex: 97.6%
  uxPersonalizationScore: number;      // ex: 98.2%
  adaptationsAppliedCount: number;     // ex: 384
  pendingApprovalCount: number;        // ex: 3
  resourceOptimizationGain: number;    // ex: 22.4% ganho
  governanceComplianceRate: number;    // ex: 100%
  globalAdaptiveMaturityScore: number; // ex: 99.0
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_CONTEXT_NODES: Omit<ContextGraphNode, 'id' | 'createdAt'>[] = [
  {
    nodeCode: 'CTX-001',
    contextDomain: 'CLINICO',
    label: 'Contexto Clínico (FHIR R4 + Telemedicina + Prontuário)',
    confidenceScore: 99.4,
    validUntil: '2026-12-31',
    priority: 1,
    relatedEntities: 42,
  },
  {
    nodeCode: 'CTX-002',
    contextDomain: 'TERRITORIAL',
    label: 'Contexto Territorial (142 Municípios · 4 Estados · Geodados)',
    confidenceScore: 98.7,
    validUntil: '2026-12-31',
    priority: 2,
    relatedEntities: 142,
  },
  {
    nodeCode: 'CTX-003',
    contextDomain: 'REGULATORIO',
    label: 'Contexto Regulatório (LGPD · ISO 27001 · NLLC 14.133)',
    confidenceScore: 100.0,
    validUntil: '2026-12-31',
    priority: 1,
    relatedEntities: 18,
  },
  {
    nodeCode: 'CTX-004',
    contextDomain: 'FINANCEIRO',
    label: 'Contexto Financeiro (ARR R$ 18.4M · EBITDA 34% · SROI 5.4x)',
    confidenceScore: 99.1,
    validUntil: '2026-12-31',
    priority: 2,
    relatedEntities: 24,
  },
];

const SEED_RECOMMENDATIONS: Omit<AdaptiveRecommendation, 'id' | 'createdAt'>[] = [
  {
    recommendationCode: 'ADAPT-001',
    title: 'Priorização Dinâmica de Triagem Clínica via IA (Score de Vulnerabilidade)',
    trigger: 'AUTOMATICA',
    status: 'ATIVA',
    contextDomain: 'CLINICO',
    expectedImpact: 'Redução de 18% no tempo médio de triagem de beneficiários em situação de alta vulnerabilidade.',
    aiConfidence: 97,
    estimatedGain: 'MTTT -18% (Mean Time To Triage)',
    riskLevel: 'BAIXO',
    reversible: true,
    approvalRequired: false,
    appliedAt: '2026-07-22T18:00:00Z',
  },
  {
    recommendationCode: 'ADAPT-002',
    title: 'Redistribuição de Recursos de Computação por Carga Territorial (142 Municípios)',
    trigger: 'CONDICIONAL',
    status: 'ATIVA',
    contextDomain: 'TERRITORIAL',
    expectedImpact: 'Balanceamento inteligente de réplicas Cloud Run entre regiões GCP para municípios com pico de demanda >3σ.',
    aiConfidence: 95,
    estimatedGain: 'Custo de infraestrutura -14% (Autoscaling inteligente)',
    riskLevel: 'BAIXO',
    reversible: true,
    approvalRequired: false,
    appliedAt: '2026-07-22T20:30:00Z',
  },
  {
    recommendationCode: 'ADAPT-003',
    title: 'Adaptação do Dashboard Executivo por Perfil Diretivo (Presidência vs. CTO)',
    trigger: 'REQUER_APROVACAO',
    status: 'PENDENTE_APROVACAO',
    contextDomain: 'INSTITUCIONAL',
    expectedImpact: 'Personalização contextual de KPIs exibidos com base no perfil, cargo e histórico de decisões de cada executivo.',
    aiConfidence: 91,
    estimatedGain: 'Redução 32% em tempo médio de análise de dashboard',
    riskLevel: 'MODERADO',
    reversible: true,
    approvalRequired: true,
  },
];

const SEED_POLICIES: Omit<AdaptationPolicy, 'id' | 'createdAt'>[] = [
  {
    policyCode: 'POL-ADAPT-001',
    title: 'Adaptações Automáticas de UX e Priorização de Filas (Nível Operacional)',
    policyLevel: 'PERMITIDA',
    affectedScope: 'Dashboards, Notificações, Filas de Atendimento',
    triggerCondition: 'Contexto operacional muda em >15% dentro de 30 minutos',
    approvalLevel: 'Sistema Autônomo (Sem aprovação humana requerida)',
    isReversible: true,
    auditRequired: true,
  },
  {
    policyCode: 'POL-ADAPT-002',
    title: 'Adaptações Condicionais de Redistribuição de Infraestrutura',
    policyLevel: 'CONDICIONAL',
    affectedScope: 'Cloud Run Replicas, AlloyDB Read Replicas, Apigee Rate Limits',
    triggerCondition: 'Carga > 80% da capacidade nominal por >5 minutos consecutivos',
    approvalLevel: 'CTO ou CSO (Aprovação em até 15 minutos)',
    isReversible: true,
    auditRequired: true,
  },
  {
    policyCode: 'POL-ADAPT-003',
    title: 'Mudanças Estruturais de Arquitetura de Módulos',
    policyLevel: 'PROIBIDA',
    affectedScope: 'Módulos Core, APIs FHIR R4, Schema Firestore/AlloyDB, Rotas Auth',
    triggerCondition: 'Qualquer ação sobre módulos de Saúde, Governança ou Segurança',
    approvalLevel: 'ARB + CEO + CISO (Aprovação formal unânime necessária)',
    isReversible: false,
    auditRequired: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEAICODOPService = {

  async getContextGraphNodes(): Promise<ContextGraphNode[]> {
    const q = query(collection(db, 'eaicodop_context_graph'), orderBy('priority', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_CONTEXT_NODES) {
        await addDoc(collection(db, 'eaicodop_context_graph'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getContextGraphNodes();
    }
    return snap.docs.map(d => mapDoc<ContextGraphNode>(d));
  },

  async getAdaptiveRecommendations(): Promise<AdaptiveRecommendation[]> {
    const q = query(collection(db, 'eaicodop_recommendations'), orderBy('aiConfidence', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RECOMMENDATIONS) {
        await addDoc(collection(db, 'eaicodop_recommendations'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getAdaptiveRecommendations();
    }
    return snap.docs.map(d => mapDoc<AdaptiveRecommendation>(d));
  },

  async getAdaptationPolicies(): Promise<AdaptationPolicy[]> {
    const q = query(collection(db, 'eaicodop_policies'), orderBy('policyCode', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_POLICIES) {
        await addDoc(collection(db, 'eaicodop_policies'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getAdaptationPolicies();
    }
    return snap.docs.map(d => mapDoc<AdaptationPolicy>(d));
  },

  async getDashboardKPIs(): Promise<EAICODOPDashboardKPIs> {
    return {
      adaptiveIntelligenceScore: 99.0,
      contextAwarenessIndex: 98.9,
      dynamicOptimizationRate: 97.6,
      uxPersonalizationScore: 98.2,
      adaptationsAppliedCount: 384,
      pendingApprovalCount: 3,
      resourceOptimizationGain: 22.4,
      governanceComplianceRate: 100,
      globalAdaptiveMaturityScore: 99.0,
      certificationDate: '2026-07-23',
      certificationVersion: 'EAICODOP v1.0 — Prompt 092 (Enterprise Adaptive Intelligence Platform)',
    };
  },
};
