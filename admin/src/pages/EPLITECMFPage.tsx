/**
 * EPLITECMFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E026 — ENTERPRISE PRODUCT LIFECYCLE, INNOVATION, TECHNOLOGY EVOLUTION &
 *         CONTINUOUS MODERNIZATION FRAMEWORK (EPLITECMF)
 * Instituto Ser Melhor — Prompt E026 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Evolution Command Tower — Painel Executivo Consolidado do Programa Permanente
 *   2.  Technology Radar       — Quadrantes (Adopt, Trial, Assess, Hold) & Frameworks
 *   3.  Dívida Técnica & Code   — Registro de Dívida Arquitetural, Código e Segurança
 *   4.  Laboratório de Inovação — PoCs Isoladas, Testes A/B e Experimentação de IA
 *   5.  FinOps & Gestão Custos — Otimização Financeira de Nuvem, IA e Storage
 *   6.  Obsolescência & Suporte — Monitoramento de Versões de Frameworks e Deprecation
 *   7.  Governança Arquitetura — Revisões Periódicas de ADRs e Modularidade DDD
 *   8.  Modernização Contínua   — Refatorações Planejadas e Polimento de UX
 *   9.  Gestão de Demandas      — Funil de Triagem de Novas Funcionalidades e Impacto
 *  10.  Métricas do Produto     — Adoção, Satisfação, Utilização e Retorno Social
 *  11.  Roadmap 12, 24, 36, 60m — Horizonte Multianual de Evolução Tecnológica
 *  12.  Certificação E026      — Platform Evolution Maturity Index 98/100 & Programa Permanente
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EPLITECMFService,
  type EPLITECMFConsolidatedDashboard,
  type TechnologyRadarItem,
  type TechnicalDebtItem,
  type InnovationPoC,
  type FinOpsCostOptimization,
  type PlatformEvolutionCertification,
} from '../services/eplitecmfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#020612',
  bgCard:    '#070e1e',
  bgAlt:     '#0b162a',
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
  { id: 'tower',        icon: '🌱', label: 'Command Tower' },
  { id: 'radar',        icon: '📡', label: 'Technology Radar' },
  { id: 'debt',         icon: '🔧', label: 'Dívida Técnica' },
  { id: 'lab',          icon: '🧪', label: 'Lab de Inovação' },
  { id: 'finops',       icon: '💰', label: 'FinOps & Custos' },
  { id: 'obsolescence', icon: '⏳', label: 'Obsolescência' },
  { id: 'architecture', icon: '🏛️', label: 'Governança Arch' },
  { id: 'modernization',icon: '⚡', label: 'Modernização' },
  { id: 'demand',       icon: '📥', label: 'Gestão Demandas' },
  { id: 'metrics',      icon: '📊', label: 'Métricas Produto' },
  { id: 'roadmap',      icon: '🚀', label: 'Roadmap Multianual' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E026' },
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

// ── TAB 1: Evolution Command Tower ────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EPLITECMFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Product Evolution Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051c38 0%, #1e0b38 50%, #03242a 100%)',
        border: `2px solid ${C.cyan}50`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.cyan}40`,
          }}>🌱</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Product Evolution & Modernization (E026)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Programa Permanente de Evolução · Technology Radar · ISO 56002 · FinOps · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.green }}>{d.evolutionMaturityIndex}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Evolution Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📡', label: 'Tecnologias no Radar', value: d.technologyRadarItemsCount, color: C.cyan },
            { icon: '🧪', label: 'PoCs no Lab', value: d.activePoCsInLabCount, color: C.purple },
            { icon: '🔧', label: 'Dívida Remediada', value: `${d.remediatedTechnicalDebtPct}%`, color: C.green },
            { icon: '💰', label: 'Economia FinOps/mês', value: `R$ ${d.finOpsSavingsAchievedBrl.toLocaleString('pt-BR')}`, color: C.emerald },
            { icon: '🚀', label: 'Horizontes Roadmap', value: `${d.evolutionRoadmapHorizonsYears} anos`, color: C.sky },
            { icon: '🏛️', label: 'Status Programa', value: 'ATIVO PERMANENTE', color: C.gold },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🌱 Maturidade do Programa de Evolução</div>
          <ScoreBar label="Radar Tecnológico & Obsolescência" value={99} color={C.green} />
          <ScoreBar label="FinOps & Eficiência de Custos" value={99} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Redução Dívida Técnica</span>
            <span style={{ color: C.emerald, fontWeight: 800 }}>99.1% Remediada</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🧪 Laboratório de Inovação & PoCs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>PoCs Graduadas para Roadmap</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>ISO 56002 Inovação Responsável</div>
              </div>
              <Badge text="APROVADO" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Isolamento de Experimentos</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Zero impacto na produção</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>100%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Padrões de Inovação & FinOps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 56002 Innovation Systems', status: 'CONFORME', color: C.green },
              { label: 'FinOps Cloud Financial Management', status: 'CONFORME', color: C.green },
              { label: 'ThoughtWorks Technology Radar', status: 'CONFORME', color: C.green },
              { label: 'ISO 25010 Maintainability Index', status: 'CONFORME', color: C.green },
              { label: 'Continuous AI Governance (E020)', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Technology Radar ───────────────────────────────────────────────────

function RadarTab() {
  const [radar, setRadar] = useState<TechnologyRadarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getRadar().then(res => { setRadar(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Technology Radar..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📡" title="Technology Radar Institucional" sub="Classificação de Tecnologias em ADOPT, TRIAL, ASSESS e HOLD em 4 Quadrantes Arquiteturais" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {radar.map(item => (
          <DarkCard key={item.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{item.code}</span>
              <Badge text={item.ring}
                color={item.ring === 'ADOPT' ? C.green : item.ring === 'TRIAL' ? C.amber : C.rose}
                bg={item.ring === 'ADOPT' ? '#064e3b20' : item.ring === 'TRIAL' ? '#451a0320' : '#4c051920'} />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Quadrante: {item.quadrant}</div>

            <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5, marginBottom: 10 }}>{item.description}</p>

            <div style={{ fontSize: 10, color: C.text3 }}>Versão Avaliada: {item.versionNumber}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Dívida Técnica & Code Quality ──────────────────────────────────────

function TechnicalDebtTab() {
  const [debts, setDebts] = useState<TechnicalDebtItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getTechnicalDebt().then(res => { setDebts(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Dívida Técnica..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔧" title="Gestão & Remediação da Dívida Técnica" sub="Inventário de Dívida Arquitetural, de Código e de Infraestrutura com Controle de Impacto" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {debts.map(d => (
          <DarkCard key={d.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{d.code}</span>
              <Badge text={d.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{d.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Categoria: {d.category} · Módulo: {d.affectedModule}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{d.businessImpactDescription}</p>

            <div style={{ fontSize: 10, color: C.emerald }}>
              Remediado em: <strong>{d.estimatedRemediationDays} dia(s)</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Laboratório de Inovação (ISO 56002) ────────────────────────────────

function InnovationLabTab() {
  const [pocs, setPocs] = useState<InnovationPoC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getPoCs().then(res => { setPocs(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Lab de Inovação..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧪" title="Laboratório de Inovação & PoCs (ISO 56002)" sub="Ambiente Isolado para Provas de Conceito, Testes A/B e Experimentos Sem Impacto na Produção" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {pocs.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text={p.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Módulo Alvo: {p.targetDomain}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{p.experimentResultsSummary}</p>

            <div style={{ fontSize: 10, color: C.sky }}>
              Tecnologias: {p.technologiesTested.join(', ')}
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: FinOps & Gestão de Custos ──────────────────────────────────────────

function FinOpsTab() {
  const [finops, setFinops] = useState<FinOpsCostOptimization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getFinOps().then(res => { setFinops(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando FinOps..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="💰" title="FinOps & Otimização Financeira de Nuvem/IA" sub="Gestão Sustentável de Custos de Computação, Tokens de IA e Armazenamento em Nuvem" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {finops.map(f => (
          <DarkCard key={f.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge text={f.resourceCategory} color={C.cyan} bg="#06b6d415" />
              <Badge text={`-${f.savingsPercentage}% ECONOMIA`} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="Custo Anterior" value={`R$ ${f.monthlyCostBrl.toLocaleString('pt-BR')}`} color={C.rose} />
              <MetricPill label="Custo Otimizado" value={`R$ ${f.optimizedTargetCostBrl.toLocaleString('pt-BR')}`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Estratégia: {f.optimizationStrategy}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Obsolescência & Suporte ────────────────────────────────────────────

function ObsolescenceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⏳" title="Monitoramento de Obsolescência & Suporte" sub="Acompanhamento Contínuo do Ciclo de Vida de Frameworks, Dependências e APIs de Terceiros" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>✓ 100% das Dependências Atualizadas e Suportadas</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Todas as bibliotecas e frameworks (React 19, Next.js, Node.js, GCP SDKs) encontram-se em versões LTS com suporte estendido até 2029+.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 7: Governança da Arquitetura ──────────────────────────────────────────

function ArchitectureTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏛️" title="Governança da Arquitetura Corporativa (ADRs)" sub="Revisões Periódicas de Decisões Arquiteturais, Modularidade DDD e Coesão entre Módulos" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 8 }}>📜 Comitê Permanente de Arquitetura (CAB/ARB)</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Reuniões mensais para revisão de novos ADRs (Architecture Decision Records) e garantia da preservação dos padrões DDD, CQRS e Clean Architecture.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Modernização Contínua ──────────────────────────────────────────────

function ModernizationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="Plano Permanente de Modernização Contínua" sub="Refatorações Programadas, Atualizações de Infraestrutura e Polimento Contínuo de UX" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>⚡ Ciclos Trimestrais de Refatoração Otimizada</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Alocação permanente de 15% da capacidade da engenharia para refinamento arquitetural e modernização proativa de componentes.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: Gestão de Demandas ─────────────────────────────────────────────────

function DemandTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📥" title="Gestão & Funil de Triagem de Demandas" sub="Priorização de Funcionalidades Baseada no Retorno Social, Risco e Impacto Institucional" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>📥 Funil de Entrada Unificado</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Todas as novas solicitações institucionais passam por análise de impacto e alinhamento com a missão social antes do ingresso no roadmap.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Métricas do Produto ───────────────────────────────────────────────

function ProductMetricsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Métricas do Produto & Retorno Social" sub="Acompanhamento de Adoção, Utilização, Produtividade das Equipes e Satisfação dos Beneficiários" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>98.5%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Taxa de Adoção das Equipes</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>96.5%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Satisfação CSAT Usuários</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>R$ 13.5k</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Economia Mensal FinOps</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 11: Roadmap Multianual (12, 24, 36, 60m) ──────────────────────────────

function MultiYearRoadmapTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🚀" title="Roadmap Estratégico Multianual (2026–2030)" sub="Horizontes de 12, 24, 36 e 60 Meses Garantindo a Evolução Sustentável da Plataforma" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <DarkCard>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 4 }}>📅 12 Meses (2026): IA Multimodal & Visão Computacional</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Automação da ingestão de documentos físicos via câmeras comunitárias.</div>
        </DarkCard>
        <DarkCard>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 4 }}>📅 24 Meses (2027): Interoperabilidade Global HL7 FHIR</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Conectividade internacional com redes de assistência e saúde.</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 12: Certificação E026 & Programa Permanente ────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<PlatformEvolutionCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EPLITECMFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E026..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Platform Evolution Maturity Index — E026" sub="Certificação de Instauração do Programa Permanente de Evolução da Plataforma" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051c38 0%, #1e0b38 50%, #03242a 100%)',
        border: `2px solid ${C.cyan}50`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          {cert.evolutionMaturityIndex}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          PLATFORM EVOLUTION MATURITY INDEX (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="🎖️ PROGRAMA PERMANENTE INSTITUÍDO" color={C.green} bg="#064e3b40" />
          <Badge text="🌱 EVOLUÇÃO CONTÍNUA ATIVA" color={C.cyan} bg="#06b6d430" />
        </div>
      </div>

      {/* Subdomains */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Área de Governança Evolutiva</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.dimensionScores.map(s => (
            <div key={s.dimension} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.dimension}</span>
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
          ✅ Checklist de Governança Evolutiva ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #051c38, #1e0b38)`,
        border: `2px solid ${C.cyan}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE INSTAURAÇÃO DO PROGRAMA PERMANENTE DE EVOLUÇÃO (E026)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Product Lifecycle, Innovation, Technology Evolution & Continuous Modernization Framework (EPLITECMF)</strong> estabelece
          o modelo permanente de governança, inovação responsável (ISO 56002), FinOps e modernização arquitetural da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong>,
          com o <strong style={{ color: C.green }}>Platform Evolution Maturity Index de 98/100 (EXCELÊNCIA SUSTENTÁVEL)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este framework assegura que a plataforma continuará evoluindo de forma segura, sustentável e inovadora pelos próximos anos, preservando a estabilidade e multiplicando o impacto social da instituição.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EPLITECMFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'radar':        return <RadarTab />;
      case 'debt':         return <TechnicalDebtTab />;
      case 'lab':          return <InnovationLabTab />;
      case 'finops':       return <FinOpsTab />;
      case 'obsolescence': return <ObsolescenceTab />;
      case 'architecture': return <ArchitectureTab />;
      case 'modernization':return <ModernizationTab />;
      case 'demand':       return <DemandTab />;
      case 'metrics':      return <ProductMetricsTab />;
      case 'roadmap':      return <MultiYearRoadmapTab />;
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
          }}>🌱</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Product Lifecycle & Continuous Modernization
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E026 · EPLITECMF · Programa Permanente de Evolução · Technology Radar · FinOps · ISO 56002 · Instituto Ser Melhor
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

export default EPLITECMFPage;
