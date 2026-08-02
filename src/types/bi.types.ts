// ─────────────────────────────────────────────────────────────────────────────
// E019 — ENTERPRISE BI & ANALYTICS TYPES
// Instituto Ser Melhor · EBIDWADSF Domain
// ─────────────────────────────────────────────────────────────────────────────

// ── Data Layers ─────────────────────────────────────────────────────────────
export type DataLayer = 'RAW' | 'CURATED' | 'SEMANTIC' | 'MART';

export type MetricUnit =
  | 'COUNT'
  | 'PERCENTAGE'
  | 'BRL'
  | 'HOURS'
  | 'RATIO'
  | 'DAYS';

export type DataDomain =
  | 'BENEFICIARY'
  | 'FINANCIAL'
  | 'HR'
  | 'VOLUNTEER'
  | 'OPERATIONAL'
  | 'IMPACT';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

// ── Metric Definition ────────────────────────────────────────────────────────
export interface MetricDefinition {
  code: string;
  name: string;
  unit: MetricUnit;
  dataDomain: DataDomain;
  targetValue?: number;
  alertThreshold?: number;
  description?: string;
}

export interface KPIValue {
  code: string;
  name: string;
  unit: MetricUnit;
  currentValue: number;
  targetValue?: number;
  previousPeriodValue?: number;
  variationPct?: number;
  isAlert: boolean;
  severity?: AlertSeverity;
  lastUpdatedAt: string;
}

// ── SROI Types ───────────────────────────────────────────────────────────────
export interface SROIMonthlyDataPoint {
  month: string; // 'YYYY-MM'
  totalDonatedBRL: number;
  volunteerValueBRL: number;
  volunteerHours: number;
  uniqueBeneficiariesServed: number;
  socialValueGeneratedBRL: number;
  sroiIndex: number;
  costPerBeneficiaryBRL: number;
}

export interface SROIReport {
  period: string;
  totalInvestmentBRL: number;
  socialValueGeneratedBRL: number;
  sroiIndex: number;
  uniqueBeneficiariesServed: number;
  costPerBeneficiaryBRL: number;
  totalVolunteerHours: number;
  totalDonatedBRL: number;
  monthlyHistory: SROIMonthlyDataPoint[];
}

// ── Demand Forecast Types ────────────────────────────────────────────────────
export interface ForecastMonthDataPoint {
  month: string; // 'YYYY-MM'
  projectedCases: number;
  lowerBound: number;
  upperBound: number;
  requiredPsychologists: number;
  requiredSocialWorkers: number;
  confidenceScore: number; // 0–1
}

export interface DemandForecast {
  generatedAt: string;
  forecastHorizonMonths: number;
  monthlyForecast: ForecastMonthDataPoint[];
  requiresHumanReview: boolean;
  modelAccuracy: number; // 0–1
}

// ── KPI Alert Types ──────────────────────────────────────────────────────────
export interface KPIAlert {
  id: string;
  kpiCode: string;
  kpiName: string;
  currentValue: number;
  thresholdValue: number;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: string;
  message: string;
}

// ── Budget Execution ─────────────────────────────────────────────────────────
export interface BudgetExecutionData {
  costCenterCode: string;
  costCenterName: string;
  budgetedBRL: number;
  executedBRL: number;
  commitmentBRL: number;
  executionPct: number;
  variancePct: number;
}

// ── Executive Dashboard Aggregate ────────────────────────────────────────────
export interface ExecutiveDashboardData {
  kpis: KPIValue[];
  sroi: SROIReport;
  forecast: DemandForecast;
  activeAlerts: KPIAlert[];
  budgetExecution: BudgetExecutionData[];
  lastRefreshedAt: string;
}
