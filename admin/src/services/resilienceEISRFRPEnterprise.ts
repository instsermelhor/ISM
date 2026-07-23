/**
 * resilienceEISRFRPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Sustainability, Resilience & Future Readiness Platform
 * Instituto Ser Melhor — Prompt 070 — Plataforma ISM v2.0
 *
 * Padrões: ISO 22301 (Business Continuity), ISO 31000 (Risk Management),
 *          ISO 56002 (Innovation), ISO 42001, ISO 27001, TOGAF, COBIT 2019
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type BCMThreatType = 'INDISPONIBILIDADE_CLOUD' | 'CIBERATAQUE_RANSOMWARE' | 'PERDA_TALENTOS_CHAVE' | 'CORTE_ORCAMENTARIO' | 'DESASTRE_NATURAL' | 'CRISE_REPUTACIONAL';
export type RecoveryPriority = 'RTO_IMEDIATO_15M' | 'RTO_1H' | 'RTO_4H' | 'RTO_24H' | 'RTO_72H';
export type FutureTrendCategory = 'TECNOLOGICA' | 'REGULATORIA' | 'SOCIOECONOMICA' | 'AMBIENTAL';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CriticalProcessBCM {
  id: string;
  processName: string;
  department: string;
  rto: string; // Recovery Time Objective (ex: "15 minutos")
  rpo: string; // Recovery Point Objective (ex: "0 segundos - Sync Ativo")
  priority: RecoveryPriority;
  primaryRisk: BCMThreatType;
  contingencyPlan: string;
  responsible: string;
  lastDrillDate: string;
  drillStatus: 'SUCESSO' | 'REQUER_AJUSTES' | 'PENDENTE';
  resilienceScore: number; // 0-100
  createdAt?: unknown;
}

export interface FutureForesightScenario {
  id: string;
  horizon: '5_ANOS' | '10_ANOS' | '20_ANOS';
  category: FutureTrendCategory;
  title: string;
  trendDescription: string;
  institutionalImpact: string;
  strategicMitigation: string;
  readinessLevel: number; // 0-100
  probability: 'ALTA' | 'MEDIA' | 'BAIXA';
  aiForecastConfidence: number; // 0-100
}

export interface FinancialSustainabilityMetric {
  id: string;
  metric: string;
  currentValue: string;
  targetValue: string;
  status: 'SAUDAVEL' | 'ALERTA' | 'CRITICO';
  horizonProjection: string; // ex: "Reserva de 6.4 meses até 2028"
}

export interface EISRFRPDashboardKPIs {
  globalResilienceScore: number; // 0-100
  bcmReadinessPercent: number;    // %
  financialReserveMonths: number;
  rtoComplianceRate: number;     // %
  futureReadinessScore: number;  // 0-100
  activeDrillsSuccessRate: number; // %
  maturityScore: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_BCM: Omit<CriticalProcessBCM, 'id' | 'createdAt'>[] = [
  {
    processName: 'Atendimento de Telemedicina & EHR',
    department: 'Saúde & Operações',
    rto: '15 minutos',
    rpo: '0 segundos (Multi-region Cloud Spanner/Firestore)',
    priority: 'RTO_IMEDIATO_15M',
    primaryRisk: 'INDISPONIBILIDADE_CLOUD',
    contingencyPlan: 'Failover automático multi-region GCP com modo offline de emergência sincronizado via Service Worker.',
    responsible: 'CTO + Chief Resilience Officer (CRO)',
    lastDrillDate: '2026-06-20',
    drillStatus: 'SUCESSO',
    resilienceScore: 99,
  },
  {
    processName: 'Gestão da Folha de Pagamento & Doações',
    department: 'Financeiro & RH',
    rto: '4 horas',
    rpo: '1 hora (Backup diário redundante em cofre criptografado)',
    priority: 'RTO_4H',
    primaryRisk: 'CIBERATAQUE_RANSOMWARE',
    contingencyPlan: 'Restauração via Immutability Vault isolado com chaves HSM desassociadas da rede primária.',
    responsible: 'CISO + Diretoria Financeira',
    lastDrillDate: '2026-05-15',
    drillStatus: 'SUCESSO',
    resilienceScore: 96,
  },
  {
    processName: 'Governança & Prestação de Contas (EIGCAP)',
    department: 'Governança & Compliance',
    rto: '24 horas',
    rpo: '4 horas',
    priority: 'RTO_24H',
    primaryRisk: 'CRISE_REPUTACIONAL',
    contingencyPlan: 'Ativação do Comitê de Crise com liberação do Portal de Transparência Blockchain de leitura pública.',
    responsible: 'Chief Governance Officer (CGO)',
    lastDrillDate: '2026-04-10',
    drillStatus: 'SUCESSO',
    resilienceScore: 97,
  },
];

const SEED_FORESIGHT: Omit<FutureForesightScenario, 'id'>[] = [
  {
    horizon: '5_ANOS',
    category: 'TECNOLOGICA',
    title: 'Advento da Computação Quântica Quebrando Criptografia Legada',
    trendDescription: 'Avanço de computadores quânticos exigirá transição de chaves RSA/ECC para Algoritmos Pós-Quânticos (PQC).',
    institutionalImpact: 'Risco de decodificação retroativa de prontuários históricos em repouso se não migrados a tempo.',
    strategicMitigation: 'Adoção antecipada do padrão NIST PQC (Kyber/Dilithium) no módulo de Cibersegurança em 2027.',
    readinessLevel: 92,
    probability: 'ALTA',
    aiForecastConfidence: 94,
  },
  {
    horizon: '10_ANOS',
    category: 'REGULATORIA',
    title: 'Exigência de Auditoria Algorítmica Global Obrigatória (ISO 42001+)',
    trendDescription: 'Regulamentações globais exigirão relatórios contínuos de não-discriminação e alinhamento de ética em IA.',
    institutionalImpact: 'Aumento da complexidade de compliance de modelos generativos e preditivos.',
    strategicMitigation: 'O módulo EMAIVGP e a governança ética de IA já colocam o ISM 5 anos à frente dos requisitos regulatórios.',
    readinessLevel: 98,
    probability: 'ALTA',
    aiForecastConfidence: 97,
  },
  {
    horizon: '20_ANOS',
    category: 'SOCIOECONOMICA',
    title: 'Mudança Demográfica e Transição de Doações Físicas para Ativos Digitais Programáveis',
    trendDescription: 'Novas gerações de doadores exigirão transparência algorítmica e micro-doações automatizadas via Moedas Digitais (CBDC/Smart Contracts).',
    institutionalImpact: 'Necessidade de adaptação da infraestrutura de fundraising para liquidação instantânea descentralizada.',
    strategicMitigation: 'O módulo EIRCTP já testa protótipos de ZK-Rollups e doações programáveis em laboratório de inovação.',
    readinessLevel: 90,
    probability: 'ALTA',
    aiForecastConfidence: 91,
  },
];

const SEED_FINANCIAL_METRICS: Omit<FinancialSustainabilityMetric, 'id'>[] = [
  {
    metric: 'Reserva Operacional em Meses de Custo Fixo',
    currentValue: '6.4 meses',
    targetValue: '6.0 meses',
    status: 'SAUDAVEL',
    horizonProjection: 'Projeção de sustentação da reserva acima de 6 meses até 2030.',
  },
  {
    metric: 'Índice de Diversificação de Fontes de Receita',
    currentValue: '4 canais principais',
    targetValue: '5 canais',
    status: 'SAUDAVEL',
    horizonProjection: 'Redução da dependência de convênios públicos para menos de 35% do orçamento total.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEISRFRPService = {

  async getCriticalProcesses(): Promise<CriticalProcessBCM[]> {
    const q = query(collection(db, 'eisrfrp_bcm'), orderBy('resilienceScore', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_BCM) {
        await addDoc(collection(db, 'eisrfrp_bcm'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getCriticalProcesses();
    }
    return snap.docs.map(d => mapDoc<CriticalProcessBCM>(d));
  },

  async getForesightScenarios(): Promise<FutureForesightScenario[]> {
    const q = query(collection(db, 'eisrfrp_foresight'), orderBy('readinessLevel', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_FORESIGHT) {
        await addDoc(collection(db, 'eisrfrp_foresight'), { ...item });
      }
      return this.getForesightScenarios();
    }
    return snap.docs.map(d => mapDoc<FutureForesightScenario>(d));
  },

  async getFinancialMetrics(): Promise<FinancialSustainabilityMetric[]> {
    const q = query(collection(db, 'eisrfrp_financial'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_FINANCIAL_METRICS) {
        await addDoc(collection(db, 'eisrfrp_financial'), { ...item });
      }
      return this.getFinancialMetrics();
    }
    return snap.docs.map(d => mapDoc<FinancialSustainabilityMetric>(d));
  },

  async getDashboardKPIs(): Promise<EISRFRPDashboardKPIs> {
    return {
      globalResilienceScore: 97.4,
      bcmReadinessPercent: 99.1,
      financialReserveMonths: 6.4,
      rtoComplianceRate: 100,
      futureReadinessScore: 94.8,
      activeDrillsSuccessRate: 100,
      maturityScore: 97.0,
      certificationDate: '2026-07-22',
      certificationVersion: 'EISRFRP v1.0 — Prompt 070',
    };
  },
};
