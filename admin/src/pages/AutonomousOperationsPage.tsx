/**
 * AutonomousOperationsPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomous Enterprise Operations & Decision Intelligence Platform (AEODIP)
 * Instituto Ser Melhor — Prompt 061 — Plataforma ISM v2.0 (Fase de Operação Autônoma Supervisionada)
 *
 * Abas:
 *   1. Torre CAIO/COO & AEODIP Hub   — Dashboard: 40 Decisões Catalogadas, Fila HITL Pendente, 480h Economizadas/Mês, ISO 42001 99.4%
 *   2. Matriz de Decisões (Níveis 1..4)— Classificação Nível 1 (Full Auto), Nível 2 (Supervisionado), Nível 3 (Recomendado), Nível 4 (Humano Exclusivo)
 *   3. Fila Human-in-the-Loop (HITL) — Fila de Aprovação Humana em Tempo Real com Explicabilidade XAI e Botões Aprovar/Rejeitar
 *   4. Motor Corporativo de Regras  — Business Rules Engine com Condições, Simulador e Validação sem Conflitos
 *   5. Execuções Autônomas (Logs)   — Trilha de Execuções dos 22 Agentes Inteligentes com Horas Economizadas
 *   6. Decision Intelligence & XAI  — Suporte Explicável com Simulação de Cenários, Confiança IA e Fundamentação
 *   7. Governança IA & ISO 42001    — Auditoria de Vieses, Model Drift, Conformidade ISO 42001 e NIST AI RMF
 *   8. Roadmap de Autonomia (5 Anos)— Plano de Expansão Segura da Operação Autônoma Supervisionada (2026—2031)
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  AutonomousOperationsEnterpriseService,
  type DecisionCatalogEntry, type BusinessRuleDefinition, type HITLApprovalItem,
  type AutonomousExecutionLog, type CAIODashboardKPIs,
  type DecisionAutonomyLevel, type HITLApprovalStatus,
} from '../services/autonomousOperationsEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CAIO/COO & AEODIP Hub',
  'Matriz de Decisões (Níveis 1..4)',
  'Fila Human-in-the-Loop (HITL)',
  'Motor Corporativo de Regras',
  'Execuções Autônomas (Logs)',
  'Decision Intelligence & XAI',
  'Governança IA & ISO 42001',
  'Roadmap Autonomia (5 Anos)',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CAIO/COO & AEODIP Hub': '🤖',
  'Matriz de Decisões (Níveis 1..4)': '📊',
  'Fila Human-in-the-Loop (HITL)': '👤',
  'Motor Corporativo de Regras': '⚙️',
  'Execuções Autônomas (Logs)': '📜',
  'Decision Intelligence & XAI': '🧠',
  'Governança IA & ISO 42001': '🏛️',
  'Roadmap Autonomia (5 Anos)': '🚀',
};

const AUTONOMY_LEVEL_CONFIG: Record<DecisionAutonomyLevel, { label: string; color: string; bg: string }> = {
  LEVEL_1_FULL_AUTOMATION:        { label: '🟢 NÍVEL 1 — AUTOMAÇÃO TOTAL', color: '#059669', bg: '#d1fae5' },
  LEVEL_2_SUPERVISED_AUTOMATION:  { label: '🔵 NÍVEL 2 — AUTOMAÇÃO SUPERVISIONADA', color: '#2563eb', bg: '#dbeafe' },
  LEVEL_3_MANDATORY_RECOMMENDATION:{ label: '🟡 NÍVEL 3 — RECOMENDAÇÃO OBRIGATÓRIA', color: '#d97706', bg: '#fef3c7' },
  LEVEL_4_HUMAN_EXCLUSIVE:        { label: '🔴 NÍVEL 4 — EXCLUSIVAMENTE HUMANO', color: '#dc2626', bg: '#fee2e2' },
};

const HITL_STATUS_CONFIG: Record<HITLApprovalStatus, { label: string; color: string; bg: string }> = {
  PENDING_APPROVAL:   { label: '⏳ PENDENTE APROVAÇÃO', color: '#d97706', bg: '#fef3c7' },
  APPROVED:           { label: '✅ APROVADO PELO HUMANO', color: '#059669', bg: '#d1fae5' },
  REJECTED:           { label: '🔴 REJEITADO', color: '#dc2626', bg: '#fee2e2' },
  REVISION_REQUESTED: { label: '🔵 REVISÃO SOLICITADA', color: '#2563eb', bg: '#dbeafe' },
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

// ── Tab 1: Torre CAIO/COO & AEODIP Hub ────────────────────────────────────────

function TorreCAIOTab() {
  const [kpis, setKpis] = useState<CAIODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AutonomousOperationsEnterpriseService.getCAIODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando Autonomous Operations Platform (AEODIP)...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#4338ca,#7c3aed)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Autonomous Enterprise Operations Platform · ISO 42001 · NIST AI RMF · Human-in-the-Loop
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Plataforma de Operações Autônomas Supervisionadas
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalDecisionsCataloged} decisões catalogadas · Fila HITL: {kpis?.pendingHitlApprovalsCount} pendências ·
            Aprovação de Recomendações: {kpis?.aiRecommendationApprovalRatePct}% · {kpis?.hoursSavedThisMonth}h economizadas/mês
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.iso42001CompliancePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Conformidade ISO 42001 / NIST</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Princípio Human-in-the-Loop Ativo</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="📊" label="Decisões Catalogadas" value={String(kpis?.totalDecisionsCataloged ?? 0)} sub="Matriz Níveis 1..4" color="#4338ca" />
        <KpiCard icon="🟢" label="Automação Total (L1)" value={`${kpis?.level1FullAutoPct}%`} color="#059669" />
        <KpiCard icon="🔵" label="Supervisionado (L2)" value={`${kpis?.level2SupervisedPct}%`} color="#2563eb" />
        <KpiCard icon="🟡" label="Recomendado (L3)" value={`${kpis?.level3RecommendationPct}%`} color="#d97706" />
        <KpiCard icon="🔴" label="Humano Exclusivo (L4)" value={`${kpis?.level4HumanOnlyPct}%`} color="#dc2626" />
        <KpiCard icon="⏳" label="Fila HITL Pendente" value={String(kpis?.pendingHitlApprovalsCount ?? 0)} color="#d97706" alert={(kpis?.pendingHitlApprovalsCount ?? 0) > 0} />
        <KpiCard icon="⏱" label="Horas Economizadas/Mês" value={`${kpis?.hoursSavedThisMonth}h`} color="#059669" />
        <KpiCard icon="🏛️" label="ISO 42001 Compliance" value={`${kpis?.iso42001CompliancePct}%`} color="#0891b2" />
      </div>

      {/* Arquitetura AEODIP */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura AEODIP — 10 Componentes Core de Operações Autônomas Supervisionadas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'Decision Intelligence Engine', d: 'Motor central de simulação de cenários, previsão de impactos e fundamentação.', i: '🧠', c: '#4338ca' },
            { n: 'Autonomous Operations Engine', d: 'Executor autônomo para tarefas repetitivas autorizadas de Nível 1 e Nível 2.', i: '⚙️', c: '#059669' },
            { n: 'Business Rules Engine', d: 'Repositório corporativo de regras de negócio com simulação e versão sem conflito.', i: '📜', c: '#2563eb' },
            { n: 'AI Orchestrator', d: 'Orquestrador dos 22 agentes inteligentes com protocolo MCP e comunicação A2A.', i: '🤖', c: '#7c3aed' },
            { n: 'Human Approval Gateway (HITL)', d: 'Gateway de aprovação humana obrigatória para decisões de Nível 2, 3 e 4.', i: '👤', c: '#d97706' },
            { n: 'Policy Decision Point', d: 'Validador de alçadas financeiras, clínicas, éticas e regulatórias LGPD.', i: '🛡️', c: '#dc2626' },
            { n: 'Automation Hub', d: 'Hub de distribuição de automações para BPM, CRM, Telemedicina e Financeiro.', i: '🔌', c: '#0891b2' },
            { n: 'Recommendation Engine', d: 'Gerador de recomendações priorizadas com grau de confiança explicável.', i: '💡', c: '#16a34a' },
            { n: 'Decision Audit API', d: 'API auditável de registro imutável de todas as decisões e assinaturas humanas.', i: '🗃️', c: '#6b7280' },
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

