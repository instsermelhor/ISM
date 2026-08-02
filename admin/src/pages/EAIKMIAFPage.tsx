/**
 * EAIKMIAFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E020 — ENTERPRISE ARTIFICIAL INTELLIGENCE, KNOWLEDGE MANAGEMENT &
 *         INTELLIGENT AUTOMATION FRAMEWORK (EAIKMIAF)
 * Instituto Ser Melhor — Prompt E020 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  AI Command Tower      — Painel Executivo Consolidado de IA Corporativa
 *   2.  Plataforma de IA      — Camada Unificada de Modelos (Vertex AI, Local LLM)
 *   3.  Gestão do Conhecimento— Repositório Corporativo (Políticas, Manuais, Leis)
 *   4.  Mecanismo RAG         — Busca Vetorial Hibrida e Citação de Fontes
 *   5.  Agentes Inteligentes   — 10 Agentes Especializados com Permissões
 *   6.  Automação Cognitiva   — Triagem, Extração, Resumos e Form Fill
 *   7.  Gestão de Prompts     — Templates Versionados e Approval Workflow
 *   8.  Knowledge Graph       — Grafo Corporativo de 10 Entidades
 *   9.  MLOps & Model Registry— Versionamento, Drift e Avaliação Contínua
 *  10.  Integração E005–E019  — Matriz de Serviços Inteligentes Desacoplados
 *  11.  IA Responsável & RAG  — Recomendações, Human-in-the-Loop & ISO 42001
 *  12.  Certificação E020     — Enterprise AI Readiness Score & Declaração E021
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EAIKMIAFService,
  type EAIConsolidatedDashboard,
  type AIService,
  type AIAgent,
  type KnowledgeArticle,
  type AIRecommendation,
  type PromptTemplate,
  type AutomationRule,
  type ModelRegistry,
  type KnowledgeGraphAggregate,
  type EnterpriseAICertification,
  type AgentRole,
} from '../services/eaikmiafEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#060913',
  bgCard:    '#0b1220',
  bgAlt:     '#0f172a',
  border:    `#1e293b`,
  borderDim: '#1e293b80',
  cyan:      '#06b6d4',
  violet:    '#8b5cf6',
  indigo:    '#6366f1',
  green:     '#10b981',
  amber:     '#f59e0b',
  rose:      '#f43f5e',
  sky:       '#38bdf8',
  emerald:   '#34d399',
  purple:    '#c084fc',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const AGENT_ROLE_ICONS: Record<AgentRole, string> = {
  ATENDIMENTO_INSTITUCIONAL: '🤝',
  APOIO_ADMINISTRATIVO: '📋',
  APOIO_JURIDICO: '⚖️',
  APOIO_PSICOLOGICO_NON_DIAGNOSTIC: '🧠',
  ASSISTENCIA_SOCIAL: '🌟',
  FINANCEIRO: '💰',
  RH: '👥',
  DOCUMENTACAO: '📄',
  ANALYTICS: '📊',
  COMPLIANCE: '🛡️',
  AUDITORIA: '🔍',
};

const TABS = [
  { id: 'tower',        icon: '🤖', label: 'AI Command Tower' },
  { id: 'services',     icon: '⚙️', label: 'Plataforma de IA' },
  { id: 'knowledge',    icon: '📚', label: 'Base de Conhecimento' },
  { id: 'rag',          icon: '🔍', label: 'Mecanismo RAG' },
  { id: 'agents',       icon: '🕵️', label: 'Agentes Inteligentes' },
  { id: 'automation',   icon: '⚡', label: 'Automação Cognitiva' },
  { id: 'prompts',      icon: '💬', label: 'Prompt Management' },
  { id: 'kg',           icon: '🕸️', label: 'Knowledge Graph' },
  { id: 'mlops',        icon: '📈', label: 'MLOps & Registry' },
  { id: 'integration', icon: '🔗', label: 'Integração E005–E019' },
  { id: 'responsible', icon: '⚖️', label: 'IA Responsável' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E020' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Shared Helper Components ──────────────────────────────────────────────────

const DarkCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 24px', ...style }}>
    {children}
  </div>
);

const Badge = ({ text, color, bg }: { text: string; color: string; bg: string }) => (
  <span style={{ fontSize: 10, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {text}
  </span>
);

const MetricPill = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 16px', background: `${color}15`, border: `1px solid ${color}35`, borderRadius: 10 }}>
    <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
    <span style={{ fontSize: 10, color: C.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
  </div>
);

function ScoreBar({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 4 }}>
        <div style={{ height: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4, transition: 'width 0.8s' }} />
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text1 }}>{title}</h2>
          {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: C.text3 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <div style={{
        width: 40, height: 40, border: `3px solid ${C.border}`,
        borderTopColor: C.cyan, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: AI Command Tower ───────────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EAIConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando AI Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091224 0%, #150d30 50%, #061c28 100%)',
        border: `1px solid ${C.cyan}40`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🤖</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise AI Command Tower (E020)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Camada Corporativa de Inteligência Artificial · ISO 42001 · NIST AI RMF 1.0 · LGPD · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>{d.aiReadinessScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>AI Readiness Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚙️', label: 'Serviços de IA', value: d.totalServices, color: C.cyan },
            { icon: '🕵️', label: 'Agentes Ativos', value: d.activeAgents, color: C.purple },
            { icon: '📚', label: 'Artigos na KB', value: d.totalKnowledgeArticles, color: C.emerald },
            { icon: '📐', label: 'Embeddings Indexados', value: `${(d.indexedEmbeddingsCount / 1e3).toFixed(1)}k`, color: C.violet },
            { icon: '💬', label: 'Prompt Templates', value: d.promptTemplatesCount, color: C.sky },
            { icon: '🌟', label: 'Recomendações IA', value: d.totalRecommendationsGenerated, color: C.amber },
            { icon: '🔒', label: 'PII Mascarados', value: `${(d.piiMaskedTotal / 1e3).toFixed(1)}k`, color: C.green },
            { icon: '⚡', label: 'Inferências (30d)', value: `${(d.totalInferencesLast30d / 1e3).toFixed(1)}k`, color: C.rose },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}12`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>⚡ Desempenho e Latência</div>
          <ScoreBar label="Acurácia Global dos Modelos" value={d.globalQualityScore} color={C.green} />
          <ScoreBar label="Taxa de PII Filtrados" value={99.8} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Latência Médias por Inferência</span>
            <span style={{ color: C.sky, fontWeight: 800 }}>{d.avgLatencyMs} ms</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🛡️ Governança & Validação Humana</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#451a0320', border: '1px solid #f59e0b40', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.amber }}>Validações Humanas Pendentes</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Recomendações clínicas, jurídicas e financeiras</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.amber }}>{d.pendingHumanValidations}</span>
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Automações Cognitivas Ativas</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Triagem, resumos e extração sem substituição de validação</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{d.cognitiveAutomationsActive}</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Conformidade de IA Responsável</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 42001 AI Management System', status: 'CONFORME', color: C.green },
              { label: 'ISO 23894 AI Risk Management', status: 'CONFORME', color: C.green },
              { label: 'NIST AI RMF 1.0 (Govern/Map)', status: 'CONFORME', color: C.green },
              { label: 'LGPD Art. 6 & Art. 20 (Revisão)', status: 'CONFORME', color: C.green },
              { label: 'OWASP LLM Top 10 Safeguards', status: 'CONFORME', color: C.green },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.borderDim}` }}>
                <span style={{ color: C.text3 }}>{item.label}</span>
                <Badge text={item.status} color={item.color} bg={`${item.color}20`} />
              </div>
            ))}
          </div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 2: Plataforma de IA ───────────────────────────────────────────────────

function ServicesTab() {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getAIServices().then(s => { setServices(s); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Plataforma de IA..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚙️" title="Camada Unificada de Serviços de IA" sub="Abstração Multi-Modelo e Multi-Provedor (Vertex AI Gemini + On-Prem Llama 3.1)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {services.map(s => (
          <DarkCard key={s.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{s.code}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge text={s.isLocal ? '🔒 LOCAL / ON-PREM' : '☁️ CLOUD'} color={s.isLocal ? C.emerald : C.sky} bg={s.isLocal ? '#064e3b20' : '#0c2340'} />
                <Badge text={s.isActive ? '● ATIVO' : '○ INATIVO'} color={s.isActive ? C.green : C.rose} bg={s.isActive ? '#064e3b20' : '#4c051920'} />
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>
              Modelo: <strong style={{ color: C.text2 }}>{s.modelName}</strong> · Provedor: {s.provider}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Latência" value={`${s.avgLatencyMs}ms`} color={C.cyan} />
              <MetricPill label="Custo / 1k tokens" value={`R$ ${s.costPer1kTokensBrl.toFixed(3)}`} color={C.purple} />
            </div>

            <div style={{ fontSize: 10, color: C.text3, padding: '8px 10px', background: C.bgAlt, borderRadius: 8 }}>
              🔄 Fallback Automático: <strong style={{ color: C.text2 }}>{s.fallbackProvider || 'NENHUM'}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Base de Conhecimento ───────────────────────────────────────────────

function KnowledgeTab() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getKnowledgeArticles().then(a => { setArticles(a); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Base de Conhecimento..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📚" title="Repositório Corporativo de Conhecimento" sub="Políticas, Manuais, Protocolos Clínicos, Legislação e Fluxos Internos Versionados" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {articles.map(art => (
          <DarkCard key={art.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{art.code}</span>
              <Badge text={art.status} color={art.status === 'PUBLISHED' ? C.green : C.amber} bg={art.status === 'PUBLISHED' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{art.title}</div>
            <div style={{ fontSize: 10, color: C.violet, marginBottom: 8, fontWeight: 700 }}>
              {art.category.replace(/_/g, ' ')}
            </div>

            <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5, marginBottom: 12 }}>{art.summary}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>✍️ {art.author}</span>
              <span>🧩 {art.chunkCount} chunks RAG</span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: RAG Engine ─────────────────────────────────────────────────────────

function RAGTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔍" title="Motor RAG — Retrieval-Augmented Generation" sub="Busca Híbrida (Semântica + Lexical BM25), Embeddings 768d e Citação Transparente de Fontes" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 14 }}>🧪 Teste de Consulta RAG Contextual (Simulação Auditável)</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            type="text"
            readOnly
            value="Quais são as diretrizes para concessão de auxílio alimentar temporário e acolhimento psicológico emergencial?"
            style={{
              flex: 1, padding: '10px 14px', background: C.bgAlt, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text1, fontSize: 12, outline: 'none',
            }}
          />
          <button style={{
            padding: '10px 20px', background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>
            Executar RAG Híbrido
          </button>
        </div>

        {/* Result Simulation */}
        <div style={{ background: C.bgAlt, border: `1px solid ${C.cyan}40`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan }}>💡 Resposta Gerada por RAG com Citações Auditáveis</span>
            <Badge text="Confiança RAG: 96.4%" color={C.green} bg="#064e3b20" />
          </div>

          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.7, marginBottom: 14 }}>
            De acordo com o <strong style={{ color: C.cyan }}>[ART-005] Fluxo BPM de Concessão de Benefícios Eventuais</strong>, a liberação de auxílio alimentar emergencial requer comprovação de vulnerabilidade temporária atestada pelo assistente social. Adicionalmente, conforme o <strong style={{ color: C.purple }}>[ART-003] Protocolo Clínico de Acolhimento em Saúde Mental</strong>, os casos de sofrimento psíquico associados devem ser imediatamente direcionados para escuta qualificada sem diagnóstico primário.
          </p>

          <div style={{ fontSize: 11, fontWeight: 800, color: C.text1, marginBottom: 8 }}>📌 Evidências e Fontes Citadas:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ padding: '8px 12px', background: `${C.cyan}10`, border: `1px solid ${C.cyan}30`, borderRadius: 6, fontSize: 11 }}>
              <span style={{ color: C.cyan, fontWeight: 800 }}>[ART-005]</span> <span style={{ color: C.text1 }}>Fluxo BPM de Benefícios Eventuais</span> — <i>Score de Similaridade Vetorial: 0.94</i>
            </div>
            <div style={{ padding: '8px 12px', background: `${C.purple}10`, border: `1px solid ${C.purple}30`, borderRadius: 6, fontSize: 11 }}>
              <span style={{ color: C.purple, fontWeight: 800 }}>[ART-003]</span> <span style={{ color: C.text1 }}>Protocolo Clínico de Acolhimento</span> — <i>Score de Similaridade Vetorial: 0.91</i>
            </div>
          </div>
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 5: Agentes Inteligentes ───────────────────────────────────────────────

