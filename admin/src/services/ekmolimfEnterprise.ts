/**
 * ekmolimfEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Knowledge Management, Organizational Learning &
 * Institutional Memory Framework (EKMOLIMF)
 * Instituto Ser Melhor — Prompt E028 — Plataforma ISM v2.0
 *
 * Frameworks & Standards:
 *   - ISO 30401 (Knowledge Management Systems)
 *   - ISO 9001 (Quality Management Systems)
 *   - ISO 56002 (Innovation Management) & ISO 42001 (AI Governance)
 *   - ThoughtWorks / RAG Vector & Hybrid Semantic Search (E020)
 *   - Communities of Practice (CoP) Model (Wenger-Trayner)
 *   - DDD / CQRS / Clean Architecture / OpenTelemetry / LGPD
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

export type KnowledgeSecurityClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type KnowledgeAssetType =
  | 'STANDARD_OPERATING_PROCEDURE' | 'POLICY' | 'POLICY_MANUAL' | 'DOCUMENT_MODEL'
  | 'BEST_PRACTICE' | 'LESSON_LEARNED' | 'RESEARCH_PUBLICATION' | 'TECHNICAL_GUIDELINE';

export type CoPDomain =
  | 'PSICOLOGIA_SAUDE_MENTAL' | 'ASSISTENCIA_SOCIAL' | 'JURIDICO_DIREITOS_HUMANOS'
  | 'TECNOLOGIA_INOVACAO' | 'GESTAO_TERCEIRO_SETOR' | 'VOLUNTARIADO';

export type LifecycleStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── AGGREGATE ROOTS (ETAPA 1) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root 1: KnowledgeAsset */
export interface KnowledgeAsset {
  id: string;
  code: string;               // ex: ASSET-SOP-001
  assetType: KnowledgeAssetType;
  title: string;
  summary: string;
  domainName: string;
  securityClassification: KnowledgeSecurityClassification;
  versionNumber: string;
  lifecycleStatus: LifecycleStatus;
  authorName: string;
  reviewerName: string;
  approverName: string;
  tags: string[];
  viewsCount: number;
  usefulnessRating: number;   // 0.0 to 5.0
  publishedAt: string;
  reviewFrequencyDays: number;
  auditTrail?: AuditEntry[];
}

/** Aggregate Root 2: LessonLearned */
export interface LessonLearned {
  id: string;
  code: string;               // ex: LES-001
  title: string;
  contextDescription: string;
  outcomeType: 'SUCCESS' | 'FAILURE' | 'IMPROVEMENT';
  rootCauseAnalysis: string;
  preventiveRecommendation: string;
  associatedProjectCode: string;
  registeredBy: string;
  registeredAt: string;
}

/** Aggregate Root 3: InstitutionalMemoryRecord */
export interface InstitutionalMemoryRecord {
  id: string;
  code: string;               // ex: MEM-001
  milestoneTitle: string;
  historicalCategory: 'DECISAO_ESTRATEGICA' | 'MARCO_INSTITUCIONAL' | 'PROJETO_CONCLUIDO' | 'ADR_ARQUITETURAL';
  eventDate: string;
  detailedDescription: string;
  keyStakeholders: string[];
  digitalEvidenceUrl: string;
  archivedBy: string;
}

/** Aggregate Root 4: CommunityOfPractice */
export interface CommunityOfPractice {
  id: string;
  code: string;               // ex: COP-PSICO-01
  name: string;
  domain: CoPDomain;
  description: string;
  activeMembersCount: number;
  leadFacilitator: string;
  discussionsCount: number;
  publishedArticlesCount: number;
  status: 'ACTIVE' | 'PAUSED';
}

/** Aggregate Root 5: KnowledgeTaxonomy */
export interface KnowledgeTaxonomyItem {
  id: string;
  categoryName: string;
  subcategories: string[];
  ontologyRelations: string[];
  associatedAssetCount: number;
}

export interface KnowledgeManagementCertification {
  knowledgeMaturityScore: number; // 0-100
  iso30401ComplianceScore: number;
  taxonomyCoverageScore: number;
  institutionalMemoryScore: number;
  communityEngagementScore: number;
  semanticSearchAccuracyPct: number;
  certifiedAt: string;
  certifiedBy: string;
  conformanceChecklist: { item: string; standard: string; compliant: boolean }[];
}

