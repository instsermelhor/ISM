/**
 * EIRCTPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Innovation, Research & Continuous Transformation Platform
 * Instituto Ser Melhor — Prompt 069 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CInO/CTO Board & Innovation Hub — Dashboard ISO 56002 (Score 96.0/100)
 *   2. Portfólio & Pipeline de Inovação       — Stage-Gate: Submissão → Institucionalizado
 *   3. Laboratório de Experimentação & PoCs   — Sandbox isolado, PoCs e validação
 *   4. Radar Tecnológico Corporativo         — Scouting: Adotar, Experimentar, Observar
 *   5. Open Innovation & Parcerias           — Ecossistema com universidades e startups
 *   6. Design Thinking & Lean Startup Lab     — MVPs, validação de hipóteses e feedback
 *   7. Painéis Executivos & Analytics        — Visões CInO, CTO, CAIO e Presidência
 *   8. CERTIFICAÇÃO EIRCTP FINAL             — Parecer executivo + roadmap 5 anos
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEIRCTPService,
  type InnovationItem, type TechnologyRadarItem, type OpenInnovationPartner,
  type EIRCTPDashboardKPIs, type InnovationStage, type InnovationCategory,
  type RadarRecommendation,
} from '../services/innovationEIRCTPEnterprise';

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
      <div style={{ height: 6, width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.8s' }} />
    </div>
  </div>
);

const progressRing = (value: number, color: string, size = 70) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const STAGE_CFG: Record<InnovationStage, { label: string; color: string; bg: string }> = {
  SUBMISSAO:           { label: 'Submissão / Ideia', color: '#94a3b8', bg: '#1e293b' },
  AVALIACAO:           { label: 'Avaliação Stage-Gate', color: '#60a5fa', bg: '#1e3a5f' },
  EXPERIMENTACAO_POC:  { label: 'PoC Lab', color: '#fbbf24', bg: '#451a03' },
  VALIDACAO_MVP:       { label: 'MVP Validação', color: '#a78bfa', bg: '#2e1065' },
  ESCALABILIDADE:      { label: 'Escalabilidade', color: '#38bdf8', bg: '#0c4a6e' },
  INSTITUCIONALIZADO:  { label: 'Institucionalizado', color: '#22c55e', bg: '#14532d' },
  ARQUIVADO:           { label: 'Arquivado', color: '#ef4444', bg: '#450a0a' },
};

const CATEGORY_CFG: Record<InnovationCategory, { label: string; color: string }> = {
  INOVACAO_SOCIAL:        { label: 'Inovação Social', color: '#34d399' },
  INOVACAO_TECNOLOGICA:   { label: 'Inovação Tecnológica', color: '#60a5fa' },
  INOVACAO_EM_PROCESSO:   { label: 'Inovação em Processo', color: '#a78bfa' },
  INOVACAO_EM_SERVICO:    { label: 'Inovação em Serviço', color: '#fbbf24' },
  INOVACAO_ORGANIZACIONAL:{ label: 'Inovação Organizacional', color: '#fb923c' },
};

const RADAR_CFG: Record<RadarRecommendation, { label: string; color: string; bg: string }> = {
  ADOTAR_IMEDIATO:  { label: 'Adotar Imediato', color: '#22c55e', bg: '#14532d' },
  EXPERIMENTAR:     { label: 'Experimentar (PoC)', color: '#fbbf24', bg: '#451a03' },
  OBSERVAR:         { label: 'Observar', color: '#60a5fa', bg: '#1e3a5f' },
  PESQUISAR_FUTURO: { label: 'Pesquisar Futuro', color: '#a78bfa', bg: '#2e1065' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CInO/CTO Board & Innovation Hub',
  'Portfólio & Pipeline de Inovação',
  'Laboratório de Experimentação & PoCs',
  'Radar Tecnológico Corporativo',
  'Open Innovation & Parcerias',
  'Design Thinking & Lean Startup Lab',
  'Painéis Executivos & Analytics',
  'CERTIFICAÇÃO EIRCTP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CInO/CTO Board & Innovation Hub': '🚀',
  'Portfólio & Pipeline de Inovação':       '💡',
  'Laboratório de Experimentação & PoCs':   '🧪',
  'Radar Tecnológico Corporativo':         '📡',
  'Open Innovation & Parcerias':           '🌐',
  'Design Thinking & Lean Startup Lab':     '🎨',
  'Painéis Executivos & Analytics':        '📊',
  'CERTIFICAÇÃO EIRCTP FINAL':            '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EIRCTPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CInO/CTO Board & Innovation Hub');
  const [kpis, setKpis] = useState<EIRCTPDashboardKPIs | null>(null);
  const [innovations, setInnovations] = useState<InnovationItem[]>([]);
  const [radar, setRadar] = useState<TechnologyRadarItem[]>([]);
  const [partners, setPartners] = useState<OpenInnovationPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);
  const [activeInnovation, setActiveInnovation] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, inv, rad, part] = await Promise.all([
        EnterpriseEIRCTPService.getDashboardKPIs(),
        EnterpriseEIRCTPService.getInnovations(),
        EnterpriseEIRCTPService.getTechnologyRadar(),
        EnterpriseEIRCTPService.getOpenPartnerships(),
      ]);
      setKpis(k); setInnovations(inv); setRadar(rad); setPartners(part);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const styles = {
    page:    { padding: '28px 32px', background: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' } as React.CSSProperties,
    title:   { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', margin: 0 } as React.CSSProperties,
    sub:     { fontSize: 13, color: '#64748b', marginTop: 4 } as React.CSSProperties,
    tabBar:  { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab:     (a: boolean): React.CSSProperties => ({
      padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      background: a ? '#1e293b' : 'transparent', color: a ? '#f8fafc' : '#64748b',
      border: a ? '1px solid #334155' : '1px solid transparent',
      display: 'flex', gap: 5, alignItems: 'center', transition: 'all .2s',
    }),
    card:    { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 } as React.CSSProperties,
    row:     { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 },
    grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
    secTitle:{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    th:      { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:      { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🚀</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Carregando EIRCTP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)', border: '1px solid #10b98133', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🚀</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE INNOVATION, RESEARCH & CONTINUOUS TRANSFORMATION PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EIRCTP — Gestão da Inovação & Transformação 🚀
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Transformando ideias, pesquisas e tecnologias emergentes em inovação social e operacional governada, mensurável e alinhada à missão do Instituto Ser Melhor.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ISO 56002', 'ISO 42001', 'Stage-Gate', 'Design Thinking', 'Lean Startup', 'Open Innovation', 'Tech Scouting', 'TOGAF'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: '#34d39918', padding: '3px 10px', borderRadius: 20, border: '1px solid #34d39933' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Score de Inovação', kpis.globalInnovationScore.toFixed(1), '/100', '#34d399', '🚀')}
          {kpiCard('Saúde do Pipeline Stage-Gate', `${kpis.pipelineStageGateHealth.toFixed(1)}%`, '', '#60a5fa', '💡')}
          {kpiCard('Experimentos Ativos', kpis.activeExperiments, 'exp.', '#fbbf24', '🧪')}
          {kpiCard('Taxa de PoCs com Sucesso', `${kpis.successfulPocsRate}%`, '', '#a78bfa', '🎯')}
          {kpiCard('ROI em Inovação', `${kpis.roiOnInnovation}%`, '', '#38bdf8', '💎')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade do Sistema de Inovação (ISO 56002)</div>
          {[
            { l: 'Gestão da Inovação (ISO 56002)', v: 96, c: '#34d399' },
            { l: 'Pesquisa Aplicada & P&D', v: 94, c: '#60a5fa' },
            { l: 'Laboratório de Experimentação (PoCs)', v: 98, c: '#fbbf24' },
            { l: 'Open Innovation & Parcerias', v: 92, c: '#a78bfa' },
            { l: 'Technology Scouting & Radar', v: 95, c: '#38bdf8' },
            { l: 'Gestão do Portfólio de Inovação', v: 97, c: '#4ade80' },
            { l: 'Inovação Social Mensurável', v: 98, c: '#fb923c' },
            { l: 'Transformação Digital & IA Ética', v: 95, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Visão Geral de Maturidade</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Inovação', v: Math.round(kpis.globalInnovationScore), c: '#34d399' },
              { label: 'Pipeline', v: Math.round(kpis.pipelineStageGateHealth), c: '#60a5fa' },
              { label: 'Maturidade', v: Math.round(kpis.maturityScore), c: '#a78bfa' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>💡 Destaque da Inovação</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              O projeto de Triagem Clínica Cognitiva Multimodal reduziu o tempo de pré-atendimento de 15 para 6.2 minutos, com ROI de inovação estimado em 340%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Portfólio & Pipeline ──────────────────────────────────────────

  const renderPipeline = () => (
    <div>
      <div style={styles.secTitle}>💡 Portfólio & Pipeline de Inovação Stage-Gate</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {innovations.map(item => {
          const st = STAGE_CFG[item.stage];
          const cat = CATEGORY_CFG[item.category];
          return (
            <div key={item.id} style={{ ...styles.card, borderTop: `4px solid ${st.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {badge(cat.label, cat.color, cat.color + '20')}
                    {badge(st.label, st.color, st.bg)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{item.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>{item.expectedImpactScore}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Impacto</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 12 }}>
                <strong>Hipótese:</strong> {item.hypothesis}
              </div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>📊 KPI de Desempenho ({item.primaryKPI})</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                  <span>Baseline: {item.kpiBaseline}</span>
                  <span>Meta: {item.kpiTarget}</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Atual: {item.kpiCurrent}</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b' }}>
                Sponsor: <strong>{item.sponsor}</strong> · Orçamento: <strong>R$ {(item.budgetSpent / 1000).toFixed(0)}k / {(item.budgetAllocated / 1000).toFixed(0)}k</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Laboratório de Experimentação ─────────────────────────────────

  const renderLab = () => {
    const item = innovations[activeInnovation];
    return (
      <div>
        <div style={styles.secTitle}>🧪 Laboratório de Experimentação (PoCs & MVPs)</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {innovations.map((inv, i) => (
            <button key={inv.id} onClick={() => setActiveInnovation(i)}
              style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${i === activeInnovation ? '#34d399' : '#1e293b'}`, background: i === activeInnovation ? '#064e3b' : '#0f172a', color: i === activeInnovation ? '#34d399' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {inv.title.length > 30 ? inv.title.slice(0, 30) + '…' : inv.title}
            </button>
          ))}
        </div>

        {item && (
          <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 14 }}>{item.hypothesis}</div>

            <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>🤖 Recomendação da IA do Laboratório</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{item.aiRecommendation}</div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Evidências de Validação do Experimento:</div>
            {item.evidence.map((ev, idx) => (
              <div key={idx} style={{ fontSize: 11, color: '#34d399', marginBottom: 4 }}>✓ {ev}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── TAB 4: Radar Tecnológico ─────────────────────────────────────────────

  const renderRadar = () => (
    <div>
      <div style={styles.secTitle}>📡 Technology Scouting & Radar Corporativo</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Tecnologia', 'Categoria', 'Recomendação', 'Maturidade', 'Potencial de Impacto', 'Relevância para a Missão'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {radar.map(item => {
              const rec = RADAR_CFG[item.recommendation];
              return (
                <tr key={item.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{item.technology}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{item.category.replace(/_/g, ' ')}</td>
                  <td style={styles.td}>{badge(rec.label, rec.color, rec.bg)}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#a78bfa' }}>{item.maturityLevel}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: item.impactPotential === 'ALTISSIMO' ? '#34d399' : '#60a5fa' }}>{item.impactPotential}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{item.relevanceToMission}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 5: Open Innovation ───────────────────────────────────────────────

  const renderOpenInnovation = () => (
    <div>
      <div style={styles.secTitle}>🌐 Ecossistema de Open Innovation & Parcerias P&D</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {partners.map(p => (
          <div key={p.id} style={{ ...styles.card, borderTop: '3px solid #a78bfa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{p.name}</div>
              {badge(p.type, '#a78bfa', '#2e1065')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>{p.jointProjectTitle}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>
              <strong>Propriedade Intelectual:</strong> {p.intellectualPropertyAgreement}
            </div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Entregáveis Principais:</div>
              {p.mainDeliverables.map((d, idx) => <div key={idx} style={{ fontSize: 10, color: '#cbd5e1' }}>• {d}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 6: Design Thinking ───────────────────────────────────────────────

  const renderDesignThinking = () => (
    <div>
      <div style={styles.secTitle}>🎨 Framework Design Thinking & Lean Startup Lab</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #38bdf8' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Todas as soluções inovadoras seguem o ciclo de Aprendizado Validado: <strong>Empatia → Definição → Ideação → Protótipo → Teste (MVP)</strong>.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { s: '1. Descoberta (Empatia)', d: 'Entrevistas de campo com 240 beneficiários.', c: '#34d399' },
            { s: '2. Definição do Problema', d: 'Mapeamento de dor: tempo de espera e triagem.', c: '#60a5fa' },
            { s: '3. Ideação & Co-criação', d: 'Hackathon interno gerou 14 hipóteses de IA.', c: '#a78bfa' },
            { s: '4. MVP & Teste de Campo', d: 'Piloto de 30 dias na unidade comunitária.', c: '#fbbf24' },
          ].map((step, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 12, borderRadius: 8, borderTop: `3px solid ${step.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{step.s}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{step.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel Executivo do Chief Innovation Officer (CInO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #34d399' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Maturidade de Inovação', v: '95.6/100', c: '#34d399', i: '🚀' },
            { l: 'Taxa de Sucesso PoCs', v: '87.5%', c: '#60a5fa', i: '🎯' },
            { l: 'Retorno sobre Inovação (ROI)', v: '340%', c: '#a78bfa', i: '💎' },
            { l: 'Parcerias Open Innovation', v: '5 ativas', c: '#fbbf24', i: '🌐' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação Final ────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)', border: '2px solid #34d39940', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE GESTÃO DA INOVAÇÃO ENTERPRISE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EIRCTP — Enterprise Innovation, Research<br />& Continuous Transformation Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor certifica que seu ecossistema de gestão da inovação opera sob a norma ISO 56002, com governança rigorosa, Stage-Gate ativo e validação contínua de tecnologias emergentes.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EIRCTP Emitido — Prompt 069' : '🚀 Emitir Certificado EIRCTP Final'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer Executivo do Chief Innovation Officer (CInO)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          O ecossistema de inovação da Plataforma Instituto Ser Melhor foi auditado com score de 95.6/100. Todos os experimentos de IA e novas tecnologias operam com isolamento em sandbox, supervisão ética e métricas claras de retorno social e operacional (ROI 340%).
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CInO/CTO Board & Innovation Hub': renderDashboard,
    'Portfólio & Pipeline de Inovação':       renderPipeline,
    'Laboratório de Experimentação & PoCs':   renderLab,
    'Radar Tecnológico Corporativo':         renderRadar,
    'Open Innovation & Parcerias':           renderOpenInnovation,
    'Design Thinking & Lean Startup Lab':     renderDesignThinking,
    'Painéis Executivos & Analytics':        renderExecutive,
    'CERTIFICAÇÃO EIRCTP FINAL':            renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🚀 EIRCTP — Enterprise Innovation, Research & Continuous Transformation Platform</h1>
        <p style={styles.sub}>Prompt 069 · Instituto Ser Melhor v2.0 · ISO 56002 · ISO 42001 · Stage-Gate · Open Innovation · Tech Scouting</p>
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

export default EIRCTPPage;
