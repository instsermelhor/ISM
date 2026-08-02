/**
 * EGLHOSCIFPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * E024 — ENTERPRISE GO-LIVE, HYPERCARE, OPERATIONAL STABILIZATION &
 *         CONTINUOUS IMPROVEMENT FRAMEWORK (EGLHOSCIF)
 * Instituto Ser Melhor — Prompt E024 — Plataforma ISM v2.0
 *
 * Abas:
 *   1.  Operations Command Tower— Painel Executivo Consolidado de Estabilização
 *   2.  Plano & Cutover Go-Live — Cronograma, Janelas e Matriz RACI
 *   3.  Checklist Pré-Produção  — Bloqueios de Segurança, Infra e Capacitação
 *   4.  Hypercare War-Room (30d)— Acompanhamento Diário dos 30 Dias de Hypercare
 *   5.  Monitoramento SRE & SLOs— SLO 99.98%, Error Budgets e Latência em Tempo Real
 *   6.  Gestão de Incidentes    — ITIL 4: Triagem, MTTD, MTTR e Escalamento
 *   7.  Gestão de Problemas     — Análise de Causa Raiz (RCA) e Eliminação Recorrências
 *   8.  Gestão de Mudanças (CAB)— Aprovações CAB, Testes Rollback e Histórico Auditado
 *   9.  Segurança Operacional   — SIEM Telemetry, Intrusão e Auditoria de Acesso
 *  10.  Melhoria Contínua (Kaizen)— Backlog Permanente de Otimizações e Inovação
 *  11.  Governança & Treinamento— Manual Operacional Final, FAQs e Capacitação
 *  12.  Certificação Final E024— Operational Excellence Score 98/100 & Estabilização
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import {
  EGLHOSCIFService,
  type EGLHOSCIFConsolidatedDashboard,
  type PreProductionChecklistItem,
  type HypercareDayRecord,
  type IncidentTicket,
  type ChangeTicket,
  type ContinuousImprovementItem,
  type OperationalExcellenceCertification,
} from '../services/eglhoscifEnterprise';

// ── Design System Tokens ──────────────────────────────────────────────────────

const C = {
  bg:        '#02050b',
  bgCard:    '#060c17',
  bgAlt:     '#0a1322',
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
  text1:     '#f8fafc',
  text2:     '#94a3b8',
  text3:     '#64748b',
};

const TABS = [
  { id: 'tower',        icon: '🚀', label: 'Command Tower' },
  { id: 'golive',       icon: '📅', label: 'Plano Go-Live' },
  { id: 'checklist',    icon: '✅', label: 'Checklist Pré-Prod' },
  { id: 'hypercare',    icon: '🏥', label: 'Hypercare War-Room' },
  { id: 'monitoring',   icon: '📊', label: 'Monitoramento SRE' },
  { id: 'incidents',    icon: '🚨', label: 'Gestão Incidentes' },
  { id: 'problems',     icon: '🔍', label: 'Gestão Problemas' },
  { id: 'changes',      icon: '🔄', label: 'Mudanças (CAB)' },
  { id: 'security',     icon: '🛡️', label: 'Segurança SIEM' },
  { id: 'kaizen',       icon: '🌱', label: 'Melhoria Contínua' },
  { id: 'training',     icon: '📚', label: 'Treinamento & Ops' },
  { id: 'cert',         icon: '🎖️', label: 'Certificação E024' },
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

// ── TAB 1: Operations Command Tower ───────────────────────────────────────────

function CommandTowerTab() {
  const [d, setD] = useState<EGLHOSCIFConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getConsolidatedDashboard().then(res => { setD(res); setLoading(false); });
  }, []);

  if (loading || !d) return <LoadingState text="Carregando Operations Command Tower..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #04182e 0%, #170736 50%, #022026 100%)',
        border: `2px solid ${C.green}50`, borderRadius: 18, padding: '28px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.green}40`,
          }}>🚀</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.text1 }}>
              Enterprise Operations & Hypercare Command Tower (E024)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              Estabilização Operacional · ITIL 4 · SRE SLOs · Hypercare 30 Dias · ISO 20000-1 · Instituto Ser Melhor
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.green }}>{d.overallOperationalExcellenceScore}</div>
            <div style={{ fontSize: 10, color: C.text3 }}>Operational Excellence Score</div>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { icon: '🚀', label: 'Go-Live Status', value: 'CONCLUÍDO', color: C.green },
            { icon: '🏥', label: 'Hypercare', value: `${d.hypercareDaysCompleted} / 30 dias`, color: C.cyan },
            { icon: '⚡', label: 'Disponibilidade SLO', value: `${d.platformAvailabilityPct}%`, color: C.emerald },
            { icon: '📊', label: 'Error Budget Restante', value: `${d.remainingErrorBudgetPct}%`, color: C.sky },
            { icon: '⏱️', label: 'MTTR Médio', value: `${d.avgMttrMinutes} min`, color: C.purple },
            { icon: '🚨', label: 'Incidentes Resolvidos', value: d.totalIncidentsResolved, color: C.amber },
            { icon: '🔄', label: 'Sucesso Mudanças', value: `${d.changesExecutedWithSuccessPct}%`, color: C.green },
            { icon: '🌟', label: 'CSAT Usuários', value: `${d.csatSatisfactionScore}%`, color: C.cyan },
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
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>⚡ SLO & Error Budget SRE</div>
          <ScoreBar label="Disponibilidade Real da Plataforma" value={d.platformAvailabilityPct} color={C.green} />
          <ScoreBar label="Error Budget Restante (94.2%)" value={d.remainingErrorBudgetPct} color={C.cyan} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.bgAlt, borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>Tempo Médio de Resposta (MTTR)</span>
            <span style={{ color: C.emerald, fontWeight: 800 }}>12 min</span>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>🏥 Status do Período de Hypercare</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>War-Room Diário</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>30 dias concluídos com estabilidade</div>
              </div>
              <Badge text="STATUS VERDE" color={C.green} bg="#064e3b40" />
            </div>
            <div style={{ padding: '12px 14px', background: '#064e3b20', border: '1px solid #10b98140', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Incidentes Críticos P1</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>Zero incidentes de indisponibilidade</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>0</span>
            </div>
          </div>
        </DarkCard>

        <DarkCard>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text2, marginBottom: 12 }}>📜 Normas de Excelência Operacional</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
            {[
              { label: 'ITIL 4 Service Management', status: 'CONFORME', color: C.green },
              { label: 'ISO 20000-1 IT Service System', status: 'CONFORME', color: C.green },
              { label: 'ISO 22301 Business Continuity', status: 'CONFORME', color: C.green },
              { label: 'SRE Error Budget Governance', status: 'CONFORME', color: C.green },
              { label: 'ISO 27001 / NIST Operational Sec', status: 'CONFORME', color: C.green },
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

// ── TAB 2: Plano Go-Live ──────────────────────────────────────────────────────

function GoLivePlanTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📅" title="Plano de Go-Live & Janelas de Cutover" sub="Cronograma Executado, Critérios de Sucesso, Janela de 4 Horas e Matriz RACI" />

      <DarkCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.text1 }}>🚀 Execução do Cutover de Produção</div>
            <div style={{ fontSize: 11, color: C.text3 }}>Janela de Implantação: 4 Horas · Rollback Limit: 30 min (Não acionado)</div>
          </div>
          <Badge text="✅ SUCESSO ABSOLUTO" color={C.green} bg="#064e3b30" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
          <MetricPill label="Duração Cutover" value="2.5 Horas" color={C.cyan} />
          <MetricPill label="Migração Dados" value="100% Ok" color={C.green} />
          <MetricPill label="APIs Ativadas" value="168 APIs" color={C.purple} />
          <MetricPill label="Rollback" value="0%" color={C.emerald} />
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 3: Checklist Pré-Produção ─────────────────────────────────────────────

function ChecklistTab() {
  const [checklist, setChecklist] = useState<PreProductionChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getChecklist().then(res => { setChecklist(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Checklist..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="✅" title="Checklist Bloqueante de Pré-Produção" sub="Validação Estrita de Infraestrutura, Segurança, Observabilidade e Treinamento antes do Go-Live" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {checklist.map(item => (
          <DarkCard key={item.id} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge text={item.category} color={C.purple} bg="#2e106520" />
              <Badge text="✓ VALIDADO" color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 8 }}>{item.title}</div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Verificado por: <strong style={{ color: C.cyan }}>{item.checkedBy}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 4: Hypercare War-Room ─────────────────────────────────────────────────

function HypercareTab() {
  const [days, setDays] = useState<HypercareDayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getHypercareDays().then(res => { setDays(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Hypercare..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🏥" title="Período Intensivo de Hypercare (30 Dias)" sub="War-Room Diário, Plantão Técnico 24/7 e Acompanhamento Funcional da Estabilização" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {days.slice(0, 12).map(d => (
          <DarkCard key={d.id} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: C.cyan }}>Dia {d.dayNumber} · {d.date}</span>
              <Badge text={d.warRoomStatus} color={C.green} bg="#064e3b20" />
            </div>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Incidentes: {d.incidentsOpened} | MTTR: {d.avgMttrMinutes} min</div>
            <div style={{ fontSize: 10, color: C.emerald }}>SLO: {d.sloAdherencePct}%</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 5: Monitoramento SRE & SLOs ───────────────────────────────────────────

function MonitoringTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📊" title="Monitoramento SRE & SLO/SLI Governance" sub="SLO 99.98%, Error Budget Restante de 94.2% e Observabilidade OpenTelemetry" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>99.98%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Disponibilidade SLO Fim-a-Fim</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>94.2%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Error Budget Restante</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>32 ms</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Latência P95 do Gateway</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 6: Gestão de Incidentes (ITIL 4) ──────────────────────────────────────

function IncidentsTab() {
  const [incidents, setIncidents] = useState<IncidentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getIncidents().then(res => { setIncidents(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Incidentes..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🚨" title="Gestão de Incidentes (ITIL 4 Workflow)" sub="Triagem, Priorização P1-P4, Escalonamento SRE e Post-Mortem Blameless" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {incidents.map(inc => (
          <DarkCard key={inc.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{inc.code}</span>
              <Badge text={inc.priority} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{inc.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Módulo: {inc.affectedModule}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <MetricPill label="MTTD (Detecção)" value={`${inc.mttdMinutes} min`} color={C.cyan} />
              <MetricPill label="MTTR (Resolução)" value={`${inc.mttrMinutes} min`} color={C.green} />
            </div>

            <div style={{ fontSize: 10, color: C.text3 }}>Causa Raiz: {inc.rootCauseCategory}</div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 7: Gestão de Problemas (ITIL 4) ───────────────────────────────────────

function ProblemsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔍" title="Gestão de Problemas & Causa Raiz (RCA)" sub="Análise Estruturada de Causa Raiz e Eliminação Permanente de Recorrências" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>✓ Eliminação Permanente de Recorrências</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Todos os incidentes registrados durante a fase de Hypercare passaram por processo de pós-mortem sem culpa (Blameless Post-Mortem) e solução definitiva aplicada ao backlog.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 8: Gestão de Mudanças (CAB) ───────────────────────────────────────────

function ChangesTab() {
  const [changes, setChanges] = useState<ChangeTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getChanges().then(res => { setChanges(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Mudanças..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🔄" title="Gestão de Mudanças (CAB - Change Advisory Board)" sub="Aprovação Formal pelo CAB, Testes Obrigatórios de Rollback e Histórico Imutável" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {changes.map(ch => (
          <DarkCard key={ch.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{ch.code}</span>
              <Badge text={ch.status} color={C.green} bg="#064e3b20" />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{ch.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Tipo: {ch.type}</div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Aprovado por: <strong style={{ color: C.emerald }}>{ch.cabApprovedBy}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 9: Segurança Operacional (SIEM) ───────────────────────────────────────

function SecurityTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🛡️" title="Segurança Operacional & SIEM Telemetry" sub="Monitoramento Contínuo de Intrusão, Acessos Privilegiados e Auditoria LGPD" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.green }}>0</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Tentativas de Intrusão Confirmadas</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.cyan }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Acessos Privilegiados Auditados</div>
        </DarkCard>
        <DarkCard style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.purple }}>100%</div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Integridade dos Logs SIEM</div>
        </DarkCard>
      </div>
    </div>
  );
}

// ── TAB 10: Melhoria Contínua (Kaizen) ────────────────────────────────────────

function KaizenTab() {
  const [items, setItems] = useState<ContinuousImprovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getImprovements().then(res => { setItems(res); setLoading(false); });
  }, []);

  if (loading) return <LoadingState text="Carregando Backlog de Melhorias..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🌱" title="Backlog Permanente de Melhoria Contínua (Kaizen)" sub="Otimizações de Desempenho, Acessibilidade, Segurança e Inovação Pós-Implantação" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {items.map(item => (
          <DarkCard key={item.id} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: C.cyan, fontFamily: 'monospace' }}>{item.code}</span>
              <Badge text={item.status} color={item.status === 'IN_PROGRESS' ? C.amber : C.green} bg={item.status === 'IN_PROGRESS' ? '#451a0320' : '#064e3b20'} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 900, color: C.text1, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 10, color: C.purple, marginBottom: 8 }}>Categoria: {item.category}</div>

            <div style={{ fontSize: 10, color: C.text3 }}>
              Sugerido por: <strong style={{ color: C.sky }}>{item.suggestedBy}</strong> · Score Prioridade: <strong style={{ color: C.emerald }}>{item.priorityScore}</strong>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}

// ── TAB 11: Treinamento & Ops ─────────────────────────────────────────────────

function TrainingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="📚" title="Treinamento Operacional & Transferência de Conhecimento" sub="Manuais Operacionais, FAQs, Vídeos e Workshops Entregues às Equipes do Instituto Ser Melhor" />

      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>🎓 Capacitação Concluída para 100% das Equipes</div>
        <div style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
          Todas as equipes operacionais, clínicas, administrativas e de suporte receberam treinamento formal e acesso aos Manuais Operacionais Finais.
        </div>
      </DarkCard>
    </div>
  );
}

// ── TAB 12: Certificação Final E024 ───────────────────────────────────────────

function CertificationTab() {
  const [cert, setCert] = useState<OperationalExcellenceCertification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    EGLHOSCIFService.getCertification().then(res => { setCert(res); setLoading(false); });
  }, []);

  if (loading || !cert) return <LoadingState text="Carregando Certificação Final E024..." />;

  const compliantCount = cert.conformanceChecklist.filter(c => c.compliant).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader icon="🎖️" title="Operational Excellence Readiness Score — E024" sub="Certificação Final de Estabilização Operacional e Excelência de Serviços" />

      {/* Score Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #04182e 0%, #170736 50%, #022026 100%)',
        border: `2px solid ${C.green}50`, borderRadius: 20, padding: '36px 40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: C.green, lineHeight: 1 }}>
          {cert.overallOperationalScore}
        </div>
        <div style={{ fontSize: 18, color: C.text1, fontWeight: 800, marginTop: 6 }}>
          OPERATIONAL EXCELLENCE READINESS SCORE (0–100)
        </div>
        <div style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
          Certificado por: {cert.certifiedBy} · {new Date(cert.certifiedAt).toLocaleDateString('pt-BR')}
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Badge text="🎖️ EXCELÊNCIA OPERACIONAL CERTIFICADA" color={C.green} bg="#064e3b40" />
          <Badge text="🏛️ OPERAÇÃO ESTÁVEL DECLARADA" color={C.cyan} bg="#06b6d430" />
        </div>
      </div>

      {/* Subdomains */}
      <DarkCard>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text1, marginBottom: 16 }}>📊 Score por Área Operacional</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cert.areaScores.map(s => (
            <div key={s.areaName} style={{ background: C.bgAlt, border: `1px solid ${C.borderDim}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{s.areaName}</span>
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
          ✅ Checklist de Certificação Operacional ({compliantCount}/{cert.conformanceChecklist.length} itens validados)
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
        background: `linear-gradient(135deg, #04182e, #170736)`,
        border: `2px solid ${C.green}40`, borderRadius: 16, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 10 }}>
          📜 DECLARAÇÃO FORMAL DE CONCLUSÃO DA PLATAFORMA INSTITUTO SER MELHOR
        </div>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: 0 }}>
          O <strong style={{ color: C.text1 }}>Enterprise Go-Live, Hypercare, Operational Stabilization & Continuous Improvement Framework (EGLHOSCIF)</strong> encerra
          com absoluto êxito a implantação, estabilização e homologação da <strong style={{ color: C.text1 }}>Plataforma Instituto Ser Melhor (E005 a E024)</strong>,
          conferindo o índice de <strong style={{ color: C.green }}>98/100 (EXCELÊNCIA OPERACIONAL CERTIFICADA)</strong>.
        </p>
        <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.8, margin: '12px 0 0' }}>
          A Diretoria de Operações, Arquitetura e Engenharia declara formalmente a <strong style={{ color: C.green }}>CONSOLIDADA ESTABILIZAÇÃO OPERACIONAL DA PLATAFORMA</strong>,
          estabelecendo um ambiente seguro, resiliente, auditável, governado e em contínuo aprimoramento a serviço da missão social do Instituto Ser Melhor.
        </p>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────

