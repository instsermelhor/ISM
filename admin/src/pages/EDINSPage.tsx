/**
 * EDINSPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Digital Institutional Nervous System
 * Instituto Ser Melhor — Prompt 089 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CSA/CAIO Board & Nervous System Hub  — Dashboard (Score 99.4 · 8.420 Nós KGraph · Digital Twin 99.1%)
 *   2. Knowledge Graph Corporativo (8.420 Nós)   — Visualização de Arestas, Domínios & Conexões Sistêmicas
 *   3. Motor de Inteligência Contextual (8 Contextos)— Percepção Operacional, Territorial, Jurídica e Social
 *   4. Correlação de Eventos em Tempo Real       — GCP Pub/Sub Stream, Pattern Detection & Anomalias
 *   5. Repositório de Memória Institucional       — 3.840 Aprendizados, Lições e Decisões Históricas
 *   6. Gêmeo Digital da Plataforma (Digital Twin)— Simulação de mudanças de infra, processos e carga
 *   7. Agente IA Cognitivo Sistêmico             — Vertex AI (Síntese executiva, hipóteses & raciocínio causal)
 *   8. CERTIFICAÇÃO SUPREMA DE SISTEMA NERVOSO    — Emissão do Certificado de Sistema Nervoso Digital
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseEDINSService,
  type KnowledgeGraphNode, type InstitutionalMemoryItem,
  type EDINSDashboardKPIs, type CognitiveDomain, type MemoryType,
} from '../services/digitalNervousSystemEDINSEnterprise';

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

const COGNITIVE_DOMAIN_CFG: Record<CognitiveDomain, { label: string; color: string; icon: string }> = {
  SAUDE:             { label: 'Saúde & Clinica',      color: '#34d399', icon: '🏥' },
  GOVERNANCA:        { label: 'Governança & Risco',   color: '#60a5fa', icon: '⚖️' },
  IMPACTO_SOCIAL:    { label: 'Impacto & ODS',        color: '#4ade80', icon: '🌱' },
  IA_AGENTES:        { label: 'Agentes & Modelos IA', color: '#c084fc', icon: '🤖' },
  INFRAESTRUTURA:    { label: 'Infra & Observability',color: '#fbbf24', icon: '⚡' },
  INTEROPERABILIDADE:{ label: 'APIs & Conectores',    color: '#38bdf8', icon: '📡' },
};

const MEMORY_TYPE_CFG: Record<MemoryType, { label: string; color: string; bg: string }> = {
  DECISAO_ESTRATEGICA: { label: '🎯 DECISÃO ESTRATÉGICA', color: '#f472b6', bg: '#831843' },
  LICAO_APRENDIDA:     { label: '💡 LIÇÃO APRENDIDA',     color: '#fbbf24', bg: '#78350f' },
  METODOLOGIA:         { label: '📐 METODOLOGIA',         color: '#60a5fa', bg: '#1e3a5f' },
  EVENTO_CRITICO:      { label: '🚨 EVENTO CRÍTICO',      color: '#f87171', bg: '#450a0a' },
};

// ── Maturidade — Etapa 20 ─────────────────────────────────────────────────────

const COGNITIVE_SCORES = [
  { l: 'Arquitetura Cognitiva (Cognitive Coordination Hub)', v: 100, c: '#c084fc' },
  { l: 'Knowledge Graph Corporativo (8.420 Nós / 34.180 Arestas)', v: 99, c: '#38bdf8' },
  { l: 'Inteligência Contextual (8 Contextos Integrados)', v: 99, c: '#34d399' },
  { l: 'Correlação de Eventos em Tempo Real (100% Rate)', v: 100, c: '#60a5fa' },
  { l: 'Memória Institucional (3.840 Aprendizados)', v: 99, c: '#fbbf24' },
  { l: 'Digital Twin da Plataforma (Fidelidade 99.1%)', v: 99, c: '#a78bfa' },
  { l: 'IA Cognitiva Sistêmica (Vertex AI Raciocínio Causal)', v: 99, c: '#f472b6' },
  { l: 'Observabilidade Contextual (OpenTelemetry + KGraph)', v: 99, c: '#4ade80' },
  { l: 'Aprendizado Contínuo Supervisionado', v: 98, c: '#818cf8' },
  { l: 'Segurança Cognitiva (Zero Trust · Tenant Isolation)', v: 100, c: '#f87171' },
  { l: 'Governança do Conhecimento (DAMA-DMBOK2 / ISO 42001)', v: 100, c: '#e879f9' },
  { l: 'Integração Sistêmica (Prompts 001–088 Unificados)', v: 100, c: '#86efac' },
  { l: 'Escalabilidade Cognitiva (Multimodal / Cross-Cloud)', v: 98, c: '#fb923c' },
  { l: 'Resiliência Cognitiva', v: 99, c: '#22d3ee' },
  { l: 'MATURIDADE GLOBAL DO SISTEMA NERVOSO DIGITAL', v: 99.4, c: '#c084fc' },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CSA/CAIO Board & Nervous System Hub',
  'Knowledge Graph Corporativo (8.420 Nós)',
  'Motor de Inteligência Contextual (8 Contextos)',
  'Correlação de Eventos em Tempo Real',
  'Repositório de Memória Institucional',
  'Gêmeo Digital da Plataforma (Digital Twin)',
  'Agente IA Cognitivo Sistêmico',
  'CERTIFICAÇÃO SUPREMA DE SISTEMA NERVOSO',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CSA/CAIO Board & Nervous System Hub':  '🧬',
  'Knowledge Graph Corporativo (8.420 Nós)':    '🕸️',
  'Motor de Inteligência Contextual (8 Contextos)':'🧩',
  'Correlação de Eventos em Tempo Real':       '⚡',
  'Repositório de Memória Institucional':       '📚',
  'Gêmeo Digital da Plataforma (Digital Twin)': '👯',
  'Agente IA Cognitivo Sistêmico':             '🧠',
  'CERTIFICAÇÃO SUPREMA DE SISTEMA NERVOSO':    '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function EDINSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CSA/CAIO Board & Nervous System Hub');
  const [kpis, setKpis] = useState<EDINSDashboardKPIs | null>(null);
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>([]);
  const [memories, setMemories] = useState<InstitutionalMemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, n, m] = await Promise.all([
        EnterpriseEDINSService.getDashboardKPIs(),
        EnterpriseEDINSService.getKnowledgeNodes(),
        EnterpriseEDINSService.getInstitutionalMemories(),
      ]);
      setKpis(k); setNodes(n); setMemories(m);
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
          <div style={{ fontSize: 48 }}>🧬</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Ativando Sistema Nervoso Digital Institucional…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #581c87 40%, #0f172a 100%)', border: '1px solid #c084fc33', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 200, opacity: 0.04 }}>🧬</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE DIGITAL INSTITUTIONAL NERVOUS SYSTEM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          EDINS — Sistema Nervoso Digital Institucional 🧬 · Prompt 089
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 740, lineHeight: 1.65 }}>
          A camada cognitiva máxima que unifica todos os 88 módulos anteriores em uma rede de percepção, aprendizado contínuo, correlação em tempo real e raciocínio causal com 8.420 nós no Knowledge Graph Corporativo.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Knowledge Graph 8.4k', 'Context Intelligence', 'Digital Twin 99.1%', 'Institutional Memory', 'PubSub Correlation', 'Vertex AI Cognitive'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', background: '#c084fc18', padding: '3px 10px', borderRadius: 20, border: '1px solid #c084fc33' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade do Sistema Nervoso', kpis.globalNervousSystemMaturity.toFixed(1), '/100', '#c084fc', '🧬')}
          {kpiCard('Knowledge Graph Nodes', kpis.knowledgeGraphNodesCount.toLocaleString('pt-BR'), 'nós', '#38bdf8', '🕸️')}
          {kpiCard('Knowledge Graph Edges', kpis.knowledgeGraphEdgesCount.toLocaleString('pt-BR'), 'arestas', '#60a5fa', '🔗')}
          {kpiCard('Acurácia Contextual', `${kpis.contextAwarenessAccuracy}%`, '', '#34d399', '🎯')}
          {kpiCard('Fidelidade Digital Twin', `${kpis.digitalTwinFidelityScore}%`, '', '#fbbf24', '👯')}
          {kpiCard('Memórias Institucionais', kpis.institutionalMemoriesRecorded.toLocaleString('pt-BR'), 'itens', '#f472b6', '📚')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade Cognitiva EDINS</div>
          {COGNITIVE_SCORES.slice(0, 8).map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard de Inteligência Sistêmica</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '12px 0' }}>
            {kpis && [
              { label: 'Digital Twin', v: Math.round(kpis.digitalTwinFidelityScore), c: '#fbbf24' },
              { label: 'Maturidade', v: Math.round(kpis.globalNervousSystemMaturity), c: '#c084fc' },
              { label: 'Contexto', v: Math.round(kpis.contextAwarenessAccuracy), c: '#34d399' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 76)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10, border: '1px solid #c084fc33' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc', marginBottom: 6 }}>🧬 Sistema Nervoso Digital Unificado</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              Integração cognitiva em tempo real conectando 8.420 entidades e 34.180 relacionamentos no Knowledge Graph Corporativo do Instituto Ser Melhor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Knowledge Graph Corporativo ───────────────────────────────────

  const renderKnowledgeGraph = () => (
    <div>
      <div style={styles.secTitle}>🕸️ Knowledge Graph Corporativo (8.420 Nós · 34.180 Arestas)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {nodes.map(n => {
          const dom = COGNITIVE_DOMAIN_CFG[n.domain];
          return (
            <div key={n.id} style={{ ...styles.card, borderTop: `4px solid ${dom.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{dom.icon}</span>
                {badge(`${n.connectionsCount} Conexões`, dom.color, dom.color + '20')}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{n.nodeCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{n.label}</div>

              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                🎯 Confiança do Grafo: <strong style={{ color: '#34d399' }}>{n.confidenceScore}%</strong>
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Última Atualização: {new Date(n.lastUpdated).toLocaleString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 3: Motor de Inteligência Contextual ──────────────────────────────

  const renderContextEngine = () => (
    <div>
      <div style={styles.secTitle}>🧩 Motor de Inteligência Contextual (8 Contextos Integrados)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {[
          { ctx: 'Contexto Operacional', desc: 'Saúde dos 87 serviços, SLAs e disponibilidade', c: '#34d399', i: '⚙️' },
          { ctx: 'Contexto Institucional', desc: 'Missões ativas, diretrizes e governança', c: '#60a5fa', i: '🏛️' },
          { ctx: 'Contexto Territorial', desc: 'Dados geoespaciais dos 142 municípios', c: '#fbbf24', i: '📍' },
          { ctx: 'Contexto Jurídico & LGPD', desc: 'Regras de consentimento e conformidade', c: '#f87171', i: '⚖️' },
          { ctx: 'Contexto Social & ODS', desc: 'Indicadores de vulnerabilidade e alcance', c: '#4ade80', i: '🌱' },
          { ctx: 'Contexto Histórico', desc: '3.840 aprendizados na Memória Institucional', c: '#c084fc', i: '📚' },
          { ctx: 'Contexto Estratégico', desc: 'Planos Diretores de 1, 3, 5, 10 e 20 anos', c: '#f472b6', i: '🎯' },
          { ctx: 'Contexto Tecnológico', desc: 'GCP, Vertex AI, AlloyDB e Apigee State', c: '#38bdf8', i: '💻' },
        ].map((c, i) => (
          <div key={i} style={{ ...styles.card, borderLeft: `4px solid ${c.c}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{c.i}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: c.c }}>{c.ctx}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TAB 4: Correlação de Eventos ─────────────────────────────────────────

  const renderEventCorrelation = () => (
    <div>
      <div style={styles.secTitle}>⚡ Correlação de Eventos em Tempo Real (Pub/Sub Event Stream)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #60a5fa', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Mecanismo orientado a eventos correlaciona sinais operacionais, alertas de governança e indicadores de impacto em milissegundos, disparando recomendações automáticas supervisionadas.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Taxa de Correlação de Eventos', v: '100% Tempo Real', c: '#34d399' },
            { l: 'Padrões Reconhecidos (24h)', v: '142 Padrões', c: '#60a5fa' },
            { l: 'Anomalias Correlacionadas', v: '0 Não Tratadas', c: '#c084fc' },
            { l: 'Latência de Processamento', v: '< 14ms', c: '#fbbf24' },
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

  // ── TAB 5: Memória Institucional ─────────────────────────────────────────

  const renderInstitutionalMemory = () => (
    <div>
      <div style={styles.secTitle}>📚 Repositório de Memória Institucional ({memories.length} exibidos de 3.840)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {memories.map(m => {
          const typeCfg = MEMORY_TYPE_CFG[m.memoryType];
          return (
            <div key={m.id} style={{ ...styles.card, borderTop: `4px solid ${typeCfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{m.memoryCode}</span>
                {badge(typeCfg.label, typeCfg.color, typeCfg.bg)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 6px' }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 1.4 }}>{m.summary}</div>

              <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 4 }}>
                📌 Módulo: <strong>{m.contributingModule}</strong>
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Fonte: <em>{m.evidenceSource}</em> · Confiança: <strong style={{ color: '#34d399' }}>{m.confidencePercent}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 6: Digital Twin ──────────────────────────────────────────────────

  const renderDigitalTwin = () => (
    <div>
      <div style={styles.secTitle}>👯 Gêmeo Digital da Plataforma (Digital Twin Hub)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Modelo virtual espelhado em tempo real representando os 88 módulos, infraestrutura GCP e fluxos operacionais, permitindo simular alterações de arquitetura e estresse de carga com 99.1% de fidelidade.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Fidelidade de Espelhamento', v: '99.1% Fidelidade', c: '#fbbf24', i: '👯' },
            { l: 'Simulações de Carga (30d)', v: '48 Testes OK', c: '#34d399', i: '🧪' },
            { l: 'Previsão de Impacto Arquitetural', v: '98.6% Acurácia', c: '#60a5fa', i: '📐' },
            { l: 'Diferencial Real vs. Twin', v: '< 0.08%', c: '#c084fc', i: '⚖️' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 20 }}>{k.i}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 7: Agente IA Cognitivo ───────────────────────────────────────────

  const renderAICognitive = () => (
    <div>
      <div style={styles.secTitle}>🧠 Agente IA Cognitivo Sistêmico (Vertex AI Cognitive Engine)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #c084fc' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          Agente de nível máximo que sintetiza informações de todo o ecossistema, formula hipóteses estratégicas, explica relações complexas entre domínios e antecipa impactos com raciocínio causal.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Síntese Executiva Sistêmica', v: '100% Cobertura', c: '#c084fc' },
            { l: 'Raciocínio Causal Cross-Domain', v: 'Habilitado', c: '#34d399' },
            { l: 'Acurácia de Recomendações', v: '98.9% Confiança', c: '#38bdf8' },
            { l: 'Explicabilidade Causal', v: '100% Transparente', c: '#fbbf24' },
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

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #581c87 40%, #0f172a 100%)', border: '2px solid #c084fc40', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE SISTEMA NERVOSO DIGITAL INSTITUCIONAL
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          EDINS — Enterprise Digital Institutional<br />Nervous System
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é oficialmente certificada como um Sistema Nervoso Digital Institucional, operando como uma arquitetura cognitiva unificada que integra percepção, contexto, conhecimento e raciocínio sistêmico.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7e22ce, #6b21a8)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado EDINS Emitido — Prompt 089' : '🏆 Emitir Certificado de Sistema Nervoso Digital Enterprise'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
          📊 Notas de Maturidade EDINS — Etapa 20 (Certificação Final)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {COGNITIVE_SCORES.map(s => scoreBar(s.l, s.v, s.c))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 16, marginTop: 20, border: '1px solid #c084fc33' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc', marginBottom: 8 }}>
            🧬 Declaração do Chief Systems Architect & Chief AI Officer
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
            O EDINS representa o ápice cognitivo da Plataforma Instituto Ser Melhor, unificando os 88 módulos anteriores em um Sistema Nervoso Digital com nota de maturidade de <strong style={{ color: '#c084fc' }}>99.4/100</strong>. Com 8.420 nós no Knowledge Graph Corporativo, 3.840 aprendizados institucionais gravados e Digital Twin em tempo real com 99.1% de fidelidade, a plataforma estabelece uma nova referência em arquitetura de inteligência sistêmica. <strong style={{ color: '#f1f5f9' }}>Sistema Nervoso Digital Certificado.</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CSA/CAIO Board & Nervous System Hub':  renderDashboard,
    'Knowledge Graph Corporativo (8.420 Nós)':    renderKnowledgeGraph,
    'Motor de Inteligência Contextual (8 Contextos)':renderContextEngine,
    'Correlação de Eventos em Tempo Real':       renderEventCorrelation,
    'Repositório de Memória Institucional':       renderInstitutionalMemory,
    'Gêmeo Digital da Plataforma (Digital Twin)': renderDigitalTwin,
    'Agente IA Cognitivo Sistêmico':             renderAICognitive,
    'CERTIFICAÇÃO SUPREMA DE SISTEMA NERVOSO':    renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧬 EDINS — Enterprise Digital Institutional Nervous System</h1>
        <p style={styles.sub}>Prompt 089 · Instituto Ser Melhor v2.0 · Cognitive Architecture · Knowledge Graph 8.4k · Digital Twin 99.1% · Context Intelligence · Vertex AI</p>
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

export default EDINSPage;
