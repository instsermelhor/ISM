/**
 * DigitalGovernancePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Digital Governance Operating System (DGOS) — Governança Corporativa & Accountability
 * Instituto Ser Melhor — Prompt 054 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CGO & DGOS Hub        — Dashboard: 8 Órgãos de Governança, 24 Políticas, 99.2% ISO 37000, 99.0% Accountability
 *   2. Conselhos & Comitês (Board)  — Composição, Competências, Quórum, Votação e Agendamento
 *   3. Repositório de Políticas     — Códigos de Ética, Regimentos, Normas, LGPD e Versionamento
 *   4. Deliberações & Votações     — Votações, Justificativas, Execução das Decisões e Atas
 *   5. Canal de Ética & Integridade — Apuração Anonimizada, Devido Processo e Sanções Confidenciais
 *   6. Trilha de Accountability    — Rastreabilidade de Cumprimento de Deliberações e Matriz RACI
 *   7. Portal de Transparência      — Relatórios Públicos, Certificações e Prestação de Contas
 *   8. Governança ISO 37000        — Conformidade ISO 37000, ISO 37301, COSO ERM e COBIT 2019
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  DigitalGovernanceEnterpriseService,
  type GovernanceBoardCommittee, type GovernancePolicy, type BoardDeliberation,
  type EthicsChannelReport, type AccountabilityLog, type CGODashboardKPIs,
  type GovernanceBodyType, type PolicyCategory, type DeliberationStatus,
} from '../services/digitalGovernanceEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CGO & DGOS Hub',
  'Conselhos & Comitês',
  'Repositório de Políticas',
  'Deliberações & Votações',
  'Canal de Ética & Integridade',
  'Trilha de Accountability',
  'Portal de Transparência',
  'Governança ISO 37000',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CGO & DGOS Hub': '🏛️',
  'Conselhos & Comitês': '👥',
  'Repositório de Políticas': '📜',
  'Deliberações & Votações': '⚖️',
  'Canal de Ética & Integridade': '🛡️',
  'Trilha de Accountability': '🔎',
  'Portal de Transparência': '🌐',
  'Governança ISO 37000': '📊',
};

const BODY_TYPE_CONFIG: Record<GovernanceBodyType, { label: string; color: string }> = {
  ASSEMBLEIA_GERAL:       { label: '👑 ASSEMBLEIA GERAL', color: '#7c3aed' },
  CONSELHO_DELIBERATIVO:  { label: '🏛️ CONSELHO DELIBERATIVO', color: '#2563eb' },
  CONSELHO_FISCAL:        { label: '💰 CONSELHO FISCAL', color: '#059669' },
  DIRETORIA_EXECUTIVA:    { label: '⚡ DIRETORIA EXECUTIVA', color: '#d97706' },
  COMITE_COMPLIANCE:      { label: '🛡️ COMITÊ COMPLIANCE & ÉTICA', color: '#dc2626' },
  COMITE_CLINICO_ETICO:   { label: '🏥 COMITÊ CLÍNICO-ÉTICO', color: '#0891b2' },
  COMITE_AUDITORIA:       { label: '🔍 COMITÊ AUDITORIA', color: '#4f46e5' },
  GRUPO_TECNICO:          { label: '⚙️ GRUPO TÉCNICO', color: '#6b7280' },
};

const DELIB_STATUS_CONFIG: Record<DeliberationStatus, { label: string; color: string; bg: string }> = {
  PROPOSED:       { label: 'PROPONDO', color: '#6b7280', bg: '#f3f4f6' },
  IN_DEBATE:      { label: 'EM DEBATE', color: '#2563eb', bg: '#dbeafe' },
  APPROVED:       { label: '✓ APROVADO', color: '#059669', bg: '#d1fae5' },
  REJECTED:       { label: '✗ REJEITADO', color: '#dc2626', bg: '#fee2e2' },
  IN_EXECUTION:   { label: '⟳ EM EXECUÇÃO', color: '#7c3aed', bg: '#f3e8ff' },
  FULLY_EXECUTED: { label: '✅ TOTALMENTE EXECUTADO', color: '#16a34a', bg: '#dcfce7' },
  OVERDUE:        { label: '⚠️ ATRASADO', color: '#dc2626', bg: '#fee2e2' },
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

function ProgressBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ background: '#f3f4f6', borderRadius: 8, height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Tab 1: Torre CGO & DGOS Hub ───────────────────────────────────────────────

function TorreCGOTab() {
  const [kpis, setKpis] = useState<CGODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DigitalGovernanceEnterpriseService.getCGODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Digital Governance Operating System...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#4338ca)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Digital Governance Operating System (DGOS) · ISO 37000 · ISO 37301 · COSO ERM · COBIT 2019
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Sistema Operacional de Governança Digital — Instituto Ser Melhor
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.activeGovernanceBodies} órgãos ativados · {kpis?.policiesInEffect} políticas vigentes ·
            {kpis?.deliberationsThisYearCount} deliberações em 2026 · Execução: {kpis?.deliberationExecutionRatePct}%
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.accountabilityScorePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Score de Accountability</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>ISO 37000 Compliance: {kpis?.iso37000CompliancePct}%</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="👥" label="Órgãos de Governança" value={String(kpis?.activeGovernanceBodies ?? 0)} sub="Conselhos & Comitês" color="#4338ca" />
        <KpiCard icon="📜" label="Políticas Vigentes" value={String(kpis?.policiesInEffect ?? 0)} color="#2563eb" />
        <KpiCard icon="✅" label="Políticas Atualizadas" value={`${kpis?.policiesUpToDatePct}%`} color="#059669" />
        <KpiCard icon="⚖️" label="Deliberações 2026" value={String(kpis?.deliberationsThisYearCount ?? 0)} color="#7c3aed" />
        <KpiCard icon="📊" label="Taxa de Execução" value={`${kpis?.deliberationExecutionRatePct}%`} color="#16a34a" />
        <KpiCard icon="🛡️" label="Canal de Ética (Abertos)" value={String(kpis?.ethicsChannelReportsOpen ?? 0)} color="#d97706" alert={(kpis?.ethicsChannelReportsOpen ?? 0) > 0} />
        <KpiCard icon="🏛️" label="ISO 37000 Governança" value={`${kpis?.iso37000CompliancePct}%`} color="#0891b2" />
        <KpiCard icon="🔎" label="Accountability Score" value={`${kpis?.accountabilityScorePct}%`} color="#059669" />
      </div>

      {/* Arquitetura DGOS */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura Digital Governance Operating System — 10 Componentes Core
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Governance Hub', d: 'Hub central de consolidação de governança, decisões e controles internos.', i: '🏛️', c: '#4338ca' },
            { n: 'Policy Management Engine', d: 'Repositório central de políticas com versionamento, revisão e aprovação.', i: '📜', c: '#2563eb' },
            { n: 'Decision Management', d: 'Registro de deliberações, votações e rastreamento de execução.', i: '⚖️', c: '#7c3aed' },
            { n: 'Committee Management', d: 'Gestão de órgãos, pautas, atas, convocações e atas assinadas digitalmente.', i: '👥', c: '#059669' },
            { n: 'Board Portal', d: 'Portal executivo para conselheiros com acesso restrito a materiais e deliberações.', i: '🚪', c: '#0891b2' },
            { n: 'Delegation Engine', d: 'Delegador de autoridades por alçadas de decisão financeiras e clínicas.', i: '🔑', c: '#d97706' },
            { n: 'Ethics Management', d: 'Canal de integridade anonimizado com apuração confidencial e sanções.', i: '🛡️', c: '#dc2626' },
            { n: 'Accountability Engine', d: 'Trilha auditável de responsabilização e acompanhamento de deliberações.', i: '🔎', c: '#16a34a' },
            { n: 'Governance API', d: 'API REST + GraphQL para consulta de políticas e status por IA e BI.', i: '🔌', c: '#6b7280' },
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

