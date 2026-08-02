/**
 * EAGSDBFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E031 — ENTERPRISE ARCHITECTURE GOVERNANCE, STANDARDS &
 *         DIGITAL BLUEPRINT FRAMEWORK (EAGSDBF)
 * Instituto Ser Melhor — Prompt E031 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Architecture Command Tower — Painel Executivo da Arquitetura Corporativa
 *   2.  Princípios de Arquitetura — 12 Princípios Formais (Modularidade, Zero-Trust, XAI)
 *   3.  Digital Blueprint (8 Layers)— Arquitetura de Negócios, Aplicações, Dados, IA, etc.
 *   4.  Catálogo de Padrões       — APIs, Eventos, Microsserviços, DBs e UI Tokens
 *   5.  Repositório de ADRs       — Decisions Records (Contexto, Escolha, Rationale)
 *   6.  Governança de Mudanças (ARB)— Fluxo de Aprovação de Mudanças Arquiteturais (CAB)
 *   7.  Matriz de Dependências   — Mapeamento de Impacto e Dependências Intermódulos
 *   8.  Governança de IA & Dados  — Padrões ISO 42001, Human-in-the-Loop e Linhagem
 *   9.  Padrões Dev & Qualidade   — React 19, NestJS, TypeScript, DDD, Clean Arch
 *  10.  Avaliação de Conformidade — Motor Automático de Audit de Novos Módulos
 *  11.  Observabilidade & SLOs    — OpenTelemetry W3C, SLO 99.98% e Error Budgets
 *  12.  Certificação E031        — Architecture Governance Maturity Score 98/100
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EAGSDBFService,
  type EAGSDBFConsolidatedDashboard,
  type ArchitecturePrinciple,
  type ADR,
  type DigitalBlueprintLayerItem,
  type ComponentConformanceAssessment,
  type EnterpriseArchitectureCertification,
} from '../services/eagsdbfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02040c',
  bgCard:    '#060c1d',
  bgAlt:     '#0a1429',
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
  { id: 'tower',        icon: '🏛️', label: 'Architecture Tower' },
  { id: 'principles',   icon: '📜', label: '12 Princípios' },
  { id: 'blueprint',    icon: '🗺️', label: 'Digital Blueprint (8L)' },
  { id: 'standards',    icon: '⚙️', label: 'Catálogo de Padrões' },
  { id: 'adrs',         icon: '📝', label: 'Repositório ADRs' },
  { id: 'change_board', icon: '⚖️', label: 'Governança ARB/CAB' },
  { id: 'dependencies', icon: '🔗', label: 'Matriz Dependências' },
  { id: 'ai_data_gov',  icon: '🧠', label: 'Governança IA & Dados' },
  { id: 'dev_standards',icon: '💻', label: 'Padrões Dev & DDD' },
  { id: 'conformance',  icon: '✅', label: 'Avaliação Conformidade' },
  { id: 'observability',icon: '📡', label: 'Observabilidade SLOs' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E031' },
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

// ── TAB 1: Architecture Command Tower ─────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EAGSDBFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Architecture Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051a3a 0%, #1e0b3c 50%, #03282b 100%)',
        border: `2px solid ${C.cyan}50`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden', boxShadow: `0 0 28px ${C.cyan}20`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🏛️</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Architecture Governance & Digital Blueprint Tower (E031)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Governança de Arquitetura Corporativa · TOGAF 10 · Digital Blueprint 8 Layers · ADRs · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.cyan }}>{d.architectureGovernanceMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Architecture Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📜', label: 'Princípios Formais', value: d.totalPrinciplesDefinedCount, color: C.cyan },
            { icon: '📝', label: 'ADRs Aprovadas', value: d.activeADRsCount, color: C.purple },
            { icon: '🗺️', label: 'Camadas do Blueprint', value: `${d.totalBlueprintLayersCount} Camadas`, color: C.gold },
            { icon: '⚙️', label: 'Aderência a Padrões', value: `${d.globalStandardsAdherencePct}%`, color: C.green },
            { icon: '✅', label: 'Status Conformidade', value: '100% CONFORME', color: C.emerald },
            { icon: '🏛️', label: 'Comitê ARB/CAB', value: 'ATIVO PERMANENTE', color: C.sky },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🏛️ Maturidade da Arquitetura Corporativa</div>
          <ScoreBar label="Digital Blueprint (8 Camadas)" value={99} color={C.green} />
          <ScoreBar label="Repositório de ADRs & Rationale" value={98} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Aderência ao TOGAF 10</span>
            <span style={{ color: C.green, fontWeight: 800 }}>100% Auditado</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>✅ Avaliação de Conformidade de Módulos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Módulos Avaliados (E005–E031)</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Motor Automático de Audit</div>
              </div>
              <Badge text="27 MÓDULOS" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Não Conformidades Críticas</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Zero Dívida Crítica</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>0</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Padrões & Normas Estruturantes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'TOGAF 10 & Zachman EA Framework', status: 'CONFORME', color: C.green },
              { label: 'DDD / CQRS / Clean Architecture', status: 'CONFORME', color: C.green },
              { label: 'ISO 42001 Responsible AI Architecture', status: 'CONFORME', color: C.green },
              { label: 'OpenTelemetry W3C Tracing Standard', status: 'CONFORME', color: C.green },
              { label: 'ISO 27001 Zero-Trust Architecture', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Princípios de Arquitetura ──────────────────────────────────────────

function PrinciplesTab() {
  const [principles, setPrinciples] = useState<ArchitecturePrinciple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getPrinciples().then(res => { setPrinciples(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Princípios de Arquitetura..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="12 Princípios Formais de Arquitetura Corporativa" sub="Diretrizes Estruturantes para Desenvolvimento, Segurança, Dados, IA e Operações" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {principles.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text="OBRIGATÓRIO" color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.name}</div>
            <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.5, marginBottom: 10 }}>{p.statement}</p>

            <div style={{ fontSize: 10, color: C.text3 }}>Justificativa: {p.rationale}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Digital Blueprint (8 Camadas) ──────────────────────────────────────

function BlueprintTab() {
  const [blueprint, setBlueprint] = useState<DigitalBlueprintLayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getBlueprint().then(res => { setBlueprint(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Digital Blueprint..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🗺️" title="Digital Blueprint Corporativo (8 Camadas)" sub="Mapeamento Completo da Arquitetura de Negócios, Aplicações, Dados, IA, Segurança e Observabilidade" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {blueprint.map(b => (
          <DarkCard key={b.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: C.cyan }}>{b.title}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{b.maturityScore}%</span>
            </div>

            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Arquiteto Responsável: {b.ownerArchitect}</div>

            <ScoreBar label="Maturidade da Camada" value={b.maturityScore} color={C.green} />

            <div style={{ fontSize: 10, color: C.text3, marginTop: 8 }}>
              Componentes: {b.componentsList.join(', ')}
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Catálogo de Padrões ────────────────────────────────────────────────

function StandardsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚙️" title="Catálogo Oficial de Padrões Tecnológicos" sub="Padrões Obrigatórios de APIs (OpenAPI 3.1), Eventos (AsyncAPI 3.0), Auth (OAuth 2.1) e UI Tokens" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>⚙️ Padronização Tecnológica Institucional</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Todos os microsserviços utilizam JSON/REST, GraphQL e Protobuf/gRPC com autenticação mTLS e OAuth 2.1 PKCE, garantindo interoperabilidade entre módulos e parceiros externos (E021).
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 5: Repositório de ADRs ────────────────────────────────────────────────

function ADRsTab() {
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getADRs().then(res => { setAdrs(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Repositório de ADRs..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📝" title="Repositório de Architecture Decision Records (ADRs)" sub="Registro de Decisões Estruturantes, Contexto, Alternativas Consideradas e Justificativas (Nygard Model)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {adrs.map(a => (
          <DarkCard key={a.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{a.code}</span>
              <Badge text={a.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Arquiteto Autor: {a.authorArchitect} · Data: {a.approvedAt}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}><strong>Decisão:</strong> {a.decisionOutcome}</p>

            <div style={{ fontSize: 10, color: C.emerald }}>Justificativa: {a.rationale}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Governança de Mudanças (ARB / CAB) ─────────────────────────────────

function ChangeBoardTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Comitê de Arquitetura (ARB / CAB)" sub="Fluxo de Submissão, Parecer Técnico e Aprovação de Alterações de Grande Impacto Arquitetural" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 8 }}>⚖️ Arquitetura como Função Permanente de Governança</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Nenhuma alteração que afete contratos de APIs, bancos de dados centrais ou esquemas de segurança pode ser implantada sem homologação formal pelo ARB.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 7: Matriz de Dependências ─────────────────────────────────────────────

function DependenciesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔗" title="Matriz de Dependências & Análise de Impacto" sub="Mapeamento Fim-a-Fim de Interdependências entre Módulos, APIs e Bancos de Dados" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>🔗 Grafo Completo de Dependências do Ecossistema</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Mapeamento automatizado que prevê o impacto em cascata antes de qualquer refatoração ou atualização de microsserviço.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Governança de IA & Dados (ISO 42001) ───────────────────────────────

function AIDataGovTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧠" title="Governança de IA (ISO 42001) & Dados Corporativos" sub="Padrões de Explicabilidade RAG, Linhagem de Dados, Anonimização LGPD e Human-in-the-Loop" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>🤖 Arquitetura de IA Responsável Auditável</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          A camada de IA (E020/E030) opera 100% isolada e orientada por contratos explicáveis, garantindo que todas as inferências possuam rastreabilidade e validação humana.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: Padrões Dev & DDD ──────────────────────────────────────────────────

function DevStandardsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="💻" title="Padrões de Desenvolvimento, DDD & Clean Architecture" sub="Diretrizes Obrigatórias de Código para React 19, Next.js, NestJS, TypeScript e CQRS" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.sky, marginBottom: 8 }}>💻 Padrões de Código Homologados</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Código TypeScript fortemente tipado, 2-file architecture por módulo corporativo (Service + Page UI), sem bibliotecas CSS externas genéricas e sem dívida técnica crítica.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Avaliação de Conformidade Automática ───────────────────────────────

function ConformanceTab() {
  const [assessments, setAssessments] = useState<ComponentConformanceAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getAssessments().then(res => { setAssessments(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Avaliações de Conformidade..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="✅" title="Motor Automático de Avaliação de Conformidade" sub="Auditoria Automática de Novos Módulos em 12 Pilares Arquiteturais Antes da Aprovação" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {assessments.map(a => (
          <DarkCard key={a.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{a.componentCode}</span>
              <Badge text={a.conformanceStatus} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{a.componentName}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Avaliado por: {a.evaluatedByArchitect} em {a.evaluatedAt.substring(0,10)}</div>

            <ScoreBar label="Pilares Conformes" value={a.compliantPillarsCount} max={a.evaluatedPillarsCount} color={C.green} />

            <div style={{ fontSize: 10, color: C.text3 }}>Plano de Ação: {a.remediationActionPlan}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 11: Observabilidade & SLOs ────────────────────────────────────────────

function ObservabilityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📡" title="Observabilidade Corporativa & SLOs" sub="Padrão OpenTelemetry W3C Trace Context, SLO de 99.98% e Gestão de Error Budgets" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>99.98%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>SLO de Disponibilidade</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>32 ms</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Latência P95 do Gateway</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Traces OpenTelemetry Ativos</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 12: Certificação E031 & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EnterpriseArchitectureCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EAGSDBFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E031..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Enterprise Architecture Governance Maturity Score — E031" sub="Certificação da Governança Permanente de Arquitetura e Digital Blueprint Corporativo" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051a3a 0%, #1e0b3c 50%, #03282b 100%)',
        border: `2px solid ${C.cyan}50`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
        boxShadow: `0 0 36px ${C.cyan}25`,
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.cyan, lineHeight: 1 }}>
          {cert.architectureGovernanceMaturityScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          ARCHITECTURE GOVERNANCE MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="🎖️ TOGAF 10 CONFORME" color={C.cyan} bg="#06b6d425" />
          <Badge text="🗺️ BLUEPRINT 8 CAMADAS APERFEIÇOADO" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Governança de Arquitetura ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #051a3a, #1e0b3c)`,
        border: `2px solid ${C.cyan}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CONSOLIDAÇÃO DA GOVERNANÇA DE ARQUITETURA (E031)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Architecture Governance, Standards & Digital Blueprint Framework (EAGSDBF)</strong> estabelece a Arquitetura Corporativa como uma função permanente de governança da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>,
          com o <strong style={{ color: C.cyan }}>Architecture Governance Maturity Score de 98/100 (EXCELÊNCIA EM ARQUITETURA)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este framework garante que toda evolução tecnológica futura preserve o alinhamento com a missão institucional, a segurança Zero-Trust, a observabilidade OpenTelemetry e a sustentabilidade arquitetural da organização.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EAGSDBFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'principles':   return <PrinciplesTab />;
      case 'blueprint':    return <BlueprintTab />;
      case 'standards':    return <StandardsTab />;
      case 'adrs':         return <ADRsTab />;
      case 'change_board': return <ChangeBoardTab />;
      case 'dependencies': return <DependenciesTab />;
      case 'ai_data_gov':  return <AIDataGovTab />;
      case 'dev_standards':return <DevStandardsTab />;
      case 'conformance':  return <ConformanceTab />;
      case 'observability':return <ObservabilityTab />;
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
          }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Architecture Governance & Digital Blueprint
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E031 · EAGSDBF · TOGAF 10 · Digital Blueprint 8 Layers · ADRs · Clean Architecture · Instituto Ser Melhor
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

export default EAGSDBFPage;
