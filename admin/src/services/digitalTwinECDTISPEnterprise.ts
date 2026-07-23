/**
 * digitalTwinECDTISPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Digital Twin & Institutional Simulation Platform
 * Instituto Ser Melhor — Prompt 066 — Plataforma ISM v2.0
 *
 * Padrões: TOGAF, ISO 42001, COBIT 2019, NIST AI RMF, System Dynamics,
 *          Complex Adaptive Systems, Decision Intelligence, Zero Trust
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, doc, addDoc, updateDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type TwinEntityType =
  | 'UNIDADE_ORGANIZACIONAL'
  | 'PROCESSO'
  | 'PROGRAMA_SOCIAL'
  | 'PROJETO'
  | 'EQUIPE'
  | 'ATIVO_FINANCEIRO'
  | 'INFRAESTRUTURA_TI'
  | 'MODELO_IA'
  | 'INDICADOR_KPI'
  | 'RISCO'
  | 'BENEFICIARIO_GRUPO'
  | 'CADEIA_DECISAO';

export type SyncStatus = 'SINCRONIZADO' | 'PENDENTE' | 'ERRO' | 'DESATUALIZADO';
export type SyncFrequency = 'TEMPO_REAL' | 'A_CADA_5MIN' | 'HORARIO' | 'DIARIO' | 'SEMANAL';
export type ScenarioType = 'ATUAL' | 'OTIMISTA' | 'CONSERVADOR' | 'CRITICO' | 'PERSONALIZADO';
export type ModelType = 'SERIES_TEMPORAL' | 'REGRESSAO' | 'CLASSIFICACAO' | 'SIMULACAO_MONTECARLO' | 'SYSTEM_DYNAMICS' | 'REDES_NEURAIS';
export type DecisionCategory = 'ESTRATEGICA' | 'OPERACIONAL' | 'FINANCEIRA' | 'RECURSOS_HUMANOS' | 'TECNOLOGICA' | 'PROGRAMATICA';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TwinEntity {
  id: string;
  name: string;
  type: TwinEntityType;
  description: string;
  dataSource: string;           // módulo de origem
  syncFrequency: SyncFrequency;
  syncStatus: SyncStatus;
  lastSync: string;
  responsible: string;
  criticality: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  currentState: Record<string, number | string | boolean>;
  relatedEntities: string[];
  relatedKPIs: string[];
  coverageScore: number;        // 0–100
  fidelityScore: number;        // 0–100 — precisão da representação
  createdAt?: unknown;
}

export interface SimulationScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  premises: string[];
  variables: {
    name: string;
    baseline: number;
    simulated: number;
    unit: string;
    delta: number;
    deltaPercent: number;
  }[];
  impactAreas: {
    area: string;
    impact: 'MUITO_POSITIVO' | 'POSITIVO' | 'NEUTRO' | 'NEGATIVO' | 'MUITO_NEGATIVO';
    magnitude: number;   // 0–100
    description: string;
  }[];
  projectedKPIs: {
    kpi: string;
    currentValue: number;
    projectedValue: number;
    unit: string;
    confidenceInterval: { low: number; high: number };
    trend: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  }[];
  overallImpactScore: number;  // -100 a +100
  riskLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  horizon: '3_MESES' | '6_MESES' | '1_ANO' | '3_ANOS' | '5_ANOS';
  createdBy: string;
  createdAt?: unknown;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: ModelType;
  target: string;               // o que prediz
  description: string;
  features: string[];           // variáveis de entrada
  accuracy: number;             // 0–100 %
  r2Score: number;              // 0–1
  mape: number;                 // Mean Absolute Percentage Error
  confusionMatrix?: number[][];
  dataPoints: number;
  trainingPeriod: string;
  validationPeriod: string;
  lastTrained: string;
  nextRetraining: string;
  isActive: boolean;
  predictions: {
    period: string;
    predicted: number;
    low95: number;
    high95: number;
    unit: string;
  }[];
  premises: string[];
  limitations: string[];
  governanceTag: string;        // ISO 42001 compliance tag
  createdAt?: unknown;
}

export interface DecisionSimulation {
  id: string;
  title: string;
  category: DecisionCategory;
  description: string;
  decisionOptions: {
    id: string;
    label: string;
    description: string;
    cost: number;
    timeToImplement: string;
    projectedBenefits: string[];
    projectedRisks: string[];
    impactScore: number;         // 0–100
    feasibilityScore: number;    // 0–100
    recommendationScore: number; // composite
  }[];
  affectedEntities: string[];
  affectedKPIs: string[];
  simulationConfidence: number;
  recommendedOption: string;
  aiRationale: string;
  status: 'RASCUNHO' | 'SIMULADO' | 'APROVADO' | 'IMPLEMENTADO' | 'DESCARTADO';
  createdAt?: unknown;
}

export interface SystemicAnalysisNode {
  id: string;
  label: string;
  type: 'AREA' | 'PROCESSO' | 'INDICADOR' | 'RISCO' | 'RECURSO';
  influence: number;     // 0–100 — grau de influência sobre outros nós
  dependency: number;    // 0–100 — grau de dependência de outros nós
  leverage: number;      // influence / dependency ratio
  connections: { targetId: string; weight: number; type: 'POSITIVA' | 'NEGATIVA' | 'NEUTRA' }[];
  riskPropagation: number; // 0–100 — quão rapidamente propaga riscos
  currentValue?: number;
  unit?: string;
}

export interface ECDTISPDashboardKPIs {
  // Twin Coverage
  twinCoveragePercent: number;
  twinFidelityScore: number;
  entitiesRepresented: number;
  entitiesSynced: number;
  syncLatencyMs: number;
  // Simulation
  scenariosCreated: number;
  decisionsSimulated: number;
  predictiveModels: number;
  avgModelAccuracy: number;
  // Impact
  decisionsSupported: number;
  risksAnticipated: number;
  savingsGenerated: number;   // R$ via otimizações
  // AI
  aiRecommendations: number;
  aiConfidenceAvg: number;
  // Maturity
  twinMaturityScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_ENTITIES: Omit<TwinEntity, 'id' | 'createdAt'>[] = [
  {
    name: 'Diretoria Executiva',
    type: 'UNIDADE_ORGANIZACIONAL',
    description: 'Representação digital da Diretoria Executiva: equipe, decisões, indicadores de gestão e delegações.',
    dataSource: 'EIGCAP + RH Enterprise',
    syncFrequency: 'HORARIO',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'Chief Enterprise Architect (CEA)',
    criticality: 'CRITICA',
    currentState: { membros: 4, decisoesPendentes: 7, orcamentoAprovado: 48700000, projetos: 12 },
    relatedEntities: ['Conselho Deliberativo', 'Área Operacional', 'Comitês'],
    relatedKPIs: ['Taxa de decisões no prazo', 'Índice de governança', 'NPS institucional'],
    coverageScore: 98,
    fidelityScore: 96,
  },
  {
    name: 'Programa de Saúde Integrada',
    type: 'PROGRAMA_SOCIAL',
    description: 'Representação digital do programa de saúde: atendimentos, profissionais, capacidade, indicadores clínicos e impacto.',
    dataSource: 'EHR Enterprise + BI Enterprise',
    syncFrequency: 'A_CADA_5MIN',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'Coordenação de Saúde',
    criticality: 'CRITICA',
    currentState: { atendimentosMes: 8420, profissionaisAtivos: 87, capacidadeOcupada: 78, satisfacaoMedia: 4.7 },
    relatedEntities: ['Profissionais de Saúde', 'Beneficiários', 'Infraestrutura TI'],
    relatedKPIs: ['Atendimentos/mês', 'Tempo médio espera', 'Satisfação beneficiários', 'Taxa resolução'],
    coverageScore: 97,
    fidelityScore: 95,
  },
  {
    name: 'Infraestrutura Google Cloud Platform',
    type: 'INFRAESTRUTURA_TI',
    description: 'Representação digital da infraestrutura cloud: Cloud Run, Firestore, Cloud Functions, Storage, BigQuery.',
    dataSource: 'DevSecOps SRE Enterprise',
    syncFrequency: 'TEMPO_REAL',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'CTO + SRE Team',
    criticality: 'CRITICA',
    currentState: { disponibilidade: 99.97, latenciaP99Ms: 180, errorsPerHour: 0.2, custoMensalUSD: 1840 },
    relatedEntities: ['Todos os módulos digitais', 'Security (CISO)', 'Dados Sensíveis'],
    relatedKPIs: ['Uptime', 'Latência P99', 'MTTD', 'MTTR', 'Custo/usuário'],
    coverageScore: 99,
    fidelityScore: 98,
  },
  {
    name: 'AI Core Platform',
    type: 'MODELO_IA',
    description: 'Representação digital dos modelos de IA: performance, drift, uso, impacto e conformidade ISO 42001.',
    dataSource: 'AI Core Enterprise + MLOps',
    syncFrequency: 'HORARIO',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'CAIO — Chief AI Officer',
    criticality: 'ALTA',
    currentState: { modelosAtivos: 12, acuraciaMedia: 93.4, requestsHoje: 48200, driftAlertas: 1 },
    relatedEntities: ['Programa de Saúde', 'Compliance', 'Command Center'],
    relatedKPIs: ['Acurácia média', 'Drift score', 'Req/dia', 'Conformidade ISO 42001'],
    coverageScore: 94,
    fidelityScore: 92,
  },
  {
    name: 'Fluxo Financeiro Institucional',
    type: 'ATIVO_FINANCEIRO',
    description: 'Representação digital dos fluxos financeiros: receitas, despesas, doações, convênios, projeções e reservas.',
    dataSource: 'Financial Enterprise + Fundraising',
    syncFrequency: 'DIARIO',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'Diretoria Financeira',
    criticality: 'CRITICA',
    currentState: { receitaAno: 48700000, despesaAno: 44200000, reservaMeses: 6.4, inadimplencia: 0.8 },
    relatedEntities: ['Diretoria Executiva', 'Programas Sociais', 'RH', 'Conselho Fiscal'],
    relatedKPIs: ['Receita/mês', 'Custo por beneficiário', 'Reserva financeira', 'SROI'],
    coverageScore: 96,
    fidelityScore: 94,
  },
  {
    name: 'Comunidade de Beneficiários',
    type: 'BENEFICIARIO_GRUPO',
    description: 'Representação digital (anonimizada/agregada) dos grupos de beneficiários: demografia, necessidades, atendimentos e impacto.',
    dataSource: 'Beneficiary Enterprise + ESIIMP',
    syncFrequency: 'DIARIO',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'Coordenação de Programas',
    criticality: 'ALTA',
    currentState: { beneficiariosAtivos: 124000, novosDoMes: 1840, retencao: 94.2, nivelVulnerabilidadeMed: 3.4 },
    relatedEntities: ['Programa de Saúde', 'Programas Sociais', 'Impacto Social'],
    relatedKPIs: ['Beneficiários atendidos', 'Taxa retenção', 'Satisfação', 'SROI'],
    coverageScore: 93,
    fidelityScore: 91,
  },
  {
    name: 'Processos BPM & Workflow',
    type: 'PROCESSO',
    description: 'Representação digital dos processos institucionais: fluxos, tempos de ciclo, gargalos, automações e conformidade BPMN.',
    dataSource: 'BPM Enterprise + Digital Governance',
    syncFrequency: 'HORARIO',
    syncStatus: 'SINCRONIZADO',
    lastSync: new Date().toISOString(),
    responsible: 'Chief Process Officer',
    criticality: 'ALTA',
    currentState: { processosAtivos: 47, automacaoPct: 68, gargalosCriticos: 2, slaAtendimentoPct: 91 },
    relatedEntities: ['Todas as áreas operacionais', 'Compliance', 'RH'],
    relatedKPIs: ['Tempo médio ciclo', 'Taxa automação', 'SLA cumprimento', 'Gargalos'],
    coverageScore: 91,
    fidelityScore: 89,
  },
];

const SEED_SCENARIOS: Omit<SimulationScenario, 'id' | 'createdAt'>[] = [
  {
    name: 'Expansão Geográfica — Nordeste 2027',
    type: 'OTIMISTA',
    description: 'Simulação do impacto da abertura de 3 novas unidades no Nordeste com captação de R$ 12M adicionais.',
    premises: [
      'Captação de R$ 12M em convênios governamentais até Q1/2027',
      'Contratação de 45 profissionais de saúde regionalizados',
      'Plataforma digital escalada para suportar +30k beneficiários',
      'Parceria com 5 municípios consolidada',
    ],
    variables: [
      { name: 'Orçamento Anual', baseline: 48700000, simulated: 60700000, unit: 'R$', delta: 12000000, deltaPercent: 24.6 },
      { name: 'Beneficiários Ativos', baseline: 124000, simulated: 156000, unit: 'pessoas', delta: 32000, deltaPercent: 25.8 },
      { name: 'Profissionais', baseline: 87, simulated: 132, unit: 'profissionais', delta: 45, deltaPercent: 51.7 },
      { name: 'Atendimentos/mês', baseline: 8420, simulated: 11200, unit: 'atend.', delta: 2780, deltaPercent: 33.0 },
      { name: 'Custo Operacional', baseline: 44200000, simulated: 56800000, unit: 'R$', delta: 12600000, deltaPercent: 28.5 },
      { name: 'SROI', baseline: 4.85, simulated: 5.12, unit: 'R$/R$1', delta: 0.27, deltaPercent: 5.6 },
    ],
    impactAreas: [
      { area: 'Impacto Social', impact: 'MUITO_POSITIVO', magnitude: 92, description: '+32k beneficiários, SROI 5.12, 3 novas regiões cobertas' },
      { area: 'Financeiro', impact: 'POSITIVO', magnitude: 70, description: 'Receita +24.6%, margem reduz temporariamente para 6.4%' },
      { area: 'Operacional', impact: 'POSITIVO', magnitude: 75, description: 'Aumento de capacidade com risco de sobrecarga nos primeiros 6 meses' },
      { area: 'Governança', impact: 'NEUTRO', magnitude: 50, description: 'Estrutura governança adaptada para modelo multi-regional' },
      { area: 'Tecnologia', impact: 'POSITIVO', magnitude: 80, description: 'Plataforma escala horizontalmente no GCP sem reescrita' },
    ],
    projectedKPIs: [
      { kpi: 'Beneficiários/ano', currentValue: 124000, projectedValue: 156000, unit: 'pessoas', confidenceInterval: { low: 148000, high: 163000 }, trend: 'CRESCENTE' },
      { kpi: 'Receita anual', currentValue: 48700000, projectedValue: 60700000, unit: 'R$', confidenceInterval: { low: 57000000, high: 64500000 }, trend: 'CRESCENTE' },
      { kpi: 'SROI', currentValue: 4.85, projectedValue: 5.12, unit: 'R$/R$1', confidenceInterval: { low: 4.80, high: 5.45 }, trend: 'CRESCENTE' },
    ],
    overallImpactScore: 82,
    riskLevel: 'MEDIO',
    horizon: '1_ANO',
    createdBy: 'ECDTISP AI Engine',
  },
  {
    name: 'Crise Orçamentária — Redução 20% Receitas',
    type: 'CRITICO',
    description: 'Simulação de cenário de corte de 20% nas receitas por perda de convênio principal e redução de doações.',
    premises: [
      'Rescisão antecipada do convênio com o Ministério da Saúde (R$ 9,7M/ano)',
      'Queda de 12% nas doações por cenário macroeconômico adverso',
      'Custo operacional mantido por 3 meses antes de ajustes',
    ],
    variables: [
      { name: 'Orçamento Anual', baseline: 48700000, simulated: 38960000, unit: 'R$', delta: -9740000, deltaPercent: -20.0 },
      { name: 'Profissionais', baseline: 87, simulated: 68, unit: 'profissionais', delta: -19, deltaPercent: -21.8 },
      { name: 'Atendimentos/mês', baseline: 8420, simulated: 6100, unit: 'atend.', delta: -2320, deltaPercent: -27.6 },
      { name: 'Reserva Financeira', baseline: 6.4, simulated: 2.1, unit: 'meses', delta: -4.3, deltaPercent: -67.2 },
      { name: 'Capacidade Operacional', baseline: 78, simulated: 52, unit: '%', delta: -26, deltaPercent: -33.3 },
    ],
    impactAreas: [
      { area: 'Financeiro', impact: 'MUITO_NEGATIVO', magnitude: 90, description: 'Reserva cai para 2.1 meses; risco de inadimplência operacional' },
      { area: 'Impacto Social', impact: 'MUITO_NEGATIVO', magnitude: 85, description: '-2.320 atendimentos/mês; lista de espera crítica' },
      { area: 'Recursos Humanos', impact: 'NEGATIVO', magnitude: 80, description: 'Necessidade de desligamento de 19 profissionais' },
      { area: 'Reputacional', impact: 'NEGATIVO', magnitude: 70, description: 'Risco de deterioração da imagem junto a doadores e beneficiários' },
      { area: 'Tecnologia', impact: 'NEUTRO', magnitude: 20, description: 'Infra cloud reduz custos automaticamente por menor demanda' },
    ],
    projectedKPIs: [
      { kpi: 'Reserva financeira', currentValue: 6.4, projectedValue: 2.1, unit: 'meses', confidenceInterval: { low: 1.4, high: 2.9 }, trend: 'DECRESCENTE' },
      { kpi: 'Atendimentos/mês', currentValue: 8420, projectedValue: 6100, unit: 'atend.', confidenceInterval: { low: 5600, high: 6800 }, trend: 'DECRESCENTE' },
      { kpi: 'Capacidade op.', currentValue: 78, projectedValue: 52, unit: '%', confidenceInterval: { low: 44, high: 58 }, trend: 'DECRESCENTE' },
    ],
    overallImpactScore: -74,
    riskLevel: 'CRITICO',
    horizon: '6_MESES',
    createdBy: 'ECDTISP Risk Engine',
  },
  {
    name: 'Expansão Digital — Telemedicina Nacional',
    type: 'OTIMISTA',
    description: 'Simulação da adoção plena de telemedicina em escala nacional, ampliando alcance sem expansão física.',
    premises: [
      'Adoção de plataforma de telemedicina com capacidade para 5k atendimentos/dia',
      'Parcerias com 20 municípios remotos via convênio digital',
      'Custo marginal por atendimento digital 40% menor que presencial',
      'Integração com SUS Digital em Q2/2027',
    ],
    variables: [
      { name: 'Alcance geográfico', baseline: 12, simulated: 48, unit: 'municípios', delta: 36, deltaPercent: 300 },
      { name: 'Atendimentos/mês', baseline: 8420, simulated: 18400, unit: 'atend.', delta: 9980, deltaPercent: 118.5 },
      { name: 'Custo/atendimento', baseline: 245, simulated: 148, unit: 'R$', delta: -97, deltaPercent: -39.6 },
      { name: 'SROI', baseline: 4.85, simulated: 6.20, unit: 'R$/R$1', delta: 1.35, deltaPercent: 27.8 },
      { name: 'Profissionais necessários', baseline: 87, simulated: 94, unit: 'prof.', delta: 7, deltaPercent: 8.0 },
    ],
    impactAreas: [
      { area: 'Impacto Social', impact: 'MUITO_POSITIVO', magnitude: 95, description: 'SROI 6.20; 48 municípios; 10k+ novos atendimentos/mês' },
      { area: 'Eficiência Operacional', impact: 'MUITO_POSITIVO', magnitude: 90, description: 'Custo/atendimento cai 40%; ROI positivo em 8 meses' },
      { area: 'Tecnologia', impact: 'MUITO_POSITIVO', magnitude: 88, description: 'Plataforma ISM valida capacidade de escala nacional' },
      { area: 'Regulatório', impact: 'NEUTRO', magnitude: 55, description: 'Requer adequação CFM + ANVISA para telemedicina em escala' },
    ],
    projectedKPIs: [
      { kpi: 'Alcance municípios', currentValue: 12, projectedValue: 48, unit: 'municípios', confidenceInterval: { low: 38, high: 54 }, trend: 'CRESCENTE' },
      { kpi: 'Atendimentos/mês', currentValue: 8420, projectedValue: 18400, unit: 'atend.', confidenceInterval: { low: 16800, high: 20200 }, trend: 'CRESCENTE' },
      { kpi: 'SROI', currentValue: 4.85, projectedValue: 6.20, unit: 'R$/R$1', confidenceInterval: { low: 5.85, high: 6.62 }, trend: 'CRESCENTE' },
    ],
    overallImpactScore: 91,
    riskLevel: 'BAIXO',
    horizon: '1_ANO',
    createdBy: 'ECDTISP Strategy Engine',
  },
];

const SEED_PREDICTIVE_MODELS: Omit<PredictiveModel, 'id' | 'createdAt'>[] = [
  {
    name: 'Previsão de Demanda por Atendimentos',
    type: 'SERIES_TEMPORAL',
    target: 'Número de atendimentos mensais',
    description: 'Modelo de séries temporais (SARIMA + LSTM) para previsão de demanda por atendimentos nos próximos 12 meses.',
    features: ['Sazonalidade histórica', 'Crescimento da base de beneficiários', 'Indicadores macroeconômicos locais', 'Campanhas de captação'],
    accuracy: 94.2,
    r2Score: 0.936,
    mape: 4.8,
    dataPoints: 72,
    trainingPeriod: '2020–2024',
    validationPeriod: '2025',
    lastTrained: '2026-07-01',
    nextRetraining: '2026-10-01',
    isActive: true,
    predictions: [
      { period: 'Ago/2026', predicted: 8720, low95: 8380, high95: 9060, unit: 'atend.' },
      { period: 'Set/2026', predicted: 8940, low95: 8550, high95: 9330, unit: 'atend.' },
      { period: 'Out/2026', predicted: 9180, low95: 8740, high95: 9620, unit: 'atend.' },
      { period: 'Nov/2026', predicted: 9420, low95: 8920, high95: 9920, unit: 'atend.' },
      { period: 'Dez/2026', predicted: 8800, low95: 8300, high95: 9300, unit: 'atend.' },
      { period: 'Jan/2027', predicted: 9100, low95: 8530, high95: 9670, unit: 'atend.' },
    ],
    premises: ['Sem eventos extraordinários', 'Base orçamentária mantida', 'Sazonalidade de férias considerada'],
    limitations: ['Não considera pandemia ou crises macroeconômicas', 'Precisão reduz após 6 meses'],
    governanceTag: 'ISO42001-MODEL-DEM-001',
  },
  {
    name: 'Previsão de Disponibilidade Financeira',
    type: 'REGRESSAO',
    target: 'Saldo de caixa disponível em 6 meses',
    description: 'Modelo de regressão multivariada para previsão do fluxo de caixa institucional.',
    features: ['Receita histórica de doações', 'Sazonalidade de convênios', 'Despesas recorrentes', 'Pipeline de captação'],
    accuracy: 91.8,
    r2Score: 0.904,
    mape: 6.2,
    dataPoints: 60,
    trainingPeriod: '2021–2024',
    validationPeriod: '2025',
    lastTrained: '2026-06-15',
    nextRetraining: '2026-09-15',
    isActive: true,
    predictions: [
      { period: 'Ago/2026', predicted: 4800000, low95: 4200000, high95: 5400000, unit: 'R$' },
      { period: 'Out/2026', predicted: 5100000, low95: 4400000, high95: 5800000, unit: 'R$' },
      { period: 'Dez/2026', predicted: 6200000, low95: 5500000, high95: 6900000, unit: 'R$' },
      { period: 'Fev/2027', predicted: 4900000, low95: 4000000, high95: 5800000, unit: 'R$' },
    ],
    premises: ['Pipeline de captação com 70% de conversão', 'Despesas com crescimento de 8%/ano', 'Renovação dos convênios vigentes'],
    limitations: ['Não modela captações extraordinárias', 'Sensível a eventos macroeconômicos'],
    governanceTag: 'ISO42001-MODEL-FIN-001',
  },
  {
    name: 'Risco Operacional Preditivo',
    type: 'SIMULACAO_MONTECARLO',
    target: 'Probabilidade de eventos de risco operacional',
    description: 'Simulação Monte Carlo (10.000 iterações) para estimativa de probabilidade e impacto de riscos operacionais.',
    features: ['Histórico de incidentes', 'Indicadores de saúde da plataforma', 'Carga operacional', 'Indicadores de compliance'],
    accuracy: 88.6,
    r2Score: 0.871,
    mape: 9.4,
    dataPoints: 3650,
    trainingPeriod: '2022–2025',
    validationPeriod: '2026-Q1/Q2',
    lastTrained: '2026-07-10',
    nextRetraining: '2026-10-10',
    isActive: true,
    predictions: [
      { period: 'Q3/2026', predicted: 8.4, low95: 4.2, high95: 14.8, unit: '% prob. incidente crítico' },
      { period: 'Q4/2026', predicted: 7.9, low95: 3.8, high95: 14.1, unit: '% prob. incidente crítico' },
      { period: 'Q1/2027', predicted: 9.2, low95: 4.6, high95: 16.0, unit: '% prob. incidente crítico' },
    ],
    premises: ['Controles mantidos no nível atual', 'Sem mudanças arquiteturais não planejadas'],
    limitations: ['Modelo não captura ataques zero-day', 'Intervalo de confiança amplo para >6 meses'],
    governanceTag: 'ISO42001-MODEL-RISK-001',
  },
  {
    name: 'Impacto Social Preditivo (SROI Forward)',
    type: 'REDES_NEURAIS',
    target: 'SROI projetado para 12 meses',
    description: 'Rede neural LSTM treinada com dados de programas sociais para projeção de retorno social e efetividade dos programas.',
    features: ['Atendimentos históricos', 'Perfil dos beneficiários', 'Investimento por programa', 'Indicadores de saúde ODS 3'],
    accuracy: 92.7,
    r2Score: 0.921,
    mape: 5.1,
    dataPoints: 156,
    trainingPeriod: '2021–2025',
    validationPeriod: '2026-H1',
    lastTrained: '2026-07-05',
    nextRetraining: '2026-10-05',
    isActive: true,
    predictions: [
      { period: 'Dez/2026', predicted: 5.04, low95: 4.78, high95: 5.30, unit: 'SROI R$/R$1' },
      { period: 'Jun/2027', predicted: 5.28, low95: 4.96, high95: 5.60, unit: 'SROI R$/R$1' },
      { period: 'Dez/2027', predicted: 5.47, low95: 5.08, high95: 5.86, unit: 'SROI R$/R$1' },
    ],
    premises: ['Programas mantidos sem cortes', 'Expansão gradual da telemedicina', 'Qualidade dos dados de outcome mantida'],
    limitations: ['Depende da qualidade dos dados de coleta de impacto', 'Não captura mudanças abruptas de programas'],
    governanceTag: 'ISO42001-MODEL-SROI-001',
  },
];

const SEED_DECISIONS: Omit<DecisionSimulation, 'id' | 'createdAt'>[] = [
  {
    title: 'Abertura de Nova Unidade — Fortaleza/CE',
    category: 'ESTRATEGICA',
    description: 'Simulação de impacto da abertura de uma unidade de atendimento em Fortaleza com 3 opções de modelo operacional.',
    decisionOptions: [
      {
        id: 'OPT-A',
        label: 'Unidade Física Completa',
        description: 'Instalação de unidade física com 15 profissionais, sede própria e atendimento presencial.',
        cost: 3200000,
        timeToImplement: '12 meses',
        projectedBenefits: ['8.000 beneficiários/ano', 'SROI local 4.92', 'Emprego de 15 profissionais locais'],
        projectedRisks: ['Alto custo fixo', 'Dependência de locação imobiliária', 'Risco de gestão remota'],
        impactScore: 78,
        feasibilityScore: 65,
        recommendationScore: 71.5,
      },
      {
        id: 'OPT-B',
        label: 'Hub Digital + Parceiro Local',
        description: 'Telemedicina + parceria com OSC local para atendimento presencial seletivo.',
        cost: 980000,
        timeToImplement: '4 meses',
        projectedBenefits: ['5.500 beneficiários/ano', 'SROI local 5.40', 'Custo 69% menor que física'],
        projectedRisks: ['Dependência do parceiro local', 'Alcance presencial limitado'],
        impactScore: 72,
        feasibilityScore: 88,
        recommendationScore: 80.0,
      },
      {
        id: 'OPT-C',
        label: 'Modelo Misto Gradual',
        description: 'Iniciar com Hub Digital em 4 meses, evoluir para física parcial em 18 meses conforme captação.',
        cost: 1650000,
        timeToImplement: '4→18 meses',
        projectedBenefits: ['6.800 beneficiários/ano (escala)', 'SROI 5.18', 'Menor risco de escala'],
        projectedRisks: ['Complexidade operacional', 'Transição exige gestão de mudança'],
        impactScore: 84,
        feasibilityScore: 82,
        recommendationScore: 83.0,
      },
    ],
    affectedEntities: ['Programa de Saúde', 'Fluxo Financeiro', 'Comunidade Beneficiários', 'RH'],
    affectedKPIs: ['Atendimentos/mês', 'SROI', 'Beneficiários ativos', 'Custo/atendimento'],
    simulationConfidence: 87,
    recommendedOption: 'OPT-C',
    aiRationale: 'O Modelo Misto Gradual (OPT-C) apresenta o melhor balanço entre impacto social (84/100) e viabilidade (82/100), permitindo validação do mercado antes do investimento completo. O risco financeiro é 48% menor que a opção A com impacto social apenas 8% inferior.',
    status: 'SIMULADO',
  },
  {
    title: 'Redistribuição Orçamentária Q4/2026',
    category: 'FINANCEIRA',
    description: 'Simulação de redistribuição de R$ 1.2M do fundo operacional para expansão do programa de telemedicina.',
    decisionOptions: [
      {
        id: 'OPT-A',
        label: 'Manter distribuição atual',
        description: 'Manter orçamento atual sem redistribuição.',
        cost: 0,
        timeToImplement: 'Imediato',
        projectedBenefits: ['Estabilidade operacional', 'Sem risco de transição'],
        projectedRisks: ['Perda da janela de oportunidade digital', 'Crescimento limitado'],
        impactScore: 45,
        feasibilityScore: 95,
        recommendationScore: 70.0,
      },
      {
        id: 'OPT-B',
        label: 'Investir R$ 1.2M em Telemedicina',
        description: 'Redirecionar R$ 1.2M para infraestrutura e expansão do programa digital.',
        cost: 1200000,
        timeToImplement: '3 meses',
        projectedBenefits: ['+3.800 atendimentos/mês em 6 meses', 'Custo/atendimento -22%', 'SROI projetado 5.30'],
        projectedRisks: ['Redução temporária da reserva para 4.8 meses', 'Risco de execução do projeto digital'],
        impactScore: 88,
        feasibilityScore: 79,
        recommendationScore: 83.5,
      },
    ],
    affectedEntities: ['Fluxo Financeiro', 'Programa de Saúde', 'Infraestrutura TI'],
    affectedKPIs: ['Reserva financeira', 'Atendimentos/mês', 'Custo/atendimento', 'SROI'],
    simulationConfidence: 91,
    recommendedOption: 'OPT-B',
    aiRationale: 'O investimento em telemedicina (OPT-B) apresenta ROI de 310% em 18 meses com IC90% positivo. A reserva de 4.8 meses permanece acima do mínimo recomendado (3 meses). Risco operacional é baixo dado a infraestrutura GCP já escalável.',
    status: 'SIMULADO',
  },
];

const SEED_SYSTEMIC_NODES: SystemicAnalysisNode[] = [
  { id: 'N1', label: 'Programa de Saúde', type: 'AREA', influence: 94, dependency: 72, leverage: 1.31, connections: [{ targetId: 'N3', weight: 90, type: 'POSITIVA' }, { targetId: 'N5', weight: 85, type: 'POSITIVA' }, { targetId: 'N4', weight: 70, type: 'POSITIVA' }], riskPropagation: 88, currentValue: 8420, unit: 'atend./mês' },
  { id: 'N2', label: 'Fluxo Financeiro', type: 'RECURSO', influence: 96, dependency: 45, leverage: 2.13, connections: [{ targetId: 'N1', weight: 95, type: 'POSITIVA' }, { targetId: 'N6', weight: 80, type: 'POSITIVA' }, { targetId: 'N7', weight: 70, type: 'POSITIVA' }], riskPropagation: 92, currentValue: 48700000, unit: 'R$/ano' },
  { id: 'N3', label: 'Beneficiários', type: 'AREA', influence: 82, dependency: 95, leverage: 0.86, connections: [{ targetId: 'N5', weight: 88, type: 'POSITIVA' }, { targetId: 'N1', weight: 75, type: 'POSITIVA' }], riskPropagation: 60, currentValue: 124000, unit: 'pessoas' },
  { id: 'N4', label: 'Infraestrutura GCP', type: 'RECURSO', influence: 91, dependency: 35, leverage: 2.60, connections: [{ targetId: 'N1', weight: 90, type: 'POSITIVA' }, { targetId: 'N8', weight: 85, type: 'POSITIVA' }, { targetId: 'N6', weight: 70, type: 'POSITIVA' }], riskPropagation: 97, currentValue: 99.97, unit: '% uptime' },
  { id: 'N5', label: 'Impacto Social (SROI)', type: 'INDICADOR', influence: 88, dependency: 90, leverage: 0.98, connections: [{ targetId: 'N2', weight: 85, type: 'POSITIVA' }, { targetId: 'N7', weight: 92, type: 'POSITIVA' }], riskPropagation: 50, currentValue: 4.85, unit: 'SROI' },
  { id: 'N6', label: 'Governança Institucional', type: 'PROCESSO', influence: 85, dependency: 55, leverage: 1.55, connections: [{ targetId: 'N2', weight: 75, type: 'POSITIVA' }, { targetId: 'N1', weight: 70, type: 'POSITIVA' }, { targetId: 'N9', weight: 88, type: 'POSITIVA' }], riskPropagation: 65, currentValue: 97.8, unit: '/100' },
  { id: 'N7', label: 'Captação de Recursos', type: 'PROCESSO', influence: 90, dependency: 70, leverage: 1.29, connections: [{ targetId: 'N2', weight: 95, type: 'POSITIVA' }, { targetId: 'N3', weight: 80, type: 'POSITIVA' }], riskPropagation: 80, currentValue: 48.7, unit: 'M R$/ano' },
  { id: 'N8', label: 'AI Core Platform', type: 'AREA', influence: 87, dependency: 60, leverage: 1.45, connections: [{ targetId: 'N1', weight: 80, type: 'POSITIVA' }, { targetId: 'N6', weight: 75, type: 'POSITIVA' }, { targetId: 'N5', weight: 70, type: 'POSITIVA' }], riskPropagation: 75, currentValue: 93.4, unit: '% acurácia' },
  { id: 'N9', label: 'Compliance & Riscos', type: 'PROCESSO', influence: 80, dependency: 50, leverage: 1.60, connections: [{ targetId: 'N6', weight: 90, type: 'POSITIVA' }, { targetId: 'N2', weight: 70, type: 'POSITIVA' }, { targetId: 'N4', weight: 65, type: 'POSITIVA' }], riskPropagation: 70, currentValue: 98.1, unit: '% compliance' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseECDTISPService = {

  async getTwinEntities(): Promise<TwinEntity[]> {
    const q = query(collection(db, 'ecdtisp_entities'), orderBy('criticality'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const e of SEED_ENTITIES) {
        await addDoc(collection(db, 'ecdtisp_entities'), { ...e, createdAt: serverTimestamp() });
      }
      return this.getTwinEntities();
    }
    return snap.docs.map(d => mapDoc<TwinEntity>(d));
  },

  async getSimulationScenarios(): Promise<SimulationScenario[]> {
    const q = query(collection(db, 'ecdtisp_scenarios'), orderBy('overallImpactScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const s of SEED_SCENARIOS) {
        await addDoc(collection(db, 'ecdtisp_scenarios'), { ...s, createdAt: serverTimestamp() });
      }
      return this.getSimulationScenarios();
    }
    return snap.docs.map(d => mapDoc<SimulationScenario>(d));
  },

  async getPredictiveModels(): Promise<PredictiveModel[]> {
    const q = query(collection(db, 'ecdtisp_models'), orderBy('accuracy', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const m of SEED_PREDICTIVE_MODELS) {
        await addDoc(collection(db, 'ecdtisp_models'), { ...m, createdAt: serverTimestamp() });
      }
      return this.getPredictiveModels();
    }
    return snap.docs.map(d => mapDoc<PredictiveModel>(d));
  },

  async getDecisionSimulations(): Promise<DecisionSimulation[]> {
    const q = query(collection(db, 'ecdtisp_decisions'), orderBy('simulationConfidence', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const d of SEED_DECISIONS) {
        await addDoc(collection(db, 'ecdtisp_decisions'), { ...d, createdAt: serverTimestamp() });
      }
      return this.getDecisionSimulations();
    }
    return snap.docs.map(d => mapDoc<DecisionSimulation>(d));
  },

  async getSystemicAnalysisNodes(): Promise<SystemicAnalysisNode[]> {
    return SEED_SYSTEMIC_NODES;
  },

  async getDashboardKPIs(): Promise<ECDTISPDashboardKPIs> {
    return {
      twinCoveragePercent: 96.4,
      twinFidelityScore: 94.9,
      entitiesRepresented: 65,   // todos os módulos da plataforma
      entitiesSynced: 63,
      syncLatencyMs: 124,
      scenariosCreated: 12,
      decisionsSimulated: 8,
      predictiveModels: 4,
      avgModelAccuracy: 91.8,
      decisionsSupported: 23,
      risksAnticipated: 7,
      savingsGenerated: 4200000,
      aiRecommendations: 9,
      aiConfidenceAvg: 89.3,
      twinMaturityScore: 94.8,
      certificationDate: '2026-07-22',
      certificationVersion: 'ECDTISP v1.0 — Prompt 066',
    };
  },

  async updateDecisionStatus(id: string, status: DecisionSimulation['status']): Promise<void> {
    await updateDoc(doc(db, 'ecdtisp_decisions', id), { status });
  },
};
