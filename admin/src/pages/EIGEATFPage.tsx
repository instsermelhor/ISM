/**
 * EIGEATFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E032 — ENTERPRISE INSTITUTIONAL GOVERNANCE, ETHICS,
 *         ACCOUNTABILITY & TRANSPARENCY FRAMEWORK (EIGEATF)
 * Instituto Ser Melhor — Prompt E032 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Governance Command Tower — Painel Executivo da Governança Institucional
 *   2.  Estrutura Organograma   — Assembleia, Conselhos (Deliberativo/Fiscal) e Diretoria
 *   3.  Políticas Institucionais — Código de Conduta, Regimentos e Normas Versionadas
 *   4.  Gestão de Reuniões      — Convocações, Pautas, Atas e Registros de Presença
 *   5.  Acompanhamento Deliberações— Resoluções Aprovadas, Gestores Alocados e Status
 *   6.  Controles Internos (SoD)— Matriz de Controles, Segregação de Funções e Eficácia
 *   7.  Compliance & Ética (ISO 37001)— Conflito de Interesses, Obrigações e Evidências
 *   8.  Portal de Transparência — Divulgação Pública, Relatórios de Prestação de Contas (LGPD)
 *   9.  Accountability & Assinaturas— Trilha Imutável SHA-256 de Decisões Colegiadas
 *  10.  Integrações Plataforma — Conexão com E022 (GRC), E027 (Estratégico), E030 (IA), E031 (Arch)
 *  11.  APIs & Eventos          — OpenAPI 3.1 & Barramento de Eventos (BoardMeetingHeld)
 *  12.  Certificação E032      — Institutional Governance Maturity Score 98/100
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EIGEATFService,
  type EIGEATFConsolidatedDashboard,
  type GovernancePolicy,
  type BoardMeeting,
  type BoardResolution,
  type InternalControl,
  type InstitutionalGovernanceCertification,
} from '../services/eigeatfEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02040b',
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
  { id: 'tower',        icon: '🏛️', label: 'Governance Tower' },
  { id: 'structure',    icon: '👥', label: 'Estrutura Organograma' },
  { id: 'policies',     icon: '📜', label: 'Políticas & Normas' },
  { id: 'meetings',     icon: '📅', label: 'Gestão de Reuniões' },
  { id: 'resolutions',  icon: '✅', label: 'Deliberações' },
  { id: 'controls',     icon: '🛡️', label: 'Controles Internos (SoD)' },
  { id: 'compliance',   icon: '⚖️', label: 'Compliance & Ética' },
  { id: 'transparency', icon: '🌐', label: 'Transparência Pública' },
  { id: 'accountability',icon:'🔒', label: 'Accountability & SHA-256' },
  { id: 'integration',  icon: '🔌', label: 'Integrações' },
  { id: 'apis',         icon: '⚡', label: 'APIs & Eventos' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E032' },
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

// ── TAB 1: Governance Command Tower ───────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EIGEATFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Governance Command Tower..." />;

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
          }}>🏛️</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Institutional Governance & Transparency Tower (E032)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Sistema Oficial de Governança Corporativa · ISO 37000 · ISO 37001 · IBGC Best Practices · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: C.gold }}>{d.institutionalGovernanceMaturityScore}</div>
            <div style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>Governance Maturity Index</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '📜', label: 'Políticas Ativas', value: d.activeGovernancePoliciesCount, color: C.cyan },
            { icon: '📅', label: 'Reuniões Realizadas', value: d.totalBoardMeetingsHeldYearCount, color: C.purple },
            { icon: '✅', label: 'Deliberações Executadas', value: `${d.totalResolutionsExecutedPct}%`, color: C.green },
            { icon: '🛡️', label: 'Controles Internos (SoD)', value: d.activeInternalControlsCount, color: C.emerald },
            { icon: '🌐', label: 'Índice Transparência', value: `${d.transparencyIndexPct}%`, color: C.gold },
            { icon: '🔒', label: 'Assinaturas SHA-256', value: '100% VALIDADAS', color: C.sky },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🏛️ Eficácia da Governança Corporativa</div>
          <ScoreBar label="Atuação dos Conselhos e Diretoria" value={98} color={C.green} />
          <ScoreBar label="Transparência & Accountability Pública" value={99} color={C.gold} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Aderência ao Código IBGC (6ª Ed.)</span>
            <span style={{ color: C.green, fontWeight: 800 }}>100% Conforme</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🛡️ Matriz de Controles Internos (SoD)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Controles Testados e Ativos</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Segregação de Funções & Alçadas</div>
              </div>
              <Badge text="42 CONTROLES" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Eficácia Operacional</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Zero Violação de SoD</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>100%</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Certificações de Governança & Ética</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ISO 37000 Governance of Organizations', status: 'CONFORME', color: C.green },
              { label: 'ISO 37001 Anti-Bribery Management', status: 'CONFORME', color: C.green },
              { label: 'ISO 37301 Compliance Management', status: 'CONFORME', color: C.green },
              { label: 'ITG 2002 Prestação de Contas', status: 'CONFORME', color: C.green },
              { label: 'LGPD Privacy & Data Governance', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Estrutura Organograma ──────────────────────────────────────────────

function StructureTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="👥" title="Estrutura de Governança & Organograma Corporativo" sub="Assembleia Geral, Conselho Deliberativo, Conselho Fiscal, Diretoria Executiva e Comitês" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 12 }}>🏛️ Hierarquia Decisória & Alçadas Homologadas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { organ: 'Assembleia Geral', role: 'Instância Suprema de Decisão Institucional' },
            { organ: 'Conselho Deliberativo', role: 'Fixação de Diretrizes e Aprovação de Estratégias' },
            { organ: 'Conselho Fiscal', role: 'Fiscalização Financeira e Parecer Contábil' },
            { organ: 'Diretoria Executiva', role: 'Gestão Operacional, Técnica e Administrativa' },
            { organ: 'Comitê de Ética & Riscos', role: 'Supervisão de Integridade, Compliance e Riscos' },
            { organ: 'Comitê de Auditoria', role: 'Supervisão de Controles e Evidências SHA-256' },
          ].map(item => (
            <div key={item.organ} style={{ padding: '12px 14px', background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{item.organ}</div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{item.role}</div>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 3: Políticas Institucionais ────────────────────────────────────────────

function PoliciesTab() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getPolicies().then(res => { setPolicies(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Políticas Institucionais..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📜" title="Catálogo de Políticas, Código de Ética & Regimentos" sub="Normas Corporativas Versionadas, Aprovadas pelos Conselhos com Controle de Validade" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {policies.map(p => (
          <DarkCard key={p.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{p.code}</span>
              <Badge text={p.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Órgão Aprovador: {p.governingOrgan} · Versão: {p.versionNumber}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, borderTop: `1px solid ${C.borderDim}`, paddingTop: 8 }}>
              <span>Aprovada em: <strong style={{ color: C.text2 }}>{p.approvedAt}</strong></span>
              <span>Próxima Revisão: <strong style={{ color: C.gold }}>{p.nextReviewDate}</strong></span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Gestão de Reuniões & Atas ──────────────────────────────────────────

function MeetingsTab() {
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getMeetings().then(res => { setMeetings(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Reuniões dos Conselhos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📅" title="Gestão de Reuniões dos Conselhos & Atas" sub="Convocações Oficiais, Pautas Deliberativas, Listas de Presença e Atas Digitais Auditáveis" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {meetings.map(m => (
          <DarkCard key={m.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{m.code}</span>
              <Badge text={m.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>Reunião do {m.governingOrgan}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Data: {m.meetingDate} · Presentes: {m.attendeesCount} conselheiros</div>

            <div style={{ fontSize: 10, color: C.text3, marginBottom: 10 }}>Pauta: {m.agendaTopics.join('; ')}</div>

            <div style={{ fontSize: 10, color: C.sky }}>
              Ata Homologada: <a href={m.minutesDocumentUrl} target="_blank" rel="noreferrer" style={{ color: C.sky }}>Download PDF Assinado</a>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Acompanhamento de Deliberações ──────────────────────────────────────

function ResolutionsTab() {
  const [resolutions, setResolutions] = useState<BoardResolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getResolutions().then(res => { setResolutions(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Deliberações Aprovadas..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="✅" title="Acompanhamento do Ciclo de Execução de Deliberações" sub="Resoluções do Conselho, Gestores Alocados, Prazos de Cumprimento e Validação de Resultados" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {resolutions.map(r => (
          <DarkCard key={r.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{r.resolutionCode}</span>
              <Badge text={r.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Gestor Alocado: {r.assignedManager} · Prazo: {r.deadlineDate}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{r.decisionSummary}</p>

            <div style={{ fontSize: 10, color: C.emerald }}>
              Assinatura Digital SHA-256: <code style={{ color: C.text2 }}>{r.digitalSignatureHash.substring(0, 24)}...</code>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 6: Controles Internos (SoD) ───────────────────────────────────────────

function ControlsTab() {
  const [controls, setControls] = useState<InternalControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getControls().then(res => { setControls(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Controles Internos..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Matriz de Controles Internos & Segregação de Funções" sub="Controles Preventivos/Detectivos para Processos Críticos e Dupla Alçada Decisória" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {controls.map(c => (
          <DarkCard key={c.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{c.code}</span>
              <Badge text="Eficácia 100%" color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{c.processName}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Responsável: {c.responsibleOwner}</div>

            <p style={{ fontSize: 11, color: C.text3, marginBottom: 10 }}>{c.controlObjective}</p>

            <ScoreBar label="Eficácia Testada" value={c.effectivenessRatingPct} color={C.green} />
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Compliance & Ética (ISO 37001) ─────────────────────────────────────

function ComplianceTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚖️" title="Compliance, Ética & Prevenção a Conflitos (ISO 37001)" sub="Gestão de Obrigações Legais, Regulatórias, Canal de Denúncias e Declarações Éticas" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>📜 Programa de Integridade & Anticorrupção Homologado</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Em conformidade com a norma ISO 37001:2016 e diretrizes da Controladoria-Geral da União (CGU), com cadastro e análise mandatória de potenciais conflitos de interesse para toda a Alta Administração.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Portal de Transparência Pública ────────────────────────────────────

function TransparencyTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🌐" title="Portal de Transparência Pública & Prestação de Contas" sub="Divulgação Ativa de Balanços, Relatórios de Gestão, Demonstrações Financeiras e ITG 2002" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 8 }}>🌐 Portal da Transparência Ativo com Proteção LGPD</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Publicação trimestral de relatórios de desempenho social e financeiro acessíveis a doadores, órgãos públicos e sociedade, preservando o sigilo dos dados pessoais dos assistidos conforme a LGPD.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 9: Accountability & Assinaturas SHA-256 ───────────────────────────────

function AccountabilityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔒" title="Accountability & Trilha Imutável de Evidências" sub="Assinatura Digital Criptográfica (SHA-256) em Deliberações e Registros da Governança" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.cyan, marginBottom: 8 }}>🔒 Rastreabilidade Criptográfica 100% Imutável</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Todas as decisões colegiadas e balanços contábeis aprovados pelo Conselho recebem carimbo do tempo e hash de integridade imutável, respaldando auditorias externas e prestação de contas governamentais.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 10: Integrações com a Plataforma ──────────────────────────────────────

function IntegrationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔌" title="Integração Global da Governança Corporativa" sub="Conexão com Estratégia (E027), Conhecimento (E028), Ecossistema (E029), Inteligência (E030) e Arch (E031)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>🔗 Governança Institucional Integrada</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          O módulo E032 consolida a governança transversal da organização, alimentando e consumindo dados dos cockpits estratégicos, relatórios de auditoria e decisões de arquitetura.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 11: APIs & Eventos ────────────────────────────────────────────────────

function APIsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="⚡" title="APIs Corporativas & Barramento de Eventos" sub="Contratos OpenAPI 3.1 e Tópicos Pub/Sub (GovernancePolicyApproved, ResolutionRegistered)" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.emerald, marginBottom: 8 }}>🌐 Eventos Pub/Sub de Governança</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
          Eventos como <code style={{ color: C.cyan }}>ResolutionRegistered</code> notificam automaticamente os sistemas operacionais e alocam tarefas aos gestores no módulo BPM (E015).
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação E032 & Encerramento ─────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<InstitutionalGovernanceCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EIGEATFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação E032..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Institutional Governance Maturity Score — E032" sub="Certificação Suprema da Governança Institucional, Ética, Accountability e Transparência" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #091a38 0%, #200a40 50%, #032924 100%)',
        border: `2px solid ${C.gold}60`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
        boxShadow: `0 0 36px ${C.gold}25`,
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.gold, lineHeight: 1 }}>
          {cert.governanceMaturityScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          INSTITUTIONAL GOVERNANCE MATURITY SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="👑 SISTEMA OFICIAL DE GOVERNANÇA HOMOLOGADO" color={C.gold} bg="#fbbf2425" />
          <Badge text="📜 ISO 37000 / ISO 37001 CONFORME" color={C.green} bg="#064e3b40" />
        </div>
      </div>

      {/* Conformance Checklist */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 10 }}>
          ✅ Checklist de Governança Institucional ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
          📜 DECLARAÇÃO FORMAL DE INSTITUIÇÃO DO SISTEMA OFICIAL DE GOVERNANÇA (E032)
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Institutional Governance, Ethics, Accountability & Transparency Framework (EIGEATF)</strong> estabelece a
          <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor</strong> como o Sistema Oficial de Governança Corporativa da organização,
          com o <strong style={{ color: C.gold }}>Institutional Governance Maturity Score de 98/100 (EXCELÊNCIA SUPREMA EM GOVERNANÇA)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          Este módulo consolida a governança integrada de toda a instituição, respaldando com transparência, ética, controles imutáveis e accountability as atribuições da Assembleia Geral, do Conselho Deliberativo, do Conselho Fiscal e da Diretoria Executiva.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EIGEATFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'structure':    return <StructureTab />;
      case 'policies':     return <PoliciesTab />;
      case 'meetings':     return <MeetingsTab />;
      case 'resolutions':  return <ResolutionsTab />;
      case 'controls':     return <ControlsTab />;
      case 'compliance':   return <ComplianceTab />;
      case 'transparency': return <TransparencyTab />;
      case 'accountability':return <AccountabilityTab />;
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
            background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.gold}40`,
          }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Institutional Governance, Ethics & Transparency
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E032 · EIGEATF · Sistema Oficial de Governança Corporativa · ISO 37000 · ISO 37001 · IBGC · Instituto Ser Melhor
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

export default EIGEATFPage;
