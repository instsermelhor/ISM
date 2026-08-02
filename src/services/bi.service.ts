// ─────────────────────────────────────────────────────────────────────────────
// E019 — ENTERPRISE BI SERVICE
// Instituto Ser Melhor · EBIDWADSF Domain
// alertWhenBelow=true  → alert when currentValue < alertThreshold  (underperformance)
// alertWhenBelow=false → alert when currentValue > alertThreshold  (overload / excess)
// ─────────────────────────────────────────────────────────────────────────────
import type {
  ExecutiveDashboardData,
  KPIValue,
  SROIReport,
  DemandForecast,
  KPIAlert,
  BudgetExecutionData,
  SROIMonthlyDataPoint,
  ForecastMonthDataPoint,
  MetricDefinition,
} from '../types/bi.types';

// ── SROI Calculation Constants ───────────────────────────────────────────────
/** DIEESE reference hour value used to monetize volunteer hours (R$30/h) */
const VOLUNTEER_HOUR_VALUE_BRL = 30;

/** Average social value multiplier for cases resolved (estimated econometric proxy) */
const SOCIAL_VALUE_PER_RESOLVED_CASE_BRL = 1200;

// ── Institutional KPI Catalogue ──────────────────────────────────────────────
/** Extended MetricDefinition with alertWhenBelow semantics */
interface MetricDefinitionWithSemantics extends MetricDefinition {
  /** true = alert when value DROPS below threshold (underperformance);
   *  false = alert when value RISES above threshold (overload/excess) */
  alertWhenBelow: boolean;
}

export const INSTITUTIONAL_KPIS: MetricDefinitionWithSemantics[] = [
  // Overload: too many active cases signals capacity crisis
  { code: 'TOTAL_ACTIVE_CASES', name: 'Casos AURA Ativos', unit: 'COUNT', dataDomain: 'BENEFICIARY', alertThreshold: 500, targetValue: 400, alertWhenBelow: false },
  // Overload: too high a % of high-risk cases
  { code: 'HIGH_RISK_CASES_PCT', name: '% Casos Alto Risco', unit: 'PERCENTAGE', dataDomain: 'BENEFICIARY', targetValue: 0.15, alertThreshold: 0.25, alertWhenBelow: false },
  // Underperformance: donations falling below floor
  { code: 'MONTHLY_DONATION_BRL', name: 'Captação Mensal (R$)', unit: 'BRL', dataDomain: 'FINANCIAL', targetValue: 150000, alertThreshold: 75000, alertWhenBelow: true },
  // Underperformance: budget not being executed
  { code: 'BUDGET_EXECUTION_PCT', name: 'Execução Orçamentária', unit: 'PERCENTAGE', dataDomain: 'FINANCIAL', targetValue: 0.95, alertThreshold: 0.60, alertWhenBelow: true },
  // Underperformance: not enough volunteer hours
  { code: 'VOLUNTEER_HOURS_MTD', name: 'Horas Voluntárias Mês', unit: 'HOURS', dataDomain: 'VOLUNTEER', targetValue: 2000, alertThreshold: 500, alertWhenBelow: true },
  // Underperformance: mandatory training not completed
  { code: 'TRAINING_COMPLETION_PCT', name: '% Conclusão Treinamentos Obrigatórios', unit: 'PERCENTAGE', dataDomain: 'HR', targetValue: 0.90, alertThreshold: 0.60, alertWhenBelow: true },
  // Underperformance: SROI below minimum
  { code: 'SROI_INDEX', name: 'Índice SROI', unit: 'RATIO', dataDomain: 'IMPACT', targetValue: 3.5, alertThreshold: 2.0, alertWhenBelow: true },
  // Underperformance: too few beneficiaries served
  { code: 'BENEFICIARIES_SERVED_MTD', name: 'Beneficiários Atendidos Mês', unit: 'COUNT', dataDomain: 'BENEFICIARY', targetValue: 800, alertThreshold: 300, alertWhenBelow: true },
];

// ── SROI Calculator ──────────────────────────────────────────────────────────
export function calculateSROIIndex(
  totalDonatedBRL: number,
  volunteerHours: number,
  resolvedCases: number
): number {
  const totalInvestment = totalDonatedBRL + volunteerHours * VOLUNTEER_HOUR_VALUE_BRL;
  if (totalInvestment === 0) return 0;
  const socialValue = resolvedCases * SOCIAL_VALUE_PER_RESOLVED_CASE_BRL;
  return parseFloat((socialValue / totalInvestment).toFixed(2));
}

export function buildSROIMonthlyDataPoint(
  month: string,
  totalDonatedBRL: number,
  volunteerHours: number,
  uniqueBeneficiaries: number,
  resolvedCases: number
): SROIMonthlyDataPoint {
  const volunteerValueBRL = volunteerHours * VOLUNTEER_HOUR_VALUE_BRL;
  const totalInvestment = totalDonatedBRL + volunteerValueBRL;
  const socialValue = resolvedCases * SOCIAL_VALUE_PER_RESOLVED_CASE_BRL;
  return {
    month,
    totalDonatedBRL,
    volunteerValueBRL,
    volunteerHours,
    uniqueBeneficiariesServed: uniqueBeneficiaries,
    socialValueGeneratedBRL: socialValue,
    sroiIndex: totalInvestment > 0 ? parseFloat((socialValue / totalInvestment).toFixed(2)) : 0,
    costPerBeneficiaryBRL: uniqueBeneficiaries > 0 ? parseFloat((totalInvestment / uniqueBeneficiaries).toFixed(2)) : 0,
  };
}

