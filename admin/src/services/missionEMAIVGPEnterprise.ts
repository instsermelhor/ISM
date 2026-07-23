/**
 * missionEMAIVGPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission Alignment & Institutional Value Governance Platform
 * Instituto Ser Melhor — Prompt 068 — Plataforma ISM v2.0
 *
 * Padrões: TOGAF, ISO 37000, ISO 37301, ISO 42001, COBIT 2019, DAMA-DMBOK2,
 *          Mission-Driven Organizations, Value-Based Management, Balanced Scorecard
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ValueCategory = 'ETICA' | 'TRANSPARENCIA' | 'IMPACTO_SOCIAL' | 'EXCELENCIA' | 'INCLUSAO' | 'INOVACAO_RESPONSAVEL';
export type InitiativeType = 'PROJETO' | 'PROCESSO' | 'AUTOMACAO' | 'AGENTE_IA' | 'INVESTIMENTO' | 'POLITICA' | 'PARCERIA';
export type AlignmentLevel = 'PLENO' | 'ALTO' | 'PARCIAL' | 'DESALINHADO' | 'EM_ANALISE';
export type RiskCategory = 'DESVIO_DA_MISSAO' | 'RISCO_REPUTACIONAL' | 'RISCO_ETICO' | 'CONFLITO_DE_INTERESSE' | 'DESPERDICIO_RECURSOS';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface MissionStatement {
  id: string;
  mission: string;
  vision: string;
  purpose: string;
  coreValues: {
    id: string;
    name: string;
    category: ValueCategory;
    description: string;
    weight: number; // 1-10
  }[];
  strategicPillars: {
    id: string;
    name: string;
    description: string;
    kpis: string[];
  }[];
  updatedAt?: unknown;
}

export interface InitiativeAlignment {
  id: string;
  title: string;
  type: InitiativeType;
  department: string;
  description: string;
  missionAlignmentScore: number; // 0–100
  valuesAlignmentScore: number;  // 0–100
  compositeAlignmentScore: number; // 0–100
  level: AlignmentLevel;
  primaryPillarId: string;
  supportedValues: string[];
  risksIdentified: {
    category: RiskCategory;
    description: string;
    severity: 'ALTA' | 'MEDIA' | 'BAIXA';
    mitigation: string;
  }[];
  responsible: string;
  approvalStatus: 'APROVADO' | 'APROVADO_COM_RESTRICOES' | 'REJEITADO' | 'PENDENTE';
  aiRationale: string;
  evalDate: string;
  createdAt?: unknown;
}

export interface AlignmentMatrixItem {
  id: string;
  initiativeId: string;
  initiativeTitle: string;
  type: InitiativeType;
  associatedValue: string;
  strategicObjective: string;
  alignmentScore: number; // 0–100
  impactOnMission: string;
  evidence: string[];
  responsible: string;
}

export interface EMAIVGPDashboardKPIs {
  globalMissionAlignmentScore: number; // 0-100
  valuesComplianceScore: number;        // 0-100
  initiativesAudited: number;
  fullyAlignedPercent: number;
  misalignmentsBlocked: number;
  highImpactInitiatives: number;
  ethicsCompliancePercent: number;
  maturityScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_MISSION: Omit<MissionStatement, 'id' | 'updatedAt'> = {
  mission: 'Promover a transformação social sustentável, inclusão e bem-estar de comunidades vulneráveis através de programas multidisciplinares de saúde, educação, tecnologia e desenvolvimento humano.',
  vision: 'Ser a organização referência nacional em excelência operacional, governança orientada por missão e uso ético de inteligência artificial no terceiro setor até 2030.',
  purpose: 'Maximizar a dignidade e a autonomia das pessoas em situação de vulnerabilidade, garantindo transparência absoluta e eficiência na alocação de recursos institucionais.',
  coreValues: [
    { id: 'VAL-01', name: 'Dignidade Humana', category: 'ETICA', description: 'Centralidade no ser humano, respeitando a diversidade e promovendo a equidade.', weight: 10 },
    { id: 'VAL-02', name: 'Transparência Absoluta', category: 'TRANSPARENCIA', description: 'Prestação de contas clara, auditável e acessível a toda a sociedade.', weight: 10 },
    { id: 'VAL-03', name: 'Impacto Social Sustentável', category: 'IMPACTO_SOCIAL', description: 'Foco em resultados mensuráveis e duradouros na vida dos beneficiários.', weight: 9 },
    { id: 'VAL-04', name: 'Inovação Ética & Responsável', category: 'INOVACAO_RESPONSAVEL', description: 'Uso de tecnologia e IA com supervisão humana rigorosa e foco no bem comum.', weight: 9 },
    { id: 'VAL-05', name: 'Excelência & Eficiência', category: 'EXCELENCIA', description: 'Rigor técnico, governança de dados e otimização contínua de recursos.', weight: 8 },
    { id: 'VAL-06', name: 'Inclusão & Diversidade', category: 'INCLUSAO', description: 'Acesso democrático e sem barreiras a todas as iniciativas da instituição.', weight: 9 },
  ],
  strategicPillars: [
    { id: 'PIL-01', name: 'Ampliação do Alcance & Saúde Integrada', description: 'Expandir atendimentos clínicos e telemedicina para áreas remotas.', kpis: ['Atendimentos/mês', 'Municípios atendidos', 'SROI'] },
    { id: 'PIL-02', name: 'Governança & Transparência Enterprise', description: 'Manter a conformidade regulatória ISO 37000/37301/42001 e auditoria zero falhas.', kpis: ['Score EIGCAP', 'Auditorias limpas', 'NPS Doadores'] },
    { id: 'PIL-03', name: 'Inteligência Artificial Ética e Adaptativa', description: 'Desenvolver e utilizar modelos de IA transparentes com supervisão humana.', kpis: ['Acurácia IA', 'Explainability score', 'Auditoria ISO 42001'] },
    { id: 'PIL-04', name: 'Sustentabilidade Financeira & Diversificação', description: 'Garantir captação multicanal e reservas operacionais sólidas.', kpis: ['Reserva financeira (meses)', 'Diversificação de receita'] },
  ],
};

const SEED_INITIATIVES: Omit<InitiativeAlignment, 'id' | 'createdAt'>[] = [
  {
    title: 'Expansão da Telemedicina para o Sertão Nordestino',
    type: 'PROJETO',
    department: 'Saúde & Operações',
    description: 'Implementação de polos digitais de saúde conectando médicos especialistas a 15 comunidades isoladas.',
    missionAlignmentScore: 98,
    valuesAlignmentScore: 96,
    compositeAlignmentScore: 97,
    level: 'PLENO',
    primaryPillarId: 'PIL-01',
    supportedValues: ['Dignidade Humana', 'Impacto Social Sustentável', 'Inclusão & Diversidade'],
    risksIdentified: [
      { category: 'DESVIO_DA_MISSAO', description: 'Risco de elitização do serviço se a infraestrutura digital falhar.', severity: 'BAIXA', mitigation: 'Contingência com atendimento presencial quinzenal.' },
    ],
    responsible: 'Diretoria de Operações & Saúde',
    approvalStatus: 'APROVADO',
    aiRationale: 'Alinhamento quase perfeito com a missão (98%). Fortalece diretamente o pilar de Ampliação do Alcance Social e o valor de Dignidade Humana.',
    evalDate: '2026-07-15',
  },
  {
    title: 'Implementação de Agentes Autônomos de Captação sem Supervisão',
    type: 'AGENTE_IA',
    department: 'Tecnologia & Marketing',
    description: 'Automação total do envio de e-mails e abordagens de captação de recursos via LLM autônoma sem revisão humana prévia.',
    missionAlignmentScore: 42,
    valuesAlignmentScore: 35,
    compositeAlignmentScore: 38.5,
    level: 'DESALINHADO',
    primaryPillarId: 'PIL-03',
    supportedValues: ['Excelência & Eficiência'],
    risksIdentified: [
      { category: 'RISCO_REPUTACIONAL', description: 'Mensagens inadequadas geradas por hallucination podem danificar a imagem institucional.', severity: 'ALTA', mitigation: 'Exigir Human-in-the-Loop obrigatório.' },
      { category: 'RISCO_ETICO', description: 'Violação da diretriz de IA Responsável (ISO 42001) da plataforma.', severity: 'ALTA', mitigation: 'Submeter à revisão do Comitê de Ética.' },
    ],
    responsible: 'Marketing Digital',
    approvalStatus: 'REJEITADO',
    aiRationale: 'Iniciativa bloqueada por violação direta ao valor de Inovação Ética & Responsável. A ausência de supervisão humana fere as diretrizes institucionais.',
    evalDate: '2026-07-18',
  },
  {
    title: 'Portal de Transparência Aberta com Blockchain Hashing',
    type: 'PROCESSO',
    department: 'Governança & Financeiro',
    description: 'Publicação em tempo real de todas as notas fiscais e doações com hash imutável auditável publicamente.',
    missionAlignmentScore: 96,
    valuesAlignmentScore: 99,
    compositeAlignmentScore: 97.5,
    level: 'PLENO',
    primaryPillarId: 'PIL-02',
    supportedValues: ['Transparência Absoluta', 'Excelência & Eficiência'],
    risksIdentified: [],
    responsible: 'CGO + Diretoria Financeira',
    approvalStatus: 'APROVADO',
    aiRationale: 'Excelente aderência ao valor de Transparência Absoluta (99%). Zera riscos de desvio orçamentário.',
    evalDate: '2026-07-10',
  },
  {
    title: 'Parceria Comercial com Empresa de Jogos de Azar para Patrocínio',
    type: 'PARCERIA',
    department: 'Fundraising',
    description: 'Proposta de patrocínio de R$ 3M/ano com casa de apostas em troca de exibição de marca nos eventos do instituto.',
    missionAlignmentScore: 25,
    valuesAlignmentScore: 18,
    compositeAlignmentScore: 21.5,
    level: 'DESALINHADO',
    primaryPillarId: 'PIL-04',
    supportedValues: [],
    risksIdentified: [
      { category: 'CONFLITO_DE_INTERESSE', description: 'Apostas causam vulnerabilidade financeira em famílias, colidindo com a missão de proteção comunitária.', severity: 'ALTA', mitigation: 'Rejeição total da proposta.' },
    ],
    responsible: 'Captação Institucional',
    approvalStatus: 'REJEITADO',
    aiRationale: 'Rejeição automática. A atividade do parceiro gera impacto social negativo incompatível com a Carta de Valores Institucionais.',
    evalDate: '2026-07-20',
  },
];

const SEED_MATRIX: Omit<AlignmentMatrixItem, 'id'>[] = [
  {
    initiativeId: 'INIT-01',
    initiativeTitle: 'Expansão Telemedicina Sertão',
    type: 'PROJETO',
    associatedValue: 'Dignidade Humana',
    strategicObjective: 'Ampliação do Alcance & Saúde Integrada',
    alignmentScore: 98,
    impactOnMission: 'Direto e positivo na ampliação do atendimento a vulneráveis',
    evidence: ['Estudo de Viabilidade Social', 'Parecer Médico'],
    responsible: 'Coordenação de Saúde',
  },
  {
    initiativeId: 'INIT-03',
    initiativeTitle: 'Portal Transparência Blockchain',
    type: 'PROCESSO',
    associatedValue: 'Transparência Absoluta',
    strategicObjective: 'Governança & Transparência Enterprise',
    alignmentScore: 99,
    impactOnMission: 'Consolida a confiança dos doadores e a auditabilidade pública',
    evidence: ['Audit Trail ISO 37000', 'Certificado EIGCAP'],
    responsible: 'CGO',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEMAIVGPService = {

  async getMissionStatement(): Promise<MissionStatement> {
    const snap = await getDocs(collection(db, 'emaivgp_statement'));
    if (snap.empty) {
      const ref = await addDoc(collection(db, 'emaivgp_statement'), { ...SEED_MISSION, updatedAt: serverTimestamp() });
      return { id: ref.id, ...SEED_MISSION };
    }
    return mapDoc<MissionStatement>(snap.docs[0]);
  },

  async getInitiatives(): Promise<InitiativeAlignment[]> {
    const q = query(collection(db, 'emaivgp_initiatives'), orderBy('compositeAlignmentScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const ini of SEED_INITIATIVES) {
        await addDoc(collection(db, 'emaivgp_initiatives'), { ...ini, createdAt: serverTimestamp() });
      }
      return this.getInitiatives();
    }
    return snap.docs.map(d => mapDoc<InitiativeAlignment>(d));
  },

  async getAlignmentMatrix(): Promise<AlignmentMatrixItem[]> {
    const q = query(collection(db, 'emaivgp_matrix'), orderBy('alignmentScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_MATRIX) {
        await addDoc(collection(db, 'emaivgp_matrix'), { ...item });
      }
      return this.getAlignmentMatrix();
    }
    return snap.docs.map(d => mapDoc<AlignmentMatrixItem>(d));
  },

  async getDashboardKPIs(): Promise<EMAIVGPDashboardKPIs> {
    return {
      globalMissionAlignmentScore: 96.8,
      valuesComplianceScore: 98.4,
      initiativesAudited: 42,
      fullyAlignedPercent: 92.8,
      misalignmentsBlocked: 6,
      highImpactInitiatives: 18,
      ethicsCompliancePercent: 100,
      maturityScore: 95.2,
      certificationDate: '2026-07-22',
      certificationVersion: 'EMAIVGP v1.0 — Prompt 068',
    };
  },
};