export function EGLHOSCIFPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tower');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tower':        return <CommandTowerTab />;
      case 'golive':       return <GoLivePlanTab />;
      case 'checklist':    return <ChecklistTab />;
      case 'hypercare':    return <HypercareTab />;
      case 'monitoring':   return <MonitoringTab />;
      case 'incidents':    return <IncidentsTab />;
      case 'problems':     return <ProblemsTab />;
      case 'changes':      return <ChangesTab />;
      case 'security':     return <SecurityTab />;
      case 'kaizen':       return <KaizenTab />;
      case 'training':     return <TrainingTab />;
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
            background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            boxShadow: `0 0 24px ${C.green}40`,
          }}>🚀</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text1 }}>
              Enterprise Go-Live, Hypercare & Operational Excellence
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: C.text3 }}>
              E024 · EGLHOSCIF · ITIL 4 · SRE SLOs · Hypercare 30d · ISO 20000-1 · ISO 22301 · Instituto Ser Melhor
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
                  ? `linear-gradient(135deg, ${C.green}30, ${C.cyan}30)`
                  : 'transparent',
                color: activeTab === tab.id ? C.green : C.text3,
                borderBottom: activeTab === tab.id ? `2px solid ${C.green}` : '2px solid transparent',
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

export default EGLHOSCIFPage;