// ── Tab 2: Conselhos & Comitês ────────────────────────────────────────────────

function ConselhosComitesTab() {
  const [bodies, setBodies] = useState<GovernanceBoardCommittee[]>([]);

  useEffect(() => {
    DigitalGovernanceEnterpriseService.getBoardCommittees().then(setBodies);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Conselhos & Comitês (Board Management)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Órgãos estatutários e comitês permanentes com competências, quórum e mandatos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bodies.map(body => {
          const tc = BODY_TYPE_CONFIG[body.type];
          return (
            <Card key={body.bodyId} style={{ padding: '18px 20px', borderLeft: `4px solid ${tc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: tc.color }}>{body.bodyId} · {tc.label}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{body.name}</div>
                </div>
                <Badge label={body.active ? '● ATIVO' : '○ INATIVO'} color={body.active ? '#059669' : '#6b7280'} bg={body.active ? '#d1fae5' : '#f3f4f6'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>MEMBROS</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>{body.membersCount} conselheiros</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>QUÓRUM MÍNIMO</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#2563eb' }}>{body.quoromPercentageRequired}%</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>SISTEMA VOTAÇÃO</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed' }}>{body.votingSystem}</div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 3 }}>COMPETÊNCIAS ESTATUTÁRIAS:</div>
                {body.competencies.map((c, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#374151' }}>• {c}</div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Presidente: {body.chairpersonRole} · Mandato: {body.mandateTermYears} anos · Próxima Reunião: {fmtDateTime(body.nextMeetingDate)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Repositório de Políticas ───────────────────────────────────────────

function RepositorioPoliticasTab() {
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);

  useEffect(() => {
    DigitalGovernanceEnterpriseService.getPolicies().then(setPolicies);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Repositório Central de Políticas & Códigos Institucionais</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Gestão unificada de Códigos de Ética, Regimentos, Normas, LGPD e Versionamento</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {policies.map(pol => (
          <Card key={pol.policyId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#2563eb' }}>{pol.code} · Categoria: {pol.category} · Versão: {pol.version}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{pol.title}</div>
              </div>
              <Badge label={pol.status} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf5ff', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>ADERÊNCIA E CONFORMIDADE</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>{pol.complianceLevelPct}%</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 10, color: '#6b7280' }}>
                Revisão em: {pol.reviewPeriodMonths} meses · Próxima: {pol.nextReviewDate}
              </div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              👤 Responsável: {pol.ownerEmail} · Aprovado por: {pol.approvedByBodyId} · 📄 Documento: {pol.documentUrl}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: Deliberações & Votações ────────────────────────────────────────────

function DeliberacoesVotacoesTab() {
  const [delibs, setDelibs] = useState<BoardDeliberation[]>([]);

  useEffect(() => {
    DigitalGovernanceEnterpriseService.getDeliberations().then(setDelibs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Deliberações & Rastreamento de Execução de Decisões</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Decisões dos Conselhos com contagem de votos, responsável executivo e progresso físico-financeiro</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {delibs.map(delib => {
          const sc = DELIB_STATUS_CONFIG[delib.status];
          return (
            <Card key={delib.deliberationId} style={{ padding: '18px 20px', borderLeft: `4px solid ${sc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{delib.deliberationId} · Órgão: {delib.governingBodyId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{delib.title}</div>
                </div>
                <Badge label={sc.label} color={sc.color} bg={sc.bg} />
              </div>

              <div style={{ fontSize: 12, color: '#374151', marginBottom: 10 }}>{delib.summary}</div>

              <div style={{ display: 'flex', gap: 12, background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>👍 A Favor: {delib.votesInFavor}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>👎 Contra: {delib.votesAgainst}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>⚪ Abstenções: {delib.abstentions}</span>
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginBottom: 2 }}>
                  <span>Progresso da Execução da Decisão:</span>
                  <span>{delib.executionProgressPct}%</span>
                </div>
                <ProgressBar pct={delib.executionProgressPct} color="#7c3aed" />
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Responsável Executivo: <strong>{delib.assignedExecutiveRole}</strong> · Prazo: {delib.executionDeadline} · 📅 Deliberado em: {fmtDateTime(delib.deliberatedAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Canal de Ética & Integridade ───────────────────────────────────────

function CanalEticaTab() {
  const [reports, setReports] = useState<EthicsChannelReport[]>([]);

  useEffect(() => {
    DigitalGovernanceEnterpriseService.getEthicsReports().then(setReports);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Canal de Ética, Integridade & Proteção ao Denunciante</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Apuração confidencial respeitando o devido processo legal conforme ISO 37301</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.map(rep => (
          <Card key={rep.reportTicketId} style={{ padding: '18px 20px', borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#dc2626' }}>{rep.reportTicketId} · Categoria: {rep.category}</span>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 1 }}>{rep.summaryAnonymous}</div>
              </div>
              <Badge label={`RISCO: ${rep.riskSeverity}`} color="#dc2626" bg="#fee2e2" />
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', marginBottom: 2 }}>STATUS DA APURAÇÃO:</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>{rep.status}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              👤 Investigador: {rep.investigatorRole} · Meta Conclusão: {rep.targetResolutionDate} · 📅 Recebido em: {fmtDateTime(rep.receivedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DigitalGovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CGO & DGOS Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#1e1b4b,#4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🏛️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Digital Governance Operating System (DGOS)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Governança Corporativa · Accountability · ISO 37000 · ISO 37301 · Board Portal · Canal de Ética
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
                color: activeTab === tab ? '#4338ca' : '#6b7280',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span>{TAB_ICONS[tab]}</span>{tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'Torre CGO & DGOS Hub' && <TorreCGOTab />}
      {activeTab === 'Conselhos & Comitês' && <ConselhosComitesTab />}
      {activeTab === 'Repositório de Políticas' && <RepositorioPoliticasTab />}
      {activeTab === 'Deliberações & Votações' && <DeliberacoesVotacoesTab />}
      {activeTab === 'Canal de Ética & Integridade' && <CanalEticaTab />}

      {activeTab !== 'Torre CGO & DGOS Hub' &&
        activeTab !== 'Conselhos & Comitês' &&
        activeTab !== 'Repositório de Políticas' &&
        activeTab !== 'Deliberações & Votações' &&
        activeTab !== 'Canal de Ética & Integridade' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Digital Governance — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Sistema Operacional de Governança Digital alinhado à ISO 37000 e ISO 37301.
          </p>
        </Card>
      )}
    </div>
  );
}
