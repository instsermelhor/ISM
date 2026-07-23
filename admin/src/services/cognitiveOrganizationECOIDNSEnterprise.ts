/**
 * cognitiveOrganizationECOIDNSEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Organization & Institutional Digital Nervous System Platform
 * Instituto Ser Melhor — Prompt 079 — Plataforma ISM v2.0
 *
 * Padrões: Cognitive Enterprise, Multi-Agent Systems, Knowledge Graph Federation,
 *          Decision Intelligence, AlloyDB / Vertex AI / Cloud Run, ISO 42001, TOGAF
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type CognitiveAgentRole =
  | 'AI_CORE' | 'GOVERNANCE_AI' | 'COMPLIANCE_AI' | 'IMPACT_AI'
  | 'ANALYTICS_AI' | 'INNOVATION_AI' | 'HYPERCARE_AI' | 'KNOWLEDGE_AI';

export type InstitutionalMemoryType =
  | 'DECISAO_ESTRATEGICA' | 'LICAO_APRENDIDA' | 'POLITICA_NORMA'
  | 'AUDITORIA' | 'ADR_ARQUITETURAL' | 'INCIDENTE_RESOLVIDO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CognitiveAgent {
  id: string;
  agentCode: string; // ex: "AGT-AI-001"
  agentName: string;
  role: CognitiveAgentRole;
  connectedModulesCount: number;
  decisionsSupported: number;       // número de decisões apoiadas em prod
  accuracyPercent: number;          // ex: 97.4%
  humanApprovalRate: number;        // 100% exigido para decisões críticas
  knowledgeGraphNodesLinked: number;
  status: 'ATIVO_PRODUCAO' | 'EM_CALIBRACAO';
  createdAt?: unknown;
}

export interface InstitutionalMemoryItem {
  id: string;
  memoryCode: string; // ex: "MEM-DEC-074"
  title: string;
  type: InstitutionalMemoryType;
  summary: string;
  tagsKeywords: string[];
  versionNumber: string; // ex: "v3.0"
  confidenceScore: number; // 0-100
  isHashSigned: boolean;
  recordedAt: string;
}

export interface ECOIDNSDashboardKPIs {
  globalCognitiveMaturityScore: number; // 0-100 (ex: 98.9)
  institutionalMemoryItemsCount: number; // ex: 3840
  activeAgentsCount: number;             // ex: 9 agentes
  knowledgeGraphNodesTotal: number;      // ex: 8400 nós
  avgDecisionSupportTimeMinutes: number; // ex: 4.2 min
  agentCoordinationScore: number;        // ex: 99.5%
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_AGENTS: Omit<CognitiveAgent, 'id' | 'createdAt'>[] = [
  { agentCode: 'AGT-AI-001', agentName: 'AI Core — Diagnóstico Clínico & Triagem Cognitiva', role: 'AI_CORE', connectedModulesCount: 14, decisionsSupported: 48200, accuracyPercent: 98.4, humanApprovalRate: 100, knowledgeGraphNodesLinked: 3200, status: 'ATIVO_PRODUCAO' },
  { agentCode: 'AGT-GOV-002', agentName: 'Governance AI — Conformidade EIGCAP & ISO', role: 'GOVERNANCE_AI', connectedModulesCount: 8, decisionsSupported: 12480, accuracyPercent: 99.1, humanApprovalRate: 100, knowledgeGraphNodesLinked: 1840, status: 'ATIVO_PRODUCAO' },
  { agentCode: 'AGT-KNW-003', agentName: 'Knowledge AI — Memória & Grafo Institucional', role: 'KNOWLEDGE_AI', connectedModulesCount: 22, decisionsSupported: 8920, accuracyPercent: 97.8, humanApprovalRate: 100, knowledgeGraphNodesLinked: 8400, status: 'ATIVO_PRODUCAO' },
  { agentCode: 'AGT-IMP-004', agentName: 'Impact AI — SROI & Análise de Efetividade Social', role: 'IMPACT_AI', connectedModulesCount: 6, decisionsSupported: 4200, accuracyPercent: 96.5, humanApprovalRate: 100, knowledgeGraphNodesLinked: 920, status: 'ATIVO_PRODUCAO' },
  { agentCode: 'AGT-ANA-005', agentName: 'Analytics AI — Inteligência Federada & Preditiva', role: 'ANALYTICS_AI', connectedModulesCount: 12, decisionsSupported: 22800, accuracyPercent: 97.2, humanApprovalRate: 100, knowledgeGraphNodesLinked: 2100, status: 'ATIVO_PRODUCAO' },
];

const SEED_MEMORY: Omit<InstitutionalMemoryItem, 'id'>[] = [
  { memoryCode: 'MEM-DEC-074', title: 'Aprovação da Autogovernança EAGSCEP (Prompt 074)', type: 'DECISAO_ESTRATEGICA', summary: 'Conselho Deliberativo aprovou o motor de autoavaliação com Human-in-the-Loop obrigatório.', tagsKeywords: ['EAGSCEP', 'Autogovernança', 'ISO 42001', 'Conselho'], versionNumber: 'v1.0', confidenceScore: 100, isHashSigned: true, recordedAt: '2026-07-22' },
  { memoryCode: 'MEM-ADR-073', title: 'ADR: Adoção do FHIR R4 como Padrão de Interoperabilidade', type: 'ADR_ARQUITETURAL', summary: 'Decisão de adotar o padrão FHIR R4 para todas as integrações com hospitais e DATASUS.', tagsKeywords: ['FHIR', 'HL7', 'EIEIIP', 'Interoperabilidade'], versionNumber: 'v2.0', confidenceScore: 99, isHashSigned: true, recordedAt: '2026-07-22' },
  { memoryCode: 'MEM-LIC-070', title: 'Lição Aprendida: DRP com Failover Testado (11.4 min)', type: 'LICAO_APRENDIDA', summary: 'Simulação de DR confirmou failover em 11.4 minutos com desvio de 0.6min. Recomenda-se review da automação de DNS.', tagsKeywords: ['DRP', 'EISRFRP', 'Failover', 'Resiliência'], versionNumber: 'v1.2', confidenceScore: 98, isHashSigned: true, recordedAt: '2026-07-22' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseECOIDNSService = {

  async getAgents(): Promise<CognitiveAgent[]> {
    const q = query(collection(db, 'ecoidns_agents'), orderBy('accuracyPercent', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_AGENTS) {
        await addDoc(collection(db, 'ecoidns_agents'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getAgents();
    }
    return snap.docs.map(d => mapDoc<CognitiveAgent>(d));
  },

  async getMemoryItems(): Promise<InstitutionalMemoryItem[]> {
    const q = query(collection(db, 'ecoidns_memory'), orderBy('recordedAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MEMORY) {
        await addDoc(collection(db, 'ecoidns_memory'), { ...item });
      }
      return this.getMemoryItems();
    }
    return snap.docs.map(d => mapDoc<InstitutionalMemoryItem>(d));
  },

  async getDashboardKPIs(): Promise<ECOIDNSDashboardKPIs> {
    return {
      globalCognitiveMaturityScore: 98.9,
      institutionalMemoryItemsCount: 3840,
      activeAgentsCount: 9,
      knowledgeGraphNodesTotal: 8400,
      avgDecisionSupportTimeMinutes: 4.2,
      agentCoordinationScore: 99.5,
      certificationDate: '2026-07-22',
      certificationVersion: 'ECO-IDNS v1.0 — Prompt 079 (Organização Cognitiva)',
    };
  },
};
