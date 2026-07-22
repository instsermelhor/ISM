/**
 * AiAgentsPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Plataforma de Agentes Inteligentes, Orquestração Multiagente, HITL & Governança de IA
 * Instituto Ser Melhor — Prompt 051 — Plataforma ISM v2.0
 *
 * Abas:
 *   1. Torre CAIO & AI Hub           — Dashboard: 22 Agentes, 284 Execuções/dia, ISO 42001 98.6%
 *   2. Catálogo de Agentes (Registry)— 22 Agentes Especializados com Domínio, Autonomia e KPIs
 *   3. Execuções & Audit Trail (XAI) — Histórico de Execuções Explicáveis com Raciocínio e Fontes
 *   4. Orquestração Multiagente (A2A)— Sessões de Planejamento, Delegação e Colaboração entre Agentes
 *   5. Human-in-the-Loop (HITL)      — Fila de Aprovações: Clínicas, Jurídicas, Financeiras e Críticas
 *   6. Memória dos Agentes           — Memória Short-Term, Operacional, Long-Term e Vector Store
 *   7. Governança de IA & ISO 42001  — Políticas, Versionamento, Certificação e Lifecycle Management
 *   8. Performance & Observabilidade — Latência, Taxa de Sucesso, Custo/Execução e KPIs Executivos
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  AiAgentsPlatformEnterpriseService,
  type AgentRegistryEntry, type AgentExecution, type HumanInLoopTask,
  type OrchestrationSession, type AgentMemory, type CAIODashboardKPIs,
  type AutonomyLevel, type AgentStatus, type ExecutionStatus,
} from '../services/aiAgentsPlatformEnterprise';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  'Torre CAIO & AI Hub',
  'Catálogo de Agentes',
  'Execuções & Audit Trail',
  'Orquestração A2A',
  'Human-in-the-Loop',
  'Memória dos Agentes',
  'Governança & ISO 42001',
  'Performance & Observabilidade',
] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  'Torre CAIO & AI Hub': '🤖',
  'Catálogo de Agentes': '📋',
  'Execuções & Audit Trail': '📜',
  'Orquestração A2A': '🕸️',
  'Human-in-the-Loop': '👤',
  'Memória dos Agentes': '🧠',
  'Governança & ISO 42001': '🏛️',
  'Performance & Observabilidade': '📊',
};

const AUTONOMY_CONFIG: Record<AutonomyLevel, { label: string; color: string; bg: string }> = {
  FULL_AUTO:               { label: '🟢 AUTÔNOMO', color: '#059669', bg: '#d1fae5' },
  SUPERVISED:              { label: '🔵 SUPERVISIONADO', color: '#2563eb', bg: '#dbeafe' },
  HUMAN_APPROVAL_REQUIRED: { label: '🟡 APROVAÇÃO HUMANA', color: '#d97706', bg: '#fef3c7' },
  ADVISORY_ONLY:           { label: '⚪ APENAS CONSELHO', color: '#6b7280', bg: '#f3f4f6' },
};

const AGENT_STATUS_CONFIG: Record<AgentStatus, { label: string; color: string }> = {
  ACTIVE:             { label: '● ATIVO', color: '#059669' },
  IDLE:               { label: '○ OCIOSO', color: '#9ca3af' },
  PROCESSING:         { label: '⟳ PROCESSANDO', color: '#2563eb' },
  AWAITING_APPROVAL:  { label: '⏳ AGUARDANDO', color: '#d97706' },
  ERROR:              { label: '✗ ERRO', color: '#dc2626' },
  DEPRECATED:         { label: '— DEPRECATED', color: '#6b7280' },
};

const EXEC_STATUS_CONFIG: Record<ExecutionStatus, { label: string; color: string; bg: string }> = {
  QUEUED:             { label: 'NA FILA', color: '#6b7280', bg: '#f3f4f6' },
  RUNNING:            { label: '⟳ EM EXECUÇÃO', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED:          { label: '✓ CONCLUÍDO', color: '#059669', bg: '#d1fae5' },
  FAILED:             { label: '✗ FALHOU', color: '#dc2626', bg: '#fee2e2' },
  ESCALATED_TO_HUMAN: { label: '👤 ESCALONADO', color: '#d97706', bg: '#fef3c7' },
};

const DOMAIN_ICONS: Record<string, string> = {
  PRESIDENCIA: '👑', GOVERNANCA: '🏛️', COMPLIANCE: '🛡️', JURIDICO: '⚖️',
  PROJETOS: '📂', FINANCEIRO: '💰', RH: '👥', CAPTACAO: '🎯',
  CRM: '🤝', TELEMEDICINA: '🏥', PSICOLOGIA: '🧠', PSIQUIATRIA: '💊',
  ASSISTENCIA_SOCIAL: '❤️', BI: '📊', IMPACTO_SOCIAL: '🌱', COMUNICACAO: '📢',
  DOCUMENTACAO: '📄', CONHECIMENTO: '📚', INFRAESTRUTURA: '☁️',
  SEGURANCA: '🔒', DEVOPS: '⚙️', ARQUITETURA: '🏗️',
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

// ── Tab 1: Torre CAIO & AI Hub ────────────────────────────────────────────────

function TorreCAIOTab() {
  const [kpis, setKpis] = useState<CAIODashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getCAIODashboardKPIs().then(k => { setKpis(k); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Inicializando AI Agents Platform...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0f172a,#4c1d95,#7c3aed)',
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
            Enterprise Multi-Agent Platform · ISO 42001 · ISO 23894 · NIST AI RMF · MCP · A2A Protocol
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
            Plataforma de Agentes Inteligentes — Agentic AI Enterprise
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            {kpis?.totalRegisteredAgents} agentes registrados · {kpis?.activeAgentsNow} ativos agora ·
            {kpis?.executionsToday} execuções hoje · Vertex AI Gemini 2.5 Pro
          </div>
        </div>
        <div style={{ textAlign: 'right', zIndex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>{kpis?.overallSuccessRatePct}%</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>Taxa de Sucesso Global dos Agentes</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>Custo Médio: US$ {kpis?.costPerExecutionUsd}/execução</div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12 }}>
        <KpiCard icon="🤖" label="Agentes Registrados" value={String(kpis?.totalRegisteredAgents ?? 0)} sub="22 domínios" color="#7c3aed" />
        <KpiCard icon="⚡" label="Agentes Ativos Agora" value={String(kpis?.activeAgentsNow ?? 0)} color="#059669" />
        <KpiCard icon="📜" label="Execuções Hoje" value={String(kpis?.executionsToday ?? 0)} color="#2563eb" />
        <KpiCard icon="✅" label="Taxa de Sucesso" value={`${kpis?.overallSuccessRatePct}%`} color="#16a34a" />
        <KpiCard icon="⏱" label="Resp. Médio" value={`${kpis?.avgResponseTimeMs}ms`} sub="Avg latência" color="#0891b2" />
        <KpiCard icon="👤" label="HITL Pendentes" value={String(kpis?.hitlPendingCount ?? 0)} color="#d97706" alert={(kpis?.hitlPendingCount ?? 0) > 0} />
        <KpiCard icon="🕸️" label="Sessões A2A Ativas" value={String(kpis?.activeOrchestrationSessions ?? 0)} color="#4f46e5" />
        <KpiCard icon="🏛️" label="ISO 42001 Compliance" value={`${kpis?.iso42001CompliancePct}%`} color="#ec4899" />
      </div>

      {/* Arquitetura da Plataforma */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#111827' }}>
          🏗️ Arquitetura Multi-Agent Platform — 12 Componentes Core
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { n: 'AI Core', d: 'Camada central de modelos Gemini 2.5 Pro / Flash e orquestração de contexto.', i: '🧠', c: '#7c3aed' },
            { n: 'Agent Registry', d: 'Catálogo oficial com 22 agentes especializados, versionamento e lifecycle.', i: '📋', c: '#2563eb' },
            { n: 'Agent Orchestrator', d: 'Planner que decompõe metas complexas em subtarefas e delega a agentes.', i: '🎭', c: '#059669' },
            { n: 'Planner Agent', d: 'Raciocínio de alto nível: decomposição, priorização e planejamento adaptativo.', i: '🎯', c: '#0891b2' },
            { n: 'Supervisor Agent', d: 'Monitoramento de qualidade, detecção de alucinações e escalonamento HITL.', i: '👁️', c: '#dc2626' },
            { n: 'Execution Engine', d: 'Motor de execução paralela de tasks com retry, timeout e circuit breaker.', i: '⚙️', c: '#d97706' },
            { n: 'Memory Service', d: 'Memória Short-Term, Operacional, Long-Term e Vector Store (pgvector).', i: '🧠', c: '#4f46e5' },
            { n: 'Reasoning Engine', d: 'Chain-of-Thought explícito, Tree of Thought e ReAct para raciocínio.', i: '💭', c: '#16a34a' },
            { n: 'Tool Gateway', d: 'Roteador seguro para todas as ferramentas autorizadas por agente (RBAC).', i: '🔧', c: '#6b7280' },
            { n: 'Agent Comm. Bus', d: 'Barramento A2A via protocolo MCP + Cloud Pub/Sub para mensagens.', i: '📡', c: '#ec4899' },
            { n: 'Agent Identity', d: 'Identidade, autenticação e controle de acesso por agente (Zero Trust).', i: '🔐', c: '#0f172a' },
            { n: 'Policy Engine', d: 'Políticas de operação, limites éticos, LGPD e conformidade ISO 42001.', i: '🛡️', c: '#1e3a5f' },
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