function AgentsTab() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getAIAgents().then(a => { setAgents(a); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Agentes Inteligentes..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🕵️" title="Agentes Inteligentes Especializados" sub="10 Agentes com Permissões Delimitadas por Domínio e Validação Humana Obrigatória" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {agents.map(ag => (
          <DarkCard key={ag.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 28 }}>{AGENT_ROLE_ICONS[ag.role] || '🤖'}</div>
              <Badge text={ag.humanValidationRequired ? '⚠️ REQUER REVISÃO HUMANA' : '⚡ AUTOMÁTICO'}
                color={ag.humanValidationRequired ? C.amber : C.green}
                bg={ag.humanValidationRequired ? '#451a0320' : '#064e3b20'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 2 }}>{ag.name}</div>
            <div style={{ fontSize: 10, color: C.cyan, fontFamily: 'monospace', marginBottom: 8 }}>{ag.code}</div>

            <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5, marginBottom: 12 }}>{ag.description}</p>

            <div style={{ fontSize: 10, color: C.text3, marginBottom: 6 }}>
              🛠️ Ferramentas: <span style={{ color: C.text2 }}>{ag.allowedTools.join(', ')}</span>
            </div>

            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10 }}>
              🔒 Módulos Autorizados: <span style={{ color: C.purple }}>{ag.restrictedModules.join(', ')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Execuções: <strong style={{ color: C.text1 }}>{ag.executionsCount.toLocaleString('pt-BR')}</strong></span>
              <span>Temp: {ag.temperature}</span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Automação Cognitiva ────────────────────────────────────────────────

function AutomationTab() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getAutomationRules().then(r => { setRules(r); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Regras de Automação..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="Automação Cognitiva Governamental" sub="Triagem, Classificação, Resumos e Form-Fill com Preservação de Validações Críticas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {rules.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{r.code}</span>
              <Badge text={r.type.replace(/_/g, ' ')} color={C.purple} bg="#2e106520" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{r.name}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <MetricPill label="Acurácia" value={`${r.accuracyRate}%`} color={C.green} />
              <MetricPill label="Execuções" value={r.executionsCount.toLocaleString('pt-BR')} color={C.sky} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              🔗 De: <strong style={{ color: C.text2 }}>{r.sourceModule}</strong> → Para: <strong style={{ color: C.text2 }}>{r.targetModule}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Prompt Management ──────────────────────────────────────────────────

function PromptsTab() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getPromptTemplates().then(p => { setPrompts(p); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Gestão de Prompts..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="💬" title="Governança Corporativa de Prompts" sub="Templates Versionados, Variáveis Controladas e Workflow de Aprovação Formal" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {prompts.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text={p.isApproved ? '✅ APROVADO' : '⏳ EM REVISÃO'} color={p.isApproved ? C.green : C.amber} bg={p.isApproved ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 10, color: C.violet, marginBottom: 8 }}>Categoria: {p.category}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 12 }}>{p.description}</p>

            <div style={{ fontSize: 10, color: C.text3 }}>
              📌 Variáveis: <span style={{ color: C.sky, fontFamily: 'monospace' }}>{p.variables.join(', ')}</span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 8: Knowledge Graph ────────────────────────────────────────────────────

function KnowledgeGraphTab() {
  const [kg, setKg] = useState<KnowledgeGraphAggregate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getKnowledgeGraph().then(res => { setKg(res); setLoading(false); });
  }, []);

  if (loading || !kg) return <LoadingState text="Carregando Knowledge Graph..." />;

  const entities = [
    { type: 'PESSOA', count: 480, icon: '👤', color: C.cyan },
    { type: 'PROGRAMA', count: 26, icon: '📋', color: C.purple },
    { type: 'PROJETO', count: 48, icon: '📁', color: C.sky },
    { type: 'DOCUMENTO', count: 320, icon: '📄', color: C.emerald },
    { type: 'PROCESSO', count: 85, icon: '⚙️', color: C.amber },
    { type: 'LEGISLACAO', count: 42, icon: '⚖️', color: C.rose },
    { type: 'PROTOCOLO', count: 64, icon: '🏥', color: C.green },
    { type: 'INDICADOR', count: 29, icon: '📊', color: C.violet },
    { type: 'ATENDIMENTO', count: 240, icon: '🤝', color: C.emerald },
    { type: 'COMPETENCIA', count: 86, icon: '🎓', color: C.cyan },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🕸️" title="Knowledge Graph Corporativo" sub="Mapeamento Semântico Relacionando 10 Entidades Organizacionais da Plataforma" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.cyan }}>{kg.nodesCount.toLocaleString('pt-BR')}</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Nós de Entidades</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.purple }}>{kg.edgesCount.toLocaleString('pt-BR')}</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Relacionamentos Semânticos</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.green }}>10</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Tipos de Entidades Mapeadas</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.sky }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Aderência ao Grafo Corporativo</div>
        </DarkCard>
      </div>

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>🧩 Mapeamento de Entidades do Grafo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {entities.map(e => (
            <div key={e.type} style={{ background: `${e.color}10`, border: `1px solid ${e.color}30`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{e.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: e.color }}>{e.type}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text1, marginTop: 4 }}>{e.count} entidades</div>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: MLOps & Model Registry ──────────────────────────────────────────────

function MLOpsTab() {
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getModelRegistry().then(m => { setModels(m); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando MLOps Registry..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📈" title="MLOps Registry & Monitoramento de Drift" sub="Governança de Modelos, Monitoramento Contínuo e Avaliação de Desempenho (ISO 23894)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {models.map(m => (
          <DarkCard key={m.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{m.code}</span>
              <Badge text={m.driftStatus} color={m.driftStatus === 'STABLE' ? C.green : C.amber} bg={m.driftStatus === 'STABLE' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 2 }}>{m.modelName}</div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 12 }}>Versão: {m.versionString} · Provedor: {m.provider}</div>

            <ScoreBar label="Acurácia & Qualidade" value={m.performanceScore} color={C.green} />

            <div style={{ fontSize: 10, color: C.text3, marginTop: 8 }}>
              Estágio: <strong style={{ color: C.sky }}>{m.stage}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 10: Integração E005–E019 ──────────────────────────────────────────────

function IntegrationTab() {
  const integrations = [
    { m: 'E005', n: 'Core Platform', s: 'Triagem inteligente de cadastros e triagem assistida' },
    { m: 'E006', n: 'Prontuário EHR', s: 'Sumarização de evoluções clínicas sem diagnóstico autônomo' },
    { m: 'E007', n: 'Financeiro', s: 'Parsing de comprovantes e detecção de anomalias contábeis' },
    { m: 'E008', n: 'Recursos Humanos', s: 'Matching de voluntários e planos de desenvolvimento' },
    { m: 'E009', n: 'Assistência Social', s: 'Análise assistida de vulnerabilidade via CadÚnico' },
    { m: 'E010', n: 'Projetos & PMO', s: 'Preenchimento assistido de relatórios de impacto' },
    { m: 'E011', n: 'Convênios', s: 'Verificação de conformidade de termos aditivos' },
    { m: 'E012', n: 'Educação', s: 'Tutor inteligente e recomendação de trilhas' },
    { m: 'E013', n: 'Voluntariado', s: 'Alocação automatizada por competências no Grafo' },
    { m: 'E014', n: 'Jurídico', s: 'Copiloto de pareceres e pesquisa em legislação' },
    { m: 'E015', n: 'Patrimônio', s: 'Classificação automática de inventário' },
    { m: 'E016', n: 'Comunicação / CRM', s: 'Sugestão de respostas e categorização de demandas' },
    { m: 'E017', n: 'Teleatendimento', s: 'Transcrição e triagem em tempo real' },
    { m: 'E018', n: 'Governança', s: 'Auditoria de vazamento de PII e logs imutáveis' },
    { m: 'E019', n: 'Business Intelligence', s: 'Agente de Analytics Preditivo e forecasting' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔗" title="Matriz de Serviços Inteligentes Integrados" sub="Disponibilização Desacoplada de Serviços de IA para Módulos E005 a E019" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {integrations.map(item => (
          <DarkCard key={item.m} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan }}>{item.m} — {item.n}</span>
              <Badge text="● INTEGRADO" color={C.green} bg="#064e3b20" />
            </div>
            <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.4 }}>{item.s}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 11: IA Responsável & Recomendações ────────────────────────────────────

function ResponsibleAITab() {
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getRecommendations().then(r => { setRecs(r); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando IA Responsável..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Governança de IA Responsável & Human-in-the-Loop" sub="ISO 42001 · Explicabilidade de Decisões · Validação Humana Obrigatória" />

      {/* Mandatory Notice */}
      <div style={{ padding: '14px 18px', background: `${C.amber}15`, border: `1px solid ${C.amber}40`, borderRadius: 10, fontSize: 12, color: C.amber }}>
        ⚠️ <strong>ISO 42001 & LGPD Art. 20:</strong> Nenhuma decisão clínica, jurídica, financeira ou disciplinar é tomada automaticamente. Toda recomendação de IA requer aprovação humana formal antes da execução.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {recs.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{r.code}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1, marginLeft: 8 }}>[{r.domain}] {r.recommendationText}</span>
              </div>
              <Badge text={r.validationStatus}
                color={r.validationStatus === 'APPROVED_BY_HUMAN' ? C.green : C.amber}
                bg={r.validationStatus === 'APPROVED_BY_HUMAN' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <MetricPill label="Confiança" value={`${r.confidenceScore}%`} color={C.green} />
              <MetricPill label="Fontes Citadas" value={r.evidenceSources.length} color={C.cyan} />
            </div>

            <div style={{ fontSize: 10, color: C.text3, marginBottom: 6 }}>
              <strong style={{ color: C.text2 }}>Limitações do Modelo:</strong> {r.limitations.join(' · ')}
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 12: Certificação E020 ──────────────────────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EnterpriseAICertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAIKMIAFService.getCertification().then(c => { setCert(c); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E020..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Enterprise AI Readiness Score — E020" sub="Certificação da Plataforma Corporativa de Inteligência Artificial" />

      {/* Global Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091224 0%, #170b36 50%, #061c28 100%)',
        border: `2px solid ${C.cyan}40`, borderRadius: 20, padding: '32px 36px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          {cert.globalScore}
        </div>
        <div style={{ fontSize: 16, color: C.text2, marginTop: 4 }}>Enterprise AI Readiness Score (0–100)</div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 14 }}>
          <Badge text="🎖️ PLATAFORMA DE IA CERTIFICADA" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Subdomains */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Subdomínio de IA</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.subdomainScores.map(s => (
            <div key={s.subdomain} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.subdomain}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{s.score}</span>
              </div>
              <ScoreBar label="" value={s.score} color={C.green} />
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Conformidade ({compliantCount}/{cert.conformanceChecklist.length} itens conformes)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {cert.conformanceChecklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#064e3b10', borderRadius: 7, fontSize: 11 }}>
              <span style={{ color: C.green, fontSize: 14 }}>✓</span>
              <div>
                <span style={{ color: C.text1 }}>{item.item}</span>
                <span style={{ color: C.text3, marginLeft: 6 }}>· {item.standard}</span>
              </div>
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #091224, #150d30)`,
        border: `1px solid ${C.purple}40`, borderRadius: 16, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CERTIFICAÇÃO E020
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Artificial Intelligence, Knowledge Management & Intelligent Automation Framework (EAIKMIAF)</strong> foi
          implementado, validado e certificado com score global de <strong style={{ color: C.green }}>{cert.globalScore}/100</strong>,
          estabelecendo a camada oficial de inteligência da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Esta certificação autoriza formalmente a execução da próxima fase:{' '}
          <strong style={{ color: C.cyan }}>E021 — Enterprise Integration, Interoperability, API Management & External Ecosystem Framework</strong>,
          dedicada à integração segura com sistemas externos, APIs, barramento corporativo e ecossistema institucional.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EAIKMIAFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'services':     return <ServicesTab />;
      case 'knowledge':    return <KnowledgeTab />;
      case 'rag':          return <RAGTab />;
      case 'agents':       return <AgentsTab />;
      case 'automation':   return <AutomationTab />;
      case 'prompts':      return <PromptsTab />;
      case 'kg':           return <KnowledgeGraphTab />;
      case 'mlops':        return <MLOpsTab />;
      case 'integration': return <IntegrationTab />;
      case 'responsible': return <ResponsibleAITab />;
      case 'cert':         return <CertificationTab />;
      default:             return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🧠</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise AI, Knowledge & Intelligent Automation Framework
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E020 · EAIKMIAF · Agentic AI · RAG · Knowledge Graph · ISO 42001 · NIST AI RMF 1.0 · Instituto Ser Melhor
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 3, background: C.bgCard,
          border: `1px solid ${C.border}`, borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 16,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab.id
                  ? `linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.cyan : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.cyan}` : '2px solid transparent',
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}

export default EAIKMIAFPage;
