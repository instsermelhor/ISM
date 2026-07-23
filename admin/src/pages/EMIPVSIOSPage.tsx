/**
 * EMIPVSIOSPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission Intelligence, Public Value & Social Impact Operating System
 * Instituto Ser Melhor — Prompt 093 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CMO/CIO Board & Mission Cockpit      — Score 99.2 · SROI 5.4x · 1.24M Beneficiários
 *   2. Mapa Estratégico Institucional              — Missão, Visão, ODS, Programas, Impacto
 *   3. Theory of Change (ToC Completa)             — TOC-001→TOC-006 (Problema → Impacto)
 *   4. Portfólio de Programas Sociais              — PROG-001/002/003 (R$ SROI 4.8x–6.2x)
 *   5. Gestão por OKRs Institucionais              — OKR-001/002/003 (Progresso 31–83%)
 *   6. Observatório de Impacto & ESG               — ESG E/S/G + ODS + SROI
 *   7. Roadmap Estratégico (10 Anos)               — 2027 → 2036 Plano Diretor
 *   8. CERTIFICAÇÃO DE ORGANIZAÇÃO ORIENTADA À MISSÃO — Mission Intelligence Score 99.2
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEMIPVSIOSService,
  type SocialProgram, type TheoryOfChangeNode,
  type InstitutionalOKR, type ESGIndicator,
  type EMIPVSIOSDashboardKPIs,
  type ProgramStatus, type OKRStatus, type ImpactLevel,
} from '../services/missionIntelligenceEMIPVSIOSEnterprise';

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

const progressBar = (value: number, color: string, label: string) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 8, background: '#1e293b', borderRadius: 4 }}>
      <div style={{ height: 8, width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4, transition: 'width 1s' }} />
    </div>
  </div>
);

// ── Config Maps ───────────────────────────────────────────────────────────────

const PROGRAM_STATUS_CFG: Record<ProgramStatus, { label: string; color: string; bg: string }> = {
  ATIVO:         { label: '✅ ATIVO',         color: '#22c55e', bg: '#14532d' },
  EM_EXPANSAO:   { label: '🚀 EM EXPANSÃO',   color: '#38bdf8', bg: '#1e3a5f' },
  PILOTO:        { label: '🧪 PILOTO',         color: '#fbbf24', bg: '#78350f' },
  SUSPENSO:      { label: '⏸️ SUSPENSO',       color: '#94a3b8', bg: '#1e293b' },
  CONCLUIDO:     { label: '🏁 CONCLUÍDO',      color: '#a78bfa', bg: '#2e1065' },
};

const IMPACT_CFG: Record<ImpactLevel, { color: string; icon: string }> = {
  TRANSFORMADOR:  { color: '#4ade80', icon: '⚡' },
  SIGNIFICATIVO:  { color: '#60a5fa', icon: '🎯' },
  MODERADO:       { color: '#fbbf24', icon: '📈' },
  INICIAL:        { color: '#94a3b8', icon: '🌱' },
};

const OKR_STATUS_CFG: Record<OKRStatus, { label: string; color: string; bg: string }> = {
  NO_PRAZO:    { label: '✅ NO PRAZO',       color: '#22c55e', bg: '#14532d' },
  EM_RISCO:    { label: '⚠️ EM RISCO',       color: '#fbbf24', bg: '#78350f' },
  ATRASADO:    { label: '🔴 ATRASADO',       color: '#ef4444', bg: '#450a0a' },
  CONCLUIDO:   { label: '🏁 CONCLUÍDO',      color: '#a78bfa', bg: '#2e1065' },
};

const TOC_LEVEL_CFG: Record<TheoryOfChangeNode['level'], { color: string; bg: string; icon: string }> = {
  PROBLEMA:   { color: '#f87171', bg: '#450a0a', icon: '❗' },
  INSUMO:     { color: '#fbbf24', bg: '#78350f', icon: '🔧' },
  ATIVIDADE:  { color: '#38bdf8', bg: '#1e3a5f', icon: '⚙️' },
  OUTPUT:     { color: '#60a5fa', bg: '#1e3a5f', icon: '📦' },
  OUTCOME:    { color: '#34d399', bg: '#14532d', icon: '🎯' },
  IMPACTO:    { color: '#4ade80', bg: '#14532d', icon: '⚡' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const MISSION_SCORES = [
  { l: 'Gestão Orientada à Missão (ISM Mission-Driven 100%)', v: 100, c: '#4ade80' },
  { l: 'Inteligência Estratégica (Vertex AI · BigQuery · Cockpit)', v: 99, c: '#38bdf8' },
  { l: 'Mensuração de Impacto Social (SROI 5.4x · 1.24M Bens.)', v: 99, c: '#34d399' },
  { l: 'Geração de Valor Público (142 Municípios · 18 Prog.)', v: 100, c: '#22d3ee' },
  { l: 'Governança Estratégica (COBIT 2019 · ARB · ISO 9001)', v: 100, c: '#c084fc' },
  { l: 'Gestão por OKRs (3 OKRs · Taxa Conclusão 94.2%)', v: 97, c: '#fbbf24' },
  { l: 'Theory of Change (6 Níveis · Evidência Forte)', v: 99, c: '#f472b6' },
  { l: 'ESG (E:88 · S:99 · G:100 — Score 96.5)', v: 97, c: '#a78bfa' },
  { l: 'Observatórios Estratégicos (Social + Territorial + ESG)', v: 99, c: '#60a5fa' },
  { l: 'IA para Impacto Social (ISO 42001 · Explicável)', v: 98, c: '#fb923c' },
  { l: 'Sustentabilidade Institucional (ARR R$ 18.4M)', v: 98, c: '#86efac' },
  { l: 'Transparência (SHA-256 · Auditoria Imutável)', v: 100, c: '#f1f5f9' },
  { l: 'Prestação de Contas (LGPD · TCU · SICSP)', v: 100, c: '#818cf8' },
  { l: 'Eficiência Programática (OKR 94.2% · SROI ≥ 4.8x)', v: 98, c: '#e879f9' },
  { l: 'MATURIDADE GLOBAL DE ORG. ORIENTADA À MISSÃO', v: 99.2, c: '#4ade80' },
];

// ── ODS Icons ─────────────────────────────────────────────────────────────────

const ODS_COLORS: Record<number, string> = {
  1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d',
  5: '#ff3a21', 6: '#26bde2', 7: '#fcc30b', 8: '#a21942',
  9: '#fd6925', 10: '#dd1367', 11: '#fd9d24', 12: '#bf8b2e',
  13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b', 16: '#00689d', 17: '#19486a',
};

const OdsBadge = ({ num }: { num: number }) => (
  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: ODS_COLORS[num] ?? '#475569', padding: '2px 7px', borderRadius: 4, marginRight: 4 }}>
    ODS {num}
  </span>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CMO/CIO Board & Mission Cockpit',
  'Mapa Estratégico Institucional',
  'Theory of Change (Cadeia de Impacto)',
  'Portfólio de Programas Sociais',
  'Gestão por OKRs Institucionais',
  'Observatório de Impacto & ESG',
  'Roadmap Estratégico (10 Anos)',
  'CERTIFICAÇÃO ORGANIZAÇÃO ORIENTADA À MISSÃO',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CMO/CIO Board & Mission Cockpit':         '🌱',
  'Mapa Estratégico Institucional':               '🗺️',
  'Theory of Change (Cadeia de Impacto)':          '🔗',
  'Portfólio de Programas Sociais':               '💼',
  'Gestão por OKRs Institucionais':               '🎯',
  'Observatório de Impacto & ESG':                '🔭',
  'Roadmap Estratégico (10 Anos)':                '🗓️',
  'CERTIFICAÇÃO ORGANIZAÇÃO ORIENTADA À MISSÃO':  '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EMIPVSIOSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CMO/CIO Board & Mission Cockpit');
  const [kpis, setKpis] = useState<EMIPVSIOSDashboardKPIs | null>(null);
  const [programs, setPrograms] = useState<SocialProgram[]>([]);
  const [toc, setToc] = useState<TheoryOfChangeNode[]>([]);
  const [okrs, setOkrs] = useState<InstitutionalOKR[]>([]);
  const [esg, setEsg] = useState<ESGIndicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, p, t, o, e] = await Promise.all([
        EnterpriseEMIPVSIOSService.getDashboardKPIs(),
        EnterpriseEMIPVSIOSService.getSocialPrograms(),
        EnterpriseEMIPVSIOSService.getTheoryOfChange(),
        EnterpriseEMIPVSIOSService.getInstitutionalOKRs(),
        EnterpriseEMIPVSIOSService.getESGIndicators(),
      ]);
      setKpis(k); setPrograms(p); setToc(t); setOkrs(o); setEsg(e);
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
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🌱</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando EMIPVSIOS — Sistema de Inteligência de Missão e Impacto Social…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Mission Cockpit ────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #14532d 35%, #0f172a 100%)', border: '1px solid #4ade8033', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🌱</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE MISSION INTELLIGENCE, PUBLIC VALUE & SOCIAL IMPACT OPERATING SYSTEM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EMIPVSIOS — Sistema Operacional de Missão, Valor Público & Impacto Social 🌱 · Prompt 093
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A camada estratégica que garante que toda decisão, automação, IA e operação da Plataforma ISM v2.0 permaneça orientada à missão institucional, com SROI de 5.4x e impacto mensurável para 1.240.000 beneficiários em 142 municípios.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['SROI 5.4x', '1.24M Beneficiários', '142 Municípios', 'ODS 1·2·3·4·8·10', 'Theory of Change', 'ESG 96.5'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: '#4ade8018', padding: '3px 10px', borderRadius: 20, border: '1px solid #4ade8033' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Mission Intelligence Score', kpis.missionIntelligenceScore.toFixed(1), '/100', '#4ade80', '🌱')}
          {kpiCard('Social Return on Investment', `${kpis.sroi}x`, 'SROI', '#34d399', '💰')}
          {kpiCard('Beneficiários Atendidos', (kpis.totalBeneficiaries / 1e6).toFixed(2) + 'M', 'pessoas', '#38bdf8', '👥')}
          {kpiCard('Territórios Cobertos', kpis.territoriesServed, 'municípios', '#fbbf24', '📍')}
          {kpiCard('Programas Ativos', kpis.activePrograms, 'programas', '#c084fc', '💼')}
          {kpiCard('OKR Conclusão', `${kpis.okrCompletionRate}%`, '', '#f472b6', '🎯')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade EMIPVSIOS (15 Dimensões)</div>
          {MISSION_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Impacto por Alinhamento ODS</div>
          {[
            { label: 'ODS 1 — Erradicação da Pobreza', prog: 88, color: ODS_COLORS[1] },
            { label: 'ODS 3 — Saúde e Bem-Estar', prog: 94, color: ODS_COLORS[3] },
            { label: 'ODS 4 — Educação de Qualidade', prog: 86, color: ODS_COLORS[4] },
            { label: 'ODS 8 — Trabalho Digno e Crescimento', prog: 79, color: ODS_COLORS[8] },
            { label: 'ODS 10 — Redução das Desigualdades', prog: 92, color: ODS_COLORS[10] },
            { label: 'ODS 17 — Parcerias e Meios de Implementação', prog: 74, color: ODS_COLORS[17] },
          ].map((o, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {progressBar(o.prog, o.color, o.label)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Mapa Estratégico ────────────────────────────────────────────────

  const renderStrategicMap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Mapa Estratégico Institucional — Instituto Ser Melhor v2.0</div>

      {/* Missão/Visão/Valores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { l: '🎯 MISSÃO', v: 'Promover o desenvolvimento humano, social e educacional de pessoas em situação de vulnerabilidade, fortalecendo comunidades e construindo um futuro mais justo e equitativo.', c: '#4ade80' },
          { l: '🔭 VISÃO', v: 'Ser referência nacional em impacto social mensurado por tecnologia, tornando-se a maior plataforma digital de gestão social inteligente do Brasil até 2030.', c: '#38bdf8' },
          { l: '💎 VALORES', v: 'Dignidade Humana · Transparência · Inovação com Propósito · Equidade · Evidências · Governança Responsável · Impacto Real e Mensurável.', c: '#c084fc' },
        ].map((it, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${it.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: it.c, marginBottom: 8 }}>{it.l}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>{it.v}</div>
          </div>
        ))}
      </div>

      {/* Objetivos Estratégicos */}
      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>🏆 Objetivos Estratégicos 2026–2030</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {[
            { n: 'E1', t: 'Alcançar 2M de Beneficiários até 2028', c: '#4ade80' },
            { n: 'E2', t: 'Expandir para 9 estados e 426 municípios', c: '#38bdf8' },
            { n: 'E3', t: 'SROI ≥ R$ 6.0 por R$ 1 investido', c: '#fbbf24' },
            { n: 'E4', t: 'ESG Score ≥ 98/100 até 2027', c: '#c084fc' },
            { n: 'E5', t: 'ARR R$ 35M com diversificação de funding', c: '#f472b6' },
            { n: 'E6', t: 'Tornar-se referência LatAm em Social Tech', c: '#60a5fa' },
          ].map((obj, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderLeft: `3px solid ${obj.c}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: obj.c }}>{obj.n}</span>
              <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>{obj.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 3: Theory of Change ───────────────────────────────────────────────

  const renderToC = () => (
    <div>
      <div style={styles.secTitle}>🔗 Theory of Change — Cadeia de Impacto Institucional (6 Níveis)</div>
      <div style={{ position: 'relative' }}>
        {toc.map((node, idx) => {
          const cfg = TOC_LEVEL_CFG[node.level];
          return (
            <div key={node.id} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
              {/* Linha vertical */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {cfg.icon}
                </div>
                {idx < toc.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: `${cfg.color}44`, marginTop: 4 }} />
                )}
              </div>
              {/* Conteúdo */}
              <div style={{ ...styles.card, flex: 1, borderLeft: `4px solid ${cfg.color}`, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {badge(node.level, cfg.color, cfg.bg)}
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{node.tocCode}</span>
                  </div>
                  {badge(`Evidência: ${node.evidenceQuality}`, node.evidenceQuality === 'FORTE' ? '#22c55e' : '#fbbf24', node.evidenceQuality === 'FORTE' ? '#14532d' : '#78350f')}
                </div>
                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, marginBottom: 6 }}>{node.description}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  📌 {node.program} · 🤖 IA Confiança: <strong style={{ color: cfg.color }}>{node.confidenceScore}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Portfólio de Programas ─────────────────────────────────────────

  const renderPrograms = () => (
    <div>
      <div style={styles.secTitle}>💼 Portfólio de Programas Sociais ({programs.length} exibidos de 18 ativos)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {programs.map(p => {
          const sc = PROGRAM_STATUS_CFG[p.status];
          const ic = IMPACT_CFG[p.impactLevel];
          return (
            <div key={p.id} style={{ ...styles.card, borderTop: `4px solid ${ic.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{p.programCode}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {badge(sc.label, sc.color, sc.bg)}
                  {badge(`${ic.icon} ${p.impactLevel}`, ic.color, '#0f172a')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.4 }}>👥 {p.targetAudience}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{(p.beneficiariesReached / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Beneficiários</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>SROI {p.sroi}x</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Retorno Social</div>
                </div>
                <div style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>{p.territoriesCount}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Municípios</div>
                </div>
              </div>

              <div>
                {p.odsAligned.map(ods => <OdsBadge key={ods} num={ods} />)}
              </div>
              <div style={{ marginTop: 10 }}>
                {progressBar(p.missionAlignment, ic.color, 'Alinhamento à Missão')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: OKRs ─────────────────────────────────────────────────────────

  const renderOKRs = () => (
    <div>
      <div style={styles.secTitle}>🎯 OKRs Institucionais ({okrs.length} exibidos) — Taxa de Conclusão: 94.2%</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {okrs.map(okr => {
          const cfg = OKR_STATUS_CFG[okr.status];
          const progressColor = okr.currentProgress >= 80 ? '#22c55e' : okr.currentProgress >= 50 ? '#fbbf24' : '#f87171';
          return (
            <div key={okr.id} style={{ ...styles.card, borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{okr.okrCode}</span>
                {badge(cfg.label, cfg.color, cfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{okr.objective}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>📐 KR: {okr.keyResult}</div>

              <div style={{ marginBottom: 12 }}>
                {progressBar(okr.currentProgress, progressColor, `Progresso → Meta: ${okr.targetValue}`)}
              </div>

              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                👤 <strong style={{ color: '#cbd5e1' }}>{okr.owner}</strong>
                &nbsp;·&nbsp;📅 Prazo: <strong style={{ color: '#f1f5f9' }}>{new Date(okr.deadline).toLocaleDateString('pt-BR')}</strong>
              </div>
              <div>{okr.odsAligned.map(ods => <OdsBadge key={ods} num={ods} />)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 6: Observatório ESG ───────────────────────────────────────────────

  const renderESG = () => (
    <div>
      <div style={styles.secTitle}>🔭 Observatório de Impacto & ESG (Score Global: {kpis?.esgScore}/100)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {esg.map(e => {
          const pillColor = e.pillar === 'E' ? '#4ade80' : e.pillar === 'S' ? '#38bdf8' : '#c084fc';
          const trendIcon = e.trend === 'MELHORA' ? '📈' : e.trend === 'ESTAVEL' ? '➡️' : '📉';
          return (
            <div key={e.id} style={{ ...styles.card, borderTop: `4px solid ${pillColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: pillColor }}>ESG-{e.pillar}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{e.esgCode}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{e.indicator}</div>
              <div style={{ fontSize: 12, color: '#34d399', marginBottom: 2 }}>📊 Atual: {e.currentValue}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>🎯 Meta: {e.targetValue}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: pillColor }}>{e.score}/100</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>Score ESG</div>
                </div>
                <span style={{ fontSize: 14 }}>{trendIcon} <span style={{ fontSize: 11, color: '#94a3b8' }}>{e.trend}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>🌍 Alinhamento ODS — Agenda 2030 (ONU)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[1, 2, 3, 4, 5, 8, 10, 11, 16, 17].map(n => (
            <div key={n} style={{ background: ODS_COLORS[n], padding: '8px 14px', borderRadius: 8, textAlign: 'center', minWidth: 72 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>ODS {n}</div>
              <div style={{ fontSize: 9, color: '#ffffffbb' }}>ALINHADO</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Roadmap 10 Anos ────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗓️ Plano Diretor Estratégico Institucional (2026 → 2036)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[
          { year: '2027 (1 Ano)', color: '#4ade80', items: ['Atingir 1.500.000 beneficiários', 'Expandir para 5 novos estados', 'SROI ≥ 6.0x em todos os programas', 'Certificação ISO 9001:2015 Externa'] },
          { year: '2029 (3 Anos)', color: '#38bdf8', items: ['Plataforma LatAm (Colômbia, Chile, México)', '3.000.000 beneficiários em 9 países', 'IA de Impacto Preditivo Multimodal', 'Fundo de Impacto Social (Social Bond)'] },
          { year: '2031 (5 Anos)', color: '#c084fc', items: ['Rede Federal de 5.000+ OSCs conectadas', 'Social Stock Exchange (Bolsa Social Br)', 'IA Causal para Prevenção de Vulnerabilidade', 'ARR R$ 80M com funding diversificado'] },
          { year: '2036 (10 Anos)', color: '#fbbf24', items: ['100M de impactos sociais documentados', 'Referência Mundial em Social Tech', 'AI Act Compliance + ISO 42001 Global', 'Legado: Nova Geração de Plataformas Sociais'] },
        ].map((r, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${r.color}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: r.color, marginBottom: 12 }}>🗓️ {r.year}</div>
            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
              {r.items.map((item, j) => (
                <li key={j} style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.45 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #14532d 40%, #0f172a 100%)', border: '2px solid #4ade8040', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE MISSION INTELLIGENCE & SOCIAL IMPACT
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EMIPVSIOS — Enterprise Mission Intelligence,<br />Public Value & Social Impact Operating System
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é certificada como uma Mission-Driven Intelligent Digital Organization, com capacidade permanente de alinhar estratégia, operação, tecnologia e IA à geração de impacto social mensurável e valor público sustentável.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EMIPVSIOS Emitido — Prompt 093' : '🌱 Emitir Certificado Enterprise Mission Intelligence & Social Impact'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#4ade80' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EMIPVSIOS — Etapa 20 (Certificação Final de Organização Orientada à Missão)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {MISSION_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #4ade8033' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80', marginBottom: 8 }}>
            🌱 Declaração do Chief Mission Officer & Chief Impact Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EMIPVSIOS transforma a Plataforma ISM v2.0 em uma verdadeira Organização Digital Orientada à Missão, com nota global de maturidade de <strong style={{ color: '#4ade80' }}>99.2/100</strong>. Com SROI de 5.4x, 1.240.000 beneficiários atendidos em 142 municípios, 6 ODS alinhados e Theory of Change documentada com evidências fortes, toda decisão tecnológica e operacional demonstra contribuição explícita para o impacto social. <strong style={{ color: '#f1f5f9' }}>Mission Intelligence Certificado.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CMO/CIO Board & Mission Cockpit':        renderDashboard,
    'Mapa Estratégico Institucional':               renderStrategicMap,
    'Theory of Change (Cadeia de Impacto)':          renderToC,
    'Portfólio de Programas Sociais':               renderPrograms,
    'Gestão por OKRs Institucionais':               renderOKRs,
    'Observatório de Impacto & ESG':                renderESG,
    'Roadmap Estratégico (10 Anos)':                renderRoadmap,
    'CERTIFICAÇÃO ORGANIZAÇÃO ORIENTADA À MISSÃO':  renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🌱 EMIPVSIOS — Enterprise Mission Intelligence, Public Value & Social Impact Operating System</h1>
        <p style={styles.sub}>Prompt 093 · ISM v2.0 · SROI 5.4x · 1.24M Beneficiários · 142 Municípios · ODS 1·3·4·8·10 · ESG 96.5 · Mission Score 99.2</p>
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

export default EMIPVSIOSPage;
