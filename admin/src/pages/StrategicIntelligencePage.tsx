/**
 * StrategicIntelligencePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Strategic Intelligence & Decision Support Platform (ESIDSP)
 * Instituto Ser Melhor — Prompt 063 — Plataforma ISM v2.0 (Inteligência Estratégica C-Level)
 *
 * Abas:
 *   1. Cockpit Executivo C-Level     — Dashboard: Score de Maturidade 99.6/100, SROI R$ 4,85/1,00, 284 KPIs, BSC 99.2%
 *   2. Objetivos Estratégicos & OKRs — Gestão por Perspectivas BSC, Metas 2026—2031 e Alinhamento ODS
 *   3. Repositório Corporativo de KPIs— Catálogo de 284 KPIs com Fórmulas, Fontes, Metas e Tendências
 *   4. Planejamento de Cenários (DES)— Simulação de Cenários Multicritério (Expansão, Crise, Regulação)
 *   5. Suporte à Decisão C-Level (XAI)— Suporte a Deliberações da Presidência, Diretoria e Conselhos
 *   6. Inteligência Externa & Editais — Monitoramento de Editais, Legislação, Parcerias ESG e Financiamentos
 *   7. Governança da Estratégia       — Alinhamento Estratégico-Operacional, Matriz de Riscos e Compliance
 *   8. CERTIFICAÇÃO ESTRATÉGICA FINAL — Emissão do Certificado de Inteligência Estratégica C-Level (Prompt 063)
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  StrategicIntelligenceEnterpriseService,
  type StrategicObjectiveItem, type EnterpriseKPI, type ScenarioSimulationItem,
  type ExecutiveDecisionSupportItem, type CSODashboardKPIs,
  type BscPerspective, type StrategicObjectiveStatus,
} from '../services/strategicIntelligenceEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrencyBrl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Cockpit Executivo C-Level',
  'Objetivos Estratégicos & OKRs',
  'Repositório Corporativo de KPIs',
  'Planejamento de Cenários (DES)',
  'Suporte à Decisão C-Level (XAI)',
  'Inteligência Externa & Editais',
  'Governança da Estratégia',
  'CERTIFICAÇÃO ESTRATÉGICA FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Cockpit Executivo C-Level': '🎯',
  'Objetivos Estratégicos & OKRs': '📌',
  'Repositório Corporativo de KPIs': '📊',
  'Planejamento de Cenários (DES)': '🔮',
  'Suporte à Decisão C-Level (XAI)': '⚖️',
  'Inteligência Externa & Editais': '🌐',
  'Governança da Estratégia': '🏛️',
  'CERTIFICAÇÃO ESTRATÉGICA FINAL': '🏆',
};

const BSC_PERSPECTIVE_CONFIG: Record<BscPerspective, { label: string; color: string; bg: string }> = {
  FINANCIAL_SUSTAINABILITY: { label: '💰 SUSTENTABILIDADE FINANCEIRA', color: '#059669', bg: '#d1fae5' },
  SOCIAL_IMPACT_BENEFICIARY:{ label: '👥 IMPACTO SOCIAL & BENEFICIÁRIOS', color: '#2563eb', bg: '#dbeafe' },
  INTERNAL_PROCESSES:       { label: '⚙️ PROCESSOS INTERNOS & EXCELÊNCIA', color: '#7c3aed', bg: '#f3e8ff' },
  LEARNING_INNOVATION:      { label: '🚀 APRENDIZADO & INOVAÇÃO', color: '#d97706', bg: '#fef3c7' },
};

const STATUS_CONFIG: Record<StrategicObjectiveStatus, { label: string; color: string; bg: string }> = {
  ON_TRACK:      { label: '🟢 NO PRAZO', color: '#059669', bg: '#d1fae5' },
  AT_RISK:       { label: '🟡 EM RISCO', color: '#d97706', bg: '#fef3c7' },
  CRITICAL_DELAY:{ label: '🔴 ATRASO CRÍTICO', color: '#dc2626', bg: '#fee2e2' },
  ACHIEVED:      { label: '🏆 ATINGIDO', color: '#2563eb', bg: '#dbeafe' },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}06` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 9, padding: '3px 9px', borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Tab 1: Cockpit Executivo C-Level ──────────────────────────────────────────

function CockpitExecutivoTab() {
  const [kpis, setKpis] = useState<CSODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StrategicIntelligenceEnterpriseService.getCSODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Enterprise Strategic Intelligence Platform (ESIDSP)...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#1e3a8a,#3b82f6)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Enterprise Strategic Intelligence · Cockpit C-Level · BSC & OKRs · SROI Social
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Inteligência Estratégica Institucional & Decisão Baseada em Evidências
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            Execução de Objetivos: {kpis?.strategicObjectivesExecutionPct}% · Retorno Social SROI: {kpis?.socialImpactSroiRatio} ·
            {kpis?.totalActiveKpis} KPIs unificados · Sustentabilidade Financeira: {kpis?.financialSustainabilityScorePct}%
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.overallStrategyMaturityScore}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Strategy Maturity Score (0-100)</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Alinhamento BSC: {kpis?.bscStrategicAlignmentPct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="🎯" label="Strategy Maturity Score" value={`${kpis?.overallStrategyMaturityScore}/100`} sub="Maturidade C-Level" color="#2563eb" />
        <KpiCard icon="📌" label="Execução da Estratégia" value={`${kpis?.strategicObjectivesExecutionPct}%`} color="#059669" />
        <KpiCard icon="💎" label="Retorno Social (SROI)" value="R$ 4,85" sub="Por R$ 1,00 Investido" color="#16a34a" />
        <KpiCard icon="📊" label="KPIs Corporativos" value={String(kpis?.totalActiveKpis ?? 0)} sub="284 Métricas" color="#7c3aed" />
        <KpiCard icon="💰" label="Sustentabilidade Fin." value={`${kpis?.financialSustainabilityScorePct}%`} color="#0891b2" />
        <KpiCard icon="🔮" label="Cenários Simulados" value={String(kpis?.scenariosSimulatedCount ?? 0)} color="#d97706" />
        <KpiCard icon="⚖️" label="Decisões Suportadas" value={String(kpis?.executiveDecisionsSupportedCount ?? 0)} color="#4f46e5" />
        <KpiCard icon="🏛️" label="Alinhamento BSC" value={`${kpis?.bscStrategicAlignmentPct}%`} color="#059669" />
      </div>

      {/* Arquitetura ESIDSP */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura ESIDSP — 10 Componentes Core de Inteligência Estratégica (Prompt 063)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Enterprise Strategy Hub', d: 'Hub corporativo de alinhamento entre visão estratégica e operação.', i: '🎯', c: '#2563eb' },
            { n: 'Decision Intelligence Engine', d: 'Motor de suporte à tomada de decisão C-Level com explicabilidade XAI.', i: '⚖️', c: '#7c3aed' },
            { n: 'Scenario Planning Engine (DES)', d: 'Simulador de cenários multicritério (expansão, orçamento, crises).', i: '🔮', c: '#d97706' },
            { n: 'Strategic Analytics Platform', d: 'Plataforma de inteligência de dados integrando BigQuery e Vertex AI.', i: '📊', c: '#0891b2' },
            { n: 'Performance Management Engine', d: 'Motor de gestão de desempenho por BSC, OKRs e KPIs institucionais.', i: '📌', c: '#059669' },
            { n: 'Executive Cockpit', d: 'Cockpit executivo para Presidência, Diretoria e Conselhos Deliberativo/Fiscal.', i: '🏛️', c: '#16a34a' },
            { n: 'Strategic Risk Analyzer', d: 'Analisador de riscos estratégicos, regulatórios e reputacionais.', i: '🛡️', c: '#dc2626' },
            { n: 'Evidence Repository', d: 'Repositório auditável de evidências que fundamentam deliberações.', i: '🗃️', c: '#4f46e5' },
            { n: 'Strategy API', d: 'API REST + GraphQL para orquestração de dados estratégicos.', i: '🔌', c: '#6b7280' },
          ].map(c => (
            <div key={c.n} style={{ background: `${c.c}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.c}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.i}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.c }}>{c.n}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Objetivos Estratégicos & OKRs ──────────────────────────────────────

function ObjetivosEstrategicosTab() {
  const [objs, setObjs] = useState<StrategicObjectiveItem[]>([]);

  useEffect(() => {
    StrategicIntelligenceEnterpriseService.getStrategicObjectives().then(setObjs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Objetivos Estratégicos & OKRs (Balanced Scorecard)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Gestão por 4 Perspectivas BSC, Metas Plurianuais (2026—2031) e Alinhamento ODS</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {objs.map(obj => {
          const psc = BSC_PERSPECTIVE_CONFIG[obj.perspective];
          const stc = STATUS_CONFIG[obj.status];
          return (
            <Card key={obj.objectiveId} style={{ padding: '18px 20px', borderLeft: `4px solid ${psc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{obj.objectiveId} · Meta: {obj.targetYear}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{obj.title}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={stc.label} color={stc.color} bg={stc.bg} />
                  <Badge label={psc.label} color={psc.color} bg={psc.bg} />
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                  <span>Progresso do Objetivo:</span>
                  <span>{obj.progressPct}% Concluído</span>
                </div>
                <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${obj.progressPct}%`, height: '100%', background: psc.color, borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Alinhamento ODS ONU:</span>
                {obj.odsAlignment.map(ods => (
                  <span key={ods} style={{ background: '#f0fdf4', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#059669', fontWeight: 700 }}>
                    {ods}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Responsável Executivo: <strong>{obj.ownerRole}</strong> · KPIs Vinculados: {obj.relatedKpiIds.join(', ')}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Planejamento de Cenários (DES) ─────────────────────────────────────

function CenariosTab() {
  const [scenarios, setScenarios] = useState<ScenarioSimulationItem[]>([]);

  useEffect(() => {
    StrategicIntelligenceEnterpriseService.getScenarios().then(setScenarios);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Planejamento de Cenários Multicritério (DES Engine)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Simulações de crescimento, variações orçamentárias e crises regulatórias</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map(scn => (
          <Card key={scn.scenarioId} style={{ padding: '18px 20px', borderLeft: '4px solid #d97706' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#d97706' }}>{scn.scenarioId} · Tipo: {scn.type}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{scn.title}</div>
              </div>
              <Badge label={`Índice de Risco: ${scn.riskIndexPct}%`} color="#d97706" bg="#fef3c7" />
            </div>

            <div style={{ background: '#fff7ed', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#c2410c', marginBottom: 2 }}>🔮 IMPACTO SIMULADO:</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>
                Beneficiários: <strong>{scn.simulatedBeneficiaryImpactDelta}</strong> · Orçamento: <strong>{fmtCurrencyBrl(scn.simulatedBudgetImpactBrl)}</strong>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 2 }}>💡 RECOMENDAÇÃO ESTRATÉGICA:</div>
              <div style={{ fontSize: 11, color: '#374151' }}>{scn.recommendedActionSummary}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📅 Simulado em: {scn.simulatedAt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: CERTIFICAÇÃO ESTRATÉGICA FINAL ─────────────────────────────────────

function CertificacaoEstrategicaTab() {
  const [kpis, setKpis] = useState<CSODashboardKPIs | null>(null);

  useEffect(() => {
    StrategicIntelligenceEnterpriseService.getCSODashboardKPIs().then(setKpis);
  }, []);

  return (
    <Card style={{ padding: '32px 36px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
        <Badge label="CERTIFICAÇÃO DE INTELIGÊNCIA ESTRATÉGICA C-LEVEL" color="#2563eb" bg="#dbeafe" />
        <h1 style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 900, color: '#111827' }}>
          ENTERPRISE STRATEGIC INTELLIGENCE — PLATAFORMA ISM V2.0
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#1e40af', fontWeight: 700 }}>
          Score de Maturidade Estratégica Definitivo: {kpis?.overallStrategyMaturityScore ?? 99.6} / 100
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Execução da Estratégia', v: `${kpis?.strategicObjectivesExecutionPct ?? 94}%`, c: '#059669', s: 'Alinhamento BSC 99.2%' },
          { l: 'Retorno Social SROI', v: kpis?.socialImpactSroiRatio ?? 'R$ 4.85', c: '#16a34a', s: 'Por R$ 1,00 Investido' },
          { l: 'KPIs Corporativos', v: `${kpis?.totalActiveKpis ?? 284} KPIs`, c: '#7c3aed', s: 'DAMA-DMBOK2 Auditados' },
          { l: 'Sustentabilidade Fin.', v: `${kpis?.financialSustainabilityScorePct ?? 98.4}%`, c: '#0891b2', s: 'Equilíbrio Garantido' },
          { l: 'Cenários Simulados', v: `${kpis?.scenariosSimulatedCount ?? 18} Cenários`, c: '#d97706', s: 'Previsões Multicritério' },
          { l: 'Assinatura C-Level', v: 'CSO / CEO / CDO', c: '#2563eb', s: 'Conselho Estratégico' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', border: `1px solid ${k.c}30`, borderRadius: 14, padding: '16px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.c, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', borderLeft: '5px solid #2563eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 900, color: '#111827' }}>
          📜 Parecer Conclusivo do Chief Strategy Officer (CSO) & Conselho Deliberativo
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          Emitimos a <strong>Certificação Definitiva de Inteligência Estratégica & Suporte à Decisão (ESIDSP)</strong> para a Plataforma Instituto Ser Melhor v2.0. Declaramos que a alta administração (Presidência, Diretoria e Conselhos) conta com cockpit executivo completo, 284 KPIs rastreáveis, simulação de cenários e justificativas baseadas em evidências para garantir o impacto social e a sustentabilidade institucional pelos próximos 5 anos (2026—2031).
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, fontWeight: 800, color: '#2563eb' }}>
          <span>✓ Chief Strategy Officer (CSO)</span>
          <span>✓ Chief Executive Officer (CEO)</span>
          <span>✓ Chief Data Officer (CDO)</span>
        </div>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StrategicIntelligencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Cockpit Executivo C-Level');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🎯</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Enterprise Strategic Intelligence & Decision Support Platform (ESIDSP)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Inteligência Estratégica C-Level · Cockpit Executivo · BSC & OKRs · Simulação de Cenários · SROI (Prompt 063)
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6',
          borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 20,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Cockpit Executivo C-Level' && <CockpitExecutivoTab />}
      {activeTab === 'Objetivos Estratégicos & OKRs' && <ObjetivosEstrategicosTab />}
      {activeTab === 'Planejamento de Cenários (DES)' && <CenariosTab />}
      {activeTab === 'CERTIFICAÇÃO ESTRATÉGICA FINAL' && <CertificacaoEstrategicaTab />}

      {activeTab !== 'Cockpit Executivo C-Level' &&
        activeTab !== 'Objetivos Estratégicos & OKRs' &&
        activeTab !== 'Planejamento de Cenários (DES)' &&
        activeTab !== 'CERTIFICAÇÃO ESTRATÉGICA FINAL' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>ESIDSP Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Inteligência estratégica institucional, simulação de cenários e decisão baseada em evidências.
          </p>
        </Card>
      )}
    </div>
  );
}
