/**
 * innovationEIRCTPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Innovation, Research & Continuous Transformation Platform
 * Instituto Ser Melhor — Prompt 069 — Plataforma ISM v2.0
 *
 * Padrões: ISO 56002 (Innovation Management System), ISO 42001, Stage-Gate,
 *          Design Thinking, Lean Startup, Technology Scouting, TOGAF, COBIT 2019
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type InnovationStage = 'SUBMISSAO' | 'AVALIACAO' | 'EXPERIMENTACAO_POC' | 'VALIDACAO_MVP' | 'ESCALABILIDADE' | 'INSTITUCIONALIZADO' | 'ARQUIVADO';
export type InnovationCategory = 'INOVACAO_SOCIAL' | 'INOVACAO_TECNOLOGICA' | 'INOVACAO_EM_PROCESSO' | 'INOVACAO_EM_SERVICO' | 'INOVACAO_ORGANIZACIONAL';
export type RadarRecommendation = 'ADOTAR_IMEDIATO' | 'EXPERIMENTAR' | 'OBSERVAR' | 'PESQUISAR_FUTURO';
export type OpenInnovationPartnerType = 'UNIVERSIDADE' | 'STARTUP' | 'CENTRO_PESQUISA' | 'ORGANIZACAO_SOCIAL' | 'PARCEIRO_TECNOLOGICO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface InnovationItem {
  id: string;
  title: string;
  category: InnovationCategory;
  stage: InnovationStage;
  hypothesis: string;
  sponsor: string;
  responsible: string;
  budgetAllocated: number; // R$
  budgetSpent: number;     // R$
  expectedImpactScore: number; // 0-100
  feasibilityScore: number;    // 0-100
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  primaryKPI: string;
  kpiBaseline: string;
  kpiTarget: string;
  kpiCurrent: string;
  evidence: string[];
  tags: string[];
  aiRecommendation: string;
  createdAt?: unknown;
}

export interface TechnologyRadarItem {
  id: string;
  technology: string;
  category: 'IA_E_ANALYTICS' | 'SAUDE_DIGITAL' | 'NUVEM_E_SRE' | 'CIBERSEGURANCA' | 'BLOCKCHAIN_E_GOV';
  recommendation: RadarRecommendation;
  maturityLevel: 'EMERGENTE' | 'EM_CRESCIMENTO' | 'MATURA' | 'LEGADA';
  impactPotential: 'ALTISSIMO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  relevanceToMission: string;
  lastEvaluated: string;
}

export interface OpenInnovationPartner {
  id: string;
  name: string;
  type: OpenInnovationPartnerType;
  jointProjectTitle: string;
  intellectualPropertyAgreement: string;
  status: 'ATIVO' | 'EM_NEGOCIACAO' | 'CONCLUIDO';
  mainDeliverables: string[];
  startDate: string;
}

export interface EIRCTPDashboardKPIs {
  globalInnovationScore: number; // 0-100
  pipelineStageGateHealth: number; // 0-100
  activeExperiments: number;
  successfulPocsRate: number; // %
  techRadarCoverage: number;
  openInnovationPartnerships: number;
  roiOnInnovation: number; // %
  maturityScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_INNOVATIONS: Omit<InnovationItem, 'id' | 'createdAt'>[] = [
  {
    title: 'Triagem Clínica Cognitiva Multimodal via Agente IA Local',
    category: 'INOVACAO_TECNOLOGICA',
    stage: 'VALIDACAO_MVP',
    hypothesis: 'O uso de modelos de linguagem e áudio otimizados para triagem clínica reduz o tempo de pré-atendimento em 60% com 99% de precisão de anamnese.',
    sponsor: 'Chief AI Officer (CAIO)',
    responsible: 'Equipe de P&D de IA + Coordenação Médica',
    budgetAllocated: 180000,
    budgetSpent: 95000,
    expectedImpactScore: 96,
    feasibilityScore: 88,
    riskLevel: 'BAIXO',
    primaryKPI: 'Tempo de pré-atendimento',
    kpiBaseline: '15 minutos',
    kpiTarget: '5 minutos',
    kpiCurrent: '6.2 minutos',
    evidence: ['Relatório de PoC Lab #04', 'Acurácia de Anamnese 99.2%', 'Parecer Comitê Ética #012/2026'],
    tags: ['IA', 'Triagem', 'Telemedicina', 'VertexAI'],
    aiRecommendation: 'Avançar para escalabilidade regional no Sertão Nordestino com supervisão médica continuada.',
  },
  {
    title: 'Prontuário Descentralizado com Prova de Integridade Zero-Knowledge',
    category: 'INOVACAO_EM_PROCESSO',
    stage: 'EXPERIMENTACAO_POC',
    hypothesis: 'A utilização de ZK-Rollups para prova de consentimento permite validação instantânea de privacidade sem trafegar dados sensíveis.',
    sponsor: 'Chief Governance Officer (CGO)',
    responsible: 'Arquitetura de Segurança & Zero Trust',
    budgetAllocated: 120000,
    budgetSpent: 40000,
    expectedImpactScore: 92,
    feasibilityScore: 78,
    riskLevel: 'MEDIO',
    primaryKPI: 'Tempo de verificação de consentimento',
    kpiBaseline: '48 horas (manual)',
    kpiTarget: '1.5 segundos',
    kpiCurrent: '2.1 segundos',
    evidence: ['Benchmark de Latência ZK-01', 'Auditoria LGPD ZK'],
    tags: ['Privacy', 'ZK-Proofs', 'LGPD', 'Blockchain'],
    aiRecommendation: 'Concluir PoC em ambiente de staging antes da integração com a API Gateway Enterprise.',
  },
  {
    title: 'Micro-doações Recorrentes com Gamificação de Impacto Social',
    category: 'INOVACAO_SOCIAL',
    stage: 'INSTITUCIONALIZADO',
    hypothesis: 'Dar visibilidade ao impacto direto de doações de R$ 5 a R$ 20 através de atualizações em tempo real no app aumenta a retenção de doadores individuais em 40%.',
    sponsor: 'Chief Impact Officer (CImO)',
    responsible: 'Equipe de Produto & Fundraising Digital',
    budgetAllocated: 85000,
    budgetSpent: 85000,
    expectedImpactScore: 94,
    feasibilityScore: 95,
    riskLevel: 'BAIXO',
    primaryKPI: 'Retenção de doadores individuais de 12 meses',
    kpiBaseline: '42%',
    kpiTarget: '70%',
    kpiCurrent: '74.5%',
    evidence: ['Relatório de Impacto ESIIMP Q2/2026', 'NPS Doadores 91 pts'],
    tags: ['Fundraising', 'Gamificação', 'ImpactoSocial', 'Retenção'],
    aiRecommendation: 'Iniciativa institucionalizada com sucesso pleno e incorporada ao módulo de Doações.',
  },
  {
    title: 'Sensores IoT de Qualidade da Água em Comunidades Assistidas',
    category: 'INOVACAO_EM_SERVICO',
    stage: 'AVALIACAO',
    hypothesis: 'Monitoramento contínuo da qualidade da água via IoT prediz surtos de enfermidades gastrointestinais 14 dias antes do surgimento clínico.',
    sponsor: 'Diretoria de Programas Sociais',
    responsible: 'Parceria Poli-USP + Engenharia Social',
    budgetAllocated: 210000,
    budgetSpent: 15000,
    expectedImpactScore: 90,
    feasibilityScore: 82,
    riskLevel: 'MEDIO',
    primaryKPI: 'Antecedência na detecção de contaminação',
    kpiBaseline: '0 dias (pós-surto)',
    kpiTarget: '14 dias prévios',
    kpiCurrent: 'Em avaliação',
    evidence: ['Projeto de Pesquisa Conveniada Poli-USP #88'],
    tags: ['IoT', 'SaúdePública', 'Prevenção', 'ÁguaPotável'],
    aiRecommendation: 'Aprovar orçamento para PoC de 60 dias em 3 comunidades piloto em Q3/2026.',
  },
];

const SEED_RADAR: Omit<TechnologyRadarItem, 'id'>[] = [
  {
    technology: 'Vertex AI Multimodal MedLM',
    category: 'IA_E_ANALYTICS',
    recommendation: 'ADOTAR_IMEDIATO',
    maturityLevel: 'EM_CRESCIMENTO',
    impactPotential: 'ALTISSIMO',
    relevanceToMission: 'Automação de suporte ao diagnóstico clínico primário.',
    lastEvaluated: '2026-07-01',
  },
  {
    technology: 'Zero-Knowledge Proofs (ZK-SNARKs)',
    category: 'CIBERSEGURANCA',
    recommendation: 'EXPERIMENTAR',
    maturityLevel: 'EMERGENTE',
    impactPotential: 'ALTO',
    relevanceToMission: 'Verificação de elegibilidade sem exposição de dados vulneráveis.',
    lastEvaluated: '2026-06-15',
  },
  {
    technology: 'Redes 5G Privadas para Telemedicina Remota',
    category: 'NUVEM_E_SRE',
    recommendation: 'OBSERVAR',
    maturityLevel: 'MATURA',
    impactPotential: 'MEDIO',
    relevanceToMission: 'Infraestrutura de baixa latência em cirurgias ou exames guiados remotos.',
    lastEvaluated: '2026-05-20',
  },
  {
    technology: 'Quantum Key Distribution (QKD)',
    category: 'CIBERSEGURANCA',
    recommendation: 'PESQUISAR_FUTURO',
    maturityLevel: 'EMERGENTE',
    impactPotential: 'MEDIO',
    relevanceToMission: 'Proteção pós-quântica de longo prazo para prontuários de saúde.',
    lastEvaluated: '2026-04-10',
  },
];

const SEED_PARTNERS: Omit<OpenInnovationPartner, 'id'>[] = [
  {
    name: 'Universidade de São Paulo (Poli-USP)',
    type: 'UNIVERSIDADE',
    jointProjectTitle: 'Sensores IoT Preditivos de Qualidade Ambiental',
    intellectualPropertyAgreement: 'Co-propriedade 50/50 com uso livre perpétuo pelo ISM.',
    status: 'ATIVO',
    mainDeliverables: ['Protótipo de Sensor IoT', 'Modelo de Inteligência Preditiva'],
    startDate: '2026-02-01',
  },
  {
    name: 'HealthTech Social Inova',
    type: 'STARTUP',
    jointProjectTitle: 'Algoritmo de Otimização de Rotas de Atendimento Móvel',
    intellectualPropertyAgreement: 'Licença aberta sem custos para o terceiro setor.',
    status: 'ATIVO',
    mainDeliverables: ['API de Roteamento Preditivo'],
    startDate: '2026-04-15',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEIRCTPService = {

  async getInnovations(): Promise<InnovationItem[]> {
    const q = query(collection(db, 'eirctp_innovations'), orderBy('expectedImpactScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INNOVATIONS) {
        await addDoc(collection(db, 'eirctp_innovations'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getInnovations();
    }
    return snap.docs.map(d => mapDoc<InnovationItem>(d));
  },

  async getTechnologyRadar(): Promise<TechnologyRadarItem[]> {
    const q = query(collection(db, 'eirctp_radar'), orderBy('lastEvaluated', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_RADAR) {
        await addDoc(collection(db, 'eirctp_radar'), { ...item });
      }
      return this.getTechnologyRadar();
    }
    return snap.docs.map(d => mapDoc<TechnologyRadarItem>(d));
  },

  async getOpenPartnerships(): Promise<OpenInnovationPartner[]> {
    const q = query(collection(db, 'eirctp_partners'), orderBy('startDate', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_PARTNERS) {
        await addDoc(collection(db, 'eirctp_partners'), { ...item });
      }
      return this.getOpenPartnerships();
    }
    return snap.docs.map(d => mapDoc<OpenInnovationPartner>(d));
  },

  async getDashboardKPIs(): Promise<EIRCTPDashboardKPIs> {
    return {
      globalInnovationScore: 95.6,
      pipelineStageGateHealth: 98.2,
      activeExperiments: 8,
      successfulPocsRate: 87.5,
      techRadarCoverage: 94.0,
      openInnovationPartnerships: 5,
      roiOnInnovation: 340, // 340% ROI
      maturityScore: 96.0,
      certificationDate: '2026-07-22',
      certificationVersion: 'EIRCTP v1.0 — Prompt 069',
    };
  },
};
