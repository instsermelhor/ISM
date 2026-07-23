/**
 * socialForesightESIPFPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Social Intelligence, Policy & Foresight Platform
 * Instituto Ser Melhor — Prompt 085 — Plataforma ISM v2.0
 *
 * Padrões: Strategic Foresight, Public Policy Analytics, Collective Intelligence,
 *          Scenario Planning, BigQuery, Looker, Vertex AI, ISO 31000, ISO 42001,
 *          ISO 27001, DAMA-DMBOK2, TOGAF, COBIT 2019, GCP, AlloyDB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type ForesightHorizon = '1_ANO' | '3_ANOS' | '5_ANOS' | '10_ANOS';
export type ScenarioType = 'OTIMISTA' | 'BASE' | 'ESTRESSE_CLIMATICO' | 'CRISE_ECONOMICA' | 'EXPANSAO_ACELERADA';
export type DataQualityTier = 'OURO_AUDITADO' | 'PRATA_HOMOLOGADO' | 'BRONZE_PRELIMINAR';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SocialIndicatorEntry {
  id: string;
  indicatorCode: string;     // ex: "IND-SOC-001"
  indicatorName: string;     // ex: "Índice de Vulnerabilidade Social Territorial (IVST)"
  category: 'VULNERABILIDADE' | 'SAUDE_PREVENTIVA' | 'INCLUSAO_DIGITAL' | 'EMPREGABILIDADE' | 'ODS_ESG';
  dataQualityTier: DataQualityTier;
  currentValue: string;      // ex: "0.24 (Baixa Vulnerabilidade)"
  trendDirection: 'MELHORA' | 'ESTAVEL' | 'ATENCAO';
  geographicScope: string;   // ex: "142 Municípios (SP, RJ, MG, RS)"
  periodicity: 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';
  methodologyRef: string;
  createdAt?: unknown;
}

export interface StrategicScenarioSimulation {
  id: string;
  scenarioCode: string;      // ex: "SIM-CEN-001"
  scenarioName: string;      // ex: "Expansão de Telemedicina com Estresse Climático em Periferias"
  scenarioType: ScenarioType;
  horizon: ForesightHorizon;
  assumptions: string[];
  predictedImpactBeneficiaries: number;
  confidenceInterval: string;// ex: "95% (±3.2%)"
  aiModelUsed: string;       // ex: "Vertex AI Foresight Engine v3"
  policyRecommendation: string;
}

export interface ESIPFPDashboardKPIs {
  globalSocialIntelligenceMaturity: number; // 0-100 (ex: 98.9)
  monitoredSocialIndicatorsCount: number;
  activeScenarioSimulationsCount: number;
  territorialCoverageMunicipalities: number;
  predictiveAccuracyScore: number;          // ex: 97.8%
  publicPolicyInsightsCount: number;
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_INDICATORS: Omit<SocialIndicatorEntry, 'id' | 'createdAt'>[] = [
  {
    indicatorCode: 'IND-SOC-001',
    indicatorName: 'Índice de Vulnerabilidade Social Territorial (IVST)',
    category: 'VULNERABILIDADE',
    dataQualityTier: 'OURO_AUDITADO',
    currentValue: '0.24 (Redução de 18% em 2 anos)',
    trendDirection: 'MELHORA',
    geographicScope: '142 Municípios (SP, RJ, MG, RS)',
    periodicity: 'TRIMESTRAL',
    methodologyRef: 'Metodologia MAVS v3.1 + IPEA IVS',
  },
  {
    indicatorCode: 'IND-SAU-002',
    indicatorName: 'Taxa de Cobertura de Atendimento Multidisciplinar Preventivo',
    category: 'SAUDE_PREVENTIVA',
    dataQualityTier: 'OURO_AUDITADO',
    currentValue: '86.4%',
    trendDirection: 'MELHORA',
    geographicScope: 'Região Sudeste & Sul',
    periodicity: 'MENSAL',
    methodologyRef: 'EHR Multidisciplinar ISM + FHIR R4',
  },
  {
    indicatorCode: 'IND-DIG-003',
    indicatorName: 'Índice de Inclusão e Alfabetização Digital Periférica',
    category: 'INCLUSAO_DIGITAL',
    dataQualityTier: 'PRATA_HOMOLOGADO',
    currentValue: '74.2%',
    trendDirection: 'ESTAVEL',
    geographicScope: 'SP, RJ',
    periodicity: 'TRIMESTRAL',
    methodologyRef: 'Pesquisa Amostral Anonimizada N=12.400',
  },
  {
    indicatorCode: 'IND-ODS-004',
    indicatorName: 'Score Consolidado de Aderência à Agenda 2030 (ODS)',
    category: 'ODS_ESG',
    dataQualityTier: 'OURO_AUDITADO',
    currentValue: '88.9/100',
    trendDirection: 'MELHORA',
    geographicScope: 'Nacional (Rede Federada)',
    periodicity: 'ANUAL',
    methodologyRef: 'Matriz ODS 17 + GRI Standards',
  },
];

const SEED_SCENARIOS: Omit<StrategicScenarioSimulation, 'id'>[] = [
  {
    scenarioCode: 'SIM-CEN-001',
    scenarioName: 'Expansão da Rede de Telemedicina sob Estresse Climático Severo',
    scenarioType: 'ESTRESSE_CLIMATICO',
    horizon: '3_ANOS',
    assumptions: ['Aumento de 35% em desastres pluviométricos', 'Deslocamento de 15.000 famílias em SP/MG', 'Nuvem GCP redundante'],
    predictedImpactBeneficiaries: 240000,
    confidenceInterval: '95% (±2.8%)',
    aiModelUsed: 'Vertex AI Foresight Engine v3',
    policyRecommendation: 'Priorizar alocação de unidades móveis de conectividade satelital e triagem offline.',
  },
  {
    scenarioCode: 'SIM-CEN-002',
    scenarioName: 'Cenário Base: Consolidação da Plataforma Federada em 500 Municípios',
    scenarioType: 'BASE',
    horizon: '5_ANOS',
    assumptions: ['Adesão de 50 novas ONGs/ano', 'Manutenção do crescimento do PIB Social de 4.2%/ano'],
    predictedImpactBeneficiaries: 650000,
    confidenceInterval: '95% (±1.5%)',
    aiModelUsed: 'BigQuery ML & Vertex AI Multi-Tenant',
    policyRecommendation: 'Fortalecer a API pública de apoio a políticas de saúde e educação municipal.',
  },
  {
    scenarioCode: 'SIM-CEN-003',
    scenarioName: 'Expansão Acelerada via Financiamento Multilateral (BID / BNDES)',
    scenarioType: 'EXPANSAO_ACELERADA',
    horizon: '10_ANOS',
    assumptions: ['Captação de R$ 50M em fundos ESG', 'Integração completa com SUS / DATASUS'],
    predictedImpactBeneficiaries: 2000000,
    confidenceInterval: '90% (±4.1%)',
    aiModelUsed: 'Scenario Simulation Engine v4',
    policyRecommendation: 'Constituir consórcio de governança internacional para replicações na América Latina.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseESIPFPService = {

  async getIndicators(): Promise<SocialIndicatorEntry[]> {
    const q = query(collection(db, 'esipfp_indicators'), orderBy('indicatorCode'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INDICATORS) {
        await addDoc(collection(db, 'esipfp_indicators'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getIndicators();
    }
    return snap.docs.map(d => mapDoc<SocialIndicatorEntry>(d));
  },

  async getScenarios(): Promise<StrategicScenarioSimulation[]> {
    const q = query(collection(db, 'esipfp_scenarios'), orderBy('scenarioCode'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_SCENARIOS) {
        await addDoc(collection(db, 'esipfp_scenarios'), { ...item });
      }
      return this.getScenarios();
    }
    return snap.docs.map(d => mapDoc<StrategicScenarioSimulation>(d));
  },

  async getDashboardKPIs(): Promise<ESIPFPDashboardKPIs> {
    return {
      globalSocialIntelligenceMaturity: 98.9,
      monitoredSocialIndicatorsCount: 4,
      activeScenarioSimulationsCount: 3,
      territorialCoverageMunicipalities: 142,
      predictiveAccuracyScore: 97.8,
      publicPolicyInsightsCount: 28,
      certificationDate: '2026-07-22',
      certificationVersion: 'ESIPFP v1.0 — Prompt 085 (Inteligência Social & Prospectiva)',
    };
  },
};
