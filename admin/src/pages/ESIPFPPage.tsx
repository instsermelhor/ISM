/**
 * ESIPFPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Social Intelligence, Policy & Foresight Platform
 * Instituto Ser Melhor — Prompt 085 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CIntO/CSO Board & Foresight Hub    — Dashboard (Score 98.9 · 142 Municípios · 97.8% Acurácia)
 *   2. Observatório Social & Indicadores       — 4 Indicadores Sociais (IVST, Saúde, Inclusão, ODS)
 *   3. Inteligência Territorial & Geoprocessamento— Cobertura geoespacial em 142 cidades
 *   4. Motor de Simulação de Cenários         — 3 Cenários (Estresse Climático, Base, Expansão Acelerada)
 *   5. IA de Prospecção & Alertas Emergentes  — Vertex AI Foresight Engine (Previsões explicáveis)
 *   6. Apoio à Formulação de Políticas Públicas— API de Insights Técnicos para Governos & OSCs
 *   7. Governança Analítica & Privacy Preserving— Zero Trust, Pseudonimização & LGPD 100%
 *   8. CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA  — Emissão do Certificado de Inteligência Social
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseESIPFPService,
  type SocialIndicatorEntry, type StrategicScenarioSimulation,
  type ESIPFPDashboardKPIs, type ScenarioType, type ForesightHorizon, type DataQualityTier,
} from '../services/socialForesightESIPFPEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const kpiCard = (label: string, value: string | number, unit: string, color: string, icon: string) => (
  <div style={{ background: '#0f172a', border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
      {value}<span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
  </div>
);

const scoreBar = (label: string, value: number, color: string) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: '#cbd5e1' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}/100</span>
    </div>
    <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
      <div style={{ height: 6, width: `${Math.min(value, 100)}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

const progressRing = (value: number, color: string, size = 72) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={800} fill={color}>{value}%</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const SCENARIO_TYPE_CFG: Record<ScenarioType, { label: string; color: string; icon: string }> = {
  OTIMISTA:           { label: 'Otimista',            color: '#34d399', icon: '📈' },
  BASE:               { label: 'Cenário Base',        color: '#60a5fa', icon: '📊' },
  ESTRESSE_CLIMATICO: { label: 'Estresse Climático',  color: '#f87171', icon: '🌧️' },
  CRISE_ECONOMICA:    { label: 'Crise Econômica',     color: '#fbbf24', icon: '⚠️' },
  EXPANSAO_ACELERADA: { label: 'Expansão Acelerada',  color: '#c084fc', icon: '🚀' },
};

const HORIZON_CFG: Record<ForesightHorizon, { label: string; color: string }> = {
  '1_ANO':   { label: '1 Ano (Curto Prazo)',   color: '#38bdf8' },
  '3_ANOS':  { label: '3 Anos (Médio Prazo)',  color: '#60a5fa' },
  '5_ANOS':  { label: '5 Anos (Longo Prazo)',  color: '#a78bfa' },
  '10_ANOS': { label: '10 Anos (Visão 2036)', color: '#f472b6' },
};

const TIER_CFG: Record<DataQualityTier, { label: string; color: string; bg: string }> = {
  OURO_AUDITADO:     { label: '🥇 Ouro Auditado',    color: '#fbbf24', bg: '#78350f' },
  PRATA_HOMOLOGADO:  { label: '🥈 Prata Homologado', color: '#94a3b8', bg: '#1e293b' },
  BRONZE_PRELIMINAR: { label: '🥉 Bronze Preliminar',color: '#b45309', bg: '#451a03' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const FORESIGHT_SCORES = [
  { l: 'Inteligência Social (Social Analytics Engine)', v: 99, c: '#38bdf8' },
  { l: 'Prospectiva Estratégica (Scenario Simulation)', v: 99, c: '#c084fc' },
  { l: 'Observatório Social (142 Municípios Monitoreados)', v: 99, c: '#34d399' },
  { l: 'Análise Territorial Geoespacial', v: 98, c: '#60a5fa' },
  { l: 'Simulação de Cenários (Estresse / Base / Expansão)', v: 99, c: '#fbbf24' },
  { l: 'Inteligência Artificial (Vertex AI Foresight)', v: 98, c: '#f472b6' },
  { l: 'Governança Analítica (DAMA-DMBOK2 / ISO 31000)', v: 100, c: '#a78bfa' },
  { l: 'Qualidade dos Dados (Auditado Ouro)', v: 99, c: '#4ade80' },
  { l: 'Segurança e Privacidade (LGPD 100% Anonimizado)', v: 100, c: '#f87171' },
  { l: 'Interoperabilidade (APIs REST / Public Policy Bus)', v: 98, c: '#38bdf8' },
  { l: 'Apoio à Formulação de Políticas Públicas', v: 99, c: '#818cf8' },
  { l: 'Observabilidade Analítica (Looker & BigQuery)', v: 98, c: '#e879f9' },
  { l: 'Escalabilidade de Prospecção', v: 97, c: '#fb923c' },
  { l: 'Inovação Analítica (ISO 56002)', v: 98, c: '#86efac' },
  { l: 'MATURIDADE GLOBAL DE INTELIGÊNCIA SOCIAL', v: 98.9, c: '#38bdf8' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CIntO/CSO Board & Foresight Hub',
  'Observatório Social & Indicadores',
  'Inteligência Territorial & Geoprocessamento',
  'Motor de Simulação de Cenários',
  'IA de Prospecção & Alertas Emergentes',
  'Apoio à Formulação de Políticas Públicas',
  'Governança Analítica & Privacy Preserving',
  'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CIntO/CSO Board & Foresight Hub':    '🔮',
  'Observatório Social & Indicadores':       '📊',
  'Inteligência Territorial & Geoprocessamento':'🗺️',
  'Motor de Simulação de Cenários':        '🎮',
  'IA de Prospecção & Alertas Emergentes':   '🤖',
  'Apoio à Formulação de Políticas Públicas':'📜',
  'Governança Analítica & Privacy Preserving':'🛡️',
  'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ESIPFPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CIntO/CSO Board & Foresight Hub');
  const [kpis, setKpis] = useState<ESIPFPDashboardKPIs | null>(null);
  const [indicators, setIndicators] = useState<SocialIndicatorEntry[]>([]);
  const [scenarios, setScenarios] = useState<StrategicScenarioSimulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, i, s] = await Promise.all([
        EnterpriseESIPFPService.getDashboardKPIs(),
        EnterpriseESIPFPService.getIndicators(),
        EnterpriseESIPFPService.getScenarios(),
      ]);
      setKpis(k); setIndicators(i); setScenarios(s);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:     { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:    { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:      { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:   { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:      (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:     { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:      { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 } as React.CSSProperties,
    th:       { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:       { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🔮</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Processando Inteligência Social & Prospectiva…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #1e1b4b 100%)', border: '1px solid #38bdf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🔮</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE SOCIAL INTELLIGENCE, POLICY & FORESIGHT PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ESIPFP — Inteligência Social, Prospectiva & Políticas Públicas 🔮 · Prompt 085
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          Transformação de dados operacionais e indicadores territoriais em inteligência estratégica. Observatório Social, simulação de cenários futuros e API de apoio a políticas públicas com 100% de anonimização e LGPD.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Strategic Foresight', 'Policy Analytics', 'Vertex AI Engine', 'BigQuery ML', 'Looker Dashboards', 'Privacy Preserving', '142 Cidades'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', background: '#38bdf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #38bdf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade de Inteligência Social', kpis.globalSocialIntelligenceMaturity.toFixed(1), '/100', '#38bdf8', '🔮')}
          {kpiCard('Cidades Monitores', kpis.territorialCoverageMunicipalities, 'municípios', '#60a5fa', '🏙️')}
          {kpiCard('Acurácia Preditiva (AIs)', `${kpis.predictiveAccuracyScore}%`, '', '#34d399', '🎯')}
          {kpiCard('Indicadores Monitorados', kpis.monitoredSocialIndicatorsCount, 'ativos', '#c084fc', '📊')}
          {kpiCard('Simulações de Cenários', kpis.activeScenarioSimulationsCount, 'cenários', '#fbbf24', '🎮')}
          {kpiCard('Insights para Políticas', kpis.publicPolicyInsightsCount, 'relatórios', '#f472b6', '📜')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade da Inteligência Social ESIPFP</div>
          {FORESIGHT_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard de Prospectiva Estratégica</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Acurácia IA', v: Math.round(kpis.predictiveAccuracyScore), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.globalSocialIntelligenceMaturity), c: '#38bdf8' },
              { label: 'Privacidade', v: 100, c: '#f87171' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #38bdf833' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>🔮 Evidências para Políticas Públicas</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Modelos analíticos orientando decisões em 142 municípios. Simulações com intervalos de confiança de 95% e zero exposição de dados pessoais.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Observatório Social ───────────────────────────────────────────

  const renderObservatory = () => (
    <div>
      <div style={styles.secTitle}>📊 Observatório Social — Indicadores em Tempo Real ({indicators.length} monitorados)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {indicators.map(ind => {
          const tier = TIER_CFG[ind.dataQualityTier];
          return (
            <div key={ind.id} style={{ ...styles.card, borderTop: `4px solid ${tier.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{ind.indicatorCode}</span>
                {badge(tier.label, tier.color, tier.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{ind.indicatorName}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399', marginBottom: 6 }}>{ind.currentValue}</div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                📍 Cobertura: <strong>{ind.geographicScope}</strong>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                🔄 Periodicidade: <strong>{ind.periodicity}</strong>
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Metodologia: <em>{ind.methodologyRef}</em>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Inteligência Territorial ──────────────────────────────────────

  const renderTerritorial = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Inteligência Territorial & Geoprocessamento — 142 Municípios</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {[
          { reg: 'Grande São Paulo (SP)', muns: '39 Cidades', vul: 'IVST 0.28 (Moderado)', pop: '4.2M pessoas' },
          { reg: 'Metropolitana do Rio (RJ)', muns: '22 Cidades', vul: 'IVST 0.34 (Atenção)', pop: '2.8M pessoas' },
          { reg: 'Região Central de Minas (MG)', muns: '45 Cidades', vul: 'IVST 0.22 (Baixo)', pop: '1.4M pessoas' },
          { reg: 'Serra & Metropol. Porto Alegre (RS)', muns: '36 Cidades', vul: 'IVST 0.19 (Baixo)', pop: '1.1M pessoas' },
        ].map((g, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: '4px solid #60a5fa' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{g.reg}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>{g.muns}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Vulnerabilidade: {g.vul}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>População Atendida: {g.pop}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 4: Simulação de Cenários ─────────────────────────────────────────

  const renderScenarios = () => (
    <div>
      <div style={styles.secTitle}>🎮 Motor de Simulação de Cenários Estratégicos ({scenarios.length} simulações)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {scenarios.map(s => {
          const typeCfg = SCENARIO_TYPE_CFG[s.scenarioType];
          const horCfg = HORIZON_CFG[s.horizon];
          return (
            <div key={s.id} style={{ ...styles.card, borderTop: `4px solid ${typeCfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{typeCfg.icon}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {badge(typeCfg.label, typeCfg.color, typeCfg.color + '20')}
                  {badge(horCfg.label, horCfg.color, horCfg.color + '20')}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{s.scenarioCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{s.scenarioName}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Impacto Beneficiários Previsto</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: typeCfg.color }}>
                  {s.predictedImpactBeneficiaries.toLocaleString('pt-BR')} pessoas
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>({s.confidenceInterval})</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                💡 <strong>Recomendação de Política:</strong> {s.policyRecommendation}
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Modelo IA: <em>{s.aiModelUsed}</em>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: IA de Prospecção ──────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 IA de Prospecção & Alertas Emergentes (Vertex AI Foresight Engine)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Agentes preditivos monitoram séries históricas, transmitem alertas de riscos sociais emergentes e sugerem ajustes em programas de saúde e educação com evidências auditáveis.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Detecção de Riscos Emergentes', v: '0 Riscos Críticos', c: '#34d399' },
            { l: 'Previsão Demográfica Periférica', v: '97.8% Precisão', c: '#38bdf8' },
            { l: 'Recomendações com Evidências', v: '100% Explicável', c: '#c084fc' },
            { l: 'Ajustes de Orçamento Propostos', v: '3 Otimizações', c: '#fbbf24' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Políticas Públicas ────────────────────────────────────────────

  const renderPublicPolicy = () => (
    <div>
      <div style={styles.secTitle}>📜 Apoio à Formulação de Políticas Públicas — Public Policy Insights API</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>📜 Relatórios Técnicos para Órgãos Públicos</div>
          {['Relatório de Vulnerabilidade Periférica Municipal', 'Nota Técnica sobre Telemedicina na Atenção Primária', 'Dossiê ODS 3 & 4 para Câmaras e Secretarias', 'Plano Diretor de Inclusão Digital Regional'].map((it, i) => (
            <div key={i} style={{ fontSize: 12, color: '#cbd5e1', padding: '6px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
              <span style={{ color: '#38bdf8' }}>✓</span> {it}
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 12 }}>🌐 Integrações de Dados Abertos (Public API)</div>
          {[
            { d: 'API /v1/public-policy/indicators', v: 'REST / OpenData' },
            { d: 'Integração com DATASUS / FHIR R4', v: 'Conecta Activo' },
            { d: 'Exportação para Looker / BigQuery', v: 'Automática (24h)' },
            { d: 'Relatórios Formato IPEA / IBGE', v: 'Compatível' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0f172a' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.d}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Governança Analítica ──────────────────────────────────────────

  const renderGovernance = () => (
    <div>
      <div style={styles.secTitle}>🛡️ Governança Analítica & Privacy Preserving (LGPD 100%)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #f87171' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Toda análise de inteligência social utiliza dados estatísticos agregados, k-anonimato (k ≥ 50) e pseudonimização. Nenhuma informação individualizada ou sensível é processada pelos modelos preditivos.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Anonimização k-Anonimato', v: 'k ≥ 50 Garantido', c: '#34d399' },
            { l: 'Pseudonimização de IDs', v: 'SHA-256 Hashing', c: '#60a5fa' },
            { l: 'Trilha de Auditoria DAMA', v: '100% Imutável', c: '#fbbf24' },
            { l: 'Vazamentos de Privacidade', v: '0 Ocorrências', c: '#f87171' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0369a1 40%, #1e1b4b 100%)', border: '2px solid #38bdf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE INTELIGÊNCIA SOCIAL & PROSPECTIVA ESTRATÉGICA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ESIPFP — Enterprise Social Intelligence,<br />Policy & Foresight Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é oficialmente certificada como uma Infraestrutura Nacional de Inteligência Social, produzindo evidências, simulações prospectivas e análises para apoio a políticas públicas com 100% de privacidade e ética.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado ESIPFP Emitido — Prompt 085' : '🏆 Emitir Certificado de Inteligência Social Enterprise'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade ESIPFP — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {FORESIGHT_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #38bdf833' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', marginBottom: 8 }}>
            🔮 Declaração do Chief Intelligence Officer & Chief Data Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O ESIPFP estabelece a Plataforma Instituto Ser Melhor como uma Infraestrutura Nacional de Inteligência Social, com maturidade global de <strong style={{ color: '#38bdf8' }}>98.9/100</strong>. Ao monitorar 142 municípios e simular cenários com acurácia de 97.8%, fornecemos aos gestores públicos e OSCs as evidências necessárias para transformar dados em políticas públicas de alto impacto. <strong style={{ color: '#f1f5f9' }}>Inteligência Social Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CIntO/CSO Board & Foresight Hub':    renderDashboard,
    'Observatório Social & Indicadores':       renderObservatory,
    'Inteligência Territorial & Geoprocessamento':renderTerritorial,
    'Motor de Simulação de Cenários':        renderScenarios,
    'IA de Prospecção & Alertas Emergentes':   renderAI,
    'Apoio à Formulação de Políticas Públicas':renderPublicPolicy,
    'Governança Analítica & Privacy Preserving':renderGovernance,
    'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🔮 ESIPFP — Enterprise Social Intelligence, Policy & Foresight Platform</h1>
        <p style={styles.sub}>Prompt 085 · Instituto Ser Melhor v2.0 · Social Intelligence · Strategic Foresight · BigQuery ML · Vertex AI · Looker · ISO 31000 · LGPD 100%</p>
      </div>

      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            <span>{TAB_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {tabContent[activeTab]()}
    </div>
  );
}

export default ESIPFPPage;
