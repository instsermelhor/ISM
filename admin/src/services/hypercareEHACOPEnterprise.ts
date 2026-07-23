/**
 * hypercareEHACOPEnterprise.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Hypercare, Adoption & Continuous Optimization Platform
 * Instituto Ser Melhor — Prompt 073 — Plataforma ISM v2.0
 *
 * Padrões: ITIL 4, DevSecOps, SRE, Lean Six Sigma, ISO 20000, ISO 22301,
 *          ISO 42001, Customer Success, Enterprise Service Management
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, addDoc, getDocs,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firestore';

// ── Enumerações ───────────────────────────────────────────────────────────────

export type IncidentSeverity = 'P1_CRITICO' | 'P2_ALTO' | 'P3_MEDIO' | 'P4_BAIXO';
export type IncidentStatus = 'EM_INVESTIGACAO' | 'MITIGADO' | 'RESOLVIDO' | 'FECHADO';
export type AdoptionLevel = 'EXCELENTE' | 'ALTA' | 'MODERADA' | 'REQUER_TREINAMENTO';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface OperationalIncidentEHACOP {
  id: string;
  ticketCode: string; // ex: "HYP-2026-001"
  summary: string;
  affectedModule: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  mttrMinutes: number; // Mean Time To Resolve
  mtbfHours: number;   // Mean Time Between Failures
  rootCauseCategory: string;
  aiSuggestedFix: string;
  slaComplied: boolean;
  reportedAt: string;
  resolvedAt?: string;
  createdAt?: unknown;
}

export interface ModuleAdoptionMetric {
  id: string;
  moduleName: string;
  activeUsersCount: number;
  monthlyActiveUsersTarget: number;
  adoptionPercentage: number; // 0-100%
  adoptionLevel: AdoptionLevel;
  avgDailySessionMinutes: number;
  npsScore: number;  // -100 a +100
  csatScore: number; // %
  dropOffRatePercent: number;
  recommendationToBoost: string;
}

export interface HypercarePhaseStatus {
  id: string;
  phaseName: string;
  timeframe: string; // ex: "0-30 Dias", "30-90 Dias", "90-180 Dias"
  stabilityScore: number; // 0-100
  adoptionScore: number;  // 0-100
  milestonesAchieved: string[];
  bauTransitionReady: boolean;
}

export interface EHACOPDashboardKPIs {
  globalPlatformHealthScore: number; // 0-100
  overallUptimePercent: number;       // 99.98%
  activeIncidentsCount: number;
  avgMttrMinutes: number;             // 8.4 min
  overallAdoptionRate: number;        // 96.4%
  globalNps: number;                  // 88 pts
  globalCsat: number;                 // 97%
  bauReadinessStatus: 'PRONTO_PARA_BAU' | 'HYPERCARE_ATIVO' | 'REQUER_ESTABILIZACAO';
  certificationDate: string;
  certificationVersion: string;
}

// ── Dados Seed ────────────────────────────────────────────────────────────────

const SEED_INCIDENTS: Omit<OperationalIncidentEHACOP, 'id' | 'createdAt'>[] = [
  {
    ticketCode: 'HYP-2026-001',
    summary: 'Aumento pontual de latência no upload de anexos do Prontuário EHR',
    affectedModule: 'EHR Enterprise (Prompt 015)',
    severity: 'P3_MEDIO',
    status: 'RESOLVIDO',
    mttrMinutes: 12,
    mtbfHours: 720,
    rootCauseCategory: 'Gargalo em quota de upload simultâneo',
    aiSuggestedFix: 'Autoincremento de thread pool no Cloud Storage + compressão local WebWorker.',
    slaComplied: true,
    reportedAt: '2026-07-22T08:15:00Z',
    resolvedAt: '2026-07-22T08:27:00Z',
  },
  {
    ticketCode: 'HYP-2026-002',
    summary: 'Dúvida recorrente no filtro de indicadores de SROI',
    affectedModule: 'ESIIMP (Prompt 064)',
    severity: 'P4_BAIXO',
    status: 'FECHADO',
    mttrMinutes: 5,
    mtbfHours: 1440,
    rootCauseCategory: 'Treinamento de Usabilidade',
    aiSuggestedFix: 'Ativação de tooltip interativo e guia guiado no Onboarding.',
    slaComplied: true,
    reportedAt: '2026-07-22T10:30:00Z',
    resolvedAt: '2026-07-22T10:35:00Z',
  },
];

const SEED_ADOPTION: Omit<ModuleAdoptionMetric, 'id'>[] = [
  { moduleName: 'EHR Enterprise & Telemedicina', activeUsersCount: 1850, monthlyActiveUsersTarget: 1800, adoptionPercentage: 100, adoptionLevel: 'EXCELENTE', avgDailySessionMinutes: 45, npsScore: 92, csatScore: 98, dropOffRatePercent: 1.2, recommendationToBoost: 'Excelente adesão médica. Manter suporte assistido via chat.' },
  { moduleName: 'Portal do Beneficiário & App', activeUsersCount: 14200, monthlyActiveUsersTarget: 15000, adoptionPercentage: 94.6, adoptionLevel: 'ALTA', avgDailySessionMinutes: 12, npsScore: 89, csatScore: 96, dropOffRatePercent: 3.4, recommendationToBoost: 'Lançar campanha de engajamento para agendamento automático.' },
  { moduleName: 'Gêmeo Digital ECDTISP & Cenários', activeUsersCount: 38, monthlyActiveUsersTarget: 40, adoptionPercentage: 95.0, adoptionLevel: 'EXCELENTE', avgDailySessionMinutes: 28, npsScore: 95, csatScore: 99, dropOffRatePercent: 0.5, recommendationToBoost: 'Disponibilizar relatórios executivos automatizados quinzenais.' },
  { moduleName: 'Governança & Compliance EIGCAP', activeUsersCount: 52, monthlyActiveUsersTarget: 50, adoptionPercentage: 100, adoptionLevel: 'EXCELENTE', avgDailySessionMinutes: 20, npsScore: 94, csatScore: 98, dropOffRatePercent: 0.0, recommendationToBoost: 'Pleno alinhamento do Conselho Deliberativo.' },
];

const SEED_PHASES: Omit<HypercarePhaseStatus, 'id'>[] = [
  { phaseName: 'Hypercare Inicial (0-30 Dias Pós-Go-Live)', timeframe: 'Agosto de 2026', stabilityScore: 99.8, adoptionScore: 96.4, milestonesAchieved: ['Zero incidentes P1/P2', 'War Room 24/7 ativa', 'Adoção > 94% em todos os módulos'], bauTransitionReady: true },
  { phaseName: 'Estabilização Assistida (30-90 Dias)', timeframe: 'Setembro a Outubro de 2026', stabilityScore: 99.9, adoptionScore: 98.2, milestonesAchieved: ['Otimização contínua de rotas de IA', 'Treinamento de reciclagem de equipes'], bauTransitionReady: true },
  { phaseName: 'Transição para Operação Permanente (BAU - 90+ Dias)', timeframe: 'Novembro de 2026+', stabilityScore: 99.99, adoptionScore: 99.0, milestonesAchieved: ['Operação plenamente autônoma supervisionada', 'Transferência de suporte para Nível 1/2 regular'], bauTransitionReady: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const mapDoc = <T>(d: { id: string; data(): Record<string, unknown> }): T =>
  ({ id: d.id, ...d.data() } as T);

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseEHACOPService = {

  async getIncidents(): Promise<OperationalIncidentEHACOP[]> {
    const q = query(collection(db, 'ehacop_incidents'), orderBy('reportedAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_INCIDENTS) {
        await addDoc(collection(db, 'ehacop_incidents'), { ...item, createdAt: serverTimestamp() });
      }
      return this.getIncidents();
    }
    return snap.docs.map(d => mapDoc<OperationalIncidentEHACOP>(d));
  },

  async getAdoptionMetrics(): Promise<ModuleAdoptionMetric[]> {
    const q = query(collection(db, 'ehacop_adoption'), orderBy('adoptionPercentage', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_ADOPTION) {
        await addDoc(collection(db, 'ehacop_adoption'), { ...item });
      }
      return this.getAdoptionMetrics();
    }
    return snap.docs.map(d => mapDoc<ModuleAdoptionMetric>(d));
  },

  async getPhases(): Promise<HypercarePhaseStatus[]> {
    const q = query(collection(db, 'ehacop_phases'));
    const snap = await getDocs(q);
    if (snap.empty) {
      for (const item of SEED_PHASES) {
        await addDoc(collection(db, 'ehacop_phases'), { ...item });
      }
      return this.getPhases();
    }
    return snap.docs.map(d => mapDoc<HypercarePhaseStatus>(d));
  },

  async getDashboardKPIs(): Promise<EHACOPDashboardKPIs> {
    return {
      globalPlatformHealthScore: 99.4,
      overallUptimePercent: 99.98,
      activeIncidentsCount: 0,
      avgMttrMinutes: 8.4,
      overallAdoptionRate: 97.2,
      globalNps: 91,
      globalCsat: 98,
      bauReadinessStatus: 'PRONTO_PARA_BAU',
      certificationDate: '2026-07-22',
      certificationVersion: 'EHACOP v1.0 — Transição Oficial para Operação Permanente (BAU)',
    };
  },
};
