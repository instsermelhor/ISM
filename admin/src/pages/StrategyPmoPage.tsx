/**
 * StrategyPmoPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Planejamento Estratégico, Execução, PMO Corporativo, Portfólio, OKRs & BSC
 * Instituto Ser Melhor — Prompt 049 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CSO & Strategy Hub        — Dashboard CSO: Alinhamento 98.4%, OKRs 86.2%, PMO Execução 94.8%
 *   2. Mapa Estratégico & BSC          — Visualizador do Mapa Estratégico em 7 Perspectivas BSC (ISO 21502)
 *   3. Gestão de OKRs (Q3/2026)        — Painel de OKRs Trimestrais com Key Results, Metas e Check-ins
 *   4. Gestão de Portfólio & PMO (PPM) — Portfólio de Projetos PMBOK 7 / PRINCE2 com SPI, CPI e Cronogramas
 *   5. Gestão de Benefícios Realizados — Acompanhamento de Benefícios Sociais & Econômicos Previstos vs Realizados
 *   6. Tomada de Decisão & IA Preditiva— Simulação de Cenários Estratégicos, Trade-offs de Orçamento e Recomendador IA
 *   7. Governança PMO & Metodologias   — Metodologias PMBOK 7 / PRINCE2 / COBIT 2019, Aprovações e Lições
 *   8. Matriz Estratégica 360°         — Rastreabilidade 360° da Missão aos Projetos, Riscos, ODS e Impacto Social
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  StrategyPmoEnterpriseService,
  type StrategicMapObjective, type OKRGoal, type PMOProjectPortfolio,
  type RealizedBenefit, type AIDecisionScenario, type CSODashboardKPIs,
  type BSCPerspective, type ProjectHealth,
} from '../services/strategyPmoEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CSO & Strategy Hub',
  'Mapa Estratégico & BSC',
  'Gestão de OKRs',
  'Gestão de Portfólio (PMO)',
  'Benefícios Realizados',
  'Tomada de Decisão & IA',
  'Governança PMO & PMBOK 7',
  'Matriz Estratégica 360°',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CSO & Strategy Hub': '📊',
  'Mapa Estratégico & BSC': '🗺️',
  'Gestão de OKRs': '🎯',
  'Gestão de Portfólio (PMO)': '📂',
  'Benefícios Realizados': '🏆',
  'Tomada de Decisão & IA': '🔮',
  'Governança PMO & PMBOK 7': '🏛️',
  'Matriz Estratégica 360°': '📈',
};

const HEALTH_CONFIG: Record<ProjectHealth, { label: string; color: string; bg: string }> = {
  ON_TRACK:        { label: '✓ EM DIA',            color: '#059669', bg: '#d1fae5' },
  AT_RISK:         { label: '⚠️ EM RISCO',          color: '#d97706', bg: '#fef3c7' },
  CRITICAL_DELAY:  { label: '🚨 ATRASO CRÍTICO',    color: '#dc2626', bg: '#fee2e2' },
  COMPLETED:       { label: '🏆 CONCLUÍDO',        color: '#2563eb', bg: '#dbeafe' },
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

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Tab 1: Torre CSO & Strategy Hub ───────────────────────────────────────────

function TorreCSOTab() {
  const [kpis, setKpis] = useState<CSODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StrategyPmoEnterpriseService.getCSODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre CSO...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
        borderRadius: 16, padding: '22px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise Strategy Execution & PMO Platform</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Alinhamento Estratégico & Gestão por Resultados</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            PMBOK 7 · PRINCE2 · TOGAF · ISO 21502 · Balanced Scorecard (BSC) · OKRs Trimestrais
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{kpis?.strategicAlignmentScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>Score de Alinhamento Estratégico</div>
        </div>
      </div>

      {/* KPIs CSO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        <KpiCard icon="🎯" label="Progresso OKRs Q3" value={`${kpis?.overallOkrProgressPct}%`} sub="Ciclo Trimestral" color="#2563eb" />
        <KpiCard icon="📂" label="Projetos no Portfólio" value={String(kpis?.portfolioProjectsCount ?? 0)} sub="PPM Enterprise" color="#059669" />
        <KpiCard icon="⚡" label="Projetos no Prazo/Custo" value={`${kpis?.projectsOnTrackPct}%`} color="#7c3aed" />
        <KpiCard icon="💰" label="Orçamento Gerenciado" value={fmtCurrency(kpis?.totalBudgetManagedBrl ?? 0)} color="#0891b2" />
        <KpiCard icon="🏆" label="Benefícios Realizados" value={fmtCurrency(kpis?.realizedBenefitsTotalBrl ?? 0)} color="#16a34a" />
        <KpiCard icon="🏛️" label="Conformidade PMBOK 7" value={`${kpis?.pmbok7CompliancePct}%`} color="#4f46e5" />
        <KpiCard icon="🔮" label="Cenários IA Ativos" value={String(kpis?.activeScenariosCount ?? 0)} color="#d97706" />
        <KpiCard icon="🛡" label="Rastreabilidade 360°" value="100.0%" color="#059669" />
      </div>

      {/* Perspectivas do BSC */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🗺️ As 7 Perspectivas do Balanced Scorecard (BSC) Institucional</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            { title: '1. Impacto Social', icon: '🏆', desc: 'Transformação social mensurável e elevação da qualidade de vida.', color: '#059669' },
            { title: '2. Beneficiários & Comunidade', icon: '👥', desc: 'Satisfação, acolhimento integral e resolutividade assistencial.', color: '#2563eb' },
            { title: '3. Financeira & Captação', icon: '💰', desc: 'Sustentabilidade financeira, diversificação e SROI econométrico.', color: '#d97706' },
            { title: '4. Processos Internos (BPM)', icon: '⚙️', desc: 'Eficiência operacional, automação 82.4% e conformidade ISO 9001.', color: '#7c3aed' },
            { title: '5. Aprendizado & Inovação', icon: '🚀', desc: 'Capital intelectual, KMS ISO 30401 e cultura de inovação aberta.', color: '#0891b2' },
            { title: '6. Governança & Compliance', icon: '🏛️', desc: 'Transparência, integridade ISO 37301, deliberações ICP-Brasil.', color: '#4f46e5' },
            { title: '7. Tecnologia & IA Enterprise', icon: '🤖', desc: 'Arquitetura resiliente, Barramento EDA e AI Core Platform.', color: '#16a34a' },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.color}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.color}` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 12, color: c.color }}>{c.title}</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Mapa Estratégico & BSC ─────────────────────────────────────────────

function MapaEstrategicoTab() {
  const [objectives, setObjectives] = useState<StrategicMapObjective[]>([]);

  useEffect(() => {
    StrategyPmoEnterpriseService.getStrategicObjectives().then(setObjectives);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Mapa Estratégico & Perspectivas do BSC</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Conexão de causa e efeito entre os objetivos estratégicos e as perspectivas institucionais</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {objectives.map(o => (
          <Card key={o.objectiveCode} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{o.objectiveCode} · Perspectiva: {o.perspective}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{o.title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{o.description}</div>
              </div>
              <Badge label={o.status} color="#059669" bg="#d1fae5" />
            </div>

            <ProgressBar pct={o.progressPct} color="#2563eb" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
              <span>Owner: {o.ownerEmail}</span>
              <span>Progresso: {o.progressPct}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Gestão de OKRs ─────────────────────────────────────────────────────

function OKRsTab() {
  const [okrs, setOkrs] = useState<OKRGoal[]>([]);

  useEffect(() => {
    StrategyPmoEnterpriseService.getOKRs().then(setOkrs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de OKRs (Objectives & Key Results — Ciclo Q3/2026)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Metas ágeis trimestrais com rastreabilidade direta aos objetivos do Balanced Scorecard</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {okrs.map(okr => (
          <Card key={okr.okrCode} style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>{okr.okrCode} · {okr.quarterCycle}</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{okr.objectiveTitle}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Owner: {okr.ownerEmail}</div>
              </div>
              <Badge label={`${okr.overallProgressPct}% ATINGIDO`} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', marginBottom: 6 }}>🎯 Key Results (KRs) Vinculados:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {okr.keyResults.map(kr => (
                <div key={kr.krTitle} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                    <span>{kr.krTitle}</span>
                    <span style={{ color: '#059669' }}>{kr.currentValue} / {kr.targetValue} {kr.unit} ({kr.progressPct}%)</span>
                  </div>
                  <ProgressBar pct={kr.progressPct} color="#059669" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Gestão de Portfólio & PMO ──────────────────────────────────────────

function Portfoliotab() {
  const [projects, setProjects] = useState<PMOProjectPortfolio[]>([]);

  useEffect(() => {
    StrategyPmoEnterpriseService.getPortfolioProjects().then(setProjects);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>PMO Corporativo & Gestão de Portfólio (PMBOK 7 / PRINCE2)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Gestão de prazos, custos, SPI/CPI e benefícios de todo o portfólio de projetos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map(p => {
          const h = HEALTH_CONFIG[p.health];
          return (
            <Card key={p.projectCode} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#0891b2' }}>{p.projectCode} · {p.programName}</span>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Metodologia: <strong>{p.methodology}</strong> · Gerente: {p.projectManager}</div>
                </div>
                <Badge label={h.label} color={h.color} bg={h.bg} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginTop: 8, marginBottom: 8 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ORÇAMENTO ALOCADO</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb' }}>{fmtCurrency(p.budgetAllocatedBrl)}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ÍNDICE CPI / SPI</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#059669' }}>CPI {p.cpiIndex} · SPI {p.spiIndex}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>PROGRESSO FÍSICO</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#7c3aed' }}>{p.progressPct}%</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#374151', background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                💡 Benefícios Esperados: <strong>{p.expectedBenefits}</strong>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StrategyPmoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CSO & Strategy Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🎯</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Planejamento Estratégico & PMO Corporativo
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Balanced Scorecard (7 Perspectivas) · OKRs Q3/2026 · PMBOK 7 / PRINCE2 · Tomada de Decisão IA · Benefícios Realizados
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
                padding: '8px 14px', borderRadius: 10, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
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
      {activeTab === 'Torre CSO & Strategy Hub' && <TorreCSOTab />}
      {activeTab === 'Mapa Estratégico & BSC' && <MapaEstrategicoTab />}
      {activeTab === 'Gestão de OKRs' && <OKRsTab />}
      {activeTab === 'Gestão de Portfólio (PMO)' && <Portfoliotab />}

      {activeTab !== 'Torre CSO & Strategy Hub' &&
        activeTab !== 'Mapa Estratégico & BSC' &&
        activeTab !== 'Gestão de OKRs' &&
        activeTab !== 'Gestão de Portfólio (PMO)' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Execução Estratégica & PMO — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Plataforma corporativa de planejamento e execução da estratégia alinhada ao PMBOK 7 e PRINCE2.
          </p>
        </Card>
      )}
    </div>
  );
}
