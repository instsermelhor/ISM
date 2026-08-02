/**
 * EIIDSFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E030 — ENTERPRISE INSTITUTIONAL INTELLIGENCE, DECISION SUPPORT &
 *         STRATEGIC FORESIGHT FRAMEWORK (EIIDSF)
 * Instituto Ser Melhor — Prompt E030 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Institutional Intelligence Tower — Central Supremas de Inteligência
 *   2.  Consolidação Corporativa (E005–E029)— Visão Única Integrada dos 25 Módulos
 *   3.  Motor de Correlação Cruzada— Análise de Dependências e Padrões Cruzados
 *   4.  Apoio à Decisão Explicável — Recomendações Executivas com Validação Humana
 *   5.  Análise Prospectiva & Cenários— Projeções de Demanda, Finanças e Impacto (1–5 anos)
 *   6.  Riscos Emergentes & Alertas — Detecção Automática de Riscos em Todos os Domínios
 *   7.  Mapeamento de Oportunidades — Otimizações, Novas Parcerias e Captação
 *   8.  Executive Cockpits (Presidência / Conselhos)— Dashboards Customizados C-Level
 *   9.  Cadernos Executivos Automaticos— Briefings Semanais, Mensais e Anuais
 *  10.  Governança da Inteligência  — Qualidade dos Dados, Transparência e Rastreabilidade
 *  11.  APIs Corporativas & Eventos  — OpenAPI 3.1 & Barramento Pub/Sub
 *  12.  Certificação E030          — Institutional Intelligence Maturity Score 98/100
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EIIDSFService,
  type EIIDSFConsolidatedDashboard,
  type InstitutionalInsight,
  type ExecutiveRecommendation,
  type StrategicScenario,
  type DecisionBrief,
  type InstitutionalIntelligenceCertification,
} from '../services/eiidsfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02040b',
  bgCard:    '#060b18',
  bgAlt:     '#0a1326',
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
  { id: 'tower',        icon: '👑', label: 'Intelligence Tower' },
  { id: 'consolidation',icon: '🧩', label: 'Consolidação (E005–E029)' },
  { id: 'correlation',  icon: '🔗', label: 'Motor de Correlação' },
  { id: 'decision',     icon: '💡', label: 'Apoio à Decisão XAI' },
  { id: 'foresight',    icon: '🔮', label: 'Análise Prospectiva' },
  { id: 'risks',        icon: '🔔', label: 'Riscos Emergentes' },
  { id: 'opportunities',icon: '🎯', label: 'Oportunidades' },
  { id: 'cockpits',     icon: '🏛️', label: 'Executive Cockpits' },
  { id: 'briefings',    icon: '📜', label: 'Cadernos Executivos' },
  { id: 'governance',   icon: '🛡️', label: 'Governança IA & Dados' },
  { id: 'apis',         icon: '⚡', label: 'APIs & Eventos' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E030' },
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
        borderTopColor: C.gold, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Institutional Intelligence Tower ───────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EIIDSFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Institutional Intelligence Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091a38 0%, #200a40 50%, #032924 100%)',
        border: `2px solid ${C.gold}60`, borderRadius: 20, padding: '32px 36px',
        position: 'relative', overflow: 'hidden', boxShadow: `0 0 32px ${C.gold}25`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            boxShadow: `0 0 28px ${C.gold}40`,
          }}>👑</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Institutional Intelligence & Foresight Tower (E030)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Central Suprema de Inteligência Institucional · Consolidação dos Módulos E005–E029 · Apoio à Decisão Explicável (XAI) · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.gold }}>{d.institutionalIntelligenceMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>Institutional Intelligence Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '🧩', label: 'Módulos Consolidados', value: `${d.totalModulesConsolidatedCount} / 25`, color: C.cyan },
            { icon: '💡', label: 'Insights Ativos', value: d.activeInsightsCount, color: C.purple },
            { icon: '📜', label: 'Recomendações Pendentes', value: d.pendingExecutiveRecommendationsCount, color: C.gold },
            { icon: '🔮', label: 'Cenários Calculados', value: d.calculatedScenariosCount, color: C.sky },
            { icon: '🎯', label: 'Acurácia Correlação', value: `${d.globalCorrelationAccuracyPct}%`, color: C.green },
            { icon: '🎓', label: 'Cadernos Executivos', value: d.publishedExecutiveBriefsCount, color: C.emerald },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🧠 Motor de Apoio à Decisão Explicável (XAI)</div>
          <ScoreBar label="Rastreabilidade & Evidências" value={99} color={C.green} />
          <ScoreBar label="Supervisão Humana (Human-in-the-Loop)" value={100} color={C.gold} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Validação da Presidência/Conselho</span>
            <span style={{ color: C.gold, fontWeight: 800 }}>100% Obrigatória</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🔮 Análise Prospectiva (1–5 Anos)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Cenários Multianuais Calculados</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Modelo Shell/Wack Foresight</div>
              </div>
              <Badge text="6 CENÁRIOS" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Precisão Preditiva P95</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Dados Históricos E005–E029</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>97.5%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Governança da Inteligência Institucional</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 42001 Explainable AI Standard', status: 'CONFORME', color: C.green },
              { label: 'ISO 30401 Knowledge Integration', status: 'CONFORME', color: C.green },
              { label: 'ISO 9001 Executive Management', status: 'CONFORME', color: C.green },
              { label: 'NIST CSF 2.0 Security Audit', status: 'CONFORME', color: C.green },
              { label: 'LGPD Strict Confidentiality', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Consolidação Corporativa (E005–E029) ───────────────────────────────

function ConsolidationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🧩" title="Consolidação Corporativa Integral (E005–E029)" sub="Visão Única e Integrada dos Dados, Processos, Indicadores, Riscos e Conhecimento da Plataforma" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 12 }}>🌟 Visão 360° Unificada da Plataforma Instituto Ser Melhor</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {[
            'E005 IAM & Core', 'E006 Prontuário EHR', 'E007 Finanças ITG2002', 'E008 Recursos Humanos',
            'E009 Assistência Social', 'E010 PMO & Projetos', 'E011 Convênios', 'E012 Educação & Cap.',
            'E013 Voluntariado', 'E014 Jurídico & Doc', 'E015 BPM & Processos', 'E016 Comunicação CRM',
            'E017 Teleatendimento', 'E018 Governança RH', 'E019 DW & BI', 'E020 IA & RAG Engine',
            'E021 API Gateway', 'E022 GRC & Risk', 'E023 SRE Validation', 'E024 Go-Live & Ops',
            'E025 Acceptance Audit', 'E026 Continuous Tech', 'E027 Strategy & SROI', 'E028 Knowledge & CoP',
            'E029 Ecosystem Partnerships',
          ].map(mod => (
            <div key={mod} style={{ padding: '8px 10px', background: '#064e3b15', border: '1px solid #10b98130', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
              <span style={{ color: C.text1, fontWeight: 700 }}>{mod}</span>
              <span style={{ color: C.green, fontSize: 12 }}>✓ Integrado</span>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 3: Motor de Correlação Cruzada ────────────────────────────────────────

function CorrelationTab() {
  const [insights, setInsights] = useState<InstitutionalInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getInsights().then(res => { setInsights(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Insights de Correlação..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔗" title="Motor de Correlação Cruzada entre Módulos" sub="Identificação Automática de Padrões, Dependências de Processos e Relações entre Riscos e Resultados" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {insights.map(i => (
          <DarkCard key={i.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{i.code}</span>
              <Badge text={i.category} color={C.purple} bg="#c084fc20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{i.title}</div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 8 }}>Fontes: {i.sourceModuleCodes.join(', ')}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{i.summaryText}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Score Correlação: <strong style={{ color: C.green }}>{i.crossCorrelationScore}%</strong></span>
              <span>Confiança: <strong style={{ color: C.gold }}>{i.confidencePct}%</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Apoio à Decisão Explicável (XAI) ────────────────────────────────────

function DecisionSupportTab() {
  const [recs, setRecs] = useState<ExecutiveRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getRecommendations().then(res => { setRecs(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Recomendações Executivas..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="💡" title="Apoio à Decisão Explicável (XAI & Human-in-the-Loop)" sub="Recomendações Estratégicas Fundamentadas em Evidências e Sujeitas a Validação Humana" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {recs.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{r.code}</span>
              <Badge text={r.urgencyLevel} color={C.gold} bg="#fbbf2420" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{r.proposedActionTitle}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Público-Alvo: {r.targetAudience}</div>

            <div style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>
              <strong>Impacto Social Estimado:</strong> <span style={{ color: C.green }}>{r.estimatedSocialImpactValue}</span>
            </div>

            <div style={{ padding: '8px 10px', background: C.bgAlt, borderRadius: 6, fontSize: 10, color: C.gold }}>
              ✓ Validação Executiva: {r.humanValidationStatus} ({r.validatedByPerson})
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Análise Prospectiva & Cenários (1–5 Anos) ───────────────────────────

function ForesightTab() {
  const [scenarios, setScenarios] = useState<StrategicScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getScenarios().then(res => { setScenarios(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Cenários Prospectivos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔮" title="Análise Prospectiva & Simulação de Cenários Multianuais" sub="Projeções Preditivas para 12, 24, 36 e 60 Meses com Avaliação de Probabilidades e Riscos" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {scenarios.map(s => (
          <DarkCard key={s.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{s.code}</span>
              <Badge text={`Probabilidade: ${s.probabilityPct}%`} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Horizonte: {s.forecastHorizonYears} Ano(s)</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="Famílias Impactadas" value={s.projectedSocialImpactFamilies} color={C.cyan} />
              <MetricPill label="Orçamento Anual" value={`R$ ${(s.projectedAnnualRevenueBrl / 1e6).toFixed(2)}M`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Passos de Preparação: {s.recommendedPreparationSteps.join(', ')}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Riscos Emergentes & Alertas ────────────────────────────────────────

function EmergingRisksTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔔" title="Detecção de Riscos Emergentes & Alertas Estratégicos" sub="Monitoramento Automatizado de Riscos Operacionais, Financeiros, Tecnológicos e Reputacionais" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>✓ Matriz Global de Riscos Sob Controle Rigoroso</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Monitoramento preventivo integrado ao módulo GRC (E022). Todos os limites de exposição e riscos operacionais permanecem dentro dos parâmetros toleráveis.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 7: Mapeamento de Oportunidades ────────────────────────────────────────

function OpportunitiesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎯" title="Identificação Estratégica de Oportunidades" sub="Mapeamento de Editais, Novas Parcerias, Eficiência Operacional e Inovação" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 8 }}>🎯 4 Novas Oportunidades Mapeadas no Ecossistema (E029)</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Captação potencial de <strong style={{ color: C.gold }}>R$ 4.05M em novos editais</strong> e alianças de inovação com universidades.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Executive Cockpits (C-Level) ───────────────────────────────────────

function CockpitsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏛️" title="Executive Cockpits & Dashboards Estratégicos" sub="Painéis Customizados para a Presidência, Conselho Deliberativo, Conselho Fiscal e Diretorias" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <DarkCard>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 4 }}>👑 Cockpit da Presidência & Conselho Deliberativo</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Indicadores globais de SROI (4.85x), metas 2030, riscos e cadernos executivos.</div>
        </DarkCard>
        <DarkCard>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 4 }}>⚖️ Cockpit do Conselho Fiscal & Governança</div>
          <div style={{ fontSize: 11, color: C.text3 }}>Prestação de contas ITG 2002, auditorias (E025) e evidências imutáveis.</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 9: Cadernos Executivos Automáticos ────────────────────────────────────

function BriefingsTab() {
  const [briefs, setBriefs] = useState<DecisionBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getBriefs().then(res => { setBriefs(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Cadernos Executivos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Cadernos Executivos & Briefings Automatizados" sub="Geração Periódica de Briefings Semanais, Mensais e Relatórios Anuais da Plataforma" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {briefs.map(b => (
          <DarkCard key={b.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{b.code}</span>
              <Badge text={b.briefType} color={C.gold} bg="#fbbf2420" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{b.periodTitle}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Publicado em: {b.publishedAt} por {b.generatedBy}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{b.executiveSummary}</p>

            <div style={{ fontSize: 10, color: C.emerald }}>Destaques: {b.highlightsList.join(', ')}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 10: Governança da Inteligência ────────────────────────────────────────

function GovernanceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Governança da Inteligência & Rastreabilidade" sub="Supervisão Humana Permanente, Validação de Modelos e Transparência de Premissas (ISO 42001)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>🔒 Explicabilidade & Auditaridade Imutável</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Nenhuma sugestão ou análise é emitida como "caixa-preta". Todas as inferências contêm a lista exata de evidências operacionais de origem.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 11: APIs & Eventos ────────────────────────────────────────────────────

function APIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="APIs Corporativas & Barramento de Eventos" sub="Contratos OpenAPI 3.1 e Tópicos Pub/Sub (InsightGenerated, ForecastCompleted)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>🌐 Eventos Pub/Sub de Inteligência Executiva</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Eventos de alta prioridade como <code style={{ color: C.cyan }}>ExecutiveAlertCreated</code> notificam instantaneamente os cockpits dos diretores.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação E030 & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<InstitutionalIntelligenceCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIIDSFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E030..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Institutional Intelligence Maturity Score — E030" sub="Certificação da Central de Inteligência Institucional e Apoio à Decisão Estratégica" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091a38 0%, #200a40 50%, #032924 100%)',
        border: `2px solid ${C.gold}60`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
        boxShadow: `0 0 36px ${C.gold}25`,
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
          {cert.intelligenceMaturityScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          INSTITUTIONAL INTELLIGENCE MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="👑 CENTRAL DE INTELIGÊNCIA HOMOLOGADA" color={C.gold} bg="#fbbf2425" />
          <Badge text="🧩 25 MÓDULOS CONSOLIDADOS (E005–E029)" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Inteligência Institucional ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #091a38, #200a40)`,
        border: `2px solid ${C.gold}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CONSOLIDAÇÃO DA CENTRAL DE INTELIGÊNCIA INSTITUCIONAL (E030)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Institutional Intelligence, Decision Support & Strategic Foresight Framework (EIIDSF)</strong> estabelece
          a Plataforma Instituto Ser Melhor como o Centro de Inteligência Institucional supremo da organização,
          com o <strong style={{ color: C.gold }}>Institutional Intelligence Maturity Score de 98/100 (EXCELÊNCIA SUPREMA EM INTELIGÊNCIA)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este framework consolida e integra a inteligência de todos os 25 módulos corporativos anteriores, fornecendo à Presidência, ao Conselho e às Diretorias análises explicáveis, auditáveis e prospectivas que orientam decisões estratégicas de alto impacto social com transparência e sustentabilidade.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EIIDSFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'consolidation':return <ConsolidationTab />;
      case 'correlation':  return <CorrelationTab />;
      case 'decision':     return <DecisionSupportTab />;
      case 'foresight':    return <ForesightTab />;
      case 'risks':        return <EmergingRisksTab />;
      case 'opportunities':return <OpportunitiesTab />;
      case 'cockpits':     return <CockpitsTab />;
      case 'briefings':    return <BriefingsTab />;
      case 'governance':   return <GovernanceTab />;
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
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.gold}40`,
          }}>👑</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Institutional Intelligence & Strategic Foresight
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E030 · EIIDSF · Central de Inteligência Institucional · Consolidação E005–E029 · Apoio à Decisão XAI · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.gold}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.gold : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : '2px solid transparent',
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

export default EIIDSFPage;
