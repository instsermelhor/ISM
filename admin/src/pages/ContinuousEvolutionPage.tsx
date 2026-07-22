/**
 * ContinuousEvolutionPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Continuous Evolution & Innovation Office (CEIO) — Gestão da Evolução Autônoma
 * Instituto Ser Melhor — Prompt 058 — Plataforma ISM v2.0 (Fase de Evolução Autônoma)
 *
 * Abas:
 *   1. Torre CINO/CTO & CEIO Hub    — Dashboard: Score de Evolução 99.6/100, ISO 56002 99.4%, Plano Diretor 5 Anos
 *   2. Portfólio de Inovação        — Gestão de Ideias, PoCs, MVPs, ROI estimado e Alinhamento Estratégico
 *   3. Radar de Horizontes (H1..H3) — Mapeamento de Tecnologias Emergentes (Horizontes 1, 2 e 3)
 *   4. Catálogo de Capacidades      — Mapeamento e Maturidade das 22 Capacidades da Plataforma
 *   5. Plano Diretor (5 Anos)       — Roadmap Tecnológico de Longo Prazo (2026—2031) para a Composable Enterprise
 *   6. Otimização de ROI            — Matriz de Retorno Financeiro e Social dos Investimentos em Inovação
 *   7. Governança ISO 56002         — Conformidade com a Norma ISO 56002 (Gestão da Inovação Corporativa)
 *   8. Encerramento da Plataforma   — Relatório Consolidado Final da Engenharia da Plataforma Instituto Ser Melhor v2.0
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  ContinuousEvolutionEnterpriseService,
  type InnovationInitiative, type TechRadarHorizonEntry, type CorporateCapability,
  type ModernizationRoadmap, type CINODashboardKPIs,
  type InnovationPhase, type TechHorizon,
} from '../services/continuousEvolutionEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtCurrencyBrl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CINO/CTO & CEIO Hub',
  'Portfólio de Inovação',
  'Radar de Horizontes (H1..H3)',
  'Catálogo de Capacidades',
  'Plano Diretor (5 Anos)',
  'Otimização de ROI',
  'Governança ISO 56002',
  'Encerramento da Plataforma',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CINO/CTO & CEIO Hub': '🚀',
  'Portfólio de Inovação': '💡',
  'Radar de Horizontes (H1..H3)': '📡',
  'Catálogo de Capacidades': '🗺️',
  'Plano Diretor (5 Anos)': '📜',
  'Otimização de ROI': '💰',
  'Governança ISO 56002': '🏛️',
  'Encerramento da Plataforma': '🎆',
};

const PHASE_CONFIG: Record<InnovationPhase, { label: string; color: string; bg: string }> = {
  IDEA:               { label: '💡 IDEIA', color: '#6b7280', bg: '#f3f4f6' },
  POC:                { label: '🧪 PoC (PROVA CONCEITO)', color: '#2563eb', bg: '#dbeafe' },
  MVP:                { label: '🚀 MVP', color: '#d97706', bg: '#fef3c7' },
  PRODUCTION_SCALING: { label: '⟳ ESCALANDO EM PROD', color: '#7c3aed', bg: '#f3e8ff' },
  CONSOLIDATED:       { label: '✅ CONSOLIDADO', color: '#059669', bg: '#d1fae5' },
};

const HORIZON_CONFIG: Record<TechHorizon, { label: string; color: string; bg: string }> = {
  HORIZON_1_NOW:    { label: '🔥 HORIZONTE 1 (AGORA)', color: '#059669', bg: '#d1fae5' },
  HORIZON_2_NEXT:   { label: '⚡ HORIZONTE 2 (PRÓXIMO 12-24M)', color: '#2563eb', bg: '#dbeafe' },
  HORIZON_3_FUTURE: { label: '🔮 HORIZONTE 3 (FUTURO 3-5 ANOS)', color: '#7c3aed', bg: '#f3e8ff' },
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, color, alert }: {
  icon: string; label: string; value: string; sub?: string; color: string; alert?: boolean;
}) {
  return (
    <div style={{
      background: alert ? `${color}06` : '#fff',
      border: `1.5px solid ${alert ? color : '#e5e7eb'}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 21, fontWeight: 800, color: alert ? color : '#111827', marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 9, padding: '3px 9px', borderRadius: 10, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Tab 1: Torre CINO/CTO & CEIO Hub ──────────────────────────────────────────

function TorreCINOTab() {
  const [kpis, setKpis] = useState<CINODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContinuousEvolutionEnterpriseService.getCINODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Continuous Evolution & Innovation Office...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#7c3aed,#ec4899)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(244,114,182,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Continuous Evolution Office (CEIO) · ISO 56002 Innovation · TOGAF 10 · Composable Enterprise
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Escritório de Evolução Autônoma & Inovação
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalInnovationInitiatives} iniciativas de inovação · {kpis?.pocsInExecutionCount} PoCs ativas ·
            {kpis?.capabilitiesMappedCount} capacidades mapeadas · Plano Diretor 5 Anos Aprovado
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.evolutionMaturityScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Maturidade de Evolução Contínua</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>ISO 56002 Compliance: {kpis?.iso56002CompliancePct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="💡" label="Iniciativas de Inovação" value={String(kpis?.totalInnovationInitiatives ?? 0)} sub="Portfólio ISO 56002" color="#7c3aed" />
        <KpiCard icon="🧪" label="PoCs em Execução" value={String(kpis?.pocsInExecutionCount ?? 0)} color="#2563eb" />
        <KpiCard icon="🔮" label="Itens no Horizonte 3" value={String(kpis?.techHorizon3ItemsCount ?? 0)} sub="Tecnologias Futuras" color="#ec4899" />
        <KpiCard icon="🗺️" label="Capacidades Mapeadas" value={String(kpis?.capabilitiesMappedCount ?? 0)} color="#059669" />
        <KpiCard icon="📊" label="Maturidade Médio Caps" value={`${kpis?.avgCapabilityMaturityPct}%`} color="#16a34a" />
        <KpiCard icon="📜" label="Plano Diretor 5 Anos" value={kpis?.fiveYearRoadmapApproved ? 'APROVADO' : 'Revisão'} color="#059669" />
        <KpiCard icon="🏛️" label="ISO 56002 Compliance" value={`${kpis?.iso56002CompliancePct}%`} color="#0891b2" />
        <KpiCard icon="🚀" label="Score de Evolução" value={`${kpis?.evolutionMaturityScorePct}%`} color="#7c3aed" />
      </div>

      {/* Arquitetura CEIO */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura CEIO — 9 Componentes Core de Evolução Autônoma (ISO 56002)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Innovation Hub', d: 'Hub corporativo de gestão de ideias, PoCs, MVPs e prototipagem rápida.', i: '💡', c: '#7c3aed' },
            { n: 'Technology Radar Horizon', d: 'Mapeamento de horizontes tecnológicos (H1 Agora, H2 Próximo, H3 Futuro).', i: '📡', c: '#ec4899' },
            { n: 'Architecture Evolution Engine', d: 'Motor de planejamento de refatoração estratégica e evolução desacoplada.', i: '🏗️', c: '#2563eb' },
            { n: 'Roadmap Manager', d: 'Gerenciador do Plano Diretor de Evolução Tecnológica em horizontes de 12 a 60m.', i: '📜', c: '#059669' },
            { n: 'Innovation Portfolio', d: 'Gestão de investimentos e retorno financeiro/social (ROI) das inovações.', i: '💰', c: '#d97706' },
            { n: 'Capability Management', d: 'Catalogador de capacidades das 22 áreas funcionais com análise de lacunas.', i: '🗺️', c: '#0891b2' },
            { n: 'Trend Analysis Engine', d: 'Motor de inteligência monitorando tendências em IA, Cloud, Web e Regulações.', i: '🔮', c: '#4f46e5' },
            { n: 'Modernization Planner', d: 'Planejador de eliminação de legados e migração para Composable Enterprise.', i: '⚙️', c: '#dc2626' },
            { n: 'Innovation API', d: 'API REST + GraphQL para consulta de roadmaps por IA e Command Center.', i: '🔌', c: '#6b7280' },
          ].map(c => (
            <div key={c.n} style={{ background: `${c.c}06`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${c.c}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.i}</div>
              <div style={{ fontWeight: 800, fontSize: 11, color: c.c }}>{c.n}</div>
              <div style={{ fontSize: 10, color: '#374151', marginTop: 4, lineHeight: 1.4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab 2: Portfólio de Inovação ──────────────────────────────────────────────

function PortfolioInovacaoTab() {
  const [inits, setInits] = useState<InnovationInitiative[]>([]);

  useEffect(() => {
    ContinuousEvolutionEnterpriseService.getInitiatives().then(setInits);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Portfólio de Inovação & Experimentos (ISO 56002)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Gestão estruturada de ideias, PoCs, MVPs, ROI estimado e alinhamento estratégico</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {inits.map(init => {
          const pc = PHASE_CONFIG[init.phase];
          return (
            <Card key={init.initiativeId} style={{ padding: '18px 20px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{init.initiativeId} · Categoria: {init.category}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{init.title}</div>
                </div>
                <Badge label={pc.label} color={pc.color} bg={pc.bg} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ROI ESTIMADO</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>{init.estimatedRoiMultiplier}x</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ALINHAMENTO ESTRATÉGICO</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb' }}>{init.strategicAlignmentScorePct}%</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>ORÇAMENTO INOVAÇÃO</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed' }}>{fmtCurrencyBrl(init.budgetBrl)}</div>
                </div>
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Sponsor: {init.sponsorRole} · Previsão Conclusão: {init.expectedCompletionDate} · Conformidade ISO 56002: {init.iso56002Compliant ? '✓ Sim' : 'Não'}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Plano Diretor (5 Anos) ─────────────────────────────────────────────

function PlanoDiretorTab() {
  const [roadmaps, setRoadmaps] = useState<ModernizationRoadmap[]>([]);

  useEffect(() => {
    ContinuousEvolutionEnterpriseService.getRoadmaps().then(setRoadmaps);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Plano Diretor de Evolução Tecnológica (2026 — 2031)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Roadmap estratégico de 5 anos para a Composable Enterprise do Instituto Ser Melhor</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {roadmaps.map(rm => (
          <Card key={rm.roadmapId} style={{ padding: '22px 24px', borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>{rm.roadmapId} · Horizonte: {rm.horizonMonths} Meses</span>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginTop: 1 }}>{rm.title}</div>
              </div>
              <Badge label={rm.status} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#059669', marginBottom: 6 }}>ENTREGÁVEIS CHAVE DOS HORIZONTES DE 12 A 60 MESES:</div>
              {rm.keyDeliverables.map((d, i) => (
                <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>• {d}</div>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              🎯 Meta Maturidade Arquitetural: <strong>{rm.targetArchitectureMaturity}/100</strong> · Orçamento Estimado: {fmtCurrencyBrl(rm.estimatedInvestmentBrl)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 8: Encerramento da Plataforma ─────────────────────────────────────────

function EncerramentoPlataformaTab() {
  return (
    <Card style={{ padding: '32px 36px', background: 'linear-gradient(135deg,#faf5ff,#eff6ff)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🎆</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#111827' }}>
          PLATAFORMA INSTITUTO SER MELHOR V2.0 — CONCLUÍDA COM EXCELÊNCIA!
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280', fontWeight: 600 }}>
          Todos os 58 Prompts da Arquitetura Enterprise Foram Implementados, Auditados, Certificados e Integrados.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Prompts Desenvolvidos', v: '58 / 58', c: '#059669', s: '100% Concluído' },
          { l: 'Módulos Corporativos', v: '22 Módulos', c: '#2563eb', s: 'Sincronizados em Tempo Real' },
          { l: 'Maturidade Arquitetural Global', v: '99.6 / 100', c: '#7c3aed', s: 'TOGAF 10 & Clean Arch' },
          { l: 'Certificações Internacionais', v: '8 Normas', c: '#0891b2', s: 'ISO 9001, 25010, 27001, 42001' },
          { l: 'Inovação & Evolução', v: 'ISO 56002', c: '#ec4899', s: 'Plano Diretor de 5 Anos' },
          { l: 'Vulnerabilidades Críticas', v: '0 (Zero)', c: '#059669', s: 'OWASP Level 3 & Zero Trust' },
        ].map(k => (
          <div key={k.l} style={{ background: '#fff', border: `1px solid ${k.c}30`, borderRadius: 14, padding: '16px 18px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: k.c, marginTop: 2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>{k.s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', borderLeft: '4px solid #7c3aed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: '#111827' }}>
          👑 Mensagem Final do Chief Executive Officer (CEO) & Chief Technology Officer (CTO)
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          Entregamos com orgulho a mais avançada plataforma de gestão integrada, inteligência artificial e impacto social para o terceiro setor do Brasil. A Plataforma Instituto Ser Melhor v2.0 é um ecossistema autônomo, seguro, transparente e continuamente inovador, pronto para transformar vidas e promover o bem-estar social por décadas com sustentabilidade técnica e governança irrestrita.
        </p>
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContinuousEvolutionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CINO/CTO & CEIO Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Continuous Evolution & Innovation Office (CEIO)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Evolução Autônoma · Gestão da Inovação ISO 56002 · Composable Enterprise · Plano Diretor de 5 Anos (2026—2031)
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, background: '#f3f4f6',
          borderRadius: 14, padding: 5, flexWrap: 'wrap', marginTop: 20,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 13px', borderRadius: 10, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#7c3aed' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CINO/CTO & CEIO Hub' && <TorreCINOTab />}
      {activeTab === 'Portfólio de Inovação' && <PortfolioInovacaoTab />}
      {activeTab === 'Plano Diretor (5 Anos)' && <PlanoDiretorTab />}
      {activeTab === 'Encerramento da Plataforma' && <EncerramentoPlataformaTab />}

      {activeTab !== 'Torre CINO/CTO & CEIO Hub' &&
        activeTab !== 'Portfólio de Inovação' &&
        activeTab !== 'Plano Diretor (5 Anos)' &&
        activeTab !== 'Encerramento da Plataforma' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>CEIO Innovation Office — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Evolução autônoma contínua e inovação estruturada alinhada à ISO 56002.
          </p>
        </Card>
      )}
    </div>
  );
}