export interface EKMOLIMFConsolidatedDashboard {
  generatedAt: string;
  totalKnowledgeAssetsCount: number;
  totalSOPsPublished: number;
  totalLessonsLearnedRegistered: number;
  totalInstitutionalMemoriesArchived: number;
  activeCommunitiesOfPracticeCount: number;
  globalSearchAccuracyPct: number;
  knowledgeMaturityScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOCK DATA GENERATORS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const TS = () => new Date().toISOString();
const uid = (p: string, n: number) => `${p}-${String(n).padStart(3, '0')}`;

function generateAssets(): KnowledgeAsset[] {
  const assets = [
    { code: 'ASSET-SOP-001', type: 'STANDARD_OPERATING_PROCEDURE', title: 'SOP-CLIN-01: Protocolo de Acolhimento e Triagem Psicossocial', domain: 'Saúde Mental', class: 'INTERNAL', ver: 'v2.1', author: 'Dra. Ana Souza (CKO)', rev: 'Dr. Lucas Lima', app: 'Diretoria Clínica', rating: 4.9, views: 1240 },
    { code: 'ASSET-POL-002', type: 'POLICY', title: 'POL-PRIV-02: Política Corporativa de Proteção de Dados e Privacidade LGPD', domain: 'Jurídico & Compliance', class: 'PUBLIC', ver: 'v3.0', author: 'Dr. Roberto Melo (CISO)', rev: 'Comitê DPO', app: 'Presidência', rating: 5.0, views: 2850 },
    { code: 'ASSET-MAN-003', type: 'POLICY_MANUAL', title: 'MAN-FIN-01: Manual de Prestação de Contas para Convênios MROSC & ITG 2002', domain: 'Financeiro', class: 'INTERNAL', ver: 'v2.0', author: 'Carlos Mendes (CFO)', rev: 'Auditoria Externa', app: 'Conselho Fiscal', rating: 4.8, views: 980 },
    { code: 'ASSET-GUI-004', type: 'TECHNICAL_GUIDELINE', title: 'GUI-TEC-05: Guia de Arquitetura DDD, Clean Code e Segurança OWASP v4.0', domain: 'Tecnologia', class: 'INTERNAL', ver: 'v2.0', author: 'Eng. Ricardo (CEA)', rev: 'Tech Leads', app: 'CTO', rating: 4.95, views: 1560 },
  ];

  return assets.map((a, i) => ({
    id: uid('ASSET', i + 1),
    code: a.code,
    assetType: a.type as KnowledgeAssetType,
    title: a.title,
    summary: 'Documento normativo homologado com validade institucional permanente.',
    domainName: a.domain,
    securityClassification: a.class as KnowledgeSecurityClassification,
    versionNumber: a.ver,
    lifecycleStatus: 'PUBLISHED' as const,
    authorName: a.author,
    reviewerName: a.rev,
    approverName: a.app,
    tags: ['Procedimento', 'ISO 9001', 'ISO 30401', a.domain],
    viewsCount: a.views,
    usefulnessRating: a.rating,
    publishedAt: '2026-01-10',
    reviewFrequencyDays: 180,
  }));
}

function generateLessons(): LessonLearned[] {
  return [
    { id: 'LES-001', code: 'LES-001', title: 'Otimização no Agendamento de Consultas Psicossociais em Picos de Demanda', contextDescription: 'Aumento de 40% nas solicitações pós-campanhas comunitárias.', outcomeType: 'SUCCESS', rootCauseAnalysis: 'Automação da triagem com IA Generativa (E020) reduziu filas presenciais.', preventiveRecommendation: 'Manter pre-triagem digital ativa 24/7.', associatedProjectCode: 'PROJ-SAUDE-2026', registeredBy: 'Dra. Ana Souza', registeredAt: '2026-02-01' },
    { id: 'LES-002', code: 'LES-002', title: 'Prevenção de Inconsistências na Prestação de Contas de Parcerias Públicas', contextDescription: 'Mudança nas regras fiscais municipais.', outcomeType: 'IMPROVEMENT', rootCauseAnalysis: 'Necessidade de inclusão do hash SHA-256 da nota fiscal no recibo digital.', preventiveRecommendation: 'Atualizar validação automática no módulo E007.', associatedProjectCode: 'PROJ-MROSC-2026', registeredBy: 'Carlos Mendes', registeredAt: '2026-01-20' },
  ];
}

function generateMemories(): InstitutionalMemoryRecord[] {
  return [
    { id: 'MEM-001', code: 'MEM-001', milestoneTitle: 'Aprovação do Estatuto Social Atualizado e Certificação ISO 9001 / ISO 30401', historicalCategory: 'MARCO_INSTITUCIONAL', eventDate: '2026-01-05', detailedDescription: 'Conselho Superior aprova formalmente a transição da Plataforma ISM para o modelo de governança baseada em conhecimento.', keyStakeholders: ['Presidência', 'Conselho', 'Diretoria Executiva'], digitalEvidenceUrl: 'https://ism.org.br/docs/mem-001.pdf', archivedBy: 'Secretaria Geral' },
    { id: 'MEM-002', code: 'MEM-002', milestoneTitle: 'Adoção da Criptografia Ponta-a-Ponta no Prontuário Eletrônico (E006)', historicalCategory: 'ADR_ARQUITETURAL', eventDate: '2026-01-18', detailedDescription: 'Decisão arquitetural de sigilo absoluto para dados de atendimento psicológico.', keyStakeholders: ['CTO', 'CISO', 'Equipe Médica'], digitalEvidenceUrl: 'https://ism.org.br/docs/adr-006.pdf', archivedBy: 'Comitê de Arquitetura' },
  ];
}

function generateCommunities(): CommunityOfPractice[] {
  return [
    { id: 'COP-001', code: 'COP-PSICO-01', name: 'Comunidade de Prática em Psicologia & Saúde Mental', domain: 'PSICOLOGIA_SAUDE_MENTAL', description: 'Fórum de discussão clínica, estudos de caso anônimos e diretrizes de atendimento.', activeMembersCount: 42, leadFacilitator: 'Dra. Ana Souza', discussionsCount: 128, publishedArticlesCount: 34, status: 'ACTIVE' },
    { id: 'COP-002', code: 'COP-SOC-01', name: 'Comunidade de Prática em Assistência Social & Família', domain: 'ASSISTENCIA_SOCIAL', description: 'Troca de experiências em acolhimento comunitário e direitos sociais.', activeMembersCount: 56, leadFacilitator: 'Mariana Costa', discussionsCount: 194, publishedArticlesCount: 48, status: 'ACTIVE' },
    { id: 'COP-003', code: 'COP-TECH-01', name: 'Comunidade de Prática em Tecnologia, IA & Arquitetura', domain: 'TECNOLOGIA_INOVACAO', description: 'Debates sobre DDD, RAG, OpenTelemetry e evolução tecnológica contínua.', activeMembersCount: 28, leadFacilitator: 'Eng. Ricardo', discussionsCount: 150, publishedArticlesCount: 52, status: 'ACTIVE' },
  ];
}

function generateCertification(): KnowledgeManagementCertification {
  return {
    knowledgeMaturityScore: 98,
    iso30401ComplianceScore: 99,
    taxonomyCoverageScore: 98,
    institutionalMemoryScore: 99,
    communityEngagementScore: 96,
    semanticSearchAccuracyPct: 98.4,
    certifiedAt: TS(),
    certifiedBy: 'Chief Knowledge Officer (CKO) & Chief Information Officer (CIO)',
    conformanceChecklist: [
      { item: 'Sistema de Gestão do Conhecimento estruturado conforme ISO 30401', standard: 'ISO 30401 Standard', compliant: true },
      { item: 'Repositório Central com SOPs, Políticas e Manuais normatizados e versionados', standard: 'ISO 9001 Quality', compliant: true },
      { item: 'Taxonomia e ontologias institucionais com suporte a múltiplas categorias', standard: 'Enterprise Taxonomy', compliant: true },
      { item: 'Registros permanentes da Memória Institucional e decisões de governança', standard: 'Institutional Memory', compliant: true },
      { item: 'Gestão sistemática de Lições Aprendidas com análise de causa raiz', standard: 'Organizational Learning', compliant: true },
      { item: 'Comunidades de Prática (CoPs) ativas em 6 domínios profissionais', standard: 'Wenger CoP Framework', compliant: true },
      { item: 'Busca Híbrida (Textual + Vetorial RAG E020) com acurácia de 98.4%', standard: 'Vector Search / RAG', compliant: true },
      { item: 'APIs corporativas de conhecimento documentadas em OpenAPI 3.1', standard: 'OpenAPI 3.1', compliant: true },
      { item: 'Controle de Acesso RBAC/ABAC com 4 níveis de classificação de segurança', standard: 'LGPD / Security Standard', compliant: true },
      { item: 'Monitoramento de obsolescência e governança do ciclo de vida dos ativos', standard: 'Knowledge Governance', compliant: true },
    ],
  };
}

function generateConsolidated(): EKMOLIMFConsolidatedDashboard {
  return {
    generatedAt: TS(),
    totalKnowledgeAssetsCount: 148,
    totalSOPsPublished: 42,
    totalLessonsLearnedRegistered: 86,
    totalInstitutionalMemoriesArchived: 64,
    activeCommunitiesOfPracticeCount: 6,
    globalSearchAccuracyPct: 98.4,
    knowledgeMaturityScore: 98,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SERVICE CLASS ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export class EKMOLIMFService {
  static async getConsolidatedDashboard(): Promise<EKMOLIMFConsolidatedDashboard> {
    return generateConsolidated();
  }

  static async getAssets(): Promise<KnowledgeAsset[]> {
    return generateAssets();
  }

  static async getLessons(): Promise<LessonLearned[]> {
    return generateLessons();
  }

  static async getMemories(): Promise<InstitutionalMemoryRecord[]> {
    return generateMemories();
  }

  static async getCommunities(): Promise<CommunityOfPractice[]> {
    return generateCommunities();
  }

  static async getCertification(): Promise<KnowledgeManagementCertification> {
    return generateCertification();
  }
}
