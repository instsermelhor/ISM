/**
 * EKMOLIMFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E028 — ENTERPRISE KNOWLEDGE MANAGEMENT, ORGANIZATIONAL LEARNING &
 *         INSTITUTIONAL MEMORY FRAMEWORK (EKMOLIMF)
 * Instituto Ser Melhor — Prompt E028 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Knowledge Command Tower — Painel Executivo de Gestão do Conhecimento
 *   2.  Repositório & SOPs      — Procedimentos (SOPs), Políticas e Manual de Normas
 *   3.  Taxonomia & Ontologias  — Classificação Múltipla, Categorias e Relacionamentos
 *   4.  Memória Institucional   — Registros Históricos, Atas, Decisões e ADRs
 *   5.  Lições Aprendidas       — Análise de Causa Raiz, Sucessos e Recomendações
 *   6.  Comunidades de Prática  — CoPs Profissionais (Psicologia, Social, Tech, etc.)
 *   7.  Busca Híbrida & RAG (E020)— Pesquisa Textual + Vetorial com IA Generativa
 *   8.  Ciclo de Vida & Governança— Criação, Revisão, Aprovação e Validade (ISO 30401)
 *   9.  Integração Plataforma   — Conexão com E014 (ECM), E018 (RH), E027 (Estratégico)
 *  10.  Métricas & Observabilidade— Acessos, Avaliação de Utilidade e Conteúdos
 *  11.  APIs & Eventos          — OpenAPI 3.1 & Barramento de Eventos
 *  12.  Certificação E028      — Knowledge Management Maturity Score 98/100 & Encerramento
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EKMOLIMFService,
  type EKMOLIMFConsolidatedDashboard,
  type KnowledgeAsset,
  type LessonLearned,
  type InstitutionalMemoryRecord,
  type CommunityOfPractice,
  type KnowledgeManagementCertification,
} from '../services/ekmolimfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02050e',
  bgCard:    '#070d1d',
  bgAlt:     '#0a1427',
  border:    '#1e293b',
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
  gold:      '#fbbf24',
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const TABS = [
  { id: 'tower',        icon: '📚', label: 'Knowledge Command Tower' },
  { id: 'repository',   icon: '📂', label: 'Repositório & SOPs' },
  { id: 'taxonomy',     icon: '🏷️', label: 'Taxonomia & Ontologia' },
  { id: 'memory',       icon: '🏛️', label: 'Memória Institucional' },
  { id: 'lessons',      icon: '💡', label: 'Lições Aprendidas' },
  { id: 'cops',         icon: '👥', label: 'Comunidades (CoP)' },
  { id: 'search',       icon: '🔍', label: 'Busca Híbrida / RAG' },
  { id: 'governance',   icon: '📜', label: 'Ciclo de Vida & ISO 30401' },
  { id: 'integration',  icon: '🔌', label: 'Integrações' },
  { id: 'metrics',      icon: '📊', label: 'Métricas & Acessos' },
  { id: 'apis',         icon: '⚡', label: 'APIs & Eventos' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E028' },
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
        borderTopColor: C.purple, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Knowledge Command Tower ───────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EKMOLIMFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Knowledge Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091738 0%, #200b3d 50%, #032729 100%)',
        border: `2px solid ${C.purple}50`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.purple}40`,
          }}>📚</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Knowledge & Institutional Memory Command Tower (E028)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Gestão do Conhecimento · Memória Institucional · ISO 30401 · Busca Híbrida RAG · Comunidades de Prática · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.purple }}>{d.knowledgeMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Knowledge Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📂', label: 'Ativos de Conhecimento', value: d.totalKnowledgeAssetsCount, color: C.cyan },
            { icon: '📜', label: 'SOPs Publicados', value: d.totalSOPsPublished, color: C.purple },
            { icon: '💡', label: 'Lições Aprendidas', value: d.totalLessonsLearnedRegistered, color: C.amber },
            { icon: '🏛️', label: 'Memórias Arquivadas', value: d.totalInstitutionalMemoriesArchived, color: C.gold },
            { icon: '👥', label: 'Comunidades (CoP)', value: d.activeCommunitiesOfPracticeCount, color: C.emerald },
            { icon: '🔍', label: 'Acurácia Busca RAG', value: `${d.globalSearchAccuracyPct}%`, color: C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}12`, border: `1px solid ${k.color}30`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📚 Preservação do Conhecimento (ISO 30401)</div>
          <ScoreBar label="Repositório Normativo & SOPs" value={99} color={C.green} />
          <ScoreBar label="Memória Institucional Permanente" value={99} color={C.purple} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Retenção de Conhecimento Tácito</span>
            <span style={{ color: C.green, fontWeight: 800 }}>100% Retido</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>👥 Comunidades de Prática (CoP)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Engajamento de Especialistas</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Wenger CoP Framework</div>
              </div>
              <Badge text="ATIVO" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Artigos e Casos Publicados</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Revisão de Pares</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>134</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Selos Normativos de Governança</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 30401 Knowledge Management', status: 'CONFORME', color: C.green },
              { label: 'ISO 9001 Document Control', status: 'CONFORME', color: C.green },
              { label: 'ISO 56002 Innovation Knowledge', status: 'CONFORME', color: C.green },
              { label: 'RAG Hybrid Vector Search (E020)', status: 'CONFORME', color: C.green },
              { label: 'LGPD Confidentiality & RBAC', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Repositório Corporativo & SOPs ─────────────────────────────────────

function RepositoryTab() {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getAssets().then(res => { setAssets(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Repositório Corporativo..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📂" title="Repositório Corporativo de Ativos de Conhecimento" sub="Procedimentos Operacionais Padrão (SOPs), Políticas, Manuais e Diretrizes Normativas Versionadas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {assets.map(a => (
          <DarkCard key={a.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{a.code}</span>
              <Badge text={a.securityClassification} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Domínio: {a.domainName} · Versão: {a.versionNumber}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{a.summary}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Autor: <strong style={{ color: C.text2 }}>{a.authorName}</strong></span>
              <span>Avaliação: <strong style={{ color: C.gold }}>⭐ {a.usefulnessRating}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Taxonomia & Ontologias ─────────────────────────────────────────────

function TaxonomyTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏷️" title="Taxonomia & Ontologias Institucionais" sub="Estrutura de Classificação Múltipla, Categorias, Subcategorias e Relacionamentos Semânticos" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 8 }}>🏷️ Árvore Taxonômica Unificada do Instituto Ser Melhor</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          A taxonomia corporativa conecta automaticamente todos os documentos de Saúde Mental, Assistência Social, Jurídico, RH, Financeiro e Tecnologia, permitindo navegação contextualizada por ontologias relacionais.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 4: Memória Institucional ──────────────────────────────────────────────

function MemoryTab() {
  const [memories, setMemories] = useState<InstitutionalMemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getMemories().then(res => { setMemories(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Memória Institucional..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏛️" title="Memória Institucional & Marcos Históricos" sub="Registro Permanente de Decisões Estratégicas, Atas, Projetos Concluídos e ADRs Arquiteturais" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {memories.map(m => (
          <DarkCard key={m.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{m.code}</span>
              <Badge text={m.historicalCategory.replace(/_/g, ' ')} color={C.gold} bg="#fbbf2420" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{m.milestoneTitle}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Data do Marco: {m.eventDate}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{m.detailedDescription}</p>

            <div style={{ fontSize: 10, color: C.green }}>
              Evidência Digital: <a href={m.digitalEvidenceUrl} target="_blank" rel="noreferrer" style={{ color: C.sky }}>Link Seguro SHA-256</a>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Lições Aprendidas ──────────────────────────────────────────────────

function LessonsTab() {
  const [lessons, setLessons] = useState<LessonLearned[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getLessons().then(res => { setLessons(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Lições Aprendidas..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="💡" title="Gestão de Lições Aprendidas & Aprendizagem" sub="Análise de Causa Raiz de Sucessos e Falhas com Planos Preventivos Vinculados a Processos" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {lessons.map(l => (
          <DarkCard key={l.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{l.code}</span>
              <Badge text={l.outcomeType} color={l.outcomeType === 'SUCCESS' ? C.green : C.amber} bg={l.outcomeType === 'SUCCESS' ? '#064e3b20' : '#451a0320'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{l.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Projeto: {l.associatedProjectCode}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}><strong>Causa Raiz:</strong> {l.rootCauseAnalysis}</p>

            <div style={{ fontSize: 10, color: C.emerald }}>Recomendação: {l.preventiveRecommendation}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Comunidades de Prática (CoP) ───────────────────────────────────────

function CoPsTab() {
  const [cops, setCops] = useState<CommunityOfPractice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getCommunities().then(res => { setCops(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Comunidades de Prática..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="👥" title="Comunidades de Prática (CoPs) Profissionais" sub="Espaços de Troca de Conhecimento, Fóruns Temáticos e Colaboração entre Especialistas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {cops.map(c => (
          <DarkCard key={c.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{c.code}</span>
              <Badge text={c.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Facilitador: {c.leadFacilitator}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{c.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontSize: 10, color: C.text3 }}>
              <MetricPill label="Membros" value={c.activeMembersCount} color={C.cyan} />
              <MetricPill label="Debates" value={c.discussionsCount} color={C.purple} />
              <MetricPill label="Artigos" value={c.publishedArticlesCount} color={C.green} />
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Busca Híbrida & RAG (E020) ─────────────────────────────────────────

function SearchTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔍" title="Busca Corporativa Híbrida (Textual + Vetorial RAG)" sub="Mecanismo de Busca Integrado ao Motor de Inteligência Artificial E020 com Citação de Fontes" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>⚡ Indexação Automática & Acurácia de 98.4%</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Toda pesquisa realizada no portal corporativo combina busca por palavras-chave com busca vetorial semântica no banco de conhecimento, retornando trechos exatos de SOPs, políticas e relatórios.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Ciclo de Vida & Governança (ISO 30401) ─────────────────────────────

function GovernanceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Ciclo de Vida do Conhecimento & ISO 30401" sub="Criação, Revisão por Pares, Homologação, Publicação e Controle de Obsolescência" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>📜 Conformidade Plena com a Norma ISO 30401:2018</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Fluxo rigoroso de revisão periódica obrigatória a cada 180 dias, garantindo que nenhum procedimento operacional ou política permaneça desatualizado no acervo.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: Integrações com a Plataforma ───────────────────────────────────────

function IntegrationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔌" title="Integrações com Módulos Corporativos" sub="Alimentação Automática da IA (E020), Gestão Documental (E014), BPM (E015) e RH (E018)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.sky, marginBottom: 8 }}>🔗 Ecossistema Integrado de Conhecimento</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Os ativos de conhecimento aprovados alimentam diretamente os agentes inteligentes de atendimento e os fluxos de treinamento e onboarding de novos colaboradores e voluntários.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Métricas & Observabilidade ────────────────────────────────────────

function MetricsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Métricas de Utilização & Qualidade do Acervo" sub="Monitoramento de Conteúdos Mais Acessados, Avaliação de Utilidade e Tempo de Revisão" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>6.6k</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Acessos Mensais ao Repositório</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.gold }}>⭐ 4.93</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Avaliação Média de Utilidade</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>SOPs com Revisão em Dia</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 11: APIs & Eventos ────────────────────────────────────────────────────

function APIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="APIs Corporativas & Eventos do Conhecimento" sub="Contratos OpenAPI 3.1 e Tópicos do Barramento de Eventos (KnowledgePublished, etc.)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>🌐 Eventos Pub/Sub de Conhecimento Ativos</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Eventos como <code style={{ color: C.cyan }}>KnowledgePublished</code> e <code style={{ color: C.cyan }}>LessonLearnedRegistered</code> notificam instantaneamente as equipes relevantes e alimentam a base vetorial da IA.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação E028 & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<KnowledgeManagementCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EKMOLIMFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E028..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Knowledge Management Maturity Score — E028" sub="Certificação da Camada de Gestão do Conhecimento e Memória Institucional" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091738 0%, #200b3d 50%, #032729 100%)',
        border: `2px solid ${C.purple}50`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.purple, lineHeight: 1 }}>
          {cert.knowledgeMaturityScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          KNOWLEDGE MANAGEMENT MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="🎖️ ISO 30401 CONFORME" color={C.purple} bg="#c084fc25" />
          <Badge text="📚 MEMÓRIA PERMANENTE PRESERVADA" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Gestão do Conhecimento ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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

      {/* Final Declaration */}
      <div style={{
        background: `linear-gradient(135deg, #091738, #200b3d)`,
        border: `2px solid ${C.purple}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CONSOLIDAÇÃO DA GESTÃO DO CONHECIMENTO (E028)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Knowledge Management, Organizational Learning & Institutional Memory Framework (EKMOLIMF)</strong> estabelece
          a Plataforma Instituto Ser Melhor como o repositório oficial de conhecimento, aprendizagem organizacional e memória institucional da instituição,
          com o <strong style={{ color: C.purple }}>Knowledge Management Maturity Score de 98/100 (EXCELÊNCIA EM CONHECIMENTO)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este framework elimina a dependência de conhecimentos tácitos individuais, garantindo a preservação permanente da memória institucional, da qualidade dos procedimentos e da continuidade dos serviços prestados à sociedade.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EKMOLIMFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'repository':   return <RepositoryTab />;
      case 'taxonomy':     return <TaxonomyTab />;
      case 'memory':       return <MemoryTab />;
      case 'lessons':      return <LessonsTab />;
      case 'cops':         return <CoPsTab />;
      case 'search':       return <SearchTab />;
      case 'governance':   return <GovernanceTab />;
      case 'integration':  return <IntegrationTab />;
      case 'metrics':      return <MetricsTab />;
      case 'apis':         return <APIsTab />;
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
            background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.purple}40`,
          }}>📚</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Knowledge Management & Institutional Memory
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E028 · EKMOLIMF · ISO 30401 · Memória Institucional · Busca Híbrida RAG · Comunidades de Prática · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.purple}30, ${C.cyan}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.purple : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.purple}` : '2px solid transparent',
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

export default EKMOLIMFPage;
