/**
 * EALOIPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Adaptive Learning & Organizational Intelligence Platform
 * Instituto Ser Melhor — Prompt 067 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CLO/CAIO Board & Learning Hub  — Dashboard: Score 93.2/100, KPIs, scorebars
 *   2. Repositório de Lições Aprendidas      — 6 lições seed com cards ricos
 *   3. Motor de Melhoria Contínua            — Backlog de 4 melhorias + status Kanban
 *   4. Análise de Causa-Raiz                 — 2 RCAs (5 Porquês + Ishikawa)
 *   5. Gestão de Feedback & Sentimento       — 6 feedbacks multi-fonte com sentimento
 *   6. Padrões & Inteligência Adaptativa     — 4 padrões detectados pela IA
 *   7. Painéis Executivos & Analytics        — CLO, CAIO, COO, Matriz de aprendizado
 *   8. CERTIFICAÇÃO EALOIP FINAL             — Parecer + roadmap 5 anos
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEALOIPService,
  type LessonLearned, type ImprovementItem, type RootCauseAnalysis,
  type FeedbackEntry, type LearningPattern, type EALOIPDashboardKPIs,
  type LessonType, type LessonOrigin, type ImprovementStatus,
  type RootCauseMethod, type FeedbackSource, type LearningDomain,
} from '../services/adaptiveLearningEALOIPEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const badge = (text: string, color: string, bg: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' as const }}>
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

const LESSON_TYPE_CFG: Record<LessonType, { label: string; color: string; bg: string; icon: string }> = {
  SUCESSO:            { label: 'Sucesso', color: '#059669', bg: '#d1fae5', icon: '✅' },
  FALHA:              { label: 'Falha', color: '#dc2626', bg: '#fee2e2', icon: '❌' },
  RISCO_EVITADO:      { label: 'Risco Evitado', color: '#2563eb', bg: '#dbeafe', icon: '🛡️' },
  BOA_PRATICA:        { label: 'Boa Prática', color: '#7c3aed', bg: '#f3e8ff', icon: '⭐' },
  OPORTUNIDADE_PERDIDA: { label: 'Oportunidade Perdida', color: '#d97706', bg: '#fef3c7', icon: '⚠️' },
};

const ORIGIN_CFG: Record<LessonOrigin, string> = {
  PROJETO_ENCERRADO:      '📋 Projeto',
  AUDITORIA:              '🔍 Auditoria',
  INCIDENTE:              '🚨 Incidente',
  NAO_CONFORMIDADE:       '⚠️ Não Conformidade',
  FEEDBACK_BENEFICIARIO:  '💚 Feedback Beneficiário',
  FEEDBACK_PROFISSIONAL:  '👤 Feedback Profissional',
  PESQUISA_SATISFACAO:    '📊 Pesquisa',
  REVISAO_PROCESSO:       '⚙️ Revisão Processo',
  DECISAO_ESTRATEGICA:    '🧭 Decisão Estratégica',
  AVALIACAO_IMPACTO:      '📈 Avaliação Impacto',
};

const IMPROVEMENT_STATUS_CFG: Record<ImprovementStatus, { label: string; color: string; bg: string }> = {
  IDENTIFICADA:         { label: 'Identificada', color: '#94a3b8', bg: '#1e293b' },
  EM_ANALISE:           { label: 'Em Análise', color: '#60a5fa', bg: '#1e3a5f' },
  APROVADA:             { label: 'Aprovada', color: '#a78bfa', bg: '#2e1065' },
  EM_IMPLEMENTACAO:     { label: 'Em Implementação', color: '#f59e0b', bg: '#451a03' },
  CONCLUIDA:            { label: 'Concluída', color: '#22c55e', bg: '#14532d' },
  CANCELADA:            { label: 'Cancelada', color: '#ef4444', bg: '#450a0a' },
};

const RCA_METHOD_CFG: Record<RootCauseMethod, { label: string; icon: string; color: string }> = {
  CINCO_PORQUES:    { label: '5 Porquês', icon: '❓', color: '#60a5fa' },
  ISHIKAWA:         { label: 'Ishikawa (Espinha de Peixe)', icon: '🐟', color: '#a78bfa' },
  FMEA:             { label: 'FMEA', icon: '⚙️', color: '#f59e0b' },
  PARETO:           { label: 'Pareto', icon: '📊', color: '#34d399' },
  ANALISE_SISTEMICA:{ label: 'Análise Sistêmica', icon: '🕸️', color: '#fb923c' },
};

const FEEDBACK_SOURCE_CFG: Record<FeedbackSource, { label: string; color: string; icon: string }> = {
  BENEFICIARIO:   { label: 'Beneficiário', color: '#34d399', icon: '💚' },
  PROFISSIONAL:   { label: 'Profissional', color: '#60a5fa', icon: '👤' },
  VOLUNTARIO:     { label: 'Voluntário', color: '#a78bfa', icon: '🌱' },
  GESTOR:         { label: 'Gestor', color: '#fbbf24', icon: '👔' },
  CONSELHO:       { label: 'Conselho', color: '#fb923c', icon: '🏛️' },
  AUDITORIA:      { label: 'Auditoria', color: '#f87171', icon: '🔍' },
  SISTEMA:        { label: 'Sistema', color: '#38bdf8', icon: '🤖' },
};

const DOMAIN_CFG: Record<LearningDomain, { label: string; color: string }> = {
  GOVERNANCA:       { label: 'Governança', color: '#a78bfa' },
  OPERACIONAL:      { label: 'Operacional', color: '#60a5fa' },
  FINANCEIRO:       { label: 'Financeiro', color: '#34d399' },
  TECNOLOGICO:      { label: 'Tecnológico', color: '#38bdf8' },
  PROGRAMAS_SOCIAIS:{ label: 'Programas Sociais', color: '#86efac' },
  RH:               { label: 'Recursos Humanos', color: '#fbbf24' },
  COMPLIANCE:       { label: 'Compliance', color: '#f87171' },
  IA:               { label: 'Inteligência Artificial', color: '#c084fc' },
  INFRAESTRUTURA:   { label: 'Infraestrutura', color: '#fb923c' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CLO/CAIO Board & Learning Hub',
  'Repositório de Lições Aprendidas',
  'Motor de Melhoria Contínua',
  'Análise de Causa-Raiz',
  'Gestão de Feedback & Sentimento',
  'Padrões & Inteligência Adaptativa',
  'Painéis Executivos & Analytics',
  'CERTIFICAÇÃO EALOIP FINAL',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CLO/CAIO Board & Learning Hub': '🧠',
  'Repositório de Lições Aprendidas':    '📚',
  'Motor de Melhoria Contínua':          '⚙️',
  'Análise de Causa-Raiz':               '🔬',
  'Gestão de Feedback & Sentimento':     '💬',
  'Padrões & Inteligência Adaptativa':   '🔮',
  'Painéis Executivos & Analytics':      '📊',
  'CERTIFICAÇÃO EALOIP FINAL':           '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EALOIPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CLO/CAIO Board & Learning Hub');
  const [kpis, setKpis] = useState<EALOIPDashboardKPIs | null>(null);
  const [lessons, setLessons] = useState<LessonLearned[]>([]);
  const [improvements, setImprovements] = useState<ImprovementItem[]>([]);
  const [rcas, setRcas] = useState<RootCauseAnalysis[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);
  const [expandedRCA, setExpandedRCA] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, l, im, r, f, p] = await Promise.all([
        EnterpriseEALOIPService.getDashboardKPIs(),
        EnterpriseEALOIPService.getLessonsLearned(),
        EnterpriseEALOIPService.getImprovements(),
        EnterpriseEALOIPService.getRootCauseAnalyses(),
        EnterpriseEALOIPService.getFeedbacks(),
        EnterpriseEALOIPService.getPatterns(),
      ]);
      setKpis(k); setLessons(l); setImprovements(im); setRcas(r); setFeedbacks(f); setPatterns(p);
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
    grid3:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } as React.CSSProperties,
    sec:     { marginBottom: 32 } as React.CSSProperties,
    secTitle:{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
    label:   { fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 } as React.CSSProperties,
    th:      { textAlign: 'left' as const, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', background: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #1e293b' },
    td:      { padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #0f172a', verticalAlign: 'top' as const },
  };

  if (loading && !kpis) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🧠</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Carregando EALOIP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #0f172a 50%, #1a0e2e 100%)', border: '1px solid #7c3aed22', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🧠</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE ADAPTIVE LEARNING & ORGANIZATIONAL INTELLIGENCE PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EALOIP — Aprendizado Organizacional Contínuo 🧠
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Plataforma que transforma toda experiência institucional — decisões, auditorias, incidentes, feedbacks e projetos —
          em conhecimento estruturado, melhorias contínuas e inteligência organizacional adaptativa.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['ISO 30401', 'ISO 9001', 'ISO 42001', 'Peter Senge', 'PDCA', 'COBIT 2019', 'Decision Intelligence', 'DAMA-DMBOK2'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: '#c084fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #c084fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* KPI Rows */}
      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade EALOIP', kpis.maturityScore.toFixed(1), '/100', '#c084fc', '🧠')}
          {kpiCard('Lições Validadas', `${kpis.lessonsValidated}/${kpis.totalLessons}`, 'lições', '#34d399', '📚')}
          {kpiCard('Taxa de Reutilização', kpis.reuseRate.toFixed(1), '%', '#60a5fa', '🔄')}
          {kpiCard('Score Médio Lições', kpis.avgImpactScore.toFixed(1), '/100', '#fbbf24', '⭐')}
          {kpiCard('Padrões Detectados IA', kpis.aiPatternsDetected, 'pads', '#fb923c', '🔮')}
        </>}
      </div>
      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Melhorias Concluídas', kpis.improvementsConcluded, 'ok', '#34d399', '✅')}
          {kpiCard('Em Implementação', kpis.improvementsInProgress, 'imp', '#f59e0b', '⚙️')}
          {kpiCard('Tempo Médio Impl.', kpis.avgImplementationDays, 'dias', '#38bdf8', '⏱️')}
          {kpiCard('Redução Recorrências', kpis.recurrenceReduction, '%', '#4ade80', '📉')}
          {kpiCard('Feedback → Melhoria', kpis.feedbackToImprovementRate, '%', '#a78bfa', '💬')}
        </>}
      </div>

      {/* Maturity Grid */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Scores de Maturidade EALOIP</div>
          {[
            { l: 'Aprendizado Organizacional', v: 94, c: '#c084fc' },
            { l: 'Gestão de Lições Aprendidas', v: 96, c: '#60a5fa' },
            { l: 'Melhoria Contínua', v: 91, c: '#34d399' },
            { l: 'Inteligência Adaptativa', v: 90, c: '#fbbf24' },
            { l: 'Gestão do Conhecimento', v: 95, c: '#fb923c' },
            { l: 'Análise de Causa-Raiz', v: 92, c: '#38bdf8' },
            { l: 'Gestão de Feedback', v: 93, c: '#4ade80' },
            { l: 'Reutilização do Conhecimento', v: 88, c: '#a78bfa' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Anéis de Maturidade</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {kpis && [
              { label: 'Maturidade', v: Math.round(kpis.maturityScore), c: '#c084fc' },
              { label: 'Reuso (%)', v: Math.round(kpis.reuseRate), c: '#34d399' },
              { label: 'IA Acurácia', v: Math.round(kpis.aiAccuracy), c: '#60a5fa' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {progressRing(r.v, r.c)}
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.label}</div>
              </div>
            ))}
          </div>
          {[
            { l: 'Evolução Institucional', v: 93, c: '#f87171' },
            { l: 'Eficiência Operacional', v: 91, c: '#fda4af' },
            { l: 'Inovação Contínua', v: 89, c: '#86efac' },
            { l: 'Resiliência Organizacional', v: 94, c: '#d8b4fe' },
            { l: 'Inteligência Evolutiva', v: 90, c: '#fed7aa' },
            { l: 'Capacidade Adaptativa', v: 92, c: '#a5f3fc' },
            { l: 'Maturidade Organizacional', v: 93, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>
      </div>

      {/* Quick Wins */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>⚡ Ações de Melhoria Ativa — Backlog EALOIP</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {improvements.slice(0, 4).map(imp => {
            const sc = IMPROVEMENT_STATUS_CFG[imp.status];
            const pc = imp.priority === 'CRITICA' ? '#f87171' : imp.priority === 'ALTA' ? '#fbbf24' : '#60a5fa';
            return (
              <div key={imp.id} style={{ background: '#1e293b', borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${sc.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, padding: '2px 8px', borderRadius: 4 }}>{sc.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: pc }}>P:{imp.priority}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.4 }}>{imp.title}</div>
                <div style={{ height: 4, background: '#0f172a', borderRadius: 2, marginBottom: 4 }}>
                  <div style={{ width: `${imp.completionPercent}%`, height: 4, background: sc.color, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{imp.completionPercent}% concluído · {imp.responsible}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Lições Aprendidas ─────────────────────────────────────────────

  const renderLessons = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Total Lições', lessons.length, 'les.', '#c084fc', '📚')}
        {kpiCard('Validadas', lessons.filter(l => l.isValidated).length, 'ok', '#34d399', '✅')}
        {kpiCard('Críticas/Altas', lessons.filter(l => ['CRITICA', 'ALTA'].includes(l.criticality)).length, 'les.', '#f87171', '🔴')}
        {kpiCard('Total Reutilizações', lessons.reduce((a, l) => a + l.reuseCount, 0), 'refs', '#60a5fa', '🔄')}
      </div>

      <div style={styles.secTitle}>📚 Repositório Corporativo de Lições Aprendidas</div>
      {lessons.map(lesson => {
        const tc = LESSON_TYPE_CFG[lesson.type];
        const dc = DOMAIN_CFG[lesson.domain];
        const critColor = { CRITICA: '#f87171', ALTA: '#fbbf24', MEDIA: '#60a5fa', BAIXA: '#4ade80' }[lesson.criticality];
        const isExpanded = expandedLesson === lesson.id;
        return (
          <div key={lesson.id} style={{ ...styles.card, marginBottom: 16, borderLeft: `4px solid ${tc.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {badge(`${tc.icon} ${tc.label}`, tc.color, tc.bg)}
                  {badge(dc.label, dc.color, dc.color + '20')}
                  {badge(lesson.criticality, critColor!, critColor! + '20')}
                  {lesson.isValidated && badge('✓ Validada', '#059669', '#d1fae5')}
                  <span style={{ fontSize: 10, color: '#64748b', padding: '2px 6px', background: '#1e293b', borderRadius: 4 }}>{ORIGIN_CFG[lesson.origin]}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>{lesson.title}</div>
              </div>
              <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: tc.color }}>{lesson.impactScore}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Impact Score</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>🔄 {lesson.reuseCount}×</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>{lesson.description}</div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {lesson.tags.map((t, i) => (
                <span key={i} style={{ fontSize: 10, color: '#64748b', background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>#{t}</span>
              ))}
            </div>

            {/* Expandable */}
            <button onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
              style={{ fontSize: 11, color: '#60a5fa', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isExpanded ? 12 : 0 }}>
              {isExpanded ? '▲ Ocultar detalhes' : '▼ Ver detalhes completos'}
            </button>

            {isExpanded && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>📌 Contexto & Evidências</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 8 }}>{lesson.context}</div>
                  {lesson.evidences.map((e, i) => <div key={i} style={{ fontSize: 11, color: '#60a5fa', marginBottom: 2 }}>• {e}</div>)}
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>💡 Recomendações</div>
                  {lesson.recommendations.map((r, i) => <div key={i} style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 4, lineHeight: 1.5 }}>{i + 1}. {r}</div>)}
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>📈 Resultados Obtidos</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{lesson.results}</div>
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', marginBottom: 6 }}>🔗 Módulos Relacionados</div>
                  {lesson.relatedModules.map((m, i) => <div key={i} style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 2 }}>• {m}</div>)}
                  <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>Aplicabilidade: <strong style={{ color: '#f1f5f9' }}>{lesson.applicability}</strong></div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Matriz de Aprendizado */}
      <div style={{ ...styles.sec, marginTop: 24 }}>
        <div style={styles.secTitle}>📋 Matriz de Aprendizado Organizacional</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Lição', 'Domínio', 'Origem', 'Impacto', 'Criticidade', 'Reuso', 'Aplicabilidade', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => {
                const tc = LESSON_TYPE_CFG[lesson.type];
                const dc = DOMAIN_CFG[lesson.domain];
                const critColor = { CRITICA: '#f87171', ALTA: '#fbbf24', MEDIA: '#60a5fa', BAIXA: '#4ade80' }[lesson.criticality];
                return (
                  <tr key={lesson.id}>
                    <td style={{ ...styles.td, maxWidth: 220 }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 11, lineHeight: 1.4 }}>{lesson.title}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{tc.icon} {tc.label}</div>
                    </td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: dc.color }}>{dc.label}</span></td>
                    <td style={{ ...styles.td, fontSize: 10, color: '#94a3b8' }}>{ORIGIN_CFG[lesson.origin]}</td>
                    <td style={styles.td}><span style={{ fontWeight: 800, color: lesson.impactScore >= 90 ? '#f87171' : lesson.impactScore >= 75 ? '#fbbf24' : '#60a5fa' }}>{lesson.impactScore}/100</span></td>
                    <td style={styles.td}>{badge(lesson.criticality, critColor!, critColor! + '20')}</td>
                    <td style={styles.td}><span style={{ fontWeight: 700, color: '#34d399' }}>🔄 {lesson.reuseCount}×</span></td>
                    <td style={{ ...styles.td, fontSize: 10 }}>{lesson.applicability.replace('_', ' ')}</td>
                    <td style={styles.td}>{lesson.isValidated ? badge('✓ Validada', '#059669', '#d1fae5') : badge('Pendente', '#64748b', '#1e293b')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── TAB 3: Melhoria Contínua ─────────────────────────────────────────────

  const renderImprovements = () => {
    const statusOrder: ImprovementStatus[] = ['EM_IMPLEMENTACAO', 'APROVADA', 'EM_ANALISE', 'IDENTIFICADA', 'CONCLUIDA', 'CANCELADA'];
    const grouped = statusOrder.reduce((acc, s) => {
      acc[s] = improvements.filter(i => i.status === s);
      return acc;
    }, {} as Record<ImprovementStatus, ImprovementItem[]>);

    return (
      <div>
        <div style={styles.row}>
          {kpiCard('Total Melhorias', improvements.length, 'tot.', '#c084fc', '⚙️')}
          {kpiCard('Concluídas', improvements.filter(i => i.status === 'CONCLUIDA').length, 'ok', '#34d399', '✅')}
          {kpiCard('Em Andamento', improvements.filter(i => i.status === 'EM_IMPLEMENTACAO').length, 'imp', '#f59e0b', '🔄')}
          {kpiCard('IA Recomendadas', improvements.filter(i => i.aiRecommended).length, 'AI', '#60a5fa', '🤖')}
        </div>

        {/* Kanban View */}
        <div style={styles.secTitle}>📋 Backlog de Melhorias — Kanban EALOIP</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginBottom: 28 }}>
          {(['EM_IMPLEMENTACAO', 'APROVADA', 'EM_ANALISE', 'CONCLUIDA'] as ImprovementStatus[]).map(status => {
            const sc = IMPROVEMENT_STATUS_CFG[status];
            const items = grouped[status] ?? [];
            return (
              <div key={status} style={{ background: '#0f172a', border: `1px solid ${sc.color}30`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{sc.label}</span>
                  <span style={{ fontSize: 11, color: '#64748b', background: '#1e293b', padding: '2px 8px', borderRadius: 10 }}>{items.length}</span>
                </div>
                {items.map(imp => {
                  const pc = imp.priority === 'CRITICA' ? '#f87171' : imp.priority === 'ALTA' ? '#fbbf24' : '#60a5fa';
                  return (
                    <div key={imp.id} style={{ background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                      {imp.aiRecommended && <div style={{ fontSize: 9, fontWeight: 800, color: '#c084fc', marginBottom: 4 }}>🤖 IA RECOMENDADA</div>}
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, lineHeight: 1.4 }}>{imp.title}</div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                        {badge(imp.priority, pc, pc + '20')}
                        {badge(imp.category, '#94a3b8', '#1e293b')}
                        <span style={{ fontSize: 10, color: '#64748b' }}>Esforço: {imp.effortEstimate}</span>
                      </div>
                      {imp.completionPercent > 0 && (
                        <div>
                          <div style={{ height: 4, background: '#0f172a', borderRadius: 2, marginBottom: 3 }}>
                            <div style={{ width: `${imp.completionPercent}%`, height: 4, background: sc.color, borderRadius: 2 }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>{imp.completionPercent}%</div>
                        </div>
                      )}
                      {imp.kpiImpact.slice(0, 1).map((k, i) => (
                        <div key={i} style={{ marginTop: 6, fontSize: 10, color: '#94a3b8' }}>
                          📊 {k.kpi}: {k.currentValue} → <strong style={{ color: '#34d399' }}>{k.expectedValue} {k.unit}</strong>
                        </div>
                      ))}
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>👤 {imp.responsible} · 📅 {imp.deadline}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Detail Table */}
        <div style={styles.secTitle}>📊 Tabela de Melhorias — Visão Executiva</div>
        <div style={{ ...styles.card, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Melhoria', 'Categoria', 'Status', 'Prioridade', 'Esforço', 'Prazo', '% Concluído', 'IA'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {improvements.map(imp => {
                const sc = IMPROVEMENT_STATUS_CFG[imp.status];
                const pc = imp.priority === 'CRITICA' ? '#f87171' : imp.priority === 'ALTA' ? '#fbbf24' : '#60a5fa';
                return (
                  <tr key={imp.id}>
                    <td style={{ ...styles.td, maxWidth: 260 }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 12, lineHeight: 1.4 }}>{imp.title}</div>
                    </td>
                    <td style={styles.td}>{badge(imp.category, '#7c3aed', '#f3e8ff')}</td>
                    <td style={styles.td}>{badge(sc.label, sc.color, sc.bg)}</td>
                    <td style={styles.td}>{badge(imp.priority, pc, pc + '20')}</td>
                    <td style={{ ...styles.td, color: imp.effortEstimate === 'ALTO' ? '#f87171' : imp.effortEstimate === 'MEDIO' ? '#fbbf24' : '#34d399' }}>{imp.effortEstimate}</td>
                    <td style={{ ...styles.td, fontSize: 11 }}>{imp.deadline}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 50, height: 4, background: '#1e293b', borderRadius: 2 }}>
                          <div style={{ width: `${imp.completionPercent}%`, height: 4, background: sc.color, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{imp.completionPercent}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>{imp.aiRecommended ? '🤖 Sim' : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── TAB 4: RCA ───────────────────────────────────────────────────────────

  const renderRCA = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Total RCAs', rcas.length, 'RCAs', '#c084fc', '🔬')}
        {kpiCard('Fechados', rcas.filter(r => r.closedAt).length, 'ok', '#34d399', '✅')}
        {kpiCard('Em Aberto', rcas.filter(r => !r.closedAt).length, 'open', '#f87171', '🔴')}
        {kpiCard('Ações Corretivas', rcas.reduce((a, r) => a + r.correctiveActions.length, 0), 'ações', '#fbbf24', '⚡')}
      </div>

      <div style={styles.secTitle}>🔬 Análises de Causa-Raiz — Método Formal</div>
      {rcas.map(rca => {
        const mc = RCA_METHOD_CFG[rca.method];
        const dc = DOMAIN_CFG[rca.domain];
        const rc = rca.recurrenceRisk === 'ALTO' ? '#f87171' : rca.recurrenceRisk === 'MEDIO' ? '#fbbf24' : '#34d399';
        const isExpanded = expandedRCA === rca.id;
        return (
          <div key={rca.id} style={{ ...styles.card, marginBottom: 20, borderTop: `4px solid ${mc.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {badge(`${mc.icon} ${mc.label}`, mc.color, mc.color + '20')}
                  {badge(dc.label, dc.color, dc.color + '20')}
                  {badge(`Risco Recorrência: ${rca.recurrenceRisk}`, rc, rc + '20')}
                  {rca.closedAt ? badge('✅ Fechado', '#059669', '#d1fae5') : badge('🔴 Em Aberto', '#dc2626', '#fee2e2')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{rca.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}><strong>Problema:</strong> {rca.problem}</div>
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}><strong>Impacto:</strong> {rca.impact}</div>
              </div>
            </div>

            {/* Root Causes Chain */}
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
                {mc.icon} Cadeia de Causas — {mc.label}
              </div>
              {rca.rootCauses.map((rc2, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, paddingLeft: (rc2.level - 1) * 20 }}>
                  <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: mc.color + '30', border: `2px solid ${mc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: mc.color }}>{rc2.level}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{rc2.cause}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>📄 {rc2.evidence}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setExpandedRCA(isExpanded ? null : rca.id)}
              style={{ fontSize: 11, color: '#60a5fa', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isExpanded ? 12 : 0 }}>
              {isExpanded ? '▲ Ocultar ações' : '▼ Ver ações corretivas e preventivas'}
            </button>

            {isExpanded && (
              <div style={styles.grid2}>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>✅ Ações Corretivas</div>
                  {rca.correctiveActions.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: '6px 10px', background: '#0f172a', borderRadius: 6 }}>
                      <div style={{ fontSize: 12, color: '#e2e8f0' }}>{a.action}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>👤 {a.responsible} · 📅 {a.deadline} · <span style={{ color: '#34d399' }}>{a.status}</span></div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1e293b', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>🛡️ Ações Preventivas</div>
                  {rca.preventiveActions.map((a, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: '6px 10px', background: '#0f172a', borderRadius: 6 }}>
                      <div style={{ fontSize: 12, color: '#e2e8f0' }}>{a.action}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>👤 {a.responsible} · 📅 {a.deadline}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, padding: 10, background: '#0f172a', borderRadius: 6, borderLeft: '3px solid #60a5fa' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', marginBottom: 4 }}>📝 Conclusão</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{rca.conclusion}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── TAB 5: Feedback ──────────────────────────────────────────────────────

  const renderFeedback = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Total Feedbacks', feedbacks.length, 'fb.', '#c084fc', '💬')}
        {kpiCard('Positivos/Muito Pos.', feedbacks.filter(f => ['POSITIVO', 'MUITO_POSITIVO'].includes(f.sentiment)).length, 'fb.', '#34d399', '😊')}
        {kpiCard('Negativos', feedbacks.filter(f => ['NEGATIVO', 'MUITO_NEGATIVO'].includes(f.sentiment)).length, 'fb.', '#f87171', '⚠️')}
        {kpiCard('Score Médio Sentimento', kpis ? `+${kpis.avgSentimentScore.toFixed(0)}` : '—', '/100', '#fbbf24', '📊')}
      </div>

      <div style={styles.secTitle}>💬 Gestão de Feedback Multi-Fonte</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16, marginBottom: 24 }}>
        {feedbacks.map(fb => {
          const sc2 = FEEDBACK_SOURCE_CFG[fb.source];
          const dc = DOMAIN_CFG[fb.domain];
          const sentColor = fb.sentimentScore >= 60 ? '#34d399' : fb.sentimentScore >= 20 ? '#86efac' : fb.sentimentScore >= -20 ? '#fbbf24' : fb.sentimentScore >= -60 ? '#fca5a5' : '#f87171';
          const sentLabel = fb.sentiment.replace('_', ' ');
          return (
            <div key={fb.id} style={{ ...styles.card, borderLeft: `4px solid ${sentColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {badge(`${sc2.icon} ${sc2.label}`, sc2.color, sc2.color + '20')}
                  {badge(dc.label, dc.color, dc.color + '20')}
                  {fb.isAnonymized && badge('🔒 Anônimo', '#64748b', '#1e293b')}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: sentColor }}>{fb.sentimentScore > 0 ? '+' : ''}{fb.sentimentScore}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{sentLabel}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{fb.subject}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 8, fontStyle: 'italic' }}>"{fb.content}"</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                <span>📅 {fb.collectedAt} · 🔌 {fb.relatedModule}</span>
                {fb.hasGeneratedImprovement && <span style={{ color: '#34d399', fontWeight: 700 }}>✅ → Melhoria gerada</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentiment Distribution */}
      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>📊 Distribuição de Sentimento por Fonte</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {Object.entries(FEEDBACK_SOURCE_CFG).map(([src, cfg]) => {
            const sourceFbs = feedbacks.filter(f => f.source === src);
            if (!sourceFbs.length) return null;
            const avgScore = Math.round(sourceFbs.reduce((a, f) => a + f.sentimentScore, 0) / sourceFbs.length);
            const c = avgScore >= 60 ? '#34d399' : avgScore >= 20 ? '#86efac' : avgScore >= -20 ? '#fbbf24' : '#f87171';
            return (
              <div key={src} style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 20 }}>{cfg.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, marginTop: 4 }}>{cfg.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: c, marginTop: 4 }}>{avgScore > 0 ? '+' : ''}{avgScore}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{sourceFbs.length} feedbacks</div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Padrões & IA ──────────────────────────────────────────────────

  const renderPatterns = () => (
    <div>
      <div style={styles.row}>
        {kpiCard('Padrões Detectados', patterns.length, 'pads.', '#c084fc', '🔮')}
        {kpiCard('Confiança Média IA', Math.round(patterns.reduce((a, p) => a + p.aiConfidence, 0) / (patterns.length || 1)), '%', '#34d399', '🤖')}
        {kpiCard('Padrões Críticos', patterns.filter(p => p.impact === 'CRITICO').length, 'crit.', '#f87171', '🔴')}
        {kpiCard('Já Endereçados', patterns.filter(p => p.isAddressed).length, 'ok', '#60a5fa', '✅')}
      </div>

      <div style={styles.secTitle}>🔮 Padrões Recorrentes — Detecção por IA Adaptativa</div>
      {patterns.map(pat => {
        const dc = DOMAIN_CFG[pat.domain];
        const ic = pat.impact === 'CRITICO' ? '#f87171' : pat.impact === 'ALTO' ? '#fbbf24' : pat.impact === 'MEDIO' ? '#60a5fa' : '#34d399';
        const tc = pat.trend === 'CRESCENTE' ? { c: '#f87171', i: '📈' } : pat.trend === 'DECRESCENTE' ? { c: '#34d399', i: '📉' } : { c: '#fbbf24', i: '➡️' };
        return (
          <div key={pat.id} style={{ ...styles.card, marginBottom: 16, borderLeft: `4px solid ${ic}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {badge(dc.label, dc.color, dc.color + '20')}
                  {badge(`Impacto: ${pat.impact}`, ic, ic + '20')}
                  {badge(`Tendência: ${pat.trend}`, tc.c, tc.c + '20')}
                  {pat.isAddressed ? badge('✅ Endereçado', '#059669', '#d1fae5') : badge('⚠️ Pendente', '#d97706', '#fef3c7')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{tc.i} {pat.title}</div>
              </div>
              <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#c084fc' }}>{pat.aiConfidence}%</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>Confiança IA</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>🔁 {pat.frequency}×</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>{pat.description}</div>

            <div style={styles.grid2}>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>📅 TIMELINE</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Primeira detecção: <strong style={{ color: '#e2e8f0' }}>{pat.firstDetected}</strong></div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Última detecção: <strong style={{ color: '#e2e8f0' }}>{pat.lastDetected}</strong></div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Frequência: <strong style={{ color: ic }}>{pat.frequency} ocorrências</strong></div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>💡 AÇÕES SUGERIDAS PELA IA</div>
                {pat.suggestedActions.map((a, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 4 }}>{i + 1}. {a}</div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* AI Recommendations Block */}
      <div style={{ ...styles.card, marginTop: 8, border: '1px solid #c084fc30' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>🤖 Recomendações Estratégicas da IA Adaptativa</div>
        {[
          { r: 'Implementar Privacy by Design como step obrigatório no CI/CD eliminaria 100% dos riscos LGPD em formulários — padrão recorrente em 3 auditorias.', p: 'CRITICA', c: '#f87171', conf: 94 },
          { r: 'Automação de análise de índices Firestore (já implementada) deve ser extendida para queries em Cloud Functions e BigQuery para cobertura total.', p: 'ALTA', c: '#fbbf24', conf: 91 },
          { r: 'Integrar dados epidemiológicos externos (SINAN/SVS) nos modelos preditivos de demanda eliminaria subestimações sazonais — padrão estável identificado.', p: 'ALTA', c: '#fbbf24', conf: 89 },
          { r: 'Padronizar onboarding estruturado para todos os públicos (beneficiários, profissionais, voluntários, gestores) com base na boa prática validada.', p: 'MEDIA', c: '#60a5fa', conf: 86 },
        ].map((rec, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, background: '#1e293b', borderRadius: 8, padding: '10px 12px' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: rec.c, background: rec.c + '20', padding: '2px 8px', borderRadius: 10, height: 'fit-content', whiteSpace: 'nowrap' }}>{rec.p}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{rec.r}</span>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>Confiança IA: <strong style={{ color: '#c084fc' }}>{rec.conf}%</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>📊 Painel CLO — Aprendizado Organizacional</div>
      <div style={{ ...styles.card, marginBottom: 24, borderTop: '3px solid #c084fc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          {[
            { l: 'Lições Aprendidas', v: lessons.length, c: '#c084fc', i: '📚' },
            { l: 'Taxa de Reutilização', v: `${kpis?.reuseRate.toFixed(0) ?? 0}%`, c: '#34d399', i: '🔄' },
            { l: 'Impacto Médio', v: `${kpis?.avgImpactScore.toFixed(0) ?? 0}/100`, c: '#fbbf24', i: '⭐' },
            { l: 'Padrões Detectados', v: patterns.length, c: '#60a5fa', i: '🔮' },
            { l: 'Melhorias Ativas', v: improvements.filter(i => !['CONCLUIDA', 'CANCELADA'].includes(i.status)).length, c: '#fb923c', i: '⚙️' },
            { l: 'Score Maturidade', v: `${kpis?.maturityScore.toFixed(1) ?? 0}/100`, c: '#a78bfa', i: '🏆' },
          ].map(k => (
            <div key={k.l} style={{ background: '#1e293b', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.secTitle}>⚙️ Painel COO — Melhoria Contínua Operacional</div>
      <div style={{ ...styles.card, marginBottom: 24, borderTop: '3px solid #34d399' }}>
        <div style={styles.grid2}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>📈 KPIs de Melhoria Contínua</div>
            {[
              { l: 'Redução de Recorrências', v: `${kpis?.recurrenceReduction ?? 0}%`, c: '#34d399', ok: true },
              { l: 'Tempo Médio Impl. Melhorias', v: `${kpis?.avgImplementationDays ?? 0} dias`, c: '#fbbf24', ok: true },
              { l: 'Feedback → Melhoria', v: `${kpis?.feedbackToImprovementRate ?? 0}%`, c: '#60a5fa', ok: true },
              { l: 'RCAs Fechadas', v: `${rcas.filter(r => r.closedAt).length}/${rcas.length}`, c: '#34d399', ok: true },
              { l: 'Melhorias Concluídas', v: `${improvements.filter(i => i.status === 'CONCLUIDA').length}/${improvements.length}`, c: '#fbbf24', ok: true },
            ].map((k, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{k.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: k.c }}>{k.ok ? '✅' : '⚠️'} {k.v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>🎯 Ciclo PDCA — Status</div>
            {[
              { fase: 'Plan', desc: 'Identificar melhorias e causas-raiz', status: '✅ Ativo', c: '#34d399' },
              { fase: 'Do', desc: 'Implementar melhorias aprovadas', status: '🔄 Em execução', c: '#fbbf24' },
              { fase: 'Check', desc: 'Medir impacto das melhorias', status: '✅ Ativo', c: '#34d399' },
              { fase: 'Act', desc: 'Padronizar e documentar aprendizados', status: '✅ Ativo', c: '#34d399' },
            ].map((p, i) => (
              <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.c + '20', border: `2px solid ${p.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: p.c, flexShrink: 0 }}>{p.fase}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{p.desc}</div>
                  <div style={{ fontSize: 11, color: p.c }}>{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.secTitle}>🤖 Painel CAIO — Inteligência Adaptativa</div>
      <div style={{ ...styles.card, borderTop: '3px solid #60a5fa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { l: 'Recomendações IA', v: kpis?.aiRecommendations ?? 0, c: '#c084fc', i: '💡' },
            { l: 'Padrões Detectados', v: kpis?.aiPatternsDetected ?? 0, c: '#60a5fa', i: '🔮' },
            { l: 'Acurácia da IA', v: `${kpis?.aiAccuracy.toFixed(1) ?? 0}%`, c: '#34d399', i: '🎯' },
            { l: 'Governança ISO 42001', v: '100%', c: '#34d399', i: '✅' },
            { l: 'Explicabilidade', v: 'Total', c: '#fbbf24', i: '🔍' },
            { l: 'Auditabilidade', v: 'Imutável', c: '#fb923c', i: '📜' },
          ].map(k => (
            <div key={k.l} style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #0f172a 40%, #1a0a2e 100%)', border: '2px solid #c084fc40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 220, opacity: 0.03 }}>🧠</div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO DE APRENDIZADO ORGANIZACIONAL ENTERPRISE
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EALOIP — Enterprise Adaptive Learning<br />& Organizational Intelligence Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor aprende continuamente com todas as suas operações, garantindo que
          toda experiência seja transformada em conhecimento estruturado, melhoria contínua e inteligência organizacional adaptativa.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          {kpis && [
            { l: 'Maturidade', v: `${kpis.maturityScore}/100`, c: '#c084fc' },
            { l: 'Lições Validadas', v: `${kpis.lessonsValidated}/${kpis.totalLessons}`, c: '#34d399' },
            { l: 'Taxa Reuso', v: `${kpis.reuseRate}%`, c: '#60a5fa' },
            { l: 'IA Acurácia', v: `${kpis.aiAccuracy}%`, c: '#fbbf24' },
          ].map(m => (
            <div key={m.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: m.c }}>{m.v}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{m.l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
          {certEmitted ? '✅ Certificado EALOIP Emitido — Prompt 067' : '🧠 Emitir Certificado EALOIP Final'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Parecer Executivo CLO/CAIO</div>
          {[
            { l: 'Aprendizado Organizacional', v: 94, c: '#c084fc' },
            { l: 'Gestão de Lições Aprendidas', v: 96, c: '#60a5fa' },
            { l: 'Melhoria Contínua', v: 91, c: '#34d399' },
            { l: 'Inteligência Adaptativa', v: 90, c: '#fbbf24' },
            { l: 'Gestão do Conhecimento', v: 95, c: '#fb923c' },
            { l: 'Análise de Causa-Raiz', v: 92, c: '#38bdf8' },
            { l: 'Gestão de Feedback', v: 93, c: '#4ade80' },
            { l: 'Reutilização do Conhecimento', v: 88, c: '#a78bfa' },
            { l: 'Evolução Institucional', v: 93, c: '#f87171' },
            { l: 'Inovação Contínua', v: 89, c: '#fda4af' },
            { l: 'Resiliência Organizacional', v: 94, c: '#86efac' },
            { l: 'Inteligência Evolutiva', v: 90, c: '#d8b4fe' },
            { l: 'Capacidade Adaptativa', v: 92, c: '#a5f3fc' },
            { l: 'Maturidade Organizacional', v: 93, c: '#fed7aa' },
            { l: 'Maturidade Global EALOIP', v: 93, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
          <div style={{ marginTop: 16, padding: 14, background: '#1e293b', borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
            <strong style={{ color: '#f1f5f9' }}>Parecer CLO/CAIO:</strong> O EALOIP demonstra maturidade de aprendizado organizacional de <strong style={{ color: '#c084fc' }}>nível 4 (ISO 30401)</strong>, com 6 lições aprendidas validadas, taxa de reutilização de 58.3%, 4 padrões recorrentes detectados pela IA e ciclo PDCA plenamente operacional. A plataforma aprende continuamente e evolui de forma adaptativa e supervisionada.
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🗺️ Roadmap EALOIP — 5 Anos</div>
          {[
            { ano: '2026', title: 'Consolidação & Automação', color: '#c084fc', items: ['Cobertura de lições >90% dos módulos', 'RCA automático para todos os incidentes P1/P2', 'Feedback loop integrado ao ECDTISP (Digital Twin)'] },
            { ano: '2027', title: 'Aprendizagem Preditiva', color: '#60a5fa', items: ['Agentes IA especializados em detecção de padrões', 'Descoberta automática de boas práticas entre módulos', 'Simulações baseadas em aprendizados históricos (ECDTISP)'] },
            { ano: '2028', title: 'IA Colaborativa para Inovação', color: '#34d399', items: ['Recomendações adaptativas por perfil de usuário', 'Integração com benchmarks setoriais externos', 'Aprendizado contínuo sem supervisão para padrões de baixo risco'] },
            { ano: '2029', title: 'Organização que Aprende', color: '#fbbf24', items: ['Lições aprendidas em tempo real via streaming de eventos', 'Revisão automática de processos com base em KPIs', 'Maturidade ISO 30401 Nível 5 certificada externamente'] },
            { ano: '2030', title: 'Referência Nacional', color: '#fb923c', items: ['ISM: referência em aprendizado organizacional no 3º setor', 'EALOIP open-source disponibilizado à rede', 'Prêmio IBGC / FNQ de Excelência Organizacional'] },
          ].map(p => (
            <div key={p.ano} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 10, background: p.color + '20', border: `2px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: p.color }}>{p.ano}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{p.title}</div>
                {p.items.map((item, i) => <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>• {item}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 24, borderTop: '3px solid #c084fc', textAlign: 'center' }}>
        <div style={{ fontSize: 22 }}>🧠📚⚙️🔬💬🔮📊</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginTop: 12, marginBottom: 8 }}>
          Declaração de Conclusão — EALOIP (Prompt 067)
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, maxWidth: 820, margin: '0 auto' }}>
          A Plataforma Instituto Ser Melhor possui um <strong style={{ color: '#c084fc' }}>Enterprise Adaptive Learning & Organizational Intelligence Platform (EALOIP)</strong> plenamente operacional,
          garantindo que toda experiência institucional — decisões, auditorias, incidentes, feedbacks, projetos e resultados — seja transformada em
          conhecimento estruturado, melhoria contínua e inteligência organizacional adaptativa, fortalecendo a sustentabilidade, a inovação e a capacidade adaptativa da organização.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['EALOIP v1.0', 'Prompt 067', 'ISO 30401 ✅', 'ISO 9001 ✅', 'ISO 42001 ✅', 'Peter Senge ✅', 'PDCA ✅', 'Human-in-the-Loop ✅'].map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', background: '#7c3aed20', padding: '4px 12px', borderRadius: 20, border: '1px solid #7c3aed40' }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
          Plataforma ISM v2.0 — Módulo 67 — Ecossistema Inteligente Adaptativo
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CLO/CAIO Board & Learning Hub': renderDashboard,
    'Repositório de Lições Aprendidas':    renderLessons,
    'Motor de Melhoria Contínua':          renderImprovements,
    'Análise de Causa-Raiz':               renderRCA,
    'Gestão de Feedback & Sentimento':     renderFeedback,
    'Padrões & Inteligência Adaptativa':   renderPatterns,
    'Painéis Executivos & Analytics':      renderExecutive,
    'CERTIFICAÇÃO EALOIP FINAL':           renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧠 EALOIP — Enterprise Adaptive Learning & Organizational Intelligence Platform</h1>
        <p style={styles.sub}>Prompt 067 · Instituto Ser Melhor v2.0 · ISO 30401 · ISO 9001 · ISO 42001 · Peter Senge · PDCA · Decision Intelligence</p>
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

export default EALOIPPage;
