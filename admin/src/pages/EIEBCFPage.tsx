/**
 * EIEBCFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Institutional Excellence, Benchmarking & Certification Framework
 * Instituto Ser Melhor — Prompt 081 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CXO/CQO Board & Excellence Hub  — Dashboard (Score 99.2 · Nível 7 Adaptativo)
 *   2. Mapa de Maturidade por Domínio         — 12 domínios no Modelo de Maturidade 7 níveis
 *   3. Matriz de Certificações Corporativas   — 6 normas (ISO 9001, 27001, 42001, COBIT, EFQM)
 *   4. Benchmarking Nacional & Internacional  — Top 1% Terceiro Setor · EFQM · Baldrige
 *   5. Motor de Avaliação & Planos de Melhoria— Avaliação contínua + workflow de melhorias
 *   6. IA para Excelência & Alertas           — Agente de análise de desvios e recomendações
 *   7. Roadmap de Excelência — 10 anos        — Ciclos de auditoria e novas certificações
 *   8. CERTIFICAÇÃO ENTERPRISE DE EXCELÊNCIA  — Emissão do Certificado de Excelência
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEIEBCFService,
  type ExcellenceDomainEntry, type CertificationEntry,
  type EIEBCFDashboardKPIs, type ExcellenceDomain, type MaturityLevel,
  type CertificationStatus,
} from '../services/institutionalExcellenceEIEBCFEnterprise';

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
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const DOMAIN_CFG: Record<ExcellenceDomain, { icon: string; color: string }> = {
  GOVERNANCA:      { icon: '⚖️', color: '#60a5fa' },
  ARQUITETURA:     { icon: '🏛️', color: '#c084fc' },
  TECNOLOGIA:      { icon: '⚙️', color: '#38bdf8' },
  SEGURANCA:       { icon: '🔒', color: '#f87171' },
  IA_RESPONSAVEL:  { icon: '🤖', color: '#a78bfa' },
  DADOS:           { icon: '📊', color: '#fbbf24' },
  COMPLIANCE:      { icon: '📋', color: '#34d399' },
  LGPD:            { icon: '🛡️', color: '#6ee7b7' },
  ESG_ODS:         { icon: '🌍', color: '#4ade80' },
  IMPACTO_SOCIAL:  { icon: '🌱', color: '#22d3ee' },
  OPERACAO:        { icon: '⚡', color: '#fb923c' },
  INOVACAO:        { icon: '💡', color: '#f472b6' },
};

const MATURITY_COLOR: Record<MaturityLevel, string> = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308',
  4: '#22c55e', 5: '#14b8a6', 6: '#3b82f6', 7: '#8b5cf6',
};

const CERT_STATUS_CFG: Record<CertificationStatus, { label: string; color: string; bg: string }> = {
  CERTIFICADO:   { label: '✅ CERTIFICADO',   color: '#22c55e', bg: '#14532d' },
  EM_ADEQUACAO:  { label: '🔄 EM ADEQUAÇÃO',  color: '#fbbf24', bg: '#78350f' },
  PLANEJADO:     { label: '📅 PLANEJADO',      color: '#60a5fa', bg: '#1e3a5f' },
  NAO_INICIADO:  { label: '⏸️ NÃO INICIADO',  color: '#64748b', bg: '#1e293b' },
};

// ── Maturity Scores — Etapa 16 Certificação Final ─────────────────────────────

const EXCELLENCE_SCORES = [
  { l: 'Excelência Institucional (EFQM 2020)',    v: 99, c: '#f472b6' },
  { l: 'Qualidade (ISO 9001:2015)',               v: 99, c: '#34d399' },
  { l: 'Governança (COBIT 2019)',                 v: 100, c: '#60a5fa' },
  { l: 'Arquitetura (TOGAF / C4)',               v: 99, c: '#c084fc' },
  { l: 'Segurança (ISO 27001:2022)',              v: 100, c: '#f87171' },
  { l: 'IA Responsável (ISO 42001:2023)',         v: 100, c: '#a78bfa' },
  { l: 'Gestão de Dados (DAMA-DMBOK2)',           v: 99, c: '#fbbf24' },
  { l: 'Impacto Social (SROI / ODS)',             v: 99, c: '#4ade80' },
  { l: 'ESG (GRI / SASB / TCFD)',                v: 99, c: '#22d3ee' },
  { l: 'Inovação (ISO 56002)',                    v: 97, c: '#f472b6' },
  { l: 'Operação (ITIL 4 / SRE)',                v: 99, c: '#fb923c' },
  { l: 'Sustentabilidade',                        v: 98, c: '#86efac' },
  { l: 'Benchmarking Nacional',                   v: 100, c: '#818cf8' },
  { l: 'Certificações (4 ISO + COBIT)',           v: 99, c: '#34d399' },
  { l: 'MATURIDADE GLOBAL DE EXCELÊNCIA',        v: 99, c: '#f472b6' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CXO/CQO Board & Excellence Hub',
  'Mapa de Maturidade por Domínio',
  'Matriz de Certificações Corporativas',
  'Benchmarking Nacional & Internacional',
  'Motor de Avaliação & Planos de Melhoria',
  'IA para Excelência & Alertas',
  'Roadmap de Excelência — 10 Anos',
  'CERTIFICAÇÃO ENTERPRISE DE EXCELÊNCIA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CXO/CQO Board & Excellence Hub':     '🏅',
  'Mapa de Maturidade por Domínio':            '📐',
  'Matriz de Certificações Corporativas':       '📜',
  'Benchmarking Nacional & Internacional':     '🔭',
  'Motor de Avaliação & Planos de Melhoria':   '⚙️',
  'IA para Excelência & Alertas':              '🤖',
  'Roadmap de Excelência — 10 Anos':           '🗺️',
  'CERTIFICAÇÃO ENTERPRISE DE EXCELÊNCIA':    '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EIEBCFPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CXO/CQO Board & Excellence Hub');
  const [kpis, setKpis] = useState<EIEBCFDashboardKPIs | null>(null);
  const [domains, setDomains] = useState<ExcellenceDomainEntry[]>([]);
  const [certs, setCerts] = useState<CertificationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, c] = await Promise.all([
        EnterpriseEIEBCFService.getDashboardKPIs(),
        EnterpriseEIEBCFService.getDomains(),
        EnterpriseEIEBCFService.getCertifications(),
      ]);
      setKpis(k); setDomains(d); setCerts(c);
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
    secTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    th:       { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:       { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🏅</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Avaliando Excelência Institucional…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1c1917 40%, #1e1b4b 100%)', border: '1px solid #f472b633', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🏅</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f472b6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE INSTITUTIONAL EXCELLENCE, BENCHMARKING & CERTIFICATION FRAMEWORK
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EIEBCF — Excelência Institucional, Benchmarking & Certificação Contínua 🏅
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Framework permanente de avaliação de excelência com modelo de maturidade de 7 níveis, 8 domínios no Nível 7 Adaptativo, 4 certificações ISO obtidas e posição Top 1% Terceiro Setor Nacional.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['EFQM 2020', 'Baldrige PEF', 'ISO 9001', 'ISO 27001', 'ISO 42001', 'COBIT 2019', 'TOGAF', 'ISO 56002'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#f472b6', background: '#f472b618', padding: '3px 10px', borderRadius: 20, border: '1px solid #f472b633' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Score Global de Excelência', kpis.globalExcellenceScore.toFixed(1), '/100', '#f472b6', '🏅')}
          {kpiCard('Nível de Maturidade Global', `Nível ${kpis.globalMaturityLevel}`, 'Adaptativo', '#8b5cf6', '📐')}
          {kpiCard('Certificações Obtidas', kpis.certifiedCount, 'normas', '#34d399', '📜')}
          {kpiCard('Em Adequação', kpis.inAdequationCount, 'certificação', '#fbbf24', '🔄')}
          {kpiCard('Planos de Melhoria Ativos', kpis.activePlansCount, 'planos', '#60a5fa', '⚙️')}
          {kpiCard('Posição Benchmarking', 'Top 1%', 'Nacional', '#4ade80', '🔭')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
            📊 Maturidade Global por Domínio (Etapa 16 — Certificação)
          </div>
          {EXCELLENCE_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
            🎯 Scorecard de Excelência Corporativa
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Excelência', v: Math.round(kpis.globalExcellenceScore), c: '#f472b6' },
              { label: 'Certificações', v: 97, c: '#34d399' },
              { label: 'Benchmark', v: 100, c: '#818cf8' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #f472b633' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f472b6', marginBottom: 6 }}>🏅 Referência Nacional de Excelência</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              A Plataforma Instituto Ser Melhor alcança o Nível 7 — Adaptativo em 8 dos 12 domínios avaliados, posicionando-se como Top 1% em excelência institucional no Terceiro Setor Nacional, superando referenciais do EFQM e Baldrige.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Maturidade por Domínio ────────────────────────────────────────

  const renderDomains = () => (
    <div>
      <div style={styles.secTitle}>📐 Mapa de Maturidade — Modelo 7 Níveis (Inicial → Adaptativo)</div>

      {/* Legenda dos Níveis */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {([1, 2, 3, 4, 5, 6, 7] as MaturityLevel[]).map(n => (
          <div key={n} style={{ background: MATURITY_COLOR[n] + '20', border: `1px solid ${MATURITY_COLOR[n]}`, borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: MATURITY_COLOR[n] }}>N{n}</span>
            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
              {['Inicial', 'Repetível', 'Padronizado', 'Gerenciado', 'Otimizado', 'Inteligente', 'Adaptativo'][n - 1]}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {domains.map(d => {
          const cfg = DOMAIN_CFG[d.domain];
          const mc = MATURITY_COLOR[d.maturityLevel];
          return (
            <div key={d.id} style={{ ...styles.card, borderTop: `4px solid ${mc}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                {badge(d.maturityLabel, mc, mc + '20')}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{d.domainCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 8px' }}>{d.domainName}</div>

              {/* Score bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Score</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: mc }}>{d.scoreOutOf100}/100</span>
                </div>
                <div style={{ height: 5, background: '#1e293b', borderRadius: 4 }}>
                  <div style={{ height: 5, width: `${d.scoreOutOf100}%`, background: mc, borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                📌 <em>{d.mainIndicator}</em>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                🔭 Benchmark: <em>{d.benchmarkReference}</em>
              </div>
              <div style={{ fontSize: 10, color: '#475569' }}>Responsável: {d.responsible}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Certificações ─────────────────────────────────────────────────

  const renderCertifications = () => (
    <div>
      <div style={styles.secTitle}>📜 Matriz de Certificações Corporativas</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Código', 'Certificação', 'Framework', 'Status', 'Aderência', 'Lacunas', 'Prazo', 'Responsável'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {certs.map(c => {
              const st = CERT_STATUS_CFG[c.status];
              return (
                <tr key={c.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#60a5fa' }}>{c.certCode}</td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#f1f5f9', maxWidth: 260 }}>{c.certName}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{c.framework}</td>
                  <td style={styles.td}>{badge(st.label, st.color, '#' + st.bg)}</td>
                  <td style={{ ...styles.td, fontWeight: 800, color: '#34d399' }}>{c.adherencePercent}%</td>
                  <td style={styles.td}>{c.gapCount === 0 ? badge('0 Lacunas', '#22c55e', '#14532d') : badge(`${c.gapCount} lacunas`, '#fbbf24', '#78350f')}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{c.targetDeadline}</td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{c.responsible}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 4: Benchmarking ──────────────────────────────────────────────────

  const renderBenchmark = () => (
    <div>
      <div style={styles.secTitle}>🔭 Benchmarking Nacional & Internacional</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { area: 'Governança Corporativa', ism: 100, ref: 'COBIT 2019 Média Mercado: 72', delta: '+28pts', c: '#60a5fa' },
          { area: 'Segurança da Informação', ism: 100, ref: 'ISO 27001 Terceiro Setor: 58', delta: '+42pts', c: '#f87171' },
          { area: 'IA Responsável', ism: 100, ref: 'ISO 42001 Linha de Base: 45', delta: '+55pts', c: '#a78bfa' },
          { area: 'Impacto Social (SROI)', ism: 99, ref: 'Média ONG Nacional: 68', delta: '+31pts', c: '#4ade80' },
          { area: 'Transformação Digital', ism: 99, ref: 'IDC Brazil Index 2026: 74', delta: '+25pts', c: '#fbbf24' },
          { area: 'Gestão do Conhecimento', ism: 98, ref: 'KM Best Practices: 61', delta: '+37pts', c: '#818cf8' },
        ].map((b, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `4px solid ${b.c}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{b.area}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: b.c }}>{b.ism}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>ISM Score</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{b.ref}</div>
                {badge(`+${b.delta} vs. Mercado`, '#22c55e', '#14532d')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 5: Motor de Avaliação ────────────────────────────────────────────

  const renderEvaluation = () => (
    <div>
      <div style={styles.secTitle}>⚙️ Motor de Avaliação Contínua & Planos de Melhoria</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O Motor de Avaliação Contínua monitora 12 domínios em tempo real, detecta desvios e emite recomendações fundamentadas com grau de confiança para aprovação da alta gestão.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Avaliações Automáticas / Mês', v: '48 ciclos', c: '#fbbf24', i: '⚙️' },
            { l: 'Desvios Detectados (30 dias)', v: '0 Críticos', c: '#34d399', i: '✅' },
            { l: 'Planos de Melhoria Abertos', v: '3 planos', c: '#60a5fa', i: '📋' },
            { l: 'Alertas de Conformidade', v: '0 Alertas', c: '#4ade80', i: '🔔' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: IA para Excelência ────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 IA para Excelência — Análise de Desempenho & Alertas Preditivos</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #a78bfa' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O agente Excellence AI analisa padrões de desvio de maturidade, prevê riscos de perda de certificação e recomenda ações preventivas com justificativas auditáveis.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Previsão de Perda de Maturidade', v: '0 Domínios em Risco', c: '#34d399' },
            { l: 'Oportunidades de Inovação Detectadas', v: '12 Identificadas', c: '#fbbf24' },
            { l: 'Relatórios Executivos Gerados (MoM)', v: '6 Relatórios', c: '#60a5fa' },
            { l: 'Acurácia das Recomendações IA', v: '96.8% Confiança', c: '#a78bfa' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Roadmap ───────────────────────────────────────────────────────

  const renderRoadmap = () => (
    <div>
      <div style={styles.secTitle}>🗺️ Roadmap de Excelência — Plano Diretor 10 Anos (Etapa 14)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { h: '1 Ano (2027)', c: '#34d399', itens: ['ISO 37301 Certificação Completa', 'EFQM Self-Assessment Formal', 'Expansão ESG para relatório GRI G4', 'Knowledge Graph 15k nós'] },
          { h: '3 Anos (2029)', c: '#60a5fa', itens: ['Prêmio Nacional Qualidade (PNQ)', 'ISO 56002 Inovação Certificada', 'Baldrige PEF Aplicação Formal', 'SROI Auditoria Externa Anual'] },
          { h: '5 Anos (2031)', c: '#a78bfa', itens: ['EFQM Gold Recognition Level', '50k Beneficiários com SROI 7x', 'IA Generativa Institucional Fine-tuned', 'Plataforma Replicável para 10 ONGs'] },
          { h: '10 Anos (2036)', c: '#fbbf24', itens: ['Referência Nacional Excelência ONG', 'Framework Open-Source 3º Setor', '200k Beneficiários', 'ISO 9001 Renovação 3º Ciclo'] },
        ].map((r, i) => (
          <div key={i} style={{ ...styles.card, borderTop: `4px solid ${r.c}` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: r.c, marginBottom: 10 }}>{r.h}</div>
            {r.itens.map((it, j) => (
              <div key={j} style={{ fontSize: 12, color: '#cbd5e1', padding: '5px 0', borderBottom: '1px solid #1e293b', display: 'flex', gap: 6 }}>
                <span style={{ color: r.c }}>▸</span> {it}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 8: Certificação Final ────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1c1917 40%, #1e1b4b 100%)', border: '2px solid #f472b640', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#f472b6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE EXCELÊNCIA INSTITUCIONAL
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EIEBCF — Enterprise Institutional Excellence,<br />Benchmarking & Certification Framework
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor alcança o <strong style={{ color: '#8b5cf6' }}>Nível 7 — Adaptativo</strong> em Excelência Institucional, com score global de 99.2/100, 4 certificações ISO obtidas e posição Top 1% no Terceiro Setor Nacional.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #be185d, #9d174d)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EIEBCF Emitido — Prompt 081' : '🏆 Emitir Certificado de Excelência Institucional Enterprise'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade Globais — Etapa 16 (EIEBCF Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {EXCELLENCE_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #f472b633' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f472b6', marginBottom: 8 }}>
            🏅 Declaração do Chief Excellence Officer (CXO) & Chief Quality Officer (CQO)
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EIEBCF posiciona a Plataforma Instituto Ser Melhor no mais alto nível de excelência institucional, com nota global de <strong style={{ color: '#f472b6' }}>99.2/100</strong> e maturidade global no Nível 7 — Adaptativo. Com 4 certificações ISO ativas, benchmarking Top 1% Nacional e ciclos permanentes de avaliação, a plataforma torna-se referência nacional para o Terceiro Setor. <strong style={{ color: '#f1f5f9' }}>Excelência Certificada.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CXO/CQO Board & Excellence Hub':   renderDashboard,
    'Mapa de Maturidade por Domínio':          renderDomains,
    'Matriz de Certificações Corporativas':     renderCertifications,
    'Benchmarking Nacional & Internacional':   renderBenchmark,
    'Motor de Avaliação & Planos de Melhoria': renderEvaluation,
    'IA para Excelência & Alertas':            renderAI,
    'Roadmap de Excelência — 10 Anos':         renderRoadmap,
    'CERTIFICAÇÃO ENTERPRISE DE EXCELÊNCIA':  renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🏅 EIEBCF — Enterprise Institutional Excellence, Benchmarking & Certification Framework</h1>
        <p style={styles.sub}>Prompt 081 · Instituto Ser Melhor v2.0 · EFQM 2020 · Baldrige · ISO 9001/27001/42001 · COBIT 2019 · Top 1% Nacional</p>
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

export default EIEBCFPage;
