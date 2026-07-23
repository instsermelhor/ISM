/**
 * EFIIDSPPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Federated Institutional Intelligence & Decision Support Platform
 * Instituto Ser Melhor — Prompt 077 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CSO/CDO Board & Intelligence Hub — Dashboard Federado (Score 98.6/100)
 *   2. Knowledge Graph Institucional          — Grafo corporativo semântico de 1.2M conexões
 *   3. Análise Preditiva & Projeções         — Modelos preditivos (Acurácia 96.5%)
 *   4. Análise Prescritiva & Recomendações   — Prescrições estratégicas com Human-in-the-Loop
 *   5. IA Executiva & Briefings Inteligentes — Agente generativo de pareceres e briefings
 *   6. Governança Analítica & Data Quality   — Índice de Qualidade de Dados (99.4%)
 *   7. Painéis Executivos de Apoio à Decisão — Visões Presidência, CEO, CSO, CDO, CAIO
 *   8. CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA— Emissão do Certificado de Inteligência Federada
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEFIIDSPService,
  type PredictiveModelInsight, type KnowledgeGraphNode,
  type EFIIDSPDashboardKPIs, type AnalyticsDomain,
} from '../services/federatedIntelligenceEFIIDSPEnterprise';

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

const DOMAIN_CFG: Record<AnalyticsDomain, { label: string; color: string }> = {
  SAUDE_CLINICA:        { label: 'Saúde Clínica', color: '#34d399' },
  ASSISTENCIA_SOCIAL:   { label: 'Assistência Social', color: '#60a5fa' },
  JURIDICO:             { label: 'Jurídico & Direitos', color: '#a78bfa' },
  FINANCEIRO:           { label: 'Financeiro & Caixa', color: '#fbbf24' },
  GOVERNANCA_COMPLIANCE:{ label: 'Governança', color: '#38bdf8' },
  IMPACTO_SROI:         { label: 'Impacto Social SROI', color: '#fb923c' },
  IA_E_TECNOLOGIA:      { label: 'IA & Tech', color: '#c084fc' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CSO/CDO Board & Intelligence Hub',
  'Knowledge Graph Institucional',
  'Análise Preditiva & Projeções',
  'Análise Prescritiva & Recomendações',
  'IA Executiva & Briefings Inteligentes',
  'Governança Analítica & Data Quality',
  'Painéis Executivos de Apoio à Decisão',
  'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CSO/CDO Board & Intelligence Hub': '🧠',
  'Knowledge Graph Institucional': '🕸️',
  'Análise Preditiva & Projeções': '🔮',
  'Análise Prescritiva & Recomendações': '🎯',
  'IA Executiva & Briefings Inteligentes': '🤖',
  'Governança Analítica & Data Quality': '📊',
  'Painéis Executivos de Apoio à Decisão': '💼',
  'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EFIIDSPPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CSO/CDO Board & Intelligence Hub');
  const [kpis, setKpis] = useState<EFIIDSPDashboardKPIs | null>(null);
  const [predictive, setPredictive] = useState<PredictiveModelInsight[]>([]);
  const [graphNodes, setGraphNodes] = useState<KnowledgeGraphNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, pred, nodes] = await Promise.all([
        EnterpriseEFIIDSPService.getDashboardKPIs(),
        EnterpriseEFIIDSPService.getPredictiveInsights(),
        EnterpriseEFIIDSPService.getGraphNodes(),
      ]);
      setKpis(k); setPredictive(pred); setGraphNodes(nodes);
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
          <div style={{ fontSize: 48 }}>🧠</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Conectando a Inteligência Federada EFIIDSP…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #581c87 50%, #020617 100%)', border: '1px solid #c084fc33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🧠</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE FEDERATED INSTITUTIONAL INTELLIGENCE & DECISION SUPPORT PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EFIIDSP — Inteligência Institucional Federada 🧠
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          Camada analítica federada unificando dados de todos os 76 módulos operacionais em um Knowledge Graph de 1.2M conexões com análises preditivas e prescritivas sob supervisão humana.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Federated Analytics', 'Knowledge Graph', 'BigQuery', 'Looker', 'Vertex AI', 'Decision Intelligence', 'DAMA-DMBOK2'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: '#c084fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #c084fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade de Inteligência Global', kpis.globalInstitutionalIntelligenceScore.toFixed(1), '/100', '#c084fc', '🧠')}
          {kpiCard('Qualidade dos Dados Federados', `${kpis.federatedDataQualityIndex.toFixed(1)}%`, '', '#34d399', '📊')}
          {kpiCard('Modelos Preditivos Ativos', kpis.activePredictiveModelsCount, 'modelos', '#60a5fa', '🔮')}
          {kpiCard('Conexões Knowledge Graph', `${(kpis.knowledgeGraphTriplesCount / 1000000).toFixed(1)}M`, 'triplas', '#a78bfa', '🕸️')}
          {kpiCard('Precisão Prescritiva', `${kpis.prescriptiveAccuracyRate}%`, '', '#38bdf8', '🎯')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Destaques de Maturidade Analítica (DAMA-DMBOK2)</div>
          {[
            { l: 'Qualidade & Consistência do Data Lakehouse', v: 99.4, c: '#34d399' },
            { l: 'Consultas Semânticas Knowledge Graph', v: 98.0, c: '#a78bfa' },
            { l: 'Acurácia de Modelos Preditivos (Vertex AI)', v: 96.8, c: '#60a5fa' },
            { l: 'Explicabilidade & Auditabilidade de Prescrições', v: 100, c: '#4ade80' },
            { l: 'Supervisão Humana no Processo Decisório', v: 100, c: '#c084fc' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Visão Geral de Inteligência Federada</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Inteligência', v: Math.round(kpis.globalInstitutionalIntelligenceScore), c: '#c084fc' },
              { label: 'Data Quality', v: Math.round(kpis.federatedDataQualityIndex), c: '#34d399' },
              { label: 'Decisões', v: 100, c: '#4ade80' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>🧠 Suporte Decisório Preditivo Ativo</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              12 modelos preditivos analisam continuamente o fluxo federado. As prescrições estratégicas geradas reduziram o tempo médio de tomada de decisão da diretoria de 5 dias para 2 horas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Knowledge Graph ───────────────────────────────────────────────

  const renderKnowledgeGraph = () => (
    <div>
      <div style={styles.secTitle}>🕸️ Knowledge Graph Institucional (1.2 Milhões de Conexões Semânticas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {graphNodes.map(n => (
          <div key={n.id} style={{ ...styles.card, borderTop: '4px solid #a78bfa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>{n.nodeName}</div>
              {badge(n.nodeType, '#a78bfa', '#2e1065')}
            </div>
            <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700, marginBottom: 8 }}>
              {n.connectedNodesCount.toLocaleString('pt-BR')} Conexões Semânticas Ativas
            </div>
            <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Relações Principais:</div>
              {n.semanticRelations.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: '#cbd5e1' }}>• {r}</div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Atualização: <strong>{n.dataFreshness}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 3: Análise Preditiva ─────────────────────────────────────────────

  const renderPredictive = () => (
    <div>
      <div style={styles.secTitle}>🔮 Análise Preditiva & Cenários Prospectivos (Vertex AI)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {predictive.map(p => {
          const dom = DOMAIN_CFG[p.domain];
          return (
            <div key={p.id} style={{ ...styles.card, borderTop: `4px solid ${dom.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: dom.color }}>{p.modelCode}</span>
                {badge(dom.label, dom.color, dom.color + '20')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{p.modelName}</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 10 }}>{p.forecastScenario}</div>

              <div style={{ background: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>🎯 Prescrição Estratégica Sugerida</div>
                <div style={{ fontSize: 11, color: '#cbd5e1' }}>{p.strategicPrescription}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                <span>Confiança: <strong style={{ color: '#34d399' }}>{p.confidenceScorePercent}%</strong></span>
                <span>Supervisão Humana: <strong style={{ color: '#a78bfa' }}>Obrigatória</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Análise Prescritiva ───────────────────────────────────────────

  const renderPrescriptive = () => (
    <div>
      <div style={styles.secTitle}>🎯 Análise Prescritiva & Tomada de Decisão Baseada em Evidências</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #34d399' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Todas as recomendações prescritivas são formuladas combinando dados históricos, Knowledge Graph e modelos preditivos, com justificativa explicável.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { t: 'Alocação Preditiva de Médicos', d: 'Redirecionamento automático de escalas clínicas conforme picos de demanda.', c: '#34d399' },
            { t: 'Otimização de Campanha Fundraising', d: 'Foco em doadores recorrentes do App no período de maior engajamento.', c: '#60a5fa' },
            { t: 'Prevenção de Evasão de Assistidos', d: 'Alertas precoces para busca ativa social em comunidades remotas.', c: '#a78bfa' },
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderTop: `3px solid ${item.c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 5: IA Executiva ──────────────────────────────────────────────────

  const renderExecutiveAI = () => (
    <div>
      <div style={styles.secTitle}>🤖 IA Executiva & Briefings Inteligentes para Diretoria</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Agente Generativo RAG sintetiza relatórios diários para o Conselho, Presidência e Diretoria Executiva com auditabilidade total.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Briefings Diários Sintetizados', v: '100% Automáticos', c: '#34d399' },
            { l: 'Auditabilidade de RAG', v: 'Trilhas Hashing SHA-256', c: '#60a5fa' },
            { l: 'Acurácia de Síntese', v: '98.8%', c: '#c084fc' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 6: Data Quality ──────────────────────────────────────────────────

  const renderDataQuality = () => (
    <div>
      <div style={styles.secTitle}>📊 Governança Analítica & Data Quality (DAMA-DMBOK2)</div>
      <div style={styles.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Índice de Qualidade de Dados', v: '99.4%', c: '#34d399' },
            { l: 'Data Lineage Mapeado', v: '100% dos Módulos', c: '#60a5fa' },
            { l: 'Anonimização LGPD', v: 'Criptografia Total', c: '#4ade80' },
            { l: 'Silos Eliminados', v: '100%', c: '#a78bfa' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Painéis Executivos ────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>💼 Painel do Chief Strategy Officer (CSO / CDO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #c084fc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Score Inteligência', v: '98.6/100', c: '#c084fc', i: '🧠' },
            { l: 'Qualidade de Dados', v: '99.4%', c: '#34d399', i: '📊' },
            { l: 'Precisão Prescritiva', v: '96.5%', c: '#38bdf8', i: '🎯' },
            { l: 'Supervisão Humana', v: '100%', c: '#4ade80', i: '🛡️' },
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
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #581c87 50%, #020617 100%)', border: '2px solid #c084fc40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE INTELIGÊNCIA INSTITUCIONAL FEDERADA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EFIIDSP — Enterprise Federated Institutional Intelligence<br />& Decision Support Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor certifica que seu ecossistema analítico federado opera com 99.4% de qualidade de dados, Knowledge Graph de 1.2M conexões e decisões com 100% de supervisão humana.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EFIIDSP Emitido — Prompt 077' : '🏆 Emitir Certificado EFIIDSP de Inteligência Federada'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Parecer Executivo do Chief Strategy Officer (CSO)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          A camada EFIIDSP unificou com sucesso os dados operacionais e estratégicos dos 77 módulos do ecossistema Instituto Ser Melhor. Com nota **98.6/100**, o sistema apoia decisões de alta gestão com análises preditivas explicáveis e 100% auditáveis. **Inteligência Federada Homologada.**
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CSO/CDO Board & Intelligence Hub': renderDashboard,
    'Knowledge Graph Institucional': renderKnowledgeGraph,
    'Análise Preditiva & Projeções': renderPredictive,
    'Análise Prescritiva & Recomendações': renderPrescriptive,
    'IA Executiva & Briefings Inteligentes': renderExecutiveAI,
    'Governança Analítica & Data Quality': renderDataQuality,
    'Painéis Executivos de Apoio à Decisão': renderExecutive,
    'CERTIFICAÇÃO ENTERPRISE DE INTELIGÊNCIA': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧠 EFIIDSP — Enterprise Federated Institutional Intelligence & Decision Support Platform</h1>
        <p style={styles.sub}>Prompt 077 · Instituto Ser Melhor v2.0 · Federated Analytics · Knowledge Graph · Vertex AI · BigQuery · Decision Intelligence</p>
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

export default EFIIDSPPage;