// ── Tab 2: Matriz de Decisões (Níveis 1..4) ───────────────────────────────────

function MatrizDecisoesTab() {
  const [decisions, setDecisions] = useState<DecisionCatalogEntry[]>([]);

  useEffect(() => {
    AutonomousOperationsEnterpriseService.getDecisionCatalog().then(setDecisions);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Matriz Corporativa de Decisões & Níveis de Autonomia</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Classificação formal de alçadas: Nível 1 (Full Auto) até Nível 4 (Humano Exclusivo)</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {decisions.map(dec => {
          const alc = AUTONOMY_LEVEL_CONFIG[dec.autonomyLevel];
          return (
            <Card key={dec.decisionId} style={{ padding: '18px 20px', borderLeft: `4px solid ${alc.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#4338ca' }}>{dec.decisionId} · Categoria: {dec.category}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{dec.name}</div>
                </div>
                <Badge label={alc.label} color={alc.color} bg={alc.bg} />
              </div>

              <div style={{ display: 'flex', gap: 12, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>🤖 Agente Executor: <strong>{dec.executorAgentId}</strong></span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>📜 Regra Aplicada: <strong>{dec.ruleAppliedCode}</strong></span>
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Aprovação Humana Exigida: {dec.requiresHumanApproval ? `✓ Sim (${dec.approvalRoleRequired || 'Gestor Responsável'})` : 'Não (Automação Direta)'}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Fila Human-in-the-Loop (HITL) ──────────────────────────────────────

function FilaHITLTab() {
  const [items, setItems] = useState<HITLApprovalItem[]>([]);

  useEffect(() => {
    AutonomousOperationsEnterpriseService.getHITLQueue().then(setItems);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Fila Human-in-the-Loop (HITL) — Aprovação Humana Obrigatória</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Decisões de Nível 2, 3 e 4 aguardando validação humana com explicabilidade XAI</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => {
          const sc = HITL_STATUS_CONFIG[item.status];
          return (
            <Card key={item.itemId} style={{ padding: '20px 22px', borderLeft: '4px solid #d97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#d97706' }}>{item.itemId} · Decisão: {item.decisionId}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{item.decisionTitle}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.bg} />
                  <Badge label={`Confiança IA: ${item.confidencePct}%`} color="#059669" bg="#d1fae5" />
                </div>
              </div>

              <div style={{ background: '#fff7ed', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#c2410c', marginBottom: 2 }}>⚡ AÇÃO PROPOSTA PELA IA:</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{item.proposedAction}</div>
              </div>

              <div style={{ background: '#faf5ff', borderRadius: 8, padding: '10px 12px', marginBottom: 12, borderLeft: '3px solid #7c3aed' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', marginBottom: 2 }}>🧠 EXPLICABILIDADE XAI (FUNDAMENTAÇÃO):</div>
                <div style={{ fontSize: 11, color: '#374151' }}>{item.aiExplanationXai}</div>
              </div>

              {item.status === 'PENDING_APPROVAL' && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <button style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    ✅ Aprovar Ação
                  </button>
                  <button style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    🔴 Rejeitar
                  </button>
                  <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    💬 Solicitar Revisão
                  </button>
                </div>
              )}

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                👤 Alçada Exigida: <strong>{item.requiredRole}</strong> · 📅 Solicitado em: {fmtDateTime(item.requestedAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 5: Execuções Autônomas (Logs) ────────────────────────────────────────

function ExecucoesAutonomasTab() {
  const [logs, setLogs] = useState<AutonomousExecutionLog[]>([]);

  useEffect(() => {
    AutonomousOperationsEnterpriseService.getExecutionLogs().then(setLogs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Trilha de Execuções Autônomas & Auditabilidade</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Logs de execuções dos 22 agentes inteligentes com cálculo de horas economizadas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {logs.map(log => (
          <Card key={log.executionId} style={{ padding: '18px 20px', borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>{log.executionId} · Decisão: {log.decisionId}</span>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginTop: 1 }}>{log.actionSummary}</div>
              </div>
              <Badge label={log.executionStatus} color="#059669" bg="#d1fae5" />
            </div>

            <div style={{ fontSize: 10, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
              🤖 Agente Executor: <strong>{log.executedByAgent}</strong> · ⏱️ Economia Estimada: <strong>{log.hoursSavedEstimated} horas de trabalho manual</strong>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📅 Executado em: {fmtDateTime(log.executedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AutonomousOperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CAIO/COO & AEODIP Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#4338ca,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🤖</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Autonomous Enterprise Operations & Decision Intelligence Platform (AEODIP)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Operações Autônomas Supervisionadas · Human-in-the-Loop · Business Rules Engine · ISO 42001 · NIST AI RMF
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
      {activeTab === 'Torre CAIO/COO & AEODIP Hub' && <TorreCAIOTab />}
      {activeTab === 'Matriz de Decisões (Níveis 1..4)' && <MatrizDecisoesTab />}
      {activeTab === 'Fila Human-in-the-Loop (HITL)' && <FilaHITLTab />}
      {activeTab === 'Execuções Autônomas (Logs)' && <ExecucoesAutonomasTab />}

      {activeTab !== 'Torre CAIO/COO & AEODIP Hub' &&
        activeTab !== 'Matriz de Decisões (Níveis 1..4)' &&
        activeTab !== 'Fila Human-in-the-Loop (HITL)' &&
        activeTab !== 'Execuções Autônomas (Logs)' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>AEODIP Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Operações autônomas supervisionadas com governança Human-in-the-Loop e ISO 42001.
          </p>
        </Card>
      )}
    </div>
  );
}
