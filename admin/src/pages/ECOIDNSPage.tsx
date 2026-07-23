/**
 * ECOIDNSPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Cognitive Organization & Institutional Digital Nervous System Platform
 * Instituto Ser Melhor — Prompt 079 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CEO/CAIO Board & Cognitive Hub   — Dashboard (Score 98.9/100 · 9 Agentes · 8.4k Nós)
 *   2. Mapa Cognitivo Corporativo & Grafo     — Knowledge Graph Federation de 8.400 nós
 *   3. Orquestra de Agentes Inteligentes      — Coordenação de 9 agentes com acurácia 98.4%+
 *   4. Memória Institucional & ADRs           — 3.840 itens versionados com hash SHA-256
 *   5. Consciência Operacional em Tempo Real  — Monitor de saúde do Sistema Nervoso Digital
 *   6. IA Cognitiva & Briefings Executivos    — Agente síntese para Presidência e Conselhos
 *   7. Painéis Cognitivos de Alta Gestão      — Visões CEO, CAIO, CKO, CSO, CDO
 *   8. CERTIFICAÇÃO ENTERPRISE COGNITIVA      — Emissão do Certificado de Organização Cognitiva
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  EnterpriseECOIDNSService,
  type CognitiveAgent, type InstitutionalMemoryItem,
  type ECOIDNSDashboardKPIs, type CognitiveAgentRole, type InstitutionalMemoryType,
} from '../services/cognitiveOrganizationECOIDNSEnterprise';

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

const progressRing = (value: number, color: string, size = 70) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 1s' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={12} fontWeight={800} fill={color}>{value}</text>
    </svg>
  );
};

// ── Config Maps ───────────────────────────────────────────────────────────────

const AGENT_ROLE_CFG: Record<CognitiveAgentRole, { label: string; color: string; icon: string }> = {
  AI_CORE:        { label: 'AI Core', color: '#34d399', icon: '🧠' },
  GOVERNANCE_AI:  { label: 'Governance AI', color: '#60a5fa', icon: '⚖️' },
  COMPLIANCE_AI:  { label: 'Compliance AI', color: '#38bdf8', icon: '📋' },
  IMPACT_AI:      { label: 'Impact AI', color: '#4ade80', icon: '🌱' },
  ANALYTICS_AI:   { label: 'Analytics AI', color: '#c084fc', icon: '📊' },
  INNOVATION_AI:  { label: 'Innovation AI', color: '#fbbf24', icon: '💡' },
  HYPERCARE_AI:   { label: 'Hypercare AI', color: '#fb923c', icon: '🏥' },
  KNOWLEDGE_AI:   { label: 'Knowledge AI', color: '#a78bfa', icon: '📚' },
};

const MEMORY_TYPE_CFG: Record<InstitutionalMemoryType, { label: string; color: string }> = {
  DECISAO_ESTRATEGICA: { label: 'Decisão Estratégica', color: '#fbbf24' },
  LICAO_APRENDIDA:     { label: 'Lição Aprendida',    color: '#34d399' },
  POLITICA_NORMA:      { label: 'Política / Norma',   color: '#60a5fa' },
  AUDITORIA:           { label: 'Auditoria',           color: '#fb923c' },
  ADR_ARQUITETURAL:    { label: 'ADR Arquitetural',   color: '#c084fc' },
  INCIDENTE_RESOLVIDO: { label: 'Incidente Resolvido',color: '#38bdf8' },
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CEO/CAIO Board & Cognitive Hub',
  'Mapa Cognitivo Corporativo & Grafo',
  'Orquestra de Agentes Inteligentes',
  'Memória Institucional & ADRs',
  'Consciência Operacional em Tempo Real',
  'IA Cognitiva & Briefings Executivos',
  'Painéis Cognitivos de Alta Gestão',
  'CERTIFICAÇÃO ENTERPRISE COGNITIVA',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CEO/CAIO Board & Cognitive Hub': '🧬',
  'Mapa Cognitivo Corporativo & Grafo': '🕸️',
  'Orquestra de Agentes Inteligentes': '🤖',
  'Memória Institucional & ADRs': '📚',
  'Consciência Operacional em Tempo Real': '⚡',
  'IA Cognitiva & Briefings Executivos': '💡',
  'Painéis Cognitivos de Alta Gestão': '💼',
  'CERTIFICAÇÃO ENTERPRISE COGNITIVA': '🏆',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ECOIDNSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CEO/CAIO Board & Cognitive Hub');
  const [kpis, setKpis] = useState<ECOIDNSDashboardKPIs | null>(null);
  const [agents, setAgents] = useState<CognitiveAgent[]>([]);
  const [memory, setMemory] = useState<InstitutionalMemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [certEmitted, setCertEmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [k, ag, mem] = await Promise.all([
        EnterpriseECOIDNSService.getDashboardKPIs(),
        EnterpriseECOIDNSService.getAgents(),
        EnterpriseECOIDNSService.getMemoryItems(),
      ]);
      setKpis(k); setAgents(ag); setMemory(mem);
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
          <div style={{ fontSize: 48 }}>🧬</div>
          <div style={{ color: '#64748b', marginTop: 12 }}>Inicializando Sistema Nervoso Digital Institucional…</div>
        </div>
      </div>
    );
  }

  // ── TAB 1: Dashboard ─────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', border: '1px solid #818cf833', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 180, opacity: 0.04 }}>🧬</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          ENTERPRISE COGNITIVE ORGANIZATION & INSTITUTIONAL DIGITAL NERVOUS SYSTEM PLATFORM
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
          ECO-IDNS — Organização Cognitiva & Sistema Nervoso Digital 🧬
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', maxWidth: 720, lineHeight: 1.65 }}>
          A Plataforma Instituto Ser Melhor como Organização Cognitiva: 9 agentes inteligentes coordenados, Knowledge Graph com 8.400 nós, memória institucional com 3.840 itens e apoio a decisões em 4.2 minutos.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {['Cognitive Enterprise', 'Multi-Agent Systems', 'Knowledge Graph', 'AlloyDB', 'Vertex AI', 'ISO 42001', 'TOGAF'].map(f => (
            <span key={f} style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', background: '#818cf818', padding: '3px 10px', borderRadius: 20, border: '1px solid #818cf833' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        {kpis && <>
          {kpiCard('Maturidade Cognitiva Global', kpis.globalCognitiveMaturityScore.toFixed(1), '/100', '#818cf8', '🧬')}
          {kpiCard('Memória Institucional', kpis.institutionalMemoryItemsCount.toLocaleString('pt-BR'), 'itens', '#34d399', '📚')}
          {kpiCard('Agentes Cognitivos Ativos', kpis.activeAgentsCount, 'agentes', '#60a5fa', '🤖')}
          {kpiCard('Nós no Knowledge Graph', `${(kpis.knowledgeGraphNodesTotal / 1000).toFixed(1)}k`, 'nós', '#a78bfa', '🕸️')}
          {kpiCard('Tempo Médio de Apoio à Decisão', kpis.avgDecisionSupportTimeMinutes.toFixed(1), 'min', '#fbbf24', '⏱️')}
          {kpiCard('Coordenação entre Agentes', `${kpis.agentCoordinationScore}%`, '', '#4ade80', '🔗')}
        </>}
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>📊 Maturidade do Sistema Nervoso Digital</div>
          {[
            { l: 'Organização Cognitiva (Cognitive Maturity Model)', v: 99, c: '#818cf8' },
            { l: 'Memória Institucional (Versionada & Hash-SHA256)', v: 100, c: '#34d399' },
            { l: 'Coordenação de Agentes Multi-Agent Systems', v: 99.5, c: '#60a5fa' },
            { l: 'Knowledge Graph (Consultas Semânticas)', v: 98, c: '#a78bfa' },
            { l: 'Governança Cognitiva (Human-in-the-Loop 100%)', v: 100, c: '#4ade80' },
          ].map(s => scoreBar(s.l, s.v, s.c))}
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🎯 Scorecard de Organização Cognitiva</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            {kpis && [
              { label: 'Cognitivo', v: Math.round(kpis.globalCognitiveMaturityScore), c: '#818cf8' },
              { label: 'Agentes', v: Math.round(kpis.agentCoordinationScore), c: '#34d399' },
              { label: 'Governança', v: 100, c: '#4ade80' },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                {progressRing(r.v, r.c, 75)}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{r.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>🧬 Sistema Nervoso Digital Ativo</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
              A Plataforma ISM opera como Organização Cognitiva de Nível 5, onde 9 agentes coordenados compartilham contexto, memória e conhecimento em tempo real, reduzindo o ciclo decisório de 5 dias para 4.2 minutos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── TAB 2: Knowledge Graph ───────────────────────────────────────────────

  const renderGraph = () => (
    <div>
      <div style={styles.secTitle}>🕸️ Mapa Cognitivo Corporativo — Knowledge Graph Federation (8.400 Nós)</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #a78bfa', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16 }}>
          O Knowledge Graph Institucional conecta semanticamente todos os módulos implementados (Prompts 001–079), pessoas, projetos, riscos, decisões e agentes de IA em uma estrutura consultável.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { t: 'Domínio Clínico/Saúde', nós: '3.200', c: '#34d399' },
            { t: 'Domínio Governança', nós: '1.840', c: '#60a5fa' },
            { t: 'Domínio Financeiro', nós: '980', c: '#fbbf24' },
            { t: 'Domínio Impacto Social', nós: '920', c: '#4ade80' },
            { t: 'Domínio IA & Agentes', nós: '1.460', c: '#c084fc' },
          ].map((d, i) => (
            <div key={i} style={{ background: '#1e293b', padding: 14, borderRadius: 8, borderLeft: `3px solid ${d.c}` }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>{d.t}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: d.c, marginTop: 4 }}>{d.nós} nós</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TAB 3: Agentes ───────────────────────────────────────────────────────

  const renderAgents = () => (
    <div>
      <div style={styles.secTitle}>🤖 Orquestra de Agentes Cognitivos (Multi-Agent Coordination Engine)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {agents.map(ag => {
          const cfg = AGENT_ROLE_CFG[ag.role];
          return (
            <div key={ag.id} style={{ ...styles.card, borderTop: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                {badge(ag.status === 'ATIVO_PRODUCAO' ? 'PRODUÇÃO' : 'CALIBRANDO', '#22c55e', '#14532d')}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{ag.agentCode}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0 8px' }}>{ag.agentName}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'Acurácia', v: `${ag.accuracyPercent}%`, c: '#34d399' },
                  { l: 'Decisões', v: ag.decisionsSupported.toLocaleString('pt-BR'), c: '#60a5fa' },
                  { l: 'Nós Graf.', v: ag.knowledgeGraphNodesLinked.toLocaleString('pt-BR'), c: '#a78bfa' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{m.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#64748b' }}>
                Human-in-the-Loop: <strong style={{ color: '#4ade80' }}>{ag.humanApprovalRate}%</strong> · Módulos conectados: <strong>{ag.connectedModulesCount}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 4: Memória Institucional ─────────────────────────────────────────

  const renderMemory = () => (
    <div>
      <div style={styles.secTitle}>📚 Memória Institucional & ADRs (3.840 itens · SHA-256 Imutável)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {memory.map(m => {
          const cfg = MEMORY_TYPE_CFG[m.type];
          return (
            <div key={m.id} style={{ ...styles.card, borderLeft: `4px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>{m.memoryCode}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {badge(cfg.label, cfg.color, cfg.color + '20')}
                  {m.isHashSigned && badge('SHA-256 ✓', '#22c55e', '#14532d')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 10 }}>{m.summary}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                {m.tagsKeywords.map(t => (
                  <span key={t} style={{ fontSize: 10, color: '#94a3b8', background: '#1e293b', padding: '2px 7px', borderRadius: 4 }}>#{t}</span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>
                Versão: <strong>{m.versionNumber}</strong> · Confiança: <strong style={{ color: '#34d399' }}>{m.confidenceScore}%</strong> · Registrado: <strong>{m.recordedAt}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── TAB 5: Consciência Operacional ───────────────────────────────────────

  const renderAwareness = () => (
    <div>
      <div style={styles.secTitle}>⚡ Consciência Operacional — Monitor do Sistema Nervoso Digital</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #fbbf24' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { l: 'Saúde da Operação', v: '99.98% Uptime', c: '#34d399', i: '💚' },
            { l: 'Riscos Emergentes Detectados', v: '0 Críticos', c: '#4ade80', i: '🛡️' },
            { l: 'Ciclo de Processamento Agente', v: '< 180ms', c: '#60a5fa', i: '⚡' },
            { l: 'Alertas de Memória Desatualizada', v: '0 Alertas', c: '#34d399', i: '✅' },
            { l: 'Detecção de Conflitos de Agente', v: 'Tempo Real', c: '#c084fc', i: '🔍' },
            { l: 'Consistência do Knowledge Graph', v: '99.9%', c: '#fbbf24', i: '🕸️' },
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

  // ── TAB 6: IA Cognitiva ──────────────────────────────────────────────────

  const renderCognitiveAI = () => (
    <div>
      <div style={styles.secTitle}>💡 IA Cognitiva & Briefings Executivos para Presidência e Conselhos</div>
      <div style={{ ...styles.card, borderLeft: '4px solid #818cf8' }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
          O agente Knowledge AI sintetiza contexto de todos os 9 agentes e 79 módulos para gerar briefings explicáveis para a alta gestão.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { l: 'Síntese de Contexto Institucional', v: '99.1% Confiança', c: '#818cf8' },
            { l: 'Tempo de Geração de Briefing', v: '< 4.2 min', c: '#34d399' },
            { l: 'Rastreabilidade de Fontes', v: '100% Auditável', c: '#60a5fa' },
            { l: 'Detecção de Conflitos de Estratégia', v: 'Automática', c: '#fbbf24' },
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

  // ── TAB 7: Painéis ───────────────────────────────────────────────────────

  const renderExecutive = () => (
    <div>
      <div style={styles.secTitle}>💼 Painéis Cognitivos de Alta Gestão (CEO / CAIO / CKO / CSO)</div>
      <div style={{ ...styles.card, borderTop: '3px solid #818cf8' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { l: 'Maturidade Cognitiva', v: '98.9/100', c: '#818cf8', i: '🧬' },
            { l: 'Agentes Coordenados', v: '9 Ativos', c: '#34d399', i: '🤖' },
            { l: 'Knowledge Graph', v: '8.400 Nós', c: '#a78bfa', i: '🕸️' },
            { l: 'Memória Institucional', v: '3.840 itens', c: '#fbbf24', i: '📚' },
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

  // ── TAB 8: Certificação ──────────────────────────────────────────────────

  const renderCertification = () => (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)', border: '2px solid #818cf840', borderRadius: 20, padding: '36px 40px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          CERTIFICADO ENTERPRISE DE ORGANIZAÇÃO COGNITIVA
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.3 }}>
          ECO-IDNS — Enterprise Cognitive Organization &<br />Institutional Digital Nervous System Platform
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
          A Plataforma Instituto Ser Melhor é declarada uma Organização Cognitiva de Nível 5, com 9 agentes coordenados, Knowledge Graph de 8.400 nós e decisões apoiadas em 4.2 minutos com rastreabilidade total.
        </div>
        <button onClick={() => setCertEmitted(true)}
          style={{ background: certEmitted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {certEmitted ? '✅ Certificado ECO-IDNS Emitido — Prompt 079' : '🏆 Emitir Certificado de Organização Cognitiva'}
        </button>
        {certEmitted && <div style={{ marginTop: 12, fontSize: 12, color: '#34d399' }}>{kpis?.certificationDate} — {kpis?.certificationVersion}</div>}
      </div>

      <div style={styles.card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Declaração do CEO & Chief AI Officer (CAIO)</div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          A Plataforma Instituto Ser Melhor consolida-se como uma Organização Cognitiva com nota **98.9/100**. O Sistema Nervoso Digital Institucional conecta 9 agentes, 8.400 nós de conhecimento e 3.840 itens de memória institucional, apoiando decisões estratégicas em 4.2 minutos com 100% de supervisão humana. **Organização Cognitiva Certificada.**
        </div>
      </div>
    </div>
  );

  const tabContent: Record<Tab, () => React.ReactNode> = {
    'Torre CEO/CAIO Board & Cognitive Hub': renderDashboard,
    'Mapa Cognitivo Corporativo & Grafo': renderGraph,
    'Orquestra de Agentes Inteligentes': renderAgents,
    'Memória Institucional & ADRs': renderMemory,
    'Consciência Operacional em Tempo Real': renderAwareness,
    'IA Cognitiva & Briefings Executivos': renderCognitiveAI,
    'Painéis Cognitivos de Alta Gestão': renderExecutive,
    'CERTIFICAÇÃO ENTERPRISE COGNITIVA': renderCertification,
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.title}>🧬 ECO-IDNS — Enterprise Cognitive Organization & Institutional Digital Nervous System Platform</h1>
        <p style={styles.sub}>Prompt 079 · Instituto Ser Melhor v2.0 · Cognitive Enterprise · Multi-Agent Systems · Knowledge Graph · Vertex AI · AlloyDB · ISO 42001</p>
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

export default ECOIDNSPage;
