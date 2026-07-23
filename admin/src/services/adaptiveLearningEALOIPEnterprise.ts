/**
 * adaptiveLearningEALOIPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Adaptive Learning & Organizational Intelligence Platform
 * Instituto Ser Melhor — Prompt 067 — Plataforma ISM v2.0
 *
 * Padrões: ISO 30401, ISO 9001, ISO 42001, COBIT 2019, TOGAF,
 *          Learning Organizations (Peter Senge), DAMA-DMBOK2, Zero Trust
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, doc, addDoc, updateDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type LessonOrigin =
  | 'PROJETO_ENCERRADO' | 'AUDITORIA' | 'INCIDENTE' | 'NAO_CONFORMIDADE'
  | 'FEEDBACK_BENEFICIARIO' | 'FEEDBACK_PROFISSIONAL' | 'PESQUISA_SATISFACAO'
  | 'REVISAO_PROCESSO' | 'DECISAO_ESTRATEGICA' | 'AVALIACAO_IMPACTO';

export type LessonType = 'SUCESSO' | 'FALHA' | 'RISCO_EVITADO' | 'BOA_PRATICA' | 'OPORTUNIDADE_PERDIDA';
export type ImprovementStatus = 'IDENTIFICADA' | 'EM_ANALISE' | 'APROVADA' | 'EM_IMPLEMENTACAO' | 'CONCLUIDA' | 'CANCELADA';
export type RootCauseMethod = 'CINCO_PORQUES' | 'ISHIKAWA' | 'FMEA' | 'PARETO' | 'ANALISE_SISTEMICA';
export type FeedbackSource = 'BENEFICIARIO' | 'PROFISSIONAL' | 'VOLUNTARIO' | 'GESTOR' | 'CONSELHO' | 'AUDITORIA' | 'SISTEMA';
export type LearningDomain =
  | 'GOVERNANCA' | 'OPERACIONAL' | 'FINANCEIRO' | 'TECNOLOGICO'
  | 'PROGRAMAS_SOCIAIS' | 'RH' | 'COMPLIANCE' | 'IA' | 'INFRAESTRUTURA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface LessonLearned {
  id: string;
  title: string;
  type: LessonType;
  origin: LessonOrigin;
  domain: LearningDomain;
  description: string;
  context: string;
  evidences: string[];
  responsible: string;
  results: string;
  recommendations: string[];
  relatedModules: string[];
  reuseCount: number;
  impactScore: number;         // 0–100
  criticality: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  recurrence: number;          // vezes que padrão foi identificado
  applicability: 'UNIVERSAL' | 'DEPARTAMENTAL' | 'PONTUAL';
  tags: string[];
  isValidated: boolean;
  createdAt?: unknown;
}

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  justification: string;
  category: 'PROCESSO' | 'TECNOLOGIA' | 'PESSOAS' | 'GOVERNANCA' | 'PRODUTO';
  status: ImprovementStatus;
  priority: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  expectedImpact: string;
  effortEstimate: 'ALTO' | 'MEDIO' | 'BAIXO';
  responsible: string;
  deadline: string;
  relatedLessons: string[];
  kpiImpact: { kpi: string; currentValue: number; expectedValue: number; unit: string }[];
  completionPercent: number;
  aiRecommended: boolean;
  createdAt?: unknown;
}

export interface RootCauseAnalysis {
  id: string;
  title: string;
  method: RootCauseMethod;
  problem: string;
  domain: LearningDomain;
  occurredAt: string;
  impact: string;
  rootCauses: { cause: string; level: number; evidence: string }[];
  contributingFactors: string[];
  correctiveActions: { action: string; responsible: string; deadline: string; status: string }[];
  preventiveActions: { action: string; responsible: string; deadline: string }[];
  conclusion: string;
  recurrenceRisk: 'ALTO' | 'MEDIO' | 'BAIXO';
  closedAt?: string;
  createdAt?: unknown;
}

export interface FeedbackEntry {
  id: string;
  source: FeedbackSource;
  subject: string;
  content: string;
  sentiment: 'MUITO_POSITIVO' | 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | 'MUITO_NEGATIVO';
  sentimentScore: number;   // -100 a +100
  domain: LearningDomain;
  relatedModule: string;
  hasGeneratedImprovement: boolean;
  improvementId?: string;
  isAnonymized: boolean;
  collectedAt: string;
  createdAt?: unknown;
}

export interface LearningPattern {
  id: string;
  title: string;
  description: string;
  domain: LearningDomain;
  frequency: number;         // ocorrências identificadas
  firstDetected: string;
  lastDetected: string;
  trend: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  impact: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  aiConfidence: number;      // 0–100
  relatedLessons: string[];
  suggestedActions: string[];
  isAddressed: boolean;
}

export interface EALOIPDashboardKPIs {
  // Learning
  totalLessons: number;
  lessonsValidated: number;
  reuseRate: number;           // %
  avgImpactScore: number;
  // Improvement
  improvementsTotal: number;
  improvementsConcluded: number;
  improvementsInProgress: number;
  avgImplementationDays: number;
  // Feedback
  totalFeedback: number;
  avgSentimentScore: number;
  feedbackToImprovementRate: number;
  // Root Cause
  rcaTotal: number;
  rcaOpen: number;
  recurrenceReduction: number;  // %
  // AI
  aiRecommendations: number;
  aiPatternsDetected: number;
  aiAccuracy: number;
  // Maturity
  maturityScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_LESSONS: Omit<LessonLearned, 'id' | 'createdAt'>[] = [
  {
    title: 'Integração EHR com CRM reduziu 34% das duplicações de cadastro',
    type: 'SUCESSO',
    origin: 'PROJETO_ENCERRADO',
    domain: 'TECNOLOGICO',
    description: 'A implementação da integração bidirecional entre o módulo EHR Enterprise e o CRM de beneficiários eliminou cadastros duplicados e reduziu o tempo de onboarding de novos beneficiários de 12 para 4 minutos.',
    context: 'Projeto de integração de dados — Q1/2026. Descoberto durante auditoria de qualidade de dados.',
    evidences: ['Relatório de qualidade de dados Q1/2026', 'Métricas de onboarding', 'Log de duplicações antes/depois'],
    responsible: 'CTO + Arquitetura Enterprise',
    results: 'Redução de 34% em duplicações, economia de 8h/semana da equipe administrativa, NPS interno +12 pts.',
    recommendations: [
      'Aplicar padrão de integração bidirecional a todos os módulos com cadastro de pessoas',
      'Documentar o padrão de deduplicação como ADR oficial',
      'Treinar equipe de dados no protocolo de qualidade adotado',
    ],
    relatedModules: ['EHR Enterprise', 'CRM Enterprise', 'Beneficiary Platform'],
    reuseCount: 3,
    impactScore: 88,
    criticality: 'ALTA',
    recurrence: 1,
    applicability: 'UNIVERSAL',
    tags: ['integração', 'qualidade-dados', 'CRM', 'EHR', 'deduplicação'],
    isValidated: true,
  },
  {
    title: 'Auditoria LGPD identificou coleta excessiva de dados em formulário de triagem',
    type: 'NAO_CONFORMIDADE' as LessonType,
    origin: 'AUDITORIA',
    domain: 'COMPLIANCE',
    description: 'Auditoria de conformidade LGPD (2025-Q4) identificou que o formulário de triagem de saúde coletava 7 campos sensíveis desnecessários, sem base legal clara, violando os princípios de minimização de dados (Art. 6º, III).',
    context: 'Auditoria interna anual de compliance — Novembro/2025. Detectado pelo Comitê de Privacidade.',
    evidences: ['Relatório de auditoria LGPD-2025-Q4', 'Mapeamento de campos do formulário', 'Parecer jurídico #047/2025'],
    responsible: 'DPO + Equipe de Compliance',
    results: 'Formulário revisado em 15 dias, 7 campos removidos, conformidade LGPD Art.6 restaurada, multa evitada (estimada em R$ 800k).',
    recommendations: [
      'Implementar revisão obrigatória de privacidade (Privacy by Design) em todo novo formulário',
      'Criar checklist LGPD para aprovação de formulários antes do deploy',
      'Treinar equipes de desenvolvimento em minimização de dados',
    ],
    relatedModules: ['EHR Enterprise', 'EIGCAP', 'Compliance & Riscos'],
    reuseCount: 5,
    impactScore: 95,
    criticality: 'CRITICA',
    recurrence: 2,
    applicability: 'UNIVERSAL',
    tags: ['LGPD', 'privacidade', 'formulário', 'compliance', 'multa-evitada'],
    isValidated: true,
  },
  {
    title: 'Programa de capacitação de voluntários aumentou retenção em 28%',
    type: 'SUCESSO',
    origin: 'AVALIACAO_IMPACTO',
    domain: 'PROGRAMAS_SOCIAIS',
    description: 'A estruturação de um programa formal de onboarding e capacitação de voluntários (40h) elevou a taxa de retenção de 12 meses de 54% para 82%, reduzindo o custo de recrutamento e o tempo de adaptação.',
    context: 'Avaliação de impacto do programa de voluntariado — Junho/2026. Dados do ESIIMP e do RH.',
    evidences: ['Relatório ESIIMP Voluntariado 2026', 'Dados de retenção RH', 'Pesquisa de satisfação voluntários'],
    responsible: 'Coordenação de Voluntariado + CLO',
    results: '+28% retenção 12 meses, economia de R$ 180k/ano em recrutamento, satisfação dos voluntários: 4.8/5.',
    recommendations: [
      'Replicar o modelo de onboarding estruturado para profissionais contratados',
      'Integrar o programa ao IKCIP como trilha de conhecimento oficial',
      'Medir impacto anual e ajustar a cada ciclo com base nos feedbacks',
    ],
    relatedModules: ['RH Enterprise', 'IKCIP', 'ESIIMP', 'Programas Sociais'],
    reuseCount: 2,
    impactScore: 82,
    criticality: 'ALTA',
    recurrence: 1,
    applicability: 'DEPARTAMENTAL',
    tags: ['voluntários', 'retenção', 'capacitação', 'onboarding', 'impacto-social'],
    isValidated: true,
  },
  {
    title: 'Incidente de indisponibilidade de banco de dados causado por query sem índice',
    type: 'FALHA',
    origin: 'INCIDENTE',
    domain: 'TECNOLOGICO',
    description: 'Incidente P1 de 47 minutos de indisponibilidade parcial do Firestore causado por query full-collection-scan em produção sem índice composto, disparado por release não testada em ambiente de staging.',
    context: 'Incidente #ISM-INC-2026-0041 — 15/03/2026 03:12 UTC. Detectado pelo SRE Command Center.',
    evidences: ['Post-mortem ISM-INC-2026-0041', 'Log de queries Firestore', 'Timeline de alertas'],
    responsible: 'SRE Team + CTO',
    results: '47 min de indisponibilidade, 284 usuários impactados, MTTD 8min, MTTR 39min. Índice criado e processo de review atualizado.',
    recommendations: [
      'Implementar obrigatoriedade de revisão de queries no code review',
      'Adicionar análise automática de explain plan no CI/CD pipeline',
      'Bloquear deploy em produção sem aprovação de índices Firestore',
    ],
    relatedModules: ['DevSecOps SRE', 'Command Center', 'Cloud Infrastructure'],
    reuseCount: 4,
    impactScore: 91,
    criticality: 'CRITICA',
    recurrence: 1,
    applicability: 'UNIVERSAL',
    tags: ['incidente', 'Firestore', 'query', 'índice', 'SRE', 'P1', 'post-mortem'],
    isValidated: true,
  },
  {
    title: 'Decisão de migrar de REST para GraphQL nas integrações externas',
    type: 'SUCESSO',
    origin: 'DECISAO_ESTRATEGICA',
    domain: 'TECNOLOGICO',
    description: 'A migração das APIs de integração com parceiros externos para GraphQL (Federation v2) reduziu o overfetching em 62%, melhorou a performance das queries em 44% e eliminou a necessidade de 3 endpoints redundantes.',
    context: 'Decisão arquitetural — Enterprise API Integration Architecture Review — Q2/2026.',
    evidences: ['ADR-042: GraphQL Federation v2', 'Benchmark de performance antes/depois', 'Relatório de integrações Q2/2026'],
    responsible: 'Chief Enterprise Architect (CEA)',
    results: '-62% overfetching, +44% performance, -3 endpoints redundantes, redução de R$ 12k/mês em custo de cloud.',
    recommendations: [
      'Adotar GraphQL Federation como padrão para todas as APIs de integração B2B',
      'Documentar o padrão no Enterprise Architecture Office',
      'Avaliar migração das APIs internas nos próximos 2 trimestres',
    ],
    relatedModules: ['Enterprise Integration', 'API Gateway', 'Enterprise Architecture Office'],
    reuseCount: 2,
    impactScore: 79,
    criticality: 'ALTA',
    recurrence: 1,
    applicability: 'UNIVERSAL',
    tags: ['GraphQL', 'API', 'arquitetura', 'performance', 'integração'],
    isValidated: true,
  },
  {
    title: 'Modelo preditivo de demanda subestimou pico sazonal de dezembro em 18%',
    type: 'OPORTUNIDADE_PERDIDA' as LessonType,
    origin: 'AVALIACAO_IMPACTO',
    domain: 'IA',
    description: 'O modelo SARIMA de previsão de demanda por atendimentos não capturou adequadamente o pico de doenças respiratórias de dezembro/2025, gerando fila de espera de 3.400 pessoas por 11 dias.',
    context: 'Avaliação pós-período — Janeiro/2026. Detectado pela análise do ECDTISP.',
    evidences: ['Relatório BI Q4/2025', 'Log de filas de espera', 'Análise de erro do modelo SARIMA'],
    responsible: 'CAIO + Data Science Team',
    results: '3.400 beneficiários em lista de espera, 11 dias de backlog, 780 atendimentos reagendados. Modelo recalibrado com variáveis epidemiológicas externas.',
    recommendations: [
      'Incluir dados externos de vigilância epidemiológica (SINAN/SVS) no modelo de demanda',
      'Implementar janela deslizante de retrain mensal em vez de trimestral',
      'Criar alertas automáticos de drift quando erro MAPE > 8%',
    ],
    relatedModules: ['AI Core Platform', 'ECDTISP', 'BI Analytics', 'EHR Enterprise'],
    reuseCount: 1,
    impactScore: 86,
    criticality: 'ALTA',
    recurrence: 1,
    applicability: 'DEPARTAMENTAL',
    tags: ['IA', 'modelo-preditivo', 'demanda', 'sazonalidade', 'drift', 'SARIMA'],
    isValidated: true,
  },
];

const SEED_IMPROVEMENTS: Omit<ImprovementItem, 'id' | 'createdAt'>[] = [
  {
    title: 'Implementar Privacy by Design em todos os formulários da plataforma',
    description: 'Criar checklist automatizado de conformidade LGPD integrado ao CI/CD para validação obrigatória antes do deploy de qualquer formulário.',
    justification: 'Lição aprendida #LGPD-2025: coleta excessiva de dados em formulário de triagem resultou em não conformidade. Risco de multa de até R$ 50M (2% do faturamento, LGPD Art. 52).',
    category: 'TECNOLOGIA',
    status: 'EM_IMPLEMENTACAO',
    priority: 'CRITICA',
    expectedImpact: 'Eliminação de não conformidades LGPD em formulários, redução de risco regulatório de R$ 50M.',
    effortEstimate: 'MEDIO',
    responsible: 'CTO + DPO',
    deadline: '2026-09-30',
    relatedLessons: ['Auditoria LGPD 2025-Q4'],
    kpiImpact: [
      { kpi: 'Índice de Compliance LGPD', currentValue: 94.2, expectedValue: 99.8, unit: '%' },
      { kpi: 'Risco Regulatório', currentValue: 35, expectedValue: 5, unit: 'pts' },
    ],
    completionPercent: 45,
    aiRecommended: true,
  },
  {
    title: 'Automação de análise de índices Firestore no pipeline CI/CD',
    description: 'Integrar análise estática de queries Firestore ao pipeline de CI/CD com bloqueio automático de merges sem índices declarados.',
    justification: 'Incidente P1 de 47 min causado por query sem índice em produção. MTTD 8min, MTTR 39min, 284 usuários impactados.',
    category: 'TECNOLOGIA',
    status: 'CONCLUIDA',
    priority: 'CRITICA',
    expectedImpact: 'Eliminação de incidentes por query sem índice, redução MTTR em 70%.',
    effortEstimate: 'BAIXO',
    responsible: 'SRE Team',
    deadline: '2026-05-15',
    relatedLessons: ['Incidente Firestore ISM-INC-2026-0041'],
    kpiImpact: [
      { kpi: 'MTTR P1', currentValue: 39, expectedValue: 12, unit: 'min' },
      { kpi: 'Incidentes por query', currentValue: 4, expectedValue: 0, unit: 'por trimestre' },
    ],
    completionPercent: 100,
    aiRecommended: false,
  },
  {
    title: 'Incluir dados epidemiológicos externos no modelo de previsão de demanda',
    description: 'Integrar dados do SINAN/SVS (Sistema de Informação de Agravos de Notificação) como variável exógena no modelo SARIMA + LSTM de previsão de demanda.',
    justification: 'Modelo subestimou pico de dezembro em 18%, gerando fila de 3.400 beneficiários por 11 dias. Dados epidemiológicos externos não eram considerados.',
    category: 'TECNOLOGIA',
    status: 'APROVADA',
    priority: 'ALTA',
    expectedImpact: 'Redução do MAPE de 4.8% para < 3.0%, eliminação de subestimações sazonais críticas.',
    effortEstimate: 'MEDIO',
    responsible: 'CAIO + Data Science',
    deadline: '2026-10-31',
    relatedLessons: ['Modelo preditivo subestimou pico dezembro'],
    kpiImpact: [
      { kpi: 'MAPE Modelo Demanda', currentValue: 4.8, expectedValue: 2.8, unit: '%' },
      { kpi: 'Acurácia Pico Sazonal', currentValue: 82, expectedValue: 97, unit: '%' },
    ],
    completionPercent: 15,
    aiRecommended: true,
  },
  {
    title: 'Programa de onboarding estruturado para profissionais contratados',
    description: 'Replicar o modelo de onboarding de voluntários (40h, retenção +28%) para profissionais contratados, com trilha na plataforma IKCIP.',
    justification: 'Boa prática identificada: onboarding de voluntários elevou retenção de 54% para 82%. Profissionais contratados têm turnover de 18%/ano (acima da média setorial de 12%).',
    category: 'PESSOAS',
    status: 'EM_ANALISE',
    priority: 'ALTA',
    expectedImpact: 'Redução de turnover de 18% para < 12%, economia de R$ 240k/ano em recrutamento.',
    effortEstimate: 'MEDIO',
    responsible: 'RH + CLO',
    deadline: '2026-12-31',
    relatedLessons: ['Programa de capacitação de voluntários'],
    kpiImpact: [
      { kpi: 'Turnover de Profissionais', currentValue: 18, expectedValue: 11, unit: '%/ano' },
      { kpi: 'Custo de Recrutamento', currentValue: 320000, expectedValue: 180000, unit: 'R$/ano' },
    ],
    completionPercent: 0,
    aiRecommended: true,
  },
];

const SEED_RCA: Omit<RootCauseAnalysis, 'id' | 'createdAt'>[] = [
  {
    title: 'RCA: Indisponibilidade Firestore — ISM-INC-2026-0041',
    method: 'CINCO_PORQUES',
    problem: '47 minutos de indisponibilidade parcial da plataforma causada por query sem índice em produção.',
    domain: 'TECNOLOGICO',
    occurredAt: '2026-03-15T03:12:00Z',
    impact: '284 usuários impactados, 47 min de indisponibilidade, 12 atendimentos perdidos.',
    rootCauses: [
      { cause: 'Query Firestore full-collection-scan disparada em produção', level: 1, evidence: 'Log de auditoria Firestore 15/03/2026' },
      { cause: 'Índice composto não declarado para o campo combination usado na query', level: 2, evidence: 'Análise do índice no Console GCP' },
      { cause: 'Release não passou por ambiente de staging com volume de dados realístico', level: 3, evidence: 'Pipeline CI/CD logs — branch skipstaging' },
      { cause: 'Processo de code review não incluía verificação de plano de query', level: 4, evidence: 'Checklist de PR — ausência de item de query review' },
      { cause: 'Ausência de automação de análise de índices no pipeline', level: 5, evidence: 'Configuração do GitHub Actions — sem step de query analysis' },
    ],
    contributingFactors: [
      'Pressão de prazo levou ao uso de flag "--skip-staging"',
      'Dados de staging 100x menores que produção (não representativos)',
      'Alertas de performance GCP não configurados para threshold adequado',
    ],
    correctiveActions: [
      { action: 'Criar índice composto para a query problemática', responsible: 'SRE Team', deadline: '2026-03-15', status: 'CONCLUIDO' },
      { action: 'Remover a flag "--skip-staging" do pipeline', responsible: 'DevOps', deadline: '2026-03-16', status: 'CONCLUIDO' },
      { action: 'Configurar alertas GCP para query latency > 2s', responsible: 'SRE Team', deadline: '2026-03-20', status: 'CONCLUIDO' },
    ],
    preventiveActions: [
      { action: 'Implementar step obrigatório de query analysis no CI/CD', responsible: 'CTO', deadline: '2026-05-15' },
      { action: 'Elevar volume de dados de staging para 30% da produção', responsible: 'DevOps', deadline: '2026-06-30' },
      { action: 'Incluir revisão de índices como critério obrigatório no code review', responsible: 'Tech Leads', deadline: '2026-04-30' },
    ],
    conclusion: 'Causa-raiz: ausência de automação de análise de índices no pipeline CI/CD. Fator principal: pressão de prazo levou a bypasses de processo. Ação estrutural: automação implementada, impossibilitando bypasses futuros.',
    recurrenceRisk: 'BAIXO',
    closedAt: '2026-05-20',
  },
  {
    title: 'RCA: Coleta Excessiva de Dados Sensíveis — Formulário de Triagem',
    method: 'ISHIKAWA',
    problem: 'Formulário de triagem de saúde coletava 7 campos sensíveis desnecessários sem base legal LGPD.',
    domain: 'COMPLIANCE',
    occurredAt: '2025-11-10T00:00:00Z',
    impact: 'Não conformidade LGPD Art. 6º, risco de multa R$ 800k, exposição de dados sensíveis de 12.400 beneficiários.',
    rootCauses: [
      { cause: 'Formulário desenvolvido sem revisão de privacidade (Privacy by Design)', level: 1, evidence: 'Ausência de evidência de revisão de privacidade no PR #2847' },
      { cause: 'Processo de desenvolvimento não incluía checklist de minimização de dados', level: 2, evidence: 'Template de PR sem campo de revisão LGPD' },
      { cause: 'Treinamento de equipe de desenvolvimento em LGPD desatualizado (2022)', level: 3, evidence: 'Registros de treinamento RH' },
      { cause: 'DPO não estava no fluxo de aprovação de formulários com dados sensíveis', level: 4, evidence: 'Fluxo de aprovação de releases — ausência do DPO' },
    ],
    contributingFactors: [
      'Formulário copiado de versão anterior sem revisão crítica dos campos',
      'Urgência do projeto de triagem digital reduziu tempo de revisão',
      'Indefinição sobre quais campos eram "necessários" vs. "convenientes"',
    ],
    correctiveActions: [
      { action: 'Remover os 7 campos sensíveis do formulário', responsible: 'Equipe de Desenvolvimento', deadline: '2025-11-25', status: 'CONCLUIDO' },
      { action: 'Documentar base legal para cada campo remanescente', responsible: 'DPO', deadline: '2025-12-15', status: 'CONCLUIDO' },
      { action: 'Notificar titulares conforme Art. 48 LGPD', responsible: 'DPO + Jurídico', deadline: '2025-12-01', status: 'CONCLUIDO' },
    ],
    preventiveActions: [
      { action: 'Implementar checklist Privacy by Design no processo de desenvolvimento', responsible: 'CTO + DPO', deadline: '2026-03-31' },
      { action: 'Adicionar DPO como aprovador obrigatório de formulários com dados sensíveis', responsible: 'Processo de Governance', deadline: '2026-02-28' },
      { action: 'Atualizar treinamento LGPD da equipe — ciclo anual obrigatório', responsible: 'RH + DPO', deadline: '2026-02-28' },
    ],
    conclusion: 'Causa-raiz: ausência de processo sistemático de revisão de privacidade no desenvolvimento. Fator de Método: processo sem etapa de Privacy by Design. Ação estrutural: checklist automatizado implementado no CI/CD.',
    recurrenceRisk: 'MEDIO',
  },
];

const SEED_FEEDBACKS: Omit<FeedbackEntry, 'id' | 'createdAt'>[] = [
  { source: 'BENEFICIARIO', subject: 'Tempo de espera na triagem digital', content: 'O formulário de triagem ficou muito mais rápido depois da última atualização. Antes demorava mais de 15 minutos, agora levo menos de 5. Parabéns!', sentiment: 'MUITO_POSITIVO', sentimentScore: 88, domain: 'PROGRAMAS_SOCIAIS', relatedModule: 'EHR Enterprise', hasGeneratedImprovement: false, isAnonymized: true, collectedAt: '2026-07-10' },
  { source: 'PROFISSIONAL', subject: 'Falta de integração entre agenda e prontuário', content: 'Ainda preciso acessar dois sistemas separados para ver o histórico do paciente e a agenda. Uma integração nativa economizaria pelo menos 20 minutos por turno.', sentiment: 'NEGATIVO', sentimentScore: -42, domain: 'TECNOLOGICO', relatedModule: 'EHR + Agenda', hasGeneratedImprovement: true, improvementId: 'IMP-EHR-AGENDA-001', isAnonymized: false, collectedAt: '2026-07-08' },
  { source: 'GESTOR', subject: 'Dashboards de impacto social muito completos', content: 'O ESIIMP ficou muito além das expectativas. Consigo apresentar para os doadores dados de impacto em tempo real com visualizações que impressionam. Isso ajudou a fechar 2 novos convênios.', sentiment: 'MUITO_POSITIVO', sentimentScore: 95, domain: 'PROGRAMAS_SOCIAIS', relatedModule: 'ESIIMP', hasGeneratedImprovement: false, isAnonymized: false, collectedAt: '2026-07-05' },
  { source: 'VOLUNTARIO', subject: 'Dificuldade de acesso no mobile', content: 'A plataforma é ótima no computador, mas no celular alguns menus ficam cortados e é difícil registrar atendimentos. Seria incrível ter um app mobile ou a versão mobile otimizada.', sentiment: 'NEUTRO', sentimentScore: -8, domain: 'TECNOLOGICO', relatedModule: 'Portal do Voluntário', hasGeneratedImprovement: true, improvementId: 'IMP-MOBILE-001', isAnonymized: true, collectedAt: '2026-07-12' },
  { source: 'CONSELHO', subject: 'Relatório de governança EIGCAP excelente', content: 'O relatório automático do EIGCAP para o Conselho Deliberativo eliminou 3 reuniões de prestação de contas. Os dados chegam estruturados e auditáveis. Aprovamos a manutenção do modelo.', sentiment: 'MUITO_POSITIVO', sentimentScore: 91, domain: 'GOVERNANCA', relatedModule: 'EIGCAP', hasGeneratedImprovement: false, isAnonymized: false, collectedAt: '2026-07-01' },
  { source: 'AUDITORIA', subject: 'Processo de aprovação de despesas sem dupla validação', content: 'Auditoria interna identificou que despesas entre R$ 5.000 e R$ 10.000 são aprovadas com assinatura única da coordenação. Recomenda-se implementar dupla aprovação para este intervalo.', sentiment: 'NEGATIVO', sentimentScore: -55, domain: 'FINANCEIRO', relatedModule: 'Financial Enterprise', hasGeneratedImprovement: true, improvementId: 'IMP-FIN-DUPLA-001', isAnonymized: false, collectedAt: '2026-06-20' },
];

const SEED_PATTERNS: LearningPattern[] = [
  { id: 'PAT-001', title: 'Formulários sem revisão de privacidade causam não conformidades LGPD', description: 'Em 3 das 5 auditorias dos últimos 18 meses, foram identificadas coletas de dados além do mínimo necessário em formulários desenvolvidos sem checklist de Privacy by Design.', domain: 'COMPLIANCE', frequency: 3, firstDetected: '2024-06-01', lastDetected: '2025-11-10', trend: 'DECRESCENTE', impact: 'CRITICO', aiConfidence: 94, relatedLessons: ['Auditoria LGPD 2025-Q4'], suggestedActions: ['Implementar Privacy by Design no pipeline CI/CD', 'Treinar equipe anualmente em LGPD'], isAddressed: true },
  { id: 'PAT-002', title: 'Queries sem índice em produção causam degradação periódica de performance', description: 'Identificado padrão recorrente de degradação de performance por queries sem índice após releases. Ocorreu 4 vezes nos últimos 12 meses.', domain: 'TECNOLOGICO', frequency: 4, firstDetected: '2025-01-15', lastDetected: '2026-03-15', trend: 'DECRESCENTE', impact: 'CRITICO', aiConfidence: 97, relatedLessons: ['Incidente Firestore ISM-INC-2026-0041'], suggestedActions: ['Automação de análise de índices no CI/CD', 'Staging com volume representativo'], isAddressed: true },
  { id: 'PAT-003', title: 'Modelos de IA sem dados sazonais externos subestimam picos de demanda', description: 'Modelos preditivos baseados apenas em dados históricos internos subestimam picos de demanda sazonais relacionados a eventos epidemiológicos externos.', domain: 'IA', frequency: 2, firstDetected: '2024-12-01', lastDetected: '2025-12-01', trend: 'ESTAVEL', impact: 'ALTO', aiConfidence: 89, relatedLessons: ['Modelo preditivo subestimou pico dezembro'], suggestedActions: ['Integrar fontes externas (SINAN/SVS)', 'Retrain mensal com janela deslizante'], isAddressed: false },
  { id: 'PAT-004', title: 'Programas com onboarding estruturado apresentam retenção 2× superior', description: 'Comparação entre programas com onboarding formal (40h+) e informais revela consistentemente retenção 1.8 a 2.4× superior no grupo com onboarding estruturado.', domain: 'RH', frequency: 2, firstDetected: '2025-06-01', lastDetected: '2026-06-01', trend: 'ESTAVEL', impact: 'ALTO', aiConfidence: 86, relatedLessons: ['Programa capacitação voluntários'], suggestedActions: ['Padronizar onboarding formal para todos os públicos', 'Integrar trilhas ao IKCIP'], isAddressed: false },
];

// ── Helper ────────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEALOIPService = {

  async getLessonsLearned(): Promise<LessonLearned[]> {
    const q = query(collection(db, 'ealoip_lessons'), orderBy('impactScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const l of SEED_LESSONS) {
        await addDoc(collection(db, 'ealoip_lessons'), { ...l, createdAt: serverTimestamp() });
      }
      return this.getLessonsLearned();
    }
    return snap.docs.map(d => mapDoc<LessonLearned>(d));
  },

  async getImprovements(): Promise<ImprovementItem[]> {
    const q = query(collection(db, 'ealoip_improvements'), orderBy('completionPercent', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const i of SEED_IMPROVEMENTS) {
        await addDoc(collection(db, 'ealoip_improvements'), { ...i, createdAt: serverTimestamp() });
      }
      return this.getImprovements();
    }
    return snap.docs.map(d => mapDoc<ImprovementItem>(d));
  },

  async getRootCauseAnalyses(): Promise<RootCauseAnalysis[]> {
    const q = query(collection(db, 'ealoip_rca'), orderBy('occurredAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const r of SEED_RCA) {
        await addDoc(collection(db, 'ealoip_rca'), { ...r, createdAt: serverTimestamp() });
      }
      return this.getRootCauseAnalyses();
    }
    return snap.docs.map(d => mapDoc<RootCauseAnalysis>(d));
  },

  async getFeedbacks(): Promise<FeedbackEntry[]> {
    const q = query(collection(db, 'ealoip_feedbacks'), orderBy('collectedAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const f of SEED_FEEDBACKS) {
        await addDoc(collection(db, 'ealoip_feedbacks'), { ...f, createdAt: serverTimestamp() });
      }
      return this.getFeedbacks();
    }
    return snap.docs.map(d => mapDoc<FeedbackEntry>(d));
  },

  async getPatterns(): Promise<LearningPattern[]> {
    return SEED_PATTERNS;
  },

  async getDashboardKPIs(): Promise<EALOIPDashboardKPIs> {
    return {
      totalLessons: 6,
      lessonsValidated: 6,
      reuseRate: 58.3,
      avgImpactScore: 86.8,
      improvementsTotal: 4,
      improvementsConcluded: 1,
      improvementsInProgress: 1,
      avgImplementationDays: 47,
      totalFeedback: 6,
      avgSentimentScore: 44.8,
      feedbackToImprovementRate: 50,
      rcaTotal: 2,
      rcaOpen: 1,
      recurrenceReduction: 62,
      aiRecommendations: 3,
      aiPatternsDetected: 4,
      aiAccuracy: 91.5,
      maturityScore: 93.2,
      certificationDate: '2026-07-22',
      certificationVersion: 'EALOIP v1.0 — Prompt 067',
    };
  },

  async updateImprovementStatus(id: string, status: ImprovementStatus): Promise<void> {
    await updateDoc(doc(db, 'ealoip_improvements', id), { status });
  },
};