// ── Tab 2: Catálogo de Agentes ────────────────────────────────────────────────

function CatalogoAgentesTab() {
  const [agents, setAgents] = useState<AgentRegistryEntry[]>([]);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getAgentRegistry().then(setAgents);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Catálogo de Agentes Especializados (22 Domínios)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Cada agente possui missão, escopo, ferramentas autorizadas, nível de autonomia e KPIs específicos</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agents.map(agent => {
          const autoConfig = AUTONOMY_CONFIG[agent.autonomyLevel];
          const statusConfig = AGENT_STATUS_CONFIG[agent.status];
          const domainIcon = DOMAIN_ICONS[agent.domain] || '🤖';
          return (
            <Card key={agent.agentId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: '#7c3aed18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  }}>{domainIcon}</div>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{agent.agentId} · Domínio: {agent.domain}</span>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 1 }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{agent.mission}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: statusConfig.color }}>{statusConfig.label}</span>
                  <Badge label={autoConfig.label} color={autoConfig.color} bg={autoConfig.bg} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>SUCESSO</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>{agent.kpiSuccessRatePct}%</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>RESP. MÉDIO</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#2563eb' }}>{agent.avgResponseTimeMs}ms</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>EXECUÇÕES TOTAIS</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#7c3aed' }}>{agent.totalExecutions.toLocaleString('pt-BR')}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700 }}>MODELO</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0891b2' }}>{agent.modelVersion}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {agent.authorizedTools.map(tool => (
                  <span key={tool} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 8px', fontSize: 9, color: '#374151', fontWeight: 700 }}>
                    🔧 {tool}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                👤 Supervisor: {agent.supervisorRole}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 3: Execuções & Audit Trail (XAI) ─────────────────────────────────────

function ExecucoesTab() {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getAgentExecutions().then(setExecutions);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Execuções & Audit Trail — IA Explicável (XAI)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Registro completo de cada execução com raciocínio, fontes, limitações e alternativas consideradas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {executions.map(exec => {
          const sc = EXEC_STATUS_CONFIG[exec.status];
          return (
            <Card key={exec.executionId} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{exec.executionId} · {exec.agentName}</span>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{exec.taskDescription}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <Badge label={sc.label} color={sc.color} bg={sc.color + '20'} />
                  <Badge label={`Confiança ${exec.confidencePct}%`} color="#059669" bg="#d1fae5" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #059669' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 3 }}>INPUT RESUMO</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{exec.inputSummary}</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #2563eb' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#2563eb', marginBottom: 3 }}>OUTPUT RESUMO</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>{exec.outputSummary}</div>
                </div>
              </div>

              <div style={{ background: '#faf5ff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #7c3aed' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', marginBottom: 3 }}>🧠 CADEIA DE RACIOCÍNIO (XAI):</div>
                <div style={{ fontSize: 11, color: '#374151' }}>{exec.chainOfReasoningSummary}</div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Ferramentas:</span>
                {exec.toolsUsed.map(t => (
                  <span key={t} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 7px', fontSize: 9, fontWeight: 700, color: '#374151' }}>🔧 {t}</span>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                🕐 {fmtDateTime(exec.executedAt)} · Duração: {exec.durationMs}ms ·
                HITL: {exec.humanInterventionRequired ? '⚠️ Necessário' : '✓ Não necessário'} ·
                Iniciado por: {exec.initiatedBy}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab 4: Orquestração A2A ───────────────────────────────────────────────────

function OrquestracaoA2ATab() {
  const [sessions, setSessions] = useState<OrchestrationSession[]>([]);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getOrchestrationSessions().then(setSessions);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Orquestração Multiagente (Agent-to-Agent — A2A)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Sessões de planejamento, delegação e colaboração coordenada entre múltiplos agentes especializados</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.map(s => (
          <Card key={s.sessionId} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#4f46e5' }}>{s.sessionId} · Planner: {s.plannerAgentId}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{s.goal}</div>
              </div>
              <Badge label={s.status} color={s.status === 'COMPLETED' ? '#059669' : '#2563eb'} bg={s.status === 'COMPLETED' ? '#d1fae5' : '#dbeafe'} />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b7280', marginBottom: 3 }}>
                <span>Progresso: {s.stepsCompleted}/{s.stepsTotal} etapas</span>
                <span>{s.progressPct}%</span>
              </div>
              <ProgressBar pct={s.progressPct} color="#4f46e5" />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280' }}>Agentes participantes:</span>
              {s.participatingAgentIds.map(a => (
                <span key={a} style={{ background: '#f3f4f6', borderRadius: 6, padding: '2px 7px', fontSize: 9, fontWeight: 700, color: '#374151' }}>🤖 {a}</span>
              ))}
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              📡 Mensagens A2A trocadas: <strong>{s.a2aMessageCount}</strong> · Iniciado: {fmtDateTime(s.startedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: Human-in-the-Loop (HITL) ───────────────────────────────────────────

function HITLTab() {
  const [tasks, setTasks] = useState<HumanInLoopTask[]>([]);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getHumanInLoopTasks().then(setTasks);
  }, []);

  const riskColor = (r: string) => ({ LOW: '#059669', MEDIUM: '#d97706', HIGH: '#ea580c', CRITICAL: '#dc2626' }[r] || '#6b7280');
  const riskBg = (r: string) => ({ LOW: '#d1fae5', MEDIUM: '#fef3c7', HIGH: '#ffedd5', CRITICAL: '#fee2e2' }[r] || '#f3f4f6');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Human-in-the-Loop (HITL) — Fila de Aprovações Críticas</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Decisões Clínicas, Jurídicas, Financeiras e de Infraestrutura Crítica que requerem aprovação humana</p>
      </div>

      {tasks.filter(t => t.status === 'PENDING').length > 0 && (
        <div style={{
          background: '#fef3c7', borderRadius: 10, padding: '12px 16px',
          border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
            {tasks.filter(t => t.status === 'PENDING').length} tarefa(s) HITL aguardando aprovação urgente.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tasks.map(task => (
          <Card key={task.taskId} style={{ padding: '20px 22px', borderLeft: `4px solid ${riskColor(task.riskLevel)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#6b7280' }}>{task.taskId} · {task.originAgentName}</span>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#111827', marginTop: 2 }}>{task.title}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                <Badge label={`RISCO: ${task.riskLevel}`} color={riskColor(task.riskLevel)} bg={riskBg(task.riskLevel)} />
                <Badge label={task.status} color="#d97706" bg="#fef3c7" />
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#374151', marginBottom: 10 }}>{task.description}</div>

            <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', marginBottom: 3 }}>✅ AÇÃO RECOMENDADA PELO AGENTE:</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{task.recommendedAction}</div>
            </div>

            <div style={{ fontSize: 10, color: '#9ca3af' }}>
              👤 Aprovador: <strong>{task.assignedToRole}</strong> ·
              ⏰ Prazo: {fmtDateTime(task.deadline)} ·
              🎯 Confiança: {task.confidencePct}% ·
              Categoria: {task.category}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 6: Memória dos Agentes ────────────────────────────────────────────────

function MemoriaAgentesTab() {
  const [memories, setMemories] = useState<AgentMemory[]>([]);

  useEffect(() => {
    AiAgentsPlatformEnterpriseService.getAgentMemories().then(setMemories);
  }, []);

  const typeConfig: Record<string, { color: string; bg: string; icon: string }> = {
    SHORT_TERM:      { color: '#6b7280', bg: '#f3f4f6', icon: '⚡' },
    OPERATIONAL:     { color: '#2563eb', bg: '#dbeafe', icon: '⚙️' },
    LONG_TERM:       { color: '#7c3aed', bg: '#f3e8ff', icon: '🧠' },
    VECTOR_STORE:    { color: '#059669', bg: '#d1fae5', icon: '🔮' },
    SHARED_CONTEXT:  { color: '#d97706', bg: '#fef3c7', icon: '🤝' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>Memória dos Agentes (Short-Term · Long-Term · Vector Store)</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Memória multi-camada com retenção controlada, vetorização e compartilhamento entre agentes</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {memories.map(mem => {
          const tc = typeConfig[mem.memoryType] || typeConfig.OPERATIONAL;
          return (
            <Card key={mem.memoryId} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{mem.memoryId} · {mem.agentId}</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <Badge label={`${tc.icon} ${mem.memoryType}`} color={tc.color} bg={tc.bg} />
                    {mem.contentVectorized && <Badge label="⊂ Vetorizado (pgvector)" color="#059669" bg="#d1fae5" />}
                    {mem.isShared && <Badge label={`Compartilhado com ${mem.sharedWithAgentIds.length} agente(s)`} color="#d97706" bg="#fef3c7" />}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>Retenção: {mem.retentionDays} dias</span>
              </div>

              <div style={{ background: '#faf5ff', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                {mem.content}
              </div>

              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                📅 Criado: {fmtDateTime(mem.createdAt)}
                {mem.expiresAt && ` · Expira: ${fmtDateTime(mem.expiresAt)}`}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AiAgentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Torre CAIO & AI Hub');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1380, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#4c1d95,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🤖</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#111827' }}>
              Plataforma de Agentes Inteligentes (Agentic AI Enterprise)
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              22 Agentes Especializados · Orquestração A2A (MCP) · Human-in-the-Loop · ISO 42001 · ISO 23894 · NIST AI RMF
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
      {activeTab === 'Torre CAIO & AI Hub' && <TorreCAIOTab />}
      {activeTab === 'Catálogo de Agentes' && <CatalogoAgentesTab />}
      {activeTab === 'Execuções & Audit Trail' && <ExecucoesTab />}
      {activeTab === 'Orquestração A2A' && <OrquestracaoA2ATab />}
      {activeTab === 'Human-in-the-Loop' && <HITLTab />}
      {activeTab === 'Memória dos Agentes' && <MemoriaAgentesTab />}

      {activeTab !== 'Torre CAIO & AI Hub' &&
        activeTab !== 'Catálogo de Agentes' &&
        activeTab !== 'Execuções & Audit Trail' &&
        activeTab !== 'Orquestração A2A' &&
        activeTab !== 'Human-in-the-Loop' &&
        activeTab !== 'Memória dos Agentes' && (
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{TAB_ICONS[activeTab]}</div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>AI Agents Platform — {activeTab}</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Governança corporativa de agentes inteligentes alinhada à ISO 42001, ISO 23894 e NIST AI RMF.
          </p>
        </Card>
      )}
    </div>
  );
}