// ── KPI Evaluator ────────────────────────────────────────────────────────────
export function evaluateKPI(definition: MetricDefinition, currentValue: number, previousValue?: number): KPIValue {
  const def = definition as MetricDefinition & { alertWhenBelow?: boolean };
  const isAlert = def.alertThreshold !== undefined
    ? def.alertWhenBelow !== false
      ? currentValue < def.alertThreshold          // alert when value drops below threshold
      : currentValue > def.alertThreshold          // alert when value exceeds threshold (overload)
    : false;

  const variationPct = previousValue !== undefined && previousValue !== 0
    ? parseFloat(((currentValue - previousValue) / previousValue * 100).toFixed(1))
    : undefined;

  return {
    code: definition.code,
    name: definition.name,
    unit: definition.unit,
    currentValue,
    targetValue: definition.targetValue,
    previousPeriodValue: previousValue,
    variationPct,
    isAlert,
    severity: isAlert ? 'HIGH' : undefined,
    lastUpdatedAt: new Date().toISOString(),
  };
}

// ── Demand Forecast (Simplified Linear Trend) ────────────────────────────────
export function generateDemandForecast(
  historicalCaseCounts: number[],
  horizonMonths: number
): ForecastMonthDataPoint[] {
  const n = historicalCaseCounts.length;
  if (n < 2) return [];

  // Linear regression over the historical data
  const xMean = (n - 1) / 2;
  const yMean = historicalCaseCounts.reduce((a, b) => a + b, 0) / n;
  const slope = historicalCaseCounts.reduce((acc, y, x) => acc + (x - xMean) * (y - yMean), 0) /
    historicalCaseCounts.reduce((acc, _, x) => acc + Math.pow(x - xMean, 2), 0);
  const intercept = yMean - slope * xMean;

  return Array.from({ length: horizonMonths }, (_, i) => {
    const projected = Math.round(Math.max(0, intercept + slope * (n + i)));
    const margin = Math.round(projected * 0.15);
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth() + i + 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      month,
      projectedCases: projected,
      lowerBound: Math.max(0, projected - margin),
      upperBound: projected + margin,
      requiredPsychologists: Math.ceil(projected / 25),
      requiredSocialWorkers: Math.ceil(projected / 40),
      confidenceScore: 0.85,
    };
  });
}

// ── Active Alerts Builder ────────────────────────────────────────────────────
export function buildActiveAlerts(kpis: KPIValue[]): KPIAlert[] {
  return kpis
    .filter(k => k.isAlert)
    .map(k => ({
      id: `alert-${k.code}-${Date.now()}`,
      kpiCode: k.code,
      kpiName: k.name,
      currentValue: k.currentValue,
      thresholdValue: INSTITUTIONAL_KPIS.find(d => d.code === k.code)?.alertThreshold ?? 0,
      severity: k.severity ?? 'MEDIUM',
      status: 'ACTIVE' as const,
      triggeredAt: new Date().toISOString(),
      message: `KPI "${k.name}" atingiu nível de alerta: ${k.currentValue} (limiar: ${INSTITUTIONAL_KPIS.find(d => d.code === k.code)?.alertThreshold ?? '—'})`,
    }));
}

// ── Executive Dashboard Builder ──────────────────────────────────────────────
export function buildExecutiveDashboard(
  kpiValues: Record<string, number>,
  sroiHistory: SROIMonthlyDataPoint[],
  forecastHistory: number[],
  budgetData: BudgetExecutionData[]
): ExecutiveDashboardData {
  const kpis = INSTITUTIONAL_KPIS.map(def => evaluateKPI(def, kpiValues[def.code] ?? 0));
  const activeAlerts = buildActiveAlerts(kpis);

  const sroiLast = sroiHistory[sroiHistory.length - 1];
  const sroi: SROIReport = {
    period: sroiLast?.month ?? '',
    totalInvestmentBRL: sroiLast ? sroiLast.totalDonatedBRL + sroiLast.volunteerValueBRL : 0,
    socialValueGeneratedBRL: sroiLast?.socialValueGeneratedBRL ?? 0,
    sroiIndex: sroiLast?.sroiIndex ?? 0,
    uniqueBeneficiariesServed: sroiLast?.uniqueBeneficiariesServed ?? 0,
    costPerBeneficiaryBRL: sroiLast?.costPerBeneficiaryBRL ?? 0,
    totalVolunteerHours: sroiLast?.volunteerHours ?? 0,
    totalDonatedBRL: sroiLast?.totalDonatedBRL ?? 0,
    monthlyHistory: sroiHistory,
  };

  const forecast: DemandForecast = {
    generatedAt: new Date().toISOString(),
    forecastHorizonMonths: 6,
    monthlyForecast: generateDemandForecast(forecastHistory, 6),
    requiresHumanReview: true,
    modelAccuracy: 0.87,
  };

  return {
    kpis,
    sroi,
    forecast,
    activeAlerts,
    budgetExecution: budgetData,
    lastRefreshedAt: new Date().toISOString(),
  };
}
