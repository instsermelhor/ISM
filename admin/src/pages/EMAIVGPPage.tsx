/**
 * EMAIVGPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Mission Alignment & Institutional Value Governance Platform
 * Instituto Ser Melhor — Prompt 068 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CMO/CSO Board & Mission Hub  — Dashboard: Score 96.8/100, 10 KPIs
 *   2. Carta da Missão, Visão e Valores     — Declarativo institucional e pilares
 *   3. Matriz de Alinhamento Estratégico   — Mapeamento iniciativas × valores × pilares
 *   4. Avaliador de Iniciativas            — Validador prévio e scores de aderência
 *   5. Governança de IA Ética & Valores    — Diretrizes para automação e IA responsável
 *   6. Análise de Coerência & Desvios      — Prevenção e bloqueio de desvios da missão
 *   7. Painéis Executivos                  — Visões para CMO, CSO, CGO e Presidência
 *   8. CERTIFICAÇÃO EMAIVGP FINAL          — Parecer executivo + roadmap 5 anos
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEMAIVGPService,
  type MissionStatement, type InitiativeAlignment, type AlignmentMatrixItem,
  type EMAIVGPDashboardKPIs, type InitiativeType, type AlignmentLevel,
} from '../services/missionEMAIVGPEnterprise';

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

const TYPE_CFG: Record<InitiativeType, { label: string; icon: string; color: string }> = {
  PROJETO:      { label: 'Projeto', icon: '📋', color: '#60a5fa' },
  PROCESSO:     { label: 'Processo', icon: '⚙️', color: '#38bdf8' },
  AUTOMACAO:    { label: 'Automação', icon: '⚡', color: '#fbbf24' },
  AGENTE_IA:    { label: 'Agente IA', icon: '🤖', color: '#c084fc' },
  INVESTIMENTO: { label: 'Investimento', icon: '💰', color: '#34d399' },
  POLITICA:     { label: 'Política', icon: '📜', color: '#a78bfa' },
  PARCERIA:     { label: 'Parceria', icon: '🤝', color: '#fb923c' },
};

const LEVEL_CFG: Record<AlignmentLevel, { label: string; color: string; bg: string }> = {
  PLENO:       { label: 'Alinhamento Pleno', color: '#22c55e', bg: '#14532d' },
  ALTO:        { label: 'Alto Alinhamento', color: '#34d399', bg: '#064e3b' },
  PARCIAL:     { label: 'Alinhamento Parcial', color: '#f59e0b', bg: '#451a03' },
  DESALINHADO: { label: 'Desalinhado / Risco', color: '#ef4444', bg: '#450a0a' },
  EM_ANALISE:  { label: 'Em Análise', color: '#94a3b8', bg: '#1e293b' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CMO/CSO Board & Mission Hub',
  'Carta da Missão, Visão e Valores',
  'Matriz de Alinhamento Estratégico',
  'Avaliador de Iniciativas',
  'Governança de IA Ética & Valores',
  'Análise de Coerência & Desvios',
  'Painéis Executivos',
  'CERTIFICAÇÃO EMAIVGP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CMO/CSO Board & Mission Hub': '🎯',
  'Carta da Missão, Visão e Valores':   '📜',
  'Matriz de Alinhamento Estratégico': '📐',
  'Avaliador de Iniciativas':          '⚖️',
  'Governança de IA Ética & Valores':  '🤖',
  'Análise de Coerência & Desvios':     '🛡️',
  'Painéis Executivos':                '📊',
  'CERTIFICAÇÃO EMAIVGP FINAL':        '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EMAIVGPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CMO/CSO Board & Mission Hub');
  const [kpis, setKpis] = useState<EMAIVGPDashboardKPIs | null>(null);
  const [statement, setStatement] = useState<MissionStatement | null>(null);
  const [initiatives, setInitiatives] = useState<InitiativeAlignment[]>([]);
  const [matrix, setMatrix] = useState<AlignmentMatrixItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);
  const [activeInitiative, setActiveInitiative] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, st, ini, mat] = await Promise.all([
        EnterpriseEMAIVGPService.getDashboardKPIs(),
        EnterpriseEMAIVGPService.getMissionStatement(),
        EnterpriseEMAIVGPService.getInitiatives(),
        EnterpriseEMAIVGPService.getAlignmentMatrix(),
      ]);
      setKpis(k); setStatement(st); setInitiatives(ini); setMatrix(mat);
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
    sec:     { marginBottom: 28 } as React.CSSProperties,
    secTitle:{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    th:      { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:      { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🎯</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Carregando EMAIVGP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)', border: '1px solid #6366f133', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🎯</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE MISSION ALIGNMENT & INSTITUTIONAL VALUE GOVERNANCE PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EMAIVGP — Governança Orientada à Missão 🎯
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Assegurando que cada projeto, decisão executiva, automação e agente de IA permaneçam rigorosamente alinhados ao propósito social, visão e valores do Instituto Ser Melhor.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ISO 37000', 'ISO 37301', 'ISO 42001', 'Value-Based Management', 'Balanced Scorecard', 'OKRs', 'COBIT 2019', 'TOGAF'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', background: '#818cf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #818cf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Alinhamento Global', kpis.globalMissionAlignmentScore.toFixed(1), '%', '#818cf8', '🎯')}
          {kpiCard('Conformidade com Valores', kpis.valuesComplianceScore.toFixed(1), '%', '#34d399', '📜')}
          {kpiCard('Iniciativas Auditadas', kpis.initiativesAudited, 'inic.', '#60a5fa', '⚖️')}
          {kpiCard('Desvios Bloqueados', kpis.misalignmentsBlocked, 'bloqs.', '#f87171', '🛡️')}
          {kpiCard('Conformidade Ética', `${kpis.ethicsCompliancePercent}%`, '', '#4ade80', '✅')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade da Governança de Missão</div>
          {[
            { l: 'Governança Orientada por Missão', v: 97, c: '#818cf8' },
            { l: 'Alinhamento Estratégico', v: 96, c: '#34d399' },
            { l: 'Gestão por Valores', v: 98, c: '#a78bfa' },
            { l: 'Coerência Institucional', v: 95, c: '#60a5fa' },
            { l: 'Compliance da Missão', v: 99, c: '#4ade80' },
            { l: 'IA Ética Institucional', v: 94, c: '#fbbf24' },
            { l: 'Transparência Decisória', v: 99, c: '#38bdf8' },
            { l: 'Sustentabilidade Institucional', v: 95, c: '#fb923c' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Visão Geral de Alinhamento</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Missão', v: Math.round(kpis.globalMissionAlignmentScore), c: '#818cf8' },
              { label: 'Valores', v: Math.round(kpis.valuesComplianceScore), c: '#34d399' },
              { label: 'Maturidade', v: Math.round(kpis.maturityScore), c: '#a78bfa' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>🤖 Status da IA de Coerência Institucional</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Todas as 42 iniciativas ativas estão monitoradas. 6 tentativas de desvio de missão (ex: captação sem supervisão humana ou fontes antiéticas) foram preventivamente bloqueadas pelo motor de IA.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Carta Institucional ───────────────────────────────────────────

  const renderStatement = () => (
    <div>
      {statement && (
        <>
          <div style={{ ...styles.card, marginBottom: 20, borderLeft: '4px solid #818cf8' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Declaração de Propósito Supremo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginTop: 6, lineHeight: 1.5 }}>"{statement.purpose}"</div>
          </div>

          <div style={styles.grid2}>
            <div style={{ ...styles.card, borderTop: '3px solid #34d399' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>🎯 Nossa Missão</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{statement.mission}</div>
            </div>
            <div style={{ ...styles.card, borderTop: '3px solid #60a5fa' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>👁️ Nossa Visão (2030)</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{statement.vision}</div>
            </div>
          </div>

          <div style={{ ...styles.sec, marginTop: 24 }}>
            <div style={styles.secTitle}>📜 Valores Institucionais Fundamentais</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {statement.coreValues.map(val => (
                <div key={val.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16, borderLeft: '4px solid #a78bfa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{val.name}</div>
                    {badge(val.category, '#a78bfa', '#2e1065')}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{val.description}</div>
                  <div style={{ marginTop: 8, fontSize: 10, color: '#64748b' }}>Peso de Governança: <strong style={{ color: '#34d399' }}>{val.weight}/10</strong></div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sec}>
            <div style={styles.secTitle}>🏛️ Pilares Estratégicos Permanentes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {statement.strategicPillars.map(pil => (
                <div key={pil.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16, borderTop: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', marginBottom: 6 }}>{pil.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{pil.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {pil.kpis.map((k, i) => <span key={i} style={{ fontSize: 9, color: '#64748b', background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>📊 {k}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ── TAB 3: Matriz de Alinhamento ─────────────────────────────────────────

  const renderMatrix = () => (
    <div>
      <div style={styles.secTitle}>📐 Matriz Corporativa de Alinhamento & Aderência</div>
      <div style={{ ...styles.card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Iniciativa', 'Tipo', 'Valor Associado', 'Objetivo Estratégico', 'Aderência', 'Impacto na Missão', 'Responsável'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(item => {
              const tc = TYPE_CFG[item.type];
              return (
                <tr key={item.id}>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#f1f5f9' }}>{item.initiativeTitle}</td>
                  <td style={styles.td}>{badge(`${tc.icon} ${tc.label}`, tc.color, tc.color + '20')}</td>
                  <td style={{ ...styles.td, color: '#a78bfa', fontWeight: 600 }}>{item.associatedValue}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{item.strategicObjective}</td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 800, color: item.alignmentScore >= 90 ? '#34d399' : item.alignmentScore >= 70 ? '#fbbf24' : '#f87171' }}>
                      {item.alignmentScore}%
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: 11, color: '#94a3b8' }}>{item.impactOnMission}</td>
                  <td style={{ ...styles.td, fontSize: 11 }}>{item.responsible}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── TAB 4: Avaliador de Iniciativas ──────────────────────────────────────

  const renderEvaluator = () => {
    const ini = initiatives[activeInitiative];
    return (
      <div>
        <div style={styles.secTitle}>⚖️ Motor de Avaliação Previa de Iniciativas</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {initiatives.map((item, i) => (
            <button key={item.id} onClick={() => setActiveInitiative(i)}
              style={{ padding: '8px 16px', borderRadius: 8, border: `2px solid ${i === activeInitiative ? '#818cf8' : '#1e293b'}`, background: i === activeInitiative ? '#1e1b4b' : '#0f172a', color: i === activeInitiative ? '#818cf8' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {item.title.length > 30 ? item.title.slice(0, 30) + '…' : item.title}
            </button>
          ))}
        </div>

        {ini && (() => {
          const lc = LEVEL_CFG[ini.level];
          const tc = TYPE_CFG[ini.type];
          return (
            <div style={{ ...styles.card, borderTop: `4px solid ${lc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {badge(`${tc.icon} ${tc.label}`, tc.color, tc.color + '20')}
                    {badge(lc.label, lc.color, lc.bg)}
                    {badge(`Status: ${ini.approvalStatus}`, ini.approvalStatus === 'APROVADO' ? '#22c55e' : '#ef4444', '#1e293b')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{ini.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Departamento: <strong>{ini.department}</strong> · Responsável: <strong>{ini.responsible}</strong></div>
                </div>
                <div style={{ textAlign: 'center', background: '#1e293b', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: lc.color }}>{ini.compositeAlignmentScore}%</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Score Composto</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16 }}>{ini.description}</div>

              <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>🤖 Parecer de Governança por IA</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{ini.aiRationale}</div>
              </div>

              {ini.risksIdentified.length > 0 && (
                <div style={{ background: '#450a0a20', border: '1px solid #f8717133', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠️ Riscos Institucionais Mapeados</div>
                  {ini.risksIdentified.map((r, i) => (
                    <div key={i} style={{ marginBottom: 6, fontSize: 11 }}>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>[{r.category}]</span> <span style={{ color: '#cbd5e1' }}>{r.description}</span>
                      <div style={{ color: '#34d399', marginTop: 2 }}>Mitigação: {r.mitigation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  // ── TAB 5: IA Ética ──────────────────────────────────────────────────────

  const renderAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 Governança de IA Ética & Supervisão Humana (ISO 42001)</div>
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Na Plataforma Instituto Ser Melhor, todo modelo de IA ou automação opera obrigatoriamente sob os princípios de <strong>Human-in-the-Loop</strong>, explicabilidade integral, minimização de dados e alinhamento estrito à missão institucional.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { t: 'Supervisão Humana Obrigatória', d: 'Decisões críticas de saúde, financeiras ou contratuais exigem validação humana.', c: '#34d399' },
            { t: 'Explicabilidade & Auditabilidade', d: 'Nenhum modelo opera como caixa-preta; todas as saídas possuem raciocínio auditável.', c: '#60a5fa' },
            { t: 'Prevenção de Vieses', d: 'Auditoria contínua para evitar discriminação ou disparidades de tratamento.', c: '#a78bfa' },
            { t: 'Privacidade por Design', d: 'Conformidade integral com LGPD e ISO 27001 em todas as interações da IA.', c: '#fbbf24' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderLeft: `3px solid ${item.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Análise de Coerência ──────────────────────────────────────────

  const renderCoherence = () => (
    <div>
      <div style={styles.secTitle}>🛡️ Análise de Coerência & Prevenção de Desvios</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #f87171' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>🚨 Iniciativas Bloqueadas por Desvio da Missão</div>
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 14 }}>
          O motor de IA bloqueou automaticamente propostas e automações que colidiam com a Carta de Valores Institucionais.
        </div>
        {initiatives.filter(i => i.approvalStatus === 'REJEITADO').map(item => (
          <div key={item.id} style={{ background: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{item.title}</span>
              <span style={{ fontSize: 10, color: '#f87171', fontWeight: 700 }}>REJEITADO (Score: {item.compositeAlignmentScore}%)</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.description}</div>
            <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>Motivo: {item.aiRationale}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel do Chief Mission Officer (CMO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #818cf8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Aderência da Carteira', v: '96.8%', c: '#818cf8', i: '🎯' },
            { l: 'Valores Respeitados', v: '100%', c: '#34d399', i: '📜' },
            { l: 'Iniciativas de Alto Impacto', v: '18', c: '#60a5fa', i: '🚀' },
            { l: 'Propostas Rejeitadas por Desvio', v: '6', c: '#f87171', i: '🛑' },
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
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)', border: '2px solid #818cf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE GOVERNANÇA ORIENTADA À MISSÃO ENTERPRISE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EMAIVGP — Enterprise Mission Alignment<br />& Institutional Value Governance Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor certifica que 100% de seus projetos, automações, algoritmos de IA e decisões estratégicas operam em estrita aderência à sua missão, visão e carta de valores.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EMAIVGP Emitido — Prompt 068' : '🎯 Emitir Certificado EMAIVGP Final'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}> Parecer Executivo do Chief Mission Officer (CMO)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          O sistema EMAIVGP foi auditado e aprovado. Todas as iniciativas ativas do Instituto Ser Melhor apresentam score médio de alinhamento de 96.8%. Propostas incompatíveis com os valores fundamentais foram barradas com sucesso, garantindo a integridade do propósito social da instituição.
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CMO/CSO Board & Mission Hub': renderDashboard,
    'Carta da Missão, Visão e Valores':   renderStatement,
    'Matriz de Alinhamento Estratégico': renderMatrix,
    'Avaliador de Iniciativas':          renderEvaluator,
    'Governança de IA Ética & Valores':  renderAI,
    'Análise de Coerência & Desvios':     renderCoherence,
    'Painéis Executivos':                renderExecutive,
    'CERTIFICAÇÃO EMAIVGP FINAL':        renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🎯 EMAIVGP — Enterprise Mission Alignment & Institutional Value Governance Platform</h1>
        <p style={styles.sub}>Prompt 068 · Instituto Ser Melhor v2.0 · ISO 37000 · ISO 37301 · ISO 42001 · Value-Based Management · Mission-Driven Enterprise</p>
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

export default EMAIVGPPage;
