/**
 * StrategicGovernancePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Governança Estratégica, Planejamento Institucional, ESG, ODS, BSC & OKRs
 * Instituto Ser Melhor — Prompt 041 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre Executiva (CEO/CSO)  — KPIs Presidência: SROI, Beneficiários, OKR, ESG Score
 *   2. Mapa Estratégico & BSC     — 12 Objetivos em 6 Perspectivas do Balanced Scorecard
 *   3. OKRs 2026                  — Objectives & Key Results com progresso em tempo real
 *   4. ESG & ODS                  — Matriz GRI × SDGs com rastreabilidade de indicadores
 *   5. Deliberações do Conselho   — Registro digital de decisões com assinatura ICP-Brasil
 *   6. Gestão de Riscos (COSO)    — Mapa de Calor + Planos de Tratamento por categoria
 *   7. KPIs Executivos            — Indicadores consolidados por perspectiva BSC
 *   8. IA Estratégica & Cenários  — Recomendações, Simulações e Alertas Estratégicos por IA
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  StrategicGovernanceEnterpriseService,
  type StrategicObjective, type OKRRecord, type ESGODSEntry,
  type GovernanceDecision, type StrategicRisk, type ExecutiveKPI,
  type StrategicGovernanceKPIs, type BSCPerspective, type ESGPillar,
} from '../services/strategicGovernanceEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre Executiva',
  'Mapa Estratégico & BSC',
  'OKRs 2026',
  'ESG & ODS',
  'Deliberações',
  'Riscos Estratégicos',
  'KPIs Executivos',
  'IA Estratégica',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre Executiva': '🏛️',
  'Mapa Estratégico & BSC': '🗺️',
  'OKRs 2026': '🎯',
  'ESG & ODS': '🌱',
  'Deliberações': '⚖️',
  'Riscos Estratégicos': '⚠️',
  'KPIs Executivos': '📊',
  'IA Estratégica': '🤖',
};

// ── BSC Perspective Config ────────────────────────────────────────────────────

const BSC_CONFIG: Record<BSCPerspective, { label: string; color: string; bg: string; icon: string }> = {
  FINANCEIRA:         { label: 'Financeira',         color: '#059669', bg: '#d1fae5', icon: '💰' },
  BENEFICIARIOS:      { label: 'Beneficiários',      color: '#2563eb', bg: '#dbeafe', icon: '👥' },
  PROCESSOS_INTERNOS: { label: 'Processos Internos', color: '#7c3aed', bg: '#ede9fe', icon: '⚙️' },
  APRENDIZADO_INOVACAO:{ label: 'Aprendizado & Inovação', color: '#d97706', bg: '#fef3c7', icon: '🚀' },
  IMPACTO_SOCIAL:     { label: 'Impacto Social',     color: '#dc2626', bg: '#fee2e2', icon: '❤️' },
  SUSTENTABILIDADE:   { label: 'Sustentabilidade',   color: '#0891b2', bg: '#cffafe', icon: '🌱' },
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

// ── Tab 1: Torre Executiva ─────────────────────────────────────────────────────

function TorreExecutivaTab() {
  const [kpis, setKpis] = useState<StrategicGovernanceKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getDashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando Torre Executiva...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Headline Estratégico */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
        borderRadius: 16, padding: '24px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Governança Estratégica Institucional</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>Plano Estratégico 2026–2028</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            {kpis?.strategicObjectivesCount} Objetivos Estratégicos · 9 ODS Cobertos · ESG Score {kpis?.esgScorePct}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Progresso Geral do Plano</div>
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{kpis?.overallStrategicProgressPct}%</div>
        </div>
      </div>

      {/* KPIs Presidência */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 12 }}>
        <KpiCard icon="👥" label="Beneficiários Impactados" value={kpis?.impactedBeneficiaries.toLocaleString('pt-BR') ?? '0'} sub="2026 YTD" color="#2563eb" />
        <KpiCard icon="💰" label="SROI" value={`R$ ${kpis?.sroi.toFixed(1)}/R$1`} sub="Retorno Social" color="#059669" />
        <KpiCard icon="🎯" label="OKRs On Track" value={`${kpis?.okrOnTrackPct}%`} color="#7c3aed" />
        <KpiCard icon="🌱" label="ESG Score Consolidado" value={`${kpis?.esgScorePct}%`} color="#0891b2" />
        <KpiCard icon="⚠️" label="Riscos Estratégicos" value={String(kpis?.openRisksCount ?? 0)} alert={(kpis?.criticalRisksCount ?? 0) > 0} color="#d97706" sub={`${kpis?.criticalRisksCount} críticos`} />
        <KpiCard icon="⚖️" label="Deliberações em 2026" value={String(kpis?.governanceDecisionsThisYear ?? 0)} color="#4f46e5" />
      </div>

      {/* Missão · Visão · Valores */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🏛️ Missão · Visão · Valores Institucionais</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          {[
            { title: '🎯 Missão', text: 'Promover saúde mental, bem-estar social e dignidade humana, por meio de atendimentos integrais, acessíveis e baseados em evidências, transformando vidas e construindo uma sociedade mais justa e equânime.', color: '#2563eb' },
            { title: '🌟 Visão', text: 'Ser reconhecido como referência nacional em saúde mental, assistência social e inovação no terceiro setor, impactando positivamente 50.000 vidas até 2030.', color: '#059669' },
            { title: '💎 Valores', text: 'Ética · Transparência · Solidariedade · Inovação · Excelência · Respeito à Dignidade Humana · Comprometimento com Resultados · Responsabilidade Social', color: '#7c3aed' },
          ].map(item => (
            <div key={item.title} style={{ background: `${item.color}06`, borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${item.color}` }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: item.color, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Mapa Estratégico & BSC ─────────────────────────────────────────────

function MapaEstrategicoTab() {
  const [objectives, setObjectives] = useState<StrategicObjective[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getStrategicObjectives().then(setObjectives);
  }, []);

  const byPerspective = (perspective: BSCPerspective) =>
    objectives.filter(o => o.bscPerspective === perspective);

  const allPerspectives: BSCPerspective[] = [
    'IMPACTO_SOCIAL', 'BENEFICIARIOS', 'FINANCEIRA',
    'PROCESSOS_INTERNOS', 'APRENDIZADO_INOVACAO', 'SUSTENTABILIDADE',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Mapa Estratégico — Balanced Scorecard (BSC)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>12 Objetivos Estratégicos organizados em 6 Perspectivas · ISO 37000 · ISO 9001</p>
      </div>

      {allPerspectives.map(perspective => {
        const items = byPerspective(perspective);
        if (!items.length) return null;
        const cfg = BSC_CONFIG[perspective];
        return (
          <Card key={perspective} style={{ borderTop: `4px solid ${cfg.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{cfg.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: cfg.color }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{items.length} objetivo(s)</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(obj => (
                <div key={obj.code} style={{ background: `${cfg.color}06`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color }}>{obj.code}</span>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginTop: 2 }}>{obj.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: cfg.color }}>{obj.statusPct}%</div>
                    </div>
                  </div>
                  <ProgressBar pct={obj.statusPct} color={cfg.color} />
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {obj.odsGoals.map(ods => (
                      <Badge key={ods} label={ods} color="#059669" bg="#d1fae5" />
                    ))}
                    <Badge label={`${obj.okrsLinked} OKRs`} color="#7c3aed" bg="#ede9fe" />
                    <Badge label={`${obj.indicatorsCount} indicadores`} color="#2563eb" bg="#dbeafe" />
                    <Badge label={`P${obj.priority}`} color={obj.priority === 1 ? '#dc2626' : '#d97706'} bg={obj.priority === 1 ? '#fee2e2' : '#fef3c7'} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Tab 3: OKRs ───────────────────────────────────────────────────────────────

function OKRsTab() {
  const [okrs, setOKRs] = useState<OKRRecord[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getOKRs('2026-Q3').then(setOKRs);
  }, []);

  const statusColors = { ON_TRACK: { c: '#059669', bg: '#d1fae5' }, AT_RISK: { c: '#d97706', bg: '#fef3c7' }, OFF_TRACK: { c: '#dc2626', bg: '#fee2e2' }, COMPLETED: { c: '#7c3aed', bg: '#ede9fe' }, CANCELLED: { c: '#9ca3af', bg: '#f9fafb' } } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>OKRs — Objectives & Key Results (2026-Q3)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Alinhados ao Plano Estratégico 2026–2028 e aos ODS da ONU</p>
      </div>
      {okrs.map(okr => {
        const sc = statusColors[okr.status] ?? { c: '#6b7280', bg: '#f9fafb' };
        return (
          <Card key={okr.id} style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{okr.objective}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
                  👤 {okr.owner} · 📅 {okr.cycle} · 🎯 Obj: {okr.strategicObjectiveCode}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: sc.c }}>{okr.overallProgressPct}%</div>
                <Badge label={okr.status.replace('_', ' ')} color={sc.c} bg={sc.bg} />
              </div>
            </div>
            <ProgressBar pct={okr.overallProgressPct} color={sc.c} />
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {okr.keyResults.map(kr => (
                <div key={kr.krId} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{kr.description}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed' }}>{kr.progressPct}%</div>
                  </div>
                  <ProgressBar pct={kr.progressPct} color="#7c3aed" />
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                    Atual: <strong>{kr.currentValue.toLocaleString('pt-BR')}</strong> {kr.unit} · Meta: {kr.targetValue.toLocaleString('pt-BR')} {kr.unit}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Tab 4: ESG & ODS ──────────────────────────────────────────────────────────

function ESGTab() {
  const [entries, setEntries] = useState<ESGODSEntry[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getESGODSMatrix().then(setEntries);
  }, []);

  const trendIcon = (t: string) => t === 'IMPROVING' ? '📈' : t === 'STABLE' ? '➡️' : '📉';
  const trendColor = (t: string) => t === 'IMPROVING' ? '#059669' : t === 'STABLE' ? '#6b7280' : '#dc2626';
  const pillarConfig: Record<ESGPillar, { label: string; color: string; bg: string; icon: string }> = {
    ENVIRONMENTAL: { label: 'Environmental', color: '#059669', bg: '#d1fae5', icon: '🌿' },
    SOCIAL: { label: 'Social', color: '#2563eb', bg: '#dbeafe', icon: '👥' },
    GOVERNANCE: { label: 'Governance', color: '#7c3aed', bg: '#ede9fe', icon: '⚖️' },
  };

  const odsGoalsAll = [
    { id: 'ODS 1', name: 'Erradicação da Pobreza', icon: '🏚️' },
    { id: 'ODS 3', name: 'Saúde e Bem-Estar', icon: '❤️' },
    { id: 'ODS 4', name: 'Educação de Qualidade', icon: '📚' },
    { id: 'ODS 5', name: 'Igualdade de Gênero', icon: '♀️' },
    { id: 'ODS 8', name: 'Trabalho Decente', icon: '💼' },
    { id: 'ODS 9', name: 'Inovação e Infraestrutura', icon: '🔧' },
    { id: 'ODS 10', name: 'Redução das Desigualdades', icon: '⚖️' },
    { id: 'ODS 16', name: 'Paz, Justiça e Instituições', icon: '🕊️' },
    { id: 'ODS 17', name: 'Parcerias Globais', icon: '🤝' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ODS Grid */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>🌍 ODS Cobertos — Instituto Ser Melhor</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {odsGoalsAll.map(ods => (
            <div key={ods.id} style={{ background: '#d1fae5', border: '1.5px solid #059669', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{ods.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 11, color: '#059669' }}>{ods.id}</div>
                <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.3 }}>{ods.name}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ESG Indicators */}
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#111827' }}>📊 Indicadores ESG — GRI Standards</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(e => {
            const pc = pillarConfig[e.pillar];
            return (
              <div key={e.id} style={{ background: `${pc.color}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `4px solid ${pc.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#111827' }}>{e.indicator}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{e.odsGoal} — {e.odsGoalName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Badge label={`${pc.icon} ${pc.label}`} color={pc.color} bg={pc.bg} />
                    <span style={{ fontSize: 14 }}>{trendIcon(e.performanceTrend)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#374151' }}>
                  Atual: <strong style={{ color: trendColor(e.performanceTrend) }}>{e.currentValue} {e.unit}</strong> · Meta: {e.targetValue} {e.unit}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {e.reportingFramework.map(f => (
                    <Badge key={f} label={f} color="#6b7280" bg="#f3f4f6" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 5: Deliberações do Conselho ───────────────────────────────────────────

function DeliberacoesTab() {
  const [decisions, setDecisions] = useState<GovernanceDecision[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getGovernanceDecisions().then(setDecisions);
  }, []);

  const bodyColors: Record<string, { color: string; bg: string }> = {
    CONSELHO: { color: '#7c3aed', bg: '#ede9fe' },
    DIRETORIA: { color: '#2563eb', bg: '#dbeafe' },
    PRESIDENCIA: { color: '#dc2626', bg: '#fee2e2' },
    COMITE: { color: '#d97706', bg: '#fef3c7' },
    AUDITORIA: { color: '#059669', bg: '#d1fae5' },
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#111827' }}>Deliberações e Registro de Decisões — ISO 37000</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {decisions.map(d => {
          const bc = bodyColors[d.body] ?? { color: '#6b7280', bg: '#f9fafb' };
          return (
            <Card key={d.id} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af' }}>{d.decisionId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>📅 {fmtDateTime(d.decidedAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Badge label={d.body} color={bc.color} bg={bc.bg} />
                  {d.unanimousVote && <Badge label="✓ UNÂNIME" color="#059669" bg="#d1fae5" />}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                "{d.decisionText}"
              </div>
              <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                🔐 {d.digitalSignatureHash}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 6: Riscos Estratégicos (COSO ERM) ─────────────────────────────────────

function RiscosTab() {
  const [risks, setRisks] = useState<StrategicRisk[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getStrategicRisks().then(setRisks);
  }, []);

  const levelColor = { CRITICO: { c: '#7f1d1d', bg: '#fef2f2' }, ALTO: { c: '#dc2626', bg: '#fee2e2' }, MEDIO: { c: '#d97706', bg: '#fef3c7' }, BAIXO: { c: '#059669', bg: '#d1fae5' } } as const;
  const strategyColor = { MITIGAR: '#2563eb', ACEITAR: '#6b7280', TRANSFERIR: '#7c3aed', EVITAR: '#dc2626' } as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Gestão de Riscos Estratégicos — COSO ERM · ISO 31000</h2>
      {risks.map(r => {
        const iLevel = levelColor[r.inherentRiskLevel] ?? { c: '#6b7280', bg: '#f9fafb' };
        const rLevel = levelColor[r.residualRiskLevel] ?? { c: '#6b7280', bg: '#f9fafb' };
        const sColor = strategyColor[r.treatmentStrategy] ?? '#6b7280';
        return (
          <Card key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af' }}>{r.riskId} · {r.category}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{r.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Inerente</div>
                <Badge label={r.inherentRiskLevel} color={iLevel.c} bg={iLevel.bg} />
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Residual</div>
                <Badge label={r.residualRiskLevel} color={rLevel.c} bg={rLevel.bg} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, background: `${sColor}18`, color: sColor, padding: '4px 10px', borderRadius: 8, fontWeight: 800 }}>
                🛡 Estratégia: {r.treatmentStrategy}
              </span>
              <span style={{ fontSize: 10, color: '#6b7280', padding: '4px 0' }}>👤 {r.owner}</span>
              {r.odsImpact && <Badge label={r.odsImpact} color="#059669" bg="#d1fae5" />}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
              📋 {r.treatmentPlan}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Tab 7: KPIs Executivos ────────────────────────────────────────────────────

function KPIsTab() {
  const [kpis, setKPIs] = useState<ExecutiveKPI[]>([]);

  useEffect(() => {
    StrategicGovernanceEnterpriseService.getExecutiveKPIs().then(setKPIs);
  }, []);

  const catConfig: Record<string, { label: string; color: string; icon: string }> = {
    ASSISTENCIAL: { label: 'Assistencial', color: '#2563eb', icon: '❤️' },
    FINANCEIRO: { label: 'Financeiro', color: '#059669', icon: '💰' },
    IMPACTO_SOCIAL: { label: 'Impacto Social', color: '#dc2626', icon: '🌍' },
    GOVERNANCA: { label: 'Governança', color: '#7c3aed', icon: '⚖️' },
    TECNOLOGIA: { label: 'Tecnologia', color: '#0891b2', icon: '⚡' },
    RH: { label: 'RH & Pessoas', color: '#d97706', icon: '👤' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>KPIs Executivos Consolidados — Todas as Perspectivas BSC</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {kpis.map(kpi => {
          const cc = catConfig[kpi.category] ?? { label: kpi.category, color: '#6b7280', icon: '📊' };
          const isAlert = kpi.performancePct < kpi.alertThreshold;
          return (
            <div key={kpi.id} style={{
              background: '#fff', border: `1.5px solid ${isAlert ? '#dc2626' : '#e5e7eb'}`,
              borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Badge label={`${cc.icon} ${cc.label}`} color={cc.color} bg={`${cc.color}18`} />
                {kpi.odsAlignment && <Badge label={kpi.odsAlignment} color="#059669" bg="#d1fae5" />}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginBottom: 4 }}>{kpi.name}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: isAlert ? '#dc2626' : cc.color }}>
                {kpi.unit === 'R$' ? fmtCurrency(kpi.currentValue) : `${kpi.currentValue.toLocaleString('pt-BR')} ${kpi.unit}`}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>
                Meta: {kpi.unit === 'R$' ? fmtCurrency(kpi.targetValue) : `${kpi.targetValue.toLocaleString('pt-BR')} ${kpi.unit}`}
              </div>
              <ProgressBar pct={kpi.performancePct} color={isAlert ? '#dc2626' : cc.color} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4, color: '#9ca3af' }}>
                <span>{kpi.performancePct.toFixed(1)}% da meta</span>
                <span>{kpi.trend === 'UP' ? '📈' : kpi.trend === 'DOWN' ? '📉' : '➡️'} {kpi.period}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StrategicGovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre Executiva');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#1e3a5f,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Governança Estratégica & Executive Intelligence
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Plano Estratégico 2026–2028 · BSC · OKRs · 9 ODS Cobertos · ESG Score 91.4% · SROI R$ 4.8/R$1 · ISO 37000
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
                color: activeTab === tab ? '#1e3a5f' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre Executiva' && <TorreExecutivaTab />}
      {activeTab === 'Mapa Estratégico & BSC' && <MapaEstrategicoTab />}
      {activeTab === 'OKRs 2026' && <OKRsTab />}
      {activeTab === 'ESG & ODS' && <ESGTab />}
      {activeTab === 'Deliberações' && <DeliberacoesTab />}
      {activeTab === 'Riscos Estratégicos' && <RiscosTab />}
      {activeTab === 'KPIs Executivos' && <KPIsTab />}

      {activeTab === 'IA Estratégica' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40 }}>🤖</div>
              <h3 style={{ margin: '10px 0 4px', fontSize: 18, color: '#111827' }}>IA Estratégica — Assistente Executivo Inteligente</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Análise de Cenários · Projeções · Alertas · Resumos para Conselho e Diretoria</p>
            </div>
            {[
              { icon: '🎯', title: 'Alerta Estratégico — OKR em Risco', body: 'KR-03 "Redução do tempo médio de espera" está em 70% com 38 dias restantes no ciclo. Tendência atual indica atingimento de 84% da meta. Recomendação: revisar capacidade de agenda ou ampliar telemedicina.', color: '#d97706' },
              { icon: '💡', title: 'Oportunidade — Captação de Recursos', body: 'Identificado alinhamento entre OE-02 e Edital BNDES 2026 (ESG · Saúde Mental). Prazo: 90 dias. Potencial: R$ 2,4M. Probabilidade de aprovação: 78% (baseado em editais anteriores e perfil da instituição).', color: '#059669' },
              { icon: '📊', title: 'Resumo Executivo Automático — Q3 2026', body: 'Progresso geral do Plano Estratégico: 78.4% (+6.2pp vs Q2). SROI acumulado: R$ 4.8. Beneficiários impactados: 12.840. Riscos críticos: 1 (em tratamento). ESG Score: 91.4%. Recomendação: manter ritmo e priorizar OE-02.', color: '#2563eb' },
            ].map(a => (
              <div key={a.title} style={{ background: `${a.color}06`, borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${a.color}`, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{a.body}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 6 }}>⚠️ Recomendação gerada por IA · Validação humana obrigatória antes de qualquer deliberação</div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
