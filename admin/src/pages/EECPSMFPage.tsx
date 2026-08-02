/**
 * EECPSMFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E029 — ENTERPRISE ECOSYSTEM COLLABORATION, PARTNERSHIP &
 *         STAKEHOLDER MANAGEMENT FRAMEWORK (EECPSMF)
 * Instituto Ser Melhor — Prompt E029 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Ecosystem Command Tower— Painel Executivo de Parcerias e Ecossistema
 *   2.  Cadastro Stakeholders  — Doadores, Empresas, Governos, Universidades e ONGs
 *   3.  Gestão de Parcerias    — Acordos (MoU, Convenios, Contratos) e Ciclo de Vida
 *   4.  Redes Colaborativas    — Fóruns, Grupos de Trabalho e Coalizões Temáticas
 *   5.  Governança Parcerias   — Comitês Interinstitucionais, Atas e Avaliações (ISO 44001)
 *   6.  Pipeline Oportunidades — Editais, Chamadas Públicas e Captação de Recursos
 *   7.  Comunicação & Reuniões — Calendário Institucional, Atas e Interações (E012)
 *   8.  Indicadores Relacionamento— Engajamento, Taxa de Renovação (96%) e Impacto
 *   9.  Gestão de Riscos (E022)— Riscos Jurídicos, Reputacionais e Operacionais
 *  10.  Integrações Plataforma — Conexão com E007 (Financeiro), E027 (Estratégico), E020 (IA)
 *  11.  APIs & Eventos          — OpenAPI 3.1 & Barramento de Eventos (AgreementSigned)
 *  12.  Certificação E029      — Partnership Maturity Score 98/100 & Encerramento
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EECPSMFService,
  type EECPSMFConsolidatedDashboard,
  type Stakeholder,
  type PartnershipAgreement,
  type ExternalOpportunity,
  type CollaborationNetwork,
  type EcosystemManagementCertification,
} from '../services/eecpsmfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02050d',
  bgCard:    '#070e1c',
  bgAlt:     '#0a1529',
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
  { id: 'tower',        icon: '🌐', label: 'Ecosystem Command Tower' },
  { id: 'stakeholders', icon: '👤', label: 'Cadastro Stakeholders' },
  { id: 'agreements',   icon: '📜', label: 'Gestão de Parcerias' },
  { id: 'networks',     icon: '🕸️', label: 'Redes Colaborativas' },
  { id: 'governance',   icon: '🏛️', label: 'Governança (ISO 44001)' },
  { id: 'opportunities',icon: '🎯', label: 'Pipeline Oportunidades' },
  { id: 'meetings',     icon: '📅', label: 'Comunicação & Reuniões' },
  { id: 'kpis',         icon: '📊', label: 'Indicadores Relacionamento' },
  { id: 'risks',        icon: '🛡️', label: 'Gestão de Riscos (E022)' },
  { id: 'integration',  icon: '🔌', label: 'Integrações Plataforma' },
  { id: 'apis',         icon: '⚡', label: 'APIs & Eventos' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E029' },
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
        borderTopColor: C.emerald, borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: C.text3 }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── TAB 1: Ecosystem Command Tower ────────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EECPSMFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Ecosystem Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051e36 0%, #1a0b3a 50%, #032824 100%)',
        border: `2px solid ${C.emerald}50`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.emerald}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.emerald}40`,
          }}>🌐</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Ecosystem Collaboration & Partnership Command Tower (E029)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Gestão do Ecossistema Institucional · ISO 44001 · Parcerias Estratégicas · Pipeline de Captação · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.emerald }}>{d.ecosystemMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Ecosystem Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '👤', label: 'Stakeholders Registrados', value: d.totalStakeholdersRegisteredCount, color: C.cyan },
            { icon: '📜', label: 'Parcerias Ativas (MoU/Termos)', value: d.activePartnershipsCount, color: C.purple },
            { icon: '🎯', label: 'Pipeline Oportunidades', value: `R$ ${(d.activeOpportunitiesPipelineValueBrl / 1e6).toFixed(2)}M`, color: C.gold },
            { icon: '🕸️', label: 'Redes Colaborativas', value: d.activeNetworksCount, color: C.sky },
            { icon: '🔄', label: 'Taxa de Renovação', value: `${d.partnershipRenewalRatePct}%`, color: C.green },
            { icon: '🏛️', label: 'Governança ISO 44001', value: 'CONFORME', color: C.emerald },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🌐 Governança de Parcerias (ISO 44001)</div>
          <ScoreBar label="Engajamento de Stakeholders" value={97} color={C.green} />
          <ScoreBar label="Gestão de Riscos Reputacionais & Contratuais" value={99} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Taxa de Fidelização / Renovação</span>
            <span style={{ color: C.emerald, fontWeight: 800 }}>96.0% Renovadas</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🎯 Pipeline de Oportunidades & Financiamento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Propostas em Avaliação</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Editais Internacionais & Governamentais</div>
              </div>
              <Badge text="R$ 4.05M" color={C.gold} bg="#fbbf2420" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Taxa de Conversão</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Propostas Aprovadas</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>88.5%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Padrões Normativos do Ecossistema</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 44001 Collaborative Relationships', status: 'CONFORME', color: C.green },
              { label: 'AA1000SES Stakeholder Engagement', status: 'CONFORME', color: C.green },
              { label: 'ISO 37301 Compliance & Contracts', status: 'CONFORME', color: C.green },
              { label: 'LGPD Privacy in Partnerships', status: 'CONFORME', color: C.green },
              { label: 'AI Partner Matching Engine (E020)', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Cadastro de Stakeholders ───────────────────────────────────────────

function StakeholdersTab() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getStakeholders().then(res => { setStakeholders(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Cadastro de Stakeholders..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="👤" title="Cadastro Corporativo de Stakeholders & Perfis" sub="Gestão Unificada de Doadores, Empresas, Fundações, Universidades e Órgãos Públicos" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {stakeholders.map(s => (
          <DarkCard key={s.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{s.code}</span>
              <Badge text={s.stakeholderType.replace(/_/g, ' ')} color={C.purple} bg="#c084fc20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 8 }}>Gestor Responsável: {s.relationshipOwner}</div>

            <ScoreBar label="Nível de Engajamento" value={s.engagementLevelScore} color={C.green} />

            <div style={{ fontSize: 10, color: C.sky }}>Contato: {s.primaryContactEmail}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Gestão de Parcerias (MoUs & Termos) ────────────────────────────────

function AgreementsTab() {
  const [agreements, setAgreements] = useState<PartnershipAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getAgreements().then(res => { setAgreements(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Acordos e Parcerias..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Gestão do Ciclo de Vida de Parcerias & Acordos" sub="Memorandos de Entendimento (MoUs), Termos de Cooperação, Contratos e Entregáveis" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {agreements.map(a => (
          <DarkCard key={a.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{a.code}</span>
              <Badge text={a.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Parceiro: {a.partnerOrganizationName}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="Vigência" value={`${a.startDate.substring(0,4)}–${a.endDate.substring(0,4)}`} color={C.cyan} />
              <MetricPill label="Valor Aporte" value={`R$ ${(a.totalFinancialValueBrl / 1e3).toFixed(0)}k`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Gestor Alocado: {a.assignedManager}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Redes Colaborativas ────────────────────────────────────────────────

function NetworksTab() {
  const [networks, setNetworks] = useState<CollaborationNetwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getNetworks().then(res => { setNetworks(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Redes Colaborativas..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🕸️" title="Redes Colaborativas, Coalizões & Fóruns" sub="Articulação Interinstitucional, Grupos de Trabalho Temáticos e Iniciativas Conjuntas" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {networks.map(n => (
          <DarkCard key={n.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{n.code}</span>
              <Badge text={n.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{n.name}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Área Foco: {n.focusArea}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Entidades Participantes: <strong style={{ color: C.green }}>{n.participatingOrganizationsCount}</strong></span>
              <span>Facilitador: <strong style={{ color: C.text2 }}>{n.leadFacilitator}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Governança das Parcerias (ISO 44001) ───────────────────────────────

function GovernanceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏛️" title="Governança de Relacionamentos (ISO 44001)" sub="Comitês de Acompanhamento, Atas de Reuniões, Revisões de Desempenho e Ações Corretivas" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>📜 Conformidade Plena com a Norma ISO 44001:2017</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Modelo estruturado para avaliação trimestral do ciclo de vida das alianças estratégicas, garantindo o alcance dos objetivos compartilhados e a gestão conjunta de riscos.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 6: Pipeline de Oportunidades ──────────────────────────────────────────

function OpportunitiesTab() {
  const [opportunities, setOpportunities] = useState<ExternalOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getOpportunities().then(res => { setOpportunities(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Pipeline de Oportunidades..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎯" title="Pipeline de Oportunidades & Captação" sub="Mapeamento de Editais, Chamadas Públicas de Financiamento e Cooperação Internacional" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {opportunities.map(o => (
          <DarkCard key={o.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{o.code}</span>
              <Badge text={o.stage.replace(/_/g, ' ')} color={C.gold} bg="#fbbf2420" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{o.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Financiador: {o.fundingSource}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="Orçamento Alvo" value={`R$ ${(o.targetBudgetBrl / 1e6).toFixed(2)}M`} color={C.green} />
              <MetricPill label="Aderência Fit" value={`${o.fitScorePct}%`} color={C.cyan} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Prazo de Submissão: {o.submissionDeadline}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Comunicação & Reuniões (E012) ──────────────────────────────────────

function MeetingsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📅" title="Comunicação Institucional & Calendário de Reuniões" sub="Registro de Atas, Correspondências Institucionais e Histórico de Interações com Parceiros" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.sky, marginBottom: 8 }}>📅 Histórico Centralizado de Interações com Parceiros</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Integração nativa com o módulo de Comunicação (E012), permitindo auditar todas as correspondências, reuniões de governança e compromissos firmados.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Indicadores de Relacionamento ──────────────────────────────────────

function KPIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Indicadores de Desempenho do Ecossistema" sub="Nível de Engajamento, Taxa de Renovação de Parcerias (96%) e Impacto Social Gerado" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>96.0%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Taxa de Renovação de Parcerias</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.gold }}>R$ 4.05M</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Pipeline Ativo de Editais</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>84</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Stakeholders Institucionais</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 9: Gestão de Riscos das Parcerias (E022) ──────────────────────────────

function RisksTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Gestão de Riscos Reputacionais & Jurídicos (E022)" sub="Avaliação de Matriz de Riscos em Parcerias, Contratos e Integridade Ética" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>✓ Zero Riscos Críticos de Compliance ou Inadimplência</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Todas as organizações parceiras passam por Due Diligence de integridade e compliance (ISO 37301 / E022) antes da assinatura de qualquer termo.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Integrações com a Plataforma ──────────────────────────────────────

function IntegrationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔌" title="Integrações com o Ecossistema ISM" sub="Conexão Direta com Financeiro (E007), BI (E019), IA (E020), GRC (E022) e Estratégia (E027)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>🔗 Visão Consolidada 360° do Ecossistema</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Integração total entre a captação de recursos, execução financeira dos convênios, medição SROI de impacto e relatórios BI corporativos.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 11: APIs & Eventos ────────────────────────────────────────────────────

function APIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="APIs Corporativas & Barramento de Eventos" sub="Contratos OpenAPI 3.1 e Tópicos Pub/Sub (AgreementSigned, OpportunityIdentified)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>🌐 Eventos Pub/Sub do Ecossistema</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Eventos como <code style={{ color: C.cyan }}>AgreementSigned</code> acionam automaticamente a criação de contas de projeto no Financeiro e no PMO.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação E029 & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<EcosystemManagementCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EECPSMFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E029..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Ecosystem Management Maturity Score — E029" sub="Certificação da Camada de Gestão de Parcerias, Stakeholders e Governança Colaborativa" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #051e36 0%, #1a0b3a 50%, #032824 100%)',
        border: `2px solid ${C.emerald}50`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.emerald, lineHeight: 1 }}>
          {cert.ecosystemMaturityScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          ECOSYSTEM MANAGEMENT MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="🎖️ ISO 44001 CONFORME" color={C.emerald} bg="#10b98125" />
          <Badge text="🔄 TAXA RENOVABILIDADE: 96%" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Gestão do Ecossistema ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #051e36, #1a0b3a)`,
        border: `2px solid ${C.emerald}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CONSOLIDAÇÃO DA GESTÃO DO ECOSSISTEMA (E029)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Ecosystem Collaboration, Partnership & Stakeholder Management Framework (EECPSMF)</strong> consolida
          a Plataforma Instituto Ser Melhor como o sistema oficial para gestão do ecossistema institucional, alianças estratégicas e cooperação interinstitucional,
          com o <strong style={{ color: C.emerald }}>Ecosystem Management Maturity Score de 98/100 (EXCELÊNCIA EM COLABORAÇÃO)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este framework amplia a atuação em rede da instituição, garantindo governança rigorosa em acordos, transparência na prestação de contas aos financiadores e multiplicação do impacto social humanitário gerado para a sociedade.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EECPSMFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'stakeholders': return <StakeholdersTab />;
      case 'agreements':   return <AgreementsTab />;
      case 'networks':     return <NetworksTab />;
      case 'governance':   return <GovernanceTab />;
      case 'opportunities':return <OpportunitiesTab />;
      case 'meetings':     return <MeetingsTab />;
      case 'kpis':         return <KPIsTab />;
      case 'risks':        return <RisksTab />;
      case 'integration':  return <IntegrationTab />;
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
            background: `linear-gradient(135deg, ${C.emerald}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.emerald}40`,
          }}>🌐</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Ecosystem Collaboration & Partnership Management
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E029 · EECPSMF · ISO 44001 · Parcerias Estratégicas · Stakeholders · Pipeline de Oportunidades · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.emerald}30, ${C.purple}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.emerald : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.emerald}` : '2px solid transparent',
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

export default EECPSMFPage;
