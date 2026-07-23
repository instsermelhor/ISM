/**
 * governanceEIGCAPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Governance, Compliance & Accountability Platform
 * Instituto Ser Melhor — Prompt 065 — Plataforma ISM v2.0
 *
 * Padrões: ISO 37000, ISO 37301, ISO 31000, COSO ERM, COBIT 2019,
 *          ISO 27001, ISO 22301, ISO 42001, LGPD, Zero Trust
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, doc, addDoc, updateDoc, getDocs,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type GovernanceOrganType =
  | 'ASSEMBLEIA_GERAL'
  | 'CONSELHO_DELIBERATIVO'
  | 'CONSELHO_FISCAL'
  | 'DIRETORIA_EXECUTIVA'
  | 'COMITE_PERMANENTE'
  | 'COMITE_TEMPORARIO'
  | 'PRESIDENCIA'
  | 'SUPERINTENDENCIA'
  | 'COORDENACAO'
  | 'AREA_OPERACIONAL';

export type PolicyStatus = 'VIGENTE' | 'EM_REVISAO' | 'OBSOLETA' | 'PROPOSTA' | 'APROVADA';
export type PolicyCategory =
  | 'ESTATUTO'
  | 'REGIMENTO'
  | 'POLITICA_INTERNA'
  | 'CODIGO_ETICA'
  | 'NORMA'
  | 'PROCEDIMENTO'
  | 'MANUAL'
  | 'RESOLUCAO'
  | 'DELIBERACAO';

export type RiskLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO' | 'NEGLIGIVEL';
export type RiskCategory =
  | 'ESTRATEGICO'
  | 'OPERACIONAL'
  | 'FINANCEIRO'
  | 'TECNOLOGICO'
  | 'JURIDICO'
  | 'REPUTACIONAL'
  | 'COMPLIANCE'
  | 'GOVERNANCA';

export type ComplianceStatus = 'CONFORME' | 'NAO_CONFORME' | 'PARCIALMENTE_CONFORME' | 'EM_AVALIACAO';
export type AuditType = 'PLANEJADA' | 'EXTRAORDINARIA' | 'CONTINUA' | 'EXTERNAL';
export type AuditStatus = 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'SUSPENSA';
export type ControlType = 'PREVENTIVO' | 'DETECTIVO' | 'CORRETIVO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface GovernanceOrgan {
  id: string;
  name: string;
  type: GovernanceOrganType;
  description: string;
  competencies: string[];
  responsibilities: string[];
  decisionLimits: string;
  members: number;
  meetingFrequency: string;
  quorum: string;
  reportingTo: string | null;
  policies: string[];
  risks: string[];
  maturityScore: number;
  isActive: boolean;
  createdAt?: unknown;
}

export interface InstitutionalPolicy {
  id: string;
  title: string;
  code: string;
  category: PolicyCategory;
  status: PolicyStatus;
  version: string;
  responsible: string;
  approvedBy: string;
  approvalDate: string;
  effectiveDate: string;
  reviewDate: string;
  description: string;
  applicableTo: string[];
  relatedPolicies: string[];
  complianceFrameworks: string[];
  auditTrail: { date: string; action: string; user: string }[];
  hash: string;
  createdAt?: unknown;
}

export interface InstitutionalRisk {
  id: string;
  code: string;
  title: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  probability: number;   // 1–5
  impact: number;        // 1–5
  riskScore: number;     // probability × impact
  residualRisk: number;  // after controls
  controls: string[];
  mitigationPlan: string;
  responsible: string;
  status: 'ATIVO' | 'MONITORADO' | 'MITIGADO' | 'ACEITO' | 'TRANSFERIDO';
  lastReview: string;
  nextReview: string;
  trend: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  createdAt?: unknown;
}

export interface ComplianceObligation {
  id: string;
  title: string;
  framework: string;       // ISO 37301, LGPD, etc.
  requirement: string;
  status: ComplianceStatus;
  evidence: string;
  responsible: string;
  deadline: string;
  lastAssessment: string;
  nonConformities: { id: string; description: string; actionPlan: string; dueDate: string; status: string }[];
  maturityLevel: number;   // 0–5 (CMMI-like)
  createdAt?: unknown;
}

export interface InternalControl {
  id: string;
  code: string;
  title: string;
  description: string;
  type: ControlType;
  process: string;
  responsible: string;
  frequency: string;
  automationLevel: 'MANUAL' | 'SEMI_AUTOMATIZADO' | 'AUTOMATIZADO';
  effectiveness: number;   // 0–100
  lastTested: string;
  nextTest: string;
  evidence: string;
  segregationOfDuties: boolean;
  isActive: boolean;
  createdAt?: unknown;
}

export interface InternalAudit {
  id: string;
  code: string;
  title: string;
  type: AuditType;
  status: AuditStatus;
  scope: string;
  objectives: string[];
  responsible: string;
  team: string[];
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  findings: {
    id: string;
    description: string;
    severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
    recommendation: string;
    actionPlan: string;
    responsible: string;
    dueDate: string;
    status: 'ABERTA' | 'EM_ANDAMENTO' | 'IMPLEMENTADA' | 'VERIFICADA';
  }[];
  overallRating: 'SATISFATORIO' | 'PARCIALMENTE_SATISFATORIO' | 'INSATISFATORIO';
  reportHash: string;
  createdAt?: unknown;
}

export interface AccountabilityRecord {
  id: string;
  title: string;
  type: 'PRESTACAO_CONTAS' | 'RELATORIO_TRANSPARENCIA' | 'DECISAO_BOARD' | 'PUBLICACAO_RESULTADO';
  period: string;
  responsible: string;
  approvedBy: string;
  publishedAt: string;
  stakeholders: string[];
  kpis: { name: string; value: string; target: string; status: 'OK' | 'ALERTA' | 'CRITICO' }[];
  documentUrl: string;
  isPublic: boolean;
  hash: string;
  createdAt?: unknown;
}

export interface EIGCAPDashboardKPIs {
  // Governança
  governanceMaturity: number;
  complianceIndex: number;
  risksMitigated: number;
  activeControls: number;
  auditsConcluded: number;
  nonConformitiesTreated: number;
  transparencyScore: number;
  ethicsIndex: number;
  // Contadores
  totalOrgans: number;
  totalPolicies: number;
  totalRisks: number;
  totalObligations: number;
  totalControls: number;
  totalAudits: number;
  totalAccountabilityRecords: number;
  // AI
  aiRiskAlerts: number;
  aiComplianceRecommendations: number;
  // Certificação
  globalGovernanceScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Padrão ──────────────────────────────────────────────────────────────

const SEED_ORGANS: Omit<GovernanceOrgan, 'id' | 'createdAt'>[] = [
  {
    name: 'Assembleia Geral',
    type: 'ASSEMBLEIA_GERAL',
    description: 'Órgão soberano de deliberação máxima da organização, responsável por aprovar estatutos, eleição dos conselhos e prestação de contas anuais.',
    competencies: ['Aprovação de alterações estatutárias', 'Eleição de conselheiros', 'Apreciação do relatório anual', 'Deliberação sobre dissolução'],
    responsibilities: ['Supervisão máxima institucional', 'Aprovação do balanço patrimonial', 'Decisão sobre fusão ou incorporação'],
    decisionLimits: 'Ilimitado — órgão soberano',
    members: 28,
    meetingFrequency: 'Anual (Ordinária) + Extraordinárias',
    quorum: '2/3 dos associados para alteração estatutária; maioria simples para demais deliberações',
    reportingTo: null,
    policies: ['EST-001 Estatuto Social', 'REG-001 Regimento Interno da Assembleia'],
    risks: ['RSK-001 Falta de quórum', 'RSK-002 Conflito de interesses'],
    maturityScore: 94,
    isActive: true,
  },
  {
    name: 'Conselho Deliberativo',
    type: 'CONSELHO_DELIBERATIVO',
    description: 'Órgão de administração superior responsável pela definição de políticas, estratégia e supervisão da gestão executiva.',
    competencies: ['Aprovação do planejamento estratégico', 'Nomeação e exoneração da Diretoria', 'Aprovação do orçamento anual', 'Supervisão das operações'],
    responsibilities: ['Definição das políticas institucionais', 'Aprovação de convênios acima de R$ 500k', 'Supervisão do compliance'],
    decisionLimits: 'Aprovação de despesas acima de R$ 100k; contratos acima de R$ 500k',
    members: 9,
    meetingFrequency: 'Bimestral',
    quorum: 'Maioria absoluta (5 de 9)',
    reportingTo: 'Assembleia Geral',
    policies: ['EST-001', 'POL-002 Política de Governança Corporativa', 'POL-003 Política de Conflito de Interesses'],
    risks: ['RSK-003 Captura do conselho', 'RSK-004 Decisões sem quórum'],
    maturityScore: 91,
    isActive: true,
  },
  {
    name: 'Conselho Fiscal',
    type: 'CONSELHO_FISCAL',
    description: 'Órgão de fiscalização independente responsável pelo controle financeiro, contábil e de compliance da organização.',
    competencies: ['Fiscalização das contas', 'Emissão de parecer sobre balanço', 'Análise de contratos relevantes', 'Verificação de compliance financeiro'],
    responsibilities: ['Relatório semestral de fiscalização', 'Parecer anual ao balanço', 'Comunicação de irregularidades'],
    decisionLimits: 'Fiscalizatório — sem poderes executivos',
    members: 5,
    meetingFrequency: 'Trimestral',
    quorum: 'Maioria simples (3 de 5)',
    reportingTo: 'Assembleia Geral',
    policies: ['EST-001', 'POL-004 Política de Fiscalização Financeira'],
    risks: ['RSK-005 Independência do conselho', 'RSK-006 Acesso insuficiente a informações'],
    maturityScore: 88,
    isActive: true,
  },
  {
    name: 'Diretoria Executiva',
    type: 'DIRETORIA_EXECUTIVA',
    description: 'Órgão de gestão responsável pela condução das operações da organização, implementação das políticas e prestação de contas ao Conselho Deliberativo.',
    competencies: ['Gestão operacional', 'Representação legal', 'Execução orçamentária', 'Contratação de colaboradores'],
    responsibilities: ['Relatório mensal ao Conselho', 'Gestão de equipes e projetos', 'Compliance operacional'],
    decisionLimits: 'Aprovação de despesas até R$ 100k; contratos até R$ 500k',
    members: 4,
    meetingFrequency: 'Semanal',
    quorum: 'Maioria simples',
    reportingTo: 'Conselho Deliberativo',
    policies: ['POL-005 Política de Gestão Executiva', 'POL-006 Delegação de Poderes'],
    risks: ['RSK-007 Sobrecarga decisória', 'RSK-008 Ausência de segregação de funções'],
    maturityScore: 93,
    isActive: true,
  },
  {
    name: 'Comitê de Compliance e Ética',
    type: 'COMITE_PERMANENTE',
    description: 'Comitê permanente responsável por monitorar o compliance institucional, investigar denúncias e promover a cultura de integridade.',
    competencies: ['Monitoramento de compliance', 'Gestão do canal de denúncias', 'Investigações internas', 'Educação em ética'],
    responsibilities: ['Relatório trimestral de compliance', 'Gestão de casos de não conformidade', 'Atualização do Código de Ética'],
    decisionLimits: 'Recomendatório — deliberações formalizadas via Diretoria ou Conselho',
    members: 5,
    meetingFrequency: 'Mensal',
    quorum: 'Maioria simples',
    reportingTo: 'Diretoria Executiva',
    policies: ['COE-001 Código de Ética e Conduta', 'POL-007 Política Antifraude e Anticorrupção'],
    risks: ['RSK-009 Baixa cultura de integridade', 'RSK-010 Denúncias sem tratamento'],
    maturityScore: 90,
    isActive: true,
  },
  {
    name: 'Comitê de Riscos e Controles',
    type: 'COMITE_PERMANENTE',
    description: 'Comitê permanente responsável pela identificação, avaliação, monitoramento e mitigação de riscos institucionais.',
    competencies: ['Gestão da matriz de riscos', 'Supervisão de controles internos', 'Acompanhamento de planos de mitigação'],
    responsibilities: ['Matriz de riscos atualizada', 'Relatório semestral de riscos', 'Recomendação de controles'],
    decisionLimits: 'Recomendatório',
    members: 6,
    meetingFrequency: 'Bimestral',
    quorum: 'Maioria simples',
    reportingTo: 'Conselho Deliberativo',
    policies: ['POL-008 Política de Gestão de Riscos (ISO 31000)', 'POL-009 Política de Continuidade'],
    risks: ['RSK-011 Mapeamento incompleto de riscos', 'RSK-012 Controles insuficientes'],
    maturityScore: 87,
    isActive: true,
  },
];

const SEED_POLICIES: Omit<InstitutionalPolicy, 'id' | 'createdAt'>[] = [
  {
    title: 'Estatuto Social do Instituto Ser Melhor',
    code: 'EST-001',
    category: 'ESTATUTO',
    status: 'VIGENTE',
    version: '4.2',
    responsible: 'Conselho Deliberativo',
    approvedBy: 'Assembleia Geral',
    approvalDate: '2024-03-15',
    effectiveDate: '2024-04-01',
    reviewDate: '2027-03-01',
    description: 'Documento constitutivo máximo da organização, definindo missão, visão, valores, órgãos de governança, competências e regras de funcionamento.',
    applicableTo: ['Todos os órgãos', 'Todos os colaboradores'],
    relatedPolicies: ['REG-001', 'POL-002'],
    complianceFrameworks: ['Lei 9.790/1999', 'ISO 37000', 'Código Civil'],
    auditTrail: [
      { date: '2024-03-15', action: 'Aprovação em Assembleia', user: 'Presidência' },
      { date: '2024-04-01', action: 'Publicação e vigência', user: 'Secretaria Executiva' },
    ],
    hash: 'sha256:EST001-4.2-ISM-2024',
  },
  {
    title: 'Política de Governança Corporativa',
    code: 'POL-002',
    category: 'POLITICA_INTERNA',
    status: 'VIGENTE',
    version: '2.1',
    responsible: 'Chief Governance Officer (CGO)',
    approvedBy: 'Conselho Deliberativo',
    approvalDate: '2025-01-10',
    effectiveDate: '2025-02-01',
    reviewDate: '2026-01-10',
    description: 'Define princípios, estrutura, processos e responsabilidades da governança institucional conforme ISO 37000 e melhores práticas nacionais e internacionais.',
    applicableTo: ['Conselho Deliberativo', 'Conselho Fiscal', 'Diretoria Executiva', 'Comitês'],
    relatedPolicies: ['EST-001', 'POL-003', 'COE-001'],
    complianceFrameworks: ['ISO 37000', 'COBIT 2019', 'IBGC'],
    auditTrail: [
      { date: '2025-01-10', action: 'Aprovação pelo Conselho', user: 'Presidência CD' },
    ],
    hash: 'sha256:POL002-2.1-ISM-2025',
  },
  {
    title: 'Código de Ética e Conduta',
    code: 'COE-001',
    category: 'CODIGO_ETICA',
    status: 'VIGENTE',
    version: '3.0',
    responsible: 'Comitê de Compliance e Ética',
    approvedBy: 'Conselho Deliberativo',
    approvalDate: '2025-06-20',
    effectiveDate: '2025-07-01',
    reviewDate: '2026-06-20',
    description: 'Estabelece os princípios éticos, valores e condutas esperadas de todos os integrantes da organização, incluindo colaboradores, voluntários, conselheiros e parceiros.',
    applicableTo: ['Todos os colaboradores', 'Voluntários', 'Conselheiros', 'Parceiros'],
    relatedPolicies: ['POL-002', 'POL-007'],
    complianceFrameworks: ['ISO 37301', 'ABNT NBR 16001', 'ONU Global Compact'],
    auditTrail: [
      { date: '2025-06-20', action: 'Revisão e aprovação v3.0', user: 'Comitê de Ética' },
    ],
    hash: 'sha256:COE001-3.0-ISM-2025',
  },
  {
    title: 'Política de Gestão de Riscos',
    code: 'POL-008',
    category: 'POLITICA_INTERNA',
    status: 'VIGENTE',
    version: '1.5',
    responsible: 'Chief Risk Officer (CRO)',
    approvedBy: 'Conselho Deliberativo',
    approvalDate: '2025-03-05',
    effectiveDate: '2025-04-01',
    reviewDate: '2026-03-01',
    description: 'Define o framework de gestão de riscos da organização, baseado na ISO 31000 e COSO ERM, incluindo identificação, avaliação, resposta e monitoramento contínuo de riscos.',
    applicableTo: ['Todos os processos', 'Todas as áreas'],
    relatedPolicies: ['POL-002', 'POL-009'],
    complianceFrameworks: ['ISO 31000:2018', 'COSO ERM 2017'],
    auditTrail: [
      { date: '2025-03-05', action: 'Publicação v1.5', user: 'CRO' },
    ],
    hash: 'sha256:POL008-1.5-ISM-2025',
  },
  {
    title: 'Política de Compliance Institucional',
    code: 'POL-010',
    category: 'POLITICA_INTERNA',
    status: 'VIGENTE',
    version: '2.0',
    responsible: 'Chief Compliance Officer (CCO)',
    approvedBy: 'Diretoria Executiva',
    approvalDate: '2025-08-01',
    effectiveDate: '2025-08-15',
    reviewDate: '2026-08-01',
    description: 'Estabelece o sistema de gestão de compliance conforme ISO 37301, definindo obrigações, controles, monitoramento e tratamento de não conformidades.',
    applicableTo: ['Todos os processos regulatórios', 'Contratos', 'Convênios'],
    relatedPolicies: ['COE-001', 'POL-007', 'POL-008'],
    complianceFrameworks: ['ISO 37301:2021', 'LGPD', 'Lei 9.790/1999'],
    auditTrail: [
      { date: '2025-08-01', action: 'Publicação v2.0', user: 'CCO' },
    ],
    hash: 'sha256:POL010-2.0-ISM-2025',
  },
];

const SEED_RISKS: Omit<InstitutionalRisk, 'id' | 'createdAt'>[] = [
  {
    code: 'RSK-GOV-001',
    title: 'Concentração de Poder na Liderança Executiva',
    description: 'Risco de decisões estratégicas excessivamente concentradas em indivíduos-chave, sem contrabalanceamento adequado dos órgãos de governança.',
    category: 'GOVERNANCA',
    level: 'ALTO',
    probability: 3,
    impact: 4,
    riskScore: 12,
    residualRisk: 4,
    controls: ['CTR-001 Segregação de poderes', 'CTR-002 Dupla assinatura em contratos'],
    mitigationPlan: 'Fortalecer o papel do Conselho Deliberativo; implementar matriz RACI para decisões críticas; aumentar frequência de reuniões.',
    responsible: 'Presidência do Conselho',
    status: 'MONITORADO',
    lastReview: '2026-06-01',
    nextReview: '2026-09-01',
    trend: 'DECRESCENTE',
  },
  {
    code: 'RSK-COMP-001',
    title: 'Não Conformidade com LGPD',
    description: 'Risco de tratamento inadequado de dados pessoais de beneficiários, colaboradores e voluntários, com possibilidade de autuações pela ANPD.',
    category: 'COMPLIANCE',
    level: 'CRITICO',
    probability: 2,
    impact: 5,
    riskScore: 10,
    residualRisk: 2,
    controls: ['CTR-010 DPO ativo', 'CTR-011 RIPD documentado', 'CTR-012 Consentimentos registrados'],
    mitigationPlan: 'Programa de adequação LGPD contínuo; treinamentos semestrais; auditorias trimestrais de dados.',
    responsible: 'Data Protection Officer (DPO)',
    status: 'MONITORADO',
    lastReview: '2026-07-01',
    nextReview: '2026-10-01',
    trend: 'ESTAVEL',
  },
  {
    code: 'RSK-FIN-001',
    title: 'Dependência Excessiva de Fontes Únicas de Financiamento',
    description: 'Risco de desequilíbrio financeiro por concentração de receitas em poucos doadores ou convênios, comprometendo a sustentabilidade institucional.',
    category: 'FINANCEIRO',
    level: 'ALTO',
    probability: 3,
    impact: 5,
    riskScore: 15,
    residualRisk: 6,
    controls: ['CTR-020 Diversificação de fontes', 'CTR-021 Reserva financeira de 6 meses'],
    mitigationPlan: 'Estratégia de diversificação de receitas; desenvolvimento de fundraising digital; captação de novos parceiros.',
    responsible: 'Diretoria Financeira',
    status: 'ATIVO',
    lastReview: '2026-05-15',
    nextReview: '2026-08-15',
    trend: 'CRESCENTE',
  },
  {
    code: 'RSK-TEC-001',
    title: 'Falha Crítica em Sistemas de Informação',
    description: 'Risco de interrupção severa da plataforma digital, comprometendo atendimento a beneficiários, registros de saúde e operações institucionais.',
    category: 'TECNOLOGICO',
    level: 'ALTO',
    probability: 2,
    impact: 5,
    riskScore: 10,
    residualRisk: 2,
    controls: ['CTR-030 Disaster Recovery Plan', 'CTR-031 Backup automático 4h', 'CTR-032 Redundância Cloud'],
    mitigationPlan: 'Testes mensais de DR; SLA de 99,9% com Google Cloud; plano de continuidade de negócios (BCM).',
    responsible: 'Chief Technology Officer (CTO)',
    status: 'MONITORADO',
    lastReview: '2026-07-10',
    nextReview: '2026-10-10',
    trend: 'DECRESCENTE',
  },
  {
    code: 'RSK-REP-001',
    title: 'Crise de Imagem Institucional',
    description: 'Risco de danos reputacionais decorrentes de escândalos éticos, erros de comunicação ou ataques de desinformação que comprometam a confiança pública.',
    category: 'REPUTACIONAL',
    level: 'MEDIO',
    probability: 2,
    impact: 4,
    riskScore: 8,
    residualRisk: 3,
    controls: ['CTR-040 Plano de gestão de crise', 'CTR-041 Monitoramento de mídia', 'CTR-042 Canal de comunicação transparente'],
    mitigationPlan: 'Comitê de crise ativado em 2h; porta-voz treinado; protocolo de resposta em 24h para qualquer incidente público.',
    responsible: 'Diretoria de Comunicação',
    status: 'MONITORADO',
    lastReview: '2026-06-20',
    nextReview: '2026-09-20',
    trend: 'ESTAVEL',
  },
];

const SEED_COMPLIANCE: Omit<ComplianceObligation, 'id' | 'createdAt'>[] = [
  {
    title: 'Gestão de Compliance — ISO 37301',
    framework: 'ISO 37301:2021',
    requirement: 'Sistema de Gestão de Compliance com política, objetivos, liderança comprometida, controles, avaliação e melhoria contínua.',
    status: 'CONFORME',
    evidence: 'Política POL-010, Comitê de Compliance ativo, relatórios trimestrais, treinamentos documentados.',
    responsible: 'CCO — Chief Compliance Officer',
    deadline: '2026-12-31',
    lastAssessment: '2026-07-01',
    nonConformities: [],
    maturityLevel: 4,
  },
  {
    title: 'Adequação à LGPD (Lei 13.709/2018)',
    framework: 'LGPD',
    requirement: 'Tratamento lícito de dados pessoais, nomeação de DPO, RIPD, consentimento documentado, registro de incidentes.',
    status: 'CONFORME',
    evidence: 'DPO nomeado, RIPD elaborado, consentimentos coletados via plataforma, canal de exercício de direitos ativo.',
    responsible: 'DPO — Data Protection Officer',
    deadline: '2026-12-31',
    lastAssessment: '2026-06-15',
    nonConformities: [],
    maturityLevel: 4,
  },
  {
    title: 'Certificação OSCIP — Lei 9.790/1999',
    framework: 'Lei 9.790/1999',
    requirement: 'Manutenção do título OSCIP com prestação de contas anual ao MJSP, publicação de relatórios e conformidade estatutária.',
    status: 'CONFORME',
    evidence: 'Título OSCIP ativo, relatórios anuais publicados, convênios conformes, auditoria externa concluída.',
    responsible: 'Secretaria Executiva',
    deadline: '2027-03-31',
    lastAssessment: '2026-04-01',
    nonConformities: [],
    maturityLevel: 5,
  },
  {
    title: 'Governança da IA — ISO 42001',
    framework: 'ISO 42001:2023',
    requirement: 'Sistema de Gestão de IA com responsabilidade, transparência, equidade, segurança e auditabilidade dos modelos de IA.',
    status: 'PARCIALMENTE_CONFORME',
    evidence: 'AI Core Platform operacional, documentação de modelos iniciada, comitê de ética de IA em formação.',
    responsible: 'CAIO — Chief AI Officer',
    deadline: '2026-12-31',
    lastAssessment: '2026-07-15',
    nonConformities: [
      {
        id: 'NC-AI-001',
        description: 'Documentação incompleta de explicabilidade dos modelos de IA preditiva',
        actionPlan: 'Implementar XAI (Explainable AI) e documentar todos os modelos até Q4/2026',
        dueDate: '2026-12-01',
        status: 'EM_ANDAMENTO',
      },
    ],
    maturityLevel: 3,
  },
  {
    title: 'Segurança da Informação — ISO 27001',
    framework: 'ISO 27001:2022',
    requirement: 'Sistema de Gestão de Segurança da Informação (SGSI) com análise de riscos, controles físicos/lógicos, incidentes e melhoria contínua.',
    status: 'CONFORME',
    evidence: 'SGSI documentado, controles ISO 27002 implementados, relatórios de pentest, certificação GCP Security.',
    responsible: 'CISO — Chief Information Security Officer',
    deadline: '2026-12-31',
    lastAssessment: '2026-05-30',
    nonConformities: [],
    maturityLevel: 4,
  },
];

const SEED_CONTROLS: Omit<InternalControl, 'id' | 'createdAt'>[] = [
  {
    code: 'CTR-001',
    title: 'Segregação de Poderes Decisórios',
    description: 'Controle que garante a separação entre quem propõe, aprova e executa decisões financeiras e contratuais.',
    type: 'PREVENTIVO',
    process: 'Gestão Financeira e Contratual',
    responsible: 'Diretoria Executiva + Conselho Deliberativo',
    frequency: 'Contínuo',
    automationLevel: 'SEMI_AUTOMATIZADO',
    effectiveness: 96,
    lastTested: '2026-06-01',
    nextTest: '2026-09-01',
    evidence: 'Workflow de aprovação registrado no sistema; trilha de auditoria imutável.',
    segregationOfDuties: true,
    isActive: true,
  },
  {
    code: 'CTR-010',
    title: 'Monitoramento Contínuo de Compliance LGPD',
    description: 'Controle automatizado de verificação de consentimentos, expiração de dados e conformidade das coleções Firestore com a LGPD.',
    type: 'DETECTIVO',
    process: 'Proteção de Dados Pessoais',
    responsible: 'DPO + CTO',
    frequency: 'Diário (automatizado)',
    automationLevel: 'AUTOMATIZADO',
    effectiveness: 98,
    lastTested: '2026-07-20',
    nextTest: '2026-08-20',
    evidence: 'Logs de conformidade gerados diariamente; alertas automáticos para expiração de consentimentos.',
    segregationOfDuties: false,
    isActive: true,
  },
  {
    code: 'CTR-020',
    title: 'Revisão Mensal do Orçamento vs. Realizado',
    description: 'Controle de acompanhamento financeiro mensal com análise de variações acima de 5% entre orçado e realizado.',
    type: 'DETECTIVO',
    process: 'Gestão Financeira',
    responsible: 'Diretoria Financeira + Conselho Fiscal',
    frequency: 'Mensal',
    automationLevel: 'SEMI_AUTOMATIZADO',
    effectiveness: 94,
    lastTested: '2026-07-05',
    nextTest: '2026-08-05',
    evidence: 'Relatórios mensais assinados; atas do Conselho Fiscal.',
    segregationOfDuties: true,
    isActive: true,
  },
  {
    code: 'CTR-030',
    title: 'Testes Mensais de Disaster Recovery',
    description: 'Controle preventivo de validação da capacidade de recuperação dos sistemas críticos conforme o RTO/RPO definido no BCM.',
    type: 'PREVENTIVO',
    process: 'Tecnologia da Informação',
    responsible: 'CTO + SRE Team',
    frequency: 'Mensal',
    automationLevel: 'AUTOMATIZADO',
    effectiveness: 99,
    lastTested: '2026-07-15',
    nextTest: '2026-08-15',
    evidence: 'Relatórios de testes DR; logs de recuperação validados; RTO < 4h comprovado.',
    segregationOfDuties: false,
    isActive: true,
  },
  {
    code: 'CTR-040',
    title: 'Monitoramento de Canal de Denúncias',
    description: 'Controle de verificação da operacionalidade e tratamento de denúncias recebidas pelo canal de integridade.',
    type: 'DETECTIVO',
    process: 'Compliance e Ética',
    responsible: 'Comitê de Compliance e Ética',
    frequency: 'Semanal',
    automationLevel: 'SEMI_AUTOMATIZADO',
    effectiveness: 91,
    lastTested: '2026-07-18',
    nextTest: '2026-07-25',
    evidence: 'Relatório semanal de denúncias; prazo máximo de resposta: 30 dias úteis.',
    segregationOfDuties: true,
    isActive: true,
  },
];

const SEED_AUDITS: Omit<InternalAudit, 'id' | 'createdAt'>[] = [
  {
    code: 'AUD-2026-001',
    title: 'Auditoria Anual de Compliance e Gestão de Riscos',
    type: 'PLANEJADA',
    status: 'CONCLUIDA',
    scope: 'Todos os processos regulatórios, controles internos e gestão de riscos da organização.',
    objectives: [
      'Verificar conformidade com LGPD, ISO 37301 e Lei 9.790/1999',
      'Avaliar efetividade dos controles internos',
      'Mapear riscos residuais',
      'Recomendar melhorias',
    ],
    responsible: 'CAE — Chief Audit Executive',
    team: ['Auditoria Interna', 'Especialista em Compliance', 'Analista de Riscos'],
    plannedStart: '2026-05-01',
    plannedEnd: '2026-05-31',
    actualStart: '2026-05-02',
    actualEnd: '2026-05-29',
    findings: [
      {
        id: 'FND-001',
        description: 'Documentação incompleta de explicabilidade dos modelos de IA (ISO 42001)',
        severity: 'MEDIA',
        recommendation: 'Implementar XAI e atualizar documentação dos modelos até Q4/2026',
        actionPlan: 'Aquisição de framework XAI; treinamento da equipe; documentação de todos os modelos.',
        responsible: 'CAIO',
        dueDate: '2026-12-01',
        status: 'EM_ANDAMENTO',
      },
    ],
    overallRating: 'SATISFATORIO',
    reportHash: 'sha256:AUD2026001-ISM-CONCLUIDA',
  },
  {
    code: 'AUD-2026-002',
    title: 'Auditoria de Segurança da Informação (ISO 27001)',
    type: 'PLANEJADA',
    status: 'EM_ANDAMENTO',
    scope: 'Controles de segurança da informação, gestão de acessos, criptografia e gestão de incidentes.',
    objectives: [
      'Avaliar conformidade com ISO 27001:2022',
      'Testar controles de acesso RBAC/ABAC',
      'Verificar criptografia em trânsito e repouso',
      'Validar processo de gestão de incidentes',
    ],
    responsible: 'CAE + CISO',
    team: ['Auditor de Segurança', 'Especialista em Cloud Security'],
    plannedStart: '2026-07-15',
    plannedEnd: '2026-08-15',
    actualStart: '2026-07-15',
    findings: [],
    overallRating: 'SATISFATORIO',
    reportHash: 'sha256:AUD2026002-ISM-ANDAMENTO',
  },
];

const SEED_ACCOUNTABILITY: Omit<AccountabilityRecord, 'id' | 'createdAt'>[] = [
  {
    title: 'Relatório Anual de Transparência 2025',
    type: 'RELATORIO_TRANSPARENCIA',
    period: '2025',
    responsible: 'Secretaria Executiva',
    approvedBy: 'Conselho Deliberativo',
    publishedAt: '2026-03-31',
    stakeholders: ['Assembleia Geral', 'Órgãos de controle', 'Doadores', 'Beneficiários', 'Parceiros'],
    kpis: [
      { name: 'Beneficiários Atendidos', value: '1.240.000', target: '1.200.000', status: 'OK' },
      { name: 'Recursos Mobilizados', value: 'R$ 48,7M', target: 'R$ 45M', status: 'OK' },
      { name: 'SROI', value: 'R$ 4,85 : R$ 1,00', target: 'R$ 4,00 : R$ 1,00', status: 'OK' },
      { name: 'Índice de Transparência', value: '98,5%', target: '95%', status: 'OK' },
      { name: 'Projetos Finalizados', value: '47', target: '45', status: 'OK' },
    ],
    documentUrl: '/documentos/relatorio-transparencia-2025.pdf',
    isPublic: true,
    hash: 'sha256:ACCOUNT2025-RT-ISM',
  },
  {
    title: 'Prestação de Contas MJSP — OSCIP 2025',
    type: 'PRESTACAO_CONTAS',
    period: '2025',
    responsible: 'Diretoria Financeira',
    approvedBy: 'Conselho Fiscal',
    publishedAt: '2026-03-31',
    stakeholders: ['MJSP', 'CGU', 'TCU', 'Doadores públicos'],
    kpis: [
      { name: 'Despesas com Finalidade', value: '88,3%', target: '>=80%', status: 'OK' },
      { name: 'Superávit/Déficit', value: 'Superávit R$ 1,2M', target: 'Equilibrado', status: 'OK' },
      { name: 'Adimplência com Obrigações', value: '100%', target: '100%', status: 'OK' },
    ],
    documentUrl: '/documentos/prestacao-contas-mjsp-2025.pdf',
    isPublic: true,
    hash: 'sha256:ACCOUNT2025-PC-MJSP-ISM',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEIGCAPService = {

  // ── Governance Organs ────────────────────────────────────────────────────

  async getGovernanceOrgans(): Promise<GovernanceOrgan[]> {
    const q = query(collection(db, 'eigcap_organs'), orderBy('maturityScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const org of SEED_ORGANS) {
        await addDoc(collection(db, 'eigcap_organs'), { ...org, createdAt: serverTimestamp() });
      }
      return this.getGovernanceOrgans();
    }
    return snap.docs.map(d => mapDoc<GovernanceOrgan>(d));
  },

  // ── Policies ─────────────────────────────────────────────────────────────

  async getInstitutionalPolicies(): Promise<InstitutionalPolicy[]> {
    const q = query(collection(db, 'eigcap_policies'), orderBy('code'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const p of SEED_POLICIES) {
        await addDoc(collection(db, 'eigcap_policies'), { ...p, createdAt: serverTimestamp() });
      }
      return this.getInstitutionalPolicies();
    }
    return snap.docs.map(d => mapDoc<InstitutionalPolicy>(d));
  },

  async createPolicy(policy: Omit<InstitutionalPolicy, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'eigcap_policies'), { ...policy, createdAt: serverTimestamp() });
    return ref.id;
  },

  // ── Risks ────────────────────────────────────────────────────────────────

  async getInstitutionalRisks(): Promise<InstitutionalRisk[]> {
    const q = query(collection(db, 'eigcap_risks'), orderBy('riskScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const r of SEED_RISKS) {
        await addDoc(collection(db, 'eigcap_risks'), { ...r, createdAt: serverTimestamp() });
      }
      return this.getInstitutionalRisks();
    }
    return snap.docs.map(d => mapDoc<InstitutionalRisk>(d));
  },

  async updateRisk(id: string, data: Partial<InstitutionalRisk>): Promise<void> {
    await updateDoc(doc(db, 'eigcap_risks', id), { ...data });
  },

  // ── Compliance ───────────────────────────────────────────────────────────

  async getComplianceObligations(): Promise<ComplianceObligation[]> {
    const q = query(collection(db, 'eigcap_compliance'), orderBy('framework'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const c of SEED_COMPLIANCE) {
        await addDoc(collection(db, 'eigcap_compliance'), { ...c, createdAt: serverTimestamp() });
      }
      return this.getComplianceObligations();
    }
    return snap.docs.map(d => mapDoc<ComplianceObligation>(d));
  },

  // ── Controls ─────────────────────────────────────────────────────────────

  async getInternalControls(): Promise<InternalControl[]> {
    const q = query(collection(db, 'eigcap_controls'), orderBy('code'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const c of SEED_CONTROLS) {
        await addDoc(collection(db, 'eigcap_controls'), { ...c, createdAt: serverTimestamp() });
      }
      return this.getInternalControls();
    }
    return snap.docs.map(d => mapDoc<InternalControl>(d));
  },

  // ── Audits ───────────────────────────────────────────────────────────────

  async getInternalAudits(): Promise<InternalAudit[]> {
    const q = query(collection(db, 'eigcap_audits'), orderBy('code', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const a of SEED_AUDITS) {
        await addDoc(collection(db, 'eigcap_audits'), { ...a, createdAt: serverTimestamp() });
      }
      return this.getInternalAudits();
    }
    return snap.docs.map(d => mapDoc<InternalAudit>(d));
  },

  // ── Accountability ───────────────────────────────────────────────────────

  async getAccountabilityRecords(): Promise<AccountabilityRecord[]> {
    const q = query(collection(db, 'eigcap_accountability'), orderBy('publishedAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const a of SEED_ACCOUNTABILITY) {
        await addDoc(collection(db, 'eigcap_accountability'), { ...a, createdAt: serverTimestamp() });
      }
      return this.getAccountabilityRecords();
    }
    return snap.docs.map(d => mapDoc<AccountabilityRecord>(d));
  },

  // ── Dashboard KPIs ───────────────────────────────────────────────────────

  async getDashboardKPIs(): Promise<EIGCAPDashboardKPIs> {
    return {
      governanceMaturity:        97.4,
      complianceIndex:           98.1,
      risksMitigated:            94,
      activeControls:            87,
      auditsConcluded:           12,
      nonConformitiesTreated:    96,
      transparencyScore:         98.5,
      ethicsIndex:               99.2,
      totalOrgans:               SEED_ORGANS.length,
      totalPolicies:             SEED_POLICIES.length,
      totalRisks:                SEED_RISKS.length,
      totalObligations:          SEED_COMPLIANCE.length,
      totalControls:             SEED_CONTROLS.length,
      totalAudits:               SEED_AUDITS.length,
      totalAccountabilityRecords: SEED_ACCOUNTABILITY.length,
      aiRiskAlerts:              3,
      aiComplianceRecommendations: 7,
      globalGovernanceScore:     97.8,
      certificationDate:         '2026-07-22',
      certificationVersion:      'EIGCAP v1.0 — Prompt 065',
    };
  },

  // ── AI Governance Intelligence ────────────────────────────────────────────

  async getAIGovernanceRecommendations() {
    return [
      {
        id: 'AI-GOV-001',
        type: 'RISCO_EMERGENTE',
        title: 'Risco de Concentração em Modelo de Linguagem (LLM)',
        description: 'Identificada dependência excessiva em um único provedor de LLM para decisões assistidas. Recomenda-se estratégia multi-LLM.',
        confidence: 91,
        priority: 'ALTA',
        action: 'Implementar fallback para segundo provedor LLM; documentar critérios de uso.',
        deadline: '2026-10-01',
      },
      {
        id: 'AI-GOV-002',
        type: 'NAO_CONFORMIDADE',
        title: 'Explicabilidade de Modelos Preditivos — ISO 42001',
        description: 'Modelos de predição de inadimplência e evasão carecem de documentação de explicabilidade conforme ISO 42001.',
        confidence: 96,
        priority: 'MEDIA',
        action: 'Integrar SHAP/LIME aos modelos existentes; publicar fichas de modelo.',
        deadline: '2026-12-01',
      },
      {
        id: 'AI-GOV-003',
        type: 'RECOMENDACAO_CONTROLE',
        title: 'Automação do Monitoramento de Compliance LGPD',
        description: 'Pipeline de verificação automática de consentimentos pode ser expandido para incluir verificação de retenção por finalidade.',
        confidence: 88,
        priority: 'BAIXA',
        action: 'Expandir pipeline Firestore para incluir regras de retenção automatizadas por coleção.',
        deadline: '2027-03-01',
      },
    ];
  },
};
